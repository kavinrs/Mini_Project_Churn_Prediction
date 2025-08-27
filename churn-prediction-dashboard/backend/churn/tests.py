from django.test import TestCase
from .models import Customer, Prediction, Alert

class CustomerModelTest(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            name="John Doe",
            email="john.doe@example.com",
            churn_risk=0.75
        )

    def test_customer_creation(self):
        self.assertEqual(self.customer.name, "John Doe")
        self.assertEqual(self.customer.email, "john.doe@example.com")
        self.assertEqual(self.customer.churn_risk, 0.75)

class PredictionModelTest(TestCase):
    def setUp(self):
        self.prediction = Prediction.objects.create(
            customer=self.customer,
            predicted_churn=True
        )

    def test_prediction_creation(self):
        self.assertTrue(self.prediction.predicted_churn)

class AlertModelTest(TestCase):
    def setUp(self):
        self.alert = Alert.objects.create(
            customer=self.customer,
            message="High churn risk detected!"
        )

    def test_alert_creation(self):
        self.assertEqual(self.alert.message, "High churn risk detected!")