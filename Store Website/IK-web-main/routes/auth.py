"""
Authentication routes for the Inci Gold e-commerce platform.

This module handles user authentication including login, registration, logout,
password reset, and profile management with proper security measures.
"""

import secrets
from datetime import datetime, timedelta
import logging
import os

from flask import Blueprint, flash, redirect, render_template, request, session, url_for
from flask_login import current_user, login_required, login_user, logout_user

from models import Cart, CartItem, Product, User, db, Order
from utils.email_utils import send_password_reset_email, send_welcome_email
from utils.recaptcha import verify_recaptcha
from utils.validators import (sanitize_input, validate_email, validate_name,
                             validate_password, validate_phone, validate_username)

auth_bp = Blueprint('auth', __name__)

# Note: Rate limiting is now handled globally in app.py by Flask-Limiter.
# The local limiter instance has been removed to avoid conflicts and centralize configuration.

def _merge_guest_cart_to_db(user):
    """Merge guest cart from session to user's database cart"""
    guest_cart_data = session.get('cart', {})
    if not guest_cart_data:
        return

    user_cart = Cart.query.filter_by(user_id=user.id).first()
    if not user_cart:
        user_cart = Cart(user_id=user.id)
        db.session.add(user_cart)
        db.session.flush()

    for product_id_str, quantity in guest_cart_data.items():
        product_id = int(product_id_str)
        product = Product.query.get(product_id)

        if product and product.is_active:
            existing_item = CartItem.query.filter_by(cart_id=user_cart.id, product_id=product_id).first()
            
            if existing_item:
                # Ürün zaten varsa, miktarları topla (stok kontrolü yaparak)
                new_quantity = existing_item.quantity + quantity
                if product.stock_quantity >= new_quantity:
                    existing_item.quantity = new_quantity
                else:
                    # Stok yetersizse, maksimum stok kadar ekle
                    existing_item.quantity = product.stock_quantity
            else:
                # Ürün yoksa, yeni öğe olarak ekle (stok kontrolü yaparak)
                if product.stock_quantity >= quantity:
                    new_item = CartItem(
                        cart_id=user_cart.id,
                        product_id=product_id,
                        quantity=quantity,
                        price=product.price
                    )
                    db.session.add(new_item)

    try:
        db.session.commit()
        # Misafir sepetini temizle
        session.pop('cart', None)
        flash('Misafir sepetiniz hesabınıza aktarıldı.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Sepetiniz aktarılırken bir sorun oluştu.', 'error')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login with rate limiting and security validation."""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        try:
            email = request.form.get('email', '').strip().lower()
            password = request.form.get('password', '')
            remember_me = request.form.get('remember_me') == 'on'
            recaptcha_token = request.form.get('g-recaptcha-response')
            
            if os.getenv('FLASK_ENV') != 'development':
                is_valid, _, error_msg = verify_recaptcha(recaptcha_token, 'login', 0.5)
                if not is_valid:
                    flash(f'Güvenlik doğrulaması başarısız: {error_msg}', 'error')
                    return render_template('auth/login.html')
            
            if not email or not password:
                flash('Email ve şifre gereklidir.', 'error')
                return render_template('auth/login.html')
            
            user = User.query.filter_by(email=email).first()
            
            if not user or not user.check_password(password):
                flash('Geçersiz e-posta veya şifre.', 'error')
                return render_template('auth/login.html')
            
            if not user.is_active:
                flash('Hesabınız deaktif edilmiştir. Lütfen yönetici ile iletişime geçin.', 'error')
                return render_template('auth/login.html')
            
            login_user(user, remember=remember_me)
            
            _merge_guest_cart_to_db(user)
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            
            flash(f'Hoş geldiniz, {user.first_name}!', 'success')
            return redirect(url_for('admin.dashboard') if user.is_admin else url_for('main.index'))
                
        except Exception as e:
            logging.error(f"Login error: {e}", exc_info=True)
            flash('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.', 'error')
    
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Kullanıcı kaydı"""
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        try:
            form_data = {
                'first_name': sanitize_input(request.form.get('first_name', '').strip()),
                'last_name': sanitize_input(request.form.get('last_name', '').strip()),
                'email': request.form.get('email', '').strip().lower(),
                'username': request.form.get('username', '').strip().lower(),
                'password': request.form.get('password', ''),
                'password_confirm': request.form.get('password_confirm', ''),
                'phone': sanitize_input(request.form.get('phone', '').strip()),
                'terms_accepted': request.form.get('terms_accepted') == 'on'
            }
            recaptcha_token = request.form.get('g-recaptcha-response')
            
            errors = _validate_registration_form(form_data)

            if os.getenv('FLASK_ENV') != 'development':
                is_valid, _, error_msg = verify_recaptcha(recaptcha_token, 'register', 0.5)
                if not is_valid:
                    errors.append(f'Güvenlik doğrulaması başarısız: {error_msg}')
            
            if errors:
                for error in errors:
                    flash(error, 'error')
                return render_template('auth/register.html')
            
            user = User(
                first_name=form_data['first_name'],
                last_name=form_data['last_name'],
                email=form_data['email'],
                username=form_data['username'],
                phone=form_data['phone'],
                is_active=True
            )
            user.set_password(form_data['password'])
            
            db.session.add(user)
            db.session.flush()
            
            cart = Cart(user_id=user.id)
            db.session.add(cart)
            
            db.session.commit()
            
            try:
                send_welcome_email(user)
            except Exception as email_error:
                logging.error(f"Welcome email error: {email_error}", exc_info=True)
            
            login_user(user)
            
            _merge_guest_cart_to_db(user)
            
            flash('Hesabınız başarıyla oluşturuldu. Hoş geldiniz!', 'success')
            return redirect(url_for('main.index'))
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Registration error: {e}", exc_info=True)
            flash('Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.', 'error')
    
    return render_template('auth/register.html')

