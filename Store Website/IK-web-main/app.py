import os
import secrets
from datetime import datetime
from dotenv import load_dotenv

from flask import Flask, render_template, jsonify, redirect, request
from flask_login import LoginManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect

from models import db, User, Category
from utils.logging_config import setup_logging

login_manager = LoginManager()
mail = Mail()
cache = Cache()
csrf = CSRFProtect()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per day", "100 per hour", "20 per minute"],
    storage_uri=os.getenv('REDIS_URL', 'memory://')
)
# Talisman will be initialized within create_app


def create_app():
    load_dotenv()

    app = Flask(__name__, static_folder='static', template_folder='templates')

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///kuyumcu.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Security Configuration
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

    # File uploads
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'static/uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))

    # Mail configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587'))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # Iyzico payment configuration
    app.config['IYZICO_API_KEY'] = os.getenv('IYZICO_API_KEY')
    app.config['IYZICO_SECRET_KEY'] = os.getenv('IYZICO_SECRET_KEY')
    app.config['IYZICO_BASE_URL'] = os.getenv('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com')
    
    # WhatsApp configuration
    app.config['WHATSAPP_BUSINESS_PHONE'] = os.getenv('WHATSAPP_BUSINESS_PHONE', '+905468992717')
    app.config['WHATSAPP_API_URL'] = os.getenv('WHATSAPP_API_URL', 'https://api.whatsapp.com/send')
    
    # reCAPTCHA configuration
    app.config['RECAPTCHA_PUBLIC_KEY'] = os.getenv('RECAPTCHA_PUBLIC_KEY')
    app.config['RECAPTCHA_PRIVATE_KEY'] = os.getenv('RECAPTCHA_PRIVATE_KEY')

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'

    mail.init_app(app)
    
    # CSRF Protection
    csrf.init_app(app)
    
    limiter.init_app(app)
    
    # Talisman for security headers
    Talisman(app, content_security_policy={
        "default-src": "'self'",
        "script-src": "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src": "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
        "font-src": "'self' https://fonts.gstatic.com",
        "img-src": "'self' data: https:",
        "connect-src": "'self'",
        "frame-ancestors": "'none'"
    })

    # Cache configuration
    cache.init_app(app, config={
        'CACHE_TYPE': 'simple',  # In production, use Redis
        'CACHE_DEFAULT_TIMEOUT': 300  # 5 minutes
    })
    
    # Make cache available to the app
    app.cache = cache
    

    # Register blueprints
    from routes import main, auth, admin, shop, cart, payment
    from routes.newsletter import newsletter_bp
    from routes.payment_analytics import analytics_bp
    app.register_blueprint(main, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(admin, url_prefix='/admin')
    app.register_blueprint(shop, url_prefix='/shop')
    app.register_blueprint(cart, url_prefix='/cart')
    app.register_blueprint(payment, url_prefix='/payment')
    app.register_blueprint(newsletter_bp, url_prefix='/')
    app.register_blueprint(analytics_bp)

    # Ensure upload folders exist
    with app.app_context():
        os.makedirs(os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], 'products'), exist_ok=True)
        os.makedirs(os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], 'categories'), exist_ok=True)

    # Context processors
    @app.context_processor
    def inject_global_data():
        """Inject global data into all templates"""
        try:
            categories = Category.query.filter_by(is_active=True).order_by(Category.sort_order).all()
        except Exception:
            categories = []
        return {
            'categories': categories,
        }

    # Setup logging
    setup_logging(app)
    
    # HTTPS enforcement
    @app.before_request
    def force_https():
        """Force HTTPS in production"""
        if os.getenv('FORCE_HTTPS', 'False').lower() == 'true':
            if not request.is_secure and not request.headers.get('X-Forwarded-Proto') == 'https':
                return redirect(request.url.replace('http://', 'https://'), code=301)

    # Cache clear endpoint
    @app.route('/clear-cache')
    def clear_cache():
        """Clear application cache"""
        try:
            cache.clear()
            return jsonify({'status': 'success', 'message': 'Cache cleared successfully'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Comprehensive health check endpoint"""
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'services': {}
        }
        
        # Database health check
        try:
            db.session.execute('SELECT 1')
            health_status['services']['database'] = 'healthy'
        except Exception as e:
            health_status['services']['database'] = f'unhealthy: {str(e)}'
            health_status['status'] = 'unhealthy'
        
        # Limiter/Redis health check (basic)
        try:
            # This is a proxy to check if the limiter storage is responsive.
            # For Redis, it would involve a round-trip. For memory, it's trivial.
            limiter.storage.check()
            health_status['services']['limiter_storage'] = 'healthy'
        except Exception as e:
            health_status['services']['limiter_storage'] = f'unhealthy: {str(e)}'
            health_status['status'] = 'degraded'
        
        # Mail service health check
        try:
            with mail.connect() as conn:
                conn.noop()
            health_status['services']['mail'] = 'healthy'
        except Exception as e:
            health_status['services']['mail'] = f'unhealthy: {str(e)}'
            health_status['status'] = 'degraded'
        
        status_code = 200 if health_status['status'] == 'healthy' else 503
        return jsonify(health_status), status_code

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def server_error(e):
        return render_template('500.html'), 500
    
    @app.errorhandler(413)
    def too_large(e):
        return jsonify({'error': 'File too large'}), 413
    
    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({'error': 'Rate limit exceeded'}), 429

    @login_manager.user_loader
    def load_user(user_id):
        """Load user by ID for Flask-Login"""
        try:
            return User.query.get(int(user_id))
        except (ValueError, TypeError):
            return None

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"Server running: http://localhost:{port}")
    app.run(debug=debug, port=port)
