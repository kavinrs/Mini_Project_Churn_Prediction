from celery import shared_task
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
import logging
import json

from .models import Customer, CustomerEvent, AnomalyAlert, RealTimeWatchlist
from .anomaly_detection import anomaly_detector
from .utils import predict_with_explainability
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)
channel_layer = get_channel_layer()

@shared_task(bind=True, max_retries=3)
def process_customer_event(self, customer_id, event_type, metadata=None):
    """Process a new customer event and check for anomalies"""
    try:
        customer = Customer.objects.get(id=customer_id)
        
        # Create the event
        event = CustomerEvent.objects.create(
            customer=customer,
            event_type=event_type,
            metadata=metadata or {}
        )
        
        logger.info(f"Created event: {event}")
        
        # Trigger anomaly detection for critical events
        critical_events = ['purchase', 'payment_failed', 'support_ticket', 'cart_abandon', 'app_crash']
        if event_type in critical_events:
            # Run anomaly detection asynchronously
            detect_customer_anomaly.delay(customer_id)
        
        # Update customer's last activity
        customer.last_activity = timezone.now()
        customer.save()
        
        return f"Processed event {event.id} for customer {customer.name}"
        
    except Customer.DoesNotExist:
        logger.error(f"Customer {customer_id} not found")
        raise
    except Exception as exc:
        logger.error(f"Error processing event: {exc}")
        raise self.retry(exc=exc, countdown=60)

@shared_task(bind=True, max_retries=2)
def detect_customer_anomaly(self, customer_id):
    """Detect anomalies for a specific customer"""
    try:
        customer = Customer.objects.get(id=customer_id)
        
        # Run anomaly detection
        result = anomaly_detector.detect_anomaly(customer)
        
        if result and result['is_anomaly']:
            logger.info(f"Anomaly detected for customer {customer.name}: {result['anomaly_score']}")
            
            # Trigger churn prediction if anomaly is severe
            if result['anomaly_score'] < -0.7:  # Very anomalous
                trigger_churn_prediction.delay(customer_id, anomaly_context=result)
            
            # Send real-time notification
            send_anomaly_notification.delay(customer_id, result)
            
        return f"Anomaly detection completed for customer {customer.name}"
        
    except Customer.DoesNotExist:
        logger.error(f"Customer {customer_id} not found")
        raise
    except Exception as exc:
        logger.error(f"Error in anomaly detection: {exc}")
        raise self.retry(exc=exc, countdown=120)

@shared_task(bind=True, max_retries=2)
def trigger_churn_prediction(self, customer_id, anomaly_context=None):
    """Trigger churn prediction for a customer with anomaly context"""
    try:
        customer = Customer.objects.get(id=customer_id)
        
        # Prepare customer data for prediction (using sample data structure)
        customer_data = {
            'Tenure': getattr(customer, 'tenure', 12),
            'PreferredLoginDevice': getattr(customer, 'preferred_login_device', 'Mobile Phone'),
            'CityTier': getattr(customer, 'city_tier', 1),
            'WarehouseToHome': getattr(customer, 'warehouse_to_home', 15.0),
            'PreferredPaymentMode': getattr(customer, 'preferred_payment_mode', 'Debit Card'),
            'Gender': getattr(customer, 'gender', 'Male'),
            'HourSpendOnApp': getattr(customer, 'hour_spend_on_app', 3.0),
            'NumberOfDeviceRegistered': getattr(customer, 'number_of_device_registered', 3),
            'PreferedOrderCat': getattr(customer, 'prefered_order_cat', 'Laptop & Accessory'),
            'SatisfactionScore': getattr(customer, 'satisfaction_score', 3),
            'MaritalStatus': getattr(customer, 'marital_status', 'Single'),
            'NumberOfAddress': getattr(customer, 'number_of_address', 2),
            'Complain': getattr(customer, 'complain', 0),
            'OrderAmountHikeFromlastYear': getattr(customer, 'order_amount_hike_from_last_year', 15.0),
            'CouponUsed': getattr(customer, 'coupon_used', 5),
            'OrderCount': getattr(customer, 'order_count', 3),
            'DaySinceLastOrder': getattr(customer, 'day_since_last_order', 5),
            'CashbackAmount': getattr(customer, 'cashback_amount', 150.0)
        }
        
        # Get churn prediction
        prediction_result = predict_with_explainability(customer_data)
        
        # Check if customer should be added to watchlist
        churn_probability = prediction_result.get('churn_probability', 0)
        if churn_probability >= 0.32:  # High risk threshold
            add_to_watchlist.delay(customer_id, churn_probability, anomaly_context)
        
        logger.info(f"Churn prediction for {customer.name}: {churn_probability:.3f}")
        
        return {
            'customer_id': customer_id,
            'churn_probability': churn_probability,
            'prediction_result': prediction_result
        }
        
    except Customer.DoesNotExist:
        logger.error(f"Customer {customer_id} not found")
        raise
    except Exception as exc:
        logger.error(f"Error in churn prediction: {exc}")
        raise self.retry(exc=exc, countdown=120)

@shared_task
def add_to_watchlist(customer_id, churn_probability, anomaly_context=None):
    """Add customer to real-time watchlist"""
    try:
        customer = Customer.objects.get(id=customer_id)
        
        # Check if already on watchlist
        watchlist_entry, created = RealTimeWatchlist.objects.get_or_create(
            customer=customer,
            defaults={
                'churn_probability': churn_probability,
                'risk_level': 'high' if churn_probability >= 0.6 else 'medium',
                'anomaly_context': anomaly_context or {},
                'is_active': True
            }
        )
        
        if not created:
            # Update existing entry
            watchlist_entry.churn_probability = churn_probability
            watchlist_entry.risk_level = 'high' if churn_probability >= 0.6 else 'medium'
            watchlist_entry.anomaly_context = anomaly_context or {}
            watchlist_entry.last_updated = timezone.now()
            watchlist_entry.save()
        
        logger.info(f"Added {customer.name} to watchlist with {churn_probability:.3f} churn probability")
        
        # Send real-time update to frontend
        send_watchlist_update.delay(customer_id, 'added')
        
        return f"Customer {customer.name} added to watchlist"
        
    except Customer.DoesNotExist:
        logger.error(f"Customer {customer_id} not found")
    except Exception as exc:
        logger.error(f"Error adding to watchlist: {exc}")

