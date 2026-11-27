from unittest.mock import patch
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.papers.models import Category, Paper
from apps.payments.models import Cart, CartItem, Order, OrderItem, Payment, UserPurchase

User = get_user_model()


class PaymentConfirmationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='shopper@example.com',
            username='shopper@example.com',
            password='testpassword123'
        )
        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(
            name='Cambridge IGCSE Mathematics',
            slug='cambridge-igcse-mathematics-pay',
            is_active=True
        )

        self.paper = Paper.objects.create(
            title='2024 Paper 4 Calculator',
            category=self.category,
            is_free=False,
            is_premium=True,
            price=Decimal('4.99'),
            is_active=True
        )

        # Create cart and cart item
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            paper=self.paper,
            quantity=1,
            price_at_addition=Decimal('4.99')
        )

        # Create order and order item
        self.order = Order.objects.create(
            user=self.user,
            subtotal=Decimal('4.99'),
            tax=Decimal('0.00'),
            total_amount=Decimal('4.99'),
            status='pending',
            currency='USD'
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            paper=self.paper,
            item_name=self.paper.title,
            price=Decimal('4.99'),
            quantity=1,
            subtotal=Decimal('4.99')
        )

        # Create payment record
        self.payment = Payment.objects.create(
            order=self.order,
            payment_method='razorpay',
            amount=Decimal('4.99'),
            currency='USD',
            status='pending'
        )

    @patch('apps.payments.services.PaymentService.verify_razorpay_payment')
    def test_payment_confirmation_provisions_user_purchase_and_clears_cart(self, mock_verify):
        """Confirming payment must create UserPurchase and clear cart atomically."""
        mock_verify.return_value = {
            'success': True,
            'transaction_id': 'pay_test123456',
            'amount': '4.99'
        }

        url = reverse('payments:payment-confirm')
        payload = {
            'order_id': self.order.id,
            'payment_method': 'razorpay',
            'razorpay_payment_id': 'pay_test123456',
            'razorpay_order_id': 'order_test123456',
            'razorpay_signature': 'valid_sig'
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        # Verify Order status
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'completed')

        # Verify Payment status
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'completed')
        self.assertEqual(self.payment.transaction_id, 'pay_test123456')

        # Verify UserPurchase provisioned
        purchases = UserPurchase.objects.filter(user=self.user, paper=self.paper, is_active=True)
        self.assertEqual(purchases.count(), 1)
        purchase = purchases.first()
        self.assertEqual(purchase.purchase_price, Decimal('4.99'))

        # Verify Cart cleared
        self.assertEqual(self.cart.items.count(), 0)

        # Test Idempotency: calling again must return 200 without creating duplicate purchases
        second_response = self.client.post(url, payload, format='json')
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)
        self.assertEqual(second_response.data['message'], 'Payment already confirmed')
        self.assertEqual(UserPurchase.objects.filter(user=self.user, paper=self.paper).count(), 1)

    @patch('apps.payments.services.PaymentService.create_payment_intent_stripe')
    def test_gst_calculation_and_rounding(self, mock_stripe):
        mock_stripe.return_value = {'client_secret': 'sec_123', 'payment_intent_id': 'pi_123'}
        url = reverse('payments:order-list')
        response = self.client.post(url, {'payment_method': 'stripe', 'notes': 'test'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data['data']
        self.assertEqual(data['total_amount'], '5.89')

        created_order = Order.objects.get(id=data['id'])
        self.assertEqual(created_order.subtotal, Decimal('4.99'))
        self.assertEqual(created_order.tax, Decimal('0.90'))
        self.assertEqual(created_order.total_amount, Decimal('5.89'))

    @patch('apps.payments.services.PaymentService.create_payment_intent_stripe')
    def test_price_tampering_prevention(self, mock_stripe):
        mock_stripe.return_value = {'client_secret': 'sec_123', 'payment_intent_id': 'pi_123'}
        self.cart_item.price_at_addition = Decimal('0.50')  # Attempt to tamper price
        self.cart_item.save(update_fields=['price_at_addition'])

        url = reverse('payments:order-list')
        response = self.client.post(url, {'payment_method': 'stripe'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        data = response.data['data']
        self.assertEqual(data['total_amount'], '5.89')
