#!/usr/bin/env python
"""
Working Real-Time Watchlist Demo
Handles existing customer data and demonstrates watchlist functionality
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')
django.setup()

from churnapp.models import Customer, RealTimeWatchlist, CustomerEvent, AnomalyAlert
from django.utils import timezone
import random
import uuid

def get_or_create_customers():
    """Get existing customers or create new ones with proper customer_id"""
    existing_customers = list(Customer.objects.all()[:5])
    
    if existing_customers:
        print(f"✅ Found {len(existing_customers)} existing customers")
        return existing_customers
    
    # Create new customers with unique customer_ids
    sample_customers = [
        {'name': 'Alice Johnson', 'email': 'alice@example.com'},
        {'name': 'Bob Smith', 'email': 'bob@example.com'},
        {'name': 'Carol Davis', 'email': 'carol@example.com'},
        {'name': 'David Wilson', 'email': 'david@example.com'},
        {'name': 'Emma Brown', 'email': 'emma@example.com'},
    ]
    
    created_customers = []
    for customer_data in sample_customers:
        customer_id = f"CUST_{uuid.uuid4().hex[:8].upper()}"
        
        customer = Customer.objects.create(
            customer_id=customer_id,
            name=customer_data['name'],
            email=customer_data['email']
        )
        created_customers.append(customer)
        print(f"✅ Created customer: {customer.name} ({customer.customer_id})")
    
    return created_customers

def demonstrate_watchlist():
    """Main demonstration of real-time watchlist functionality"""
    print("🔍 REAL-TIME WATCHLIST DEMONSTRATION")
    print("=" * 40)
    
    # Step 1: Get customers
    print("\n1️⃣ Setting up Customer Data...")
    customers = get_or_create_customers()
    
    # Step 2: Clear existing watchlist for clean demo
    print("\n2️⃣ Clearing existing watchlist...")
    RealTimeWatchlist.objects.all().delete()
    print("   🗑️ Watchlist cleared")
    
    # Step 3: Simulate high-risk scenarios and add to watchlist
    print("\n3️⃣ Adding High-Risk Customers to Watchlist...")
    
    risk_scenarios = [
        {
            'churn_prob': 0.85,
            'risk_level': 'high',
            'reason': 'Multiple payment failures detected',
            'priority': 'critical'
        },
        {
            'churn_prob': 0.72,
            'risk_level': 'high', 
            'reason': 'Unusual cart abandonment pattern',
            'priority': 'high'
        },
        {
            'churn_prob': 0.45,
            'risk_level': 'medium',
            'reason': 'Support ticket frequency spike',
            'priority': 'medium'
        },
        {
            'churn_prob': 0.38,
            'risk_level': 'medium',
            'reason': 'App crash incidents increased',
            'priority': 'medium'
        },
    ]
    
    watchlist_entries = []
    for i, customer in enumerate(customers[:4]):
        scenario = risk_scenarios[i]
        
        # Update customer's churn probability
        customer.current_churn_probability = scenario['churn_prob']
        customer.last_prediction_update = timezone.now()
        customer.save()
        
        # Create watchlist entry using the correct model structure
        entry = RealTimeWatchlist.objects.create(
            customer=customer,
            reason=scenario['reason'],
            priority=scenario['priority'],
            check_frequency_minutes=5 if scenario['priority'] == 'critical' else 15,
            alert_threshold=0.7,
            is_active=True
        )
        
        watchlist_entries.append(entry)
        
        print(f"   ➕ {customer.name}")
        print(f"      📊 Churn Risk: {scenario['churn_prob']:.1%}")
        print(f"      ⚠️  Priority: {scenario['priority'].upper()}")
        print(f"      🚨 Reason: {scenario['reason']}")
    
    # Step 4: Create customer events
    print("\n4️⃣ Simulating Customer Events...")
    
    event_types = ['payment_failed', 'cart_abandon', 'support_ticket', 'app_crash', 'login_failed']
    
    for customer in customers[:3]:
        num_events = random.randint(2, 4)
        for _ in range(num_events):
            CustomerEvent.objects.create(
                customer=customer,
                event_type=random.choice(event_types),
                metadata={
                    'amount': random.uniform(50, 500),
                    'timestamp': timezone.now().isoformat()
                },
                timestamp=timezone.now() - timezone.timedelta(minutes=random.randint(1, 60))
            )
        print(f"   📊 {customer.name}: {num_events} events created")
    
    # Step 5: Create anomaly alerts
    print("\n5️⃣ Creating Anomaly Alerts...")
    
    alert_types = ['login_drop', 'purchase_drop', 'payment_issues']
    severities = ['high', 'medium', 'critical']
    
    for customer in customers[:3]:
        AnomalyAlert.objects.create(
            customer=customer,
            alert_type=random.choice(alert_types),
            severity=random.choice(severities),
            description=f"Anomaly detected in {customer.name}'s behavior pattern",
            anomaly_score=random.uniform(0.6, 0.9),
            triggered_churn_prediction=True,
            updated_churn_probability=customer.current_churn_probability
        )
        print(f"   🚨 Alert created for {customer.name}")
    
    # Step 6: Display current watchlist status
    print("\n6️⃣ CURRENT WATCHLIST STATUS")
    print("=" * 32)
    
    active_entries = RealTimeWatchlist.objects.filter(is_active=True).order_by('-priority', '-added_at')
    
    print(f"   👥 Total customers monitored: {active_entries.count()}")
    print()
    
    priority_icons = {
        'critical': '🔴',
        'high': '🟠', 
        'medium': '🟡',
        'low': '🟢'
    }
    
    for i, entry in enumerate(active_entries, 1):
        icon = priority_icons.get(entry.priority, '⚪')
        churn_prob = entry.customer.current_churn_probability
        
        print(f"   {i}. {icon} {entry.customer.name}")
        print(f"      📊 Churn Risk: {churn_prob:.1%}")
        print(f"      ⚠️  Priority: {entry.priority.upper()}")
        print(f"      🚨 Reason: {entry.reason}")
        print(f"      🕒 Added: {entry.added_at.strftime('%Y-%m-%d %H:%M')}")
        print(f"      ⏱️  Check Frequency: Every {entry.check_frequency_minutes} minutes")
        print()
    
    # Step 7: Show alert summary
    print("7️⃣ RECENT ALERTS SUMMARY")
    print("=" * 25)
    
    recent_alerts = AnomalyAlert.objects.filter(status='new').order_by('-detected_at')[:5]
    
    if recent_alerts:
        print(f"   🚨 {recent_alerts.count()} active alerts")
        for alert in recent_alerts:
            severity_icon = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢'}.get(alert.severity, '⚪')
            print(f"   {severity_icon} {alert.customer.name}: {alert.alert_type}")
    else:
        print("   ✅ No active alerts")
    
    # Step 8: API endpoints and usage
    print("\n8️⃣ API ENDPOINTS FOR REAL-TIME ACCESS")
    print("=" * 38)
    print()
    print("📋 GET /api/watchlist/")
    print("   Returns current watchlist with all customer data")
    print()
    print("🚨 GET /api/alerts/")
    print("   Returns recent anomaly alerts")
    print()
    print("📊 POST /api/track-event/")
    print("   Track new customer events")
    print("   Example: {")
    print(f'     "customer_id": {customers[0].id},')
    print('     "event_type": "payment_failed",')
    print('     "metadata": {"amount": 299.99}')
    print("   }")
    print()
    print("🔍 POST /api/trigger-anomaly/")
    print("   Manually trigger anomaly detection")
    print(f'   Example: {{"customer_id": {customers[0].id}}}')
    
    # Step 9: Frontend access instructions
    print("\n9️⃣ FRONTEND ACCESS")
    print("=" * 17)
    print("To view this data in your React frontend:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Start React frontend: npm start") 
    print("3. Navigate to '🔍 Real-Time Watchlist' tab")
    print("4. The watchlist will show all customers added above")
    print("5. Each entry displays:")
    print("   • Real-time risk indicators")
    print("   • Churn probability percentages") 
    print("   • Priority levels and reasons")
    print("   • Time-based monitoring frequency")
    
    print("\n🎉 REAL-TIME WATCHLIST DEMO COMPLETE!")
    print("\nThe system is now populated with sample data.")
    print("Check the frontend to see the real-time watchlist in action!")

if __name__ == "__main__":
    demonstrate_watchlist()
