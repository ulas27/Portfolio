"""
Integration Tests for İnci Gold E-commerce Platform
Comprehensive testing of all system components
"""

import pytest
import json
import time
from datetime import datetime, timedelta
from flask import url_for
from app import create_app, db
from models import User, Product, Category, Order, Cart, CartItem
from utils.email_utils import send_email
from utils.payment_enterprise import IyzicoEnterprise
from utils.security_testing import SecurityTester
from utils.compliance import ComplianceManager
from utils.performance import PerformanceOptimizer

class TestConfig:
    """Test configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'
    WTF_CSRF_ENABLED = False
    MAIL_SUPPRESS_SEND = True
    RECAPTCHA_PUBLIC_KEY = 'test-public-key'
    RECAPTCHA_PRIVATE_KEY = 'test-private-key'

@pytest.fixture
def app():
    """Create test application"""
    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    """Get authentication headers"""
    # Register test user
    response = client.post('/auth/register', data={
        'email': 'test@example.com',
        'password': 'TestPassword123!',
        'confirm_password': 'TestPassword123!',
        'first_name': 'Test',
        'last_name': 'User'
    })
    
    # Login
    response = client.post('/auth/login', data={
        'email': 'test@example.com',
        'password': 'TestPassword123!'
    })
    
    return {'Authorization': 'Bearer test-token'}

class TestUserIntegration:
    """Test user-related integrations"""
    
    def test_user_registration_flow(self, client):
        """Test complete user registration flow"""
        # Test registration
        response = client.post('/auth/register', data={
            'email': 'newuser@example.com',
            'password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 200
        assert b'Kayıt başarılı' in response.data
    
    def test_user_login_flow(self, client):
        """Test user login flow"""
        # First register a user
        client.post('/auth/register', data={
            'email': 'loginuser@example.com',
            'password': 'LoginPassword123!',
            'confirm_password': 'LoginPassword123!',
            'first_name': 'Login',
            'last_name': 'User'
        })
        
        # Test login
        response = client.post('/auth/login', data={
            'email': 'loginuser@example.com',
            'password': 'LoginPassword123!'
        })
        
        assert response.status_code == 200
        assert b'Giriş başarılı' in response.data
    
    def test_user_profile_management(self, client, auth_headers):
        """Test user profile management"""
        # Test profile update
        response = client.post('/auth/profile/edit', 
                             headers=auth_headers,
                             data={
                                 'first_name': 'Updated',
                                 'last_name': 'Name',
                                 'phone': '+905551234567'
                             })
        
        assert response.status_code == 200
    
    def test_password_change_flow(self, client, auth_headers):
        """Test password change flow"""
        response = client.post('/auth/change-password',
                             headers=auth_headers,
                             data={
                                 'current_password': 'TestPassword123!',
                                 'new_password': 'NewPassword123!',
                                 'confirm_password': 'NewPassword123!'
                             })
        
        assert response.status_code == 200

class TestProductIntegration:
    """Test product-related integrations"""
    
    def test_product_crud_operations(self, client, auth_headers):
        """Test product CRUD operations"""
        # Create product
        response = client.post('/admin/products/create',
                             headers=auth_headers,
                             data={
                                 'name': 'Test Product',
                                 'description': 'Test Description',
                                 'price': '100.00',
                                 'stock': '10',
                                 'category_id': '1'
                             })
        
        assert response.status_code == 200
        
        # Read product
        response = client.get('/shop/product/1')
        assert response.status_code == 200
        
        # Update product
        response = client.post('/admin/products/1/edit',
                             headers=auth_headers,
                             data={
                                 'name': 'Updated Product',
                                 'description': 'Updated Description',
                                 'price': '150.00',
                                 'stock': '15'
                             })
        
        assert response.status_code == 200
        
        # Delete product
        response = client.post('/admin/products/1/delete',
                             headers=auth_headers)
        
        assert response.status_code == 200
    
    def test_product_search_and_filtering(self, client):
        """Test product search and filtering"""
        # Test search
        response = client.get('/shop/search?q=test')
        assert response.status_code == 200
        
        # Test category filtering
        response = client.get('/shop/category/1')
        assert response.status_code == 200
        
        # Test price filtering
        response = client.get('/shop/search?min_price=50&max_price=200')
        assert response.status_code == 200

class TestCartIntegration:
    """Test cart-related integrations"""
    
    def test_cart_operations(self, client, auth_headers):
        """Test cart operations"""
        # Add item to cart
        response = client.post('/cart/add',
                             headers=auth_headers,
                             data={
                                 'product_id': '1',
                                 'quantity': '2'
                             })
        
        assert response.status_code == 200
        
        # View cart
        response = client.get('/cart')
        assert response.status_code == 200
        
        # Update cart item
        response = client.post('/cart/update',
                             headers=auth_headers,
                             data={
                                 'item_id': '1',
                                 'quantity': '3'
                             })
        
        assert response.status_code == 200
        
        # Remove item from cart
        response = client.post('/cart/remove',
                             headers=auth_headers,
                             data={'item_id': '1'})
        
        assert response.status_code == 200
    
    def test_guest_cart_operations(self, client):
        """Test guest cart operations"""
        # Add item to guest cart
        response = client.post('/cart/add', data={
            'product_id': '1',
            'quantity': '1'
        })
        
        assert response.status_code == 200
        
        # View guest cart
        response = client.get('/cart')
        assert response.status_code == 200

class TestOrderIntegration:
    """Test order-related integrations"""
    
    def test_authenticated_user_order_flow(self, client, auth_headers):
        """Test complete order flow for authenticated user"""
        # Add item to cart
        client.post('/cart/add',
                   headers=auth_headers,
                   data={'product_id': '1', 'quantity': '1'})
        
        # Proceed to checkout
        response = client.get('/cart/checkout', headers=auth_headers)
        assert response.status_code == 200
        
        # Process order
        response = client.post('/cart/checkout',
                             headers=auth_headers,
                             data={
                                 'shipping_address': 'Test Address',
                                 'shipping_city': 'Test City',
                                 'shipping_postal_code': '12345',
                                 'shipping_phone': '+905551234567',
                                 'payment_method': 'credit_card'
                             })
        
        assert response.status_code == 200
    
    def test_guest_user_order_flow(self, client):
        """Test complete order flow for guest user"""
        # Add item to guest cart
        client.post('/cart/add', data={'product_id': '1', 'quantity': '1'})
        
        # Proceed to guest checkout
        response = client.get('/cart/checkout')
        assert response.status_code == 200
        
        # Process guest order
        response = client.post('/cart/process-guest-order', data={
            'email': 'guest@example.com',
            'phone': '+905551234567',
            'shipping_address': 'Guest Address',
            'shipping_city': 'Guest City',
            'shipping_postal_code': '12345',
            'payment_method': 'credit_card'
        })
        
        assert response.status_code == 200
    
    def test_guest_to_user_conversion(self, client):
        """Test guest to user conversion"""
        # First create a guest order
        client.post('/cart/add', data={'product_id': '1', 'quantity': '1'})
        client.post('/cart/process-guest-order', data={
            'email': 'convert@example.com',
            'phone': '+905551234567',
            'shipping_address': 'Convert Address',
            'shipping_city': 'Convert City',
            'shipping_postal_code': '12345',
            'payment_method': 'credit_card'
        })
        
        # Convert to user account
        response = client.post('/cart/create-account', data={
            'email': 'convert@example.com'
        })
        
        assert response.status_code == 200

class TestPaymentIntegration:
    """Test payment-related integrations"""
    
    def test_payment_processing(self, client, auth_headers):
        """Test payment processing"""
        # Create order first
        client.post('/cart/add',
                   headers=auth_headers,
                   data={'product_id': '1', 'quantity': '1'})
        
        # Process payment
        response = client.post('/payment/process',
                             headers=auth_headers,
                             data={
                                 'payment_method': 'credit_card',
                                 'card_number': '5555444433332222',
                                 'expiry_month': '12',
                                 'expiry_year': '2025',
                                 'cvv': '123',
                                 'card_holder': 'Test User'
                             })
        
        assert response.status_code == 200
    
    def test_3ds_callback(self, client):
        """Test 3D Secure callback"""
        response = client.post('/3ds-callback', data={
            'token': 'test-token',
            'status': 'success'
        })
        
        assert response.status_code == 200

class TestEmailIntegration:
    """Test email-related integrations"""
    
    def test_order_confirmation_email(self, app):
        """Test order confirmation email"""
        with app.app_context():
            # Create test order
            order = Order(
                order_number='TEST-001',
                user_id=1,
                total_amount=100.00,
                status='pending'
            )
            
            # Test email sending
            result = send_email(
                to='test@example.com',
                subject='Test Order Confirmation',
                template='emails/order_confirmation.html',
                order=order
            )
            
            assert result is True
    
    def test_welcome_email(self, app):
        """Test welcome email"""
        with app.app_context():
            # Create test user
            user = User(
                email='test@example.com',
                first_name='Test',
                last_name='User'
            )
            
            # Test email sending
            result = send_email(
                to='test@example.com',
                subject='Welcome to İnci Gold',
                template='emails/welcome.html',
                user=user
            )
            
            assert result is True

class TestSecurityIntegration:
    """Test security-related integrations"""
    
    def test_rate_limiting(self, client):
        """Test rate limiting"""
        # Make multiple requests to trigger rate limiting
        for i in range(10):
            response = client.post('/auth/login', data={
                'email': 'test@example.com',
                'password': 'wrongpassword'
            })
        
        # Should be rate limited
        assert response.status_code == 429
    
    def test_csrf_protection(self, client):
        """Test CSRF protection"""
        # Try to make request without CSRF token
        response = client.post('/admin/users/create', data={
            'email': 'test@example.com',
            'password': 'password'
        })
        
        # Should be rejected
        assert response.status_code in [400, 403]
    
    def test_security_headers(self, client):
        """Test security headers"""
        response = client.get('/')
        
        # Check for security headers
        assert 'X-Frame-Options' in response.headers
        assert 'X-Content-Type-Options' in response.headers
        assert 'X-XSS-Protection' in response.headers
        assert 'Strict-Transport-Security' in response.headers

class TestPerformanceIntegration:
    """Test performance-related integrations"""
    
    def test_caching_system(self, app):
        """Test caching system"""
        with app.app_context():
            from utils.performance import performance_optimizer
            
            # Test cache set/get
            performance_optimizer.cache_set('test_key', 'test_value', 3600)
            cached_value = performance_optimizer.cache_get('test_key')
            
            assert cached_value == 'test_value'
    
    def test_image_optimization(self, app):
        """Test image optimization"""
        with app.app_context():
            from utils.performance import performance_optimizer
            
            # Test image optimization
            optimized_data = performance_optimizer.optimize_image(
                'static/images/test.jpg',
                quality=85,
                max_width=800
            )
            
            assert optimized_data is not None

class TestComplianceIntegration:
    """Test compliance-related integrations"""
    
    def test_consent_management(self, app):
        """Test consent management"""
        with app.app_context():
            from utils.compliance import compliance_manager
            
            # Test consent recording
            compliance_manager.record_consent(
                user_id=1,
                consent_type='marketing',
                purpose='marketing',
                granted=True
            )
            
            # Test consent checking
            has_consent = compliance_manager.check_consent(
                user_id=1,
                consent_type='marketing',
                purpose='marketing'
            )
            
            assert has_consent is True
    
    def test_data_export(self, app):
        """Test data export functionality"""
        with app.app_context():
            from utils.compliance import compliance_manager
            
            # Test data export
            user_data = compliance_manager.export_user_data(user_id=1)
            
            assert user_data is not None
            assert 'user_id' in user_data
            assert 'exported_at' in user_data

class TestMonitoringIntegration:
    """Test monitoring-related integrations"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'status' in data
        assert 'timestamp' in data
    
    def test_metrics_collection(self, app):
        """Test metrics collection"""
        with app.app_context():
            from utils.monitoring import monitoring_system
            
            # Test metrics collection
            metrics = monitoring_system.collect_system_metrics()
            
            assert metrics is not None
            assert 'cpu_usage' in metrics
            assert 'memory_usage' in metrics
            assert 'disk_usage' in metrics

