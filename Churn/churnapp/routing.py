from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/alerts/$', consumers.AlertsConsumer.as_asgi()),
    re_path(r'ws/watchlist/$', consumers.WatchlistConsumer.as_asgi()),
    re_path(r'ws/predictions/$', consumers.ChurnPredictionConsumer.as_asgi()),
]
