import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class AlertsConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time anomaly alerts"""
    
    async def connect(self):
        # Join alerts group
        await self.channel_layer.group_add(
            'alerts',
            self.channel_name
        )
        await self.accept()
        logger.info(f"AlertsConsumer connected: {self.channel_name}")
    
    async def disconnect(self, close_code):
        # Leave alerts group
        await self.channel_layer.group_discard(
            'alerts',
            self.channel_name
        )
        logger.info(f"AlertsConsumer disconnected: {self.channel_name}")
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_alerts':
                # Client wants to subscribe to alerts
                await self.send(text_data=json.dumps({
                    'type': 'subscription_confirmed',
                    'message': 'Subscribed to real-time alerts'
                }))
            elif message_type == 'get_recent_alerts':
                # Send recent alerts to client
                recent_alerts = await self.get_recent_alerts()
                await self.send(text_data=json.dumps({
                    'type': 'recent_alerts',
                    'alerts': recent_alerts
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error in AlertsConsumer.receive: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Server error'
            }))
    
    async def send_alert(self, event):
        """Send alert to WebSocket"""
        message = event['message']
        await self.send(text_data=json.dumps(message))
    
    @database_sync_to_async
    def get_recent_alerts(self):
        """Get recent alerts from database"""
        from .models import AnomalyAlert
        from datetime import timedelta
        
        recent_cutoff = timezone.now() - timedelta(hours=24)
        alerts = AnomalyAlert.objects.filter(
            detected_at__gte=recent_cutoff
        ).order_by('-detected_at')[:20]
        
        alert_data = []
        for alert in alerts:
            alert_data.append({
                'id': alert.id,
                'customer_name': alert.customer.name,
                'customer_id': alert.customer.id,
                'alert_type': alert.alert_type,
                'severity': alert.severity,
                'description': alert.description,
                'anomaly_score': alert.anomaly_score,
                'detected_at': alert.detected_at.isoformat(),
                'is_resolved': alert.is_resolved
            })
        
        return alert_data

class WatchlistConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time watchlist updates"""
    
    async def connect(self):
        # Join watchlist group
        await self.channel_layer.group_add(
            'watchlist',
            self.channel_name
        )
        await self.accept()
        logger.info(f"WatchlistConsumer connected: {self.channel_name}")
    
    async def disconnect(self, close_code):
        # Leave watchlist group
        await self.channel_layer.group_discard(
            'watchlist',
            self.channel_name
        )
        logger.info(f"WatchlistConsumer disconnected: {self.channel_name}")
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_watchlist':
                # Client wants to subscribe to watchlist updates
                await self.send(text_data=json.dumps({
                    'type': 'subscription_confirmed',
                    'message': 'Subscribed to real-time watchlist updates'
                }))
            elif message_type == 'get_current_watchlist':
                # Send current watchlist to client
                current_watchlist = await self.get_current_watchlist()
                await self.send(text_data=json.dumps({
                    'type': 'current_watchlist',
                    'watchlist': current_watchlist
                }))
            elif message_type == 'remove_from_watchlist':
                # Remove customer from watchlist
                customer_id = data.get('customer_id')
                if customer_id:
                    success = await self.remove_from_watchlist(customer_id)
                    await self.send(text_data=json.dumps({
                        'type': 'removal_result',
                        'success': success,
                        'customer_id': customer_id
                    }))
                    
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error in WatchlistConsumer.receive: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Server error'
            }))
    
    async def send_update(self, event):
        """Send watchlist update to WebSocket"""
        message = event['message']
        await self.send(text_data=json.dumps(message))
    
    @database_sync_to_async
    def get_current_watchlist(self):
        """Get current active watchlist entries"""
        from .models import RealTimeWatchlist
        
        watchlist_entries = RealTimeWatchlist.objects.filter(
            is_active=True
        ).order_by('-last_updated')[:50]
        
        watchlist_data = []
        for entry in watchlist_entries:
            watchlist_data.append({
                'id': entry.id,
                'customer_name': entry.customer.name,
                'customer_id': entry.customer.id,
                'churn_probability': entry.churn_probability,
                'risk_level': entry.risk_level,
                'anomaly_context': entry.anomaly_context,
                'added_at': entry.added_at.isoformat(),
                'last_updated': entry.last_updated.isoformat()
            })
        
        return watchlist_data
    
    @database_sync_to_async
    def remove_from_watchlist(self, customer_id):
        """Remove customer from watchlist"""
        from .models import RealTimeWatchlist, Customer
        
        try:
            customer = Customer.objects.get(id=customer_id)
            watchlist_entry = RealTimeWatchlist.objects.get(
                customer=customer,
                is_active=True
            )
            watchlist_entry.is_active = False
            watchlist_entry.save()
            
            logger.info(f"Removed customer {customer.name} from watchlist")
            return True
        except (Customer.DoesNotExist, RealTimeWatchlist.DoesNotExist):
            logger.error(f"Customer or watchlist entry not found: {customer_id}")
            return False
        except Exception as e:
            logger.error(f"Error removing from watchlist: {e}")
            return False

class ChurnPredictionConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time churn prediction updates"""
    
    async def connect(self):
        # Join churn predictions group
        await self.channel_layer.group_add(
            'churn_predictions',
            self.channel_name
        )
        await self.accept()
        logger.info(f"ChurnPredictionConsumer connected: {self.channel_name}")
    
    async def disconnect(self, close_code):
        # Leave churn predictions group
        await self.channel_layer.group_discard(
            'churn_predictions',
            self.channel_name
        )
        logger.info(f"ChurnPredictionConsumer disconnected: {self.channel_name}")
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_predictions':
                await self.send(text_data=json.dumps({
                    'type': 'subscription_confirmed',
                    'message': 'Subscribed to real-time churn predictions'
                }))
            elif message_type == 'trigger_prediction':
                # Trigger prediction for specific customer
                customer_id = data.get('customer_id')
                if customer_id:
                    from .tasks import trigger_churn_prediction
                    trigger_churn_prediction.delay(customer_id)
                    
                    await self.send(text_data=json.dumps({
                        'type': 'prediction_triggered',
                        'customer_id': customer_id,
                        'message': 'Churn prediction triggered'
                    }))
                    
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error in ChurnPredictionConsumer.receive: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Server error'
            }))
    
    async def send_prediction(self, event):
        """Send churn prediction update to WebSocket"""
        message = event['message']
        await self.send(text_data=json.dumps(message))
