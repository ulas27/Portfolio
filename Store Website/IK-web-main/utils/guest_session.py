"""
Enhanced Guest Session Management
Advanced session handling for guest users
"""

import json
import time
import hashlib
from datetime import datetime, timedelta
from flask import session, request, current_app
import logging

logger = logging.getLogger(__name__)

class GuestSessionManager:
    """Advanced guest session management"""
    
    def __init__(self):
        self.session_timeout = 3600  # 1 hour
        self.cart_timeout = 7200     # 2 hours
        self.max_cart_items = 50
    
    def create_guest_session(self, guest_data=None):
        """Create a new guest session with tracking"""
        try:
            # Generate unique guest ID
            guest_id = self._generate_guest_id()
            
            # Create session data
            session_data = {
                'guest_id': guest_id,
                'created_at': time.time(),
                'last_activity': time.time(),
                'ip_address': request.remote_addr,
                'user_agent': request.headers.get('User-Agent', ''),
                'cart': {},
                'guest_data': guest_data or {},
                'conversion_events': [],
                'abandoned_cart_emails_sent': 0,
                'max_abandoned_emails': 3
            }
            
            # Store in session
            session['guest_session'] = session_data
            
            logger.info(f"Guest session created: {guest_id}")
            return guest_id
            
        except Exception as e:
            logger.error(f"Error creating guest session: {str(e)}")
            return None
    
    def get_guest_session(self):
        """Get current guest session data"""
        try:
            guest_session = session.get('guest_session')
            if not guest_session:
                return None
            
            # Check if session is expired
            if self._is_session_expired(guest_session):
                self.clear_guest_session()
                return None
            
            # Update last activity
            guest_session['last_activity'] = time.time()
            session['guest_session'] = guest_session
            
            return guest_session
            
        except Exception as e:
            logger.error(f"Error getting guest session: {str(e)}")
            return None
    
    def update_guest_cart(self, product_id, quantity=1, action='add'):
        """Update guest cart with validation"""
        try:
            guest_session = self.get_guest_session()
            if not guest_session:
                guest_session = self.create_guest_session()
                if not guest_session:
                    return False
            
            cart = guest_session.get('cart', {})
            
            if action == 'add':
                current_qty = cart.get(str(product_id), 0)
                new_qty = current_qty + quantity
                
                # Validate cart limits
                if len(cart) >= self.max_cart_items and str(product_id) not in cart:
                    logger.warning(f"Cart limit reached for guest {guest_session['guest_id']}")
                    return False
                
                if new_qty <= 0:
                    cart.pop(str(product_id), None)
                else:
                    cart[str(product_id)] = new_qty
                    
            elif action == 'remove':
                cart.pop(str(product_id), None)
                
            elif action == 'update':
                if quantity <= 0:
                    cart.pop(str(product_id), None)
                else:
                    cart[str(product_id)] = quantity
            
            # Update session
            guest_session['cart'] = cart
            guest_session['last_activity'] = time.time()
            session['guest_session'] = guest_session
            
            logger.info(f"Guest cart updated: {guest_session['guest_id']}, product: {product_id}, action: {action}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating guest cart: {str(e)}")
            return False
    
    def get_guest_cart(self):
        """Get guest cart data"""
        try:
            guest_session = self.get_guest_session()
            if not guest_session:
                return {}
            
            return guest_session.get('cart', {})
            
        except Exception as e:
            logger.error(f"Error getting guest cart: {str(e)}")
            return {}
    
    def clear_guest_cart(self):
        """Clear guest cart"""
        try:
            guest_session = self.get_guest_session()
            if guest_session:
                guest_session['cart'] = {}
                guest_session['last_activity'] = time.time()
                session['guest_session'] = guest_session
                
                logger.info(f"Guest cart cleared: {guest_session['guest_id']}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error clearing guest cart: {str(e)}")
            return False
    
    def add_conversion_event(self, event_type, event_data=None):
        """Add conversion tracking event"""
        try:
            guest_session = self.get_guest_session()
            if not guest_session:
                return False
            
            event = {
                'type': event_type,
                'timestamp': time.time(),
                'data': event_data or {}
            }
            
            guest_session['conversion_events'].append(event)
            guest_session['last_activity'] = time.time()
            session['guest_session'] = guest_session
            
            logger.info(f"Conversion event added: {guest_session['guest_id']}, type: {event_type}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding conversion event: {str(e)}")
            return False
    
    def get_conversion_events(self):
        """Get conversion events for analytics"""
        try:
            guest_session = self.get_guest_session()
            if not guest_session:
                return []
            
            return guest_session.get('conversion_events', [])
            
        except Exception as e:
            logger.error(f"Error getting conversion events: {str(e)}")
            return []
    
    def should_send_abandoned_cart_email(self):
        """Check if abandoned cart email should be sent"""
        try:
            guest_session = self.get_guest_session()
            if not guest_session:
                return False
            
            cart = guest_session.get('cart', {})
            if not cart:
                return False
            
            # Check if already sent max emails
            emails_sent = guest_session.get('abandoned_cart_emails_sent', 0)
            max_emails = guest_session.get('max_abandoned_emails', 3)
            
            if emails_sent >= max_emails:
                return False
            
            # Check time since last activity
            last_activity = guest_session.get('last_activity', 0)
            time_since_activity = time.time() - last_activity
            
            # Send email after 1 hour of inactivity
            if time_since_activity > 3600:
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking abandoned cart email: {str(e)}")
            return False
    
    def mark_abandoned_cart_email_sent(self):
        """Mark abandoned cart email as sent"""
        try:
            guest_session = self.get_guest_session()
            if guest_session:
                guest_session['abandoned_cart_emails_sent'] += 1
                guest_session['last_activity'] = time.time()
                session['guest_session'] = guest_session
                
                logger.info(f"Abandoned cart email marked as sent: {guest_session['guest_id']}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error marking abandoned cart email: {str(e)}")
            return False
    
    def clear_guest_session(self):
        """Clear guest session"""
        try:
            if 'guest_session' in session:
                guest_id = session['guest_session'].get('guest_id', 'unknown')
                session.pop('guest_session', None)
                logger.info(f"Guest session cleared: {guest_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error clearing guest session: {str(e)}")
            return False
    
    def _generate_guest_id(self):
        """Generate unique guest ID"""
        timestamp = str(int(time.time() * 1000))
        random_data = f"{request.remote_addr}_{timestamp}_{request.headers.get('User-Agent', '')}"
        return hashlib.md5(random_data.encode()).hexdigest()[:16]
    
    def _is_session_expired(self, guest_session):
        """Check if session is expired"""
        try:
            last_activity = guest_session.get('last_activity', 0)
            return (time.time() - last_activity) > self.session_timeout
            
        except Exception as e:
            logger.error(f"Error checking session expiration: {str(e)}")
            return True
    
    def get_session_analytics(self):
        """Get session analytics data"""
        try:
            guest_session = self.get_guest_session()
            if not guest_session:
                return None
            
            return {
                'guest_id': guest_session.get('guest_id'),
                'session_duration': time.time() - guest_session.get('created_at', time.time()),
                'cart_items': len(guest_session.get('cart', {})),
                'conversion_events': len(guest_session.get('conversion_events', [])),
                'abandoned_emails_sent': guest_session.get('abandoned_cart_emails_sent', 0),
                'last_activity': guest_session.get('last_activity', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting session analytics: {str(e)}")
            return None

# Global guest session manager
guest_session_manager = GuestSessionManager()
