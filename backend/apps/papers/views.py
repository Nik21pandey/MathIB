"""
API Views for Papers and Categories
"""

import io
import logging
from django.conf import settings
from django.db.models import Q
from django.http import FileResponse, Http404, HttpResponse

logger = logging.getLogger(__name__)
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Paper, Bundle
from .pdf_utils import read_file_field_bytes, apply_watermark, merge_pdf_bytes_list, merge_pdf_fields_incremental
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

        for filter_val in request.query_params.getlist('filter'):
            if not filter_val:
                continue
            if filter_val.isdigit():
                papers = papers.filter(Q(filters__id=int(filter_val)) | Q(filters__slug=filter_val))
            else:
                papers = papers.filter(
                    Q(filters__slug=filter_val) |
                    Q(filters__code__iexact=filter_val) |
                    Q(filters__name__icontains=filter_val)
                )

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

        # For free papers stored in Google Cloud Storage, redirect directly to GCS CDN
        file_name = str(target_field.name)
        is_paid = paper.is_premium or not paper.is_free
        if not is_paid and (file_name.startswith('papers/') or file_name.startswith('markschemes/') or file_name.startswith('media/')):
            clean_path = file_name if not file_name.startswith('media/') else file_name[6:]
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(f"https://storage.googleapis.com/mathib-vault-us/{clean_path}")

        try:
            pdf_bytes = read_file_field_bytes(target_field)
            filename = getattr(target_field, 'name', 'paper.pdf').split('/')[-1]
            return _build_pdf_response(pdf_bytes, filename, request, is_paid, user)
        except Exception:
            if not is_paid and file_name:
                from django.http import HttpResponseRedirect
                return HttpResponseRedirect(f"https://storage.googleapis.com/mathib-vault-us/{file_name}")
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
                fields = [p.pdf_file for p in bundle.papers.filter(is_active=True) if p.pdf_file]
                if not fields:
                    return Response({'success': False, 'message': 'This bundle has no PDF files attached'}, status=status.HTTP_404_NOT_FOUND)
                pdf_bytes = merge_pdf_fields_incremental(fields)
                filename = f"{bundle.slug or 'bundle'}.pdf"

            bundle.downloads_count += 1
            bundle.save(update_fields=['downloads_count'])

            return _build_pdf_response(pdf_bytes, filename, request, bundle.is_paid, user)
        except Exception:
            raise Http404('File not found')


class AdminBulkIngestView(APIView):
    """
    POST: Bulk upload PDFs or a ZIP archive of past papers / mark schemes.
    Automatically:
    1. Extracts files (if ZIP) or accepts multiple uploaded PDFs.
    2. Runs DocumentClassifier to identify board (IB, Cambridge, Edexcel), year, session, paper number, variant, QP vs MS.
    3. Runs DocumentSanitizer with PyMuPDF to purge watermarks and third-party logos.
    4. Auto-pairs Question Papers and Mark Schemes into a unified Paper record.
    5. Generates high-res thumbnail and saves with proper filter tags.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        import zipfile
        import tempfile
        import shutil
        from django.core.files.base import ContentFile
        from django.utils.text import slugify
        from rest_framework.parsers import MultiPartParser, FormParser
        from .classifier import DocumentClassifier
        from .sanitizer import DocumentSanitizer
        from apps.filters.models import FilterType, FilterOption

        user = _resolve_user(request)
        # Verify admin / staff permission or secret admin key
        admin_key = request.headers.get('X-Admin-Key') or request.query_params.get('admin_key')
        is_admin = (user and user.is_staff) or (admin_key == getattr(settings, 'SECRET_KEY', 'mathib'))
        if not is_admin:
            return Response({'success': False, 'message': 'Admin authentication required.'}, status=status.HTTP_403_FORBIDDEN)

        uploaded_files = request.FILES.getlist('files')
        zip_file = request.FILES.get('zip_file')
        clean_wm = request.data.get('clean_watermarks', 'true').lower() in ('true', '1')
        branding = request.data.get('add_branding', 'false').lower() in ('true', '1')

        if not uploaded_files and not zip_file:
            return Response({'success': False, 'message': 'No PDF files or ZIP archive provided.'}, status=status.HTTP_400_BAD_REQUEST)

        sanitizer = DocumentSanitizer()
        past_paper_cat, _ = Category.objects.get_or_create(
            slug='past-year-papers',
            defaults={'name': 'Past Year Papers', 'description': 'Official Past Year Examination Papers', 'display_order': 1}
        )
        topical_cat, _ = Category.objects.get_or_create(
            slug='topical-past-papers',
            defaults={'name': 'Topical Past Papers', 'description': 'Questions classified by Topic and Subtopic', 'display_order': 2}
        )

        def get_or_create_filter(type_slug, type_name, opt_name):
            if not opt_name:
                return None
            ftype, _ = FilterType.objects.get_or_create(slug=type_slug, defaults={'name': type_name})
            opt_name_str = str(opt_name).strip()
            opt_slug = slugify(opt_name_str)[:50]
            opt_code = slugify(opt_name_str).upper().replace('-', '_')[:50]
            opt = FilterOption.objects.filter(filter_type=ftype, name=opt_name_str).first()
            if not opt:
                opt = FilterOption.objects.filter(filter_type=ftype, code=opt_code).first()
            if not opt:
                opt = FilterOption.objects.create(
                    filter_type=ftype,
                    name=opt_name_str,
                    code=opt_code,
                    slug=opt_slug
                )
            return opt

        temp_dir = tempfile.mkdtemp(prefix='mathib_bulk_')
        discovered_pdfs = []

        try:
            # Handle ZIP
            if zip_file:
                with zipfile.ZipFile(zip_file, 'r') as z:
                    for filename in z.namelist():
                        if filename.lower().endswith('.pdf') and not filename.startswith('__MACOSX'):
                            target_path = os.path.join(temp_dir, os.path.basename(filename))
                            with open(target_path, 'wb') as f:
                                f.write(z.read(filename))
                            discovered_pdfs.append(target_path)

            # Handle direct PDF files
            for uf in uploaded_files:
                if uf.name.lower().endswith('.pdf'):
                    target_path = os.path.join(temp_dir, uf.name)
                    with open(target_path, 'wb') as f:
                        for chunk in uf.chunks():
                            f.write(chunk)
                    discovered_pdfs.append(target_path)

            # Classify
            qps = {}
            mss = {}
            topicals = []
            generic = []

            for fpath in discovered_pdfs:
                info = DocumentClassifier.classify_filename(fpath)
                info['file_path'] = fpath
                if info.get('is_markscheme') and info.get('pair_key'):
                    mss[info['pair_key']] = info
                elif info.get('pair_key'):
                    qps[info['pair_key']] = info
                elif info.get('format') == 'topical':
                    topicals.append(info)
                else:
                    generic.append(info)

            processed_papers = []

            # 1. Process paired QPs + MSs
            for pair_key, qp_info in qps.items():
                ms_info = mss.get(pair_key)
                title = qp_info['title'].replace(' (QUESTION)', '').replace(' (QP)', '')

                with open(qp_info['file_path'], 'rb') as f:
                    raw_qp = f.read()
                cleaned_qp = sanitizer.sanitize(raw_qp, clean_watermarks=clean_wm, add_mathib_branding=branding)
                page_count, thumb_bytes = extract_pdf_info(cleaned_qp)

                paper_obj, _ = Paper.objects.update_or_create(
                    title=title,
                    defaults={
                        'category': past_paper_cat,
                        'file_size': len(cleaned_qp),
                        'page_count': page_count,
                        'is_active': True,
                        'is_free': True,
                    }
                )
                safe_slug = slugify(f"{qp_info['code']}-{pair_key}")[:60]
                paper_obj.pdf_file.save(f"{safe_slug}.pdf", ContentFile(cleaned_qp), save=False)
                if thumb_bytes:
                    paper_obj.thumbnail.save(f"{safe_slug}_thumb.png", ContentFile(thumb_bytes), save=False)

                if ms_info:
                    with open(ms_info['file_path'], 'rb') as f_ms:
                        raw_ms = f_ms.read()
                    cleaned_ms = sanitizer.sanitize(raw_ms, clean_watermarks=clean_wm, add_mathib_branding=branding)
                    paper_obj.markscheme_file.save(f"{safe_slug}_ms.pdf", ContentFile(cleaned_ms), save=False)

                paper_obj.save()

                filters = []
                if qp_info.get('curriculum'):
                    filters.append(get_or_create_filter('curriculum', 'Curriculum', qp_info['curriculum']))
                if qp_info.get('year'):
                    filters.append(get_or_create_filter('year', 'Year', str(qp_info['year'])))
                if qp_info.get('season'):
                    filters.append(get_or_create_filter('season', 'Season', qp_info['season']))
                if qp_info.get('zone'):
                    filters.append(get_or_create_filter('zone', 'Zone / Timezone', qp_info['zone']))
                if qp_info.get('paper_number'):
                    filters.append(get_or_create_filter('paper', 'Paper Number', qp_info['paper_number']))

                paper_obj.filters.set([f for f in filters if f])
                processed_papers.append({
                    'id': paper_obj.id,
                    'title': paper_obj.title,
                    'has_qp': bool(paper_obj.pdf_file),
                    'has_ms': bool(paper_obj.markscheme_file),
                    'category': past_paper_cat.name,
                })

            # 2. Process remaining MSs (link to existing papers)
            for pair_key, ms_info in mss.items():
                if pair_key in qps:
                    continue
                possible_title = ms_info['title'].replace(' (MARKING-SCHEME)', '').replace(' (MS)', '')
                paper_obj = Paper.objects.filter(title__icontains=ms_info.get('code', 'xyz')).filter(title__icontains=str(ms_info.get('year', '9999'))).first()
                if not paper_obj:
                    paper_obj = Paper.objects.filter(title=possible_title).first()

                if paper_obj:
                    with open(ms_info['file_path'], 'rb') as f_ms:
                        raw_ms = f_ms.read()
                    cleaned_ms = sanitizer.sanitize(raw_ms, clean_watermarks=clean_wm, add_mathib_branding=branding)
                    safe_slug = slugify(paper_obj.title)[:60]
                    paper_obj.markscheme_file.save(f"{safe_slug}_ms.pdf", ContentFile(cleaned_ms), save=True)
                    processed_papers.append({
                        'id': paper_obj.id,
                        'title': f"{paper_obj.title} (Attached MS)",
                        'has_qp': bool(paper_obj.pdf_file),
                        'has_ms': True,
                        'category': paper_obj.category.name if paper_obj.category else 'Past Papers',
                    })

            # 3. Process topicals
            for top_info in topicals:
                title = top_info['title']
                with open(top_info['file_path'], 'rb') as f:
                    raw_bytes = f.read()
                cleaned_bytes = sanitizer.sanitize(raw_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)
                page_count, thumb_bytes = extract_pdf_info(cleaned_bytes)

                safe_slug = slugify(title)[:60]
                paper_obj, _ = Paper.objects.update_or_create(
                    title=title,
                    defaults={
                        'category': topical_cat,
                        'file_size': len(cleaned_bytes),
                        'page_count': page_count,
                        'is_active': True,
                        'is_free': True,
                    }
                )
                paper_obj.pdf_file.save(f"{safe_slug}.pdf", ContentFile(cleaned_bytes), save=False)
                if thumb_bytes:
                    paper_obj.thumbnail.save(f"{safe_slug}_thumb.png", ContentFile(thumb_bytes), save=False)
                paper_obj.save()

                filters = []
                if top_info.get('curriculum'):
                    filters.append(get_or_create_filter('curriculum', 'Curriculum', top_info['curriculum']))
                if top_info.get('topic'):
                    filters.append(get_or_create_filter('subject', 'Topic', top_info['topic']))
                paper_obj.filters.set([f for f in filters if f])
                processed_papers.append({
                    'id': paper_obj.id,
                    'title': title,
                    'has_qp': True,
                    'has_ms': False,
                    'category': topical_cat.name,
                })

            return Response({
                'success': True,
                'message': f'Successfully ingested {len(processed_papers)} examination resource(s) into MathIB.',
                'total_discovered': len(discovered_pdfs),
                'total_processed': len(processed_papers),
                'data': processed_papers,
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)


class PDFBifurcateView(APIView):
    """
    API endpoint to upload a PDF file, extract its text and structure,
    and bifurcate it into Subject, Topic, Subtopic, Difficulty Level,
    source page references, and key notes.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {"success": False, "error": "No PDF file provided. Please upload a .pdf document."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file name / extension
        filename = uploaded_file.name
        if not filename.lower().endswith('.pdf'):
            return Response(
                {"success": False, "error": "Invalid file format. Only PDF (.pdf) documents are supported."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Limit file size: 25 MB
        max_size = 25 * 1024 * 1024
        if uploaded_file.size > max_size:
            return Response(
                {"success": False, "error": f"File size exceeds 25 MB limit ({uploaded_file.size / (1024*1024):.1f} MB uploaded)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        subject_hint = request.data.get('subject_hint') or request.data.get('subject')
        try:
            max_pages = int(request.data.get('max_pages', 40))
        except (ValueError, TypeError):
            max_pages = 40

        try:
            from .bifurcation_service import bifurcate_pdf_content
            file_bytes = uploaded_file.read()
            result = bifurcate_pdf_content(
                file_bytes=file_bytes,
                filename=filename,
                subject_hint=subject_hint,
                max_pages=max_pages
            )
            if not result.get("success", False):
                return Response(result, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error during PDF bifurcation: {e}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "error": f"Failed to extract and bifurcate PDF: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PDFBifurcateExportView(APIView):
    """
    API endpoint that accepts structured bifurcation data and generates
    a polished, publication-ready A4 PDF report with custom typography,
    running headers/footers with 'Page X of Y', and difficulty metric cards.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        if not data or not isinstance(data, dict):
            return Response(
                {"success": False, "error": "Invalid report data payload."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .pdf_report_generator import build_bifurcated_pdf_report
            pdf_bytes = build_bifurcated_pdf_report(data)
            filename = data.get("filename", "document.pdf")
            safe_base = filename.rsplit('.', 1)[0].replace(' ', '_')
            export_filename = f"MathIB_Bifurcation_Report_{safe_base}.pdf"

            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{export_filename}"'
            response['Content-Length'] = len(pdf_bytes)
            return response
        except Exception as e:
            logger.error(f"Error generating PDF report: {e}", exc_info=True)
            return Response(
                {"success": False, "error": f"Failed to generate PDF report: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
