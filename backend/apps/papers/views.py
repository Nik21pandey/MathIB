"""
API Views for Papers and Categories
"""

import io
from django.conf import settings
from django.db.models import Q
from django.http import FileResponse, Http404
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Paper, Bundle
from .pdf_utils import read_file_field_bytes, apply_watermark, merge_pdf_bytes_list
from .serializers import (
    CategorySerializer,
    CategoryListSerializer,
    CategoryTreeSerializer,
    CategoryCreateUpdateSerializer,
    PaperListSerializer,
    PaperDetailSerializer,
    BundleListSerializer,
    BundleDetailSerializer,
)
from .services import CategoryService


def _resolve_user(request):
    """Return authenticated user via standard header/session OR ?token=<jwt> query param for iframes."""
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        return user
    raw_token = request.query_params.get('token')
    if raw_token:
        try:
            from rest_framework_simplejwt.authentication import JWTAuthentication
            jwt_auth = JWTAuthentication()
            validated = jwt_auth.get_validated_token(raw_token)
            return jwt_auth.get_user(validated)
        except Exception:
            return None
    return None


def _user_has_paper_access(user, paper) -> bool:
    if not (paper.is_premium or not paper.is_free):
        return True
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or getattr(user, 'is_premium_active', False):
        return True
    from apps.payments.models import UserPurchase
    if UserPurchase.objects.filter(user=user, paper=paper, is_active=True).exists():
        return True
    # Also allow access if user purchased any bundle containing this paper
    return UserPurchase.objects.filter(user=user, bundle__papers=paper, is_active=True).exists()


def _user_has_bundle_access(user, bundle) -> bool:
    if not bundle.is_paid:
        return True
    if not user or not user.is_authenticated:
        return False
    if user.is_staff or getattr(user, 'is_premium_active', False):
        return True
    from apps.payments.models import UserPurchase
    return UserPurchase.objects.filter(user=user, bundle=bundle, is_active=True).exists()


