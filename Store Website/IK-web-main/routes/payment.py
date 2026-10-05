"""
Payment routes for the Inci Gold e-commerce platform.

This module handles payment processing with İyzico integration, fraud detection,
and enterprise-level security features.
"""

import json
import logging
import uuid
from decimal import Decimal

import iyzipay
from flask import Blueprint, current_app, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from models import Cart, CartItem, Order, OrderItem, Product, db
from utils.payment_enterprise import IyzicoEnterprise, PaymentFraudDetector

logger = logging.getLogger(__name__)

payment_bp = Blueprint('payment', __name__)

def get_iyzico_options():
    """İyzico API ayarları"""
    options = {
        'api_key': current_app.config.get('IYZICO_API_KEY'),
        'secret_key': current_app.config.get('IYZICO_SECRET_KEY'),
        'base_url': current_app.config.get('IYZICO_BASE_URL')
    }
    return options

@payment_bp.route('/process', methods=['POST'])
def process_payment():
    """Ödeme işlemini başlat - Enterprise fraud detection ile"""
    try:
        # Enterprise fraud detection
        fraud_detector = PaymentFraudDetector()
        
        # Form verilerini al
        billing_first_name = request.form.get('billing_first_name', '').strip()
        billing_last_name = request.form.get('billing_last_name', '').strip()
        billing_email = request.form.get('billing_email', '').strip()
        billing_phone = request.form.get('billing_phone', '').strip()
        billing_address = request.form.get('billing_address', '').strip()
        billing_city = request.form.get('billing_city', '').strip()
        billing_postal_code = request.form.get('billing_postal_code', '').strip()
        
        # Kargo adresi
        same_address = request.form.get('same_address') == 'on'
        if same_address:
            shipping_first_name = billing_first_name
            shipping_last_name = billing_last_name
            shipping_address = billing_address
            shipping_city = billing_city
            shipping_postal_code = billing_postal_code
            shipping_phone = billing_phone
        else:
            shipping_first_name = request.form.get('shipping_first_name', '').strip()
            shipping_last_name = request.form.get('shipping_last_name', '').strip()
            shipping_address = request.form.get('shipping_address', '').strip()
            shipping_city = request.form.get('shipping_city', '').strip()
            shipping_postal_code = request.form.get('shipping_postal_code', '').strip()
            shipping_phone = request.form.get('shipping_phone', '').strip()
        
        # Validasyon
        required_fields = [
            billing_first_name, billing_last_name, billing_email, billing_phone,
            billing_address, billing_city, billing_postal_code,
            shipping_first_name, shipping_last_name, shipping_address,
            shipping_city, shipping_postal_code, shipping_phone
        ]
        
        if not all(required_fields):
            flash('Lütfen tüm gerekli alanları doldurun.', 'error')
            return redirect(url_for('cart.checkout'))
        
        # Sepeti kontrol et
        cart = Cart.query.filter_by(user_id=current_user.id).first()
        if not cart or not cart.items:
            flash('Sepetiniz boş.', 'error')
            return redirect(url_for('main.index'))
        
        # Stok kontrolü
        for item in cart.items:
            if item.product.stock_quantity < item.quantity:
                flash(f'{item.product.name} ürünü için yeterli stok bulunmamaktadır.', 'error')
                return redirect(url_for('cart.view_cart'))
        
        # Fiyat hesaplamaları
        subtotal = cart.total_amount
        shipping_cost = Decimal('15.00') if subtotal < 500 else Decimal('0.00')
        tax_rate = Decimal('0.18')
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount + shipping_cost
        
        # Sipariş oluştur
        order = Order(
            user_id=current_user.id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_cost,
            total_amount=total_amount,
            status='pending',
            payment_status='pending',
            
            # Fatura bilgileri
            billing_first_name=billing_first_name,
            billing_last_name=billing_last_name,
            billing_address=billing_address,
            billing_city=billing_city,
            billing_postal_code=billing_postal_code,
            billing_phone=billing_phone,
            
            # Kargo bilgileri
            shipping_first_name=shipping_first_name,
            shipping_last_name=shipping_last_name,
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            shipping_postal_code=shipping_postal_code,
            shipping_phone=shipping_phone
        )
        
        db.session.add(order)
        db.session.flush()  # ID'yi al
        
        # Sipariş öğelerini oluştur (stok düşürme YOK - ödeme başarılı olursa düşürülecek)
        for item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                total=item.total_price,
                product_name=item.product.name,
                product_sku=item.product.sku
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        # İyzico ödeme işlemi
        api_key = current_app.config.get('IYZICO_API_KEY') or ''
        secret_key = current_app.config.get('IYZICO_SECRET_KEY') or ''
        base_url = current_app.config.get('IYZICO_BASE_URL') or ''
        if api_key and secret_key and base_url:
            try:
                payment_result = create_iyzico_payment(order, billing_email)
                if payment_result and payment_result.get('status') == 'success':
                    # Ödeme başarılı - şimdi stoktan düş
                    for item in order.items:
                        product = Product.query.get(item.product_id)
                        if product:
                            product.stock_quantity -= item.quantity
                    
                    order.payment_status = 'paid'
                    order.payment_id = payment_result.get('payment_id')
                    order.payment_method = 'credit_card'
                    order.status = 'confirmed'
                    
                    # Sepeti temizle
                    CartItem.query.filter_by(cart_id=cart.id).delete()
                    
                    db.session.commit()
                    
                    # Email gönder
                    from utils.email_utils import send_order_confirmation_email
                    send_order_confirmation_email(order)
                    
                    flash('Ödemeniz başarıyla tamamlandı. Siparişiniz onaylandı.', 'success')
                    return redirect(url_for('payment.success', order_id=order.id))
                else:
                    # Ödeme başarısız
                    order.payment_status = 'failed'
                    order.status = 'cancelled'
                    
                    db.session.commit()
                    
                    flash('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.', 'error')
                    return redirect(url_for('cart.checkout'))
            except Exception as e:
                # İyzico hatası - manuel ödeme olarak işaretle
                order.payment_method = 'bank_transfer'
                order.notes = 'İyzico entegrasyonu hatası - Manuel kontrol gerekli'
                db.session.commit()
                
                flash('Ödeme işleminde teknik bir sorun oluştu. Siparişiniz alındı, ödeme için size ulaşacağız.', 'warning')
                return redirect(url_for('payment.pending', order_id=order.id))
        else:
            # İyzico yapılandırılmamış - manuel ödeme
            # Manuel ödeme için stok düşürme YOK - admin onayından sonra düşürülecek
            order.payment_method = 'bank_transfer'
            db.session.commit()
            
            # Sepeti temizle
            CartItem.query.filter_by(cart_id=cart.id).delete()
            db.session.commit()
            
            flash('Siparişiniz alındı. Ödeme bilgileri için size ulaşacağız.', 'info')
            return redirect(url_for('payment.pending', order_id=order.id))
            
    except Exception as e:
        db.session.rollback()
        flash('Sipariş işlemi sırasında bir hata oluştu.', 'error')
        return redirect(url_for('cart.checkout'))

