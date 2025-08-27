from django.urls import path
from .views import CustomerListView, PredictionView, AlertListView

urlpatterns = [
    path('customers/', CustomerListView.as_view(), name='customer-list'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('alerts/', AlertListView.as_view(), name='alert-list'),
]