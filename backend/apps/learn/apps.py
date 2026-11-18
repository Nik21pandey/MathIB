from django.apps import AppConfig


class LearnConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.learn'
    verbose_name = 'Learning Platform (syllabuses, topics, questions)'

    def ready(self):
        """Clear the cached catalog whenever content changes."""
        from . import signals  # noqa: F401
