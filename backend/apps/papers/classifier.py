"""
MathIB Intelligent Document Classifier
Parses filenames, path structures, and page text to categorize:
- Syllabuses: IBDP AA/AI, IB MYP, Cambridge IGCSE 0580/0607/0606, A-Level 9709, Edexcel IGCSE 4MA1, Edexcel GCSE 1MA1
- Document Types: Question Paper (QP), Mark Scheme (MS), Examiner Report (ER), Notes, Worksheet
- Metadata: Year, Season, Zone, Paper Number, Variant, Topic, Subtopic
"""

import re
import os
from typing import Optional, Dict, Any


class DocumentClassifier:
    """
    Classifies examination papers, topical packets, and revision guides.
    """

    # Cambridge standard patterns: {code}_{season}{year}_{type}_{component}{variant}.pdf
    # Examples: 0580_s23_qp_21.pdf, 0607_w22_ms_42.pdf, 9709_m21_qp_12.pdf
    CAMBRIDGE_PATTERN = re.compile(
        r'^(?P<code>0580|0607|0606|9709)_(?P<season>[smw])(?P<year>\d{2})_(?P<type>qp|ms|er|in)_(?P<paper>\d)(?P<variant>\d)?',
        re.IGNORECASE
    )

    # IB official exam pattern: {M|N}{year}_{group}_MAT{AA|AI}_{H|S}P{1|2|3}_{lang}_{tz}_{code}[_M].pdf
    # Examples: M23_5_MATAA_HP1_ENG_TZ1_XX.pdf, N22_5_MATAI_SP2_ENG_TZ0_XX_M.pdf
    IB_PATTERN = re.compile(
        r'^(?P<season>[MN])(?P<year>\d{2})_\d+_MAT(?P<course>AA|AI)_(?P<level>[HS])P(?P<paper>[123])_(?P<lang>[A-Z]{3})_(?P<tz>TZ[012])_XX(?P<ms>_M)?',
        re.IGNORECASE
    )

    # Pearson Edexcel IGCSE 4MA1 & GCSE 1MA1 pattern:
    # Examples: 4MA1_1H_que_20230608.pdf, 4MA1_1H_rms_20230824.pdf, 1MA1_1H_qp.pdf, 1MA1_2H_ms.pdf
    EDEXCEL_PATTERN = re.compile(
        r'^(?P<code>4MA1|1MA1)_(?P<paper>[123])(?P<tier>[HF])_(?P<type>que|rms|msc|qp|ms)(?:_(?P<date>\d{4,8}))?',
        re.IGNORECASE
    )

    # Topical pattern: {code}_{topic}_{subtopic}.pdf or {code}_{topic}.pdf
    TOPICAL_PATTERN = re.compile(
        r'^(?P<code>0580|0607|0606|9709|IB_AA_HL|IB_AA_SL|IB_AI_HL|IB_AI_SL|MYP|4MA1|1MA1)_(?P<topic>[a-zA-Z0-9_-]+)',
        re.IGNORECASE
    )

    SEASON_MAP = {
        's': 'May/June',
        'm': 'Feb/March',
        'w': 'Oct/Nov',
        'M': 'May',
        'N': 'November',
        'jun': 'June',
        'jan': 'January',
        'nov': 'November',
    }

    SYLLABUS_NAMES = {
        '0580': 'Cambridge IGCSE Mathematics (0580)',
        '0607': 'Cambridge IGCSE International Mathematics (0607)',
        '0606': 'Cambridge IGCSE Additional Mathematics (0606)',
        '9709': 'Cambridge International A Level Mathematics (9709)',
        'AA_HL': 'IB DP Mathematics: Analysis and Approaches HL',
        'AA_SL': 'IB DP Mathematics: Analysis and Approaches SL',
        'AI_HL': 'IB DP Mathematics: Applications and Interpretation HL',
        'AI_SL': 'IB DP Mathematics: Applications and Interpretation SL',
        'MYP': 'IB Middle Years Programme (MYP) Mathematics',
        '4MA1': 'Pearson Edexcel International GCSE Mathematics A (4MA1)',
        '1MA1': 'Pearson Edexcel GCSE Mathematics (1MA1)',
    }

    @classmethod
    def classify_filename(cls, filename: str) -> Dict[str, Any]:
        """
        Extract structured metadata from filename and directory path.
        """
        norm_path = os.path.normpath(filename)
        path_parts = norm_path.split(os.sep)
        basename = os.path.basename(filename)
        name_without_ext = os.path.splitext(basename)[0]

        # 1. Try Cambridge format
        cam_match = cls.CAMBRIDGE_PATTERN.match(name_without_ext)
        if cam_match:
            d = cam_match.groupdict()
            code = d['code']
            year_short = int(d['year'])
            full_year = 2000 + year_short if year_short < 70 else 1900 + year_short
            season_raw = d['season'].lower()
            season = cls.SEASON_MAP.get(season_raw, season_raw.upper())
            type_raw = d['type'].lower()
            doc_type = 'question' if type_raw in ('qp', 'in') else ('marking-scheme' if type_raw == 'ms' else 'examiner-report')
            paper_num = d['paper']
            variant = d.get('variant') or '1'
            pair_key = f"{code}_{season_raw}{d['year']}_{paper_num}{variant}"

            return {
                "matched": True,
                "format": "cambridge",
                "code": code,
                "curriculum": cls.SYLLABUS_NAMES.get(code, code),
                "year": full_year,
                "season": season,
                "paper_number": f"Paper {paper_num}",
                "variant": variant,
                "type": doc_type,
                "title": f"{code} {season} {full_year} Paper {paper_num}{variant} ({doc_type.upper()})",
                "pair_key": pair_key,
                "is_markscheme": doc_type == 'marking-scheme',
            }

        # 2. Try IB official exam format
        ib_match = cls.IB_PATTERN.match(name_without_ext)
        if ib_match:
            d = ib_match.groupdict()
            course = d['course'].upper()
            level = "HL" if d['level'].upper() == "H" else "SL"
            code = f"AA_{level}" if course == "AA" else f"AI_{level}"
            year_short = int(d['year'])
            full_year = 2000 + year_short
            season_raw = d['season'].upper()
            season = cls.SEASON_MAP.get(season_raw, season_raw)
            paper_num = d['paper']
            tz = d['tz'].upper()
            is_ms = bool(d.get('ms')) or name_without_ext.endswith('_M')
            doc_type = 'marking-scheme' if is_ms else 'question'
            pair_key = f"IB_{course}_{level}_{season_raw}{d['year']}_P{paper_num}_{tz}"

            return {
                "matched": True,
                "format": "ib_exam",
                "code": code,
                "curriculum": cls.SYLLABUS_NAMES.get(code, f"IB {course} {level}"),
                "year": full_year,
                "season": season,
                "zone": tz,
                "paper_number": f"Paper {paper_num}",
                "type": doc_type,
                "title": f"IB DP Math {course} {level} {season} {full_year} Paper {paper_num} {tz} ({doc_type.upper()})",
                "pair_key": pair_key,
                "is_markscheme": is_ms,
            }

        # 3. Try Pearson Edexcel 4MA1 / 1MA1 format
        edx_match = cls.EDEXCEL_PATTERN.match(name_without_ext)
        if edx_match:
            d = edx_match.groupdict()
            code = d['code'].upper()
            paper_num = d['paper']
            tier = d['tier'].upper()
            type_raw = d['type'].lower()
            is_ms = type_raw in ('rms', 'msc', 'ms')
            doc_type = 'marking-scheme' if is_ms else 'question'
            date_val = d.get('date') or ''
            year = 2024
            season = 'Summer'
            if date_val:
                if len(date_val) >= 4:
                    year = int(date_val[:4])
                if len(date_val) >= 6:
                    month = date_val[4:6]
                    if month in ('05', '06'):
                        season = 'May/June'
                    elif month in ('01', '02'):
                        season = 'January'
                    elif month in ('10', '11'):
                        season = 'October/November'
            tier_label = 'Higher' if tier == 'H' else 'Foundation'
            pair_key = f"{code}_{year}_{season}_{paper_num}{tier}"

            return {
                "matched": True,
                "format": "edexcel",
                "code": code,
                "curriculum": cls.SYLLABUS_NAMES.get(code, code),
                "year": year,
                "season": season,
                "paper_number": f"Paper {paper_num}{tier} ({tier_label})",
                "tier": tier_label,
                "type": doc_type,
                "title": f"Edexcel {code} {season} {year} Paper {paper_num}{tier} ({doc_type.upper()})",
                "pair_key": pair_key,
                "is_markscheme": is_ms,
            }

        # 4. Try Flexible Human-Friendly Exam Filename
        # e.g., "Edexcel_4MA1_2023_June_Paper_1H_QP", "IB_AA_HL_2024_May_Paper_1_TZ2_MS"
        is_ms_kw = bool(re.search(r'\b(ms|markscheme|mark_scheme|rms|answers?)\b', name_without_ext, re.IGNORECASE))
        is_qp_kw = bool(re.search(r'\b(qp|question_paper|questions?|que)\b', name_without_ext, re.IGNORECASE))
        year_m = re.search(r'\b(20\d{2})\b', name_without_ext)
        year = int(year_m.group(1)) if year_m else None

        season = None
        for s_key in ['january', 'february', 'march', 'may', 'june', 'october', 'november', 'summer', 'winter']:
            if s_key in name_without_ext.lower():
                season = s_key.capitalize()
                break

        paper_m = re.search(r'paper\s*([0-9][a-zA-Z]?)', name_without_ext, re.IGNORECASE)
        paper_num = f"Paper {paper_m.group(1).upper()}" if paper_m else None

        # Check curriculum code
        code = None
        for test_code, curr_name in cls.SYLLABUS_NAMES.items():
            if test_code.lower() in name_without_ext.lower() or test_code.replace('_', ' ').lower() in name_without_ext.lower():
                code = test_code
                break

        if code and year and (is_ms_kw or is_qp_kw):
            doc_type = 'marking-scheme' if is_ms_kw else 'question'
            pair_key = f"{code}_{year}_{season or 'Session'}_{paper_num or 'P1'}"
            return {
                "matched": True,
                "format": "flexible_exam",
                "code": code,
                "curriculum": cls.SYLLABUS_NAMES.get(code, code),
                "year": year,
                "season": season or 'May/June',
                "paper_number": paper_num or 'Paper 1',
                "type": doc_type,
                "title": f"{code} {season or ''} {year} {paper_num or ''} ({doc_type.upper()})".strip(),
                "pair_key": pair_key,
                "is_markscheme": doc_type == 'marking-scheme',
            }

        # 5. Try Directory Path Context (e.g. 0580/Trigonometry/Bearings/Worksheet.pdf)
        if len(path_parts) >= 2:
            dir_context = path_parts[-2]
            for test_code in cls.SYLLABUS_NAMES.keys():
                if test_code.lower() in dir_context.lower():
                    code = test_code
                    topic = path_parts[-1] if len(path_parts) >= 3 else dir_context
                    return {
                        "matched": True,
                        "format": "topical",
                        "code": code,
                        "curriculum": cls.SYLLABUS_NAMES.get(code, code),
                        "topic": topic.replace('_', ' ').replace('-', ' ').title(),
                        "type": "topical-worksheet",
                        "title": f"{code} {topic} Topical Resource",
                        "is_markscheme": is_ms_kw,
                    }

        # 6. Try Topical / Chapter format (e.g. 0580_trigonometry_bearings.pdf)
        top_match = cls.TOPICAL_PATTERN.match(name_without_ext)
        if top_match:
            d = top_match.groupdict()
            code = d['code']
            parts = name_without_ext.split('_')
            topic = parts[1].replace('-', ' ').title() if len(parts) > 1 else 'General'
            subtopic = parts[2].replace('-', ' ').title() if len(parts) > 2 else ''

            return {
                "matched": True,
                "format": "topical",
                "code": code,
                "curriculum": cls.SYLLABUS_NAMES.get(code, code),
                "topic": topic,
                "subtopic": subtopic,
                "type": "topical-worksheet",
                "title": f"{code} {topic}{f' - {subtopic}' if subtopic else ''} Topical Worksheet",
                "is_markscheme": is_ms_kw,
            }

        # 7. Fallback: Unclassified document
        human_title = name_without_ext.replace('_', ' ').replace('-', ' ').title()
        return {
            "matched": False,
            "format": "generic",
            "title": human_title,
            "type": "question",
            "is_markscheme": False,
        }
