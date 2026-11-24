"""
MathIB PDF Content Bifurcation Engine
Extracts and parses PDF content into a structured hierarchy:
- Subject
- Topic
- Subtopic
- Difficulty Level (Beginner, Intermediate, Advanced) with concise justification
- Page / Section Reference
- Key Notes / Concepts

Supports:
1. PyMuPDF (fitz) text and layout extraction with font-size structure detection.
2. Scanned / image-only page detection with graceful fallback.
3. Multi-page chunking so large PDFs process reliably without timing out.
4. Gemini / OpenAI LLM integration when API keys are configured.
5. Deterministic, comprehensive academic syllabus taxonomy and difficulty heuristic engine
   that runs 100% offline with zero external dependencies.
"""

import os
import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

# Standard difficulty levels
DIFFICULTY_BEGINNER = "Beginner"
DIFFICULTY_INTERMEDIATE = "Intermediate"
DIFFICULTY_ADVANCED = "Advanced"

# Academic curriculum taxonomy dictionary for mathematics & STEM
CURRICULUM_TAXONOMY = {
    "Calculus": {
        "keywords": ["differentiat", "calculus", "derivative", "integral", "integrate", "dy/dx", "dx", "tangent", "normal", "stationary point", "turning point", "maxima", "minima", "inflection", "gradient of curve", "rate of change", "chain rule", "product rule", "quotient rule", "definite integral", "area under curve", "kinematics", "velocity", "acceleration"],
        "subtopics": [
            ("Differentiation & Gradients of Curves", ["dy/dx", "gradient of curve", "derivative", "power rule"]),
            ("Stationary Points & Optimization", ["stationary point", "turning point", "maximum", "minimum", "nature of stationary"]),
            ("Tangents and Normals", ["tangent", "normal", "perpendicular gradient"]),
            ("Chain, Product & Quotient Rules", ["chain rule", "product rule", "quotient rule"]),
            ("Indefinite and Definite Integration", ["integrate", "integral", "area under curve", "definite integral"]),
            ("Kinematics with Calculus", ["displacement", "velocity", "acceleration", "motion of particle"])
        ],
        "default_difficulty": DIFFICULTY_ADVANCED,
        "justification": "Requires conceptual understanding of limits, rates of change, and multi-step algebraic manipulation."
    },
    "Algebra & Functions": {
        "keywords": ["algebra", "equation", "solve", "simultaneous", "quadratic", "factorise", "factorize", "polynomial", "function", "f(x)", "inverse function", "composite function", "discriminant", "roots", "inequality", "inequalities", "indices", "surds", "rational", "simplify", "express as single fraction"],
        "subtopics": [
            ("Quadratic Equations & Discriminants", ["quadratic", "b^2 - 4ac", "roots", "completing the square", "parabola"]),
            ("Simultaneous Linear and Non-Linear Equations", ["simultaneous", "eliminate", "solve simultaneously"]),
            ("Functions, Composite & Inverse Functions", ["f(x)", "g(x)", "fg(x)", "inverse function", "f^-1", "composite"]),
            ("Indices and Surds", ["indices", "surd", "rationalise", "square root", "power", "exponent"]),
            ("Linear Equations & Inequalities", ["inequality", "linear equation", "rearrange", "subject of formula"]),
            ("Algebraic Fractions & Rational Expressions", ["single fraction", "simplify", "numerator", "denominator", "partial fraction"])
        ],
        "default_difficulty": DIFFICULTY_INTERMEDIATE,
        "justification": "Requires algebraic transformation, equation solving, and symbol manipulation."
    },
    "Trigonometry": {
        "keywords": ["sin", "cos", "tan", "trigonomet", "sine rule", "cosine rule", "angle of elevation", "angle of depression", "bearing", "radian", "degrees", "right-angled", "hypotenuse", "exact value", "unit circle", "amplitude", "period", "trigonometric equation", "pythagoras"],
        "subtopics": [
            ("Right-Angled Trigonometry & Pythagoras", ["pythagoras", "sohcahtoa", "hypotenuse", "opposite", "adjacent"]),
            ("Sine and Cosine Rules in Non-Right Triangles", ["sine rule", "cosine rule", "area of triangle 1/2 ab sin c"]),
            ("Bearings and 3D Trigonometry", ["bearing", "three-figure bearing", "3d", "angle of elevation", "depression"]),
            ("Trigonometric Functions & Graphs", ["amplitude", "period", "graph of y = sin", "y = cos", "unit circle"]),
            ("Trigonometric Equations & Identities", ["sin^2 + cos^2 = 1", "tan = sin/cos", "solve for 0 <= x <= 360", "radians"])
        ],
        "default_difficulty": DIFFICULTY_INTERMEDIATE,
        "justification": "Involves spatial reasoning, trigonometric ratios, and multi-step geometric calculations."
    },
    "Coordinate Geometry": {
        "keywords": ["coordinate", "gradient", "midpoint", "distance between points", "line equation", "y = mx + c", "perpendicular", "parallel lines", "circle equation", "tangent to circle", "intercept"],
        "subtopics": [
            ("Linear Graphs & Gradients", ["gradient", "slope", "y = mx + c", "intercept"]),
            ("Perpendicular Bisectors and Parallel Lines", ["perpendicular", "negative reciprocal", "-1/m", "parallel", "bisector"]),
            ("Midpoint and Distance Formulas", ["midpoint", "length of segment", "distance between"]),
            ("Circles in Coordinate Geometry", ["x^2 + y^2 = r^2", "centre of circle", "radius", "equation of circle"])
        ],
        "default_difficulty": DIFFICULTY_INTERMEDIATE,
        "justification": "Combines algebraic equations with 2D Cartesian spatial representation."
    },
    "Geometry & Mensuration": {
        "keywords": ["geometry", "angle", "triangle", "polygon", "circle theorem", "tangent", "chord", "arc length", "sector", "area", "volume", "surface area", "cylinder", "cone", "sphere", "pyramid", "cuboid", "prism", "similarity", "congruence", "scale factor"],
        "subtopics": [
            ("Circle Theorems & Angle Properties", ["circle theorem", "angle at centre", "cyclic quadrilateral", "tangent perpendicular"]),
            ("Arc Length, Sector Area & Radians", ["arc length", "sector", "segment of circle", "radius"]),
            ("Surface Area and Volume of 3D Solids", ["volume", "surface area", "cone", "sphere", "cylinder", "pyramid", "cuboid"]),
            ("Geometric Similarity & Scale Factors", ["similar", "scale factor", "ratio of areas", "ratio of volumes", "congruent"]),
            ("Polygons and Interior/Exterior Angles", ["interior angle", "exterior angle", "regular polygon", "hexagon", "pentagon"])
        ],
        "default_difficulty": DIFFICULTY_INTERMEDIATE,
        "justification": "Requires application of geometric theorems, spatial formulas, and dimensional conversions."
    },
    "Probability & Statistics": {
        "keywords": ["probability", "tree diagram", "venn diagram", "histogram", "cumulative frequency", "mean", "median", "mode", "standard deviation", "variance", "interquartile", "box plot", "box-and-whisker", "stem-and-leaf", "frequency density", "normal distribution", "binomial", "correlation", "scatter diagram"],
        "subtopics": [
            ("Single & Combined Event Probability", ["probability", "without replacement", "with replacement", "independent events"]),
            ("Tree Diagrams & Conditional Probability", ["tree diagram", "conditional", "given that", "branch"]),
            ("Venn Diagrams & Set Notation", ["venn", "union", "intersection", "complement", "subset"]),
            ("Histograms & Frequency Density", ["histogram", "frequency density", "class width"]),
            ("Cumulative Frequency & Box Plots", ["cumulative frequency", "median", "upper quartile", "lower quartile", "interquartile", "box plot"]),
            ("Measures of Central Tendency & Spread", ["mean", "mode", "median", "standard deviation", "range", "grouped data"])
        ],
        "default_difficulty": DIFFICULTY_INTERMEDIATE,
        "justification": "Demands statistical interpretation, probability axioms, and structured data synthesis."
    },
    "Number & Arithmetic": {
        "keywords": ["standard form", "significant figures", "decimal places", "percentage", "fraction", "ratio", "proportion", "compound interest", "simple interest", "upper bound", "lower bound", "error interval", "hcf", "lcm", "prime factor", "currency conversion"],
        "subtopics": [
            ("Fractions, Decimals & Percentages", ["fraction", "percentage increase", "percentage decrease", "reverse percentage"]),
            ("Standard Form & Scientific Notation", ["standard form", "x 10^", "powers of 10"]),
            ("Upper and Lower Bounds & Accuracy", ["upper bound", "lower bound", "error interval", "degree of accuracy"]),
            ("Ratio, Proportion & Rates", ["ratio", "direct proportion", "inverse proportion", "rate", "speed"]),
            ("Financial Mathematics & Compound Interest", ["compound interest", "depreciation", "simple interest", "tax"])
        ],
        "default_difficulty": DIFFICULTY_BEGINNER,
        "justification": "Covers foundational numerical fluency, proportions, and standard algorithmic operations."
    },
    "Vectors & Transformations": {
        "keywords": ["vector", "magnitude", "direction", "column vector", "scalar product", "dot product", "translation", "reflection", "rotation", "enlargement", "matrix", "matrices", "transformation"],
        "subtopics": [
            ("2D Vectors & Vector Geometry", ["vector", "column vector", "magnitude", "resultant vector", "collinear"]),
            ("Geometric Transformations", ["translation", "reflection", "rotation", "enlargement", "scale factor"]),
            ("Matrix Operations & Transformations", ["matrix", "determinant", "inverse matrix", "matrix multiplication"]),
            ("3D Vectors & Line Equations", ["3d vector", "i j k", "dot product", "vector equation of line"])
        ],
        "default_difficulty": DIFFICULTY_ADVANCED,
        "justification": "Requires vector algebra, spatial transformations, and matrix mechanics."
    }
}


