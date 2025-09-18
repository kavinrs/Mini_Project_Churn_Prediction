
from django.urls import path
from .views import (
    predict_view, track_customer_event, get_anomaly_alerts, 
    get_watchlist, trigger_anomaly_detection, resolve_alert, 
    get_customer_behavior
)

urlpatterns = [
    path('predict/', predict_view, name='predict'),
    path('track-event/', track_customer_event, name='track_event'),
    path('alerts/', get_anomaly_alerts, name='get_alerts'),
    path('watchlist/', get_watchlist, name='get_watchlist'),
    path('trigger-anomaly/', trigger_anomaly_detection, name='trigger_anomaly'),
    path('resolve-alert/', resolve_alert, name='resolve_alert'),
    path('customer/<int:customer_id>/behavior/', get_customer_behavior, name='customer_behavior'),
]
