"""
Management command: clear_all_papers
Purges mock and synthetic papers, bundles, questions, and associated mock records
so the platform remains completely clean for authentic user PDF uploads.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from apps.papers.models import Paper, Bundle
from apps.learn.models import Question
from apps.payments.models import Order, OrderItem, Payment, UserPurchase, Cart, CartItem


class Command(BaseCommand):
    help = 'Purges mock papers, questions, bundles, and associated records'

    def add_arguments(self, parser):
        parser.add_argument('--all', action='store_true', help='Force clear all papers and orders completely')

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Purging mock questions, synthetic papers, and mock records...")

        # 1. Delete all questions from learn app (catalog questions are now empty)
        questions_count = Question.objects.all().delete()[0]

        mock_filter = (
            Q(description__icontains='Mock') |
            Q(description__icontains='Synthetic') |
            Q(pdf_file__icontains='sample') |
            Q(pdf_file__icontains='0580_s24') |
            Q(pdf_file__icontains='edexcel_') |
            Q(pdf_file__icontains='ib_aa_') |
            Q(title__icontains='0580/22 Paper 2 (Extended)') |
            Q(title__icontains='0580/42 Paper 4 (Extended)') |
            Q(title__icontains='0607/22 Paper 2 (Extended)') |
            Q(title__icontains='0607/42 Paper 4 (Extended)') |
            Q(title__icontains='IB DP Math AA HL Paper') |
            Q(title__icontains='Edexcel IGCSE 4MA1') |
            Q(title__icontains='Edexcel GCSE 1MA1')
        )

        if options.get('all'):
            cart_items_count = CartItem.objects.all().delete()[0]
            carts_count = Cart.objects.all().delete()[0]
            payments_count = Payment.objects.all().delete()[0]
            purchases_count = UserPurchase.objects.all().delete()[0]
            order_items_count = OrderItem.objects.all().delete()[0]
            orders_count = Order.objects.all().delete()[0]
            bundles_count = Bundle.objects.all().delete()[0]
            papers_count = Paper.objects.all().delete()[0]
        else:
            cart_items_count = 0
            carts_count = 0
            payments_count = 0
            purchases_count = 0
            order_items_count = 0
            orders_count = 0
            bundles_count = Bundle.objects.filter(
                Q(name__icontains='Mock') | Q(name__icontains='Starter') | Q(slug__icontains='starter')
            ).delete()[0]
            papers_count = Paper.objects.filter(mock_filter).delete()[0]

        self.stdout.write(self.style.SUCCESS(
            f"Successfully cleared:\n"
            f"  - Questions: {questions_count}\n"
            f"  - Mock Papers: {papers_count}\n"
            f"  - Mock Bundles: {bundles_count}\n"
            f"  - Orders/Purchases: {orders_count + purchases_count + payments_count}\n"
            f"Database is clean and ready for real official PDFs."
        ))