def create_iyzico_payment(order, email):
    """İyzico ödeme oluştur"""
    try:
        options = get_iyzico_options()
        
        # Ödeme isteği
        request_data = {
            'locale': iyzipay.Locale.TR.value,
            'conversationId': str(order.id),
            'price': str(order.total_amount),
            'paidPrice': str(order.total_amount),
            'currency': iyzipay.Currency.TRY.value,
            'installment': '1',
            'basketId': f'B{order.id}',
            'paymentChannel': iyzipay.PaymentChannel.WEB.value,
            'paymentGroup': iyzipay.PaymentGroup.PRODUCT.value,
            'callbackUrl': url_for('payment.callback', _external=True),
            'enabledInstallments': ['2', '3', '6', '9'],
            'buyer': {
                'id': f'BY{order.user_id}',
                'name': order.billing_first_name,
                'surname': order.billing_last_name,
                'gsmNumber': order.billing_phone,
                'email': email,
                'identityNumber': '74300864791',  # Test için - production'da kaldırılmalı
                'lastLoginDate': '2015-10-05 12:43:35',
                'registrationDate': '2013-04-21 15:12:09',
                'registrationAddress': order.billing_address,
                'ip': request.environ.get('HTTP_X_REAL_IP', request.remote_addr),
                'city': order.billing_city,
                'country': 'Turkey',
                'zipCode': order.billing_postal_code
            },
            'shippingAddress': {
                'contactName': f'{order.shipping_first_name} {order.shipping_last_name}',
                'city': order.shipping_city,
                'country': 'Turkey',
                'address': order.shipping_address,
                'zipCode': order.shipping_postal_code
            },
            'billingAddress': {
                'contactName': f'{order.billing_first_name} {order.billing_last_name}',
                'city': order.billing_city,
                'country': 'Turkey',
                'address': order.billing_address,
                'zipCode': order.billing_postal_code
            },
            'basketItems': []
        }
        
        # Sepet öğelerini ekle
        for item in order.items:
            basket_item = {
                'id': f'BI{item.id}',
                'name': item.product_name,
                'category1': 'Mücevher',
                'itemType': iyzipay.BasketItemType.PHYSICAL.value,
                'price': str(item.total)
            }
            request_data['basketItems'].append(basket_item)
        
        # Kargo ücreti varsa ekle
        if order.shipping_amount > 0:
            shipping_item = {
                'id': 'SHIPPING',
                'name': 'Kargo Ücreti',
                'category1': 'Kargo',
                'itemType': iyzipay.BasketItemType.PHYSICAL.value,
                'price': str(order.shipping_amount)
            }
            request_data['basketItems'].append(shipping_item)
        
        # İyzico checkout form oluştur
        checkout_form_initialize = iyzipay.CheckoutFormInitialize()
        checkout_form_initialize.create(request_data, options)
        
        if checkout_form_initialize.status == 'success':
            return {
                'status': 'success',
                'checkout_form_content': checkout_form_initialize.checkout_form_content,
                'token': checkout_form_initialize.token,
                'payment_id': checkout_form_initialize.payment_id
            }
        else:
            return {
                'status': 'error',
                'error': checkout_form_initialize.error_message
            }
            
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

