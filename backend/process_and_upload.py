"""
MathIB Official Paper Processor & Google Cloud Storage Uploader
Extracts, cleans watermarks, slices individual exam papers, pairs them with official mark schemes,
uploads to GCS bucket mathib-vault-us, and exports official_papers.json for frontend & backend.
"""

import os
import sys
import re
import json
import base64
from pathlib import Path

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
import django
django.setup()

import pymupdf as fitz
from google.oauth2 import service_account
from google.cloud import storage
from django.utils.text import slugify

from apps.papers.models import Category, Paper
from apps.filters.models import FilterType, FilterOption
from apps.papers.sanitizer import DocumentSanitizer
from apps.papers.pdf_utils import extract_pdf_info

BUCKET_NAME = 'mathib-vault-us'
PROJECT_ID = 'mathib-production'
KEY_PATH = r'c:\Users\nikhi\Downloads\mathib-production-a1bc3b73dc9d.json'

print(f"Connecting to Google Cloud Storage: {BUCKET_NAME}...")
creds = service_account.Credentials.from_service_account_file(KEY_PATH)
gcs_client = storage.Client(credentials=creds, project=PROJECT_ID)
bucket = gcs_client.bucket(BUCKET_NAME)

sanitizer = DocumentSanitizer()

def upload_bytes_to_gcs(data: bytes, blob_path: str, content_type: str = 'application/pdf') -> str:
    blob = bucket.blob(blob_path)
    blob.upload_from_string(data, content_type=content_type)
    return f"https://storage.googleapis.com/{BUCKET_NAME}/{blob_path}"

