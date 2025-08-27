from rest_framework import viewsets
from rest_framework.response import Response
from .models import Customer, Prediction, Alert
from .serializers import CustomerSerializer, PredictionSerializer, AlertSerializer
import joblib

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class PredictionViewSet(viewsets.ViewSet):
    def create(self, request):
        data = request.data
        model = joblib.load('churn_pipeline.pkl')
        prediction = model.predict([data['features']])
        return Response({'prediction': prediction[0]})

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer