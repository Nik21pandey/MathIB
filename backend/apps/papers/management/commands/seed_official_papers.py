"""
Management command: seed_official_papers
Loads official examination papers (with authentic Google Cloud Storage URLs)
into the database from official_papers.json.
"""

import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.papers.models import Category, Paper
from apps.filters.models import FilterType, FilterOption

DEFAULT_FILE = Path(__file__).resolve().parent.parent.parent / 'seed' / 'official_papers.json'


class Command(BaseCommand):
    help = 'Seeds official past examination papers from official_papers.json'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=str(DEFAULT_FILE), help='Path to official_papers.json')

    @transaction.atomic
    def handle(self, *args, **options):
        path = Path(options['file'])
        if not path.exists():
            self.stdout.write(self.style.WARNING(f"{path} not found. Skipping official papers seeding."))
            return

        papers_data = json.loads(path.read_text(encoding='utf-8'))
        self.stdout.write(f"Seeding {len(papers_data)} official papers from {path.name}...")

        past_cat, _ = Category.objects.get_or_create(
            slug='past-year-papers',
            defaults={
                'name': 'Past Year Papers',
                'description': 'Official Past Year Examination Papers and Mark Schemes',
                'display_order': 1,
                'is_free': True,
                'is_active': True,
            }
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

        count = 0
        for p in papers_data:
            # We strip the full GCS domain for FileField.name or store full URL
            pdf_path = p.get('pdfUrl', '')
            if 'storage.googleapis.com/mathib-vault-us/' in pdf_path:
                pdf_name = pdf_path.split('storage.googleapis.com/mathib-vault-us/')[-1]
            else:
                pdf_name = pdf_path

            ms_path = p.get('markschemeUrl', '') or ''
            if 'storage.googleapis.com/mathib-vault-us/' in ms_path:
                ms_name = ms_path.split('storage.googleapis.com/mathib-vault-us/')[-1]
            else:
                ms_name = ms_path

            thumb_path = p.get('thumbnailUrl', '') or ''
            if 'storage.googleapis.com/mathib-vault-us/' in thumb_path:
                thumb_name = thumb_path.split('storage.googleapis.com/mathib-vault-us/')[-1]
            else:
                thumb_name = thumb_path

            paper_obj, _ = Paper.objects.update_or_create(
                title=p['title'],
                defaults={
                    'category': past_cat,
                    'page_count': p.get('totalPages') or 16,
                    'is_active': True,
                    'is_free': True,
                }
            )
            if pdf_name:
                paper_obj.pdf_file.name = pdf_name
            if ms_name:
                paper_obj.markscheme_file.name = ms_name
            if thumb_name:
                paper_obj.thumbnail.name = thumb_name
            paper_obj.save()

            # Attach filters
            filters = []
            if p.get('curriculum'):
                filters.append(get_or_create_filter('curriculum', 'Curriculum', p['curriculum']))
            if p.get('year'):
                filters.append(get_or_create_filter('year', 'Year', str(p['year'])))
            if p.get('season'):
                filters.append(get_or_create_filter('season', 'Season', p['season']))
            if p.get('paperNumber'):
                filters.append(get_or_create_filter('paper', 'Paper Number', p['paperNumber']))
            if p.get('zone'):
                filters.append(get_or_create_filter('zone', 'Zone', p['zone']))

            paper_obj.filters.set([f for f in filters if f])
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} official papers!"))
