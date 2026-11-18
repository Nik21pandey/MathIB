from django.core.cache import cache
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Checklist, ExamSession, Question, Section, Syllabus, Topic
from .services import CATALOG_CACHE_KEY


@receiver([post_save, post_delete], sender=Syllabus)
@receiver([post_save, post_delete], sender=Section)
@receiver([post_save, post_delete], sender=Topic)
@receiver([post_save, post_delete], sender=Question)
@receiver([post_save, post_delete], sender=Checklist)
@receiver([post_save, post_delete], sender=ExamSession)
def clear_catalog_cache(sender, **kwargs):
    cache.delete(CATALOG_CACHE_KEY)
