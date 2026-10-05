"""
Payment Analytics Dashboard
Fraud detection, payment monitoring, business intelligence
"""

from flask import Blueprint, render_template, request, jsonify, current_app
from flask_login import login_required, current_user
from models import db, Order, User, Product
from utils.payment_enterprise import IyzicoEnterprise
from utils.decorators import admin_required
from datetime import datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')

# This decorator was removed as rate limiting is now handled globally by Flask-Limiter.
@analytics_bp.route('/dashboard', methods=['GET'])
@admin_required
def analytics_dashboard():
    """Gelişmiş analitik dashboard"""
    try:
        # Date range (default: last 30 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # Get analytics data
        analytics_data = get_payment_analytics(start_date, end_date)
        
        return render_template('admin/payment_analytics.html', 
                             analytics=analytics_data,
                             start_date=start_date.strftime('%Y-%m-%d'),
                             end_date=end_date.strftime('%Y-%m-%d'))
        
    except Exception as e:
        logger.error(f"Analytics dashboard error: {str(e)}")
        return render_template('admin/payment_analytics.html', 
                             error="Analytics verileri yüklenirken hata oluştu.")

@analytics_bp.route('/api/payment-stats', methods=['GET'])
@admin_required
def payment_stats_api():
    """API: Ödeme istatistikleri"""
    try:
        # Son 30 gün
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str and end_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        else:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
        
        # Get payment statistics
        stats = get_payment_statistics(start_date, end_date)
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        logger.error(f"Payment stats API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Veriler yüklenirken hata oluştu.'
        }), 500

@analytics_bp.route('/api/fraud-detection-stats', methods=['GET'])
@admin_required
def fraud_detection_api():
    """API: Sahtekarlık tespiti istatistikleri"""
    try:
        # Son 7 gün
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if start_date_str and end_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        else:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
        
        # Get fraud detection data
        fraud_data = get_fraud_detection_data()
        
        return jsonify({
            'success': True,
            'data': fraud_data
        })
        
    except Exception as e:
        logger.error(f"Fraud detection API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Fraud detection verileri yüklenirken hata oluştu.'
        }), 500

@analytics_bp.route('/api/transaction-trends', methods=['GET'])
@admin_required
def transaction_trends_api():
    """API: İşlem trendleri (günlük/haftalık/aylık)"""
    try:
        period = request.args.get('period', 'daily')  # daily, weekly, monthly
        
        # Get transaction trends
        trends_data = get_transaction_trends()
        
        return jsonify({
            'success': True,
            'data': trends_data
        })
        
    except Exception as e:
        logger.error(f"Transaction trends API error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Transaction trends verileri yüklenirken hata oluştu.'
        }), 500

