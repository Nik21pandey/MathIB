"""
Builds the catalog the frontend loads once and filters in the browser.
The shape matches frontend/src/learn/types.ts.
"""

from django.core.cache import cache

from .models import Checklist, ExamSession, Question, Syllabus, Topic

CATALOG_CACHE_KEY = 'learn:catalog:v1'
CATALOG_CACHE_SECONDS = 300


def build_catalog():
    syllabuses = list(Syllabus.objects.prefetch_related('sections'))

    boards = []
    seen = set()
    for s in syllabuses:
        if s.board not in seen:
            seen.add(s.board)
            boards.append({'id': s.board, 'name': s.board_name})

    syllabus_data = []
    for s in syllabuses:
        item = {
            'slug': s.slug,
            'board': s.board,
            'code': s.code,
            'name': s.name,
            'short': s.short,
            'level': s.level,
            'status': s.status,
            'blurb': s.blurb,
            'papers': s.papers or [],
            'sections': [
                {'slug': sec.slug, 'name': sec.name, 'blurb': sec.blurb, **({'hub': True} if sec.is_hub else {})}
                for sec in s.sections.all()
            ],
        }
        if s.versions:
            item['versions'] = s.versions
            item['versionNote'] = s.version_note
        syllabus_data.append(item)

    topic_data = []
    topics = Topic.objects.filter(is_active=True).select_related('section__syllabus').order_by(
        'section__syllabus__display_order', 'section__display_order', 'display_order', 'name'
    )
    for t in topics:
        item = {
            'id': t.key,
            'syllabus': t.section.syllabus.slug,
            'section': t.section.slug,
            'slug': t.slug,
            'name': t.name,
            'summary': t.summary,
            'generators': t.generators or [],
            'notes': {
                'points': (t.notes or {}).get('points', []),
                'formulas': (t.notes or {}).get('formulas', []),
                'gdc': (t.notes or {}).get('gdc', []),
                'traps': (t.notes or {}).get('traps', []),
            },
            'video': t.video or None,
        }
        if t.tag:
            item['tag'] = t.tag
        if t.removed_in:
            item['removedIn'] = t.removed_in
        if t.investigation:
            item['investigation'] = t.investigation
        if t.bands:
            item['bands'] = t.bands
        topic_data.append(item)

    question_data = []
    questions = Question.objects.filter(is_active=True, topic__is_active=True).select_related('topic')
    for q in questions:
        item = {
            'id': q.key,
            'topic': q.topic.key,
            'slug': q.slug,
            'difficulty': q.difficulty,
            'marks': q.marks,
            'calc': q.calculator,
            'stem': q.stem,
            'parts': q.parts or [],
            'scheme': q.scheme or [],
            'answer': q.answer,
            'video': q.video or None,
        }
        if q.criterion:
            item['criterion'] = q.criterion
        question_data.append(item)

    return {
        'version': 1,
        'boards': boards,
        'sessions': [
            {'id': s.key, 'name': s.name, 'starts': s.starts.isoformat(), 'approximate': s.approximate}
            for s in ExamSession.objects.all()
        ],
        'syllabuses': syllabus_data,
        'topics': topic_data,
        'questions': question_data,
        'checklists': [
            {'slug': c.slug, 'syllabus': c.syllabus.slug, 'paper': c.paper, 'title': c.title, 'items': c.items or []}
            for c in Checklist.objects.select_related('syllabus')
        ],
    }


def get_catalog():
    catalog = cache.get(CATALOG_CACHE_KEY)
    if catalog is None:
        catalog = build_catalog()
        cache.set(CATALOG_CACHE_KEY, catalog, CATALOG_CACHE_SECONDS)
    return catalog


def sitemap_paths():
    """Every public learning URL, for sitemap.xml."""
    catalog = get_catalog()
    paths = ['/', '/contents', '/learn', '/daily-5', '/worksheet-builder', '/crash']
    live = {s['slug'] for s in catalog['syllabuses'] if s['status'] == 'live'}
    for s in catalog['syllabuses']:
        if s['slug'] in live:
            paths.append(f"/{s['slug']}")
            paths.extend(f"/{s['slug']}/{sec['slug']}" for sec in s['sections'])
    for t in catalog['topics']:
        if t['syllabus'] in live:
            paths.append(f"/{t['syllabus']}/{t['section']}/{t['slug']}")
    paths.extend(f"/question/{q['slug']}" for q in catalog['questions'])
    paths.extend(f"/crash/{c['slug']}" for c in catalog['checklists'])
    return paths
