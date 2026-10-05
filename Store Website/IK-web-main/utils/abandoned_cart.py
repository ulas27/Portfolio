"""
Abandoned Cart Recovery System
Automated email campaigns for cart abandonment
"""

import time
from flask import current_app
from models import db, Product
from utils.email_utils import send_email
from utils.guest_session import guest_session_manager
import logging

logger = logging.getLogger(__name__)

class AbandonedCartRecovery:
    """Advanced abandoned cart recovery system"""
    
    def __init__(self):
        self.email_templates = {
            'first_reminder': 'emails/abandoned_cart_first.html',
            'second_reminder': 'emails/abandoned_cart_second.html',
            'final_reminder': 'emails/abandoned_cart_final.html'
        }
        self.email_delays = [3600, 86400, 259200]  # 1 hour, 1 day, 3 days
    
    def process_abandoned_carts(self):
        """Process all abandoned carts and send recovery emails"""
        try:
            # Process guest abandoned carts
            self._process_guest_abandoned_carts()
            
            # Process registered user abandoned carts
            self._process_user_abandoned_carts()
            
            logger.info("Abandoned cart recovery process completed")
            
        except Exception as e:
            logger.error(f"Error processing abandoned carts: {str(e)}")
    
    def _process_guest_abandoned_carts(self):
        """Process abandoned carts for guest users"""
        try:
            # This would typically query a database of guest sessions
            # For now, we'll implement the logic structure
            
            # Get guest sessions with abandoned carts
            # abandoned_guest_sessions = self._get_abandoned_guest_sessions()
            
            # for guest_session in abandoned_guest_sessions:
            #     self._send_guest_recovery_email(guest_session)
            
            logger.info("Guest abandoned cart processing completed")
            
        except Exception as e:
            logger.error(f"Error processing guest abandoned carts: {str(e)}")
    
    def _process_user_abandoned_carts(self):
        """Process abandoned carts for registered users"""
        try:
            # Get users with abandoned carts
            abandoned_users = self._get_users_with_abandoned_carts()
            
            for user in abandoned_users:
                self._send_user_recovery_email(user)
            
            logger.info("User abandoned cart processing completed")
            
        except Exception as e:
            logger.error(f"Error processing user abandoned carts: {str(e)}")
    
    def _get_users_with_abandoned_carts(self):
        """Get users with abandoned carts"""
        try:
            # This would typically query users with active carts
            # that haven't been updated in the last hour
            # For now, return empty list
            return []
            
        except Exception as e:
            logger.error(f"Error getting users with abandoned carts: {str(e)}")
            return []
    
    def _send_guest_recovery_email(self, guest_session):
        """Send recovery email to guest user"""
        try:
            guest_data = guest_session.get('guest_data', {})
            email = guest_data.get('email')
            
            if not email:
                logger.warning("No email found for guest session")
                return False
            
            cart_items = self._get_guest_cart_items(guest_session.get('cart', {}))
            
            if not cart_items:
                logger.warning("No cart items found for guest session")
                return False
            
            # Determine which email template to use
            emails_sent = guest_session.get('abandoned_cart_emails_sent', 0)
            template = self._get_email_template(emails_sent)
            
            # Send email
            success = self._send_recovery_email(
                email=email,
                template=template,
                cart_items=cart_items,
                guest_data=guest_data,
                is_guest=True
            )
            
            if success:
                # Mark email as sent
                guest_session_manager.mark_abandoned_cart_email_sent()
                logger.info(f"Recovery email sent to guest: {email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending guest recovery email: {str(e)}")
            return False
    
    def _send_user_recovery_email(self, user):
        """Send recovery email to registered user"""
        try:
            cart_items = self._get_user_cart_items(user)
            
            if not cart_items:
                logger.warning(f"No cart items found for user: {user.email}")
                return False
            
            # Determine which email template to use
            emails_sent = getattr(user, 'abandoned_cart_emails_sent', 0)
            template = self._get_email_template(emails_sent)
            
            # Send email
            success = self._send_recovery_email(
                email=user.email,
                template=template,
                cart_items=cart_items,
                user_data=user,
                is_guest=False
            )
            
            if success:
                # Update user's abandoned cart email count
                user.abandoned_cart_emails_sent = emails_sent + 1
                db.session.commit()
                logger.info(f"Recovery email sent to user: {user.email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending user recovery email: {str(e)}")
            return False
    
    def _get_guest_cart_items(self, cart_data):
        """Get cart items for guest user"""
        try:
            cart_items = []
            
            for product_id, quantity in cart_data.items():
                product = Product.query.get(int(product_id))
                if product:
                    cart_items.append({
                        'product': product,
                        'quantity': quantity,
                        'total_price': product.price * quantity
                    })
            
            return cart_items
            
        except Exception as e:
            logger.error(f"Error getting guest cart items: {str(e)}")
            return []
    
    def _get_user_cart_items(self, user):
        """Get cart items for registered user"""
        try:
            cart_items = []
            
            if hasattr(user, 'cart') and user.cart:
                for cart_item in user.cart.items:
                    cart_items.append({
                        'product': cart_item.product,
                        'quantity': cart_item.quantity,
                        'total_price': cart_item.product.price * cart_item.quantity
                    })
            
            return cart_items
            
        except Exception as e:
            logger.error(f"Error getting user cart items: {str(e)}")
            return []
    
    def _get_email_template(self, emails_sent):
        """Get appropriate email template based on emails sent"""
        if emails_sent == 0:
            return self.email_templates['first_reminder']
        elif emails_sent == 1:
            return self.email_templates['second_reminder']
        else:
            return self.email_templates['final_reminder']
    
    def _send_recovery_email(self, email, template, cart_items, user_data=None, guest_data=None, is_guest=True):
        """Send abandoned cart recovery email"""
        try:
            # Calculate total cart value
            total_value = sum(item['total_price'] for item in cart_items)
            
            # Prepare email data
            email_data = {
                'cart_items': cart_items,
                'total_value': total_value,
                'is_guest': is_guest,
                'user_data': user_data,
                'guest_data': guest_data,
                'recovery_url': self._generate_recovery_url(email, is_guest),
                'unsubscribe_url': self._generate_unsubscribe_url(email)
            }
            
            # Send email
            success = send_email(
                to=email,
                subject="Sepetinizde unuttuğunuz ürünler var! 🛍️",
                template=template,
                **email_data
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending recovery email: {str(e)}")
            return False
    
    def _generate_recovery_url(self, email, is_guest):
        """Generate recovery URL for cart"""
        try:
            if is_guest:
                # For guest users, create a special recovery link
                recovery_token = self._generate_recovery_token(email)
                return f"{current_app.config.get('BASE_URL', '')}/cart/recover/{recovery_token}"
            else:
                # For registered users, direct to cart
                return f"{current_app.config.get('BASE_URL', '')}/cart/view"
                
        except Exception as e:
            logger.error(f"Error generating recovery URL: {str(e)}")
            return f"{current_app.config.get('BASE_URL', '')}/cart/view"
    
    def _generate_unsubscribe_url(self, email):
        """Generate unsubscribe URL"""
        try:
            unsubscribe_token = self._generate_unsubscribe_token(email)
            return f"{current_app.config.get('BASE_URL', '')}/unsubscribe/{unsubscribe_token}"
            
        except Exception as e:
            logger.error(f"Error generating unsubscribe URL: {str(e)}")
            return f"{current_app.config.get('BASE_URL', '')}/unsubscribe"
    
    def _generate_recovery_token(self, email):
        """Generate recovery token for guest users"""
        import hashlib

        data = f"{email}_{time.time()}_{current_app.config.get('SECRET_KEY', '')}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]
    
    def _generate_unsubscribe_token(self, email):
        """Generate unsubscribe token"""
        import hashlib
        
        data = f"{email}_{current_app.config.get('SECRET_KEY', '')}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]
    
    def get_recovery_analytics(self):
        """Get abandoned cart recovery analytics"""
        try:
            # This would typically query analytics data
            # For now, return mock data structure
            
            analytics = {
                'total_abandoned_carts': 0,
                'emails_sent': 0,
                'recovery_rate': 0.0,
                'revenue_recovered': 0.0,
                'email_performance': {
                    'first_reminder': {'sent': 0, 'opened': 0, 'clicked': 0},
                    'second_reminder': {'sent': 0, 'opened': 0, 'clicked': 0},
                    'final_reminder': {'sent': 0, 'opened': 0, 'clicked': 0}
                }
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting recovery analytics: {str(e)}")
            return None

# Global abandoned cart recovery instance
abandoned_cart_recovery = AbandonedCartRecovery()
