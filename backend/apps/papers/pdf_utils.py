"""
PDF processing utilities powered by PyMuPDF (fitz):
- Auto page count & Page-1 PNG thumbnail generation
- Subtle footer watermarking for paid downloads
- On-the-fly multi-PDF merging for bundles
"""

try:
    import pymupdf as fitz
except ImportError:
    import fitz


def read_file_field_bytes(file_field) -> bytes:
    """Storage-safe file reader (works on local disk, Supabase S3, and Cloudflare R2)."""
    with file_field.open('rb') as f:
        return f.read()


def extract_pdf_info(pdf_bytes: bytes):
    """Return (page_count, first_page_png_bytes) from raw PDF bytes."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        page_count = len(doc)
        thumb_bytes = None
        if page_count > 0:
            pix = doc[0].get_pixmap(matrix=fitz.Matrix(1.2, 1.2), alpha=False)
            thumb_bytes = pix.tobytes("png")
        return page_count, thumb_bytes
    finally:
        doc.close()


def apply_watermark(pdf_bytes: bytes, watermark_text: str) -> bytes:
    """Stamp a subtle grey footer watermark on every page."""
    if not watermark_text:
        return pdf_bytes
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        for page in doc:
            rect = page.rect
            footer_rect = fitz.Rect(24, rect.height - 24, rect.width - 24, rect.height - 8)
            page.insert_textbox(
                footer_rect,
                watermark_text,
                fontsize=8,
                color=(0.55, 0.55, 0.55),
                align=fitz.TEXT_ALIGN_CENTER,
                overlay=True,
            )
        return doc.tobytes(deflate=True)
    finally:
        doc.close()


def merge_pdf_bytes_list(pdf_bytes_list) -> bytes:
    """Merge multiple PDF byte payloads into a single PDF document."""
    merged = fitz.open()
    try:
        for raw in pdf_bytes_list:
            src = fitz.open(stream=raw, filetype="pdf")
            try:
                merged.insert_pdf(src)
            finally:
                src.close()
        return merged.tobytes(deflate=True)
    finally:
        merged.close()