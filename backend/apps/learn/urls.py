"""
URL patterns for the learning platform API
"""

from django.urls import path

from .views import CatalogView

app_name = 'learn'

urlpatterns = [
    path('catalog/', CatalogView.as_view(), name='catalog'),
]