def _build_pdf_response(pdf_bytes: bytes, filename: str, request, is_paid_content: bool, user):
    if is_paid_content and getattr(settings, 'ENABLE_PDF_WATERMARK', True):
        if user and user.is_authenticated and not user.is_staff:
            email = getattr(user, 'email', '') or getattr(user, 'username', '')
            if email:
                try:
                    pdf_bytes = apply_watermark(pdf_bytes, f"MathIB  |  Licensed to {email}")
                except Exception:
                    pass

    disposition = 'attachment' if request.query_params.get('download') in ('1', 'true', 'yes') else 'inline'
    response = FileResponse(io.BytesIO(pdf_bytes), content_type='application/pdf')
    response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
    return response


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = CategoryService.get_all_categories()
        serializer = CategoryListSerializer(categories, many=True)
        return Response({'success': True, 'data': serializer.data, 'count': categories.count()})

    def post(self, request):
        if not (request.user and request.user.is_staff):
            return Response({'success': False, 'message': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategoryCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            category = CategoryService.create_category(serializer.validated_data)
            return Response({
                'success': True,
                'message': 'Category created successfully',
                'data': CategorySerializer(category).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        category = CategoryService.get_category_by_id(category_id)
        if not category:
            return Response({'success': False, 'message': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'data': CategorySerializer(category).data})

    def put(self, request, category_id):
        if not (request.user and request.user.is_staff):
            return Response({'success': False, 'message': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        category = CategoryService.get_category_by_id(category_id)
        if not category:
            return Response({'success': False, 'message': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategoryCreateUpdateSerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            updated = CategoryService.update_category(category, serializer.validated_data)
            return Response({
                'success': True,
                'message': 'Category updated successfully',
                'data': CategorySerializer(updated).data
            })
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, category_id):
        if not (request.user and request.user.is_staff):
            return Response({'success': False, 'message': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        category = CategoryService.get_category_by_id(category_id)
        if not category:
            return Response({'success': False, 'message': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        CategoryService.delete_category(category)
        return Response({'success': True, 'message': 'Category deleted successfully'})


class CategoryTreeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = CategoryService.get_category_tree()
        return Response({'success': True, 'data': CategoryTreeSerializer(categories, many=True).data})


class CategorySubcategoriesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        parent = CategoryService.get_category_by_id(category_id)
        if not parent:
            return Response({'success': False, 'message': 'Parent category not found'}, status=status.HTTP_404_NOT_FOUND)
        subcategories = CategoryService.get_subcategories(category_id)
        return Response({
            'success': True,
            'data': CategoryListSerializer(subcategories, many=True).data,
            'count': subcategories.count()
        })


class CategorySearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response({'success': False, 'message': 'Search query must be at least 2 characters'}, status=status.HTTP_400_BAD_REQUEST)
        categories = CategoryService.search_categories(query)
        return Response({
            'success': True,
            'data': CategoryListSerializer(categories, many=True).data,
            'count': categories.count()
        })


class PaperListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        papers = Paper.objects.filter(is_active=True).select_related('category').prefetch_related('filters')

        category_slug = request.query_params.get('category')
        if category_slug:
            papers = papers.filter(category__slug=category_slug)

        for filter_slug in request.query_params.getlist('filter'):
            papers = papers.filter(filters__slug=filter_slug)

        search = request.query_params.get('search')
        if search:
            papers = papers.filter(Q(title__icontains=search) | Q(description__icontains=search))

        if (request.query_params.get('featured') or '').lower() == 'true':
            papers = papers.filter(is_featured=True)

        if (request.query_params.get('free') or '').lower() == 'true':
            papers = papers.filter(is_free=True)

        ordering = request.query_params.get('ordering', '-created_at')
        papers = papers.order_by(ordering).distinct()

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        total_count = papers.count()
        serializer = PaperListSerializer(papers[start:end], many=True, context={'request': request})

        return Response({
            'success': True,
            'data': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })


class PaperDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, paper_id):
        try:
            paper = Paper.objects.select_related('category').prefetch_related('filters').get(id=paper_id, is_active=True)
        except Paper.DoesNotExist:
            return Response({'success': False, 'message': 'Paper not found'}, status=status.HTTP_404_NOT_FOUND)

        paper.views_count += 1
        paper.save(update_fields=['views_count'])
        serializer = PaperDetailSerializer(paper, context={'request': request})
        return Response({'success': True, 'data': serializer.data})


class PaperDownloadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, paper_id):
        try:
            paper = Paper.objects.get(id=paper_id, is_active=True)
        except Paper.DoesNotExist:
            return Response({'success': False, 'message': 'Paper not found'}, status=status.HTTP_404_NOT_FOUND)

        user = _resolve_user(request)
        if not _user_has_paper_access(user, paper):
            return Response({
                'success': False,
                'message': 'Purchase required to download this premium paper',
                'paper_id': paper.id,
                'price': str(getattr(paper, 'price', '0.00'))
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        paper.downloads_count += 1
        paper.save(update_fields=['downloads_count'])

        file_path = reverse('papers:paper-file', kwargs={'paper_id': paper.id})
        pdf_url = request.build_absolute_uri(f"{file_path}?download=1") if paper.pdf_file else None

        return Response({
            'success': True,
            'message': 'Download recorded',
            'data': {
                'pdf_url': pdf_url,
                'downloads_count': paper.downloads_count
            }
        })


class PaperSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response({'success': False, 'message': 'Search query must be at least 2 characters'}, status=status.HTTP_400_BAD_REQUEST)
        papers = Paper.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query),
            is_active=True
        ).select_related('category').prefetch_related('filters')
        serializer = PaperListSerializer(papers, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data, 'count': papers.count()})


@method_decorator(xframe_options_exempt, name='dispatch')
class PaperFileView(APIView):
    """
    GET: Serve the PDF (or matching markscheme) for a paper safely from local disk or S3.
    Supports ?type=markscheme, ?download=1, and ?token=<jwt>.
    """
    permission_classes = [AllowAny]
    serve_markscheme = False

    def get(self, request, paper_id):
        try:
            paper = Paper.objects.get(id=paper_id, is_active=True)
        except Paper.DoesNotExist:
            return Response({'success': False, 'message': 'Paper not found'}, status=status.HTTP_404_NOT_FOUND)

        wants_ms = self.serve_markscheme or request.query_params.get('type') == 'markscheme'
        target_field = paper.markscheme_file if wants_ms else paper.pdf_file

        if not target_field:
            msg = 'No markscheme PDF available for this paper' if wants_ms else 'No PDF file available for this paper'
            return Response({'success': False, 'message': msg}, status=status.HTTP_404_NOT_FOUND)

        user = _resolve_user(request)
        if not _user_has_paper_access(user, paper):
            return Response({
                'success': False,
                'message': 'Purchase required to access this premium paper',
                'paper_id': paper.id,
                'price': str(getattr(paper, 'price', '0.00'))
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        try:
            pdf_bytes = read_file_field_bytes(target_field)
            filename = getattr(target_field, 'name', 'paper.pdf').split('/')[-1]
            is_paid = paper.is_premium or not paper.is_free
            return _build_pdf_response(pdf_bytes, filename, request, is_paid, user)
        except Exception:
            raise Http404('File not found')


class BundleListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        bundles = Bundle.objects.filter(is_active=True).select_related('category').prefetch_related('filters', 'papers')

        category_id = request.query_params.get('category')
        if category_id:
            bundles = bundles.filter(category_id=category_id)

        is_paid = request.query_params.get('is_paid')
        if is_paid is not None:
            bundles = bundles.filter(is_paid=is_paid.lower() == 'true')

        is_featured = request.query_params.get('is_featured')
        if is_featured is not None:
            bundles = bundles.filter(is_featured=is_featured.lower() == 'true')

        serializer = BundleListSerializer(bundles, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data, 'count': bundles.count()})


class BundleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, bundle_id):
        try:
            bundle = Bundle.objects.select_related('category').prefetch_related(
                'papers', 'papers__category', 'papers__filters', 'filters'
            ).get(id=bundle_id, is_active=True)
        except Bundle.DoesNotExist:
            return Response({'success': False, 'message': 'Bundle not found'}, status=status.HTTP_404_NOT_FOUND)

        bundle.views_count += 1
        bundle.save(update_fields=['views_count'])
        serializer = BundleDetailSerializer(bundle, context={'request': request})
        return Response({'success': True, 'data': serializer.data})


class BundlePapersView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, bundle_id):
        try:
            bundle = Bundle.objects.get(id=bundle_id, is_active=True)
        except Bundle.DoesNotExist:
            return Response({'success': False, 'message': 'Bundle not found'}, status=status.HTTP_404_NOT_FOUND)

        papers = bundle.papers.filter(is_active=True).select_related('category').prefetch_related('filters')
        serializer = PaperListSerializer(papers, many=True, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data,
            'count': papers.count(),
            'bundle_name': bundle.name
        })


@method_decorator(xframe_options_exempt, name='dispatch')
class BundleFileView(APIView):
    """
    GET: Serve combined bundle PDF (or auto-merge attached papers on the fly via PyMuPDF).
    """
    permission_classes = [AllowAny]

    def get(self, request, bundle_id):
        try:
            bundle = Bundle.objects.prefetch_related('papers').get(id=bundle_id, is_active=True)
        except Bundle.DoesNotExist:
            return Response({'success': False, 'message': 'Bundle not found'}, status=status.HTTP_404_NOT_FOUND)

        user = _resolve_user(request)
        if not _user_has_bundle_access(user, bundle):
            return Response({
                'success': False,
                'message': 'Purchase required to access this bundle',
                'price': str(bundle.price),
                'bundle_id': bundle.id,
                'bundle_name': bundle.name
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        try:
            if bundle.bundle_pdf:
                pdf_bytes = read_file_field_bytes(bundle.bundle_pdf)
                filename = getattr(bundle.bundle_pdf, 'name', f'{bundle.slug}.pdf').split('/')[-1]
            else:
                paper_payloads = []
                for p in bundle.papers.filter(is_active=True):
                    if p.pdf_file:
                        paper_payloads.append(read_file_field_bytes(p.pdf_file))
                if not paper_payloads:
                    return Response({'success': False, 'message': 'This bundle has no PDF files attached'}, status=status.HTTP_404_NOT_FOUND)
                pdf_bytes = merge_pdf_bytes_list(paper_payloads)
                filename = f"{bundle.slug or 'bundle'}.pdf"

            bundle.downloads_count += 1
            bundle.save(update_fields=['downloads_count'])

            return _build_pdf_response(pdf_bytes, filename, request, bundle.is_paid, user)
        except Exception:
            raise Http404('File not found')