from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import predict_with_explainability, RAW_FEATURES
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.http import JsonResponse
from .models import Customer, CustomerEvent, AnomalyAlert, RealTimeWatchlist
try:
    from .tasks import process_customer_event, detect_customer_anomaly
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
try:
    from .anomaly_detection import anomaly_detector
    ANOMALY_DETECTOR_AVAILABLE = True
except ImportError:
    ANOMALY_DETECTOR_AVAILABLE = False
from datetime import timedelta
import json
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['POST', 'GET'])
def predict_view(request):
    if request.method == 'POST':
        input_data = request.data

        # Validate required fields
        missing = [col for col in RAW_FEATURES if col not in input_data]
        if missing:
            return Response(
                {"error": f"Missing required fields: {missing}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional: Validate types (basic check)
        try:
            result = predict_with_explainability(input_data)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return Response(
        {"message": "Use POST to submit data for churn prediction."},
        status=status.HTTP_200_OK
    )


@csrf_exempt
@api_view(['POST'])
def track_customer_event(request):
    """API endpoint to track customer events for real-time processing"""
    try:
        data = request.data
        customer_id = data.get('customer_id')
        event_type = data.get('event_type')
        metadata = data.get('metadata', {})
        
        if not customer_id or not event_type:
            return Response(
                {"error": "customer_id and event_type are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate customer exists
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Process event asynchronously
        if CELERY_AVAILABLE:
            task = process_customer_event.delay(customer_id, event_type, metadata)
            task_id = task.id
        else:
            task_id = None
        
        return Response({
            "message": "Event tracked successfully",
            "task_id": task_id,
            "customer_id": customer_id,
            "event_type": event_type,
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error tracking event: {e}")
        return Response(
            {"error": "Failed to track event"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['GET'])
def get_anomaly_alerts(request):
    """Get recent anomaly alerts"""
    try:
        hours_back = int(request.GET.get('hours', 24))
        limit = int(request.GET.get('limit', 50))
        
        cutoff_time = timezone.now() - timedelta(hours=hours_back)
        alerts = AnomalyAlert.objects.filter(
            detected_at__gte=cutoff_time
        ).order_by('-detected_at')[:limit]
        
        alert_data = []
        for alert in alerts:
            alert_data.append({
                'id': alert.id,
                'customer_id': alert.customer.id,
                'customer_name': alert.customer.name,
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'description': alert.description,
                'anomaly_score': alert.anomaly_score,
                'baseline_value': alert.baseline_value,
                'current_value': alert.current_value,
                'detected_at': alert.detected_at.isoformat(),
                'is_resolved': alert.status == 'resolved'
            })
        
        return Response({
            'alerts': alert_data,
            'count': len(alert_data),
            'hours_back': hours_back
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        return Response(
            {"error": "Failed to get alerts"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['GET'])
def get_watchlist(request):
    """Get current real-time watchlist"""
    try:
        active_only = request.GET.get('active_only', 'true').lower() == 'true'
        limit = int(request.GET.get('limit', 50))
        
        queryset = RealTimeWatchlist.objects.all()
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        watchlist_entries = queryset.order_by('-added_at')[:limit]
        
        watchlist_data = []
        for entry in watchlist_entries:
            # Calculate risk level based on customer's current churn probability
            churn_prob = entry.customer.current_churn_probability
            if churn_prob >= 0.8:
                risk_level = 'high'
            elif churn_prob >= 0.5:
                risk_level = 'medium'
            else:
                risk_level = 'low'
                
            watchlist_data.append({
                'id': entry.id,
                'customer_id': entry.customer.id,
                'customer_name': entry.customer.name,
                'churn_probability': churn_prob,
                'risk_level': risk_level,
                'reason': entry.reason,
                'priority': entry.priority,
                'added_at': entry.added_at.isoformat(),
                'last_updated': entry.customer.last_prediction_update.isoformat() if entry.customer.last_prediction_update else entry.added_at.isoformat(),
                'is_active': entry.is_active
            })
        
        return Response({
            'watchlist': watchlist_data,
            'count': len(watchlist_data),
            'active_only': active_only
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting watchlist: {e}")
        return Response(
            {"error": "Failed to get watchlist"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
def trigger_anomaly_detection(request):
    """Manually trigger anomaly detection for a customer"""
    try:
        customer_id = request.data.get('customer_id')
        
        if not customer_id:
            return Response(
                {"error": "customer_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate customer exists
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Trigger anomaly detection asynchronously
        if CELERY_AVAILABLE:
            task = detect_customer_anomaly.delay(customer_id)
            task_id = task.id
        else:
            task_id = None
        
        return Response({
            "message": "Anomaly detection triggered",
            "task_id": task_id,
            "customer_id": customer_id,
            "customer_name": customer.name,
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error triggering anomaly detection: {e}")
        return Response(
            {"error": "Failed to trigger anomaly detection"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
def resolve_alert(request):
    """Mark an anomaly alert as resolved"""
    try:
        alert_id = request.data.get('alert_id')
        
        if not alert_id:
            return Response(
                {"error": "alert_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            alert = AnomalyAlert.objects.get(id=alert_id)
            alert.status = 'resolved'
            alert.resolved_at = timezone.now()
            alert.save()
            
            return Response({
                "message": "Alert resolved successfully",
                "alert_id": alert_id,
                "resolved_at": alert.resolved_at.isoformat()
            }, status=status.HTTP_200_OK)
            
        except AnomalyAlert.DoesNotExist:
            return Response(
                {"error": "Alert not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
    except Exception as e:
        logger.error(f"Error resolving alert: {e}")
        return Response(
            {"error": "Failed to resolve alert"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['GET'])
def get_customer_behavior(request, customer_id):
    """Get customer behavior analysis and anomaly status"""
    try:
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Customer not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get recent events
        days_back = int(request.GET.get('days', 7))
        cutoff_time = timezone.now() - timedelta(days=days_back)
        recent_events = CustomerEvent.objects.filter(
            customer=customer,
            timestamp__gte=cutoff_time
        ).order_by('-timestamp')
        
        # Get behavioral features
        features = anomaly_detector.extract_behavioral_features(customer, days_back)
        
        # Get recent alerts
        recent_alerts = AnomalyAlert.objects.filter(
            customer=customer,
            detected_at__gte=cutoff_time
        ).order_by('-detected_at')
        
        # Check if on watchlist
        on_watchlist = RealTimeWatchlist.objects.filter(
            customer=customer,
            is_active=True
        ).exists()
        
        # Format events data
        events_data = []
        for event in recent_events[:20]:  # Limit to 20 recent events
            events_data.append({
                'id': event.id,
                'event_type': event.event_type,
                'metadata': event.metadata,
                'timestamp': event.timestamp.isoformat()
            })
        
        # Format alerts data
        alerts_data = []
        for alert in recent_alerts:
            alerts_data.append({
                'id': alert.id,
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'description': alert.description,
                'anomaly_score': alert.anomaly_score,
                'detected_at': alert.detected_at.isoformat(),
                'is_resolved': alert.status == 'resolved'
            })
        
        return Response({
            'customer_id': customer_id,
            'customer_name': customer.name,
            'behavioral_features': features,
            'recent_events': events_data,
            'recent_alerts': alerts_data,
            'on_watchlist': on_watchlist,
            'analysis_period_days': days_back,
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting customer behavior: {e}")
        return Response(
            {"error": "Failed to get customer behavior"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
