"""
Advanced logging configuration for the application
"""

import os
import logging
import logging.handlers
from datetime import datetime
from flask import request
from flask_login import current_user
import traceback

class SecurityFilter(logging.Filter):
    """Filter to remove sensitive information from logs"""
    
    def filter(self, record):
        # Remove sensitive data from log messages
        if hasattr(record, 'msg'):
            msg = str(record.msg)
            # Remove password patterns
            import re
            msg = re.sub(r'password["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'password=***', msg, flags=re.IGNORECASE)
            msg = re.sub(r'token["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'token=***', msg, flags=re.IGNORECASE)
            msg = re.sub(r'key["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'key=***', msg, flags=re.IGNORECASE)
            record.msg = msg
        return True

class RequestContextFilter(logging.Filter):
    """Add request context to log records"""
    
    def filter(self, record):
        try:
            if request:
                record.remote_addr = getattr(request, 'remote_addr', 'unknown')
                record.method = getattr(request, 'method', 'unknown')
                record.path = getattr(request, 'path', 'unknown')
                record.user_agent = getattr(request, 'headers', {}).get('User-Agent', 'unknown')
                
                # Add user info if available
                if current_user and current_user.is_authenticated:
                    record.user_id = current_user.id
                    record.username = current_user.username
                else:
                    record.user_id = None
                    record.username = None
            else:
                record.remote_addr = 'no-request'
                record.method = 'no-request'
                record.path = 'no-request'
                record.user_agent = 'no-request'
                record.user_id = None
                record.username = None
        except Exception:
            # If we can't get request context, set defaults
            record.remote_addr = 'error'
            record.method = 'error'
            record.path = 'error'
            record.user_agent = 'error'
            record.user_id = None
            record.username = None
        
        return True

def setup_logging(app):
    """Setup comprehensive logging configuration"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(app.root_path, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Get log configuration from environment
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_file = os.getenv('LOG_FILE', os.path.join(log_dir, 'app.log'))
    error_log_file = os.getenv('ERROR_LOG_FILE', os.path.join(log_dir, 'error.log'))
    access_log_file = os.getenv('ACCESS_LOG_FILE', os.path.join(log_dir, 'access.log'))
    security_log_file = os.getenv('SECURITY_LOG_FILE', os.path.join(log_dir, 'security.log'))
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)-20s | %(remote_addr)-15s | '
        '%(method)-6s | %(path)-30s | %(user_id)s | %(username)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    console_handler.addFilter(SecurityFilter())
    console_handler.addFilter(RequestContextFilter())
    root_logger.addHandler(console_handler)
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(getattr(logging, log_level, logging.INFO))
    file_handler.setFormatter(detailed_formatter)
    file_handler.addFilter(SecurityFilter())
    file_handler.addFilter(RequestContextFilter())
    root_logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = logging.handlers.RotatingFileHandler(
        error_log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    error_handler.addFilter(SecurityFilter())
    error_handler.addFilter(RequestContextFilter())
    root_logger.addHandler(error_handler)
    
    # Security log handler
    security_handler = logging.handlers.RotatingFileHandler(
        security_log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=10,  # Keep more security logs
        encoding='utf-8'
    )
    security_handler.setLevel(logging.WARNING)
    security_handler.setFormatter(detailed_formatter)
    security_handler.addFilter(SecurityFilter())
    security_handler.addFilter(RequestContextFilter())
    
    # Create security logger
    security_logger = logging.getLogger('security')
    security_logger.addHandler(security_handler)
    security_logger.setLevel(logging.WARNING)
    security_logger.propagate = False
    
    # Access log handler
    access_handler = logging.handlers.RotatingFileHandler(
        access_log_file,
        maxBytes=20*1024*1024,  # 20MB
        backupCount=3,
        encoding='utf-8'
    )
    access_handler.setLevel(logging.INFO)
    access_handler.setFormatter(detailed_formatter)
    access_handler.addFilter(SecurityFilter())
    access_handler.addFilter(RequestContextFilter())
    
    # Create access logger
    access_logger = logging.getLogger('access')
    access_logger.addHandler(access_handler)
    access_logger.setLevel(logging.INFO)
    access_logger.propagate = False
    
    # Configure specific loggers
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    
    # SQL logging (if enabled)
    if os.getenv('SQL_LOGGING', 'False').lower() == 'true':
        sql_logger = logging.getLogger('sqlalchemy.engine')
        sql_logger.setLevel(logging.INFO)
        sql_logger.addHandler(file_handler)
    
    app.logger.info(f"Logging configured - Level: {log_level}, File: {log_file}")

def log_security_event(event_type, details, user_id=None, ip_address=None):
    """Log security events with context"""
    security_logger = logging.getLogger('security')
    
    log_data = {
        'event_type': event_type,
        'details': details,
        'user_id': user_id,
        'ip_address': ip_address or (request.remote_addr if request else 'unknown'),
        'user_agent': request.headers.get('User-Agent') if request else 'unknown',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    security_logger.warning(f"Security Event: {log_data}")

def log_access_event(event_type, details, user_id=None):
    """Log access events"""
    access_logger = logging.getLogger('access')
    
    log_data = {
        'event_type': event_type,
        'details': details,
        'user_id': user_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    access_logger.info(f"Access Event: {log_data}")

def log_error(error, context=None):
    """Log errors with full context"""
    logger = logging.getLogger('error')
    
    error_data = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'context': context,
        'traceback': traceback.format_exc(),
        'timestamp': datetime.utcnow().isoformat()
    }
    
    logger.error(f"Error: {error_data}")

def log_performance(operation, duration, details=None):
    """Log performance metrics"""
    logger = logging.getLogger('performance')
    
    perf_data = {
        'operation': operation,
        'duration_ms': duration * 1000,
        'details': details,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    logger.info(f"Performance: {perf_data}")
