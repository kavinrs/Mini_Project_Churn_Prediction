#!/usr/bin/env python
"""
Real-Time Watchlist Demo Script
Demonstrates the real-time anomaly detection and watchlist functionality
without requiring Redis/Celery setup.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random
import time

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')
django.setup()

from churnapp.models import Customer, CustomerEvent, AnomalyAlert, RealTimeWatchlist
from churnapp.anomaly_detection import anomaly_detector
from churnapp.utils import predict_with_explainability
from django.utils import timezone

class RealTimeWatchlistDemo:
    def __init__(self):
        self.customers = list(Customer.objects.all()[:5])  # Use first 5 customers
        print("🔍 Real-Time Watchlist Demo")
        print("=" * 50)
        
    def simulate_customer_events(self):
        """Simulate real-time customer events"""
        print("\n📊 Simulating Customer Events...")
        
        # Event types that might trigger anomalies
        anomalous_events = [
            ('payment_failed', {'amount': 299.99, 'error_code': 'CARD_DECLINED'}),
            ('cart_abandon', {'items_count': 5, 'total_value': 450.00}),
            ('support_ticket', {'category': 'billing', 'priority': 'high'}),
            ('app_crash', {'screen': 'checkout', 'error': 'timeout'}),
        ]
        
        normal_events = [
            ('login', {'device': 'mobile'}),
            ('page_view', {'page': '/products', 'duration': 120}),
            ('search', {'query': 'laptop', 'results': 45}),
            ('purchase', {'amount': 89.99, 'product': 'headphones'}),
        ]
        
        for i, customer in enumerate(self.customers):
            print(f"\n👤 Customer: {customer.name}")
            
            # Simulate some normal events first
            for _ in range(2):
                event_type, metadata = random.choice(normal_events)
                event = CustomerEvent.objects.create(
                    customer=customer,
                    event_type=event_type,
                    metadata=metadata
                )
                print(f"   ✅ Normal event: {event_type}")
            
            # Simulate anomalous events for some customers
            if i < 3:  # First 3 customers get anomalous events
                for _ in range(random.randint(2, 4)):
                    event_type, metadata = random.choice(anomalous_events)
                    event = CustomerEvent.objects.create(
                        customer=customer,
                        event_type=event_type,
                        metadata=metadata
                    )
                    print(f"   🚨 Anomalous event: {event_type}")
                    time.sleep(0.5)  # Simulate real-time delay
    
    def run_anomaly_detection(self):
        """Run anomaly detection on customers"""
        print("\n🔍 Running Anomaly Detection...")
        
        # Build baseline model if not fitted
        if not anomaly_detector.is_fitted:
            print("   📈 Building baseline anomaly detection model...")
            success = anomaly_detector.build_baseline_model(customer_sample_size=len(self.customers))
            if success:
                print("   ✅ Baseline model built successfully")
            else:
                print("   ❌ Failed to build baseline model")
                return
        
        detected_anomalies = []
        
        for customer in self.customers:
            print(f"\n   👤 Analyzing {customer.name}...")
            
            try:
                result = anomaly_detector.detect_anomaly(customer)
                
                if result and result['is_anomaly']:
                    detected_anomalies.append((customer, result))
                    print(f"      🚨 ANOMALY DETECTED!")
                    print(f"      📊 Anomaly Score: {result['anomaly_score']:.3f}")
                    print(f"      📋 Anomaly Details: {len(result['anomaly_details'])} issues found")
                    
                    # Show specific anomaly details
                    for detail in result['anomaly_details'][:2]:  # Show first 2 details
                        print(f"         - {detail['description']} (Severity: {detail['severity']})")
                else:
                    print(f"      ✅ Normal behavior detected")
                    
            except Exception as e:
                print(f"      ❌ Error analyzing {customer.name}: {e}")
        
        return detected_anomalies
    
    def trigger_churn_predictions(self, anomalous_customers):
        """Trigger churn predictions for anomalous customers"""
        print("\n🎯 Triggering Churn Predictions...")
        
        high_risk_customers = []
        
        for customer, anomaly_result in anomalous_customers:
            print(f"\n   👤 Predicting churn for {customer.name}...")
            
            try:
                # Create sample customer data for prediction
                customer_data = {
                    'Tenure': random.randint(1, 36),
                    'PreferredLoginDevice': random.choice(['Mobile Phone', 'Computer']),
                    'CityTier': random.randint(1, 3),
                    'WarehouseToHome': round(random.uniform(5.0, 35.0), 1),
                    'PreferredPaymentMode': random.choice(['Debit Card', 'Credit Card']),
                    'Gender': random.choice(['Male', 'Female']),
                    'HourSpendOnApp': round(random.uniform(0.5, 5.0), 1),
                    'NumberOfDeviceRegistered': random.randint(1, 6),
                    'PreferedOrderCat': random.choice(['Laptop & Accessory', 'Mobile Phone']),
                    'SatisfactionScore': random.randint(1, 5),
                    'MaritalStatus': random.choice(['Single', 'Married']),
                    'NumberOfAddress': random.randint(1, 5),
                    'Complain': random.choice([0, 1]),
                    'OrderAmountHikeFromlastYear': round(random.uniform(-20.0, 50.0), 1),
                    'CouponUsed': random.randint(0, 20),
                    'OrderCount': random.randint(1, 20),
                    'DaySinceLastOrder': random.randint(0, 30),
                    'CashbackAmount': round(random.uniform(0.0, 500.0), 2)
                }
                
                # Get churn prediction
                prediction_result = predict_with_explainability(customer_data)
                churn_probability = prediction_result.get('churn_probability', 0)
                
                print(f"      📊 Churn Probability: {churn_probability:.1%}")
                print(f"      🎯 Risk Category: {prediction_result.get('risk_category', 'Unknown')}")
                
                # Update customer's churn probability
                customer.current_churn_probability = churn_probability
                customer.last_prediction_update = timezone.now()
                customer.save()
                
                if churn_probability >= 0.32:  # High risk threshold
                    high_risk_customers.append((customer, churn_probability, anomaly_result))
                    print(f"      🚨 HIGH RISK - Adding to watchlist!")
                else:
                    print(f"      ✅ Low risk - Monitoring")
                    
            except Exception as e:
                print(f"      ❌ Error predicting churn: {e}")
        
        return high_risk_customers
    
    def update_watchlist(self, high_risk_customers):
        """Update the real-time watchlist"""
        print("\n📋 Updating Real-Time Watchlist...")
        
        for customer, churn_probability, anomaly_result in high_risk_customers:
            # Add or update watchlist entry
            watchlist_entry, created = RealTimeWatchlist.objects.get_or_create(
                customer=customer,
                defaults={
                    'churn_probability': churn_probability,
                    'risk_level': 'high' if churn_probability >= 0.6 else 'medium',
                    'anomaly_context': {
                        'anomaly_score': anomaly_result['anomaly_score'],
                        'anomaly_details': anomaly_result['anomaly_details'][:3],  # Store top 3 details
                        'detection_timestamp': timezone.now().isoformat()
                    },
                    'is_active': True
                }
            )
            
            if created:
                print(f"   ➕ Added {customer.name} to watchlist")
            else:
                # Update existing entry
                watchlist_entry.churn_probability = churn_probability
                watchlist_entry.risk_level = 'high' if churn_probability >= 0.6 else 'medium'
                watchlist_entry.last_updated = timezone.now()
                watchlist_entry.save()
                print(f"   🔄 Updated {customer.name} in watchlist")
            
            print(f"      📊 Risk Level: {watchlist_entry.risk_level.upper()}")
            print(f"      🎯 Churn Probability: {churn_probability:.1%}")
    
    def display_watchlist_status(self):
        """Display current watchlist status"""
        print("\n📊 Current Watchlist Status")
        print("=" * 30)
        
        active_entries = RealTimeWatchlist.objects.filter(is_active=True).order_by('-churn_probability')
        
        if not active_entries.exists():
            print("   📝 Watchlist is empty - No high-risk customers detected")
            return
        
        print(f"   👥 Total customers on watchlist: {active_entries.count()}")
        
        for entry in active_entries:
            risk_icon = "🔴" if entry.risk_level == 'high' else "🟡"
            print(f"\n   {risk_icon} {entry.customer.name}")
            print(f"      📊 Churn Risk: {entry.churn_probability:.1%}")
            print(f"      ⚠️  Risk Level: {entry.risk_level.upper()}")
            print(f"      🕒 Added: {entry.added_at.strftime('%Y-%m-%d %H:%M')}")
            
            # Show anomaly context if available
            if entry.anomaly_context and 'anomaly_details' in entry.anomaly_context:
                details = entry.anomaly_context['anomaly_details']
                if details:
                    print(f"      🚨 Top Issue: {details[0].get('description', 'Unknown')}")
    
    def display_recent_alerts(self):
        """Display recent anomaly alerts"""
        print("\n🚨 Recent Anomaly Alerts")
        print("=" * 25)
        
        recent_alerts = AnomalyAlert.objects.filter(
            detected_at__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-detected_at')[:10]
        
        if not recent_alerts.exists():
            print("   📝 No recent alerts")
            return
        
        for alert in recent_alerts:
            severity_icon = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}.get(alert.severity, "⚪")
            print(f"   {severity_icon} {alert.customer.name} - {alert.description}")
            print(f"      🕒 {alert.detected_at.strftime('%H:%M:%S')}")
    
    def run_demo(self):
        """Run the complete real-time watchlist demo"""
        print("Starting Real-Time Watchlist Demo...")
        print("This demo simulates the complete workflow:\n")
        
        # Step 1: Simulate events
        self.simulate_customer_events()
        
        # Step 2: Run anomaly detection
        anomalous_customers = self.run_anomaly_detection()
        
        if not anomalous_customers:
            print("\n✅ No anomalies detected - All customers showing normal behavior")
            return
        
        # Step 3: Trigger churn predictions
        high_risk_customers = self.trigger_churn_predictions(anomalous_customers)
        
        if not high_risk_customers:
            print("\n✅ No high-risk customers identified")
            return
        
        # Step 4: Update watchlist
        self.update_watchlist(high_risk_customers)
        
        # Step 5: Display results
        self.display_watchlist_status()
        self.display_recent_alerts()
        
        print("\n🎉 Real-Time Watchlist Demo Complete!")
        print("\nIn a production environment, this would happen automatically:")
        print("• Customer events trigger Celery tasks")
        print("• Anomaly detection runs in background")
        print("• WebSocket notifications sent to frontend")
        print("• Dashboard updates in real-time")

if __name__ == "__main__":
    demo = RealTimeWatchlistDemo()
    demo.run_demo()