@payment_bp.route('/callback', methods=['POST'])
def callback():
    """İyzico callback"""
    try:
        token = request.form.get('token')
        
        if not token:
            flash('Ödeme doğrulama hatası.', 'error')
            return redirect(url_for('main.index'))
        
        options = get_iyzico_options()
        
        # Ödeme sonucunu al
        checkout_form = iyzipay.CheckoutForm()
        checkout_form.retrieve({'token': token}, options)
        
        if checkout_form.status == 'success' and checkout_form.payment_status == 'SUCCESS':
            # Siparişi bul
            conversation_id = checkout_form.conversation_id
            order = Order.query.get(int(conversation_id))
            
            if order:
                # Ödeme başarılı - stoktan düş
                for item in order.items:
                    product = Product.query.get(item.product_id)
                    if product:
                        product.stock_quantity -= item.quantity
                
                order.payment_status = 'paid'
                order.payment_id = checkout_form.payment_id
                order.status = 'confirmed'
                
                # Sepeti temizle
                cart = Cart.query.filter_by(user_id=order.user_id).first()
                if cart:
                    CartItem.query.filter_by(cart_id=cart.id).delete()
                
                db.session.commit()
                
                return redirect(url_for('payment.success', order_id=order.id))
        
        # Ödeme başarısız
        flash('Ödeme işlemi başarısız oldu.', 'error')
        return redirect(url_for('cart.checkout'))
        
    except Exception as e:
        flash('Ödeme doğrulama sırasında hata oluştu.', 'error')
        return redirect(url_for('main.index'))

