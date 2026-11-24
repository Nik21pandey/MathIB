"""
Serializers for Papers and Categories
"""

from django.urls import reverse
from rest_framework import serializers
from .models import Category, Paper, Bundle
from apps.filters.models import FilterOption


class CategorySerializer(serializers.ModelSerializer):
    paper_count = serializers.IntegerField(read_only=True)
    full_path = serializers.CharField(read_only=True)
    is_subcategory = serializers.BooleanField(read_only=True)
    subcategories_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'parent',
            'is_free', 'is_downloadable', 'is_online', 'is_printable',
            'is_main', 'display_order', 'is_active', 'paper_count',
            'full_path', 'is_subcategory', 'subcategories_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_subcategories_count(self, obj):
        return obj.subcategories.filter(is_active=True).count()


class CategoryListSerializer(serializers.ModelSerializer):
    paper_count = serializers.IntegerField(read_only=True)
    subcategories_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'is_free', 'is_downloadable', 'is_online', 'is_printable',
            'is_main', 'display_order', 'paper_count', 'subcategories_count',
        ]

    def get_subcategories_count(self, obj):
        return obj.subcategories.filter(is_active=True).count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    paper_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'is_free', 'is_downloadable', 'is_online', 'is_printable',
            'is_main', 'display_order', 'paper_count', 'subcategories',
        ]

    def get_subcategories(self, obj):
        subcats = obj.subcategories.filter(is_active=True)
        return CategoryTreeSerializer(subcats, many=True).data


class CategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'name', 'description', 'icon', 'parent',
            'is_free', 'is_downloadable', 'is_online', 'is_printable',
            'is_main', 'display_order', 'is_active',
        ]

    def validate_parent(self, value):
        if self.instance and value:
            if value == self.instance:
                raise serializers.ValidationError("Category cannot be its own parent")
            current = value
            while current.parent:
                if current.parent == self.instance:
                    raise serializers.ValidationError("Circular parent reference detected")
                current = current.parent
        return value


class FilterOptionSerializer(serializers.ModelSerializer):
    filter_type_name = serializers.CharField(source='filter_type.name', read_only=True)
    filter_type_slug = serializers.CharField(source='filter_type.slug', read_only=True)

    class Meta:
        model = FilterOption
        fields = ['id', 'name', 'code', 'slug', 'filter_type_name', 'filter_type_slug']


class PaperListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    markscheme_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Paper
        fields = [
            'id', 'title', 'category_name', 'category_slug',
            'pdf_url', 'markscheme_url', 'thumbnail_url',
            'file_size_mb', 'page_count',
            'is_free', 'is_premium', 'price', 'is_featured',
            'views_count', 'downloads_count', 'filters', 'created_at',
        ]

    def _get_authorized_file_url(self, obj, is_markscheme=False):
        target_field = obj.markscheme_file if is_markscheme else obj.pdf_file
        if not target_field:
            return None

        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None

        is_paid = obj.is_premium or not obj.is_free
        if is_paid:
            has_access = False
            if user and user.is_authenticated:
                if getattr(user, 'is_staff', False) or getattr(user, 'is_premium_active', False):
                    has_access = True
                else:
                    try:
                        from apps.payments.models import UserPurchase
                        if UserPurchase.objects.filter(user=user, paper=obj, is_active=True).exists():
                            has_access = True
                        elif UserPurchase.objects.filter(user=user, bundle__papers=obj, is_active=True).exists():
                            has_access = True
                    except Exception:
                        pass
            if not has_access:
                return None

            endpoint_name = 'papers:paper-markscheme' if is_markscheme else 'papers:paper-file'
            file_path = reverse(endpoint_name, kwargs={'paper_id': obj.id})
            return request.build_absolute_uri(file_path) if request else file_path

        file_name = str(target_field.name)
        prefix = 'markschemes/' if is_markscheme else 'papers/'
        if file_name.startswith(prefix) or file_name.startswith(f'media/{prefix}'):
            clean_path = file_name if not file_name.startswith('media/') else file_name[6:]
            return f"https://storage.googleapis.com/mathib-vault-us/{clean_path}"
        try:
            url = target_field.url
            if url.startswith('http'):
                return url
        except Exception:
            pass
        endpoint_name = 'papers:paper-markscheme' if is_markscheme else 'papers:paper-file'
        file_path = reverse(endpoint_name, kwargs={'paper_id': obj.id})
        return request.build_absolute_uri(file_path) if request else file_path

    def get_pdf_url(self, obj):
        return self._get_authorized_file_url(obj, is_markscheme=False)

    def get_markscheme_url(self, obj):
        return self._get_authorized_file_url(obj, is_markscheme=True)

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail:
            return None
        file_name = str(obj.thumbnail.name)
        if file_name.startswith('thumbnails/') or file_name.startswith('media/thumbnails/'):
            clean_path = file_name if not file_name.startswith('media/') else file_name[6:]
            return f"https://storage.googleapis.com/mathib-vault-us/{clean_path}"
        try:
            url = obj.thumbnail.url
            if url.startswith('http'):
                return url
        except Exception:
            pass
        request = self.context.get('request')
        return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url


