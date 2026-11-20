"""
Django Management Command: ingest_folder
Ingests, sanitizes, and categorizes exam papers, topical notes, and worksheets
from a local staging folder into the MathIB database.
"""

import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify

from apps.papers.models import Category, Paper
from apps.filters.models import FilterType, FilterOption
from apps.papers.sanitizer import DocumentSanitizer
from apps.papers.classifier import DocumentClassifier
from apps.papers.pdf_utils import extract_pdf_info


class Command(BaseCommand):
    help = "Bulk ingest, sanitize, and auto-classify exam papers and topical worksheets from a folder"

    def add_arguments(self, parser):
        parser.add_argument(
            'folder',
            nargs='?',
            default='ingestion_staging',
            help='Directory path containing PDFs to ingest (relative to backend or absolute)'
        )
        parser.add_argument(
            '--clean-watermarks',
            action='store_true',
            default=True,
            help='Purge third-party watermarks, headers, and URLs'
        )
        parser.add_argument(
            '--add-branding',
            action='store_true',
            default=False,
            help='Add subtle MathIB footer stamp'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Preview classification without modifying database or storage'
        )

    def handle(self, *args, **options):
        folder_path = options['folder']
        if not os.path.isabs(folder_path):
            folder_path = os.path.abspath(folder_path)

        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)
            self.stdout.write(self.style.WARNING(f"Created staging directory at: {folder_path}"))
            self.stdout.write("Paste your exam papers, notes, or books into this folder and re-run.")
            return

        clean_wm = options['clean_watermarks']
        branding = options['add_branding']
        dry_run = options['dry_run']

        self.stdout.write(self.style.MIGRATE_HEADING(f"Scanning folder: {folder_path} (dry_run={dry_run})"))

        sanitizer = DocumentSanitizer()

        # Step 1: Discover all PDFs
        pdf_files = []
        for root, _, files in os.walk(folder_path):
            for f in files:
                if f.lower().endswith('.pdf'):
                    pdf_files.append(os.path.join(root, f))

        if not pdf_files:
            self.stdout.write(self.style.WARNING("No PDF files found in staging directory."))
            return

        self.stdout.write(f"Found {len(pdf_files)} PDF file(s). Classifying & pairing...")

        # Step 2: Classify all files and pair Question Papers with Mark Schemes
        qps = {}
        mss = {}
        topicals = []
        others = []

        for fpath in pdf_files:
            info = DocumentClassifier.classify_filename(fpath)
            info['file_path'] = fpath

            if info.get('is_markscheme') and info.get('pair_key'):
                mss[info['pair_key']] = info
            elif info.get('pair_key'):
                qps[info['pair_key']] = info
            elif info.get('format') == 'topical':
                topicals.append(info)
            else:
                others.append(info)

        self.stdout.write(f"Classification Summary: {len(qps)} Exam Papers, {len(mss)} Mark Schemes, {len(topicals)} Topical Worksheets, {len(others)} Generic.")

        # Ensure default categories
        past_paper_cat, _ = Category.objects.get_or_create(
            slug='past-year-papers',
            defaults={'name': 'Past Year Papers', 'description': 'Official Past Year Examination Papers', 'display_order': 1}
        )
        topical_cat, _ = Category.objects.get_or_create(
            slug='topical-past-papers',
            defaults={'name': 'Topical Past Papers', 'description': 'Questions classified by Topic and Subtopic', 'display_order': 2}
        )

        # Helper to get or create filters
        def get_or_create_filter(type_slug, type_name, opt_name):
            if not opt_name:
                return None
            ftype, _ = FilterType.objects.get_or_create(slug=type_slug, defaults={'name': type_name})
            opt_slug = slugify(opt_name)
            opt, _ = FilterOption.objects.get_or_create(
                filter_type=ftype,
                slug=opt_slug,
                defaults={'name': str(opt_name), 'code': str(opt_name)[:10]}
            )
            return opt

        # Step 3: Process paired exam papers
        ingested_count = 0
        for pair_key, qp_info in qps.items():
            ms_info = mss.get(pair_key)
            title = qp_info['title'].replace(' (QUESTION)', '').replace(' (QP)', '')

            self.stdout.write(f"-> Processing Paper: {title}")
            if ms_info:
                self.stdout.write(f"   [+] Paired with Mark Scheme: {os.path.basename(ms_info['file_path'])}")

            if dry_run:
                continue

            with open(qp_info['file_path'], 'rb') as f:
                raw_bytes = f.read()

            cleaned_bytes = sanitizer.sanitize(raw_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)
            page_count, thumb_bytes = extract_pdf_info(cleaned_bytes)

            paper_obj, created = Paper.objects.update_or_create(
                title=title,
                defaults={
                    'category': past_paper_cat,
                    'file_size': len(cleaned_bytes),
                    'page_count': page_count,
                    'is_active': True,
                    'is_free': True,
                }
            )

            # Save sanitized PDF file
            filename = f"{pair_key}_cleaned.pdf"
            paper_obj.pdf_file.save(filename, ContentFile(cleaned_bytes), save=False)

            # Save thumbnail
            if thumb_bytes:
                paper_obj.thumbnail.save(f"{pair_key}_thumb.png", ContentFile(thumb_bytes), save=False)

            # Sanitize and attach mark scheme if present
            if ms_info:
                with open(ms_info['file_path'], 'rb') as f_ms:
                    raw_ms = f_ms.read()
                cleaned_ms = sanitizer.sanitize(raw_ms, clean_watermarks=clean_wm, add_mathib_branding=branding)
                paper_obj.markscheme_file.save(f"{pair_key}_ms_cleaned.pdf", ContentFile(cleaned_ms), save=False)

            paper_obj.save()

            # Attach filters
            filters_to_add = []
            if qp_info.get('curriculum'):
                filters_to_add.append(get_or_create_filter('curriculum', 'Curriculum', qp_info['curriculum']))
            if qp_info.get('year'):
                filters_to_add.append(get_or_create_filter('year', 'Year', str(qp_info['year'])))
            if qp_info.get('season'):
                filters_to_add.append(get_or_create_filter('season', 'Season', qp_info['season']))
            if qp_info.get('zone'):
                filters_to_add.append(get_or_create_filter('zone', 'Zone / Timezone', qp_info['zone']))
            if qp_info.get('paper_number'):
                filters_to_add.append(get_or_create_filter('paper', 'Paper Number', qp_info['paper_number']))

            paper_obj.filters.set([f for f in filters_to_add if f])
            ingested_count += 1

        # Step 4: Process Topical Worksheets
        for top_info in topicals:
            title = top_info['title']
            self.stdout.write(f"-> Processing Topical Worksheet: {title}")

            if dry_run:
                continue

            with open(top_info['file_path'], 'rb') as f:
                raw_bytes = f.read()

            cleaned_bytes = sanitizer.sanitize(raw_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)
            page_count, thumb_bytes = extract_pdf_info(cleaned_bytes)

            top_slug = slugify(f"{top_info['code']}-{top_info['topic']}-{top_info.get('subtopic', '')}")[:80]
            paper_obj, created = Paper.objects.update_or_create(
                title=title,
                defaults={
                    'category': topical_cat,
                    'file_size': len(cleaned_bytes),
                    'page_count': page_count,
                    'is_active': True,
                    'is_free': True,
                }
            )

            filename = f"{top_slug}.pdf"
            paper_obj.pdf_file.save(filename, ContentFile(cleaned_bytes), save=False)
            if thumb_bytes:
                paper_obj.thumbnail.save(f"{top_slug}_thumb.png", ContentFile(thumb_bytes), save=False)
            paper_obj.save()

            filters_to_add = []
            if top_info.get('curriculum'):
                filters_to_add.append(get_or_create_filter('curriculum', 'Curriculum', top_info['curriculum']))
            if top_info.get('topic'):
                filters_to_add.append(get_or_create_filter('subject', 'Topic', top_info['topic']))
            paper_obj.filters.set([f for f in filters_to_add if f])
            ingested_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully processed {ingested_count} resource(s) into MathIB!"))