# Ensure categories
past_paper_cat, _ = Category.objects.get_or_create(
    slug='past-year-papers',
    defaults={'name': 'Past Year Papers', 'description': 'Official Past Year Examination Papers', 'display_order': 1}
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

official_catalog = []

# =========================================================================
# 1. PROCESS 0607 MERGED PAPERS (2025 - 2026)
# =========================================================================
print("\n--- Processing Cambridge IGCSE International Mathematics (0607) ---")

def detect_qp_covers(doc):
    covers = []
    for i in range(len(doc)):
        text = doc[i].get_text('text')
        if ('Cambridge IGCSE' in text or 'Cambridge International' in text) and \
           ('You must answer on the question paper' in text or 'READ THESE INSTRUCTIONS FIRST' in text or 'INSTRUCTIONS' in text) and \
           ('minutes' in text or 'hour' in text):
            m_code = re.search(r'0607/(\d{2})', text)
            m_season = re.search(r'(February/March|May/June|October/November|March|June|November)\s*(20\d{2})', text, re.IGNORECASE)
            code = m_code.group(0) if m_code else '0607'
            season_str = f"{m_season.group(1)} {m_season.group(2)}" if m_season else '2025'
            year = int(m_season.group(2)) if m_season else 2025
            season_norm = 'May/June'
            if 'february' in season_str.lower() or 'march' in season_str.lower():
                season_norm = 'Feb/March'
            elif 'october' in season_str.lower() or 'november' in season_str.lower():
                season_norm = 'Oct/Nov'
            covers.append({
                'start_page': i,
                'code': code,
                'component': m_code.group(1) if m_code else '22',
                'season': season_norm,
                'year': year,
                'season_raw': season_str
            })
    for idx, c in enumerate(covers):
        c['end_page'] = covers[idx + 1]['start_page'] if idx + 1 < len(covers) else len(doc)
    return covers

def detect_ms_ranges(doc):
    ms_list = []
    last_key = None
    for i in range(len(doc)):
        text = doc[i].get_text('text')
        m_code = re.search(r'0607/(\d{2})', text)
        m_season = re.search(r'(February/March|May/June|October/November|March|June|November)\s*(20\d{2})', text, re.IGNORECASE)
        if m_code and m_season:
            key = f"{m_code.group(0)}_{m_season.group(1)}_{m_season.group(2)}"
            if key != last_key:
                season_norm = 'May/June'
                if 'february' in m_season.group(1).lower() or 'march' in m_season.group(1).lower():
                    season_norm = 'Feb/March'
                elif 'october' in m_season.group(1).lower() or 'november' in m_season.group(1).lower():
                    season_norm = 'Oct/Nov'
                ms_list.append({
                    'start_page': i,
                    'code': m_code.group(0),
                    'component': m_code.group(1),
                    'season': season_norm,
                    'year': int(m_season.group(2)),
                })
                last_key = key
    for idx, m in enumerate(ms_list):
        m['end_page'] = ms_list[idx + 1]['start_page'] if idx + 1 < len(ms_list) else len(doc)
    return ms_list

STAGING_DIR = Path(__file__).resolve().parent / 'ingestion_staging'

p4_ms_doc = fitz.open(str(STAGING_DIR / '2025 PAPER 4 MS_merged.pdf'))
p4_ms_ranges = detect_ms_ranges(p4_ms_doc)

p6_ms_doc = fitz.open(str(STAGING_DIR / '2025 PAPER 6 MS_merged.pdf'))
p6_ms_ranges = detect_ms_ranges(p6_ms_doc)

files_0607 = [
    (str(STAGING_DIR / '2025 PAPER 2 QP_merged.pdf'), 'Paper 2', None, None),
    (str(STAGING_DIR / '2025 PAPER 4 QP_merged.pdf'), 'Paper 4', p4_ms_doc, p4_ms_ranges),
    (str(STAGING_DIR / '2025 PAPER 6 QP_merged.pdf'), 'Paper 6', p6_ms_doc, p6_ms_ranges),
]

for qp_path, paper_label, ms_doc, ms_ranges in files_0607:
    qp_doc = fitz.open(qp_path)
    qp_covers = detect_qp_covers(qp_doc)
    print(f"Unpacking {len(qp_covers)} papers from {os.path.basename(qp_path)}...")

    for qp_info in qp_covers:
        sub_qp = fitz.open()
        sub_qp.insert_pdf(qp_doc, from_page=qp_info['start_page'], to_page=qp_info['end_page'] - 1)
        raw_qp = sub_qp.tobytes()
        sub_qp.close()

        cleaned_qp = sanitizer.sanitize(raw_qp, clean_watermarks=True)
        page_count, thumb_bytes = extract_pdf_info(cleaned_qp)

        # Match mark scheme
        cleaned_ms = None
        if ms_doc and ms_ranges:
            for ms_info in ms_ranges:
                if ms_info['component'] == qp_info['component'] and \
                   ms_info['season'] == qp_info['season'] and \
                   ms_info['year'] == qp_info['year']:
                    sub_ms = fitz.open()
                    sub_ms.insert_pdf(ms_doc, from_page=ms_info['start_page'], to_page=ms_info['end_page'] - 1)
                    raw_ms = sub_ms.tobytes()
                    sub_ms.close()
                    cleaned_ms = sanitizer.sanitize(raw_ms, clean_watermarks=True)
                    break

        title = f"{qp_info['code']} {paper_label} · {qp_info['season']} {qp_info['year']}"
        slug = f"0607_{qp_info['component']}_{qp_info['season'].replace('/', '_')}_{qp_info['year']}".lower()

        # Upload QP to GCS
        qp_blob_path = f"papers/0607/{qp_info['year']}/{slug}_qp.pdf"
        qp_url = upload_bytes_to_gcs(cleaned_qp, qp_blob_path)

        # Upload MS to GCS if available
        ms_url = None
        if cleaned_ms:
            ms_blob_path = f"markschemes/0607/{qp_info['year']}/{slug}_ms.pdf"
            ms_url = upload_bytes_to_gcs(cleaned_ms, ms_blob_path)

        # Upload Thumbnail to GCS
        thumb_url = None
        if thumb_bytes:
            thumb_blob_path = f"thumbnails/0607/{qp_info['year']}/{slug}_thumb.png"
            thumb_url = upload_bytes_to_gcs(thumb_bytes, thumb_blob_path, content_type='image/png')

        print(f"  + Uploaded: {title} ({page_count}p) -> {qp_url}")

        # Save to DB
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
        paper_obj.pdf_file.name = qp_blob_path
        if thumb_bytes:
            paper_obj.thumbnail.name = thumb_blob_path
        if ms_url:
            paper_obj.markscheme_file.name = ms_blob_path
        paper_obj.save()

        # Filters
        filters = [
            get_or_create_filter('curriculum', 'Curriculum', 'Cambridge IGCSE International Mathematics (0607)'),
            get_or_create_filter('year', 'Year', str(qp_info['year'])),
            get_or_create_filter('season', 'Season', qp_info['season']),
            get_or_create_filter('paper', 'Paper Number', paper_label),
            get_or_create_filter('zone', 'Zone', f"Variant {qp_info['component'][-1]}"),
        ]
        paper_obj.filters.set([f for f in filters if f])

        official_catalog.append({
            'id': paper_obj.id,
            'title': title,
            'curriculum': 'Cambridge IGCSE International Mathematics (0607)',
            'subject': 'International Mathematics',
            'paperNumber': paper_label,
            'year': qp_info['year'],
            'season': qp_info['season'],
            'zone': f"Variant {qp_info['component'][-1]}",
            'totalPages': page_count,
            'pdfUrl': qp_url,
            'markschemeUrl': ms_url,
            'thumbnailUrl': thumb_url,
        })

    qp_doc.close()

p4_ms_doc.close()
p6_ms_doc.close()

# =========================================================================
# 2. PROCESS 0580 COMPENDIUM (2022 - 2026)
# =========================================================================
print("\n--- Processing Cambridge IGCSE Mathematics (0580) Compendiums ---")

comp_qp_path = str(STAGING_DIR / 'ILATE_0580_Past_Papers_2022-2026_Question_Papers.pdf')
comp_ms_path = str(STAGING_DIR / 'ILATE_0580_Past_Papers_2022-2026_Mark_Schemes.pdf')

if os.path.exists(comp_qp_path) and os.path.exists(comp_ms_path):
    c_qp_doc = fitz.open(comp_qp_path)
    c_ms_doc = fitz.open(comp_ms_path)

    qp_toc = [t for t in c_qp_doc.get_toc() if t[1].lower() != 'contents']
    ms_toc = [t for t in c_ms_doc.get_toc() if t[1].lower() != 'contents']

    print(f"Found {len(qp_toc)} papers in 0580 QP compilation...")

    for idx, item in enumerate(qp_toc):
        title_raw = item[1].strip()
        start_page = item[2] - 1
        end_page = qp_toc[idx + 1][2] - 1 if idx + 1 < len(qp_toc) else len(c_qp_doc)

        clean_title = title_raw.replace(' · ', ' ').replace(' (calculator allowed, pre-2025 format)', '')

        # Slice QP
        sub_qp = fitz.open()
        sub_qp.insert_pdf(c_qp_doc, from_page=start_page, to_page=end_page - 1)
        raw_qp = sub_qp.tobytes()
        sub_qp.close()

        cleaned_qp = sanitizer.sanitize(raw_qp, clean_watermarks=True)
        page_count, thumb_bytes = extract_pdf_info(cleaned_qp)

        # Slice matching MS
        cleaned_ms = None
        if idx < len(ms_toc):
            ms_item = ms_toc[idx]
            ms_start = ms_item[2] - 1
            ms_end = ms_toc[idx + 1][2] - 1 if idx + 1 < len(ms_toc) else len(c_ms_doc)
            sub_ms = fitz.open()
            sub_ms.insert_pdf(c_ms_doc, from_page=ms_start, to_page=ms_end - 1)
            raw_ms = sub_ms.tobytes()
            sub_ms.close()
            cleaned_ms = sanitizer.sanitize(raw_ms, clean_watermarks=True)

        year_match = re.search(r'20\d{2}', clean_title)
        year_val = int(year_match.group(0)) if year_match else 2024

        season_val = 'May/June'
        if 'february' in clean_title.lower() or 'march' in clean_title.lower():
            season_val = 'Feb/March'
        elif 'october' in clean_title.lower() or 'november' in clean_title.lower():
            season_val = 'Oct/Nov'

        paper_num_match = re.search(r'Paper\s*(\d)', clean_title, re.IGNORECASE)
        paper_num = f"Paper {paper_num_match.group(1)}" if paper_num_match else "Paper 2"

        safe_slug = slugify(clean_title)[:60]

        # Upload QP
        qp_blob_path = f"papers/0580/{year_val}/{safe_slug}_qp.pdf"
        qp_url = upload_bytes_to_gcs(cleaned_qp, qp_blob_path)

        # Upload MS
        ms_url = None
        if cleaned_ms:
            ms_blob_path = f"markschemes/0580/{year_val}/{safe_slug}_ms.pdf"
            ms_url = upload_bytes_to_gcs(cleaned_ms, ms_blob_path)

        # Upload Thumbnail
        thumb_url = None
        if thumb_bytes:
            thumb_blob_path = f"thumbnails/0580/{year_val}/{safe_slug}_thumb.png"
            thumb_url = upload_bytes_to_gcs(thumb_bytes, thumb_blob_path, content_type='image/png')

        print(f"  [{idx + 1}/{len(qp_toc)}] + Uploaded: {clean_title} ({page_count}p)")

        # Save to DB
        paper_obj, _ = Paper.objects.update_or_create(
            title=clean_title,
            defaults={
                'category': past_paper_cat,
                'file_size': len(cleaned_qp),
                'page_count': page_count,
                'is_active': True,
                'is_free': True,
            }
        )
        paper_obj.pdf_file.name = qp_blob_path
        if thumb_bytes:
            paper_obj.thumbnail.name = thumb_blob_path
        if ms_url:
            paper_obj.markscheme_file.name = ms_blob_path
        paper_obj.save()

        # Filters
        filters = [
            get_or_create_filter('curriculum', 'Curriculum', 'Cambridge IGCSE Mathematics (0580)'),
            get_or_create_filter('year', 'Year', str(year_val)),
            get_or_create_filter('season', 'Season', season_val),
            get_or_create_filter('paper', 'Paper Number', paper_num),
        ]
        paper_obj.filters.set([f for f in filters if f])

        official_catalog.append({
            'id': paper_obj.id,
            'title': clean_title,
            'curriculum': 'Cambridge IGCSE Mathematics (0580)',
            'subject': 'Mathematics',
            'paperNumber': paper_num,
            'year': year_val,
            'season': season_val,
            'zone': 'Extended',
            'totalPages': page_count,
            'pdfUrl': qp_url,
            'markschemeUrl': ms_url,
            'thumbnailUrl': thumb_url,
        })

    c_qp_doc.close()
    c_ms_doc.close()

# =========================================================================
# 3. EXPORT OFFICIAL PAPERS JSON
# =========================================================================
out_backend = Path(__file__).resolve().parent / 'apps' / 'papers' / 'seed' / 'official_papers.json'
out_backend.parent.mkdir(parents=True, exist_ok=True)
out_backend.write_text(json.dumps(official_catalog, indent=2), encoding='utf-8')
print(f"\nSaved {len(official_catalog)} official papers to: {out_backend}")

out_frontend = Path(__file__).resolve().parent.parent / 'frontend' / 'src' / 'data' / 'official_papers.json'
out_frontend.parent.mkdir(parents=True, exist_ok=True)
out_frontend.write_text(json.dumps(official_catalog, indent=2), encoding='utf-8')
print(f"Saved {len(official_catalog)} official papers to: {out_frontend}")

print("\nIngestion, GCS Upload & Catalog Generation COMPLETE!")
