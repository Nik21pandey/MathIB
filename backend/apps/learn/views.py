"""
Views for the learning platform. Thin: the logic lives in services.py.
"""

from xml.sax.saxutils import escape

from django.conf import settings
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import get_catalog, sitemap_paths
from .adaptive_engine import HighYieldAdaptiveEngine


class CatalogView(APIView):
    """
    GET /api/v1/learn/catalog/
    Public: the whole catalog (syllabuses, topics, notes, questions, checklists).
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(get_catalog())


def _frontend_url():
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')


def sitemap_xml(request):
    """GET /sitemap.xml - one <url> per syllabus, section, topic and question page."""
    base = _frontend_url()
    urls = ''.join(f'<url><loc>{escape(base + path)}</loc></url>' for path in sitemap_paths())
    xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>'
    return HttpResponse(xml, content_type='application/xml')


def robots_txt(request):
    """GET /robots.txt - points crawlers at the sitemap."""
    sitemap = request.build_absolute_uri('/sitemap.xml')
    return HttpResponse(f'User-agent: *\nAllow: /\nSitemap: {sitemap}\n', content_type='text/plain')


class HighYieldStudyPlanView(APIView):
    """
    GET /api/v1/learn/adaptive/high-yield/?curriculum=Cambridge+IGCSE+0580
    Returns ranked high-yield topic predictions with yield scores and exam probabilities.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        curriculum = request.query_params.get('curriculum', 'Cambridge IGCSE 0580')
        engine = HighYieldAdaptiveEngine(curriculum=curriculum)
        plan = engine.generate_high_yield_study_plan()
        return Response({
            'success': True,
            'curriculum': curriculum,
            'high_yield_topics': plan,
            'count': len(plan)
        })


class AdaptiveRecommendationsView(APIView):
    """
    GET /api/v1/learn/adaptive/recommendations/?curriculum=...&mastery=0.5&limit=5
    Returns personalized next best questions in student's Zone of Proximal Development.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        curriculum = request.query_params.get('curriculum', 'Cambridge IGCSE 0580')
        try:
            mastery = float(request.query_params.get('mastery', 0.5))
        except (ValueError, TypeError):
            mastery = 0.5
        try:
            limit = int(request.query_params.get('limit', 5))
        except (ValueError, TypeError):
            limit = 5

        engine = HighYieldAdaptiveEngine(curriculum=curriculum)
        catalog = get_catalog()
        questions = catalog.get('questions', [])

        recommendations = engine.recommend_next_questions(questions, student_mastery=mastery, limit=limit)
        return Response({
            'success': True,
            'mastery_level': mastery,
            'recommendations': recommendations,
            'count': len(recommendations)
        })