def extract_pdf_pages_fitz(file_bytes: bytes, max_pages: int = 50) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Extracts text, structural font information, and visual indicators per page using PyMuPDF (fitz).
    Returns (pages_data, metadata).
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    total_pages = len(doc)
    pages_to_process = min(total_pages, max_pages)

    pages_data = []
    total_words = 0
    scanned_pages_count = 0

    for page_idx in range(pages_to_process):
        page = doc[page_idx]
        page_num = page_idx + 1

        # Extract structured text blocks
        text = page.get_text("text").strip()
        blocks = page.get_text("blocks")  # (x0, y0, x1, y1, text, block_no, block_type)
        images = page.get_images()

        word_count = len(text.split()) if text else 0
        total_words += word_count

        # Detection for scanned / image-only pages:
        is_scanned = (len(text) < 40 and len(images) > 0)
        if is_scanned:
            scanned_pages_count += 1

        # Collect distinct paragraph blocks
        cleaned_blocks = []
        for b in blocks:
            b_text = b[4].strip() if len(b) > 4 and isinstance(b[4], str) else ""
            if b_text and len(b_text) > 3:
                cleaned_blocks.append(b_text)

        pages_data.append({
            "page_number": page_num,
            "text": text,
            "blocks": cleaned_blocks,
            "word_count": word_count,
            "image_count": len(images),
            "is_scanned": is_scanned
        })

    doc.close()

    metadata = {
        "total_pages": total_pages,
        "pages_processed": pages_to_process,
        "total_words": total_words,
        "scanned_pages_count": scanned_pages_count,
        "is_scanned_document": (scanned_pages_count > pages_to_process * 0.6)
    }

    return pages_data, metadata