class TestEndToEnd:
    """End-to-end integration tests"""
    
    def test_complete_user_journey(self, client):
        """Test complete user journey from registration to order"""
        # 1. Register user
        response = client.post('/auth/register', data={
            'email': 'journey@example.com',
            'password': 'JourneyPassword123!',
            'confirm_password': 'JourneyPassword123!',
            'first_name': 'Journey',
            'last_name': 'User'
        })
        assert response.status_code == 200
        
        # 2. Login
        response = client.post('/auth/login', data={
            'email': 'journey@example.com',
            'password': 'JourneyPassword123!'
        })
        assert response.status_code == 200
        
        # 3. Browse products
        response = client.get('/shop')
        assert response.status_code == 200
        
        # 4. Add product to cart
        response = client.post('/cart/add', data={
            'product_id': '1',
            'quantity': '1'
        })
        assert response.status_code == 200
        
        # 5. Proceed to checkout
        response = client.get('/cart/checkout')
        assert response.status_code == 200
        
        # 6. Complete order
        response = client.post('/cart/checkout', data={
            'shipping_address': 'Journey Address',
            'shipping_city': 'Journey City',
            'shipping_postal_code': '12345',
            'shipping_phone': '+905551234567',
            'payment_method': 'credit_card'
        })
        assert response.status_code == 200
    
    def test_complete_guest_journey(self, client):
        """Test complete guest journey from browsing to order"""
        # 1. Browse products
        response = client.get('/shop')
        assert response.status_code == 200
        
        # 2. Add product to cart
        response = client.post('/cart/add', data={
            'product_id': '1',
            'quantity': '1'
        })
        assert response.status_code == 200
        
        # 3. Proceed to guest checkout
        response = client.get('/cart/checkout')
        assert response.status_code == 200
        
        # 4. Complete guest order
        response = client.post('/cart/process-guest-order', data={
            'email': 'guest@example.com',
            'phone': '+905551234567',
            'shipping_address': 'Guest Address',
            'shipping_city': 'Guest City',
            'shipping_postal_code': '12345',
            'payment_method': 'credit_card'
        })
        assert response.status_code == 200
        
        # 5. Convert to user account
        response = client.post('/cart/create-account', data={
            'email': 'guest@example.com'
        })
        assert response.status_code == 200

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
