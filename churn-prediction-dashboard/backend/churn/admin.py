from django.contrib import admin
from .models import Customer, Prediction, Alert

admin.site.register(Customer)
admin.site.register(Prediction)
admin.site.register(Alert)