class PaperDetailSerializer(serializers.ModelSerializer):
    category = CategoryListSerializer(read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    markscheme_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Paper
        fields = [
            'id', 'title', 'description', 'category',
            'pdf_url', 'markscheme_url', 'thumbnail_url',
            'file_size', 'file_size_mb', 'page_count',
            'is_free', 'is_premium', 'price', 'is_active', 'is_featured',
            'views_count', 'downloads_count', 'filters', 'created_at', 'updated_at',
        ]

    def _get_authorized_file_url(self, obj, is_markscheme=False):
        target_field = obj.markscheme_file if is_markscheme else obj.pdf_file
        if not target_field:
            return None

        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None

        is_paid = obj.is_premium or not obj.is_free
        if is_paid:
            has_access = False
            if user and user.is_authenticated:
                if getattr(user, 'is_staff', False) or getattr(user, 'is_premium_active', False):
                    has_access = True
                else:
                    try:
                        from apps.payments.models import UserPurchase
                        if UserPurchase.objects.filter(user=user, paper=obj, is_active=True).exists():
                            has_access = True
                        elif UserPurchase.objects.filter(user=user, bundle__papers=obj, is_active=True).exists():
                            has_access = True
                    except Exception:
                        pass
            if not has_access:
                return None

            endpoint_name = 'papers:paper-markscheme' if is_markscheme else 'papers:paper-file'
            file_path = reverse(endpoint_name, kwargs={'paper_id': obj.id})
            return request.build_absolute_uri(file_path) if request else file_path

        file_name = str(target_field.name)
        prefix = 'markschemes/' if is_markscheme else 'papers/'
        if file_name.startswith(prefix) or file_name.startswith(f'media/{prefix}'):
            clean_path = file_name if not file_name.startswith('media/') else file_name[6:]
            return f"https://storage.googleapis.com/mathib-vault-us/{clean_path}"
        try:
            url = target_field.url
            if url.startswith('http'):
                return url
        except Exception:
            pass
        endpoint_name = 'papers:paper-markscheme' if is_markscheme else 'papers:paper-file'
        file_path = reverse(endpoint_name, kwargs={'paper_id': obj.id})
        return request.build_absolute_uri(file_path) if request else file_path

    def get_pdf_url(self, obj):
        return self._get_authorized_file_url(obj, is_markscheme=False)

    def get_markscheme_url(self, obj):
        return self._get_authorized_file_url(obj, is_markscheme=True)

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail:
            return None
        file_name = str(obj.thumbnail.name)
        if file_name.startswith('thumbnails/') or file_name.startswith('media/thumbnails/'):
            clean_path = file_name if not file_name.startswith('media/') else file_name[6:]
            return f"https://storage.googleapis.com/mathib-vault-us/{clean_path}"
        try:
            url = obj.thumbnail.url
            if url.startswith('http'):
                return url
        except Exception:
            pass
        request = self.context.get('request')
        return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url


class PaperCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paper
        fields = [
            'title', 'description', 'category', 'pdf_file', 'markscheme_file',
            'thumbnail', 'page_count', 'is_free', 'is_premium', 'price',
            'is_active', 'is_featured', 'filters',
        ]


class BundleListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    paper_count = serializers.IntegerField(read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Bundle
        fields = [
            'id', 'name', 'slug', 'description',
            'category', 'category_name', 'category_slug',
            'cover_image', 'is_paid', 'price', 'paper_count',
            'file_size', 'is_active', 'is_featured', 'display_order',
            'views_count', 'downloads_count', 'purchase_count',
            'filters', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'downloads_count', 'purchase_count', 'created_at']


class BundleDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    paper_count = serializers.IntegerField(read_only=True)
    papers = PaperListSerializer(many=True, read_only=True)
    filters = FilterOptionSerializer(many=True, read_only=True)
    bundle_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Bundle
        fields = [
            'id', 'name', 'slug', 'description',
            'category', 'category_name', 'category_slug',
            'papers', 'paper_count', 'bundle_pdf_url',
            'cover_image', 'is_paid', 'price', 'file_size',
            'is_active', 'is_featured', 'display_order',
            'views_count', 'downloads_count', 'purchase_count',
            'filters', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'slug', 'views_count', 'downloads_count',
            'purchase_count', 'created_at', 'updated_at'
        ]

    def get_bundle_pdf_url(self, obj):
        if not (obj.bundle_pdf or obj.papers.filter(is_active=True).exists()):
            return None
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if obj.is_paid:
            has_access = False
            if user and user.is_authenticated:
                if getattr(user, 'is_staff', False) or getattr(user, 'is_premium_active', False):
                    has_access = True
                else:
                    try:
                        from apps.payments.models import UserPurchase
                        has_access = UserPurchase.objects.filter(user=user, bundle=obj, is_active=True).exists()
                    except Exception:
                        pass
            if not has_access:
                return None
        file_path = reverse('papers:bundle-file', kwargs={'bundle_id': obj.id})
        return request.build_absolute_uri(file_path) if request else file_path