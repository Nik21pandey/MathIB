"""
Management command: seed_papers (Deprecated)
Synthetic paper seeding has been permanently disabled.
Official papers must be uploaded via the ingestion tool or admin dashboard.
"""

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Deprecated: Seeding synthetic papers is disabled to ensure only real official PDFs are served.'

    def handle(self, *args, **options):
        self.stdout.write("seed_papers is deprecated. MathIB serves only authentic official examination PDFs.")
