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
