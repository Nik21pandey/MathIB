"""
URL patterns for the learning platform API
"""

from django.urls import path

from .views import CatalogView, HighYieldStudyPlanView, AdaptiveRecommendationsView

app_name = 'learn'

urlpatterns = [
    path('catalog/', CatalogView.as_view(), name='catalog'),
    path('adaptive/high-yield/', HighYieldStudyPlanView.as_view(), name='adaptive-high-yield'),
    path('adaptive/recommendations/', AdaptiveRecommendationsView.as_view(), name='adaptive-recommendations'),
]
