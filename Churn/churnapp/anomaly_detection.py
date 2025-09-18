import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Q
from .models import Customer, CustomerEvent, CustomerBehaviorBaseline, AnomalyAlert
import logging

logger = logging.getLogger(__name__)

class CustomerAnomalyDetector:
    """Real-time anomaly detection for customer behavior patterns"""
    
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,  # Expect 10% of data to be anomalous
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def extract_behavioral_features(self, customer, days_back=7):
        """Extract behavioral features for anomaly detection"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Get recent events
        recent_events = CustomerEvent.objects.filter(
            customer=customer,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )
        
        # Calculate behavioral metrics
        features = {}
        
        # Login patterns
        login_events = recent_events.filter(event_type='login')
        features['login_frequency'] = login_events.count()
        features['avg_login_hour'] = self._calculate_avg_hour(login_events)
        
        # Purchase patterns
        purchase_events = recent_events.filter(event_type='purchase')
        features['purchase_frequency'] = purchase_events.count()
        features['avg_purchase_amount'] = self._calculate_avg_purchase_amount(purchase_events)
        
        # Session patterns
        session_events = recent_events.filter(event_type__in=['login', 'logout'])
        features['avg_session_duration'] = self._calculate_avg_session_duration(session_events)
        
        # Engagement patterns
        engagement_events = recent_events.filter(event_type__in=['page_view', 'search', 'cart_add'])
        features['engagement_frequency'] = engagement_events.count()
        
        # Problem indicators
        problem_events = recent_events.filter(event_type__in=['payment_failed', 'app_crash', 'support_ticket'])
        features['problem_frequency'] = problem_events.count()
        
        # Cart abandonment
        cart_events = recent_events.filter(event_type='cart_abandon')
        features['cart_abandon_frequency'] = cart_events.count()
        
        # Time-based patterns
        features['weekend_activity'] = self._calculate_weekend_activity(recent_events)
        features['late_night_activity'] = self._calculate_late_night_activity(recent_events)
        
        return features
    
    def _calculate_avg_hour(self, events):
        """Calculate average hour of day for events"""
        if not events.exists():
            return 12  # Default to noon
        hours = [event.timestamp.hour for event in events]
        return np.mean(hours) if hours else 12
    
    def _calculate_avg_purchase_amount(self, purchase_events):
        """Calculate average purchase amount from metadata"""
        amounts = []
        for event in purchase_events:
            if 'amount' in event.metadata:
                amounts.append(float(event.metadata['amount']))
        return np.mean(amounts) if amounts else 0.0
    
    def _calculate_avg_session_duration(self, session_events):
        """Calculate average session duration in minutes"""
        sessions = []
        login_time = None
        
        for event in session_events.order_by('timestamp'):
            if event.event_type == 'login':
                login_time = event.timestamp
            elif event.event_type == 'logout' and login_time:
                duration = (event.timestamp - login_time).total_seconds() / 60
                sessions.append(duration)
                login_time = None
        
        return np.mean(sessions) if sessions else 30.0  # Default 30 minutes
    
    def _calculate_weekend_activity(self, events):
        """Calculate percentage of activity on weekends"""
        if not events.exists():
            return 0.0
        weekend_events = events.filter(timestamp__week_day__in=[1, 7])  # Sunday=1, Saturday=7
        return (weekend_events.count() / events.count()) * 100
    
    def _calculate_late_night_activity(self, events):
        """Calculate percentage of activity between 11PM and 5AM"""
        if not events.exists():
            return 0.0
        late_night_events = events.filter(
            Q(timestamp__hour__gte=23) | Q(timestamp__hour__lt=5)
        )
        return (late_night_events.count() / events.count()) * 100
    
    def build_baseline_model(self, customer_sample_size=100):
        """Build baseline anomaly detection model from historical data"""
        logger.info("Building baseline anomaly detection model...")
        
        # Get sample of customers with sufficient data
        customers = Customer.objects.annotate(
            event_count=Count('events')
        ).filter(event_count__gte=50)[:customer_sample_size]
        
        if not customers.exists():
            logger.warning("Insufficient customer data for baseline model")
            return False
        
        # Extract features for all customers
        feature_data = []
        for customer in customers:
            features = self.extract_behavioral_features(customer, days_back=30)
            feature_data.append(list(features.values()))
        
        if not feature_data:
            logger.warning("No feature data extracted")
            return False
        
        # Convert to numpy array and fit model
        X = np.array(feature_data)
        X_scaled = self.scaler.fit_transform(X)
        self.isolation_forest.fit(X_scaled)
        self.is_fitted = True
        
        logger.info(f"Baseline model built with {len(feature_data)} customer samples")
        return True
    
    def detect_anomaly(self, customer, alert_threshold=-0.5):
        """Detect anomalies in customer behavior"""
        if not self.is_fitted:
            logger.warning("Anomaly detector not fitted. Building baseline model...")
            if not self.build_baseline_model():
                return None
        
        # Extract current features
        features = self.extract_behavioral_features(customer)
        feature_vector = np.array([list(features.values())])
        
        # Scale features
        try:
            feature_vector_scaled = self.scaler.transform(feature_vector)
        except Exception as e:
            logger.error(f"Error scaling features: {e}")
            return None
        
        # Get anomaly score
        anomaly_score = self.isolation_forest.decision_function(feature_vector_scaled)[0]
        is_anomaly = self.isolation_forest.predict(feature_vector_scaled)[0] == -1
        
        # Get baseline for comparison
        baseline = self._get_customer_baseline(customer)
        
        result = {
            'customer': customer,
            'anomaly_score': anomaly_score,
            'is_anomaly': is_anomaly,
            'features': features,
            'baseline': baseline,
            'anomaly_details': self._analyze_anomaly_details(features, baseline)
        }
        
        # Create alert if anomaly detected and score below threshold
        if is_anomaly and anomaly_score < alert_threshold:
            self._create_anomaly_alert(result)
        
        return result
    
    def _get_customer_baseline(self, customer):
        """Get customer's behavioral baseline"""
        try:
            baseline = customer.baseline
            return {
                'avg_logins_per_day': baseline.avg_logins_per_day,
                'avg_purchases_per_week': baseline.avg_purchases_per_week,
                'avg_session_duration': baseline.avg_session_duration,
                'avg_page_views_per_session': baseline.avg_page_views_per_session,
            }
        except CustomerBehaviorBaseline.DoesNotExist:
            return self._calculate_baseline(customer)
    
    def _calculate_baseline(self, customer, days_back=30):
        """Calculate baseline behavior for customer"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days_back)
        
        events = CustomerEvent.objects.filter(
            customer=customer,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )
        
        # Calculate baseline metrics
        login_events = events.filter(event_type='login')
        purchase_events = events.filter(event_type='purchase')
        
        baseline = {
            'avg_logins_per_day': login_events.count() / days_back,
            'avg_purchases_per_week': (purchase_events.count() / days_back) * 7,
            'avg_session_duration': 30.0,  # Default
            'avg_page_views_per_session': 5.0,  # Default
        }
        
        # Save baseline to database
        baseline_obj, created = CustomerBehaviorBaseline.objects.get_or_create(
            customer=customer,
            defaults=baseline
        )
        
        if not created:
            # Update existing baseline
            for key, value in baseline.items():
                setattr(baseline_obj, key, value)
            baseline_obj.save()
        
        return baseline
    
    def _analyze_anomaly_details(self, current_features, baseline):
        """Analyze which specific behaviors are anomalous"""
        anomalies = []
        
        # Check login frequency
        if baseline.get('avg_logins_per_day', 0) > 0:
            login_ratio = current_features['login_frequency'] / (baseline['avg_logins_per_day'] * 7)
            if login_ratio < 0.5:  # 50% drop
                anomalies.append({
                    'type': 'login_drop',
                    'description': f"Login frequency dropped by {(1-login_ratio)*100:.1f}%",
                    'severity': 'high' if login_ratio < 0.2 else 'medium',
                    'current_value': current_features['login_frequency'],
                    'baseline_value': baseline['avg_logins_per_day'] * 7
                })
        
        # Check purchase frequency
        if baseline.get('avg_purchases_per_week', 0) > 0:
            purchase_ratio = current_features['purchase_frequency'] / baseline['avg_purchases_per_week']
            if purchase_ratio < 0.3:  # 70% drop
                anomalies.append({
                    'type': 'purchase_drop',
                    'description': f"Purchase frequency dropped by {(1-purchase_ratio)*100:.1f}%",
                    'severity': 'critical' if purchase_ratio < 0.1 else 'high',
                    'current_value': current_features['purchase_frequency'],
                    'baseline_value': baseline['avg_purchases_per_week']
                })
        
        # Check problem frequency
        if current_features['problem_frequency'] > 2:
            anomalies.append({
                'type': 'problem_spike',
                'description': f"Unusual number of problems: {current_features['problem_frequency']} events",
                'severity': 'high',
                'current_value': current_features['problem_frequency'],
                'baseline_value': 0
            })
        
        # Check cart abandonment
        if current_features['cart_abandon_frequency'] > 3:
            anomalies.append({
                'type': 'cart_abandon_spike',
                'description': f"High cart abandonment: {current_features['cart_abandon_frequency']} events",
                'severity': 'medium',
                'current_value': current_features['cart_abandon_frequency'],
                'baseline_value': 1
            })
        
        return anomalies
    
    def _create_anomaly_alert(self, anomaly_result):
        """Create anomaly alert in database"""
        customer = anomaly_result['customer']
        anomaly_details = anomaly_result['anomaly_details']
        
        # Determine primary anomaly type and severity
        if anomaly_details:
            primary_anomaly = max(anomaly_details, key=lambda x: {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}[x['severity']])
            alert_type = primary_anomaly['type']
            severity = primary_anomaly['severity']
            description = primary_anomaly['description']
            baseline_value = primary_anomaly.get('baseline_value')
            current_value = primary_anomaly.get('current_value')
        else:
            alert_type = 'engagement_drop'
            severity = 'medium'
            description = f"General behavioral anomaly detected (score: {anomaly_result['anomaly_score']:.3f})"
            baseline_value = None
            current_value = None
        
        # Check if similar alert exists recently
        recent_alerts = AnomalyAlert.objects.filter(
            customer=customer,
            alert_type=alert_type,
            detected_at__gte=timezone.now() - timedelta(hours=6)
        )
        
        if recent_alerts.exists():
            logger.info(f"Similar alert already exists for {customer.name}")
            return None
        
        # Create new alert
        alert = AnomalyAlert.objects.create(
            customer=customer,
            alert_type=alert_type,
            severity=severity,
            description=description,
            anomaly_score=anomaly_result['anomaly_score'],
            baseline_value=baseline_value,
            current_value=current_value
        )
        
        logger.info(f"Created anomaly alert: {alert}")
        return alert

# Global detector instance
anomaly_detector = CustomerAnomalyDetector()
