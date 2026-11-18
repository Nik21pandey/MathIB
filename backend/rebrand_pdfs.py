"""
rebrand_pdfs.py - Batch Rebranding & Watermarking Engine for MathIB PDFs.

Masks out legacy headers/footers (e.g., ILATE / www.ilate.in) on uploaded Past Papers,
Notes, and Worksheets, and stamps the MathIB header, curriculum pills, footer, and
diagonal watermark across every page.

Usage:
    python backend/rebrand_pdfs.py input.pdf output.pdf [--title "0580 Full Syllabus Practice"]
"""
import argparse
from pathlib import Path
import fitz  # PyMuPDF

BRAND_NAME = "MathIB"
BRAND_SUB = "IBDP  |  MYP  |  IGCSE  |  A-LEVEL"
BRAND_URL = "www.mathib.com"
BRAND_TAGLINE = "Learn  •  Practise  •  Excel"

def rebrand_pdf(input_path: str, output_path: str, custom_title: str = ""):
    doc = fitz.open(input_path)
    total_pages = len(doc)

    for page_idx, page in enumerate(doc, start=1):
        rect = page.rect
        w, h = rect.width, rect.height

        # 1. Mask old top-left header logo & bottom footer strip
        if page_idx == 1:
            # On page 1, only mask the top-left logo box (0..180, 0..52) and bottom footer
            page.draw_rect(fitz.Rect(0, 0, 210, 48), color=(1, 1, 1), fill=(1, 1, 1))
        else:
            # On pages 2+, mask the full running header (top 42pt)
            page.draw_rect(fitz.Rect(0, 0, w, 42), color=(1, 1, 1), fill=(1, 1, 1))

        # Mask bottom footer (bottom 36pt) on all pages
        page.draw_rect(fitz.Rect(0, h - 36, w, h), color=(1, 1, 1), fill=(1, 1, 1))

        # 2. Stamp New Top Header
        page.insert_text(
            fitz.Point(36, 24),
            BRAND_NAME,
            fontsize=15,
            fontname="helv",
            color=(0.11, 0.25, 0.69),  # Royal Blue
        )
        page.insert_text(
            fitz.Point(102, 23),
            BRAND_SUB,
            fontsize=8,
            fontname="helv",
            color=(0.35, 0.40, 0.48),
        )
        if page_idx > 1 and custom_title:
            page.insert_text(
                fitz.Point(w - 36 - len(custom_title) * 4.3, 23),
                custom_title,
                fontsize=8.5,
                fontname="helv",
                color=(0.35, 0.40, 0.48),
            )
            page.draw_line(fitz.Point(36, 32), fitz.Point(w - 36, 32), color=(0.85, 0.87, 0.90), width=0.6)

        # 3. Stamp New Bottom Footer
        page.draw_line(fitz.Point(36, h - 28), fitz.Point(w - 36, h - 28), color=(0.85, 0.87, 0.90), width=0.6)
        page.insert_text(fitz.Point(36, h - 14), BRAND_URL, fontsize=8.5, fontname="helv", color=(0.11, 0.25, 0.69))
        page.insert_text(fitz.Point(w / 2 - 45, h - 14), BRAND_TAGLINE, fontsize=8.5, fontname="helv", color=(0.45, 0.48, 0.54))
        page.insert_text(fitz.Point(w - 92, h - 14), f"Page {page_idx} of {total_pages}", fontsize=8.5, fontname="helv", color=(0.35, 0.40, 0.48))

        # 4. Subtle Diagonal Center Watermark
        page.insert_text(
            fitz.Point(w * 0.28, h * 0.55),
            f"{BRAND_NAME}  •  {BRAND_URL}",
            fontsize=32,
            fontname="helv",
            color=(0.93, 0.94, 0.96),
            rotate=45,
            overlay=False,
        )

    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    print(f"[Rebranded] Saved {total_pages}-page PDF -> {output_path}")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="Input PDF file")
    ap.add_argument("output", help="Output rebranded PDF file")
    ap.add_argument("--title", default="", help="Running header title for pages 2+")
    args = ap.parse_args()
    rebrand_pdf(args.input, args.output, args.title)
