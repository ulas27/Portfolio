"""
Security utilities and middleware for the Inci Gold e-commerce platform.

This module provides security features including password hashing, 
file validation, and other security helpers.
"""

import hashlib
import secrets
import time
from functools import wraps
import re
import os
from urllib.parse import urlparse, urljoin
import logging


from flask import current_app, request

def hash_password(password, salt=None):
    """Hash password with salt"""
    if salt is None:
        salt = secrets.token_hex(16)
    
    # Use PBKDF2 for password hashing
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # iterations
    )
    
    return password_hash.hex(), salt

def verify_password(password, password_hash, salt):
    """Verify password against hash"""
    computed_hash, _ = hash_password(password, salt)
    return computed_hash == password_hash

def sanitize_filename(filename):
    """Sanitize filename for safe storage"""
    
    # Remove path components
    filename = os.path.basename(filename)
    
    # Remove dangerous characters
    filename = re.sub(r'[^\w\-_\.]', '', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    
    return filename

def is_safe_url(target):
    """Check if URL is safe for redirects"""
    
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc

def generate_secure_token(length=32):
    """Generate secure random token"""
    return secrets.token_urlsafe(length)

def validate_file_type(filename, allowed_extensions=None):
    """Validate file type"""
    if allowed_extensions is None:
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']
    
    if '.' not in filename:
        return False
    
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_extensions

def log_security_event(event_type, details, user_id=None, ip_address=None):
    """Log security events"""
    
    logger = logging.getLogger('security')
    
    log_data = {
        'event_type': event_type,
        'details': details,
        'user_id': user_id,
        'ip_address': ip_address or request.remote_addr,
        'user_agent': request.headers.get('User-Agent'),
        'timestamp': time.time()
    }
    
    logger.warning(f"Security Event: {log_data}")

def check_brute_force_attempts(identifier, max_attempts=5, window=300):
    """Check for brute force attempts"""
    # This is a simple in-memory implementation. 
    # In production, consider using Redis or a database.
    current_time = time.time()
    
    if not hasattr(current_app, 'brute_force_store'):
        current_app.brute_force_store = {}
    
    # Clean old attempts
    current_app.brute_force_store = {
        k: v for k, v in current_app.brute_force_store.items()
        if current_time - v['last_attempt'] < window
    }
    
    # Check attempts for this identifier
    if identifier in current_app.brute_force_store:
        attempts = current_app.brute_force_store[identifier]
        if attempts['count'] >= max_attempts:
            return True, attempts['count']
        attempts['count'] += 1
        attempts['last_attempt'] = current_time
    else:
        current_app.brute_force_store[identifier] = {
            'count': 1,
            'last_attempt': current_time
        }
    
    return False, current_app.brute_force_store[identifier]['count']