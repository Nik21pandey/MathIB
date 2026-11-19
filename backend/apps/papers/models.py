"""
Models for Papers and Categories
"""

import os
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from django.core.files.base import ContentFile


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text="Icon name from iconsax-react library"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    is_free = models.BooleanField(default=True)
    is_downloadable = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)
    is_printable = models.BooleanField(default=False)
    is_main = models.BooleanField(default=False, help_text="Mark as main/featured category")
    display_order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order in which categories are displayed"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['parent']),
            models.Index(fields=['is_active', 'display_order']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def paper_count(self):
        return self.papers.filter(is_active=True).count()

    @property
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name

    @property
    def is_subcategory(self):
        return self.parent is not None

    def get_all_subcategories(self):
        subcats = list(self.subcategories.all())
        for subcat in list(subcats):
            subcats.extend(subcat.get_all_subcategories())
        return subcats


class Paper(models.Model):
    title = models.CharField(max_length=255, help_text="e.g., Mathematics Paper 1")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='papers',
        help_text="Category this paper belongs to"
    )
    description = models.TextField(blank=True)

    pdf_file = models.FileField(upload_to='papers/%Y/%m/', help_text="Upload PDF file")
    thumbnail = models.ImageField(
        upload_to='thumbnails/%Y/%m/',
        blank=True,
        null=True,
        help_text="Auto-generated from Page 1 if left blank"
    )
    filters = models.ManyToManyField(
        'filters.FilterOption',
        related_name='papers',
        blank=True,
        help_text="Select applicable filters (curriculum, subject, year, etc.)"
    )

    file_size = models.IntegerField(blank=True, null=True, help_text="File size in bytes (auto-calculated)")
    page_count = models.IntegerField(blank=True, null=True, help_text="Number of pages in PDF (auto-calculated)")

    is_free = models.BooleanField(default=True, help_text="Is this paper free to access?")
    is_premium = models.BooleanField(default=False, help_text="Requires premium purchase or subscription?")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Price if this individual paper (e.g. Predicted Mock) is sold separately"
    )
    markscheme_file = models.FileField(
        upload_to='markschemes/%Y/%m/',
        blank=True,
        null=True,
        help_text="Optional matching Markscheme PDF file"
    )

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Show in featured section?")

    views_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Paper'
        verbose_name_plural = 'Papers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.category.name}"

    def save(self, *args, **kwargs):
        update_fields = kwargs.get('update_fields')
        should_inspect = update_fields is None or 'pdf_file' in update_fields

        if should_inspect and self.pdf_file:
            try:
                if not self.file_size:
                    self.file_size = self.pdf_file.size
            except Exception:
                pass

            if not self.page_count or not self.thumbnail:
                try:
                    from .pdf_utils import extract_pdf_info
                    self.pdf_file.seek(0)
                    raw_bytes = self.pdf_file.read()
                    self.pdf_file.seek(0)
                    if not self.file_size:
                        self.file_size = len(raw_bytes)
                    pages, thumb_bytes = extract_pdf_info(raw_bytes)
                    if not self.page_count and pages:
                        self.page_count = pages
                    if not self.thumbnail and thumb_bytes:
                        base_name = os.path.splitext(os.path.basename(self.pdf_file.name))[0]
                        self.thumbnail.save(f"{base_name}_thumb.png", ContentFile(thumb_bytes), save=False)
                except Exception:
                    pass

        super().save(*args, **kwargs)

    @property
    def file_size_mb(self):
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0

    def get_filter_values(self, filter_type_slug):
        return self.filters.filter(
            filter_type__slug=filter_type_slug,
            filter_type__is_active=True,
            is_active=True
        )


class Bundle(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    description = models.TextField(blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='bundles',
        help_text="Category this bundle belongs to"
    )
    papers = models.ManyToManyField(
        Paper,
        related_name='bundles',
        blank=True,
        help_text="Papers included in this bundle"
    )
    bundle_pdf = models.FileField(
        upload_to='bundles/%Y/%m/',
        null=True,
        blank=True,
        help_text="Optional combined PDF (if left blank, attached papers auto-merge on download)"
    )
    cover_image = models.ImageField(
        upload_to='bundle_covers/',
        null=True,
        blank=True,
        help_text="Cover image for the bundle"
    )

    is_paid = models.BooleanField(default=False, help_text="Is this a paid bundle?")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Price (required if is_paid is True)"
    )
    filters = models.ManyToManyField(
        'filters.FilterOption',
        related_name='bundles',
        blank=True,
        help_text="Dynamic filters applied to this bundle"
    )
    file_size = models.BigIntegerField(null=True, blank=True, help_text="Bundle PDF file size in bytes")

    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text="Show in featured section?")
    display_order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Order in which bundles are displayed"
    )

    views_count = models.IntegerField(default=0)
    downloads_count = models.IntegerField(default=0)
    purchase_count = models.IntegerField(default=0, help_text="Number of purchases (for paid bundles)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Bundle'
        verbose_name_plural = 'Bundles'
        ordering = ['display_order', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_paid', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
            models.Index(fields=['display_order', '-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        update_fields = kwargs.get('update_fields')
        if (update_fields is None or 'bundle_pdf' in update_fields) and self.bundle_pdf and not self.file_size:
            try:
                self.file_size = self.bundle_pdf.size
            except Exception:
                pass

        if self.is_paid and self.price is None:
            raise ValueError("Price must be set for paid bundles")

        if not self.is_paid:
            self.price = None

        super().save(*args, **kwargs)

    @property
    def file_size_mb(self):
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0

    @property
    def paper_count(self):
        return self.papers.count()

    @property
    def is_free(self):
        return not self.is_paid