def get_payment_analytics(start_date, end_date):
    """Get comprehensive payment analytics"""
    try:
        # Basic order statistics
        total_orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date
        ).count()
        
        successful_orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).count()
        
        failed_orders = Order.query.filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'failed'
        ).count()
        
        # Revenue statistics
        total_revenue = db.session.query(db.func.sum(Order.total_amount)).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).scalar() or Decimal('0')
        
        average_order_value = total_revenue / successful_orders if successful_orders > 0 else Decimal('0')
        
        # Payment method distribution
        payment_methods = db.session.query(
            Order.payment_method,
            db.func.count(Order.id).label('count'),
            db.func.sum(Order.total_amount).label('total')
        ).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).group_by(Order.payment_method).all()
        
        # Daily transaction trends
        daily_trends = db.session.query(
            db.func.date(Order.created_at).label('date'),
            db.func.count(Order.id).label('count'),
            db.func.sum(Order.total_amount).label('total')
        ).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.status == 'completed'
        ).group_by(db.func.date(Order.created_at)).order_by('date').all()
        
        # Top products
        top_products = db.session.query(
            Product.name,
            db.func.sum(OrderItem.quantity).label('quantity'),
            db.func.sum(OrderItem.price * OrderItem.quantity).label('revenue')
        ).join(OrderItem, Product.id == OrderItem.product_id)\
         .join(Order, OrderItem.order_id == Order.id)\
         .filter(
             Order.created_at >= start_date,
             Order.created_at <= end_date,
             Order.status == 'completed'
         ).group_by(Product.id, Product.name)\
         .order_by(db.desc('revenue')).limit(10).all()
        
        # Customer analytics
        new_customers = User.query.filter(
            User.created_at >= start_date,
            User.created_at <= end_date
        ).count()
        
        returning_customers = db.session.query(User.id).join(Order, User.id == Order.user_id)\
            .filter(
                Order.created_at >= start_date,
                Order.created_at <= end_date,
                Order.status == 'completed'
            ).distinct().count()
        
        return {
            'total_orders': total_orders,
            'successful_orders': successful_orders,
            'failed_orders': failed_orders,
            'success_rate': (successful_orders / total_orders * 100) if total_orders > 0 else 0,
            'total_revenue': float(total_revenue),
            'average_order_value': float(average_order_value),
            'payment_methods': [
                {
                    'method': method,
                    'count': count,
                    'total': float(total)
                } for method, count, total in payment_methods
            ],
            'daily_trends': [
                {
                    'date': date.strftime('%Y-%m-%d'),
                    'count': count,
                    'total': float(total)
                } for date, count, total in daily_trends
            ],
            'top_products': [
                {
                    'name': name,
                    'quantity': quantity,
                    'revenue': float(revenue)
                } for name, quantity, revenue in top_products
            ],
            'new_customers': new_customers,
            'returning_customers': returning_customers,
            'customer_retention_rate': (returning_customers / (new_customers + returning_customers) * 100) if (new_customers + returning_customers) > 0 else 0
        }
        
    except Exception as e:
        logger.error(f"Payment analytics error: {str(e)}")
        return None

def get_payment_statistics(start_date, end_date):
    """Get detailed payment statistics"""
    try:
        # Get İyzico enterprise analytics
        iyzico_enterprise = IyzicoEnterprise()
        iyzico_analytics = iyzico_enterprise.get_payment_analytics(start_date, end_date)
        
        # Combine with database statistics
        db_analytics = get_payment_analytics(start_date, end_date)
        
        return {
            'database_stats': db_analytics,
            'iyzico_stats': iyzico_analytics,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Payment statistics error: {str(e)}")
        return None

def get_fraud_detection_data():
    """Get fraud detection analytics"""
    try:
        # This would typically integrate with fraud detection systems
        # For now, return mock data structure
        
        fraud_data = {
            'total_transactions': 0,
            'fraud_detected': 0,
            'fraud_rate': 0.0,
            'risk_distribution': {
                'low': 0,
                'medium': 0,
                'high': 0
            },
            'fraud_patterns': [],
            'blocked_ips': [],
            'suspicious_devices': [],
            'geographic_risks': []
        }
        
        return fraud_data
        
    except Exception as e:
        logger.error(f"Fraud detection data error: {str(e)}")
        return None

def get_transaction_trends():
    """Get transaction trend analysis"""
    try:
        # Get hourly transaction patterns
        hourly_patterns = db.session.query(
            db.func.hour(Order.created_at).label('hour'),
            db.func.count(Order.id).label('count'),
            db.func.avg(Order.total_amount).label('avg_amount')
        ).filter(
            Order.created_at >= datetime.now() - timedelta(days=7),
            Order.status == 'completed'
        ).group_by(db.func.hour(Order.created_at)).order_by('hour').all()
        
        # Get weekly patterns
        weekly_patterns = db.session.query(
            db.func.dayofweek(Order.created_at).label('day'),
            db.func.count(Order.id).label('count'),
            db.func.avg(Order.total_amount).label('avg_amount')
        ).filter(
            Order.created_at >= datetime.now() - timedelta(days=30),
            Order.status == 'completed'
        ).group_by(db.func.dayofweek(Order.created_at)).order_by('day').all()
        
        return {
            'hourly_patterns': [
                {
                    'hour': hour,
                    'count': count,
                    'avg_amount': float(avg_amount) if avg_amount else 0
                } for hour, count, avg_amount in hourly_patterns
            ],
            'weekly_patterns': [
                {
                    'day': day,
                    'count': count,
                    'avg_amount': float(avg_amount) if avg_amount else 0
                } for day, count, avg_amount in weekly_patterns
            ]
        }
        
    except Exception as e:
        logger.error(f"Transaction trends error: {str(e)}")
        return None
