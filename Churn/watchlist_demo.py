#!/usr/bin/env python
"""
Real-Time Watchlist Demo - Direct Database Operations
Shows the watchlist functionality without Celery dependencies
"""

import os
import django
import random
from datetime import datetime, timedelta

# Setup Django with minimal settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')

# Temporarily disable problematic imports
import sys
from unittest.mock import MagicMock
sys.modules['celery'] = MagicMock()
sys.modules['channels'] = MagicMock()
sys.modules['django_celery_beat'] = MagicMock()
sys.modules['django_celery_results'] = MagicMock()

django.setup()

from django.utils import timezone
from churnapp.models import Customer, CustomerEvent, RealTimeWatchlist
from churnapp.utils import predict_with_explainability

def demonstrate_watchlist():
    """Demonstrate the real-time watchlist functionality"""
    print("🔍 REAL-TIME WATCHLIST DEMONSTRATION")
    print("=" * 50)
    
    # Get existing customers
    customers = list(Customer.objects.all()[:5])
    if not customers:
        print("❌ No customers found. Please run: python manage.py populate_sample_data")
        return
    
    print(f"📊 Found {len(customers)} customers to analyze")
    
    # Step 1: Simulate customer events that might trigger anomalies
    print("\n1️⃣ Simulating Customer Events...")
    
    anomalous_events = [
        ('payment_failed', {'amount': 299.99, 'error_code': 'CARD_DECLINED'}),
        ('cart_abandon', {'items_count': 5, 'total_value': 450.00}),
        ('support_ticket', {'category': 'billing', 'priority': 'high'}),
        ('app_crash', {'screen': 'checkout', 'error': 'timeout'}),
    ]
    
    for i, customer in enumerate(customers[:3]):  # First 3 customers get anomalous events
        print(f"   👤 {customer.name}")
        for _ in range(2):
            event_type, metadata = random.choice(anomalous_events)
            CustomerEvent.objects.create(
                customer=customer,
                event_type=event_type,
                metadata=metadata,
                timestamp=timezone.now() - timedelta(minutes=random.randint(1, 30))
            )
            print(f"      🚨 {event_type} event created")
    
    # Step 2: Run churn predictions
    print("\n2️⃣ Running Churn Predictions...")
    
    high_risk_customers = []
    
    for customer in customers:
        # Sample customer data for prediction
        sample_data = {
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
        
        try:
            result = predict_with_explainability(sample_data)
            churn_prob = result.get('churn_probability', 0)
            
            # Update customer record
            customer.current_churn_probability = churn_prob
            customer.last_prediction_update = timezone.now()
            customer.save()
            
            print(f"   👤 {customer.name}: {churn_prob:.1%} churn risk")
            
            if churn_prob >= 0.32:  # High risk threshold
                high_risk_customers.append((customer, churn_prob, result))
                print(f"      🚨 HIGH RISK - Will add to watchlist")
            else:
                print(f"      ✅ Low risk - Normal monitoring")
                
        except Exception as e:
            print(f"   ❌ Error predicting for {customer.name}: {e}")
    
    # Step 3: Add to watchlist
    print("\n3️⃣ Updating Real-Time Watchlist...")
    
    if not high_risk_customers:
        print("   ✅ No high-risk customers detected")
        return
    
    for customer, churn_prob, prediction_result in high_risk_customers:
        # Create or update watchlist entry
        watchlist_entry, created = RealTimeWatchlist.objects.get_or_create(
            customer=customer,
            defaults={
                'churn_probability': churn_prob,
                'risk_level': 'high' if churn_prob >= 0.6 else 'medium',
                'anomaly_context': {
                    'prediction_data': {
                        'churn_probability': churn_prob,
                        'risk_category': prediction_result.get('risk_category'),
                        'suggested_action': prediction_result.get('suggested_action', {}).get('action', 'Monitor closely')
                    },
                    'detection_timestamp': timezone.now().isoformat(),
                    'trigger_reason': 'High churn probability detected'
                },
                'is_active': True
            }
        )
        
        if created:
            print(f"   ➕ Added {customer.name} to watchlist")
        else:
            # Update existing entry
            watchlist_entry.churn_probability = churn_prob
            watchlist_entry.risk_level = 'high' if churn_prob >= 0.6 else 'medium'
            watchlist_entry.last_updated = timezone.now()
            watchlist_entry.save()
            print(f"   🔄 Updated {customer.name} in watchlist")
        
        print(f"      📊 Risk Level: {watchlist_entry.risk_level.upper()}")
        print(f"      🎯 Churn Probability: {churn_prob:.1%}")
    
    # Step 4: Display watchlist status
    print("\n4️⃣ Current Watchlist Status")
    print("=" * 30)
    
    active_entries = RealTimeWatchlist.objects.filter(is_active=True).order_by('-churn_probability')
    
    if not active_entries.exists():
        print("   📝 Watchlist is empty")
        return
    
    print(f"   👥 Total customers on watchlist: {active_entries.count()}")
    print()
    
    for entry in active_entries:
        risk_icon = "🔴" if entry.risk_level == 'high' else "🟡"
        print(f"   {risk_icon} {entry.customer.name}")
        print(f"      📊 Churn Risk: {entry.churn_probability:.1%}")
        print(f"      ⚠️  Risk Level: {entry.risk_level.upper()}")
        print(f"      🕒 Added: {entry.added_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Show suggested action if available
        if entry.anomaly_context and 'prediction_data' in entry.anomaly_context:
            action = entry.anomaly_context['prediction_data'].get('suggested_action', 'Monitor closely')
            print(f"      💡 Suggested Action: {action}")
        print()
    
    # Step 5: Show how to access in frontend
    print("5️⃣ Accessing Real-Time Watchlist")
    print("=" * 35)
    print("To view this data in the frontend:")
    print("1. Navigate to the '🔍 Real-Time Watchlist' tab")
    print("2. The watchlist will display customers added above")
    print("3. Each customer shows:")
    print("   • Real-time risk level indicators")
    print("   • Churn probability percentages")
    print("   • Suggested actions")
    print("   • Time since last update")
    print()
    
    # Step 6: API endpoints for real-time functionality
    print("6️⃣ Real-Time API Endpoints")
    print("=" * 28)
    print("Available API endpoints (when Redis/Celery are running):")
    print()
    print("📡 Track Customer Event:")
    print("   POST http://localhost:8000/api/track-event/")
    print("   Body: {")
    print('     "customer_id": 1,')
    print('     "event_type": "payment_failed",')
    print('     "metadata": {"amount": 299.99}')
    print("   }")
    print()
    print("📋 Get Current Watchlist:")
    print("   GET http://localhost:8000/api/watchlist/")
    print()
    print("🚨 Get Recent Alerts:")
    print("   GET http://localhost:8000/api/alerts/")
    print()
    print("🔍 Trigger Anomaly Detection:")
    print("   POST http://localhost:8000/api/trigger-anomaly/")
    print('   Body: {"customer_id": 1}')
    print()
    
    print("🎉 Real-Time Watchlist Demo Complete!")
    print("\nIn production with Redis + Celery:")
    print("• Customer events automatically trigger anomaly detection")
    print("• WebSocket connections provide live updates to frontend")
    print("• Background tasks process events asynchronously")
    print("• Dashboard updates in real-time without page refresh")

if __name__ == "__main__":
    demonstrate_watchlist()
