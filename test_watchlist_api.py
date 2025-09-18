#!/usr/bin/env python
"""
Test Real-Time Watchlist API endpoints
Run this to test the watchlist functionality
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_watchlist_endpoints():
    """Test all watchlist-related API endpoints"""
    
    print("🔍 Testing Real-Time Watchlist API Endpoints")
    print("=" * 50)
    
    # Test 1: Get current watchlist
    print("\n1️⃣ Testing GET /api/watchlist/")
    try:
        response = requests.get(f"{BASE_URL}/watchlist/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data.get('count', 0)} customers on watchlist")
            
            if data.get('watchlist'):
                for customer in data['watchlist'][:3]:  # Show first 3
                    print(f"   👤 {customer['customer_name']}: {customer['churn_probability']:.1%} risk")
            else:
                print("   📝 Watchlist is currently empty")
        else:
            print(f"❌ Error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Make sure Django server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Get alerts
    print("\n2️⃣ Testing GET /api/alerts/")
    try:
        response = requests.get(f"{BASE_URL}/alerts/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data.get('count', 0)} recent alerts")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Track a sample event (if customers exist)
    print("\n3️⃣ Testing POST /api/track-event/")
    try:
        # Try to track an event for customer ID 1
        event_data = {
            "customer_id": 1,
            "event_type": "payment_failed",
            "metadata": {"amount": 299.99, "error_code": "CARD_DECLINED"}
        }
        
        response = requests.post(f"{BASE_URL}/track-event/", json=event_data)
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Success! Event tracked: {data.get('message')}")
        elif response.status_code == 404:
            print("⚠️  Customer ID 1 not found - this is normal if no sample data exists")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🎉 API Testing Complete!")
    return True

def show_usage_instructions():
    """Show how to use the real-time watchlist"""
    
    print("\n📋 Real-Time Watchlist Usage Instructions")
    print("=" * 45)
    
    print("\n🖥️  Frontend Access:")
    print("1. Open your React app (usually http://localhost:3000)")
    print("2. Click the '🔍 Real-Time Watchlist' tab")
    print("3. View customers, risk levels, and alerts")
    
    print("\n🔌 API Endpoints:")
    print("• GET /api/watchlist/ - View current watchlist")
    print("• GET /api/alerts/ - View recent alerts") 
    print("• POST /api/track-event/ - Track customer events")
    print("• POST /api/trigger-anomaly/ - Trigger anomaly detection")
    
    print("\n⚡ Real-Time Features (requires Redis + Celery):")
    print("• Automatic event processing")
    print("• WebSocket live updates")
    print("• Background anomaly detection")
    print("• Scheduled monitoring tasks")
    
    print("\n🚀 Quick Start:")
    print("1. Ensure Django server is running: python manage.py runserver")
    print("2. Start React frontend: npm start")
    print("3. Navigate to Real-Time Watchlist tab")
    print("4. Use API endpoints to add/test data")

if __name__ == "__main__":
    success = test_watchlist_endpoints()
    if success:
        show_usage_instructions()