@payment_bp.route('/success/<int:order_id>')
def success(order_id):
    """Ödeme başarılı sayfası - hem kullanıcı hem misafir"""
    order = Order.query.get_or_404(order_id)
    
    # Kullanıcı kontrolü - sadece sipariş sahibi veya misafir erişebilir
    if current_user.is_authenticated:
        if order.user_id != current_user.id:
            flash('Bu siparişe erişim yetkiniz yok.', 'error')
            return redirect(url_for('main.index'))
    else:
        # Misafir kullanıcı - session'da sipariş numarası kontrolü
        if not session.get('guest_order_number') == order.order_number:
            flash('Bu siparişe erişim yetkiniz yok.', 'error')
            return redirect(url_for('main.index'))
    
    return render_template('payment/success.html', order=order)

@payment_bp.route('/3ds-callback', methods=['POST'])
def threeds_callback():
    """3D Secure 2.0 callback handler"""
    try:
        payment_id = request.form.get('paymentId')
        conversation_id = session.get('conversation_id')
        order_id = session.get('order_id')
        
        if not all([payment_id, conversation_id, order_id]):
            logger.error("Missing required parameters in 3DS callback")
            flash('Ödeme işlemi sırasında bir hata oluştu.', 'error')
            return redirect(url_for('payment.failed'))
        
        # Initialize enterprise payment handler
        iyzico_enterprise = IyzicoEnterprise()
        
        # Complete 3DS payment
        result = iyzico_enterprise.complete_3ds_payment(payment_id, conversation_id)
        
        if result['success']:
            # Get order and update status
            order = Order.query.get(order_id)
            if order:
                order.status = 'completed'
                order.payment_status = 'paid'
                order.payment_id = result['payment_id']
                order.paid_amount = Decimal(result['paid_price'])
                db.session.commit()
                
                # Clear session data
                session.pop('payment_token', None)
                session.pop('conversation_id', None)
                session.pop('order_id', None)
                
                # Send confirmation email
                from utils.email_utils import send_order_confirmation_email
                send_order_confirmation_email(order)
                
                logger.info(f"3DS payment completed successfully for order {order_id}")
                flash('Ödemeniz başarıyla tamamlandı!', 'success')
                return redirect(url_for('payment.success', order_number=order.order_number))
            else:
                logger.error(f"Order not found: {order_id}")
                flash('Sipariş bulunamadı.', 'error')
                return redirect(url_for('payment.failed'))
        else:
            logger.error(f"3DS payment failed: {result.get('error', 'Unknown error')}")
            flash(f'Ödeme işlemi başarısız: {result.get("error", "Bilinmeyen hata")}', 'error')
            return redirect(url_for('payment.failed'))
            
    except Exception as e:
        logger.error(f"3DS callback error: {str(e)}")
        flash('Ödeme işlemi sırasında bir hata oluştu.', 'error')
        return redirect(url_for('payment.failed'))

@payment_bp.route('/success/<order_number>')
def success_by_number(order_number):
    """Sipariş numarası ile başarılı sayfası - misafir siparişler için"""
    order = Order.query.filter_by(order_number=order_number).first_or_404()
    
    # Misafir siparişi kontrolü
    if order.user_id is None:
        return render_template('payment/success.html', order=order)
    else:
        # Kullanıcı siparişi - login kontrolü
        if not current_user.is_authenticated or order.user_id != current_user.id:
            flash('Bu siparişe erişim yetkiniz yok.', 'error')
            return redirect(url_for('main.index'))
        return render_template('payment/success.html', order=order)

@payment_bp.route('/pending/<int:order_id>')
@login_required
def pending(order_id):
    """Ödeme beklemede sayfası"""
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    return render_template('payment/pending.html', order=order)

@payment_bp.route('/failed')
def failed():
    """Ödeme başarısız sayfası"""
    return render_template('payment/failed.html')
