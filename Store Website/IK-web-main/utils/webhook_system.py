"""
Enterprise Webhook System & Event-Driven Architecture
Real-time event processing, webhook delivery, retry logic
"""

import json
import time
import hashlib
import hmac
import requests
from datetime import datetime, timedelta
from flask import current_app, request
from enum import Enum
import logging
import threading
from queue import Queue, Empty
import uuid

logger = logging.getLogger(__name__)

class WebhookEventType(Enum):
    """Webhook event types"""
    ORDER_CREATED = "order.created"
    ORDER_UPDATED = "order.updated"
    ORDER_CANCELLED = "order.cancelled"
    PAYMENT_COMPLETED = "payment.completed"
    PAYMENT_FAILED = "payment.failed"
    USER_REGISTERED = "user.registered"
    USER_UPDATED = "user.updated"
    PRODUCT_CREATED = "product.created"
    PRODUCT_UPDATED = "product.updated"
    PRODUCT_DELETED = "product.deleted"
    CART_ABANDONED = "cart.abandoned"
    REVIEW_CREATED = "review.created"
    NEWSLETTER_SUBSCRIBED = "newsletter.subscribed"
    NEWSLETTER_UNSUBSCRIBED = "newsletter.unsubscribed"

class WebhookStatus(Enum):
    """Webhook delivery status"""
    PENDING = "pending"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETRYING = "retrying"
    DISABLED = "disabled"

