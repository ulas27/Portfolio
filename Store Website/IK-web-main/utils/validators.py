"""
Form validation utilities for the Inci Gold e-commerce platform.

This module provides comprehensive validation functions for user inputs including
email, password, phone numbers, names, addresses, and file uploads.
"""

import re

from flask import current_app
from werkzeug.security import check_password_hash

try:
    import bleach
    BLEACH_AVAILABLE = True
except ImportError:
    BLEACH_AVAILABLE = False

def validate_email(email):
    """Email format validation"""
    if not email:
        return False, "Email adresi gereklidir"
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Geçerli bir email adresi girin"
    
    if len(email) > 120:
        return False, "Email adresi çok uzun (max 120 karakter)"
    
    return True, ""

def validate_password(password):
    """Password strength validation"""
    if not password:
        return False, "Şifre gereklidir"
    
    if len(password) < 8:
        return False, "Şifre en az 8 karakter olmalıdır"
    
    if len(password) > 128:
        return False, "Şifre çok uzun (max 128 karakter)"
    
    # En az bir büyük harf
    if not re.search(r'[A-Z]', password):
        return False, "Şifre en az bir büyük harf içermelidir"
    
    # En az bir küçük harf
    if not re.search(r'[a-z]', password):
        return False, "Şifre en az bir küçük harf içermelidir"
    
    # En az bir rakam
    if not re.search(r'\d', password):
        return False, "Şifre en az bir rakam içermelidir"
    
    # En az bir özel karakter
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Şifre en az bir özel karakter içermelidir"
    
    return True, ""

def validate_phone(phone):
    """Phone number validation"""
    if not phone:
        return True, ""  # Phone is optional
    
    # Remove all non-digit characters
    clean_phone = re.sub(r'\D', '', phone)
    
    # Turkish phone number validation
    if len(clean_phone) == 10 and clean_phone.startswith('5'):
        return True, ""
    elif len(clean_phone) == 11 and clean_phone.startswith('05'):
        return True, ""
    elif len(clean_phone) == 13 and clean_phone.startswith('905'):
        return True, ""
    else:
        return False, "Geçerli bir telefon numarası girin (5xxxxxxxxx)"

def validate_name(name, field_name="İsim"):
    """Name validation"""
    if not name:
        return False, f"{field_name} gereklidir"
    
    if len(name.strip()) < 2:
        return False, f"{field_name} en az 2 karakter olmalıdır"
    
    if len(name) > 50:
        return False, f"{field_name} çok uzun (max 50 karakter)"
    
    # Only letters, spaces, and Turkish characters
    if not re.match(r'^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$', name):
        return False, f"{field_name} sadece harf ve boşluk içerebilir"
    
    return True, ""

def validate_username(username):
    """Username validation"""
    if not username:
        return False, "Kullanıcı adı gereklidir"
    
    if len(username) < 3:
        return False, "Kullanıcı adı en az 3 karakter olmalıdır"
    
    if len(username) > 30:
        return False, "Kullanıcı adı çok uzun (max 30 karakter)"
    
    # Only alphanumeric and underscore
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"
    
    return True, ""

def validate_address(address, field_name="Adres"):
    """Address validation"""
    if not address:
        return True, ""  # Address is optional
    
    if len(address) > 500:
        return False, f"{field_name} çok uzun (max 500 karakter)"
    
    # Basic XSS protection
    dangerous_patterns = ['<script', 'javascript:', 'onload=', 'onerror=']
    for pattern in dangerous_patterns:
        if pattern.lower() in address.lower():
            return False, f"{field_name} geçersiz karakterler içeriyor"
    
    return True, ""

def validate_price(price):
    """Price validation"""
    if price is None:
        return False, "Fiyat gereklidir"
    
    try:
        price_float = float(price)
        if price_float < 0:
            return False, "Fiyat negatif olamaz"
        if price_float > 999999.99:
            return False, "Fiyat çok yüksek (max 999,999.99)"
        return True, ""
    except (ValueError, TypeError):
        return False, "Geçerli bir fiyat girin"

def validate_stock(stock):
    """Stock validation"""
    if stock is None:
        return False, "Stok miktarı gereklidir"
    
    try:
        stock_int = int(stock)
        if stock_int < 0:
            return False, "Stok miktarı negatif olamaz"
        if stock_int > 99999:
            return False, "Stok miktarı çok yüksek (max 99,999)"
        return True, ""
    except (ValueError, TypeError):
        return False, "Geçerli bir stok miktarı girin"

def sanitize_html(html_content, allowed_tags=None, allowed_attrs=None):
    """HTML sanitization using bleach"""
    if not html_content:
        return ""

    if not BLEACH_AVAILABLE:
        # Fallback to basic sanitization if bleach is not available
        return sanitize_input(html_content)

    if allowed_tags is None:
        # Allow basic formatting tags
        allowed_tags = [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ]

    if allowed_attrs is None:
        allowed_attrs = {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'table': ['border', 'cellpadding', 'cellspacing'],
            '*': ['style', 'class']
        }

    # Clean HTML
    cleaned_html = bleach.clean(
        html_content,
        tags=allowed_tags,
        attributes=allowed_attrs,
        strip=True
    )

    return cleaned_html

def sanitize_input(text):
    """Basic input sanitization"""
    if not text:
        return ""

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Remove dangerous characters
    text = re.sub(r'[<>"\']', '', text)

    # Trim whitespace
    text = text.strip()

    return text

def validate_file_upload(file, allowed_extensions=None, max_size_mb=5):
    """File upload validation"""
    if not file:
        return False, "Dosya seçilmedi"
    
    if allowed_extensions is None:
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    # Check file extension
    if '.' not in file.filename:
        return False, "Dosya uzantısı bulunamadı"
    
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    if file_ext not in allowed_extensions:
        return False, f"Sadece {', '.join(allowed_extensions)} dosyaları kabul edilir"
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        return False, f"Dosya boyutu {max_size_mb}MB'dan büyük olamaz"
    
    return True, ""
