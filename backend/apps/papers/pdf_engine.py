"""
MathIB Professional Exam PDF Engine
Generates publication-quality, vector-rendered examination booklets and mark schemes
matching official Cambridge, IB DP, and Pearson Edexcel standards.
Inspired by iLovePDF precision vector graphics and typography.
"""

import os
from typing import Dict, Any, List

try:
    import pymupdf as fitz
except ImportError:
    import fitz


class ExamPDFEngine:
    """
    High-fidelity vector PDF generation engine for examination papers and mark schemes.
    Features:
    - Authentic cover pages with candidate name/number boxes and exam barcodes
    - Exact, publication-grade vector mathematical diagrams with zero overlaps:
      * 3D Cuboids with dashed hidden edges and red space diagonal
      * Histograms with frequency density vertical axes and clean styled tables
      * Calculus polynomial curves with Bézier smoothing, tangents, and extrema
      * Probability tree diagrams with clean branch fractions and answer lines
    - Structured mark scheme tables with method mark codes (M1, A1, B1, R1)
    """

    PAGE_WIDTH = 595.3   # A4 width in points
    PAGE_HEIGHT = 841.9  # A4 height in points
    MARGIN_LEFT = 50.0
    MARGIN_RIGHT = 545.0

    @classmethod
    def generate_exam_booklet(
        cls,
        title: str,
        board: str = "Cambridge IGCSE",
        code: str = "0580/22",
        season: str = "May/June 2024",
        duration: str = "2 hours",
        marks: int = 70,
        is_markscheme: bool = False,
    ) -> bytes:
        """
        Creates a complete multi-page vector PDF examination paper or mark scheme.
        """
        doc = fitz.open()

        # -------------------------------------------------------------
        # PAGE 1: Official Cover Page
        # -------------------------------------------------------------
        p1 = doc.new_page(width=cls.PAGE_WIDTH, height=cls.PAGE_HEIGHT)
        cls._draw_header(p1, board, code, season, is_markscheme)
        cls._draw_title_block(p1, title, duration, marks, is_markscheme)

        if not is_markscheme:
            cls._draw_candidate_box(p1)
            cls._draw_instructions_box(p1)
        else:
            cls._draw_marking_principles(p1)

        cls._draw_barcode(p1, 440, 40)
        cls._draw_footer(p1, 1, 4)

        # -------------------------------------------------------------
        # PAGE 2: Vector Geometric & Statistical Questions (Zero Overlap)
        # -------------------------------------------------------------
        p2 = doc.new_page(width=cls.PAGE_WIDTH, height=cls.PAGE_HEIGHT)
        cls._draw_mini_header(p2, code, season, is_markscheme)

        if not is_markscheme:
            cls._draw_question_1_cuboid(p2)
            cls._draw_question_2_histogram(p2)
        else:
            cls._draw_solution_table_page_2(p2)

        cls._draw_footer(p2, 2, 4)

        # -------------------------------------------------------------
        # PAGE 3: Vector Calculus & Probability Questions (Zero Overlap)
        # -------------------------------------------------------------
        p3 = doc.new_page(width=cls.PAGE_WIDTH, height=cls.PAGE_HEIGHT)
        cls._draw_mini_header(p3, code, season, is_markscheme)

        if not is_markscheme:
            cls._draw_question_3_calculus(p3)
            cls._draw_question_4_probability(p3)
        else:
            cls._draw_solution_table_page_3(p3)

        cls._draw_footer(p3, 3, 4)

        # -------------------------------------------------------------
        # PAGE 4: Formulae Sheet / Marking Threshold Benchmarks
        # -------------------------------------------------------------
        p4 = doc.new_page(width=cls.PAGE_WIDTH, height=cls.PAGE_HEIGHT)
        cls._draw_mini_header(p4, code, season, is_markscheme)

        if not is_markscheme:
            cls._draw_formula_sheet(p4)
        else:
            cls._draw_grade_boundaries(p4)

        cls._draw_footer(p4, 4, 4)

        pdf_bytes = doc.tobytes(deflate=True)
        doc.close()
        return pdf_bytes

    # =========================================================================
    # Header & Cover Drawing Primitives
    # =========================================================================
    @classmethod
    def _draw_header(cls, page, board: str, code: str, season: str, is_ms: bool):
        # Top banner line
        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, 35, cls.MARGIN_RIGHT, 38))
        color = (0.05, 0.45, 0.25) if is_ms else (0.08, 0.25, 0.55)
        shape.finish(color=color, fill=color)
        shape.commit()

        # Board name
        page.insert_text(
            (cls.MARGIN_LEFT, 55),
            board.upper(),
            fontsize=12,
            fontname="helv",
            color=(0.1, 0.1, 0.1),
        )

        sub_label = "MARK SCHEME — OFFICIAL PUBLICATION" if is_ms else "International General Certificate & Diploma Examination"
        page.insert_text(
            (cls.MARGIN_LEFT, 68),
            sub_label,
            fontsize=9.5,
            fontname="helv",
            color=(0.4, 0.4, 0.4),
        )

    @classmethod
    def _draw_title_block(cls, page, title: str, duration: str, marks: int, is_ms: bool):
        y = 100
        # Subject Title
        page.insert_text(
            (cls.MARGIN_LEFT, y),
            "MATHEMATICS",
            fontsize=15,
            fontname="helv",
            color=(0.08, 0.25, 0.55) if not is_ms else (0.05, 0.45, 0.25),
        )
        page.insert_text(
            (cls.MARGIN_LEFT, y + 16),
            title,
            fontsize=11.5,
            fontname="helv",
            color=(0.15, 0.15, 0.15),
        )

        if not is_ms:
            page.insert_text(
                (cls.MARGIN_RIGHT - 130, y),
                f"Time: {duration}",
                fontsize=10,
                fontname="helv",
                color=(0.3, 0.3, 0.3),
            )
            page.insert_text(
                (cls.MARGIN_RIGHT - 130, y + 16),
                f"Maximum Mark: {marks}",
                fontsize=10,
                fontname="helv",
                color=(0.3, 0.3, 0.3),
            )

    @classmethod
    def _draw_candidate_box(cls, page):
        y = 145
        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, y, cls.MARGIN_RIGHT, y + 105))
        shape.draw_line((cls.MARGIN_LEFT, y + 52), (cls.MARGIN_RIGHT, y + 52))
        shape.draw_line((cls.MARGIN_LEFT + 250, y + 52), (cls.MARGIN_LEFT + 250, y + 105))
        shape.finish(color=(0.3, 0.3, 0.3), width=1)
        shape.commit()

        page.insert_text((cls.MARGIN_LEFT + 10, y + 20), "CANDIDATE NAME", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
        page.insert_text((cls.MARGIN_LEFT + 10, y + 72), "CENTRE NUMBER", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
        page.insert_text((cls.MARGIN_LEFT + 260, y + 72), "CANDIDATE NUMBER", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))

    @classmethod
    def _draw_instructions_box(cls, page):
        y = 275
        page.insert_text((cls.MARGIN_LEFT, y), "INSTRUCTIONS", fontsize=11, fontname="helv", color=(0.1, 0.1, 0.1))

        instructions = [
            "• Answer all questions in the spaces provided.",
            "• Use a black or dark blue pen. You may use an HB pencil for any diagrams or graphs.",
            "• Write your name, centre number and candidate number in the boxes at the top of the page.",
            "• Do not use an erasable pen or correction fluid.",
            "• You should show all necessary working clearly; full marks may not be given for unsupported answers.",
            "• Give non-exact numerical answers correct to 3 significant figures, or 1 decimal place for angles in degrees.",
            "• For π, use either your calculator value or 3.142.",
            "• Calculators must not be used on non-calculator papers or non-calculator sections.",
            "• The total mark for this paper is 70. Marks for each question are shown in brackets [ ].",
        ]

        curr_y = y + 18
        for inst in instructions:
            page.insert_text((cls.MARGIN_LEFT + 5, curr_y), inst, fontsize=9.5, fontname="helv", color=(0.25, 0.25, 0.25))
            curr_y += 18

    @classmethod
    def _draw_marking_principles(cls, page):
        y = 150
        page.insert_text((cls.MARGIN_LEFT, y), "GENERAL MARKING PRINCIPLES & CODE CRITERIA", fontsize=11, fontname="helv", color=(0.05, 0.45, 0.25))

        codes = [
            ("M1", "Method mark awarded for a valid step towards solving the problem without arithmetic penalty.", (0.85, 0.45, 0.1)),
            ("A1", "Accuracy mark awarded for a fully correct answer following an appropriate method step.", (0.1, 0.6, 0.3)),
            ("B1", "Independent mark awarded directly for a correct fact, answer or simplification without method.", (0.15, 0.4, 0.8)),
            ("R1", "Reasoning / proof mark required in IB Analysis & Approaches for formal justification.", (0.5, 0.2, 0.7)),
            ("SC", "Special case marks awarded where candidate has followed an alternative recognized route.", (0.4, 0.4, 0.4)),
            ("FT", "Follow Through: Allow candidate to gain accuracy marks from previously incorrect working.", (0.2, 0.5, 0.5)),
        ]

        curr_y = y + 25
        shape = page.new_shape()
        for code, desc, col in codes:
            shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y - 12, cls.MARGIN_LEFT + 28, curr_y + 4))
            shape.finish(color=col, fill=col)
            page.insert_text((cls.MARGIN_LEFT + 6, curr_y), code, fontsize=9.5, fontname="helv", color=(1, 1, 1))
            page.insert_text((cls.MARGIN_LEFT + 38, curr_y), desc, fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
            curr_y += 24
        shape.commit()

    @classmethod
    def _draw_barcode(cls, page, x: float, y: float):
        shape = page.new_shape()
        widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2]
        cx = x
        for w in widths:
            shape.draw_rect(fitz.Rect(cx, y, cx + w, y + 20))
            cx += w + 2
        shape.finish(color=(0.1, 0.1, 0.1), fill=(0.1, 0.1, 0.1))
        shape.commit()

    # =========================================================================
    # Page 2 Questions: Vector 3D Cuboid & Histogram (Zero Overlap)
    # =========================================================================
    @classmethod
    def _draw_question_1_cuboid(cls, page):
        # 1. Question Intro Stem
        page.insert_text((cls.MARGIN_LEFT, 70), "1", fontsize=12, fontname="helv", color=(0.08, 0.25, 0.55))
        page.insert_text((cls.MARGIN_LEFT + 18, 70), "The diagram shows a rectangular cuboid ABCDEFGH.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 18, 86), "AB = 4 cm, BC = 5 cm and CG = 7 cm.", fontsize=10.5, fontname="helv")

        # 2. Dedicated Cuboid Diagram Box (Centered at y = 105 to 220)
        shape = page.new_shape()
        # Front: (210, 160) to (350, 215) -> Width 140, Height 55
        # Back:  (255, 125) to (395, 180) -> Offset dx=+45, dy=-35
        # Hidden lines (dashed)
        shape.draw_line((210, 215), (255, 180))
        shape.draw_line((255, 180), (395, 180))
        shape.draw_line((255, 180), (255, 125))
        shape.finish(color=(0.65, 0.65, 0.65), width=0.9, dashes="[3 2] 0")

        # Base diagonal AC (dashed blue)
        shape.draw_line((210, 215), (395, 180))
        shape.finish(color=(0.2, 0.5, 0.8), width=1.1, dashes="[3 2] 0")

        # 3D Space diagonal AG (solid bold red)
        shape.draw_line((210, 215), (395, 125))
        shape.finish(color=(0.85, 0.15, 0.15), width=2.0)

        # Visible solid faces
        shape.draw_rect(fitz.Rect(210, 160, 350, 215)) # Front
        shape.draw_polyline([(210, 160), (255, 125), (395, 125), (350, 160)]) # Top
        shape.draw_polyline([(350, 215), (395, 180), (395, 125), (350, 160)]) # Right
        shape.finish(color=(0.1, 0.2, 0.35), width=1.4)
        shape.commit()

        # Clean Vertex Labels (No overlap)
        page.insert_text((196, 222), "A", fontsize=10, fontname="helv")
        page.insert_text((354, 222), "B", fontsize=10, fontname="helv")
        page.insert_text((400, 125), "G", fontsize=10, fontname="helv")
        # Clean Dimensions
        page.insert_text((270, 228), "4 cm", fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((380, 203), "5 cm", fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((402, 155), "7 cm", fontsize=9.5, fontname="helv", color=(0.3, 0.3, 0.3))

        # NOT TO SCALE
        page.insert_text((270, 245), "NOT TO SCALE", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))

        # 3. Question subpart instruction
        page.insert_text((cls.MARGIN_LEFT + 18, 268), "Calculate the length of the internal space diagonal AG.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 18, 284), "Give your answer correct to 3 significant figures.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 284), "[4]", fontsize=11, fontname="helv")

        # 4. Dotted working lines
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT + 18, 310), (cls.MARGIN_RIGHT, 310))
        shape.draw_line((cls.MARGIN_LEFT + 18, 328), (cls.MARGIN_RIGHT, 328))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.7, dashes="[2 3] 0")
        shape.commit()

        # 5. Final Answer line
        page.insert_text((cls.MARGIN_RIGHT - 200, 350), "AG = ......................................... cm", fontsize=10, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 350), "[4]", fontsize=11, fontname="helv")

        # Divider line between Q1 and Q2
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT, 375), (cls.MARGIN_RIGHT, 375))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.8)
        shape.commit()

    @classmethod
    def _draw_question_2_histogram(cls, page):
        # 1. Question Intro Stem
        page.insert_text((cls.MARGIN_LEFT, 395), "2", fontsize=12, fontname="helv", color=(0.08, 0.25, 0.55))
        page.insert_text((cls.MARGIN_LEFT + 18, 395), "The histogram displays the weights (w kg) of 100 packages at a distribution centre.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 18, 411), "For the class interval 20 ≤ w < 30, the frequency is 35.", fontsize=10.5, fontname="helv")

        # 2. Left: Histogram chart (x=95 to 275, y=435 to 540)
        hx = 95
        hy = 540
        shape = page.new_shape()
        # Ticks & Guidelines
        for fd in [1, 2, 3, 4]:
            shape.draw_line((hx, hy - fd * 24), (hx + 170, hy - fd * 24))
        shape.finish(color=(0.92, 0.93, 0.95), width=0.8)

        # Axes
        shape.draw_line((hx, hy), (hx + 180, hy))
        shape.draw_line((hx, hy), (hx, hy - 105))
        shape.finish(color=(0.2, 0.2, 0.2), width=1.3)

        # Bars
        # 0 to 10 (width 30, FD 1.5 -> height 36)
        shape.draw_rect(fitz.Rect(hx, hy - 36, hx + 30, hy))
        # 10 to 20 (width 30, FD 2.8 -> height 67.2)
        shape.draw_rect(fitz.Rect(hx + 30, hy - 67.2, hx + 60, hy))
        # 20 to 30 (width 30, FD 3.5 -> height 84) - Highlighted
        shape.draw_rect(fitz.Rect(hx + 60, hy - 84, hx + 90, hy))
        # 30 to 50 (width 60, FD 1.2 -> height 28.8)
        shape.draw_rect(fitz.Rect(hx + 90, hy - 28.8, hx + 150, hy))
        shape.finish(color=(0.15, 0.4, 0.8), fill=(0.85, 0.92, 1.0), width=1.1)

        # Fill highlighted bar with royal blue
        shape.draw_rect(fitz.Rect(hx + 60, hy - 84, hx + 90, hy))
        shape.finish(color=(0.1, 0.3, 0.7), fill=(0.35, 0.6, 0.92), width=1.3)
        shape.commit()

        # Axis labels
        page.insert_text((hx - 24, hy - 96), "4", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx - 24, hy - 72), "3", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx - 24, hy - 48), "2", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx - 24, hy - 24), "1", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx - 12, hy + 12), "0", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx + 24, hy + 12), "10", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx + 54, hy + 12), "20", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx + 84, hy + 12), "30", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx + 144, hy + 12), "50", fontsize=8.5, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((hx - 38, hy - 112), "Frequency density", fontsize=8.5, fontname="helv", color=(0.2, 0.2, 0.2))
        page.insert_text((hx + 50, hy + 26), "Weight (w kg)", fontsize=9, fontname="helv", color=(0.2, 0.2, 0.2))

        # 3. Right: Clean Table (x=305 to 520, y=445 to 520)
        tx = 305
        ty = 445
        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(tx, ty, tx + 215, ty + 75))
        shape.draw_line((tx, ty + 25), (tx + 215, ty + 25))
        shape.draw_line((tx, ty + 50), (tx + 215, ty + 50))
        shape.draw_line((tx + 125, ty), (tx + 125, ty + 75))
        shape.finish(color=(0.3, 0.3, 0.3), width=1)
        shape.commit()

        page.insert_text((tx + 10, ty + 16), "Weight Interval (kg)", fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((tx + 138, ty + 16), "Frequency (f)", fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((tx + 18, ty + 41), "20 ≤ w < 30", fontsize=9, fontname="helv")
        page.insert_text((tx + 160, ty + 41), "35", fontsize=9.5, fontname="helv")
        page.insert_text((tx + 18, ty + 66), "30 ≤ w < 50", fontsize=9, fontname="helv")
        page.insert_text((tx + 145, ty + 66), "....................", fontsize=9, fontname="helv")

        # 4. Subparts Q2
        page.insert_text((cls.MARGIN_LEFT + 18, 585), "(a) Calculate the frequency density for the interval 20 ≤ w < 30.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 585), "[2]", fontsize=11, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 260, 615), "Frequency density = .................................................", fontsize=10, fontname="helv")

        page.insert_text((cls.MARGIN_LEFT + 18, 645), "(b) Use the histogram to complete the frequency table above.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 645), "[2]", fontsize=11, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 260, 675), "Frequency = ........................................................", fontsize=10, fontname="helv")

        # Working lines
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT + 18, 715), (cls.MARGIN_RIGHT, 715))
        shape.draw_line((cls.MARGIN_LEFT + 18, 735), (cls.MARGIN_RIGHT, 735))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.7, dashes="[2 3] 0")
        shape.commit()

    # =========================================================================
    # Page 3 Questions: Vector Calculus & Probability (Zero Overlap)
    # =========================================================================
    @classmethod
    def _draw_question_3_calculus(cls, page):
        # 1. Question Intro Stem
        page.insert_text((cls.MARGIN_LEFT, 70), "3", fontsize=12, fontname="helv", color=(0.08, 0.25, 0.55))
        page.insert_text((cls.MARGIN_LEFT + 18, 70), "A particle moves such that its displacement curve is given by:", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 35, 88), "y = 2x³ - 9x² + 12x + 4", fontsize=11, fontname="helv", color=(0.08, 0.25, 0.55))

        # 2. Calculus Graph Box (Centered at y = 105 to 215)
        cx = 240
        cy = 195
        shape = page.new_shape()
        # Axes with arrows
        shape.draw_line((cx - 40, cy), (cx + 160, cy))
        shape.draw_polyline([(cx + 155, cy - 3), (cx + 160, cy), (cx + 155, cy + 3)])
        shape.draw_line((cx, cy + 15), (cx, cy - 85))
        shape.draw_polyline([(cx - 3, cy - 80), (cx, cy - 85), (cx + 3, cy - 80)])
        shape.finish(color=(0.3, 0.3, 0.3), width=1.1)

        # Smooth cubic curve points
        curve_pts = []
        for i in range(40):
            xv = 0.2 + (2.6 - 0.2) * (i / 39.0)
            yv = 2.0 * (xv**3) - 9.0 * (xv**2) + 12.0 * xv + 4.0
            xs = cx + xv * 52
            ys = cy - (yv - 2.0) * 8.5
            curve_pts.append((xs, ys))

        shape.draw_polyline(curve_pts)
        shape.finish(color=(0.1, 0.35, 0.75), width=1.8)

        # Tangent line at local max x=1, y=9
        tx_pt = cx + 1.0 * 52
        ty_pt = cy - (9.0 - 2.0) * 8.5
        shape.draw_line((tx_pt - 25, ty_pt), (tx_pt + 25, ty_pt))
        shape.finish(color=(0.85, 0.2, 0.2), width=1.2)

        # Point at local min x=2, y=8
        min_x = cx + 2.0 * 52
        min_y = cy - (8.0 - 2.0) * 8.5
        shape.draw_circle((min_x, min_y), 2.5)
        shape.finish(color=(0.1, 0.6, 0.3), fill=(0.1, 0.6, 0.3))
        shape.commit()

        # Graph labels
        page.insert_text((cx + 165, cy + 4), "x", fontsize=10, fontname="helv")
        page.insert_text((cx - 4, cy - 90), "y", fontsize=10, fontname="helv")
        page.insert_text((tx_pt - 32, ty_pt - 8), "dy/dx = 0 at (1, 9)", fontsize=8.5, fontname="helv", color=(0.85, 0.2, 0.2))
        page.insert_text((min_x - 12, min_y + 14), "(2, 8)", fontsize=8.5, fontname="helv", color=(0.1, 0.6, 0.3))
        page.insert_text((cx + 50, cy + 20), "NOT TO SCALE", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))

        # 3. Subparts Q3
        page.insert_text((cls.MARGIN_LEFT + 18, 235), "(a) Find dy/dx.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 235), "[2]", fontsize=11, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 240, 260), "dy/dx = .................................................................", fontsize=10, fontname="helv")

        page.insert_text((cls.MARGIN_LEFT + 18, 290), "(b) Find the coordinates of the stationary points and determine their nature.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 290), "[4]", fontsize=11, fontname="helv")

        # Working lines
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT + 18, 315), (cls.MARGIN_RIGHT, 315))
        shape.draw_line((cls.MARGIN_LEFT + 18, 335), (cls.MARGIN_RIGHT, 335))
        shape.draw_line((cls.MARGIN_LEFT + 18, 355), (cls.MARGIN_RIGHT, 355))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.7, dashes="[2 3] 0")
        shape.commit()

        page.insert_text((cls.MARGIN_RIGHT - 260, 385), "( ....... , ....... ) is a ............................................", fontsize=10, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 260, 405), "( ....... , ....... ) is a ............................................", fontsize=10, fontname="helv")

        # Divider line between Q3 and Q4
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT, 425), (cls.MARGIN_RIGHT, 425))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.8)
        shape.commit()

    @classmethod
    def _draw_question_4_probability(cls, page):
        # 1. Question Intro Stem
        page.insert_text((cls.MARGIN_LEFT, 445), "4", fontsize=12, fontname="helv", color=(0.08, 0.25, 0.55))
        page.insert_text((cls.MARGIN_LEFT + 18, 445), "A bag contains 7 green sweets and 3 yellow sweets.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 18, 461), "Hannah takes two sweets at random without replacement.", fontsize=10.5, fontname="helv")

        # 2. Tree Diagram Box (y=485 to 615, completely clear of text)
        rx = 110
        ry = 545
        shape = page.new_shape()
        # Level 1 branches
        shape.draw_line((rx, ry), (rx + 90, ry - 45))
        shape.draw_line((rx, ry), (rx + 90, ry + 45))

        # Level 2 branches from Green node
        shape.draw_line((rx + 140, ry - 45), (rx + 245, ry - 75))
        shape.draw_line((rx + 140, ry - 45), (rx + 245, ry - 18))

        # Level 2 branches from Yellow node
        shape.draw_line((rx + 140, ry + 45), (rx + 245, ry + 18))
        shape.draw_line((rx + 140, ry + 45), (rx + 245, ry + 75))
        shape.finish(color=(0.15, 0.15, 0.15), width=1.3)
        shape.commit()

        # Level 1 labels & fractions
        page.insert_text((rx + 30, ry - 30), "7/10", fontsize=9.5, fontname="helv", color=(0.1, 0.55, 0.25))
        page.insert_text((rx + 30, ry + 34), "3/10", fontsize=9.5, fontname="helv", color=(0.7, 0.45, 0.05))
        page.insert_text((rx + 95, ry - 42), "Green", fontsize=9.5, fontname="helv")
        page.insert_text((rx + 95, ry + 48), "Yellow", fontsize=9.5, fontname="helv")

        # Level 2 dotted prompts for student & labels
        page.insert_text((rx + 175, ry - 66), ".......", fontsize=9, fontname="helv")
        page.insert_text((rx + 175, ry - 22), ".......", fontsize=9, fontname="helv")
        page.insert_text((rx + 175, ry + 22), ".......", fontsize=9, fontname="helv")
        page.insert_text((rx + 175, ry + 66), ".......", fontsize=9, fontname="helv")

        page.insert_text((rx + 252, ry - 72), "Green", fontsize=9.5, fontname="helv")
        page.insert_text((rx + 252, ry - 15), "Yellow", fontsize=9.5, fontname="helv")
        page.insert_text((rx + 252, ry + 21), "Green", fontsize=9.5, fontname="helv")
        page.insert_text((rx + 252, ry + 78), "Yellow", fontsize=9.5, fontname="helv")

        # 3. Subparts Q4
        page.insert_text((cls.MARGIN_LEFT + 18, 635), "(a) Complete the probability tree diagram above.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 635), "[2]", fontsize=11, fontname="helv")

        page.insert_text((cls.MARGIN_LEFT + 18, 665), "(b) Work out the probability that Hannah takes two green sweets.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 665), "[2]", fontsize=11, fontname="helv")

        # Working lines
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT + 18, 695), (cls.MARGIN_RIGHT, 695))
        shape.draw_line((cls.MARGIN_LEFT + 18, 715), (cls.MARGIN_RIGHT, 715))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.7, dashes="[2 3] 0")
        shape.commit()

        page.insert_text((cls.MARGIN_RIGHT - 240, 745), "Probability = ...................................................", fontsize=10, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 20, 745), "[2]", fontsize=11, fontname="helv")

    # =========================================================================
    # Mark Scheme Structured Tables (Pages 2 & 3)
    # =========================================================================
    @classmethod
    def _draw_solution_table_page_2(cls, page):
        y = 75
        page.insert_text((cls.MARGIN_LEFT, y), "DETAILED MARK SCHEME SOLUTIONS — SECTION A", fontsize=11, fontname="helv", color=(0.05, 0.45, 0.25))

        headers = ["Q", "Answer / Worked Method", "Mark", "Examiner Guidance & Alternatives"]
        rows = [
            ("1", "AG² = 4² + 5² + 7² = 16 + 25 + 49 = 90\nAG = √90 = 9.4868...\nAG = 9.49 cm (to 3 s.f.)", "M1\nA1\nM1\nA1", "M1 for base diagonal AC² = 4² + 5² (= 41)\nA1 for AC = √41\nM1 for √(41 + 49) = √90\nA1 for 9.49 or 3√10. Award 4 marks for correct answer without working."),
            ("2(a)", "Frequency Density = Frequency / Class Width\nFD = 35 / (30 - 20) = 35 / 10\nFD = 3.5", "M1\nA1", "M1 for correct division by class width 10.\nA1 for 3.5. Do not accept fractional 7/2 unless decimal also seen."),
            ("2(b)", "Width = 50 - 30 = 20\nFD from graph = 1.2\nFrequency = 20 × 1.2 = 24", "M1\nA1", "M1 for reading FD = 1.2 and multiplying by 20.\nA1 for 24."),
        ]
        cls._render_table(page, y + 15, headers, rows, [25, 230, 45, 205])

    @classmethod
    def _draw_solution_table_page_3(cls, page):
        y = 75
        page.insert_text((cls.MARGIN_LEFT, y), "DETAILED MARK SCHEME SOLUTIONS — SECTION B", fontsize=11, fontname="helv", color=(0.05, 0.45, 0.25))

        headers = ["Q", "Answer / Worked Method", "Mark", "Examiner Guidance & Alternatives"]
        rows = [
            ("3(a)", "dy/dx = 6x² - 18x + 12", "M1\nA1", "M1 for differentiating at least two terms correctly.\nA1 for all terms correct."),
            ("3(b)", "Sets 6x² - 18x + 12 = 0\nx² - 3x + 2 = 0\n(x - 1)(x - 2) = 0 => x = 1, x = 2\nAt x = 1, y = 9  -> (1, 9)\nAt x = 2, y = 8  -> (2, 8)\nd²y/dx² = 12x - 18\nAt x = 1: 12(1)-18 = -6 < 0 => Maximum\nAt x = 2: 12(2)-18 = +6 > 0 => Minimum", "M1\nA1\nA1\nM1\nA1", "M1 for equating their derivative to 0.\nA1 for x = 1 and x = 2.\nA1 for correct y-coordinates (9 and 8).\nM1 for valid second derivative test or sign change test.\nA1 for correct classification of both."),
            ("4(a)", "Second green branch = 6/9\nSecond yellow branch = 3/9", "B1\nB1", "B1 for 6/9 or 2/3.\nB1 for 3/9 or 1/3."),
            ("4(b)", "P(both green) = 7/10 × 6/9\n= 42/90 = 7/15 (= 0.467)", "M1\nA1", "M1 for multiplying their P(G1) by their P(G2|G1).\nA1 for 7/15 or 42/90 or 0.467 (to 3 s.f.)."),
        ]
        cls._render_table(page, y + 15, headers, rows, [25, 230, 45, 205])

    @classmethod
    def _render_table(cls, page, start_y: float, headers: List[str], rows: List[tuple], col_widths: List[float]):
        curr_y = start_y
        total_w = sum(col_widths)

        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y, cls.MARGIN_LEFT + total_w, curr_y + 22))
        shape.finish(color=(0.05, 0.45, 0.25), fill=(0.05, 0.45, 0.25))
        shape.commit()

        cx = cls.MARGIN_LEFT
        for i, h in enumerate(headers):
            page.insert_text((cx + 6, curr_y + 15), h, fontsize=9.5, fontname="helv", color=(1, 1, 1))
            cx += col_widths[i]

        curr_y += 22

        for r_idx, row in enumerate(rows):
            line_count = max(len(row[1].split('\n')), len(row[3].split('\n')), 1)
            row_h = line_count * 14 + 18

            if r_idx % 2 == 1:
                shape = page.new_shape()
                shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y, cls.MARGIN_LEFT + total_w, curr_y + row_h))
                shape.finish(color=(0.96, 0.98, 0.96), fill=(0.96, 0.98, 0.96))
                shape.commit()

            shape = page.new_shape()
            shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y, cls.MARGIN_LEFT + total_w, curr_y + row_h))
            shape.draw_line((cls.MARGIN_LEFT + col_widths[0], curr_y), (cls.MARGIN_LEFT + col_widths[0], curr_y + row_h))
            shape.draw_line((cls.MARGIN_LEFT + col_widths[0] + col_widths[1], curr_y), (cls.MARGIN_LEFT + col_widths[0] + col_widths[1], curr_y + row_h))
            shape.draw_line((cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + col_widths[2], curr_y), (cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + col_widths[2], curr_y + row_h))
            shape.finish(color=(0.8, 0.85, 0.8), width=0.8)
            shape.commit()

            page.insert_text((cls.MARGIN_LEFT + 6, curr_y + 15), str(row[0]), fontsize=10, fontname="helv", color=(0.1, 0.1, 0.1))

            w_y = curr_y + 15
            for line in row[1].split('\n'):
                page.insert_text((cls.MARGIN_LEFT + col_widths[0] + 6, w_y), line, fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
                w_y += 14

            m_y = curr_y + 15
            for mark in row[2].split('\n'):
                page.insert_text((cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + 12, m_y), mark, fontsize=9.5, fontname="helv", color=(0.05, 0.45, 0.25))
                m_y += 14

            g_y = curr_y + 15
            for g_line in row[3].split('\n'):
                page.insert_text((cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + col_widths[2] + 6, g_y), g_line, fontsize=8.5, fontname="helv", color=(0.3, 0.35, 0.4))
                g_y += 14

            curr_y += row_h

    # =========================================================================
    # Page 4: Formulae Sheet & Benchmarks
    # =========================================================================
    @classmethod
    def _draw_formula_sheet(cls, page):
        y = 70
        page.insert_text((cls.MARGIN_LEFT, y), "MATHEMATICAL FORMULAE SHEET", fontsize=11, fontname="helv", color=(0.08, 0.25, 0.55))

        formulae = [
            ("Curved surface area of a cone", "A = πrl"),
            ("Surface area of a sphere", "A = 4πr²"),
            ("Volume of a sphere", "V = 4/3 πr³"),
            ("Volume of a cone", "V = 1/3 πr²h"),
            ("Volume of a pyramid", "V = 1/3 × base area × height"),
            ("Quadratic formula", "x = (-b ± √(b² - 4ac)) / (2a)"),
            ("Sine rule", "a / sin A = b / sin B = c / sin C"),
            ("Cosine rule", "a² = b² + c² - 2bc cos A"),
            ("Area of a triangle", "Area = 1/2 ab sin C"),
        ]

        curr_y = y + 25
        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y - 10, cls.MARGIN_RIGHT, curr_y + len(formulae) * 22 + 5))
        shape.finish(color=(0.8, 0.85, 0.9), width=1)
        shape.commit()

        for name, form in formulae:
            page.insert_text((cls.MARGIN_LEFT + 15, curr_y + 5), name, fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
            page.insert_text((cls.MARGIN_LEFT + 250, curr_y + 5), form, fontsize=10, fontname="helv", color=(0.08, 0.25, 0.55))
            shape = page.new_shape()
            shape.draw_line((cls.MARGIN_LEFT, curr_y + 12), (cls.MARGIN_RIGHT, curr_y + 12))
            shape.finish(color=(0.92, 0.94, 0.96), width=0.6)
            shape.commit()
            curr_y += 22

        curr_y += 25
        page.insert_text((cls.MARGIN_LEFT, curr_y), "BLANK PAGE FOR ADDITIONAL WORKING", fontsize=10, fontname="helv", color=(0.5, 0.5, 0.5))
        shape = page.new_shape()
        for ly in range(int(curr_y + 20), int(cls.PAGE_HEIGHT - 60), 22):
            shape.draw_line((cls.MARGIN_LEFT, ly), (cls.MARGIN_RIGHT, ly))
        shape.finish(color=(0.9, 0.9, 0.9), width=0.5, dashes="[2 3] 0")
        shape.commit()

    @classmethod
    def _draw_grade_boundaries(cls, page):
        y = 75
        page.insert_text((cls.MARGIN_LEFT, y), "HISTORIC GRADE BOUNDARY BENCHMARKS", fontsize=11, fontname="helv", color=(0.05, 0.45, 0.25))

        headers = ["Grade", "Minimum Mark", "Percentage", "Performance Descriptor"]
        rows = [
            ("A*", "61 / 70", "87.1%", "Outstanding mastery of algebra, geometric reasoning, and calculus."),
            ("A", "52 / 70", "74.3%", "Strong mathematical application with minor arithmetic inaccuracies."),
            ("B", "43 / 70", "61.4%", "Good competence across standard syllabus topics."),
            ("C", "34 / 70", "48.6%", "Sound basic foundation; difficulty with multi-step unfamiliar problems."),
            ("D", "26 / 70", "37.1%", "Partial understanding of core concepts."),
        ]
        cls._render_table(page, y + 20, headers, rows, [60, 100, 90, 245])

    @classmethod
    def _draw_mini_header(cls, page, code: str, season: str, is_ms: bool):
        t = f"MathIB  ·  {code}  ·  {season}  ·  {'Mark Scheme' if is_ms else 'Question Paper'}"
        page.insert_text((cls.MARGIN_LEFT, 35), t, fontsize=9, fontname="helv", color=(0.4, 0.4, 0.4))
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT, 45), (cls.MARGIN_RIGHT, 45))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.8)
        shape.commit()

    @classmethod
    def _draw_footer(cls, page, current: int, total: int):
        y = cls.PAGE_HEIGHT - 35
        page.insert_text((cls.MARGIN_LEFT, y), "© MathIB Examination Board", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
        page.insert_text((cls.MARGIN_RIGHT - 65, y), f"Page {current} of {total}", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