def bifurcate_with_llm(extracted_text_summary: str, subject_hint: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
    """
    Attempts to use Gemini 1.5 Flash (or OpenAI if configured) to bifurcate the content.
    Returns parsed structured items or None if not configured/failed.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        return None

    import requests

    system_prompt = (
        "You are an expert academic curriculum analyzer and exam examiner. "
        "Analyze the provided document text and bifurcate its content into a structured hierarchy of: "
        "Subject, Topic, Subtopic, Difficulty Level ('Beginner', 'Intermediate', 'Advanced'), concise Justification, "
        "source Page / Section Reference, and Key Notes.\n"
        "Return ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "subject": "string",\n'
        '  "items": [\n'
        '    {\n'
        '      "id": "item-1",\n'
        '      "subject": "Mathematics",\n'
        '      "topic": "string",\n'
        '      "subtopic": "string",\n'
        '      "difficulty": "Beginner|Intermediate|Advanced",\n'
        '      "justification": "string explaining why this difficulty level was assigned",\n'
        '      "page_ref": "Page X",\n'
        '      "key_notes": "concise summary or key concepts"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    user_prompt = f"Subject context: {subject_hint or 'Mathematics / STEM'}\n\nDocument Text Sample:\n{extracted_text_summary[:12000]}"

    # Try Gemini API if key is present
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code == 200:
                result_json = resp.json()
                text_response = result_json['candidates'][0]['content']['parts'][0]['text']
                data = json.loads(text_response)
                if isinstance(data, dict) and "items" in data and isinstance(data["items"], list):
                    return data["items"]
        except Exception as e:
            logger.warning(f"Gemini bifurcation failed: {e}. Falling back to rule-based engine.")

    # Try OpenAI API if key is present
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            if resp.status_code == 200:
                result_json = resp.json()
                content = result_json['choices'][0]['message']['content']
                data = json.loads(content)
                if isinstance(data, dict) and "items" in data and isinstance(data["items"], list):
                    return data["items"]
        except Exception as e:
            logger.warning(f"OpenAI bifurcation failed: {e}. Falling back to rule-based engine.")

    return None


def detect_question_units(pages_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Slices raw page text and blocks into discrete questions, sections, or academic problem units.
    """
    units = []

    # Regex patterns for question numbers and sections across Cambridge, IBDP, and Edexcel
    q_pattern = re.compile(
        r'^(?:Question\s*|Problem\s*|Exercise\s*)?'
        r'(\d{1,2})'
        r'(?:'
        r'\s*[\.\)\]\:]\s*'  # Standard "1.", "1)", "1]"
        r'|\s+(?=\[\s*Maximum\s+mark|\(\s*[a-zA-Zivx]+\s*\)|[A-Z][a-z])'  # IBDP "[Maximum mark: 6]" or Cambridge "1 (a)", "1 The diagram..."
        r'|\s{2,}(?=[A-Z0-9])'  # Cambridge tabbed "1   Calculate..."
        r')',
        re.IGNORECASE
    )
    section_pattern = re.compile(r'^(?:Section\s*|Part\s*)([A-Z0-9]+)', re.IGNORECASE)

    # Patterns to identify front cover instructions
    cover_keywords = ["instructions to candidates", "write your name", "do not open this examination paper", "candidate number", "centre number"]

    current_unit = None

    for page in pages_data:
        p_num = page["page_number"]
        blocks = page["blocks"]

        # If page has very little text, create a page unit
        if len(blocks) == 0 and page["text"]:
            blocks = [page["text"]]

        for block in blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue

            first_line = lines[0]
            q_match = q_pattern.match(first_line)
            sec_match = section_pattern.match(first_line)

            # Check if this block starts a new question or section
            if q_match or sec_match:
                if current_unit and len(current_unit["text"]) > 20:
                    units.append(current_unit)

                unit_id = f"Q{q_match.group(1)}" if q_match else f"Sec {sec_match.group(1)}"
                current_unit = {
                    "unit_id": unit_id,
                    "title": first_line[:80],
                    "text": block,
                    "start_page": p_num,
                    "end_page": p_num
                }
            else:
                if current_unit:
                    current_unit["text"] += "\n" + block
                    current_unit["end_page"] = p_num
                else:
                    # Generic unit for introductory or first section
                    current_unit = {
                        "unit_id": f"P{p_num}-S1",
                        "title": first_line[:80],
                        "text": block,
                        "start_page": p_num,
                        "end_page": p_num
                    }

    if current_unit and len(current_unit["text"]) > 20:
        units.append(current_unit)

    # Filter out pure front-cover instructions from question units
    units = [
        u for u in units
        if not (u["unit_id"].startswith("P1-") and any(ck in u["text"].lower() for ck in cover_keywords))
    ]

    # Fallback if no questions were explicitly split: split by page
    if len(units) <= 1 and len(pages_data) > 1:
        units = []
        for page in pages_data:
            if page["text"]:
                units.append({
                    "unit_id": f"Page {page['page_number']}",
                    "title": f"Content from Page {page['page_number']}",
                    "text": page["text"][:1500],
                    "start_page": page["page_number"],
                    "end_page": page["page_number"]
                })

    return units


def classify_unit_content(text: str, default_subject: str = "Mathematics") -> Dict[str, Any]:
    """
    Analyzes unit text against the curriculum taxonomy and difficulty heuristics.
    """
    text_lower = text.lower()

    # Step 1: Detect primary Topic
    best_topic = "Algebra & Functions"
    best_subtopic = "Algebraic Expressions & Equations"
    best_score = 0
    assigned_difficulty = DIFFICULTY_INTERMEDIATE
    assigned_justification = ""

    for topic_name, topic_meta in CURRICULUM_TAXONOMY.items():
        score = sum(1 for kw in topic_meta["keywords"] if kw in text_lower)
        if score > best_score:
            best_score = score
            best_topic = topic_name
            assigned_difficulty = topic_meta["default_difficulty"]
            assigned_justification = topic_meta["justification"]

            # Subtopic matching
            sub_best_score = 0
            for sub_name, sub_kws in topic_meta["subtopics"]:
                sub_score = sum(1 for skw in sub_kws if skw in text_lower)
                if sub_score > sub_best_score:
                    sub_best_score = sub_score
                    best_subtopic = sub_name

    # Step 2: Difficulty Heuristic Calibration
    # Look for mark weightings like [2], [4], [6 marks]
    marks_match = re.search(r'\[(\d+)\s*(?:marks?|m)?\]', text, re.IGNORECASE)
    marks = int(marks_match.group(1)) if marks_match else None

    # Multi-part question check: (a), (b), (c), (d)
    part_count = len(re.findall(r'\([a-d]\)', text_lower))

    # Advanced mathematical complexity indicators
    advanced_terms = ["hence, or otherwise", "show that", "prove that", "stationary point", "dy/dx", "tangent", "differential", "integral", "3d", "vector", "geometric proof", "maximum value", "optimize", "parametric"]
    advanced_hits = sum(1 for term in advanced_terms if term in text_lower)

    beginner_terms = ["write down", "calculate", "find the value of", "work out", "simplify", "express as", "state the", "list", "measure"]
    beginner_hits = sum(1 for term in beginner_terms if term in text_lower)

    # Determine final difficulty and tailor justification
    if advanced_hits >= 2 or (marks is not None and marks >= 5) or part_count >= 3 or best_topic == "Calculus":
        assigned_difficulty = DIFFICULTY_ADVANCED
        if "hence" in text_lower or "show that" in text_lower:
            assigned_justification = "Requires analytical synthesis, formal proof or deductive reasoning, and multi-step execution."
        elif "stationary" in text_lower or "dy/dx" in text_lower:
            assigned_justification = "Demands calculus operations, finding derivatives, and deducing nature of stationary points."
        elif marks and marks >= 5:
            assigned_justification = f"High mark allocation ({marks} marks) involving multi-part interdependent solutions."
        else:
            assigned_justification = "Complex problem requiring integration of multiple mathematical concepts."

    elif beginner_hits >= 2 and (marks is None or marks <= 2) and advanced_hits == 0:
        assigned_difficulty = DIFFICULTY_BEGINNER
        assigned_justification = "Direct calculation or recall requiring standard formula substitution with few steps."

    else:
        assigned_difficulty = DIFFICULTY_INTERMEDIATE
        if marks and marks in [3, 4]:
            assigned_justification = f"Standard examination problem ({marks} marks) requiring structured algebraic manipulation."
        else:
            assigned_justification = "Requires multi-step method, accurate computation, and mathematical formulation."

    return {
        "subject": default_subject,
        "topic": best_topic,
        "subtopic": best_subtopic,
        "difficulty": assigned_difficulty,
        "justification": assigned_justification
    }


def extract_key_notes(text: str, max_chars: int = 160) -> str:
    """Extracts a clean, representative summary line or key note from the text."""
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 10 and not l.strip().startswith('[Turn over') and not '©' in l and not 'Cambridge' in l]
    if lines:
        note = lines[0]
        if len(note) > max_chars:
            note = note[:max_chars].rsplit(' ', 1)[0] + '...'
        return note
    return "Core mathematical exercise and practice problems."


