"""
Loads the content catalog (built by `node content/build.mjs`) into the database.

    python manage.py seed_learn
    python manage.py seed_learn --file path/to/catalog.json

Safe to run again: existing rows are updated by their slug or key, and anything you
added in the admin that is not in the file is left alone.
"""

import json
from datetime import date
from pathlib import Path

from django.core.cache import cache
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.learn.models import Checklist, ExamSession, Question, Section, Syllabus, Topic
from apps.learn.services import CATALOG_CACHE_KEY

DEFAULT_FILE = Path(__file__).resolve().parent.parent.parent / 'seed' / 'catalog.json'


class Command(BaseCommand):
    help = 'Load syllabuses, topics, notes, questions and checklists from the content catalog'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=str(DEFAULT_FILE), help='Path to catalog.json')

    @transaction.atomic
    def handle(self, *args, **options):
        path = Path(options['file'])
        if not path.exists():
            raise CommandError(f'{path} not found. Run `node content/build.mjs` first.')
        catalog = json.loads(path.read_text(encoding='utf-8'))
        board_names = {b['id']: b['name'] for b in catalog['boards']}

        syllabuses = {}
        sections = {}
        for order, s in enumerate(catalog['syllabuses']):
            syllabus, _ = Syllabus.objects.update_or_create(
                slug=s['slug'],
                defaults={
                    'board': s['board'],
                    'board_name': board_names.get(s['board'], s['board']),
                    'code': s['code'],
                    'name': s['name'],
                    'short': s['short'],
                    'level': s.get('level', ''),
                    'status': s.get('status', 'live'),
                    'blurb': s.get('blurb', ''),
                    'papers': s.get('papers', []),
                    'versions': s.get('versions'),
                    'version_note': s.get('versionNote', ''),
                    'display_order': order,
                },
            )
            syllabuses[s['slug']] = syllabus
            for sec_order, sec in enumerate(s.get('sections', [])):
                section, _ = Section.objects.update_or_create(
                    syllabus=syllabus,
                    slug=sec['slug'],
                    defaults={
                        'name': sec['name'],
                        'blurb': sec.get('blurb', ''),
                        'is_hub': bool(sec.get('hub')),
                        'display_order': sec_order,
                    },
                )
                sections[(s['slug'], sec['slug'])] = section

        topics = {}
        for order, t in enumerate(catalog['topics']):
            topic, _ = Topic.objects.update_or_create(
                key=t['id'],
                defaults={
                    'section': sections[(t['syllabus'], t['section'])],
                    'slug': t['slug'],
                    'name': t['name'],
                    'summary': t.get('summary', ''),
                    'tag': t.get('tag', ''),
                    'removed_in': t.get('removedIn', ''),
                    'generators': t.get('generators', []),
                    'notes': t.get('notes', {}),
                    'investigation': t.get('investigation'),
                    'bands': t.get('bands'),
                    'video': t.get('video') or '',
                    'display_order': order,
                },
            )
            topics[t['id']] = topic

        for order, q in enumerate(catalog['questions']):
            Question.objects.update_or_create(
                key=q['id'],
                defaults={
                    'topic': topics[q['topic']],
                    'difficulty': q['difficulty'],
                    'marks': q['marks'],
                    'calculator': q['calc'],
                    'stem': q['stem'],
                    'parts': q.get('parts', []),
                    'scheme': q['scheme'],
                    'answer': q.get('answer', ''),
                    'video': q.get('video') or '',
                    'criterion': q.get('criterion', ''),
                    'display_order': order,
                },
            )

        for c in catalog.get('checklists', []):
            Checklist.objects.update_or_create(
                slug=c['slug'],
                defaults={
                    'syllabus': syllabuses[c['syllabus']],
                    'paper': c['paper'],
                    'title': c['title'],
                    'items': c['items'],
                },
            )

        for s in catalog.get('sessions', []):
            ExamSession.objects.update_or_create(
                key=s['id'],
                defaults={
                    'name': s['name'],
                    'starts': date.fromisoformat(s['starts']),
                    'approximate': s.get('approximate', True),
                },
            )

        cache.delete(CATALOG_CACHE_KEY)
        self.stdout.write(self.style.SUCCESS(
            f"Loaded {len(catalog['syllabuses'])} syllabuses, {len(topics)} topics, "
            f"{len(catalog['questions'])} questions and {len(catalog.get('checklists', []))} checklists."
        ))
