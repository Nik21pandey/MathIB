"""
Django admin configuration for Papers and Categories
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Paper, Bundle


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'parent', 'is_main', 'display_order',
        'is_free', 'paper_count', 'is_active', 'created_at'
    ]
    list_filter = ['is_main', 'is_free', 'is_active', 'is_downloadable', 'parent']
    search_fields = ['name', 'description', 'slug']
    ordering = ['display_order', 'name']
    list_editable = ['display_order', 'is_active']

    fieldsets = (
        ('Basic Information', {'fields': ('name', 'slug', 'description', 'icon')}),
        ('Hierarchy', {'fields': ('parent', 'is_main', 'display_order')}),
        ('Access & Pricing', {'fields': ('is_free', 'is_downloadable', 'is_online', 'is_printable')}),
        ('Status & Metadata', {'fields': ('is_active', 'paper_count', 'created_at', 'updated_at')}),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = ['created_at', 'updated_at', 'paper_count']
        if obj:
            readonly.append('slug')
        return readonly

    def get_prepopulated_fields(self, request, obj=None):
        return {'slug': ('name',)} if obj is None else {}


@admin.register(Paper)
class PaperAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'file_size_mb', 'page_count',
        'has_markscheme', 'is_free', 'price', 'is_featured',
        'is_active', 'downloads_count', 'created_at'
    ]
    list_filter = ['category', 'is_free', 'is_premium', 'is_featured', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'is_featured']
    filter_horizontal = ['filters']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'category', 'description')
        }),
        ('PDF & Markscheme Files', {
            'fields': ('pdf_file', 'markscheme_file', 'thumbnail'),
            'description': 'Thumbnail and page count are auto-generated from Page 1 if left blank.'
        }),
        ('Dynamic Filters', {
            'fields': ('filters',),
            'description': 'Select applicable filters (curriculum, subject, year, season, zone, etc.)'
        }),
        ('Access Control & Pricing', {
            'fields': ('is_free', 'is_premium', 'price', 'is_active', 'is_featured')
        }),
        ('Metadata & Statistics', {
            'fields': ('file_size', 'page_count', 'views_count', 'downloads_count'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['file_size', 'views_count', 'downloads_count']

    def file_size_mb(self, obj):
        return f"{obj.file_size_mb} MB" if obj.file_size else "-"
    file_size_mb.short_description = 'File Size'

    def has_markscheme(self, obj):
        return bool(obj.markscheme_file)
    has_markscheme.boolean = True
    has_markscheme.short_description = 'Markscheme'


@admin.register(Bundle)
class BundleAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'paper_count_display', 'pricing_display',
        'file_size_mb', 'is_featured', 'is_active', 'purchase_count', 'created_at'
    ]
    list_filter = ['category', 'is_paid', 'is_featured', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'slug']
    list_editable = ['is_active', 'is_featured']
    filter_horizontal = ['papers', 'filters']
    date_hierarchy = 'created_at'
    ordering = ['display_order', '-created_at']

    fieldsets = (
        ('Basic Information', {'fields': ('name', 'slug', 'category', 'description')}),
        ('Papers in Bundle', {
            'fields': ('papers',),
            'description': 'Select papers to include in this bundle.'
        }),
        ('Bundle File', {
            'fields': ('bundle_pdf', 'cover_image'),
            'description': 'Optional: leave blank to auto-merge selected papers on download.'
        }),
        ('Dynamic Filters', {
            'fields': ('filters',),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': ('is_paid', 'price'),
            'description': 'Price is required if "Is paid" is checked.'
        }),
        ('Display & Status', {'fields': ('is_active', 'is_featured', 'display_order')}),
        ('Statistics', {
            'fields': ('views_count', 'downloads_count', 'purchase_count', 'file_size'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ['file_size', 'views_count', 'downloads_count', 'purchase_count', 'created_at', 'updated_at']

    def get_prepopulated_fields(self, request, obj=None):
        return {'slug': ('name',)} if obj is None else {}

    def paper_count_display(self, obj):
        count = obj.paper_count
        if count == 0:
            return format_html('<span style="color: red;">0 papers</span>')
        return format_html('<span style="color: green;">{} paper{}</span>', count, 's' if count > 1 else '')
    paper_count_display.short_description = 'Papers'

    def pricing_display(self, obj):
        if obj.is_paid:
            if obj.price:
                return format_html('<span style="color: #0066cc; font-weight: bold;">{}</span>', obj.price)
            return format_html('<span style="color: red;">PAID - No Price Set!</span>')
        return format_html('<span style="color: green;">FREE</span>')
    pricing_display.short_description = 'Pricing'

    def file_size_mb(self, obj):
        return f"{obj.file_size_mb} MB" if obj.file_size else "-"
    file_size_mb.short_description = 'File Size'

    def save_model(self, request, obj, form, change):
        try:
            super().save_model(request, obj, form, change)
        except ValueError as e:
            from django.contrib import messages
            messages.error(request, str(e))