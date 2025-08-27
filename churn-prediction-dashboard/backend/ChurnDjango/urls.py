from django.urls import path, include

urlpatterns = [
    path('api/churn/', include('churn.urls')),
]