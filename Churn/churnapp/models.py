from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

class Customer(models.Model):
    """Customer profile for tracking behavior patterns"""
    customer_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Behavioral baseline metrics
    avg_daily_logins = models.FloatField(default=0.0)
    avg_weekly_orders = models.FloatField(default=0.0)
    avg_session_duration = models.FloatField(default=0.0)  # in minutes
    last_activity = models.DateTimeField(null=True, blank=True)
    
    # Current churn prediction data
    current_churn_probability = models.FloatField(default=0.0)
    last_prediction_update = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.customer_id})"

class CustomerEvent(models.Model):
    """Track real-time customer events"""
    EVENT_TYPES = [
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('purchase', 'Purchase Made'),
        ('cart_add', 'Item Added to Cart'),
        ('cart_abandon', 'Cart Abandoned'),
        ('payment_failed', 'Payment Failed'),
        ('support_ticket', 'Support Ticket Created'),
        ('app_crash', 'App Crash'),
        ('page_view', 'Page View'),
        ('search', 'Search Performed'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Event metadata (JSON field for flexible data storage)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Processed flag for anomaly detection
    processed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['customer', 'event_type', 'timestamp']),
            models.Index(fields=['processed', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.customer.name} - {self.event_type} at {self.timestamp}"

class AnomalyAlert(models.Model):
    """Store detected anomalies and alerts"""
    ALERT_TYPES = [
        ('login_drop', 'Login Frequency Drop'),
        ('purchase_drop', 'Purchase Activity Drop'),
        ('session_anomaly', 'Session Duration Anomaly'),
        ('payment_issues', 'Payment Problems'),
        ('support_spike', 'Support Ticket Spike'),
        ('engagement_drop', 'Engagement Drop'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('acknowledged', 'Acknowledged'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='anomaly_alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    
    # Alert details
    description = models.TextField()
    anomaly_score = models.FloatField()  # Isolation Forest score
    baseline_value = models.FloatField(null=True, blank=True)
    current_value = models.FloatField(null=True, blank=True)
    
    # Timestamps
    detected_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Churn prediction triggered by this alert
    triggered_churn_prediction = models.BooleanField(default=False)
    updated_churn_probability = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['status', 'severity', 'detected_at']),
            models.Index(fields=['customer', 'alert_type']),
        ]
    
    def __str__(self):
        return f"{self.customer.name} - {self.alert_type} ({self.severity})"

class CustomerBehaviorBaseline(models.Model):
    """Store baseline behavior patterns for anomaly detection"""
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='baseline')
    
    # Login patterns
    avg_logins_per_day = models.FloatField(default=0.0)
    std_logins_per_day = models.FloatField(default=0.0)
    typical_login_hours = models.JSONField(default=list)  # List of typical hours
    
    # Purchase patterns
    avg_purchases_per_week = models.FloatField(default=0.0)
    std_purchases_per_week = models.FloatField(default=0.0)
    avg_purchase_amount = models.FloatField(default=0.0)
    
    # Session patterns
    avg_session_duration = models.FloatField(default=0.0)
    std_session_duration = models.FloatField(default=0.0)
    
    # Engagement patterns
    avg_page_views_per_session = models.FloatField(default=0.0)
    avg_searches_per_session = models.FloatField(default=0.0)
    
    # Update tracking
    last_updated = models.DateTimeField(auto_now=True)
    data_points_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Baseline for {self.customer.name}"

class RealTimeWatchlist(models.Model):
    """Customers currently being monitored in real-time"""
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name='watchlist_entry')
    added_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=200)
    priority = models.CharField(max_length=10, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    
    # Monitoring settings
    check_frequency_minutes = models.IntegerField(default=5)  # How often to check for anomalies
    alert_threshold = models.FloatField(default=0.7)  # Anomaly score threshold
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-added_at']
    
    def __str__(self):
        return f"Watching {self.customer.name} - {self.priority} priority"

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
