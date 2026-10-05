"""
İyzico Enterprise Payment Integration
3D Secure 2.0, Fraud Detection, Advanced Analytics
"""

import os
import json
import hashlib
import hmac
import time
import requests
from datetime import datetime, timedelta
from flask import current_app, request, session
from iyzipay import iyzipay_resource, pki_builder
from iyzipay import Payment, ThreedsInitialize, ThreedsPayment
import logging

logger = logging.getLogger(__name__)

class IyzicoEnterprise:
    """Enterprise-level İyzico payment integration"""
    
    def __init__(self):
        self.api_key = current_app.config.get('IYZICO_API_KEY')
        self.secret_key = current_app.config.get('IYZICO_SECRET_KEY')
        self.base_url = current_app.config.get('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com')
        self.webhook_secret = current_app.config.get('IYZICO_WEBHOOK_SECRET')
        
    def create_3ds_payment_request(self, order, user, payment_data):
        """
        Create 3D Secure 2.0 payment request with enhanced security
        """
        try:
            # Enhanced buyer information
            buyer = Buyer()
            buyer.set_id(str(user.id) if user else f"guest_{order.id}")
            buyer.set_name(user.first_name if user else payment_data.get('first_name', ''))
            buyer.set_surname(user.last_name if user else payment_data.get('last_name', ''))
            buyer.set_email(user.email if user else payment_data.get('email', ''))
            buyer.set_identity_number(payment_data.get('identity_number', ''))
            buyer.set_registration_address(payment_data.get('address', ''))
            buyer.set_city(payment_data.get('city', ''))
            buyer.set_country('Turkey')
            buyer.set_zip_code(payment_data.get('zip_code', ''))
            buyer.set_ip(request.remote_addr)
            buyer.set_gsm_number(payment_data.get('phone', ''))
            
            # Enhanced shipping address
            shipping_address = Address()
            shipping_address.set_contact_name(f"{buyer.get_name()} {buyer.get_surname()}")
            shipping_address.set_city(payment_data.get('city', ''))
            shipping_address.set_country('Turkey')
            shipping_address.set_address(payment_data.get('address', ''))
            shipping_address.set_zip_code(payment_data.get('zip_code', ''))
            
            # Enhanced billing address
            billing_address = Address()
            billing_address.set_contact_name(f"{buyer.get_name()} {buyer.get_surname()}")
            billing_address.set_city(payment_data.get('city', ''))
            billing_address.set_country('Turkey')
            billing_address.set_address(payment_data.get('address', ''))
            billing_address.set_zip_code(payment_data.get('zip_code', ''))
            
            # Payment card with enhanced security
            payment_card = PaymentCard()
            payment_card.set_card_holder_name(payment_data.get('card_holder_name', ''))
            payment_card.set_card_number(payment_data.get('card_number', ''))
            payment_card.set_expire_month(payment_data.get('expire_month', ''))
            payment_card.set_expire_year(payment_data.get('expire_year', ''))
            payment_card.set_cvc(payment_data.get('cvc', ''))
            payment_card.set_register_card(0)  # Don't save card for security
            
            # Basket items with detailed information
            basket_items = []
            for item in order.items:
                basket_item = BasketItem()
                basket_item.set_id(str(item.product_id))
                basket_item.set_name(item.product.name)
                basket_item.set_category1('Jewelry')
                basket_item.set_category2(item.product.category.name if item.product.category else 'General')
                basket_item.set_item_type('PHYSICAL')
                basket_item.set_price(str(item.price))
                basket_items.append(basket_item)
            
            # 3D Secure 2.0 request
            request_obj = ThreedsInitialize()
            request_obj.set_locale('tr')
            request_obj.set_conversation_id(f"order_{order.id}_{int(time.time())}")
            request_obj.set_price(str(order.total_amount))
            request_obj.set_paid_price(str(order.total_amount))
            request_obj.set_currency('TRY')
            request_obj.set_installment(1)
            request_obj.set_basket_id(str(order.id))
            request_obj.set_payment_channel('WEB')
            request_obj.set_payment_group('PRODUCT')
            request_obj.set_callback_url(f"{request.url_root}payment/3ds-callback")
            request_obj.set_payment_card(payment_card)
            request_obj.set_buyer(buyer)
            request_obj.set_shipping_address(shipping_address)
            request_obj.set_billing_address(billing_address)
            request_obj.set_basket_items(basket_items)
            
            # Enhanced fraud detection parameters
            request_obj.set_enabled_installments('2,3,6,9')
            request_obj.set_force_three_ds(1)  # Force 3D Secure
            
            # Risk parameters for fraud detection
            risk_params = {
                'user_agent': request.headers.get('User-Agent', ''),
                'accept_language': request.headers.get('Accept-Language', ''),
                'screen_resolution': payment_data.get('screen_resolution', ''),
                'timezone_offset': payment_data.get('timezone_offset', ''),
                'color_depth': payment_data.get('color_depth', ''),
                'java_enabled': payment_data.get('java_enabled', False),
                'javascript_enabled': True,
                'cookie_enabled': True,
                'touch_support': payment_data.get('touch_support', False)
            }
            
            # Add risk parameters to request
            for key, value in risk_params.items():
                request_obj.set_custom_data(key, str(value))
            
            # Make the request
            threeds_initialize = ThreedsInitialize()
            response = threeds_initialize.create(request_obj, self._get_options())
            
            if response.get_status() == 'success':
                # Store payment session data
                session['payment_token'] = response.get_payment_id()
                session['conversation_id'] = request_obj.get_conversation_id()
                session['order_id'] = order.id
                
                # Log successful 3DS initialization
                logger.info(f"3DS initialization successful for order {order.id}, payment_id: {response.get_payment_id()}")
                
                return {
                    'success': True,
                    'html_content': response.get_html_content(),
                    'payment_id': response.get_payment_id(),
                    'conversation_id': request_obj.get_conversation_id()
                }
            else:
                error_message = response.get_error_message()
                logger.error(f"3DS initialization failed for order {order.id}: {error_message}")
                
                return {
                    'success': False,
                    'error': error_message,
                    'error_code': response.get_error_code()
                }
                
        except Exception as e:
            logger.error(f"3DS payment request error for order {order.id}: {str(e)}")
            return {
                'success': False,
                'error': 'Ödeme işlemi sırasında bir hata oluştu.',
                'error_code': 'PAYMENT_ERROR'
            }
    
    def complete_3ds_payment(self, payment_id, conversation_id):
        """
        Complete 3D Secure payment after authentication
        """
        try:
            request_obj = ThreedsPayment()
            request_obj.set_locale('tr')
            request_obj.set_conversation_id(conversation_id)
            request_obj.set_payment_id(payment_id)
            request_obj.set_conversation_data(request.form.get('conversationData', ''))
            
            threeds_payment = ThreedsPayment()
            response = threeds_payment.create(request_obj, self._get_options())
            
            if response.get_status() == 'success':
                # Payment successful
                logger.info(f"3DS payment completed successfully: {payment_id}")
                
                return {
                    'success': True,
                    'payment_id': response.get_payment_id(),
                    'conversation_id': response.get_conversation_id(),
                    'price': response.get_price(),
                    'paid_price': response.get_paid_price(),
                    'installment': response.get_installment(),
                    'payment_status': response.get_payment_status()
                }
            else:
                error_message = response.get_error_message()
                logger.error(f"3DS payment completion failed: {error_message}")
                
                return {
                    'success': False,
                    'error': error_message,
                    'error_code': response.get_error_code()
                }
                
        except Exception as e:
            logger.error(f"3DS payment completion error: {str(e)}")
            return {
                'success': False,
                'error': 'Ödeme tamamlama sırasında bir hata oluştu.',
                'error_code': 'PAYMENT_COMPLETION_ERROR'
            }
    
    def verify_webhook_signature(self, payload, signature):
        """
        Verify webhook signature for security
        """
        try:
            if not self.webhook_secret:
                logger.warning("Webhook secret not configured")
                return False
            
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Webhook signature verification error: {str(e)}")
            return False
    
    def get_payment_analytics(self, start_date, end_date):
        """
        Get payment analytics and fraud detection data
        """
        try:
            # This would typically call İyzico's analytics API
            # For now, we'll return mock data structure
            
            analytics_data = {
                'total_transactions': 0,
                'successful_transactions': 0,
                'failed_transactions': 0,
                'fraud_detected': 0,
                'average_transaction_value': 0,
                'payment_methods': {},
                'fraud_patterns': [],
                'risk_scores': {}
            }
            
            return analytics_data
            
        except Exception as e:
            logger.error(f"Payment analytics error: {str(e)}")
            return None
    
    def _get_options(self):
        """Get İyzico API options"""
        from iyzipay import Options
        options = Options()
        options.set_api_key(self.api_key)
        options.set_secret_key(self.secret_key)
        options.set_base_url(self.base_url)
        return options
    
    def _generate_payment_reference(self, order_id):
        """Generate secure payment reference"""
        timestamp = int(time.time())
        data = f"{order_id}_{timestamp}_{self.secret_key}"
        return hashlib.sha256(data.encode()).hexdigest()[:16].upper()

