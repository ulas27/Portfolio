"""
Cart routes for the Inci Gold e-commerce platform.

This module handles shopping cart functionality for both authenticated users
and guests with proper session management and rate limiting.
"""

import logging
import secrets
import string
from decimal import Decimal
import re

from flask import Blueprint, flash, jsonify, redirect, render_template, request, session, url_for
from flask_login import current_user

from models import Cart, CartItem, Order, OrderItem, Product, User, db
from utils.email_utils import send_order_confirmation_email, send_welcome_email_with_password

cart_bp = Blueprint('cart', __name__, url_prefix='/cart')
logger = logging.getLogger(__name__)

def _get_cart_data():
    """
    Retrieves detailed cart data for both authenticated users and guests.
    Returns a tuple: (list of items, subtotal).
    Items are dicts for guests and CartItem objects for users.
    """
    cart_items_detailed = []
    subtotal = Decimal('0.00')

    if current_user.is_authenticated and hasattr(current_user, 'cart') and current_user.cart:
        cart_items_detailed = sorted(current_user.cart.items, key=lambda item: item.created_at)
        subtotal = current_user.cart.total_amount or Decimal('0.00')
    else:
        guest_cart = session.get('cart', {})
        if guest_cart:
            product_ids = [int(pid) for pid in guest_cart.keys()]
            products = Product.query.filter(Product.id.in_(product_ids)).all()
            product_map = {str(p.id): p for p in products}

            for product_id_str, quantity in guest_cart.items():
                product = product_map.get(product_id_str)
                if product:
                    total_price = product.price * quantity
                    cart_items_detailed.append({
                        'product': product,
                        'quantity': quantity,
                        'price': product.price,
                        'total_price': total_price,
                        'id': product.id
                    })
                    subtotal += total_price
            cart_items_detailed.sort(key=lambda item: item['id'])
            
    return cart_items_detailed, subtotal

@cart_bp.route('/')
def view_cart():
    """Display the cart page for both registered users and guests."""
    cart_items, subtotal = _get_cart_data()
    return render_template('cart/view.html', cart_items=cart_items, subtotal=subtotal)

@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    """Add a product to the cart for both registered users and guests."""
    try:
        product_id = request.form.get('product_id', type=int)
        quantity = request.form.get('quantity', type=int, default=1)
        
        if not product_id or quantity <= 0:
            return jsonify({'success': False, 'message': 'Geçersiz ürün veya miktar.'}), 400
        
        product = Product.query.filter_by(id=product_id, is_active=True).first()
        if not product:
            return jsonify({'success': False, 'message': 'Ürün bulunamadı.'}), 404

        cart_count = 0
        if current_user.is_authenticated:
            cart = current_user.cart
            if not cart:
                cart = Cart(user_id=current_user.id)
                db.session.add(cart)
                db.session.flush()
            
            existing_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
            
            new_quantity = (existing_item.quantity if existing_item else 0) + quantity
            if product.stock_quantity < new_quantity:
                return jsonify({'success': False, 'message': 'Stok miktarını aştınız.'}), 400

            if existing_item:
                existing_item.quantity = new_quantity
            else:
                cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity, price=product.price)
                db.session.add(cart_item)
            
            db.session.commit()
            cart_count = cart.total_items
        else:
            guest_cart = session.get('cart', {})
            product_id_str = str(product_id)
            current_quantity = guest_cart.get(product_id_str, 0)
            new_quantity = current_quantity + quantity

            if product.stock_quantity < new_quantity:
                return jsonify({'success': False, 'message': 'Stok miktarını aştınız.'}), 400

            guest_cart[product_id_str] = new_quantity
            session['cart'] = guest_cart
            session.modified = True
            cart_count = sum(guest_cart.values())

        return jsonify({'success': True, 'message': 'Ürün sepete eklendi.', 'cart_count': cart_count})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding to cart: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Sepete eklenirken bir hata oluştu.'}), 500

