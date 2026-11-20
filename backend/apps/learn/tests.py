"""
Tests for MathIB Learn app: models, catalog service, and API views.
"""

from django.test import TestCase, Client
from django.urls import reverse
from .models import Syllabus, Section, Topic, Question, ExamSession
from .services import build_catalog, get_catalog


class LearnCatalogTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.session = ExamSession.objects.create(
            key='may-2027',
            name='May 2027 Examinations',
            starts='2027-05-01',
            approximate=True
        )
        self.syllabus = Syllabus.objects.create(
            slug='ibdp-math-aa-hl',
            board='ib',
            board_name='International Baccalaureate',
            code='AA HL',
            name='IB DP Mathematics: Analysis and Approaches HL',
            short='IBDP AA HL',
            level='ib-aa-hl',
            status='live',
            blurb='Test syllabus'
        )
        self.section = Section.objects.create(
            syllabus=self.syllabus,
            slug='number-and-algebra',
            name='Number and Algebra',
            blurb='Sequences and series'
        )
        self.topic = Topic.objects.create(
            key='binomial',
            section=self.section,
            slug='binomial-theorem',
            name='Binomial Theorem',
            summary='Expand powers of a binomial',
            generators=['binomial-coefficient'],
            notes={'points': ['Key point 1'], 'formulas': [], 'gdc': [], 'traps': []}
        )
        self.question = Question.objects.create(
            key='bi1',
            topic=self.topic,
            difficulty='easy',
            marks=3,
            calculator=False,
            stem='Find the coefficient of $x^3$.',
            parts=[],
            scheme=[{'mark': 'M1', 'text': 'Binomial formula'}, {'mark': 'A1', 'text': 'Answer'}],
            answer='40'
        )

    def test_build_catalog_structure(self):
        catalog = build_catalog()
        self.assertIn('version', catalog)
        self.assertIn('boards', catalog)
        self.assertIn('syllabuses', catalog)
        self.assertIn('topics', catalog)
        self.assertIn('questions', catalog)

        # Verify topic serialization
        topic_entry = next((t for t in catalog['topics'] if t['id'] == 'binomial'), None)
        self.assertIsNotNone(topic_entry)
        self.assertEqual(topic_entry['syllabus'], 'ibdp-math-aa-hl')
        self.assertEqual(topic_entry['section'], 'number-and-algebra')

        # Verify question serialization
        question_entry = next((q for q in catalog['questions'] if q['id'] == 'bi1'), None)
        self.assertIsNotNone(question_entry)
        self.assertEqual(question_entry['marks'], 3)
        self.assertFalse(question_entry['calc'])

    def test_catalog_api_endpoint(self):
        url = reverse('learn:catalog')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('syllabuses', data)
        self.assertIn('topics', data)

    def test_sitemap_endpoint(self):
        url = reverse('sitemap')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/xml')
        self.assertIn(b'<?xml version="1.0" encoding="UTF-8"?>', response.content)
        self.assertIn(b'<urlset', response.content)

    def test_robots_endpoint(self):
        url = reverse('robots')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'User-agent: *', response.content)
        self.assertIn(b'Sitemap:', response.content)

    def test_safe_jwt_gracefully_degrades_on_public_endpoint(self):
        url = reverse('learn:catalog')
        # Pass a stale, malformed, or nonexistent user token in Authorization header
        response = self.client.get(url, HTTP_AUTHORIZATION='Bearer stale_or_invalid_jwt_token_12345')
        self.assertEqual(response.status_code, 200)