class PaymentFraudDetector:
    """Advanced fraud detection system"""
    
    def __init__(self):
        self.risk_factors = {}
        self.fraud_patterns = []
    
    def analyze_payment_risk(self, payment_data, user_data, order_data):
        """
        Analyze payment for fraud risk
        """
        risk_score = 0
        risk_factors = []
        
        # Velocity checks
        if self._check_velocity_risk(payment_data, user_data):
            risk_score += 30
            risk_factors.append('High transaction velocity')
        
        # Device fingerprinting
        if self._check_device_risk(payment_data):
            risk_score += 20
            risk_factors.append('Suspicious device fingerprint')
        
        # Geographic analysis
        if self._check_geographic_risk(payment_data, user_data):
            risk_score += 25
            risk_factors.append('Geographic risk detected')
        
        # Amount analysis
        if self._check_amount_risk(order_data, user_data):
            risk_score += 15
            risk_factors.append('Unusual transaction amount')
        
        # Time analysis
        if self._check_time_risk():
            risk_score += 10
            risk_factors.append('Unusual transaction time')
        
        return {
            'risk_score': min(risk_score, 100),
            'risk_level': self._get_risk_level(risk_score),
            'risk_factors': risk_factors,
            'recommendation': self._get_recommendation(risk_score)
        }
    
    def _check_velocity_risk(self, payment_data, user_data):
        """Check for high transaction velocity"""
        # Implement velocity checking logic
        return False
    
    def _check_device_risk(self, payment_data):
        """Check device fingerprint for risk"""
        # Implement device fingerprinting logic
        return False
    
    def _check_geographic_risk(self, payment_data, user_data):
        """Check geographic risk factors"""
        # Implement geographic risk analysis
        return False
    
    def _check_amount_risk(self, order_data, user_data):
        """Check for unusual transaction amounts"""
        # Implement amount risk analysis
        return False
    
    def _check_time_risk(self):
        """Check for unusual transaction times"""
        current_hour = datetime.now().hour
        # Flag transactions between 2 AM and 6 AM
        return 2 <= current_hour <= 6
    
    def _get_risk_level(self, risk_score):
        """Get risk level based on score"""
        if risk_score < 30:
            return 'LOW'
        elif risk_score < 70:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def _get_recommendation(self, risk_score):
        """Get recommendation based on risk score"""
        if risk_score < 30:
            return 'APPROVE'
        elif risk_score < 70:
            return 'REVIEW'
        else:
            return 'DECLINE'
