#!/usr/bin/env python
"""
Real-Time Watchlist Demo
Direct database operations to demonstrate watchlist functionality
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')
django.setup()

from churnapp.models import Customer, RealTimeWatchlist, CustomerEvent, AnomalyAlert
from django.utils import timezone
import random

def create_sample_customers():
    """Create sample customers if they don't exist"""
    sample_customers = [
        {'name': 'Alice Johnson', 'email': 'alice@example.com'},
        {'name': 'Bob Smith', 'email': 'bob@example.com'},
        {'name': 'Carol Davis', 'email': 'carol@example.com'},
        {'name': 'David Wilson', 'email': 'david@example.com'},
        {'name': 'Emma Brown', 'email': 'emma@example.com'},
    ]
    
    created_customers = []
    for customer_data in sample_customers:
        customer, created = Customer.objects.get_or_create(
            email=customer_data['email'],
            defaults={'name': customer_data['name']}
        )
        if created:
            print(f"✅ Created customer: {customer.name}")
        created_customers.append(customer)
    
    return created_customers

def simulate_customer_events(customers):
    """Simulate customer events that might trigger anomalies"""
    print("\n📊 Simulating Customer Events...")
    
    event_types = [
        ('payment_failed', {'amount': 299.99, 'error': 'CARD_DECLINED'}),
        ('cart_abandon', {'items': 3, 'value': 150.00}),
        ('support_ticket', {'category': 'billing', 'priority': 'high'}),
        ('app_crash', {'screen': 'checkout'}),
        ('login_failed', {'attempts': 5}),
    ]
    
    for customer in customers[:3]:  # First 3 customers get events
        num_events = random.randint(2, 4)
        for _ in range(num_events):
            event_type, metadata = random.choice(event_types)
            CustomerEvent.objects.create(
                customer=customer,
                event_type=event_type,
                metadata=metadata,
                timestamp=timezone.now() - timezone.timedelta(minutes=random.randint(1, 60))
            )
        print(f"   🚨 {customer.name}: {num_events} events created")

def add_to_watchlist(customers):
    """Add high-risk customers to watchlist"""
    print("\n🔍 Adding Customers to Real-Time Watchlist...")
    
    risk_scenarios = [
        {
            'churn_prob': 0.85,
            'risk_level': 'high',
            'reason': 'Multiple payment failures detected',
            'action': 'Call customer immediately'
        },
        {
            'churn_prob': 0.72,
            'risk_level': 'high', 
            'reason': 'Unusual cart abandonment pattern',
            'action': 'Offer discount incentive'
        },
        {
            'churn_prob': 0.45,
            'risk_level': 'medium',
            'reason': 'Support ticket frequency spike',
            'action': 'Send personalized email'
        },
        {
            'churn_prob': 0.38,
            'risk_level': 'medium',
            'reason': 'App crash incidents increased',
            'action': 'Technical support follow-up'
        },
    ]
    
    for i, customer in enumerate(customers[:4]):
        scenario = risk_scenarios[i]
        
        # Create watchlist entry
        entry, created = RealTimeWatchlist.objects.get_or_create(
            customer=customer,
            defaults={
                'churn_probability': scenario['churn_prob'],
                'risk_level': scenario['risk_level'],
                'anomaly_context': {
                    'trigger_reason': scenario['reason'],
                    'recommended_action': scenario['action'],
                    'detection_timestamp': timezone.now().isoformat(),
                    'confidence_score': random.uniform(0.75, 0.95)
                },
                'is_active': True
            }
        )
        
        if created:
            print(f"   ➕ {customer.name}")
            print(f"      📊 Risk: {scenario['churn_prob']:.1%} ({scenario['risk_level']})")
            print(f"      🚨 Reason: {scenario['reason']}")
            print(f"      💡 Action: {scenario['action']}")
        else:
            print(f"   🔄 Updated {customer.name}")

def create_anomaly_alerts(customers):
    """Create sample anomaly alerts"""
    print("\n🚨 Creating Anomaly Alerts...")
    
    alert_types = ['threshold_breach', 'sudden_increase', 'critical_customer']
    priorities = ['high', 'medium', 'low']
    
    for customer in customers[:3]:
        AnomalyAlert.objects.create(
            customer=customer,
            alert_type=random.choice(alert_types),
            priority=random.choice(priorities),
            message=f"Anomaly detected for {customer.name}",
            details={
                'churn_probability': random.uniform(0.4, 0.9),
                'trigger': 'Automated detection',
                'timestamp': timezone.now().isoformat()
            },
            is_resolved=False
        )
        print(f"   🚨 Alert created for {customer.name}")

def display_watchlist_status():
    """Display current watchlist status"""
    print("\n📋 CURRENT WATCHLIST STATUS")
    print("=" * 35)
    
    entries = RealTimeWatchlist.objects.filter(is_active=True).order_by('-churn_probability')
    
    if not entries.exists():
        print("   📝 Watchlist is empty")
        return
    
    print(f"   👥 Total customers monitored: {entries.count()}")
    print()
    
    for i, entry in enumerate(entries, 1):
        risk_icon = "🔴" if entry.risk_level == 'high' else "🟡"
        print(f"   {i}. {risk_icon} {entry.customer.name}")
        print(f"      📊 Churn Risk: {entry.churn_probability:.1%}")
        print(f"      ⚠️  Risk Level: {entry.risk_level.upper()}")
        print(f"      🕒 Added: {entry.added_at.strftime('%Y-%m-%d %H:%M')}")
        
        if entry.anomaly_context:
            reason = entry.anomaly_context.get('trigger_reason', 'Unknown')
            action = entry.anomaly_context.get('recommended_action', 'Monitor')
            print(f"      🚨 Trigger: {reason}")
            print(f"      💡 Action: {action}")
        print()

def show_api_endpoints():
    """Show available API endpoints"""
    print("🔌 AVAILABLE API ENDPOINTS")
    print("=" * 28)
    print()
    print("📋 GET /api/watchlist/")
    print("   Returns current watchlist with customer data")
    print()
    print("🚨 GET /api/alerts/")
    print("   Returns recent anomaly alerts")
    print()
    print("📊 POST /api/track-event/")
    print("   Track customer events for anomaly detection")
    print("   Body: {")
    print('     "customer_id": 1,')
    print('     "event_type": "payment_failed",')
    print('     "metadata": {"amount": 299.99}')
    print("   }")
    print()
    print("🔍 POST /api/trigger-anomaly/")
    print("   Manually trigger anomaly detection")
    print('   Body: {"customer_id": 1}')

def main():
    """Main demonstration function"""
    print("🔍 REAL-TIME WATCHLIST DEMONSTRATION")
    print("=" * 40)
    
    # Step 1: Create sample customers
    print("\n1️⃣ Creating Sample Customers...")
    customers = create_sample_customers()
    
    # Step 2: Simulate events
    simulate_customer_events(customers)
    
    # Step 3: Add to watchlist
    add_to_watchlist(customers)
    
    # Step 4: Create alerts
    create_anomaly_alerts(customers)
    
    # Step 5: Display status
    display_watchlist_status()
    
    # Step 6: Show API info
    show_api_endpoints()
    
    print("\n🎉 DEMO COMPLETE!")
    print("\n📱 Next Steps:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Start React frontend: npm start")
    print("3. Navigate to '🔍 Real-Time Watchlist' tab")
    print("4. View the customers and alerts created above")
    print("5. Test API endpoints with the data created")

if __name__ == "__main__":
    main()
