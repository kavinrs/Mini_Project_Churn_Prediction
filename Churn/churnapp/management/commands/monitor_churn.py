from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from churnapp.models import CustomerProfile, ChurnAlert, AlertRule
from churnapp.utils import predict_with_explainability, CUSTOM_THRESHOLD
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Monitor customers for churn risk and send alerts based on thresholds'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without sending notifications or creating alerts',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force check all customers regardless of cooldown',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force_check = options['force']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting churn monitoring... (dry_run={dry_run})')
        )

        # Get active alert rules
        alert_rules = AlertRule.objects.filter(is_active=True)
        if not alert_rules.exists():
            self.stdout.write(
                self.style.WARNING('No active alert rules found. Creating default rule.')
            )
            self.create_default_alert_rule()
            alert_rules = AlertRule.objects.filter(is_active=True)

        customers_checked = 0
        alerts_created = 0
        
        for rule in alert_rules:
            self.stdout.write(f'Processing rule: {rule.name}')
            
            # Get customers to check (avoid spam with cooldown)
            customers = self.get_customers_to_check(rule, force_check)
            
            for customer in customers:
                try:
                    # Simulate customer data for prediction
                    customer_data = self.get_customer_prediction_data(customer)
                    
                    # Get current prediction
                    prediction_result = predict_with_explainability(customer_data)
                    current_probability = prediction_result['churn_probability']
                    
                    # Update customer profile
                    customer.previous_churn_probability = customer.current_churn_probability
                    customer.current_churn_probability = current_probability
                    customer.current_value_score = prediction_result['customer_value']['value_score']
                    customer.current_segment_id = prediction_result['customer_segment']['segment_id']
                    
                    if not dry_run:
                        customer.save()
                    
                    # Check for alert conditions
                    alerts = self.check_alert_conditions(customer, rule, prediction_result)
                    
                    for alert_data in alerts:
                        if not dry_run:
                            alert = ChurnAlert.objects.create(**alert_data)
                            self.send_notifications(alert, rule)
                            alerts_created += 1
                        else:
                            self.stdout.write(
                                f'[DRY RUN] Would create alert: {alert_data["title"]}'
                            )
                            alerts_created += 1
                    
                    customers_checked += 1
                    
                except Exception as e:
                    logger.error(f'Error processing customer {customer.customer_id}: {str(e)}')
                    self.stdout.write(
                        self.style.ERROR(f'Error processing {customer.name}: {str(e)}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'Monitoring complete. Checked {customers_checked} customers, '
                f'created {alerts_created} alerts.'
            )
        )

    def create_default_alert_rule(self):
        """Create default alert rule if none exists"""
        AlertRule.objects.create(
            name='Default Churn Monitoring',
            description='Standard churn risk monitoring with threshold and sudden increase detection',
            churn_threshold=CUSTOM_THRESHOLD,
            sudden_increase_threshold=0.10,
            email_recipients='admin@company.com',
            send_email=True,
            check_frequency_minutes=60,
            cooldown_hours=24
        )

    def get_customers_to_check(self, rule, force_check):
        """Get customers that need to be checked based on cooldown rules"""
        if force_check:
            return CustomerProfile.objects.all()
        
        # Only check customers that haven't been alerted recently
        cooldown_time = timezone.now() - timedelta(hours=rule.cooldown_hours)
        
        # Get customers without recent alerts or with no alerts at all
        customers_with_recent_alerts = ChurnAlert.objects.filter(
            created_at__gte=cooldown_time,
            status='active'
        ).values_list('customer_id', flat=True)
        
        return CustomerProfile.objects.exclude(id__in=customers_with_recent_alerts)

    def get_customer_prediction_data(self, customer):
        """Generate sample customer data for prediction"""
        # In a real scenario, this would fetch actual customer data
        return {
            'Tenure': customer.tenure,
            'PreferredLoginDevice': 'Mobile Phone',
            'CityTier': 1,
            'WarehouseToHome': 15,
            'PreferredPaymentMode': 'Credit Card',
            'Gender': 'Male',
            'HourSpendOnApp': 2,
            'NumberOfDeviceRegistered': 3,
            'PreferedOrderCat': 'Laptop & Accessory',
            'SatisfactionScore': 3,
            'MaritalStatus': 'Single',
            'NumberOfAddress': 2,
            'Complain': 0,
            'OrderAmountHikeFromlastYear': 15,
            'CouponUsed': 5,
            'OrderCount': customer.order_count,
            'DaySinceLastOrder': 5,
            'CashbackAmount': customer.cashback_amount
        }

    def check_alert_conditions(self, customer, rule, prediction_result):
        """Check various alert conditions and return alert data"""
        alerts = []
        current_prob = customer.current_churn_probability
        previous_prob = customer.previous_churn_probability
        probability_change = current_prob - previous_prob
        
        # 1. Threshold Breach Alert
        if current_prob >= rule.churn_threshold and previous_prob < rule.churn_threshold:
            alerts.append({
                'customer': customer,
                'alert_type': 'threshold_breach',
                'priority': 'high',
                'title': f'Churn Risk Threshold Breached - {customer.name}',
                'message': f'Customer {customer.name} has crossed the churn risk threshold. '
                          f'Current risk: {current_prob:.1%}, Threshold: {rule.churn_threshold:.1%}',
                'churn_probability': current_prob,
                'previous_probability': previous_prob,
                'probability_change': probability_change,
                'segment_id': customer.current_segment_id
            })

        # 2. Sudden Risk Increase Alert
        if probability_change >= rule.sudden_increase_threshold:
            priority = 'critical' if current_prob >= rule.churn_threshold else 'high'
            alerts.append({
                'customer': customer,
                'alert_type': 'sudden_increase',
                'priority': priority,
                'title': f'Sudden Churn Risk Increase - {customer.name}',
                'message': f'Customer {customer.name} shows a sudden increase in churn risk. '
                          f'Risk jumped from {previous_prob:.1%} to {current_prob:.1%} '
                          f'(+{probability_change:.1%})',
                'churn_probability': current_prob,
                'previous_probability': previous_prob,
                'probability_change': probability_change,
                'segment_id': customer.current_segment_id
            })

        # 3. Critical Customer Alert (High-value + High-risk)
        if (customer.current_segment_id == 1 and 
            current_prob >= rule.churn_threshold):
            alerts.append({
                'customer': customer,
                'alert_type': 'critical_customer',
                'priority': 'critical',
                'title': f'Critical Customer at Risk - {customer.name}',
                'message': f'High-value customer {customer.name} is at critical churn risk. '
                          f'Immediate intervention required. Risk: {current_prob:.1%}, '
                          f'Value Score: {customer.current_value_score}',
                'churn_probability': current_prob,
                'previous_probability': previous_prob,
                'probability_change': probability_change,
                'segment_id': customer.current_segment_id
            })

        return alerts

    def send_notifications(self, alert, rule):
        """Send email/SMS notifications for alerts"""
        try:
            if rule.send_email and rule.email_recipients:
                recipients = [email.strip() for email in rule.email_recipients.split(',')]
                
                subject = f'🚨 Churn Alert: {alert.title}'
                message = f"""
Churn Alert Details:
- Customer: {alert.customer.name} ({alert.customer.customer_id})
- Alert Type: {alert.get_alert_type_display()}
- Priority: {alert.get_priority_display()}
- Current Churn Risk: {alert.churn_probability:.1%}
- Previous Risk: {alert.previous_probability:.1%}
- Change: {alert.probability_change:+.1%}

Message: {alert.message}

Recommended Actions:
{self.get_recommended_actions(alert)}

View full details in the admin dashboard.
                """
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@company.com'),
                    recipient_list=recipients,
                    fail_silently=False,
                )
                
                alert.email_sent = True
                alert.notification_sent_at = timezone.now()
                alert.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'Email sent for alert: {alert.title}')
                )
                
        except Exception as e:
            logger.error(f'Failed to send notification for alert {alert.id}: {str(e)}')
            self.stdout.write(
                self.style.ERROR(f'Failed to send notification: {str(e)}')
            )

    def get_recommended_actions(self, alert):
        """Get recommended actions based on alert type and customer segment"""
        segment_actions = {
            1: "• Call customer immediately\n• Offer premium retention package\n• Assign dedicated account manager",
            2: "• Send automated retention email\n• Offer discount or coupon\n• Monitor for 30 days",
            3: "• Send appreciation message\n• Offer loyalty rewards\n• Encourage referrals",
            4: "• Send educational content\n• Provide usage tips\n• Monitor engagement"
        }
        
        return segment_actions.get(alert.segment_id, "• Review customer profile\n• Contact customer service team")
