"""
Enterprise API Security & Authentication
JWT, OAuth2, API rate limiting, security headers
"""

import jwt
import hashlib
import hmac
import time
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app, g
import logging

logger = logging.getLogger(__name__)

class APISecurityManager:
    """Enterprise API security manager"""
    
    def __init__(self, app=None):
        self.app = app
        self.jwt_secret = None
        self.jwt_algorithm = 'HS256'
        self.jwt_expiration = 3600  # 1 hour
        self.refresh_expiration = 86400 * 7  # 7 days
        self.api_keys = {}
        self.rate_limits = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize API security manager"""
        self.app = app
        
        # JWT configuration
        self.jwt_secret = app.config.get('JWT_SECRET_KEY', app.config.get('SECRET_KEY'))
        self.jwt_expiration = int(app.config.get('JWT_EXPIRATION', 3600))
        self.refresh_expiration = int(app.config.get('JWT_REFRESH_EXPIRATION', 604800))
        
        # Load API keys from database or config
        self._load_api_keys()
    
    def _load_api_keys(self):
        """Load API keys from database"""
        try:
            # This would typically load from database
            # For now, we'll use a simple in-memory store
            self.api_keys = {
                'admin': {
                    'key': 'ak_live_admin_' + secrets.token_hex(16),
                    'secret': secrets.token_hex(32),
                    'permissions': ['read', 'write', 'admin'],
                    'rate_limit': 1000,
                    'expires': None
                },
                'mobile': {
                    'key': 'ak_live_mobile_' + secrets.token_hex(16),
                    'secret': secrets.token_hex(32),
                    'permissions': ['read', 'write'],
                    'rate_limit': 500,
                    'expires': None
                },
                'webhook': {
                    'key': 'ak_live_webhook_' + secrets.token_hex(16),
                    'secret': secrets.token_hex(32),
                    'permissions': ['webhook'],
                    'rate_limit': 100,
                    'expires': None
                }
            }
            
            logger.info("API keys loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading API keys: {str(e)}")
    
    def generate_jwt_token(self, user_id, user_role='user', additional_claims=None):
        """Generate JWT access token"""
        try:
            now = datetime.utcnow()
            
            payload = {
                'user_id': user_id,
                'role': user_role,
                'iat': now,
                'exp': now + timedelta(seconds=self.jwt_expiration),
                'jti': secrets.token_hex(16),  # JWT ID
                'iss': 'incigold.com',  # Issuer
                'aud': 'incigold-api'   # Audience
            }
            
            if additional_claims:
                payload.update(additional_claims)
            
            token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
            
            logger.info(f"JWT token generated for user {user_id}")
            return token
            
        except Exception as e:
            logger.error(f"Error generating JWT token: {str(e)}")
            return None
    
    def generate_refresh_token(self, user_id):
        """Generate JWT refresh token"""
        try:
            now = datetime.utcnow()
            
            payload = {
                'user_id': user_id,
                'type': 'refresh',
                'iat': now,
                'exp': now + timedelta(seconds=self.refresh_expiration),
                'jti': secrets.token_hex(16)
            }
            
            token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
            
            logger.info(f"Refresh token generated for user {user_id}")
            return token
            
        except Exception as e:
            logger.error(f"Error generating refresh token: {str(e)}")
            return None
    
    def verify_jwt_token(self, token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm],
                audience='incigold-api',
                issuer='incigold.com'
            )
            
            # Check if token is blacklisted
            if self._is_token_blacklisted(payload.get('jti')):
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying JWT token: {str(e)}")
            return None
    
    def verify_api_key(self, api_key, api_secret=None):
        """Verify API key and secret"""
        try:
            if api_key not in self.api_keys:
                return None
            
            key_info = self.api_keys[api_key]
            
            # Check expiration
            if key_info.get('expires') and datetime.utcnow() > key_info['expires']:
                return None
            
            # Verify secret if provided
            if api_secret and key_info.get('secret') != api_secret:
                return None
            
            return key_info
            
        except Exception as e:
            logger.error(f"Error verifying API key: {str(e)}")
            return None
    
    def _is_token_blacklisted(self, jti):
        """Check if token is blacklisted"""
        # This would typically check a database or Redis
        # For now, return False (no blacklist)
        return False
    
    def blacklist_token(self, jti):
        """Blacklist a token"""
        try:
            # This would typically store in database or Redis
            # For now, we'll use a simple in-memory store
            if not hasattr(self, '_blacklisted_tokens'):
                self._blacklisted_tokens = set()
            
            self._blacklisted_tokens.add(jti)
            logger.info(f"Token blacklisted: {jti}")
            
        except Exception as e:
            logger.error(f"Error blacklisting token: {str(e)}")
    
    def create_api_key(self, name, permissions, rate_limit=100, expires=None):
        """Create new API key"""
        try:
            api_key = f"ak_live_{name}_{secrets.token_hex(16)}"
            api_secret = secrets.token_hex(32)
            
            self.api_keys[api_key] = {
                'key': api_key,
                'secret': api_secret,
                'permissions': permissions,
                'rate_limit': rate_limit,
                'expires': expires,
                'created_at': datetime.utcnow()
            }
            
            logger.info(f"API key created: {name}")
            return {
                'api_key': api_key,
                'api_secret': api_secret
            }
            
        except Exception as e:
            logger.error(f"Error creating API key: {str(e)}")
            return None
    
    def revoke_api_key(self, api_key):
        """Revoke API key"""
        try:
            if api_key in self.api_keys:
                del self.api_keys[api_key]
                logger.info(f"API key revoked: {api_key}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error revoking API key: {str(e)}")
            return False
    
    def check_rate_limit(self, identifier, limit, window=3600):
        """Check API rate limit"""
        try:
            now = time.time()
            window_start = now - window
            
            if not hasattr(self, '_rate_limit_store'):
                self._rate_limit_store = {}
            
            # Clean old entries
            if identifier in self._rate_limit_store:
                self._rate_limit_store[identifier] = [
                    timestamp for timestamp in self._rate_limit_store[identifier]
                    if timestamp > window_start
                ]
            else:
                self._rate_limit_store[identifier] = []
            
            # Check limit
            if len(self._rate_limit_store[identifier]) >= limit:
                return False
            
            # Add current request
            self._rate_limit_store[identifier].append(now)
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {str(e)}")
            return True  # Allow on error
    
    def generate_webhook_signature(self, payload, secret):
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
    
    def verify_webhook_signature(self, payload, signature, secret):
        """Verify webhook signature"""
        try:
            expected_signature = self.generate_webhook_signature(payload, secret)
            
            if not expected_signature:
                return False
            
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False

# Global API security manager
api_security = APISecurityManager()

# Decorators
def jwt_required(f):
    """Require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid authorization header'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        payload = api_security.verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to g
        g.current_user_id = payload['user_id']
        g.current_user_role = payload.get('role', 'user')
        
        return f(*args, **kwargs)
    
    return decorated_function

