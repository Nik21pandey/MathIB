"""
MathIB Document Sanitizer Engine
Powered by PyMuPDF (fitz)

Purges third-party watermarks, headers, footers, website URLs, and metadata
from exam papers, worksheets, and books while preserving mathematical diagrams,
equations, formulas, and native layout.
"""

import re
try:
    import pymupdf as fitz
except ImportError:
    import fitz


# Known third-party exam repository signatures to purge
KNOWN_WATERMARK_PATTERNS = [
    r'save\s*my\s*exams',
    r'papacambridge',
    r'gce\s*guide',
    r'dynamic\s*papers',
    r'bestexamhelp',
    r'physics\s*and\s*maths\s*tutor',
    r'pmt\.physicsandmathstutor\.com',
    r'revision\s*village',
    r'revision\s*dojo',
    r'pastpapers\.co',
    r'smart\s*ib',
    r'ciepastpapers',
    r'maxpapers',
    r'xtremepapers',
    r'exam-mate',
    r'studylib',
    r'scribd\.com',
    r'www\.[a-zA-Z0-9-]+\.(com|co\.uk|org|net)',
    r'https?://[^\s]+',
]

URL_REGEX = re.compile(r'https?://[^\s]+|www\.[^\s]+', re.IGNORECASE)


class DocumentSanitizer:
    """
    Sanitizes raw PDFs by removing external watermarks, headers, footers,
    and metadata stamps.
    """

    def __init__(self, strip_header_height: float = 38.0, strip_footer_height: float = 32.0):
        self.strip_header_height = strip_header_height
        self.strip_footer_height = strip_footer_height
        self.compiled_patterns = [re.compile(p, re.IGNORECASE) for p in KNOWN_WATERMARK_PATTERNS]

    def sanitize(self, input_pdf_bytes: bytes, clean_watermarks: bool = True, add_mathib_branding: bool = False) -> bytes:
        """
        Sanitizes a PDF in-memory and returns cleaned bytes.
        """
        doc = fitz.open(stream=input_pdf_bytes, filetype="pdf")
        try:
            for page in doc:
                rect = page.rect
                page_width = rect.width
                page_height = rect.height

                # 1. Redact known third-party text patterns anywhere on the page
                if clean_watermarks:
                    for pattern in self.compiled_patterns:
                        text_instances = page.search_for(pattern.pattern)
                        for inst in text_instances:
                            # Add redaction annotation (white fill by default)
                            page.add_redact_annot(inst, fill=(1, 1, 1))

                    # 2. Check top header zone for external website stamps (first page and continuation pages)
                    # We check text in header zone (0 to strip_header_height)
                    header_rect = fitz.Rect(0, 0, page_width, self.strip_header_height)
                    header_text = page.get_text("text", clip=header_rect).lower()
                    if any(p.search(header_text) for p in self.compiled_patterns) or URL_REGEX.search(header_text):
                        page.add_redact_annot(header_rect, fill=(1, 1, 1))

                    # 3. Check bottom footer zone for scraper stamps
                    footer_rect = fitz.Rect(0, page_height - self.strip_footer_height, page_width, page_height)
                    footer_text = page.get_text("text", clip=footer_rect).lower()
                    if any(p.search(footer_text) for p in self.compiled_patterns) or URL_REGEX.search(footer_text):
                        page.add_redact_annot(footer_rect, fill=(1, 1, 1))

                    # Apply all staged redactions cleanly
                    page.apply_redactions()

                # 4. Optional subtle MathIB footer stamp
                if add_mathib_branding:
                    branding_rect = fitz.Rect(20, page_height - 18, page_width - 20, page_height - 6)
                    page.insert_textbox(
                        branding_rect,
                        "MathIB  |  Official IB & International Mathematics Platform  |  mathib.com",
                        fontsize=7,
                        color=(0.55, 0.55, 0.60),
                        align=fitz.TEXT_ALIGN_CENTER,
                        overlay=True,
                    )

            # 5. Sanitize document metadata
            doc.set_metadata({
                "title": "MathIB Exam Resource",
                "author": "MathIB Academic Team",
                "subject": "Mathematics Preparation",
                "keywords": "MathIB, IBDP, IGCSE, MYP, A-Level",
                "creator": "MathIB Engine",
                "producer": "MathIB Document Pipeline",
            })

            return doc.tobytes(deflate=True, garbage=4, clean=True)
        finally:
            doc.close()
