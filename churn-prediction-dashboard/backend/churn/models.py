from django.db import models

class Customer(models.Model):
    customer_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    signup_date = models.DateField()
    churned = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Prediction(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    prediction_date = models.DateField(auto_now_add=True)
    churn_probability = models.FloatField()
    risk_level = models.CharField(max_length=50)

    def __str__(self):
        return f"Prediction for {self.customer.name} on {self.prediction_date}"

class Alert(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    alert_date = models.DateField(auto_now_add=True)
    message = models.TextField()

    def __str__(self):
        return f"Alert for {self.customer.name} on {self.alert_date}"