"""
Django Management Command: ingest_folder
Ingests, sanitizes, and categorizes exam papers, topical notes, worksheets,
and compendium books from a local staging folder into the MathIB database.
"""

import os
import re
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from apps.papers.models import Category, Paper, Bundle
from apps.filters.models import FilterType, FilterOption
from apps.papers.sanitizer import DocumentSanitizer
from apps.papers.classifier import DocumentClassifier
from apps.papers.pdf_utils import extract_pdf_info


class Command(BaseCommand):
    help = "Bulk ingest, sanitize, and auto-classify exam papers, topical worksheets, and compendium books from a folder"

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
        parser.add_argument(
            '--limit',
            type=int,
            default=0,
            help='Limit the number of papers extracted from compendiums (0 = all)'
        )

    def handle(self, *args, **options):
        folder_path = options['folder']
        if not os.path.isabs(folder_path):
            folder_path = os.path.abspath(folder_path)

        if not os.path.exists(folder_path):
            try:
                os.makedirs(folder_path, exist_ok=True)
                self.stdout.write(self.style.WARNING(f"Created staging directory at: {folder_path}"))
                self.stdout.write("Paste your exam papers, notes, or books into this folder and re-run.")
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Folder path does not exist and could not be created: {folder_path} ({e})"))
            return

        clean_wm = options['clean_watermarks']
        branding = options['add_branding']
        dry_run = options['dry_run']
        limit = options['limit']

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

        self.stdout.write(f"Found {len(pdf_files)} PDF file(s). Inspecting content and structure...")

        # Ensure default categories
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
            opt_slug = slugify(str(opt_name))
            opt, _ = FilterOption.objects.get_or_create(
                filter_type=ftype,
                slug=opt_slug,
                defaults={'name': str(opt_name), 'code': str(opt_name)[:10]}
            )
            return opt

        # Step 2: Separate Compendiums from Individual Files
        compendiums = []
        individual_files = []

        for fpath in pdf_files:
            fname = os.path.basename(fpath).lower()
            try:
                doc = fitz.open(fpath)
                toc = doc.get_toc()
                doc.close()
            except Exception:
                toc = []

            # A file is a compendium if it has a multi-item bookmark outline or is a large compilation book
            if len(toc) > 3 or ('past_papers' in fname and any(y in fname for y in ['2022', '2023', '2024', '2025', '2026'])):
                compendiums.append((fpath, toc))
            else:
                individual_files.append(fpath)

        total_ingested = 0

        # Step 3: Handle Compendiums (Unpack Bookmarks & Pair QPs with MSs)
        if compendiums:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n[Compendium Unpacker] Detected {len(compendiums)} compilation book(s)."))

            # Group compendiums by QP and MS pairs
            qp_books = [c for c in compendiums if 'mark_scheme' not in os.path.basename(c[0]).lower()]
            ms_books = [c for c in compendiums if 'mark_scheme' in os.path.basename(c[0]).lower()]

            for qp_path, qp_toc in qp_books:
                # Find matching mark scheme book if available
                ms_match = None
                for ms_path, ms_toc in ms_books:
                    if '0580' in qp_path and '0580' in ms_path:
                        ms_match = (ms_path, ms_toc)
                        break

                qp_doc = fitz.open(qp_path)
                ms_doc = fitz.open(ms_match[0]) if ms_match else None

                # Filter out the "Contents" bookmark
                all_valid_entries = [item for item in qp_toc if item[1].lower() != 'contents']
                entries_to_process = all_valid_entries[:limit] if limit > 0 else all_valid_entries

                self.stdout.write(f"Unpacking {len(entries_to_process)} paper(s) from {os.path.basename(qp_path)}...")

                created_papers = []

                for idx, item in enumerate(entries_to_process):
                    title_raw = item[1].strip()
                    start_page = item[2] - 1  # 0-indexed
                    if idx + 1 < len(all_valid_entries):
                        end_page = all_valid_entries[idx + 1][2] - 1
                    else:
                        end_page = len(qp_doc)

                    # Extract paper title, session, code, year
                    # e.g. "0580/22 Paper 2 Non-calculator · February/March 2026"
                    clean_title = title_raw.replace(' · ', ' ').replace(' (calculator allowed, pre-2025 format)', '')
                    self.stdout.write(f"  [{idx + 1}/{len(entries_to_process)}] Extracting: {clean_title} (pages {start_page + 1}-{end_page})")

                    if dry_run:
                        total_ingested += 1
                        continue

                    # Slice out the question paper
                    sub_qp = fitz.open()
                    sub_qp.insert_pdf(qp_doc, from_page=start_page, to_page=end_page - 1)
                    raw_qp_bytes = sub_qp.tobytes()
                    sub_qp.close()

                    cleaned_qp_bytes = sanitizer.sanitize(raw_qp_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)
                    page_count, thumb_bytes = extract_pdf_info(cleaned_qp_bytes)

                    # Slice out the matching mark scheme if available
                    cleaned_ms_bytes = None
                    if ms_doc and ms_match:
                        ms_all = [m for m in ms_match[1] if m[1].lower() != 'contents']
                        if idx < len(ms_all):
                            ms_item = ms_all[idx]
                            ms_start = ms_item[2] - 1
                            ms_end = ms_all[idx + 1][2] - 1 if idx + 1 < len(ms_all) else len(ms_doc)
                            sub_ms = fitz.open()
                            sub_ms.insert_pdf(ms_doc, from_page=ms_start, to_page=ms_end - 1)
                            raw_ms_bytes = sub_ms.tobytes()
                            sub_ms.close()
                            cleaned_ms_bytes = sanitizer.sanitize(raw_ms_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)

                    # Parse Year, Season, Variant from title
                    year_match = re.search(r'20\d{2}', clean_title)
                    year_val = int(year_match.group(0)) if year_match else 2024

                    season_val = 'May/June'
                    if 'february' in clean_title.lower() or 'march' in clean_title.lower():
                        season_val = 'Feb/March'
                    elif 'october' in clean_title.lower() or 'november' in clean_title.lower():
                        season_val = 'Oct/Nov'

                    paper_num_match = re.search(r'Paper\s*(\d)', clean_title, re.IGNORECASE)
                    paper_num = f"Paper {paper_num_match.group(1)}" if paper_num_match else "Paper 2"

                    # Database insert / update
                    paper_obj, _ = Paper.objects.update_or_create(
                        title=clean_title,
                        defaults={
                            'category': past_paper_cat,
                            'file_size': len(cleaned_qp_bytes),
                            'page_count': page_count,
                            'is_active': True,
                            'is_free': True,
                        }
                    )

                    safe_slug = slugify(clean_title)[:60]
                    paper_obj.pdf_file.save(f"{safe_slug}.pdf", ContentFile(cleaned_qp_bytes), save=False)
                    if thumb_bytes:
                        paper_obj.thumbnail.save(f"{safe_slug}_thumb.png", ContentFile(thumb_bytes), save=False)
                    if cleaned_ms_bytes:
                        paper_obj.markscheme_file.save(f"{safe_slug}_ms.pdf", ContentFile(cleaned_ms_bytes), save=False)

                    paper_obj.save()

                    # Filters
                    filters = [
                        get_or_create_filter('curriculum', 'Curriculum', 'Cambridge IGCSE Mathematics (0580)'),
                        get_or_create_filter('year', 'Year', str(year_val)),
                        get_or_create_filter('season', 'Season', season_val),
                        get_or_create_filter('paper', 'Paper Number', paper_num),
                    ]
                    paper_obj.filters.set([f for f in filters if f])
                    created_papers.append(paper_obj)
                    total_ingested += 1

                qp_doc.close()
                if ms_doc:
                    ms_doc.close()

                # Also create a master Bundle for the compilation
                if not dry_run and created_papers:
                    bundle_name = "Cambridge IGCSE 0580 Extended Complete Past Papers (2022–2026)"
                    bundle_obj, _ = Bundle.objects.update_or_create(
                        slug="0580-past-papers-2022-2026-complete-bundle",
                        defaults={
                            'name': bundle_name,
                            'description': 'Complete collection of Cambridge IGCSE 0580 Paper 2 and Paper 4 past examination papers with matching mark schemes.',
                            'category': past_paper_cat,
                            'is_paid': False,
                            'is_featured': True,
                            'is_active': True,
                        }
                    )
                    bundle_obj.papers.set(created_papers)
                    self.stdout.write(self.style.SUCCESS(f"Created Master Bundle: '{bundle_name}' containing {len(created_papers)} papers!"))

        # Step 4: Handle Individual Files
        if individual_files:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n[Individual File Processor] Processing {len(individual_files)} file(s)..."))

            qps = {}
            mss = {}
            topicals = []
            generic = []

            for fpath in individual_files:
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

            # Process paired QPs
            for pair_key, qp_info in qps.items():
                ms_info = mss.get(pair_key)
                title = qp_info['title'].replace(' (QUESTION)', '').replace(' (QP)', '')
                self.stdout.write(f"-> Processing Paper: {title}")

                if dry_run:
                    total_ingested += 1
                    continue

                with open(qp_info['file_path'], 'rb') as f:
                    raw_bytes = f.read()

                cleaned_bytes = sanitizer.sanitize(raw_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)
                page_count, thumb_bytes = extract_pdf_info(cleaned_bytes)

                paper_obj, _ = Paper.objects.update_or_create(
                    title=title,
                    defaults={
                        'category': past_paper_cat,
                        'file_size': len(cleaned_bytes),
                        'page_count': page_count,
                        'is_active': True,
                        'is_free': True,
                    }
                )

                safe_slug = slugify(f"{qp_info['code']}-{pair_key}")[:60]
                paper_obj.pdf_file.save(f"{safe_slug}.pdf", ContentFile(cleaned_bytes), save=False)
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
                total_ingested += 1

            # Process topicals
            for top_info in topicals:
                title = top_info['title']
                self.stdout.write(f"-> Processing Topical: {title}")
                if dry_run:
                    total_ingested += 1
                    continue

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
                total_ingested += 1

            # Process generic files
            for gen_info in generic:
                title = gen_info['title']
                self.stdout.write(f"-> Processing Document: {title}")
                if dry_run:
                    total_ingested += 1
                    continue

                with open(gen_info['file_path'], 'rb') as f:
                    raw_bytes = f.read()

                cleaned_bytes = sanitizer.sanitize(raw_bytes, clean_watermarks=clean_wm, add_mathib_branding=branding)
                page_count, thumb_bytes = extract_pdf_info(cleaned_bytes)

                safe_slug = slugify(title)[:60]
                paper_obj, _ = Paper.objects.update_or_create(
                    title=title,
                    defaults={
                        'category': past_paper_cat,
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
                total_ingested += 1

        self.stdout.write(self.style.SUCCESS(f"\nCompleted! Successfully ingested {total_ingested} examination resources into MathIB."))