def api_key_required(permissions=None):
    """Require API key authentication"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            api_key = request.headers.get('X-API-Key')
            api_secret = request.headers.get('X-API-Secret')
            
            if not api_key:
                return jsonify({'error': 'API key is missing'}), 401
            
            # Verify API key
            key_info = api_security.verify_api_key(api_key, api_secret)
            if not key_info:
                return jsonify({'error': 'Invalid API key'}), 401
            
            # Check permissions
            if permissions:
                if not any(perm in key_info['permissions'] for perm in permissions):
                    return jsonify({'error': 'Insufficient permissions'}), 403
            
            # Check rate limit
            if not api_security.check_rate_limit(api_key, key_info['rate_limit']):
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            # Add API key info to g
            g.api_key_info = key_info
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def role_required(required_role):
    """Require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user_role'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user_role = g.current_user_role
            
            # Role hierarchy: admin > manager > user
            role_hierarchy = {'user': 1, 'manager': 2, 'admin': 3}
            
            if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 0):
                return jsonify({'error': 'Insufficient privileges'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def webhook_signature_required(secret_key):
    """Require webhook signature verification"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            signature = request.headers.get('X-Webhook-Signature')
            
            if not signature:
                return jsonify({'error': 'Webhook signature is missing'}), 401
            
            # Get raw payload
            payload = request.get_data(as_text=True)
            
            # Verify signature
            if not api_security.verify_webhook_signature(payload, signature, secret_key):
                return jsonify({'error': 'Invalid webhook signature'}), 401
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def rate_limit(limit, window=3600, per_user=True):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get identifier
            if per_user and hasattr(g, 'current_user_id'):
                identifier = f"user_{g.current_user_id}"
            else:
                identifier = request.remote_addr
            
            # Check rate limit
            if not api_security.check_rate_limit(identifier, limit, window):
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
