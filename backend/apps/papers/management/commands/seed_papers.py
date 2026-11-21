"""
Management command: seed_papers
Ensures that MathIB always has a rich initial library of past examination papers
and mark schemes across Cambridge, IB DP, and Pearson Edexcel.
"""

import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify

try:
    import pymupdf as fitz
except ImportError:
    import fitz

from apps.papers.models import Category, Paper, Bundle
from apps.filters.models import FilterType, FilterOption
from apps.papers.pdf_engine import ExamPDFEngine


class Command(BaseCommand):
    help = 'Seeds core past examination papers and mark schemes across Cambridge, IB DP, and Pearson Edexcel'

    def handle(self, *args, **options):
        self.stdout.write("Checking past paper library...")

        past_cat, _ = Category.objects.get_or_create(
            slug='past-year-papers',
            defaults={
                'name': 'Past Year Papers',
                'description': 'Official Past Year Examination Papers and Mark Schemes',
                'icon': 'DocumentText',
                'is_main': True,
                'is_free': True,
                'is_downloadable': True,
                'display_order': 1
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

        def generate_sample_pdf(title, curriculum="Cambridge IGCSE", code="0580/22", season="May/June 2024", is_markscheme=False):
            pdf_bytes = ExamPDFEngine.generate_exam_booklet(
                title=title,
                board=curriculum,
                code=code,
                season=season,
                duration="2 hours",
                marks=70,
                is_markscheme=is_markscheme
            )
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            pix = doc[0].get_pixmap(dpi=150)
            thumb_bytes = pix.tobytes("png")
            doc.close()
            return pdf_bytes, thumb_bytes

        core_papers = [
            # Cambridge IGCSE 0580
            {
                'title': '0580/22 Paper 2 (Extended) Non-Calculator · May/June 2024',
                'curriculum': 'Cambridge IGCSE Mathematics (0580)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 2', 'zone': 'TZ2',
            },
            {
                'title': '0580/42 Paper 4 (Extended) Calculator · May/June 2024',
                'curriculum': 'Cambridge IGCSE Mathematics (0580)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 4', 'zone': 'TZ2',
            },
            {
                'title': '0580/22 Paper 2 (Extended) Non-Calculator · Feb/March 2024',
                'curriculum': 'Cambridge IGCSE Mathematics (0580)',
                'year': '2024', 'season': 'Feb/March', 'paper': 'Paper 2', 'zone': 'TZ2',
            },
            # Cambridge IGCSE 0607
            {
                'title': '0607/22 Paper 2 (Extended) Non-Calculator · May/June 2024',
                'curriculum': 'Cambridge IGCSE International Mathematics (0607)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 2', 'zone': 'TZ2',
            },
            {
                'title': '0607/42 Paper 4 (Extended) Calculator · May/June 2024',
                'curriculum': 'Cambridge IGCSE International Mathematics (0607)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 4', 'zone': 'TZ2',
            },
            # Cambridge IGCSE 0606
            {
                'title': '0606/12 Paper 1 Additional Mathematics · May/June 2024',
                'curriculum': 'Cambridge IGCSE Additional Mathematics (0606)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 1', 'zone': 'TZ2',
            },
            # Cambridge A Level 9709
            {
                'title': '9709/12 Pure Mathematics 1 · May/June 2024',
                'curriculum': 'Cambridge International A Level Mathematics (9709)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 1', 'zone': 'TZ2',
            },
            {
                'title': '9709/32 Pure Mathematics 3 · May/June 2024',
                'curriculum': 'Cambridge International A Level Mathematics (9709)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 3', 'zone': 'TZ2',
            },
            # IB DP AA HL
            {
                'title': 'IB DP Math AA HL Paper 1 TZ1 · May 2024',
                'curriculum': 'IB DP Mathematics: Analysis and Approaches HL',
                'year': '2024', 'season': 'May', 'paper': 'Paper 1', 'zone': 'TZ1',
            },
            {
                'title': 'IB DP Math AA HL Paper 2 TZ1 · May 2024',
                'curriculum': 'IB DP Mathematics: Analysis and Approaches HL',
                'year': '2024', 'season': 'May', 'paper': 'Paper 2', 'zone': 'TZ1',
            },
            # IB DP AA SL
            {
                'title': 'IB DP Math AA SL Paper 1 TZ2 · May 2024',
                'curriculum': 'IB DP Mathematics: Analysis and Approaches SL',
                'year': '2024', 'season': 'May', 'paper': 'Paper 1', 'zone': 'TZ2',
            },
            # IB DP AI HL & SL
            {
                'title': 'IB DP Math AI HL Paper 1 TZ1 · May 2024',
                'curriculum': 'IB DP Mathematics: Applications and Interpretation HL',
                'year': '2024', 'season': 'May', 'paper': 'Paper 1', 'zone': 'TZ1',
            },
            {
                'title': 'IB DP Math AI SL Paper 1 TZ1 · May 2024',
                'curriculum': 'IB DP Mathematics: Applications and Interpretation SL',
                'year': '2024', 'season': 'May', 'paper': 'Paper 1', 'zone': 'TZ1',
            },
            # Pearson Edexcel IGCSE 4MA1
            {
                'title': 'Edexcel IGCSE 4MA1 Paper 1H (Higher Tier) · June 2024',
                'curriculum': 'Pearson Edexcel International GCSE Mathematics A (4MA1)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 1H', 'zone': 'Higher',
            },
            {
                'title': 'Edexcel IGCSE 4MA1 Paper 2H (Higher Tier) · June 2024',
                'curriculum': 'Pearson Edexcel International GCSE Mathematics A (4MA1)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 2H', 'zone': 'Higher',
            },
            # Pearson Edexcel GCSE 1MA1
            {
                'title': 'Edexcel GCSE 1MA1 Paper 1 (Non-Calculator) Higher Tier · June 2024',
                'curriculum': 'Pearson Edexcel GCSE Mathematics (1MA1)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 1', 'zone': 'Higher',
            },
            {
                'title': 'Edexcel GCSE 1MA1 Paper 2 (Calculator) Higher Tier · June 2024',
                'curriculum': 'Pearson Edexcel GCSE Mathematics (1MA1)',
                'year': '2024', 'season': 'May/June', 'paper': 'Paper 2', 'zone': 'Higher',
            },
        ]

        created_count = 0
        for item in core_papers:
            clean_title = item['title']
            safe_slug = slugify(clean_title)[:60]

            paper_obj, created = Paper.objects.update_or_create(
                title=clean_title,
                defaults={
                    'category': past_cat,
                    'page_count': 12,
                    'is_active': True,
                    'is_free': True,
                }
            )

            # Generate high-quality Question Paper & Mark Scheme
            qp_bytes, thumb_bytes = generate_sample_pdf(
                title=clean_title,
                curriculum=item.get('curriculum', 'Cambridge IGCSE'),
                code=item.get('paper', 'Paper 1'),
                season=item.get('season', 'May/June 2024'),
                is_markscheme=False
            )
            ms_bytes, _ = generate_sample_pdf(
                title=clean_title,
                curriculum=item.get('curriculum', 'Cambridge IGCSE'),
                code=item.get('paper', 'Paper 1'),
                season=item.get('season', 'May/June 2024'),
                is_markscheme=True
            )

            paper_obj.pdf_file.save(f"{safe_slug}.pdf", ContentFile(qp_bytes), save=False)
            paper_obj.markscheme_file.save(f"{safe_slug}_ms.pdf", ContentFile(ms_bytes), save=False)
            if thumb_bytes:
                paper_obj.thumbnail.save(f"{safe_slug}_thumb.png", ContentFile(thumb_bytes), save=False)

            paper_obj.file_size = len(qp_bytes)
            paper_obj.save()

            filters = [
                get_or_create_filter('curriculum', 'Curriculum', item['curriculum']),
                get_or_create_filter('year', 'Year', item['year']),
                get_or_create_filter('season', 'Season', item['season']),
                get_or_create_filter('paper', 'Paper Number', item['paper']),
            ]
            if item.get('zone'):
                filters.append(get_or_create_filter('zone', 'Zone / Timezone', item['zone']))

            paper_obj.filters.set([f for f in filters if f])
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} past examination papers with Question Papers & Mark Schemes!"))