class WebhookManager:
    """Enterprise webhook management system"""
    
    def __init__(self, app=None):
        self.app = app
        self.webhooks = {}
        self.event_queue = Queue()
        self.worker_threads = []
        self.max_retries = 3
        self.retry_delays = [60, 300, 900]  # 1 min, 5 min, 15 min
        self.timeout = 30
        self.running = False
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize webhook manager"""
        self.app = app
        
        # Load webhook configurations
        self._load_webhook_configs()
        
        # Start worker threads
        self._start_workers()
    
    def _load_webhook_configs(self):
        """Load webhook configurations"""
        try:
            # This would typically load from database
            # For now, we'll use default configurations
            self.webhooks = {
                'order_webhooks': {
                    'url': 'https://api.example.com/webhooks/orders',
                    'secret': 'webhook_secret_123',
                    'events': [
                        WebhookEventType.ORDER_CREATED,
                        WebhookEventType.ORDER_UPDATED,
                        WebhookEventType.ORDER_CANCELLED
                    ],
                    'enabled': True,
                    'retry_count': 0,
                    'last_delivery': None,
                    'status': WebhookStatus.PENDING
                },
                'payment_webhooks': {
                    'url': 'https://api.example.com/webhooks/payments',
                    'secret': 'webhook_secret_456',
                    'events': [
                        WebhookEventType.PAYMENT_COMPLETED,
                        WebhookEventType.PAYMENT_FAILED
                    ],
                    'enabled': True,
                    'retry_count': 0,
                    'last_delivery': None,
                    'status': WebhookStatus.PENDING
                },
                'user_webhooks': {
                    'url': 'https://api.example.com/webhooks/users',
                    'secret': 'webhook_secret_789',
                    'events': [
                        WebhookEventType.USER_REGISTERED,
                        WebhookEventType.USER_UPDATED
                    ],
                    'enabled': True,
                    'retry_count': 0,
                    'last_delivery': None,
                    'status': WebhookStatus.PENDING
                }
            }
            
            logger.info("Webhook configurations loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading webhook configurations: {str(e)}")
    
    def _start_workers(self):
        """Start webhook worker threads"""
        try:
            self.running = True
            
            # Start multiple worker threads
            for i in range(3):  # 3 worker threads
                worker = threading.Thread(
                    target=self._webhook_worker,
                    name=f"WebhookWorker-{i}",
                    daemon=True
                )
                worker.start()
                self.worker_threads.append(worker)
            
            logger.info("Webhook workers started successfully")
            
        except Exception as e:
            logger.error(f"Error starting webhook workers: {str(e)}")
    
    def _webhook_worker(self):
        """Webhook worker thread"""
        while self.running:
            try:
                # Get event from queue (with timeout)
                event = self.event_queue.get(timeout=1)
                
                # Process webhook event
                self._process_webhook_event(event)
                
                # Mark task as done
                self.event_queue.task_done()
                
            except Empty:
                # No events in queue, continue
                continue
            except Exception as e:
                logger.error(f"Error in webhook worker: {str(e)}")
                time.sleep(1)
    
    def emit_event(self, event_type, data, source=None):
        """Emit webhook event"""
        try:
            event = {
                'id': str(uuid.uuid4()),
                'type': event_type.value if isinstance(event_type, WebhookEventType) else event_type,
                'data': data,
                'source': source or 'incigold',
                'timestamp': datetime.utcnow().isoformat(),
                'version': '1.0'
            }
            
            # Add to event queue
            self.event_queue.put(event)
            
            logger.info(f"Event emitted: {event['type']} (ID: {event['id']})")
            
        except Exception as e:
            logger.error(f"Error emitting event: {str(e)}")
    
    def _process_webhook_event(self, event):
        """Process webhook event"""
        try:
            # Find webhooks that should receive this event
            target_webhooks = self._get_target_webhooks(event['type'])
            
            for webhook_name, webhook_config in target_webhooks.items():
                if webhook_config['enabled']:
                    self._deliver_webhook(webhook_name, webhook_config, event)
            
        except Exception as e:
            logger.error(f"Error processing webhook event: {str(e)}")
    
    def _get_target_webhooks(self, event_type):
        """Get webhooks that should receive this event"""
        target_webhooks = {}
        
        for webhook_name, webhook_config in self.webhooks.items():
            if event_type in [e.value for e in webhook_config['events']]:
                target_webhooks[webhook_name] = webhook_config
        
        return target_webhooks
    
    def _deliver_webhook(self, webhook_name, webhook_config, event):
        """Deliver webhook to endpoint"""
        try:
            # Prepare webhook payload
            payload = self._prepare_webhook_payload(event)
            
            # Generate signature
            signature = self._generate_webhook_signature(
                json.dumps(payload),
                webhook_config['secret']
            )
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Incigold-Webhook/1.0',
                'X-Webhook-Event': event['type'],
                'X-Webhook-ID': event['id'],
                'X-Webhook-Signature': signature,
                'X-Webhook-Timestamp': str(int(time.time()))
            }
            
            # Send webhook
            response = requests.post(
                webhook_config['url'],
                json=payload,
                headers=headers,
                timeout=self.timeout,
                verify=True  # SSL verification
            )
            
            # Check response
            if response.status_code in [200, 201, 202]:
                # Success
                webhook_config['status'] = WebhookStatus.DELIVERED
                webhook_config['retry_count'] = 0
                webhook_config['last_delivery'] = datetime.utcnow()
                
                logger.info(f"Webhook delivered successfully: {webhook_name}")
                
            else:
                # Failed
                self._handle_webhook_failure(webhook_name, webhook_config, event, response)
                
        except requests.exceptions.Timeout:
            logger.warning(f"Webhook timeout: {webhook_name}")
            self._handle_webhook_failure(webhook_name, webhook_config, event, None, "timeout")
            
        except requests.exceptions.ConnectionError:
            logger.warning(f"Webhook connection error: {webhook_name}")
            self._handle_webhook_failure(webhook_name, webhook_config, event, None, "connection_error")
            
        except Exception as e:
            logger.error(f"Error delivering webhook {webhook_name}: {str(e)}")
            self._handle_webhook_failure(webhook_name, webhook_config, event, None, str(e))
    
    def _prepare_webhook_payload(self, event):
        """Prepare webhook payload"""
        return {
            'id': event['id'],
            'type': event['type'],
            'data': event['data'],
            'source': event['source'],
            'timestamp': event['timestamp'],
            'version': event['version']
        }
    
    def _generate_webhook_signature(self, payload, secret):
        """Generate webhook signature"""
        try:
            signature = hmac.new(
                secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return f"sha256={signature}"
            
        except Exception as e:
            logger.error(f"Error generating webhook signature: {str(e)}")
            return None
    
    def _handle_webhook_failure(self, webhook_name, webhook_config, event, response=None, error_type=None):
        """Handle webhook delivery failure"""
        try:
            webhook_config['retry_count'] += 1
            
            if webhook_config['retry_count'] <= self.max_retries:
                # Schedule retry
                webhook_config['status'] = WebhookStatus.RETRYING
                
                # Calculate retry delay
                retry_delay = self.retry_delays[min(webhook_config['retry_count'] - 1, len(self.retry_delays) - 1)]
                
                # Schedule retry (in a real implementation, this would use a task queue)
                self._schedule_webhook_retry(webhook_name, webhook_config, event, retry_delay)
                
                logger.warning(f"Webhook failed, scheduling retry {webhook_config['retry_count']}/{self.max_retries}: {webhook_name}")
                
            else:
                # Max retries exceeded
                webhook_config['status'] = WebhookStatus.FAILED
                
                logger.error(f"Webhook failed permanently after {self.max_retries} retries: {webhook_name}")
                
                # Store failed webhook for manual review
                self._store_failed_webhook(webhook_name, webhook_config, event, response, error_type)
            
        except Exception as e:
            logger.error(f"Error handling webhook failure: {str(e)}")
    
    def _schedule_webhook_retry(self, webhook_name, webhook_config, event, delay):
        """Schedule webhook retry"""
        try:
            # In a real implementation, this would use a task queue like Celery
            # For now, we'll use a simple threading approach
            
            def retry_webhook():
                time.sleep(delay)
                self._deliver_webhook(webhook_name, webhook_config, event)
            
            retry_thread = threading.Thread(target=retry_webhook, daemon=True)
            retry_thread.start()
            
        except Exception as e:
            logger.error(f"Error scheduling webhook retry: {str(e)}")
    
    def _store_failed_webhook(self, webhook_name, webhook_config, event, response, error_type):
        """Store failed webhook for manual review"""
        try:
            failed_webhook = {
                'webhook_name': webhook_name,
                'event': event,
                'webhook_config': webhook_config,
                'response_status': response.status_code if response else None,
                'response_text': response.text if response else None,
                'error_type': error_type,
                'failed_at': datetime.utcnow().isoformat(),
                'retry_count': webhook_config['retry_count']
            }
            
            # This would typically store in database
            # For now, we'll just log it
            logger.error(f"Failed webhook stored: {json.dumps(failed_webhook, indent=2)}")
            
        except Exception as e:
            logger.error(f"Error storing failed webhook: {str(e)}")
    
    def register_webhook(self, name, url, secret, events, enabled=True):
        """Register new webhook"""
        try:
            self.webhooks[name] = {
                'url': url,
                'secret': secret,
                'events': [WebhookEventType(e) for e in events],
                'enabled': enabled,
                'retry_count': 0,
                'last_delivery': None,
                'status': WebhookStatus.PENDING
            }
            
            logger.info(f"Webhook registered: {name}")
            return True
            
        except Exception as e:
            logger.error(f"Error registering webhook: {str(e)}")
            return False
    
    def unregister_webhook(self, name):
        """Unregister webhook"""
        try:
            if name in self.webhooks:
                del self.webhooks[name]
                logger.info(f"Webhook unregistered: {name}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error unregistering webhook: {str(e)}")
            return False
    
    def enable_webhook(self, name):
        """Enable webhook"""
        try:
            if name in self.webhooks:
                self.webhooks[name]['enabled'] = True
                self.webhooks[name]['status'] = WebhookStatus.PENDING
                logger.info(f"Webhook enabled: {name}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error enabling webhook: {str(e)}")
            return False
    
    def disable_webhook(self, name):
        """Disable webhook"""
        try:
            if name in self.webhooks:
                self.webhooks[name]['enabled'] = False
                self.webhooks[name]['status'] = WebhookStatus.DISABLED
                logger.info(f"Webhook disabled: {name}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error disabling webhook: {str(e)}")
            return False
    
    def get_webhook_status(self, name=None):
        """Get webhook status"""
        try:
            if name:
                return self.webhooks.get(name)
            else:
                return self.webhooks
                
        except Exception as e:
            logger.error(f"Error getting webhook status: {str(e)}")
            return None
    
    def test_webhook(self, name):
        """Test webhook endpoint"""
        try:
            if name not in self.webhooks:
                return False
            
            webhook_config = self.webhooks[name]
            
            # Create test event
            test_event = {
                'id': str(uuid.uuid4()),
                'type': 'webhook.test',
                'data': {'message': 'This is a test webhook'},
                'source': 'incigold',
                'timestamp': datetime.utcnow().isoformat(),
                'version': '1.0'
            }
            
            # Deliver test webhook
            self._deliver_webhook(name, webhook_config, test_event)
            
            logger.info(f"Test webhook sent: {name}")
            return True
            
        except Exception as e:
            logger.error(f"Error testing webhook: {str(e)}")
            return False
    
    def get_webhook_analytics(self):
        """Get webhook analytics"""
        try:
            analytics = {
                'total_webhooks': len(self.webhooks),
                'enabled_webhooks': sum(1 for w in self.webhooks.values() if w['enabled']),
                'disabled_webhooks': sum(1 for w in self.webhooks.values() if not w['enabled']),
                'failed_webhooks': sum(1 for w in self.webhooks.values() if w['status'] == WebhookStatus.FAILED),
                'pending_events': self.event_queue.qsize(),
                'active_workers': len([t for t in self.worker_threads if t.is_alive()]),
                'webhook_details': {}
            }
            
            for name, config in self.webhooks.items():
                analytics['webhook_details'][name] = {
                    'status': config['status'].value,
                    'retry_count': config['retry_count'],
                    'last_delivery': config['last_delivery'].isoformat() if config['last_delivery'] else None,
                    'enabled': config['enabled']
                }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting webhook analytics: {str(e)}")
            return None
    
    def stop(self):
        """Stop webhook manager"""
        try:
            self.running = False
            
            # Wait for workers to finish
            for worker in self.worker_threads:
                worker.join(timeout=5)
            
            logger.info("Webhook manager stopped")
            
        except Exception as e:
            logger.error(f"Error stopping webhook manager: {str(e)}")

# Global webhook manager instance
webhook_manager = WebhookManager()

# Convenience functions
def emit_order_created(order):
    """Emit order created event"""
    webhook_manager.emit_event(
        WebhookEventType.ORDER_CREATED,
        {
            'order_id': order.id,
            'order_number': order.order_number,
            'total_amount': float(order.total_amount),
            'user_id': order.user_id,
            'status': order.status
        }
    )

def emit_payment_completed(order, payment_data):
    """Emit payment completed event"""
    webhook_manager.emit_event(
        WebhookEventType.PAYMENT_COMPLETED,
        {
            'order_id': order.id,
            'order_number': order.order_number,
            'payment_id': payment_data.get('payment_id'),
            'amount': float(order.total_amount),
            'user_id': order.user_id
        }
    )

def emit_user_registered(user):
    """Emit user registered event"""
    webhook_manager.emit_event(
        WebhookEventType.USER_REGISTERED,
        {
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
    )

def emit_cart_abandoned(cart_data):
    """Emit cart abandoned event"""
    webhook_manager.emit_event(
        WebhookEventType.CART_ABANDONED,
        {
            'user_id': cart_data.get('user_id'),
            'guest_id': cart_data.get('guest_id'),
            'cart_items': cart_data.get('items', []),
            'total_value': cart_data.get('total_value', 0),
            'abandoned_at': datetime.utcnow().isoformat()
        }
    )