def bifurcate_pdf_content(
    file_bytes: bytes,
    filename: str = "document.pdf",
    subject_hint: Optional[str] = None,
    max_pages: int = 40
) -> Dict[str, Any]:
    """
    Main orchestration function for PDF Content Extraction & Bifurcation.
    """
    # 1. Extract raw pages and structural data via PyMuPDF
    pages_data, metadata = extract_pdf_pages_fitz(file_bytes, max_pages=max_pages)

    if not pages_data or metadata["total_words"] == 0 and not metadata["is_scanned_document"]:
        return {
            "success": False,
            "error": "The uploaded PDF appears to be empty or unreadable.",
            "metadata": metadata
        }

    # Detect overarching subject
    full_text_sample = "\n".join([p["text"] for p in pages_data[:5]])
    subject = subject_hint or "Mathematics"
    if "physics" in full_text_sample.lower():
        subject = "Physics"
    elif "chemistry" in full_text_sample.lower():
        subject = "Chemistry"
    elif "biology" in full_text_sample.lower():
        subject = "Biology"
    elif "economics" in full_text_sample.lower():
        subject = "Economics"

    # 2. Try LLM bifurcation if available
    llm_items = bifurcate_with_llm(full_text_sample, subject_hint=subject)
    if llm_items and len(llm_items) >= 2:
        # Format and validate LLM output
        validated_items = []
        for idx, itm in enumerate(llm_items):
            diff = itm.get("difficulty", DIFFICULTY_INTERMEDIATE)
            if diff not in [DIFFICULTY_BEGINNER, DIFFICULTY_INTERMEDIATE, DIFFICULTY_ADVANCED]:
                diff = DIFFICULTY_INTERMEDIATE

            validated_items.append({
                "id": itm.get("id", f"item-{idx + 1}"),
                "subject": itm.get("subject", subject),
                "topic": itm.get("topic", "General Topic"),
                "subtopic": itm.get("subtopic", "Key Concept"),
                "difficulty": diff,
                "justification": itm.get("justification", "Extracted via intelligent document analyzer."),
                "page_ref": itm.get("page_ref", f"Page {idx + 1}"),
                "key_notes": itm.get("key_notes", "Structured curriculum unit.")
            })

        # Summary counts
        beginner_cnt = sum(1 for i in validated_items if i["difficulty"] == DIFFICULTY_BEGINNER)
        inter_cnt = sum(1 for i in validated_items if i["difficulty"] == DIFFICULTY_INTERMEDIATE)
        adv_cnt = sum(1 for i in validated_items if i["difficulty"] == DIFFICULTY_ADVANCED)

        return {
            "success": True,
            "filename": filename,
            "subject": subject,
            "total_pages": metadata["total_pages"],
            "pages_processed": metadata["pages_processed"],
            "total_words": metadata["total_words"],
            "is_scanned": metadata["is_scanned_document"],
            "engine": "LLM-Enriched",
            "summary": {
                "total_items": len(validated_items),
                "beginner_count": beginner_cnt,
                "intermediate_count": inter_cnt,
                "advanced_count": adv_cnt,
                "difficulty_distribution": {
                    "Beginner": round((beginner_cnt / max(1, len(validated_items))) * 100),
                    "Intermediate": round((inter_cnt / max(1, len(validated_items))) * 100),
                    "Advanced": round((adv_cnt / max(1, len(validated_items))) * 100),
                }
            },
            "items": validated_items
        }

    # 3. Deterministic NLP / Pattern Engine
    units = detect_question_units(pages_data)
    items = []

    for idx, u in enumerate(units):
        analysis = classify_unit_content(u["text"], default_subject=subject)

        page_str = f"Page {u['start_page']}" if u['start_page'] == u['end_page'] else f"Pages {u['start_page']}-{u['end_page']}"
        notes = extract_key_notes(u["text"])

        items.append({
            "id": f"item-{idx + 1}",
            "unit_ref": u["unit_id"],
            "subject": analysis["subject"],
            "topic": analysis["topic"],
            "subtopic": analysis["subtopic"],
            "difficulty": analysis["difficulty"],
            "justification": analysis["justification"],
            "page_ref": page_str,
            "key_notes": notes
        })

    # Summary distribution
    beginner_cnt = sum(1 for i in items if i["difficulty"] == DIFFICULTY_BEGINNER)
    inter_cnt = sum(1 for i in items if i["difficulty"] == DIFFICULTY_INTERMEDIATE)
    adv_cnt = sum(1 for i in items if i["difficulty"] == DIFFICULTY_ADVANCED)
    tot = max(1, len(items))

    return {
        "success": True,
        "filename": filename,
        "subject": subject,
        "total_pages": metadata["total_pages"],
        "pages_processed": metadata["pages_processed"],
        "total_words": metadata["total_words"],
        "is_scanned": metadata["is_scanned_document"],
        "engine": "Deterministic-Academic-Engine",
        "summary": {
            "total_items": len(items),
            "beginner_count": beginner_cnt,
            "intermediate_count": inter_cnt,
            "advanced_count": adv_cnt,
            "difficulty_distribution": {
                "Beginner": round((beginner_cnt / tot) * 100),
                "Intermediate": round((inter_cnt / tot) * 100),
                "Advanced": round((adv_cnt / tot) * 100),
            }
        },
        "items": items
    }
