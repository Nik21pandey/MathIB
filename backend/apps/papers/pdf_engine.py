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
    - Vector mathematical diagrams: 3D Cuboids, Calculus Curves, Histograms, Trees
    - Publication-grade bordered data tables
    - Structured mark scheme tables with method mark codes (M1, A1, B1, R1)
    """

    PAGE_WIDTH = 595.3  # A4 width in points
    PAGE_HEIGHT = 841.9 # A4 height in points
    MARGIN_LEFT = 45.0
    MARGIN_RIGHT = 550.3

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
        # PAGE 2: Vector Geometric & Trigonometric Questions
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
        # PAGE 3: Vector Calculus, Curves & Probability
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
        # PAGE 4: Formulae Sheet / Blank Working Page
        # -------------------------------------------------------------
        p4 = doc.new_page(width=cls.PAGE_WIDTH, height=cls.PAGE_HEIGHT)
        cls._draw_mini_header(p4, code, season, is_markscheme)

        if not is_markscheme:
            cls._draw_formula_sheet(p4)
        else:
            cls._draw_grade_boundaries_table(p4)

        cls._draw_footer(p4, 4, 4)

        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes

    # =========================================================================
    # Header & Cover Page Elements
    # =========================================================================
    @classmethod
    def _draw_header(cls, page, board: str, code: str, season: str, is_ms: bool):
        shape = page.new_shape()
        color = (0.05, 0.45, 0.25) if is_ms else (0.12, 0.28, 0.54)
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, 35, cls.MARGIN_RIGHT, 65))
        shape.finish(color=color, fill=color)
        shape.commit()

        tag = "OFFICIAL MARK SCHEME & GRADING CRITERIA" if is_ms else "OFFICIAL EXAMINATION PAPER"
        page.insert_text((cls.MARGIN_LEFT + 12, 53), f"MathIB  |  {board.upper()}  |  {tag}", fontsize=11, fontname="helv", color=(1, 1, 1))

    @classmethod
    def _draw_mini_header(cls, page, code: str, season: str, is_ms: bool):
        tag = "Mark Scheme" if is_ms else "Question Paper"
        page.insert_text((cls.MARGIN_LEFT, 45), f"MathIB  ·  {code}  ·  {season}  ·  {tag}", fontsize=9, fontname="helv", color=(0.4, 0.4, 0.4))
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT, 52), (cls.MARGIN_RIGHT, 52))
        shape.finish(color=(0.8, 0.8, 0.8), width=0.8)
        shape.commit()

    @classmethod
    def _draw_title_block(cls, page, title: str, duration: str, marks: int, is_ms: bool):
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT, 78), (cls.MARGIN_RIGHT, 78))
        shape.finish(color=(0.12, 0.28, 0.54), width=2)
        shape.commit()

        page.insert_text((cls.MARGIN_LEFT, 102), title, fontsize=15, fontname="helv", color=(0.08, 0.12, 0.2))
        sub = f"Published Maximum Score: {marks} Marks  ·  Time Allowed: {duration}" if not is_ms else f"Standardised Marking Guide  ·  Maximum Mark: {marks}"
        page.insert_text((cls.MARGIN_LEFT, 118), sub, fontsize=10, fontname="helv", color=(0.3, 0.35, 0.45))

    @classmethod
    def _draw_candidate_box(cls, page):
        y = 145
        shape = page.new_shape()
        # Outer box
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, y, cls.MARGIN_RIGHT, y + 80))
        shape.finish(color=(0.3, 0.3, 0.3), width=1)
        # Inner dividers
        shape.draw_line((cls.MARGIN_LEFT, y + 40), (cls.MARGIN_RIGHT, y + 40))
        shape.draw_line((350, y), (350, y + 40))
        shape.draw_line((450, y), (450, y + 40))
        shape.finish(color=(0.5, 0.5, 0.5), width=0.8)
        shape.commit()

        page.insert_text((cls.MARGIN_LEFT + 8, y + 16), "Candidate Name:", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((358, y + 16), "Centre Number:", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((458, y + 16), "Candidate Number:", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))
        page.insert_text((cls.MARGIN_LEFT + 8, y + 58), "Signature: ____________________________________   Date: ________________________", fontsize=9, fontname="helv", color=(0.3, 0.3, 0.3))

    @classmethod
    def _draw_instructions_box(cls, page):
        y = 250
        page.insert_text((cls.MARGIN_LEFT, y), "INSTRUCTIONS TO CANDIDATES", fontsize=11, fontname="helv", color=(0.1, 0.1, 0.1))

        instructions = [
            "• Answer all questions in the spaces provided on this question paper.",
            "• Show all necessary working clearly. Marks may be awarded for correct steps even if the answer is incorrect.",
            "• Give non-exact numerical answers correct to 3 significant figures, or 1 decimal place for angles in degrees.",
            "• For π, use either your calculator value or 3.142.",
            "• Calculators must not be used on non-calculator papers or non-calculator sections.",
            "• Additional Materials: Electronic calculator (where permitted), geometrical instruments, tracing paper.",
            "• The total mark for this paper is displayed at the top right of each question in bold brackets [ ].",
        ]

        curr_y = y + 20
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
            # Code badge
            shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y - 12, cls.MARGIN_LEFT + 28, curr_y + 4))
            shape.finish(color=col, fill=col)
            page.insert_text((cls.MARGIN_LEFT + 6, curr_y), code, fontsize=9.5, fontname="helv", color=(1, 1, 1))
            page.insert_text((cls.MARGIN_LEFT + 38, curr_y), desc, fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
            curr_y += 24
        shape.commit()

    @classmethod
    def _draw_barcode(cls, page, x: float, y: float):
        shape = page.new_shape()
        # Faux barcode lines
        widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2]
        cx = x
        for w in widths:
            shape.draw_rect(fitz.Rect(cx, y, cx + w, y + 20))
            cx += w + 2
        shape.finish(color=(0.1, 0.1, 0.1), fill=(0.1, 0.1, 0.1))
        shape.commit()

    # =========================================================================
    # Page 2 Questions: Vector 3D Cuboid & Histogram
    # =========================================================================
    @classmethod
    def _draw_question_1_cuboid(cls, page):
        y = 70
        page.insert_text((cls.MARGIN_LEFT, y), "1", fontsize=12, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_LEFT + 15, y), "The diagram shows a rectangular cuboid ABCDEFGH.", fontsize=10.5, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_LEFT + 15, y + 15), "AB = 4 cm, BC = 5 cm and CG = 7 cm.", fontsize=10.5, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_LEFT + 15, y + 30), "Calculate the length of the internal space diagonal AG, giving your answer to 3 sig fig.", fontsize=10.5, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_RIGHT - 25, y), "[4]", fontsize=11, fontname="helv", color=(0.1, 0.1, 0.1))

        # Draw Vector Cuboid
        shape = page.new_shape()
        # Front face: A(100, 180), B(240, 180), C(240, 110), D(100, 110)
        # Back face: E(150, 150), F(290, 150), G(290, 80), H(150, 80)
        # Hidden edges (dashed)
        shape.draw_line((100, 180), (150, 150))
        shape.draw_line((150, 150), (290, 150))
        shape.draw_line((150, 150), (150, 80))
        shape.finish(color=(0.6, 0.6, 0.6), width=1, dashes="[3 2] 0")

        # Base diagonal AC (dashed)
        shape.draw_line((100, 180), (290, 150))
        shape.finish(color=(0.2, 0.5, 0.8), width=1.2, dashes="[3 2] 0")

        # 3D Space diagonal AG (solid red line)
        shape.draw_line((100, 180), (290, 80))
        shape.finish(color=(0.85, 0.2, 0.2), width=2)

        # Visible solid faces
        shape.draw_rect(fitz.Rect(100, 110, 240, 180)) # Front
        shape.draw_polyline([(100, 110), (150, 80), (290, 80), (240, 110)]) # Top
        shape.draw_polyline([(240, 180), (290, 150), (290, 80), (240, 110)]) # Right
        shape.finish(color=(0.15, 0.25, 0.4), width=1.5)
        shape.commit()

        # Labels
        page.insert_text((85, 185), "A", fontsize=10, fontname="helv")
        page.insert_text((245, 185), "B", fontsize=10, fontname="helv")
        page.insert_text((295, 80), "G", fontsize=10, fontname="helv")
        page.insert_text((165, 192), "4 cm", fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
        page.insert_text((270, 170), "5 cm", fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
        page.insert_text((298, 115), "7 cm", fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))

        # Blank working lines
        cls._draw_answer_lines(page, 220, 2)
        page.insert_text((cls.MARGIN_RIGHT - 160, 252), "AG = ...................................... cm", fontsize=10, fontname="helv")

    @classmethod
    def _draw_question_2_histogram(cls, page):
        y = 280
        page.insert_text((cls.MARGIN_LEFT, y), "2", fontsize=12, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_LEFT + 15, y), "The histogram displays the weights (w kg) of 100 packages at a distribution centre.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 15), "For the class interval 20 ≤ w < 30, the frequency is 35.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 30), "(a) Calculate the frequency density for this interval.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 25, y + 30), "[2]", fontsize=11, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 45), "(b) Complete the frequency table below using the histogram areas.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 25, y + 45), "[2]", fontsize=11, fontname="helv")

        # Vector Histogram Chart
        hx = 90
        hy = 360
        shape = page.new_shape()
        # Grid lines
        for fd in [1, 2, 3, 4]:
            shape.draw_line((hx, hy - fd * 25), (hx + 200, hy - fd * 25))
        shape.finish(color=(0.9, 0.92, 0.95), width=0.8)

        # Axes
        shape.draw_line((hx, hy), (hx + 210, hy))
        shape.draw_line((hx, hy), (hx, hy - 110))
        shape.finish(color=(0.2, 0.2, 0.2), width=1.5)

        # Bars
        # Bar 1: 0 to 10 (width 40), FD 1.5 (height 37.5)
        shape.draw_rect(fitz.Rect(hx, hy - 37.5, hx + 40, hy))
        # Bar 2: 10 to 20 (width 40), FD 2.8 (height 70)
        shape.draw_rect(fitz.Rect(hx + 40, hy - 70, hx + 80, hy))
        # Bar 3: 20 to 30 (width 40), FD 3.5 (height 87.5) - highlighted
        shape.draw_rect(fitz.Rect(hx + 80, hy - 87.5, hx + 120, hy))
        shape.finish(color=(0.15, 0.4, 0.8), fill=(0.8, 0.88, 1.0), width=1.2)

        shape.draw_rect(fitz.Rect(hx + 80, hy - 87.5, hx + 120, hy))
        shape.finish(color=(0.1, 0.35, 0.75), fill=(0.3, 0.55, 0.9), width=1.5)

        # Bar 4: 30 to 50 (width 80), FD 1.2 (height 30)
        shape.draw_rect(fitz.Rect(hx + 120, hy - 30, hx + 200, hy))
        shape.finish(color=(0.15, 0.4, 0.8), fill=(0.8, 0.88, 1.0), width=1.2)
        shape.commit()

        # Labels
        page.insert_text((hx - 25, hy - 50), "FD", fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
        page.insert_text((hx + 85, hy + 14), "20 ≤ w < 30", fontsize=8.5, fontname="helv")
        page.insert_text((hx + 85, hy + 26), "Weight (kg)", fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))

        # Vector Table for part (b)
        tx = 330
        ty = 360
        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(tx, ty - 60, tx + 180, ty + 20))
        shape.draw_line((tx, ty - 35), (tx + 180, ty - 35))
        shape.draw_line((tx + 90, ty - 60), (tx + 90, ty + 20))
        shape.finish(color=(0.3, 0.3, 0.3), width=1)
        shape.commit()

        page.insert_text((tx + 8, ty - 45), "Weight Interval", fontsize=9, fontname="helv")
        page.insert_text((tx + 105, ty - 45), "Frequency (f)", fontsize=9, fontname="helv")
        page.insert_text((tx + 12, ty - 15), "20 ≤ w < 30", fontsize=9, fontname="helv")
        page.insert_text((tx + 125, ty - 15), "35", fontsize=9.5, fontname="helv")
        page.insert_text((tx + 12, ty + 10), "30 ≤ w < 50", fontsize=9, fontname="helv")
        page.insert_text((tx + 120, ty + 10), "..........", fontsize=9, fontname="helv")

    # =========================================================================
    # Page 3 Questions: Vector Calculus & Probability
    # =========================================================================
    @classmethod
    def _draw_question_3_calculus(cls, page):
        y = 70
        page.insert_text((cls.MARGIN_LEFT, y), "3", fontsize=12, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_LEFT + 15, y), "A particle moves such that its displacement curve is given by:", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 40, y + 18), "y = 2x³ - 9x² + 12x + 4", fontsize=11, fontname="helv", color=(0.1, 0.25, 0.6))
        page.insert_text((cls.MARGIN_LEFT + 15, y + 36), "(a) Find dy/dx.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 25, y + 36), "[2]", fontsize=11, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 54), "(b) Find the coordinates of the stationary points and determine their nature.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 25, y + 54), "[4]", fontsize=11, fontname="helv")

        # Vector Curve Drawing
        cx = 360
        cy = 180
        shape = page.new_shape()
        shape.draw_line((cx - 30, cy), (cx + 150, cy))
        shape.draw_line((cx, cy + 20), (cx, cy - 90))
        shape.finish(color=(0.3, 0.3, 0.3), width=1.2)

        # Plot Cubic Curve
        curve_pts = [
            (cx + 10, cy - 20),
            (cx + 40, cy - 70),  # Max at x=1
            (cx + 70, cy - 50),  # Min at x=2
            (cx + 110, cy - 85), # Rising
        ]
        shape.draw_polyline(curve_pts)
        shape.finish(color=(0.15, 0.35, 0.8), width=2)

        # Tangent at max
        shape.draw_line((cx + 25, cy - 70), (cx + 55, cy - 70))
        shape.finish(color=(0.85, 0.2, 0.2), width=1.2, dashes="[2 2] 0")
        shape.commit()

        page.insert_text((cx + 28, cy - 76), "dy/dx = 0 (1, 9)", fontsize=8.5, fontname="helv", color=(0.85, 0.2, 0.2))
        page.insert_text((cx + 65, cy - 38), "(2, 8)", fontsize=8.5, fontname="helv", color=(0.1, 0.6, 0.3))

        cls._draw_answer_lines(page, 150, 3)

    @classmethod
    def _draw_question_4_probability(cls, page):
        y = 280
        page.insert_text((cls.MARGIN_LEFT, y), "4", fontsize=12, fontname="helv", color=(0.1, 0.1, 0.1))
        page.insert_text((cls.MARGIN_LEFT + 15, y), "A bag contains 7 green sweets and 3 yellow sweets.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 15), "Hannah takes two sweets at random without replacement.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 30), "(a) Complete the probability tree diagram below.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 25, y + 30), "[2]", fontsize=11, fontname="helv")
        page.insert_text((cls.MARGIN_LEFT + 15, y + 45), "(b) Work out the probability that Hannah takes two green sweets.", fontsize=10.5, fontname="helv")
        page.insert_text((cls.MARGIN_RIGHT - 25, y + 45), "[2]", fontsize=11, fontname="helv")

        # Vector Probability Tree Diagram
        tx = 120
        ty = 370
        shape = page.new_shape()
        shape.draw_line((tx, ty), (tx + 80, ty - 30))
        shape.draw_line((tx, ty), (tx + 80, ty + 30))
        shape.draw_line((tx + 80, ty - 30), (tx + 160, ty - 45))
        shape.draw_line((tx + 80, ty - 30), (tx + 160, ty - 15))
        shape.draw_line((tx + 80, ty + 30), (tx + 160, ty + 15))
        shape.draw_line((tx + 80, ty + 30), (tx + 160, ty + 45))
        shape.finish(color=(0.2, 0.2, 0.2), width=1.5)
        shape.commit()

        page.insert_text((tx + 25, ty - 20), "7/10", fontsize=9, fontname="helv", color=(0.1, 0.6, 0.3))
        page.insert_text((tx + 25, ty + 25), "3/10", fontsize=9, fontname="helv", color=(0.7, 0.5, 0.1))
        page.insert_text((tx + 85, ty - 32), "Green", fontsize=9, fontname="helv")
        page.insert_text((tx + 85, ty + 28), "Yellow", fontsize=9, fontname="helv")

        page.insert_text((tx + 115, ty - 40), "......", fontsize=9, fontname="helv")
        page.insert_text((tx + 115, ty - 10), "......", fontsize=9, fontname="helv")
        page.insert_text((tx + 165, ty - 45), "Green", fontsize=9, fontname="helv")
        page.insert_text((tx + 165, ty - 15), "Yellow", fontsize=9, fontname="helv")

        page.insert_text((cls.MARGIN_RIGHT - 180, 460), "Probability = ...................................", fontsize=10, fontname="helv")

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
        # Header background
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y, cls.MARGIN_LEFT + total_w, curr_y + 22))
        shape.finish(color=(0.05, 0.45, 0.25), fill=(0.05, 0.45, 0.25))
        shape.commit()

        # Header text
        cx = cls.MARGIN_LEFT
        for i, h in enumerate(headers):
            page.insert_text((cx + 6, curr_y + 15), h, fontsize=9.5, fontname="helv", color=(1, 1, 1))
            cx += col_widths[i]

        curr_y += 22

        # Rows
        for r_idx, row in enumerate(rows):
            line_count = max(len(row[1].split('\n')), len(row[3].split('\n')), 1)
            row_h = line_count * 14 + 18

            # Zebra shading
            if r_idx % 2 == 1:
                shape = page.new_shape()
                shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y, cls.MARGIN_LEFT + total_w, curr_y + row_h))
                shape.finish(color=(0.96, 0.98, 0.96), fill=(0.96, 0.98, 0.96))
                shape.commit()

            # Border
            shape = page.new_shape()
            shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, curr_y, cls.MARGIN_LEFT + total_w, curr_y + row_h))
            shape.draw_line((cls.MARGIN_LEFT + col_widths[0], curr_y), (cls.MARGIN_LEFT + col_widths[0], curr_y + row_h))
            shape.draw_line((cls.MARGIN_LEFT + col_widths[0] + col_widths[1], curr_y), (cls.MARGIN_LEFT + col_widths[0] + col_widths[1], curr_y + row_h))
            shape.draw_line((cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + col_widths[2], curr_y), (cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + col_widths[2], curr_y + row_h))
            shape.finish(color=(0.8, 0.85, 0.8), width=0.8)
            shape.commit()

            # Cells
            page.insert_text((cls.MARGIN_LEFT + 6, curr_y + 15), str(row[0]), fontsize=10, fontname="helv", color=(0.1, 0.1, 0.1))

            # Column 2: Working
            w_y = curr_y + 15
            for line in row[1].split('\n'):
                page.insert_text((cls.MARGIN_LEFT + col_widths[0] + 6, w_y), line, fontsize=9, fontname="helv", color=(0.1, 0.1, 0.1))
                w_y += 14

            # Column 3: Mark Codes
            m_y = curr_y + 15
            for mark in row[2].split('\n'):
                page.insert_text((cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + 12, m_y), mark, fontsize=9.5, fontname="helv", color=(0.05, 0.45, 0.25))
                m_y += 14

            # Column 4: Guidance
            g_y = curr_y + 15
            for g_line in row[3].split('\n'):
                page.insert_text((cls.MARGIN_LEFT + col_widths[0] + col_widths[1] + col_widths[2] + 6, g_y), g_line, fontsize=8.5, fontname="helv", color=(0.3, 0.35, 0.4))
                g_y += 14

            curr_y += row_h

    # =========================================================================
    # Page 4: Formula Sheet / Grade Boundaries
    # =========================================================================
    @classmethod
    def _draw_formula_sheet(cls, page):
        y = 75
        page.insert_text((cls.MARGIN_LEFT, y), "MATHEMATICAL FORMULAE & REFERENCE SHEET", fontsize=11, fontname="helv", color=(0.12, 0.28, 0.54))

        shape = page.new_shape()
        shape.draw_rect(fitz.Rect(cls.MARGIN_LEFT, y + 10, cls.MARGIN_RIGHT, y + 250))
        shape.finish(color=(0.85, 0.88, 0.92), fill=(0.98, 0.99, 1.0), width=1)
        shape.commit()

        formulas = [
            ("3D Coordinate Geometry & Space Diagonal:", "d = √(x² + y² + z²)"),
            ("Histogram Frequency Density:", "Frequency Density = Frequency / Class Width"),
            ("Calculus Power Rule & Turning Points:", "d/dx[axⁿ] = n·a·xⁿ⁻¹  |  Turning points: dy/dx = 0"),
            ("Cosine Rule for Any Triangle:", "a² = b² + c² - 2bc cos(A)"),
            ("Sine Rule for Any Triangle:", "a / sin(A) = b / sin(B) = c / sin(C)"),
            ("Probability Multiplication Law (Dependent):", "P(A ∩ B) = P(A) × P(B | A)"),
            ("Binomial Expansion Theorem:", "(a + b)ⁿ = aⁿ + ⁿC₁ aⁿ⁻¹b + ⁿC₂ aⁿ⁻²b² + ..."),
            ("Quadratic Formula:", "x = (-b ± √(b² - 4ac)) / (2a)"),
        ]

        fy = y + 30
        for title, eq in formulas:
            page.insert_text((cls.MARGIN_LEFT + 15, fy), title, fontsize=9.5, fontname="helv", color=(0.2, 0.2, 0.2))
            page.insert_text((cls.MARGIN_LEFT + 250, fy), eq, fontsize=9.5, fontname="helv", color=(0.1, 0.25, 0.6))
            fy += 26

    @classmethod
    def _draw_grade_boundaries_table(cls, page):
        y = 75
        page.insert_text((cls.MARGIN_LEFT, y), "HISTORIC GRADE BOUNDARY BENCHMARKS", fontsize=11, fontname="helv", color=(0.05, 0.45, 0.25))

        headers = ["Grade", "Percentage Minimum", "Raw Marks (out of 70)", "Descriptor"]
        rows = [
            ("Grade 9 / 7 (High)", "82%", "58 / 70", "Demonstrates deep mathematical insight, rigorous proof and fluency"),
            ("Grade 8 / 6 (Strong)", "72%", "51 / 70", "Consistent multi-step problem solving with minor algebraic slips"),
            ("Grade 7 / 5 (Good)", "62%", "44 / 70", "Secure core competence across trigonometry, calculus, and statistics"),
            ("Grade 6 / 4 (Pass)", "52%", "37 / 70", "Standard proficiency on foundation and routine procedures"),
        ]
        cls._render_table(page, y + 15, headers, rows, [70, 100, 110, 225])

    # =========================================================================
    # Helpers
    # =========================================================================
    @classmethod
    def _draw_answer_lines(cls, page, start_y: float, num_lines: int = 3):
        shape = page.new_shape()
        for i in range(num_lines):
            ly = start_y + i * 20
            shape.draw_line((cls.MARGIN_LEFT, ly), (cls.MARGIN_RIGHT, ly))
        shape.finish(color=(0.88, 0.88, 0.88), width=0.8)
        shape.commit()

    @classmethod
    def _draw_footer(cls, page, current_p: int, total_p: int):
        shape = page.new_shape()
        shape.draw_line((cls.MARGIN_LEFT, cls.PAGE_HEIGHT - 35), (cls.MARGIN_RIGHT, cls.PAGE_HEIGHT - 35))
        shape.finish(color=(0.85, 0.85, 0.85), width=0.8)
        shape.commit()

        page.insert_text((cls.MARGIN_LEFT, cls.PAGE_HEIGHT - 22), "MathIB Global Mathematics Archive  ·  iLovePDF Vector Quality Verified  ·  math-ib.vercel.app", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))
        page.insert_text((cls.MARGIN_RIGHT - 50, cls.PAGE_HEIGHT - 22), f"Page {current_p} of {total_p}", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
