#!/usr/bin/env python
"""
Direct Watchlist Management
Add/remove customers from watchlist without external dependencies
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')
django.setup()

from churnapp.models import Customer, RealTimeWatchlist
from django.utils import timezone
import random

def add_customers_to_watchlist():
    """Add sample customers to watchlist for testing"""
    print("🔍 Adding Customers to Real-Time Watchlist")
    print("=" * 45)
    
    customers = Customer.objects.all()[:5]
    if not customers:
        print("❌ No customers found. Run: python manage.py populate_sample_data")
        return
    
    added_count = 0
    
    for customer in customers:
        # Generate realistic high-risk scenarios
        churn_prob = random.uniform(0.35, 0.85)  # High risk range
        risk_level = 'high' if churn_prob >= 0.6 else 'medium'
        
        # Create anomaly context
        anomaly_reasons = [
            "Multiple payment failures detected",
            "Unusual cart abandonment pattern",
            "Support ticket frequency spike",
            "App crash incidents increased",
            "Login frequency dropped significantly"
        ]
        
        entry, created = RealTimeWatchlist.objects.get_or_create(
            customer=customer,
            defaults={
                'churn_probability': churn_prob,
                'risk_level': risk_level,
                'anomaly_context': {
                    'trigger_reason': random.choice(anomaly_reasons),
                    'detection_timestamp': timezone.now().isoformat(),
                    'confidence_score': random.uniform(0.7, 0.95),
                    'recommended_action': 'Immediate intervention required' if risk_level == 'high' else 'Monitor closely'
                },
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Added {customer.name}")
            print(f"   📊 Churn Risk: {churn_prob:.1%}")
            print(f"   ⚠️  Risk Level: {risk_level.upper()}")
            print(f"   🚨 Reason: {entry.anomaly_context['trigger_reason']}")
            added_count += 1
        else:
            # Update existing entry
            entry.churn_probability = churn_prob
            entry.risk_level = risk_level
            entry.last_updated = timezone.now()
            entry.save()
            print(f"🔄 Updated {customer.name}")
    
    print(f"\n🎉 Watchlist updated! {added_count} new entries added.")
    return added_count

def view_current_watchlist():
    """Display current watchlist status"""
    print("\n📋 Current Watchlist Status")
    print("=" * 30)
    
    active_entries = RealTimeWatchlist.objects.filter(is_active=True).order_by('-churn_probability')
    
    if not active_entries:
        print("   📝 Watchlist is empty")
        return
    
    print(f"   👥 Total customers monitored: {active_entries.count()}")
    print()
    
    for i, entry in enumerate(active_entries, 1):
        risk_icon = "🔴" if entry.risk_level == 'high' else "🟡"
        print(f"   {i}. {risk_icon} {entry.customer.name}")
        print(f"      📊 Churn Risk: {entry.churn_probability:.1%}")
        print(f"      ⚠️  Risk Level: {entry.risk_level.upper()}")
        print(f"      🕒 Added: {entry.added_at.strftime('%Y-%m-%d %H:%M')}")
        
        if entry.anomaly_context:
            reason = entry.anomaly_context.get('trigger_reason', 'Unknown')
            print(f"      🚨 Trigger: {reason}")
        print()

def clear_watchlist():
    """Clear all watchlist entries"""
    count = RealTimeWatchlist.objects.filter(is_active=True).count()
    if count > 0:
        RealTimeWatchlist.objects.filter(is_active=True).update(is_active=False)
        print(f"🗑️  Cleared {count} entries from watchlist")
    else:
        print("📝 Watchlist was already empty")

def main():
    """Main function to manage watchlist"""
    print("🔍 REAL-TIME WATCHLIST MANAGER")
    print("=" * 35)
    
    while True:
        print("\nChoose an option:")
        print("1. Add customers to watchlist")
        print("2. View current watchlist")
        print("3. Clear watchlist")
        print("4. Exit")
        
        try:
            choice = input("\nEnter choice (1-4): ").strip()
            
            if choice == '1':
                add_customers_to_watchlist()
            elif choice == '2':
                view_current_watchlist()
            elif choice == '3':
                clear_watchlist()
            elif choice == '4':
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please enter 1-4.")
                
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    # Quick demo mode - just add customers and show status
    print("🚀 Quick Demo Mode")
    add_customers_to_watchlist()
    view_current_watchlist()
    
    print("\n📱 Frontend Access:")
    print("Navigate to '🔍 Real-Time Watchlist' tab in your React app")
    print("The customers added above will be displayed there!")
    
    print("\n🔌 API Access:")
    print("GET http://localhost:8000/api/watchlist/ - View watchlist data")
    print("GET http://localhost:8000/api/alerts/ - View recent alerts")