@cart_bp.route('/update', methods=['POST'])
def update_cart():
    """Update cart item quantity for both guests and registered users."""
    try:
        item_id = request.form.get('item_id', type=int)
        quantity = request.form.get('quantity', type=int)
        
        if item_id is None or quantity is None or quantity < 0:
            return jsonify({'success': False, 'message': 'Geçersiz parametreler.'}), 400
        
        if current_user.is_authenticated:
            cart_item = CartItem.query.join(Cart).filter(CartItem.id == item_id, Cart.user_id == current_user.id).first_or_404()
            
            if quantity == 0:
                db.session.delete(cart_item)
            else:
                if cart_item.product.stock_quantity < quantity:
                    return jsonify({'success': False, 'message': 'Yeterli stok bulunmamaktadır.'}), 400
                cart_item.quantity = quantity
            db.session.commit()
        else:
            guest_cart = session.get('cart', {})
            product_id_str = str(item_id)
            if product_id_str not in guest_cart:
                return jsonify({'success': False, 'message': 'Sepet öğesi bulunamadı.'}), 404
            
            if quantity == 0:
                del guest_cart[product_id_str]
            else:
                product = Product.query.get_or_404(item_id)
                if product.stock_quantity < quantity:
                    return jsonify({'success': False, 'message': 'Yeterli stok bulunmamaktadır.'}), 400
                guest_cart[product_id_str] = quantity
            session['cart'] = guest_cart
            session.modified = True

        cart_items, subtotal = _get_cart_data()
        cart_count = sum(item.quantity if isinstance(item, CartItem) else item['quantity'] for item in cart_items)

        return jsonify({'success': True, 'message': 'Sepet güncellendi.', 'cart_total': float(subtotal), 'cart_count': cart_count})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating cart: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Sepet güncellenirken bir hata oluştu.'}), 500

@cart_bp.route('/remove', methods=['POST'])
def remove_from_cart():
    """Remove an item from the cart for both guests and registered users."""
    try:
        item_id = request.form.get('item_id', type=int)
        if item_id is None:
            return jsonify({'success': False, 'message': "Geçersiz öğe ID'si."}), 400
        
        if current_user.is_authenticated:
            cart_item = CartItem.query.join(Cart).filter(CartItem.id == item_id, Cart.user_id == current_user.id).first_or_404()
            db.session.delete(cart_item)
            db.session.commit()
        else:
            guest_cart = session.get('cart', {})
            product_id_str = str(item_id)
            if product_id_str in guest_cart:
                del guest_cart[product_id_str]
                session['cart'] = guest_cart
                session.modified = True
            else:
                return jsonify({'success': False, 'message': 'Sepet öğesi bulunamadı.'}), 404

        cart_items, subtotal = _get_cart_data()
        cart_count = sum(item.quantity if isinstance(item, CartItem) else item['quantity'] for item in cart_items)

        return jsonify({'success': True, 'message': 'Ürün sepetten çıkarıldı.', 'cart_total': float(subtotal), 'cart_count': cart_count})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error removing from cart: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Ürün çıkarılırken bir hata oluştu.'}), 500

@cart_bp.route('/clear', methods=['POST'])
def clear_cart():
    """Clear the entire cart for both guests and registered users."""
    try:
        if current_user.is_authenticated:
            if current_user.cart:
                CartItem.query.filter_by(cart_id=current_user.cart.id).delete()
                db.session.commit()
        else:
            session.pop('cart', None)
        
        return jsonify({'success': True, 'message': 'Sepet temizlendi.', 'cart_total': 0, 'cart_count': 0})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error clearing cart: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Sepet temizlenirken bir hata oluştu.'}), 500

