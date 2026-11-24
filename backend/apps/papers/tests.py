from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.papers.models import Category, Paper, Bundle
from apps.papers.serializers import PaperListSerializer, PaperDetailSerializer
from apps.papers.pdf_utils import merge_pdf_fields_incremental
from apps.papers.exam_parser import LayoutAwareExamParser, COMMAND_TERMS_WEIGHT
from apps.payments.models import UserPurchase

import fitz

User = get_user_model()


class PaperPaywallSecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='student@example.com',
            username='student@example.com',
            password='testpassword123'
        )
        self.category = Category.objects.create(
            name='Cambridge IGCSE Mathematics',
            slug='cambridge-igcse-mathematics',
            is_active=True
        )

        # Generate a minimal valid 1-page PDF
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 72), "1  Calculate the value of 2x + 7 when x = 3. [2 marks]")
        pdf_bytes = doc.tobytes()
        doc.close()

        self.sample_pdf = SimpleUploadedFile("test_paper.pdf", pdf_bytes, content_type="application/pdf")

        # Create a paid paper
        self.paid_paper = Paper.objects.create(
            title='2024 Extended Paper 4 Calculator',
            category=self.category,
            pdf_file=self.sample_pdf,
            is_free=False,
            is_premium=True,
            price=Decimal('4.99'),
            is_active=True
        )

        # Create a free paper
        self.free_pdf = SimpleUploadedFile("free_paper.pdf", pdf_bytes, content_type="application/pdf")
        self.free_paper = Paper.objects.create(
            title='2024 Specimen Paper 2',
            category=self.category,
            pdf_file=self.free_pdf,
            is_free=True,
            is_premium=False,
            price=Decimal('0.00'),
            is_active=True
        )

    def test_anonymous_user_blocked_from_paid_paper_file(self):
        """Anonymous users must receive 402 Payment Required when requesting paid paper PDF."""
        url = reverse('papers:paper-file', kwargs={'paper_id': self.paid_paper.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertFalse(response.data['success'])

    def test_authenticated_user_without_purchase_blocked(self):
        """Authenticated users without purchase record must receive 402 Payment Required."""
        self.client.force_authenticate(user=self.user)
        url = reverse('papers:paper-file', kwargs={'paper_id': self.paid_paper.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)

    def test_serializer_masks_paid_pdf_url_for_unauthorized_users(self):
        """PaperListSerializer and PaperDetailSerializer must NOT leak PDF url to unauthorized users."""
        serializer = PaperListSerializer(self.paid_paper)
        self.assertIsNone(serializer.data['pdf_url'])

        detail_serializer = PaperDetailSerializer(self.paid_paper)
        self.assertIsNone(detail_serializer.data['pdf_url'])

    def test_purchased_user_granted_access(self):
        """Once UserPurchase is created, user gets access to paid paper."""
        from apps.payments.models import Order
        order = Order.objects.create(
            user=self.user,
            subtotal=self.paid_paper.price,
            total_amount=self.paid_paper.price,
            status='completed'
        )
        UserPurchase.objects.create(
            user=self.user,
            order=order,
            paper=self.paid_paper,
            purchase_price=self.paid_paper.price,
            is_active=True
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('papers:paper-file', kwargs={'paper_id': self.paid_paper.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_free_paper_accessible_by_anonymous_users(self):
        """Free papers must be accessible without authentication."""
        url = reverse('papers:paper-file', kwargs={'paper_id': self.free_paper.id})
        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_302_FOUND])


class ExamParserTestCase(TestCase):
    def test_question_slicing_and_cognitive_scoring(self):
        """Test LayoutAwareExamParser on Cambridge multi-mark problem."""
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 72), "1  (a) Show that x^2 - 4x + 4 = (x-2)^2. [2 marks]\n\n"
                                   "(b) Hence solve the equation (x-2)^2 = 9. [3 marks]")
        pdf_bytes = doc.tobytes()
        doc.close()

        parser = LayoutAwareExamParser(pdf_bytes)
        questions = parser.parse_all_questions()
        parser.close()

        self.assertGreaterEqual(len(questions), 1)
        q1 = questions[0]
        self.assertEqual(q1['question_number'], 1)
        self.assertEqual(q1['marks'], 5)
        self.assertIn('show that', q1['command_terms'])
        self.assertGreater(q1['cognitive_score'], 2.5)
