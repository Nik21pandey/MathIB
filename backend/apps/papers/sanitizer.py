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
    r'exam-mate(\.com)?',
    r'ilate(\.in)?',
    r'imagine\s*[•·]\s*inspire\s*[•·]\s*improve',
    r'\bdfd\b',
    r'studylib',
    r'scribd\.com',
    r'www\.[a-zA-Z0-9-]+\.(com|co\.uk|org|net|in|io|edu)',
    r'https?://[^\s]+',
]

LITERAL_PHRASES = [
    "save my exams",
    "papacambridge",
    "gce guide",
    "dynamic papers",
    "bestexamhelp",
    "physics and maths tutor",
    "revision village",
    "revision dojo",
    "exam-mate",
    "www.exam-mate.com",
    "ilate",
    "www.ilate.in",
    "imagine • inspire • improve",
    "smart ib",
]

TARGET_WORD_REGEX = re.compile(
    r'exam-mate|ilate|dfd|savemyexams|papacambridge|gceguide|bestexamhelp|revisionvillage|revisiondojo|smartib|www\.[a-zA-Z0-9-]+\.(com|in|org|net)',
    re.IGNORECASE
)


class DocumentSanitizer:
    """
    Sanitizes raw PDFs by removing external watermarks, headers, footers,
    and metadata stamps.
    """

    def __init__(self, strip_header_height: float = 38.0, strip_footer_height: float = 32.0):
        self.strip_header_height = strip_header_height
        self.strip_footer_height = strip_footer_height
        self.target_regex = TARGET_WORD_REGEX
        self.literal_phrases = LITERAL_PHRASES

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
                    # A. Word-level regex detection
                    words = page.get_text("words")
                    for w in words:
                        word_text = w[4]
                        if self.target_regex.search(word_text):
                            word_rect = fitz.Rect(w[0] - 1, w[1] - 1, w[2] + 1, w[3] + 1)
                            page.add_redact_annot(word_rect, fill=(1, 1, 1))

                    # B. Multi-word phrase search
                    for phrase in self.literal_phrases:
                        for inst in page.search_for(phrase):
                            page.add_redact_annot(inst, fill=(1, 1, 1))

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
