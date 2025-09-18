#!/usr/bin/env python
"""
Simple Real-Time Watchlist Demo
Shows how the watchlist functionality works without Celery dependencies
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')
django.setup()

from churnapp.models import Customer, CustomerEvent, RealTimeWatchlist
from churnapp.utils import predict_with_explainability
from django.utils import timezone

def create_sample_events():
    """Create sample customer events to simulate real-time activity"""
    print("📊 Creating sample customer events...")
    
    customers = list(Customer.objects.all()[:5])
    
    # Anomalous event patterns
    anomalous_patterns = [
        ('payment_failed', {'amount': 299.99, 'error_code': 'CARD_DECLINED'}),
        ('cart_abandon', {'items_count': 5, 'total_value': 450.00}),
        ('support_ticket', {'category': 'billing', 'priority': 'high'}),
        ('app_crash', {'screen': 'checkout', 'error': 'timeout'}),
    ]
    
    for i, customer in enumerate(customers):
        print(f"   👤 {customer.name}")
        
        # Create multiple anomalous events for first 3 customers
        if i < 3:
            for _ in range(3):
                event_type, metadata = random.choice(anomalous_patterns)
                CustomerEvent.objects.create(
                    customer=customer,
                    event_type=event_type,
                    metadata=metadata,
                    timestamp=timezone.now() - timedelta(minutes=random.randint(1, 60))
                )
                print(f"      🚨 Created {event_type} event")

def simulate_churn_predictions():
    """Simulate churn predictions for customers with anomalous behavior"""
    print("\n🎯 Running churn predictions...")
    
    customers = Customer.objects.all()[:5]
    high_risk_customers = []
    
    for customer in customers:
        # Create sample data for prediction
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
            # Get prediction
            result = predict_with_explainability(sample_data)
            churn_prob = result.get('churn_probability', 0)
            
            print(f"   👤 {customer.name}: {churn_prob:.1%} churn risk")
            
            # Update customer record
            customer.current_churn_probability = churn_prob
            customer.last_prediction_update = timezone.now()
            customer.save()
            
            # Add high-risk customers to list
            if churn_prob >= 0.32:  # High risk threshold
                high_risk_customers.append((customer, churn_prob))
                print(f"      🚨 HIGH RISK - Adding to watchlist")
            
        except Exception as e:
            print(f"   ❌ Error predicting for {customer.name}: {e}")
    
    return high_risk_customers

def update_watchlist(high_risk_customers):
    """Add high-risk customers to the real-time watchlist"""
    print("\n📋 Updating Real-Time Watchlist...")
    
    for customer, churn_prob in high_risk_customers:
        # Create or update watchlist entry
        watchlist_entry, created = RealTimeWatchlist.objects.get_or_create(
            customer=customer,
            defaults={
                'churn_probability': churn_prob,
                'risk_level': 'high' if churn_prob >= 0.6 else 'medium',
                'anomaly_context': {
                    'detection_reason': 'High churn probability detected',
                    'timestamp': timezone.now().isoformat()
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

def display_watchlist():
    """Display the current watchlist status"""
    print("\n🔍 REAL-TIME WATCHLIST STATUS")
    print("=" * 40)
    
    active_entries = RealTimeWatchlist.objects.filter(is_active=True).order_by('-churn_probability')
    
    if not active_entries.exists():
        print("   📝 Watchlist is empty")
        return
    
    print(f"   👥 Total monitored customers: {active_entries.count()}")
    print()
    
    for entry in active_entries:
        risk_icon = "🔴" if entry.risk_level == 'high' else "🟡"
        print(f"   {risk_icon} {entry.customer.name}")
        print(f"      📊 Churn Risk: {entry.churn_probability:.1%}")
        print(f"      ⚠️  Risk Level: {entry.risk_level.upper()}")
        print(f"      🕒 Last Updated: {entry.last_updated.strftime('%Y-%m-%d %H:%M:%S')}")
        print()

def show_api_usage():
    """Show how to use the real-time API endpoints"""
    print("\n🔌 Real-Time API Endpoints")
    print("=" * 30)
    print("Once Redis and Celery are running, you can use these endpoints:")
    print()
    print("📡 Track Customer Events:")
    print("   POST /api/track-event/")
    print("   {")
    print('     "customer_id": 1,')
    print('     "event_type": "payment_failed",')
    print('     "metadata": {"amount": 299.99}')
    print("   }")
    print()
    print("📋 Get Watchlist:")
    print("   GET /api/watchlist/")
    print()
    print("🚨 Get Alerts:")
    print("   GET /api/alerts/")
    print()
    print("🔍 Trigger Anomaly Detection:")
    print("   POST /api/trigger-anomaly/")
    print('   {"customer_id": 1}')

def main():
    """Run the watchlist demo"""
    print("🔍 REAL-TIME WATCHLIST DEMO")
    print("=" * 50)
    print("This demo shows how the real-time watchlist works:")
    print("1. Customer events are tracked")
    print("2. Churn predictions are made")
    print("3. High-risk customers are added to watchlist")
    print("4. Dashboard displays real-time status")
    print()
    
    # Step 1: Create sample events
    create_sample_events()
    
    # Step 2: Run churn predictions
    high_risk_customers = simulate_churn_predictions()
    
    # Step 3: Update watchlist
    if high_risk_customers:
        update_watchlist(high_risk_customers)
    else:
        print("\n✅ No high-risk customers detected")
    
    # Step 4: Display results
    display_watchlist()
    
    # Step 5: Show API usage
    show_api_usage()
    
    print("\n🎉 Demo Complete!")
    print("\nTo see the Real-Time Watchlist in the frontend:")
    print("1. Start the React app: npm start")
    print("2. Navigate to '🔍 Real-Time Watchlist' tab")
    print("3. The watchlist will show the customers added above")

if __name__ == "__main__":
    main()
