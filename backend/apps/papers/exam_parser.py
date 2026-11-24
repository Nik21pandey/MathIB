"""
MathIB Proprietary Structural Exam Paper Parser
Layout-aware PDF parsing engine that segments examination papers into questions,
subparts, command terms, mark allocations, and diagram bounding boxes.
"""

import re
import io
import logging
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

# Official IB and Cambridge Command Terms with Bloom/Cognitive Weights
COMMAND_TERMS_WEIGHT = {
    # Level 1: Knowledge & Recall (Weight: 1.0)
    "state": 1.0,
    "write down": 1.0,
    "list": 1.0,
    "label": 1.0,
    "measure": 1.0,
    "identify": 1.0,

    # Level 2: Routine Application & Calculation (Weight: 2.0)
    "calculate": 2.0,
    "find": 2.0,
    "solve": 2.0,
    "evaluate": 2.0,
    "simplify": 2.0,
    "expand": 2.0,
    "factorise": 2.0,
    "factorize": 2.0,
    "plot": 2.0,
    "draw": 2.0,
    "substitute": 2.0,

    # Level 3: Multi-step Reasoning & Analysis (Weight: 3.5)
    "show that": 3.5,
    "explain": 3.5,
    "describe": 3.5,
    "determine": 3.5,
    "differentiate": 3.5,
    "integrate": 3.5,
    "sketch": 3.5,
    "verify": 3.5,
    "estimate": 3.5,

    # Level 4: Synthesis, Proof & Complex Abstraction (Weight: 4.5)
    "prove": 4.5,
    "prove that": 4.5,
    "hence, or otherwise": 4.5,
    "hence deduce": 4.5,
    "derive": 4.5,
    "justify": 4.5,
    "investigate": 4.5,
    "generalise": 4.5,
}

QUESTION_HEADER_PATTERN = re.compile(
    r'^(?:Question\s*|Problem\s*|Exercise\s*)?'
    r'(\d{1,2})'
    r'(?:'
    r'\s*[\.\)\]\:]\s*'
    r'|\s+(?=\[\s*Maximum\s+mark|\(\s*[a-zA-Zivx]+\s*\)|[A-Z][a-z])'
    r'|\s{2,}(?=[A-Z0-9])'
    r')',
    re.IGNORECASE
)

SUBPART_PATTERN = re.compile(r'^\(([a-z]|[ivx]+)\)', re.IGNORECASE)
MARKS_PATTERN = re.compile(r'\[(\d+)\s*(?:marks?|m)?\]', re.IGNORECASE)