@cart_bp.route('/checkout')
def checkout():
    """Display the checkout page for both guests and registered users."""
    cart_items, subtotal = _get_cart_data()

    if not cart_items:
        flash('Ödeme yapmak için sepetinizde ürün bulunmalıdır.', 'warning')
        return redirect(url_for('shop.index'))
    
    for item in cart_items:
        product = item.product if isinstance(item, CartItem) else item['product']
        quantity = item.quantity if isinstance(item, CartItem) else item['quantity']
        if product.stock_quantity < quantity:
            flash(f'{product.name} ürünü için yeterli stok bulunmamaktadır.', 'error')
            return redirect(url_for('cart.view_cart'))
    
    shipping_cost = Decimal('29.99') if subtotal < 1000 else Decimal('0.00')
    tax_rate = Decimal('0.20')
    tax_amount = subtotal * tax_rate
    total_amount = subtotal + tax_amount + shipping_cost
    
    return render_template('cart/checkout.html', 
                         cart_items=cart_items,
                         subtotal=subtotal,
                         tax_amount=tax_amount,
                         shipping_cost=shipping_cost,
                         total_amount=total_amount,
                         is_guest=not current_user.is_authenticated)

def _generate_password(length=12):
    """Generate a secure random password."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def _create_order_from_cart(form_data, cart_items, subtotal, tax_amount, shipping_cost, total_amount, reduce_stock=False, user_id=None, guest_info=None):
    """A helper function to create an Order object from cart data."""
    order_data = {
        'subtotal': subtotal,
        'tax_amount': tax_amount,
        'shipping_amount': shipping_cost,
        'total_amount': total_amount,
        'payment_method': form_data.get('payment_method', 'kredi_karti'),
        'shipping_first_name': form_data.get('shipping_first_name'),
        'shipping_last_name': form_data.get('shipping_last_name'),
        'shipping_address': form_data.get('shipping_address'),
        'shipping_city': form_data.get('shipping_city'),
        'shipping_postal_code': form_data.get('shipping_postal_code'),
        'shipping_phone': form_data.get('shipping_phone'),
        'notes': form_data.get('notes', '')
    }
    order_data.update({
        'billing_first_name': form_data.get('billing_first_name', order_data['shipping_first_name']),
        'billing_last_name': form_data.get('billing_last_name', order_data['shipping_last_name']),
        'billing_address': form_data.get('billing_address', order_data['shipping_address']),
        'billing_city': form_data.get('billing_city', order_data['shipping_city']),
        'billing_postal_code': form_data.get('billing_postal_code', order_data['shipping_postal_code']),
        'billing_phone': form_data.get('billing_phone', order_data['shipping_phone'])
    })
    
    if user_id:
        order_data['user_id'] = user_id
    elif guest_info:
        order_data.update(guest_info)

    order = Order(**order_data)
    db.session.add(order)
    db.session.flush()

    for item in cart_items:
        product = item.product if isinstance(item, CartItem) else item['product']
        quantity = item.quantity if isinstance(item, CartItem) else item['quantity']
        
        order_item = OrderItem(
            order_id=order.id, product_id=product.id, quantity=quantity,
            price=product.price, total=product.price * quantity,
            product_name=product.name, product_sku=product.sku
        )
        db.session.add(order_item)
        
        if reduce_stock:
            product.stock_quantity -= quantity
    
    return order

@cart_bp.route('/process-guest-order', methods=['POST'])
def process_guest_order():
    """Process a guest order."""
    try:
        form_data = request.form.to_dict()
        cart_items, subtotal = _get_cart_data()
        
        if not cart_items:
            return jsonify({'success': False, 'message': 'Sepetinizde ürün bulunmamaktadır.'}), 400
        
        shipping_cost = Decimal('29.99') if subtotal < 1000 else Decimal('0.00')
        tax_amount = subtotal * Decimal('0.20')
        total_amount = subtotal + tax_amount + shipping_cost
        
        for item in cart_items:
            product = item['product']
            if product.stock_quantity < item['quantity']:
                return jsonify({'success': False, 'message': f'{product.name} ürünü için yeterli stok bulunmamaktadır.'}), 400
        
        guest_info = {'guest_email': form_data.get('email'), 'guest_phone': form_data.get('phone')}
        order = _create_order_from_cart(form_data, cart_items, subtotal, tax_amount, shipping_cost, total_amount, reduce_stock=False, guest_info=guest_info)
        
        from routes.payment import create_iyzico_payment
        payment_result = create_iyzico_payment(order, form_data.get('email'))
        
        if payment_result and payment_result.get('status') == 'success':
            for item in order.items:
                item.product.stock_quantity -= item.quantity
            
            order.payment_status = 'paid'
            order.payment_id = payment_result.get('payment_id')
            order.status = 'confirmed'
            db.session.commit()
            
            session.pop('cart', None)
            session['guest_order_number'] = order.order_number
            
            send_order_confirmation_email(order)
            
            return jsonify({
                'success': True, 
                'message': 'Ödemeniz başarıyla tamamlandı!',
                'redirect_url': url_for('payment.success_by_number', order_number=order.order_number)
            })
        else:
            order.payment_status = 'failed'
            order.status = 'cancelled'
            db.session.commit()
            return jsonify({'success': False, 'message': 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.'}), 400
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing guest order: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Sipariş oluşturulurken bir hata oluştu.'}), 500

@cart_bp.route('/create-account', methods=['POST'])
def create_account_from_order():
    """Create an account for a guest after a successful order."""
    try:
        data = request.get_json()
        email = data.get('email')
        order_number = data.get('order_number')
        
        if not email or not order_number or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'success': False, 'message': 'Geçerli bir email ve sipariş numarası giriniz.'}), 400
        
        order = Order.query.filter_by(order_number=order_number, guest_email=email).first()
        if not order:
            return jsonify({'success': False, 'message': 'Sipariş bulunamadı.'}), 404
        
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Bu email adresi zaten kayıtlı.'}), 409
        
        password = _generate_password()
        username = email.split('@')[0] + str(secrets.randbelow(1000))
        
        user = User(
            username=username, email=email,
            first_name=order.shipping_first_name or 'Misafir',
            last_name=order.shipping_last_name or 'Kullanıcı',
            phone=order.guest_phone, address=order.shipping_address,
            city=order.shipping_city, postal_code=order.shipping_postal_code,
            is_active=True, email_verified=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()
        
        order.user_id = user.id
        order.guest_email = None
        order.guest_phone = None
        db.session.commit()
        
        send_welcome_email_with_password(user, password)
        
        return jsonify({
            'success': True, 
            'message': 'Hesabınız başarıyla oluşturuldu! Giriş bilgileriniz email adresinize gönderildi.',
            'redirect_url': url_for('auth.login')
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating account from order: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Hesap oluşturulurken bir hata oluştu.'}), 500

@cart_bp.route('/api/count')
def api_cart_count():
    """API endpoint to get the number of items in the cart."""
    if current_user.is_authenticated:
        count = current_user.cart.total_items if current_user.cart else 0
    else:
        count = sum(session.get('cart', {}).values())
    return jsonify({'count': count})

@cart_bp.route('/api/items')
def api_cart_items():
    """API endpoint to get detailed cart items."""
    cart_items, subtotal = _get_cart_data()
    
    items_json = []
    for item in cart_items:
        if isinstance(item, CartItem):
            product = item.product
            item_data = {
                'id': item.id, 'product_id': product.id,
                'product_name': product.name, 'product_image_url': product.main_image_url,
                'price': float(item.price), 'quantity': item.quantity,
                'total': float(item.total_price)
            }
        else:
            product = item['product']
            item_data = {
                'id': product.id, 'product_id': product.id,
                'product_name': product.name, 'product_image_url': product.main_image_url,
                'price': float(item['price']), 'quantity': item['quantity'],
                'total': float(item['total_price'])
            }
        items_json.append(item_data)

    return jsonify({
        'items': items_json,
        'total': float(subtotal),
        'count': sum(item['quantity'] for item in items_json)
    })