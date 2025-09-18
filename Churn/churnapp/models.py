from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class CustomerProfile(models.Model):
    """Store customer data and churn history"""
    customer_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Current churn data
    current_churn_probability = models.FloatField(default=0.0)
    current_value_score = models.FloatField(default=0.0)
    current_segment_id = models.IntegerField(default=4)
    
    # Historical tracking
    previous_churn_probability = models.FloatField(default=0.0)
    last_prediction_date = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Customer attributes
    tenure = models.IntegerField(default=0)
    order_count = models.IntegerField(default=0)
    cashback_amount = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'customer_profiles'
        
    def __str__(self):
        return f"{self.name} ({self.customer_id})"
    
    @property
    def risk_change(self):
        """Calculate change in churn probability"""
        return self.current_churn_probability - self.previous_churn_probability
    
    @property
    def is_high_risk(self):
        """Check if customer is above threshold"""
        return self.current_churn_probability >= 0.32

class ChurnAlert(models.Model):
    """Store churn alerts and notifications"""
    ALERT_TYPES = [
        ('threshold_breach', 'Threshold Breach'),
        ('sudden_increase', 'Sudden Risk Increase'),
        ('segment_change', 'Segment Change'),
        ('critical_customer', 'Critical Customer Alert'),
    ]
    
    ALERT_PRIORITIES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    ALERT_STATUS = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=10, choices=ALERT_PRIORITIES, default='medium')
    status = models.CharField(max_length=15, choices=ALERT_STATUS, default='active')
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Alert data
    churn_probability = models.FloatField()
    previous_probability = models.FloatField(default=0.0)
    probability_change = models.FloatField(default=0.0)
    segment_id = models.IntegerField()
    
    # Notification tracking
    email_sent = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Management
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='acknowledged_alerts')
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'churn_alerts'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.customer.name}"
    
    def acknowledge(self, user):
        """Mark alert as acknowledged"""
        self.status = 'acknowledged'
        self.acknowledged_by = user
        self.acknowledged_at = timezone.now()
        self.save()
    
    def resolve(self):
        """Mark alert as resolved"""
        self.status = 'resolved'
        self.save()

class AlertRule(models.Model):
    """Configure alert rules and thresholds"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    
    # Threshold settings
    churn_threshold = models.FloatField(default=0.32)
    sudden_increase_threshold = models.FloatField(default=0.10)  # 10% jump
    
    # Notification settings
    send_email = models.BooleanField(default=True)
    send_sms = models.BooleanField(default=False)
    email_recipients = models.TextField(help_text="Comma-separated email addresses")
    
    # Timing settings
    check_frequency_minutes = models.IntegerField(default=60)  # Check every hour
    cooldown_hours = models.IntegerField(default=24)  # Prevent spam alerts
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'alert_rules'
        
    def __str__(self):
        return self.name