class LayoutAwareExamParser:
    """
    Deconstructs exam PDFs into structured, diagram-aware Question Units.
    """

    def __init__(self, pdf_stream: bytes):
        self.pdf_bytes = pdf_stream
        if not fitz:
            raise RuntimeError("PyMuPDF (fitz) is required for LayoutAwareExamParser.")
        self.doc = fitz.open(stream=self.pdf_bytes, filetype="pdf")
        self.total_pages = len(self.doc)

    def extract_page_elements(self, page_num: int) -> Dict[str, Any]:
        """
        Extracts text blocks, vector drawing bounding boxes, and raster image locations.
        """
        page = self.doc[page_num - 1]
        raw_blocks = page.get_text("blocks")  # (x0, y0, x1, y1, text, block_no, block_type)
        
        # Extract vector drawings (coordinate geometry, triangles, graphs)
        drawings = page.get_drawings()
        drawing_rects = []
        for d in drawings:
            rect = d.get("rect")
            if rect and rect.width > 20 and rect.height > 20:
                drawing_rects.append((rect.x0, rect.y0, rect.x1, rect.y1))

        # Extract raster images
        image_list = page.get_images()
        image_rects = []
        for img in image_list:
            try:
                rects = page.get_image_rects(img[0])
                for r in rects:
                    if r.width > 15 and r.height > 15:
                        image_rects.append((r.x0, r.y0, r.x1, r.y1))
            except Exception:
                pass

        # Text blocks
        text_blocks = []
        for b in raw_blocks:
            if len(b) > 4 and isinstance(b[4], str) and b[4].strip():
                text_blocks.append({
                    "bbox": (b[0], b[1], b[2], b[3]),
                    "text": b[4].strip(),
                    "lines": [line.strip() for line in b[4].split('\n') if line.strip()]
                })

        # Sort text blocks top-to-bottom
        text_blocks.sort(key=lambda x: x["bbox"][1])

        return {
            "page_num": page_num,
            "width": page.rect.width,
            "height": page.rect.height,
            "text_blocks": text_blocks,
            "drawing_rects": drawing_rects,
            "image_rects": image_rects,
            "has_visuals": (len(drawing_rects) > 0 or len(image_rects) > 0)
        }

    def parse_all_questions(self, max_pages: int = 40) -> List[Dict[str, Any]]:
        """
        Slices all pages into discrete question entities with associated diagrams and metadata.
        """
        pages_to_process = min(self.total_pages, max_pages)
        questions = []
        current_q = None

        for p_idx in range(pages_to_process):
            p_num = p_idx + 1
            page_elements = self.extract_page_elements(p_num)
            
            # Check for cover page
            page_full_text = " ".join(" ".join(b["lines"]) for b in page_elements["text_blocks"]).lower()
            if p_num == 1 and ("instructions to candidates" in page_full_text or "candidate number" in page_full_text):
                continue

            for block in page_elements["text_blocks"]:
                first_line = block["lines"][0] if block["lines"] else ""
                match = QUESTION_HEADER_PATTERN.match(first_line)

                if match:
                    if current_q and len(current_q["raw_text"]) > 15:
                        self._finalize_question(current_q)
                        questions.append(current_q)

                    q_num = int(match.group(1))
                    current_q = {
                        "question_number": q_num,
                        "title": f"Question {q_num}",
                        "start_page": p_num,
                        "end_page": p_num,
                        "raw_text": "\n".join(block["lines"]),
                        "blocks": [block],
                        "diagram_rects": [],
                        "marks": 0,
                        "subparts": [],
                        "command_terms": [],
                        "cognitive_score": 0.0,
                        "difficulty": "Intermediate",
                        "topic": "Algebra & Functions",
                    }
                else:
                    if current_q:
                        current_q["raw_text"] += "\n" + "\n".join(block["lines"])
                        current_q["blocks"].append(block)
                        current_q["end_page"] = p_num

            # Associate diagrams on this page with the active question
            if current_q and page_elements["has_visuals"]:
                current_q["diagram_rects"].extend(page_elements["drawing_rects"])
                current_q["diagram_rects"].extend(page_elements["image_rects"])

        if current_q and len(current_q["raw_text"]) > 15:
            self._finalize_question(current_q)
            questions.append(current_q)

        return questions

    def _finalize_question(self, q: Dict[str, Any]):
        """
        Extracts subparts, total marks, command terms, and calculates cognitive difficulty.
        """
        text = q["raw_text"]
        text_lower = text.lower()

        # 1. Total marks calculation
        all_marks = [int(m) for m in MARKS_PATTERN.findall(text)]
        q["marks"] = sum(all_marks) if all_marks else None

        # 2. Extract subparts: (a), (b), (c)(i)
        subparts = []
        for line in text.split('\n'):
            line_str = line.strip()
            sub_match = SUBPART_PATTERN.match(line_str)
            if sub_match:
                subparts.append(sub_match.group(1))
        q["subparts"] = subparts

        # 3. Detect command terms & calculate cognitive score
        found_command_terms = []
        max_cmd_weight = 1.0

        for term, weight in COMMAND_TERMS_WEIGHT.items():
            if re.search(r'\b' + re.escape(term) + r'\b', text_lower):
                found_command_terms.append(term)
                if weight > max_cmd_weight:
                    max_cmd_weight = weight

        q["command_terms"] = found_command_terms

        # 4. Compute Cognitive Difficulty Score C
        # C = 0.40 * S_cmd + 0.35 * S_marks + 0.25 * S_subparts
        marks_score = min((q["marks"] or 3) / 2.0, 4.5)
        subparts_score = min(len(subparts) * 1.2, 4.5)
        cognitive_score = (0.40 * max_cmd_weight) + (0.35 * marks_score) + (0.25 * subparts_score)
        q["cognitive_score"] = round(cognitive_score, 2)

        if cognitive_score >= 3.4:
            q["difficulty"] = "Advanced"
        elif cognitive_score <= 2.1:
            q["difficulty"] = "Beginner"
        else:
            q["difficulty"] = "Intermediate"

    def close(self):
        if self.doc:
            self.doc.close()
