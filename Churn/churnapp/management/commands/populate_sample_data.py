from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from churnapp.models import Customer, CustomerEvent, CustomerBehaviorBaseline, RealTimeWatchlist, AnomalyAlert
# Temporarily disabled for migrations
# from churnapp.tasks import process_customer_event

class Command(BaseCommand):
    help = 'Populate sample data for real-time anomaly detection testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--customers',
            type=int,
            default=20,
            help='Number of sample customers to create'
        )
        parser.add_argument(
            '--events-per-customer',
            type=int,
            default=50,
            help='Average number of events per customer'
        )

    def handle(self, *args, **options):
        num_customers = options['customers']
        events_per_customer = options['events_per_customer']
        
        self.stdout.write('Creating sample customers...')
        
        # Sample customer data
        sample_names = [
            'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
            'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor',
            'Ivy Chen', 'Jack Anderson', 'Kate Martinez', 'Liam Garcia',
            'Maya Patel', 'Noah Rodriguez', 'Olivia Thompson', 'Paul White',
            'Quinn Baker', 'Ruby Clark', 'Sam Lewis', 'Tina Walker'
        ]
        
        customers = []
        for i in range(num_customers):
            customer = Customer.objects.create(
                customer_id=f"CUST_{i+1:04d}",
                name=sample_names[i % len(sample_names)] + f" #{i+1}",
                email=f"customer{i+1}@example.com",
                last_activity=timezone.now() - timedelta(hours=random.randint(1, 72)),
                avg_daily_logins=round(random.uniform(0.5, 5.0), 2),
                avg_weekly_orders=round(random.uniform(0.0, 10.0), 2),
                avg_session_duration=round(random.uniform(5.0, 60.0), 2),
                current_churn_probability=round(random.uniform(0.0, 1.0), 3),
                last_prediction_update=timezone.now() - timedelta(hours=random.randint(1, 24))
            )
            customers.append(customer)
        
        self.stdout.write(f'Created {len(customers)} customers')
        
        # Create sample events for each customer
        event_types = [
            'login', 'logout', 'page_view', 'search', 'cart_add', 'cart_remove',
            'purchase', 'payment_failed', 'cart_abandon', 'support_ticket',
            'app_crash', 'product_view', 'wishlist_add', 'review_submit'
        ]
        
        total_events = 0
        for customer in customers:
            num_events = random.randint(events_per_customer - 20, events_per_customer + 20)
            
            for _ in range(num_events):
                event_type = random.choice(event_types)
                
                # Generate realistic metadata based on event type
                metadata = {}
                if event_type == 'purchase':
                    metadata = {
                        'amount': round(random.uniform(10.0, 500.0), 2),
                        'product_id': f'PROD_{random.randint(1000, 9999)}',
                        'category': random.choice(['Electronics', 'Fashion', 'Home', 'Books'])
                    }
                elif event_type == 'payment_failed':
                    metadata = {
                        'amount': round(random.uniform(10.0, 500.0), 2),
                        'error_code': random.choice(['CARD_DECLINED', 'INSUFFICIENT_FUNDS', 'NETWORK_ERROR'])
                    }
                elif event_type == 'search':
                    metadata = {
                        'query': random.choice(['laptop', 'phone', 'shoes', 'headphones', 'books']),
                        'results_count': random.randint(0, 100)
                    }
                elif event_type == 'page_view':
                    metadata = {
                        'page': random.choice(['/home', '/products', '/cart', '/profile', '/orders']),
                        'duration_seconds': random.randint(5, 300)
                    }
                
                # Create event with timestamp in the past
                timestamp = timezone.now() - timedelta(
                    days=random.randint(0, 30),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
                
                CustomerEvent.objects.create(
                    customer=customer,
                    event_type=event_type,
                    metadata=metadata,
                    timestamp=timestamp
                )
                total_events += 1
        
        self.stdout.write(f'Created {total_events} events')
        
        # Create baseline behavior for customers
        self.stdout.write('Calculating customer baselines...')
        from churnapp.anomaly_detection import anomaly_detector
        
        baselines_created = 0
        for customer in customers:
            try:
                anomaly_detector._calculate_baseline(customer)
                baselines_created += 1
            except Exception as e:
                self.stdout.write(f'Error creating baseline for {customer.name}: {e}')
        
        self.stdout.write(f'Created {baselines_created} customer baselines')
        
        # Generate some recent "anomalous" events for testing
        self.stdout.write('Creating anomalous test events...')
        
        test_customers = random.sample(customers, min(5, len(customers)))
        anomalous_events = 0
        
        for customer in test_customers:
            # Create suspicious patterns
            patterns = [
                # Multiple failed payments
                [('payment_failed', {'amount': 299.99, 'error_code': 'CARD_DECLINED'})] * 3,
                # Cart abandonment spree
                [('cart_abandon', {'items_count': random.randint(3, 8)})] * 4,
                # Support ticket flood
                [('support_ticket', {'category': 'billing', 'priority': 'high'})] * 2,
                # App crashes
                [('app_crash', {'screen': 'checkout', 'error': 'timeout'})] * 3
            ]
            
            pattern = random.choice(patterns)
            for event_type, metadata in pattern:
                CustomerEvent.objects.create(
                    customer=customer,
                    event_type=event_type,
                    metadata=metadata,
                    timestamp=timezone.now() - timedelta(minutes=random.randint(5, 120))
                )
                anomalous_events += 1
        
        self.stdout.write(f'Created {anomalous_events} anomalous test events')
        
        # Create sample watchlist entries
        self.stdout.write('Creating watchlist entries...')
        high_risk_customers = [c for c in customers if c.current_churn_probability >= 0.6]
        watchlist_entries = 0
        
        for customer in high_risk_customers[:8]:  # Add top 8 high-risk customers to watchlist
            RealTimeWatchlist.objects.create(
                customer=customer,
                reason=f"High churn probability: {customer.current_churn_probability:.1%}",
                priority=random.choice(['high', 'critical', 'medium']),
                check_frequency_minutes=random.choice([5, 10, 15]),
                alert_threshold=random.uniform(0.6, 0.9)
            )
            watchlist_entries += 1
        
        self.stdout.write(f'Created {watchlist_entries} watchlist entries')
        
        # Create sample anomaly alerts
        self.stdout.write('Creating anomaly alerts...')
        alert_types = ['login_drop', 'purchase_drop', 'session_anomaly', 'payment_issues', 'support_spike', 'engagement_drop']
        severities = ['low', 'medium', 'high', 'critical']
        alerts_created = 0
        
        for customer in random.sample(customers, min(10, len(customers))):
            alert_type = random.choice(alert_types)
            severity = random.choice(severities)
            
            AnomalyAlert.objects.create(
                customer=customer,
                alert_type=alert_type,
                severity=severity,
                status=random.choice(['new', 'acknowledged', 'investigating']),
                description=f"Detected {alert_type.replace('_', ' ')} anomaly for {customer.name}",
                anomaly_score=random.uniform(-0.8, -0.1),  # Isolation Forest scores are negative
                baseline_value=random.uniform(1.0, 10.0),
                current_value=random.uniform(0.1, 2.0),
                detected_at=timezone.now() - timedelta(hours=random.randint(1, 48))
            )
            alerts_created += 1
        
        self.stdout.write(f'Created {alerts_created} anomaly alerts')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated sample data:\n'
                f'- {len(customers)} customers\n'
                f'- {total_events} historical events\n'
                f'- {baselines_created} customer baselines\n'
                f'- {anomalous_events} anomalous test events\n'
                f'- {watchlist_entries} watchlist entries\n'
                f'- {alerts_created} anomaly alerts'
            )
        )
