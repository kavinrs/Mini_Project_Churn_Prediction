import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'churn.settings')

# Mock problematic modules
import sys
from unittest.mock import MagicMock
sys.modules['celery'] = MagicMock()
django.setup()

from churnapp.models import Customer, RealTimeWatchlist
from django.utils import timezone
import random

# Add some customers to watchlist for testing
customers = Customer.objects.all()[:3]
print(f"Adding {len(customers)} customers to watchlist...")

for customer in customers:
    churn_prob = random.uniform(0.4, 0.9)  # High risk values
    risk_level = 'high' if churn_prob >= 0.6 else 'medium'
    
    entry, created = RealTimeWatchlist.objects.get_or_create(
        customer=customer,
        defaults={
            'churn_probability': churn_prob,
            'risk_level': risk_level,
            'anomaly_context': {
                'trigger': 'Demo data',
                'timestamp': timezone.now().isoformat()
            },
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Added {customer.name} - {churn_prob:.1%} risk ({risk_level})")
    else:
        print(f"🔄 Updated {customer.name}")

print("\n🎉 Watchlist populated! Check the frontend tab.")