def _validate_registration_form(data):
    """Helper function to validate registration form data."""
    errors = []
    validators = {
        'first_name': (validate_name, "Ad"),
        'last_name': (validate_name, "Soyad"),
        'email': (validate_email, ),
        'username': (validate_username, ),
        'password': (validate_password, ),
        'phone': (validate_phone, )
    }

    for field, (validator, *args) in validators.items():
        is_valid, error_msg = validator(data.get(field, ''), *args)
        if not is_valid:
            errors.append(error_msg)

    if data.get('password') != data.get('password_confirm'):
        errors.append('Şifreler eşleşmiyor.')
    
    if not data.get('terms_accepted'):
        errors.append('Kullanım şartlarını kabul etmelisiniz.')
        
    if User.query.filter_by(email=data.get('email')).first():
        errors.append('Bu e-posta adresi zaten kayıtlı.')
    if User.query.filter_by(username=data.get('username')).first():
        errors.append('Bu kullanıcı adı zaten alınmış.')
        
    return errors

@auth_bp.route('/logout')
@login_required
def logout():
    """Kullanıcı çıkışı"""
    logout_user()
    flash('Başarıyla çıkış yaptınız.', 'info')
    return redirect(url_for('main.index'))

@auth_bp.route('/profile')
@login_required
def profile():
    """Kullanıcı profili"""
    return render_template('auth/profile.html')

@auth_bp.route('/profile/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    """Profil düzenleme"""
    if request.method == 'POST':
        try:
            current_user.first_name = request.form.get('first_name', '').strip()
            current_user.last_name = request.form.get('last_name', '').strip()
            current_user.phone = request.form.get('phone', '').strip()
            current_user.address = request.form.get('address', '').strip()
            current_user.city = request.form.get('city', '').strip()
            current_user.postal_code = request.form.get('postal_code', '').strip()
            
            db.session.commit()
            flash('Profiliniz başarıyla güncellendi.', 'success')
            return redirect(url_for('auth.profile'))
        except Exception as e:
            db.session.rollback()
            flash('Profil güncellenirken bir hata oluştu.', 'error')
            logging.error(f"Profile update error: {e}", exc_info=True)
    return render_template('auth/edit_profile.html')

@auth_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    """Şifre değiştirme"""
    if request.method == 'POST':
        try:
            current_password = request.form.get('current_password', '')
            new_password = request.form.get('new_password', '')
            new_password_confirm = request.form.get('new_password_confirm', '')
            
            if not current_user.check_password(current_password):
                flash('Mevcut şifreniz yanlış.', 'error')
                return render_template('auth/change_password.html')
            
            valid_password, password_error = validate_password(new_password)
            if not valid_password:
                flash(password_error, 'error')
                return render_template('auth/change_password.html')
            
            if new_password != new_password_confirm:
                flash('Yeni şifreler eşleşmiyor.', 'error')
                return render_template('auth/change_password.html')
            
            current_user.set_password(new_password)
            db.session.commit()
            
            flash('Şifreniz başarıyla değiştirildi.', 'success')
            return redirect(url_for('auth.profile'))
        except Exception as e:
            db.session.rollback()
            flash('Şifre değiştirilirken bir hata oluştu.', 'error')
            logging.error(f"Password change error: {e}", exc_info=True)
    return render_template('auth/change_password.html')

@auth_bp.route('/orders')
@login_required
def orders():
    """Kullanıcının siparişleri"""
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('auth/orders.html', orders=orders)

@auth_bp.route('/orders/<int:order_id>')
@login_required
def order_detail(order_id):
    """Sipariş detayı"""
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    return render_template('auth/order_detail.html', order=order)

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Şifre sıfırlama talebi"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        
        if not email:
            flash('Email adresi gereklidir.', 'error')
            return render_template('auth/forgot_password.html')
        
        user = User.query.filter_by(email=email).first()
        if user:
            # Token oluştur ve veritabanına kaydet
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            
            send_password_reset_email(user, token)
            
            flash('Şifre sıfırlama bağlantısı email adresinize gönderildi.', 'success')
            return redirect(url_for('auth.login'))
        else:
            flash('Bu email adresi kayıtlı değil.', 'error')
    
    return render_template('auth/forgot_password.html')

@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """Şifre sıfırlama"""
    user = User.query.filter_by(reset_token=token).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        flash('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.', 'danger')
        return redirect(url_for('auth.forgot_password'))
    
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        valid_password, password_error = validate_password(password)
        if not valid_password:
            flash(password_error, 'danger')
            return render_template('auth/reset_password.html', token=token)

        if password != confirm_password:
            flash('Şifreler eşleşmiyor.', 'danger')
            return render_template('auth/reset_password.html', token=token)
        
        user.set_password(password)
        user.reset_token = None
        user.reset_token_expires = None
        db.session.commit()
        
        flash('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/reset_password.html', token=token)