@shared_task
def send_anomaly_notification(customer_id, anomaly_result):
    """Send real-time anomaly notification to frontend"""
    try:
        customer = Customer.objects.get(id=customer_id)
        
        notification_data = {
            'type': 'anomaly_detected',
            'customer_id': customer_id,
            'customer_name': customer.name,
            'anomaly_score': anomaly_result['anomaly_score'],
            'anomaly_details': anomaly_result['anomaly_details'],
            'timestamp': timezone.now().isoformat(),
            'severity': 'high' if anomaly_result['anomaly_score'] < -0.7 else 'medium'
        }
        
        # Send to WebSocket group
        async_to_sync(channel_layer.group_send)(
            'alerts',
            {
                'type': 'send_alert',
                'message': notification_data
            }
        )
        
        logger.info(f"Sent anomaly notification for {customer.name}")
        return f"Notification sent for customer {customer.name}"
        
    except Customer.DoesNotExist:
        logger.error(f"Customer {customer_id} not found")
    except Exception as exc:
        logger.error(f"Error sending notification: {exc}")

@shared_task
def send_watchlist_update(customer_id, action):
    """Send watchlist update to frontend"""
    try:
        customer = Customer.objects.get(id=customer_id)
        watchlist_entry = RealTimeWatchlist.objects.get(customer=customer, is_active=True)
        
        update_data = {
            'type': 'watchlist_update',
            'action': action,  # 'added', 'updated', 'removed'
            'customer_id': customer_id,
            'customer_name': customer.name,
            'churn_probability': watchlist_entry.churn_probability,
            'risk_level': watchlist_entry.risk_level,
            'timestamp': timezone.now().isoformat()
        }
        
        # Send to WebSocket group
        async_to_sync(channel_layer.group_send)(
            'watchlist',
            {
                'type': 'send_update',
                'message': update_data
            }
        )
        
        logger.info(f"Sent watchlist update for {customer.name}: {action}")
        return f"Watchlist update sent for customer {customer.name}"
        
    except (Customer.DoesNotExist, RealTimeWatchlist.DoesNotExist):
        logger.error(f"Customer or watchlist entry not found for {customer_id}")
    except Exception as exc:
        logger.error(f"Error sending watchlist update: {exc}")

@shared_task
def batch_anomaly_detection():
    """Run batch anomaly detection for all active customers"""
    try:
        # Get customers with recent activity (last 24 hours)
        recent_cutoff = timezone.now() - timedelta(hours=24)
        active_customers = Customer.objects.filter(
            Q(last_activity__gte=recent_cutoff) | Q(events__timestamp__gte=recent_cutoff)
        ).distinct()
        
        processed_count = 0
        anomalies_found = 0
        
        for customer in active_customers:
            try:
                result = anomaly_detector.detect_anomaly(customer)
                processed_count += 1
                
                if result and result['is_anomaly']:
                    anomalies_found += 1
                    logger.info(f"Batch anomaly detected: {customer.name}")
                    
                    # Send notification for severe anomalies
                    if result['anomaly_score'] < -0.6:
                        send_anomaly_notification.delay(customer.id, result)
                        
            except Exception as e:
                logger.error(f"Error processing customer {customer.id}: {e}")
                continue
        
        logger.info(f"Batch anomaly detection completed: {processed_count} customers processed, {anomalies_found} anomalies found")
        
        return {
            'processed_count': processed_count,
            'anomalies_found': anomalies_found,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Error in batch anomaly detection: {exc}")
        raise

@shared_task
def cleanup_old_alerts():
    """Clean up old anomaly alerts and watchlist entries"""
    try:
        # Remove alerts older than 30 days
        old_alerts_cutoff = timezone.now() - timedelta(days=30)
        old_alerts = AnomalyAlert.objects.filter(detected_at__lt=old_alerts_cutoff)
        deleted_alerts = old_alerts.count()
        old_alerts.delete()
        
        # Remove inactive watchlist entries older than 7 days
        old_watchlist_cutoff = timezone.now() - timedelta(days=7)
        old_watchlist = RealTimeWatchlist.objects.filter(
            is_active=False,
            last_updated__lt=old_watchlist_cutoff
        )
        deleted_watchlist = old_watchlist.count()
        old_watchlist.delete()
        
        logger.info(f"Cleanup completed: {deleted_alerts} alerts, {deleted_watchlist} watchlist entries removed")
        
        return {
            'deleted_alerts': deleted_alerts,
            'deleted_watchlist': deleted_watchlist,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Error in cleanup: {exc}")
        raise

@shared_task
def update_customer_baselines():
    """Update customer behavior baselines periodically"""
    try:
        customers = Customer.objects.all()
        updated_count = 0
        
        for customer in customers:
            try:
                # This will calculate and save new baseline
                anomaly_detector._calculate_baseline(customer)
                updated_count += 1
            except Exception as e:
                logger.error(f"Error updating baseline for customer {customer.id}: {e}")
                continue
        
        logger.info(f"Updated baselines for {updated_count} customers")
        
        return {
            'updated_count': updated_count,
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Error updating baselines: {exc}")
        raise
