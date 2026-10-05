"""
reCAPTCHA v3 verification utility
"""

import requests
from flask import current_app, request
import logging

logger = logging.getLogger(__name__)

def verify_recaptcha(token, action=None, min_score=0.5):
    """
    Verify reCAPTCHA v3 token
    
    Args:
        token: reCAPTCHA token from frontend
        action: Expected action name
        min_score: Minimum score threshold (0.0 to 1.0)
    
    Returns:
        tuple: (is_valid, score, error_message)
    """
    if not current_app.config.get('RECAPTCHA_PRIVATE_KEY'):
        logger.warning("reCAPTCHA private key not configured")
        return True, 1.0, None  # Skip verification if not configured
    
    if not token:
        return False, 0.0, "reCAPTCHA token is required"
    
    try:
        # Verify with Google reCAPTCHA API
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': current_app.config['RECAPTCHA_PRIVATE_KEY'],
                'response': token,
                'remoteip': request.remote_addr
            },
            timeout=10
        )
        
        result = response.json()
        
        if not result.get('success', False):
            error_codes = result.get('error-codes', [])
            return False, 0.0, f"reCAPTCHA verification failed: {', '.join(error_codes)}"
        
        score = result.get('score', 0.0)
        
        # Check score threshold
        if score < min_score:
            return False, score, f"reCAPTCHA score too low: {score:.2f} < {min_score}"
        
        # Check action if provided
        if action and result.get('action') != action:
            return False, score, f"reCAPTCHA action mismatch: expected {action}, got {result.get('action')}"
        
        return True, score, None
        
    except requests.RequestException as e:
        logger.error(f"reCAPTCHA verification error: {e}")
        return False, 0.0, "reCAPTCHA verification service unavailable"
    except Exception as e:
        logger.error(f"Unexpected reCAPTCHA error: {e}")
        return False, 0.0, "reCAPTCHA verification failed"

def get_recaptcha_public_key():
    """Get reCAPTCHA public key for frontend"""
    return current_app.config.get('RECAPTCHA_PUBLIC_KEY', '')
