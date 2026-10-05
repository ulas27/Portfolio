"""
Enterprise Real-Time Notifications System
WebSocket, Server-Sent Events, Push Notifications
"""

import json
import time
import threading
from datetime import datetime, timedelta
from flask import current_app, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room
from enum import Enum
import logging
from queue import Queue, Empty
import uuid

logger = logging.getLogger(__name__)

class NotificationType(Enum):
    """Notification types"""
    ORDER_UPDATE = "order_update"
    PAYMENT_STATUS = "payment_status"
    SHIPMENT_UPDATE = "shipment_update"
    PROMOTION = "promotion"
    SYSTEM_ALERT = "system_alert"
    SECURITY_ALERT = "security_alert"
    NEWSLETTER = "newsletter"
    REVIEW_REQUEST = "review_request"
    CART_REMINDER = "cart_reminder"
    WELCOME = "welcome"

class NotificationPriority(Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NotificationChannel(Enum):
    """Notification channels"""
    WEBSOCKET = "websocket"
    SSE = "sse"
    PUSH = "push"
    EMAIL = "email"
    SMS = "sms"

class NotificationManager:
    """Enterprise notification management system"""
    
    def __init__(self, app=None, socketio=None):
        self.app = app
        self.socketio = socketio
        self.notifications = {}
        self.user_sessions = {}
        self.notification_queue = Queue()
        self.worker_threads = []
        self.running = False
        self.sse_connections = {}
        
        if app:
            self.init_app(app, socketio)
    
    def init_app(self, app, socketio=None):
        """Initialize notification manager"""
        self.app = app
        self.socketio = socketio
        
        # Start worker threads
        self._start_workers()
        
        # Setup SocketIO events
        if self.socketio:
            self._setup_socketio_events()
    
    def _start_workers(self):
        """Start notification worker threads"""
        try:
            self.running = True
            
            # Start notification worker
            worker = threading.Thread(
                target=self._notification_worker,
                name="NotificationWorker",
                daemon=True
            )
            worker.start()
            self.worker_threads.append(worker)
            
            logger.info("Notification workers started successfully")
            
        except Exception as e:
            logger.error(f"Error starting notification workers: {str(e)}")
    
    def _notification_worker(self):
        """Notification worker thread"""
        while self.running:
            try:
                # Get notification from queue
                notification = self.notification_queue.get(timeout=1)
                
                # Process notification
                self._process_notification(notification)
                
                # Mark task as done
                self.notification_queue.task_done()
                
            except Empty:
                # No notifications in queue, continue
                continue
            except Exception as e:
                logger.error(f"Error in notification worker: {str(e)}")
                time.sleep(1)
    
    def _setup_socketio_events(self):
        """Setup SocketIO event handlers"""
        try:
            @self.socketio.on('connect')
            def handle_connect():
                """Handle client connection"""
                user_id = session.get('user_id')
                if user_id:
                    join_room(f"user_{user_id}")
                    self.user_sessions[request.sid] = user_id
                    logger.info(f"User {user_id} connected via WebSocket")
            
            @self.socketio.on('disconnect')
            def handle_disconnect():
                """Handle client disconnection"""
                user_id = self.user_sessions.get(request.sid)
                if user_id:
                    leave_room(f"user_{user_id}")
                    del self.user_sessions[request.sid]
                    logger.info(f"User {user_id} disconnected from WebSocket")
            
            @self.socketio.on('join_room')
            def handle_join_room(data):
                """Handle joining a specific room"""
                room = data.get('room')
                if room:
                    join_room(room)
                    logger.info(f"Client joined room: {room}")
            
            @self.socketio.on('leave_room')
            def handle_leave_room(data):
                """Handle leaving a specific room"""
                room = data.get('room')
                if room:
                    leave_room(room)
                    logger.info(f"Client left room: {room}")
            
            @self.socketio.on('mark_notification_read')
            def handle_mark_read(data):
                """Handle marking notification as read"""
                notification_id = data.get('notification_id')
                if notification_id:
                    self._mark_notification_read(notification_id)
            
            logger.info("SocketIO events setup completed")
            
        except Exception as e:
            logger.error(f"Error setting up SocketIO events: {str(e)}")
    
    def send_notification(self, user_id, notification_type, title, message, 
                         data=None, priority=NotificationPriority.NORMAL,
                         channels=None, expires_at=None):
        """Send notification to user"""
        try:
            if channels is None:
                channels = [NotificationChannel.WEBSOCKET, NotificationChannel.SSE]
            
            notification = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'type': notification_type.value if isinstance(notification_type, NotificationType) else notification_type,
                'title': title,
                'message': message,
                'data': data or {},
                'priority': priority.value if isinstance(priority, NotificationPriority) else priority,
                'channels': [ch.value if isinstance(ch, NotificationChannel) else ch for ch in channels],
                'created_at': datetime.utcnow().isoformat(),
                'expires_at': expires_at.isoformat() if expires_at else None,
                'read': False,
                'delivered': False
            }
            
            # Add to queue for processing
            self.notification_queue.put(notification)
            
            # Store notification
            if user_id not in self.notifications:
                self.notifications[user_id] = []
            
            self.notifications[user_id].append(notification)
            
            # Keep only last 100 notifications per user
            if len(self.notifications[user_id]) > 100:
                self.notifications[user_id] = self.notifications[user_id][-100:]
            
            logger.info(f"Notification queued for user {user_id}: {notification['type']}")
            
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
    
    def _process_notification(self, notification):
        """Process notification through all channels"""
        try:
            user_id = notification['user_id']
            
            for channel in notification['channels']:
                if channel == NotificationChannel.WEBSOCKET.value:
                    self._send_websocket_notification(user_id, notification)
                elif channel == NotificationChannel.SSE.value:
                    self._send_sse_notification(user_id, notification)
                elif channel == NotificationChannel.PUSH.value:
                    self._send_push_notification(user_id, notification)
                elif channel == NotificationChannel.EMAIL.value:
                    self._send_email_notification(user_id, notification)
                elif channel == NotificationChannel.SMS.value:
                    self._send_sms_notification(user_id, notification)
            
            # Mark as delivered
            notification['delivered'] = True
            
        except Exception as e:
            logger.error(f"Error processing notification: {str(e)}")
    
    def _send_websocket_notification(self, user_id, notification):
        """Send notification via WebSocket"""
        try:
            if self.socketio:
                self.socketio.emit(
                    'notification',
                    notification,
                    room=f"user_{user_id}",
                    namespace='/'
                )
                
                logger.info(f"WebSocket notification sent to user {user_id}")
            
        except Exception as e:
            logger.error(f"Error sending WebSocket notification: {str(e)}")
    
    def _send_sse_notification(self, user_id, notification):
        """Send notification via Server-Sent Events"""
        try:
            if user_id in self.sse_connections:
                connection = self.sse_connections[user_id]
                
                # Send SSE event
                sse_data = f"data: {json.dumps(notification)}\n\n"
                connection.write(sse_data)
                connection.flush()
                
                logger.info(f"SSE notification sent to user {user_id}")
            
        except Exception as e:
            logger.error(f"Error sending SSE notification: {str(e)}")
    
    def _send_push_notification(self, user_id, notification):
        """Send push notification"""
        try:
            # This would integrate with push notification services
            # like Firebase Cloud Messaging, Apple Push Notification Service, etc.
            
            # For now, we'll just log it
            logger.info(f"Push notification would be sent to user {user_id}: {notification['title']}")
            
        except Exception as e:
            logger.error(f"Error sending push notification: {str(e)}")
    
    def _send_email_notification(self, user_id, notification):
        """Send email notification"""
        try:
            # This would integrate with email service
            # For now, we'll just log it
            logger.info(f"Email notification would be sent to user {user_id}: {notification['title']}")
            
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")
    
    def _send_sms_notification(self, user_id, notification):
        """Send SMS notification"""
        try:
            # This would integrate with SMS service
            # For now, we'll just log it
            logger.info(f"SMS notification would be sent to user {user_id}: {notification['title']}")
            
        except Exception as e:
            logger.error(f"Error sending SMS notification: {str(e)}")
    
    def broadcast_notification(self, notification_type, title, message, 
                              data=None, priority=NotificationPriority.NORMAL,
                              channels=None, target_roles=None):
        """Broadcast notification to multiple users"""
        try:
            # This would typically query users from database
            # For now, we'll broadcast to all connected users
            
            if self.socketio:
                notification = {
                    'id': str(uuid.uuid4()),
                    'type': notification_type.value if isinstance(notification_type, NotificationType) else notification_type,
                    'title': title,
                    'message': message,
                    'data': data or {},
                    'priority': priority.value if isinstance(priority, NotificationPriority) else priority,
                    'created_at': datetime.utcnow().isoformat(),
                    'broadcast': True
                }
                
                self.socketio.emit('broadcast_notification', notification)
                
                logger.info(f"Broadcast notification sent: {notification['type']}")
            
        except Exception as e:
            logger.error(f"Error broadcasting notification: {str(e)}")
    
    def get_user_notifications(self, user_id, limit=50, unread_only=False):
        """Get notifications for user"""
        try:
            user_notifications = self.notifications.get(user_id, [])
            
            if unread_only:
                user_notifications = [n for n in user_notifications if not n.get('read', False)]
            
            # Sort by creation time (newest first)
            user_notifications.sort(key=lambda x: x['created_at'], reverse=True)
            
            return user_notifications[:limit]
            
        except Exception as e:
            logger.error(f"Error getting user notifications: {str(e)}")
            return []
    
    def _mark_notification_read(self, notification_id):
        """Mark notification as read"""
        try:
            for user_id, notifications in self.notifications.items():
                for notification in notifications:
                    if notification['id'] == notification_id:
                        notification['read'] = True
                        logger.info(f"Notification marked as read: {notification_id}")
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return False
    
    def mark_all_read(self, user_id):
        """Mark all notifications as read for user"""
        try:
            if user_id in self.notifications:
                for notification in self.notifications[user_id]:
                    notification['read'] = True
                
                logger.info(f"All notifications marked as read for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return False
    
    def delete_notification(self, user_id, notification_id):
        """Delete notification"""
        try:
            if user_id in self.notifications:
                self.notifications[user_id] = [
                    n for n in self.notifications[user_id] 
                    if n['id'] != notification_id
                ]
                
                logger.info(f"Notification deleted: {notification_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting notification: {str(e)}")
            return False
    
    def cleanup_expired_notifications(self):
        """Clean up expired notifications"""
        try:
            now = datetime.utcnow()
            
            for user_id, notifications in self.notifications.items():
                self.notifications[user_id] = [
                    n for n in notifications
                    if not n.get('expires_at') or datetime.fromisoformat(n['expires_at']) > now
                ]
            
            logger.info("Expired notifications cleaned up")
            
        except Exception as e:
            logger.error(f"Error cleaning up expired notifications: {str(e)}")
    
    def get_notification_stats(self, user_id=None):
        """Get notification statistics"""
        try:
            if user_id:
                user_notifications = self.notifications.get(user_id, [])
                return {
                    'total': len(user_notifications),
                    'unread': len([n for n in user_notifications if not n.get('read', False)]),
                    'read': len([n for n in user_notifications if n.get('read', False)])
                }
            else:
                total_notifications = sum(len(notifications) for notifications in self.notifications.values())
                total_unread = sum(
                    len([n for n in notifications if not n.get('read', False)])
                    for notifications in self.notifications.values()
                )
                
                return {
                    'total_users': len(self.notifications),
                    'total_notifications': total_notifications,
                    'total_unread': total_unread,
                    'active_connections': len(self.user_sessions),
                    'sse_connections': len(self.sse_connections)
                }
                
        except Exception as e:
            logger.error(f"Error getting notification stats: {str(e)}")
            return None
    
    def register_sse_connection(self, user_id, connection):
        """Register SSE connection"""
        try:
            self.sse_connections[user_id] = connection
            logger.info(f"SSE connection registered for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error registering SSE connection: {str(e)}")
    
    def unregister_sse_connection(self, user_id):
        """Unregister SSE connection"""
        try:
            if user_id in self.sse_connections:
                del self.sse_connections[user_id]
                logger.info(f"SSE connection unregistered for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error unregistering SSE connection: {str(e)}")
    
    def stop(self):
        """Stop notification manager"""
        try:
            self.running = False
            
            # Wait for workers to finish
            for worker in self.worker_threads:
                worker.join(timeout=5)
            
            logger.info("Notification manager stopped")
            
        except Exception as e:
            logger.error(f"Error stopping notification manager: {str(e)}")

# Global notification manager instance
notification_manager = NotificationManager()

# Convenience functions
def notify_order_update(user_id, order, status):
    """Send order update notification"""
    notification_manager.send_notification(
        user_id=user_id,
        notification_type=NotificationType.ORDER_UPDATE,
        title="Sipariş Durumu Güncellendi",
        message=f"Sipariş #{order.order_number} durumu '{status}' olarak güncellendi.",
        data={'order_id': order.id, 'order_number': order.order_number, 'status': status},
        priority=NotificationPriority.HIGH
    )

def notify_payment_status(user_id, order, payment_status):
    """Send payment status notification"""
    notification_manager.send_notification(
        user_id=user_id,
        notification_type=NotificationType.PAYMENT_STATUS,
        title="Ödeme Durumu Güncellendi",
        message=f"Sipariş #{order.order_number} ödeme durumu '{payment_status}' olarak güncellendi.",
        data={'order_id': order.id, 'order_number': order.order_number, 'payment_status': payment_status},
        priority=NotificationPriority.HIGH
    )

def notify_welcome(user_id, user_name):
    """Send welcome notification"""
    notification_manager.send_notification(
        user_id=user_id,
        notification_type=NotificationType.WELCOME,
        title="İnci Gold'a Hoş Geldiniz!",
        message=f"Merhaba {user_name}, İnci Gold ailesine hoş geldiniz!",
        data={'user_name': user_name},
        priority=NotificationPriority.NORMAL
    )

def notify_cart_reminder(user_id, cart_items):
    """Send cart reminder notification"""
    notification_manager.send_notification(
        user_id=user_id,
        notification_type=NotificationType.CART_REMINDER,
        title="Sepetinizde Ürünler Bekliyor",
        message=f"Sepetinizde {len(cart_items)} ürün var. Alışverişinizi tamamlamayı unutmayın!",
        data={'cart_items': cart_items},
        priority=NotificationPriority.NORMAL
    )

def notify_system_alert(message, priority=NotificationPriority.HIGH):
    """Send system alert to all users"""
    notification_manager.broadcast_notification(
        notification_type=NotificationType.SYSTEM_ALERT,
        title="Sistem Bildirimi",
        message=message,
        priority=priority
    )
