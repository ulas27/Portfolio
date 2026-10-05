"""
Email utilities for the Inci Gold e-commerce platform.

This module handles email sending functionality including order confirmations,
welcome emails, password reset emails, and newsletter management.
"""

import os
from threading import Thread

from flask import current_app, render_template, request, url_for
from flask_mail import Mail, Message

mail = Mail()

def send_async_email(app, msg):
    """Asenkron email gönderimi"""
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            import logging
            logging.error(f"Email gönderim hatası: {e}")

def send_email(to, subject, template, **kwargs):
    """Email gönder"""
    try:
        msg = Message(
            subject=subject,
            recipients=[to],
            html=render_template(template, **kwargs),
            sender=current_app.config.get('MAIL_DEFAULT_SENDER')
        )
        
        # Asenkron gönder
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
        return True
    except Exception as e:
        import logging
        logging.error(f"Email hazırlama hatası: {e}")
        return False

def send_order_confirmation(order):
    """Sipariş onay emaili"""
    return send_email(
        to=order.customer.email,
        subject=f'Sipariş Onayı - {order.order_number}',
        template='emails/order_confirmation.html',
        order=order
    )

def send_order_status_update(order):
    """Sipariş durum güncelleme emaili"""
    return send_email(
        to=order.customer.email,
        subject=f'Sipariş Durumu Güncellendi - {order.order_number}',
        template='emails/order_status_update.html',
        order=order
    )

def send_welcome_email(user):
    """Hoş geldin emaili"""
    return send_email(
        to=user.email,
        subject='Hoş Geldiniz!',
        template='emails/welcome.html',
        user=user
    )

def send_password_reset_email(user, token):
    """Şifre sıfırlama emaili"""
    return send_email(
        to=user.email,
        subject='Şifre Sıfırlama',
        template='emails/password_reset.html',
        user=user,
        token=token
    )

def send_contact_confirmation_email(contact_message):
    """İletişim talebi onay emaili gönder"""
    try:
        send_email(
            to=contact_message.email,
            subject=f'Referans No: {contact_message.ticket_number} - İletişim Talebiniz Alındı',
            template='emails/contact_confirmation.html',
            name=contact_message.name,
            email=contact_message.email,
            phone=contact_message.phone,
            message_subject=contact_message.subject,
            message=contact_message.message,
            ticket_number=contact_message.ticket_number,
            created_at=contact_message.created_at.strftime('%d.%m.%Y %H:%M') if contact_message.created_at else ''
        )
        return True
    except Exception as e:
        import logging
        logging.error(f"İletişim onay email hatası: {e}")
        return False

def send_order_confirmation_email(order):
    """Sipariş onay emaili gönder"""
    try:
        # Misafir veya kullanıcı emaili
        email = order.guest_email if order.guest_email else order.customer.email
        name = f"{order.shipping_first_name} {order.shipping_last_name}" if order.shipping_first_name else "Değerli Müşterimiz"
        
        send_email(
            to=email,
            subject=f'Sipariş Onayı - {order.order_number}',
            template='emails/order_confirmation.html',
            name=name,
            order_number=order.order_number,
            order_date=order.created_at.strftime('%d.%m.%Y %H:%M') if order.created_at else '',
            total_amount=order.total_amount,
            shipping_address=f"{order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}",
            payment_method=order.payment_method,
            items=order.items,
            user_id=order.user_id
        )
        return True
    except Exception as e:
        import logging
        logging.error(f"Sipariş onay email hatası: {e}")
        return False

def send_welcome_email_with_password(user, password):
    """Şifre ile hoş geldin emaili gönder"""
    try:
        send_email(
            to=user.email,
            subject='İnci Gold - Hesabınız Oluşturuldu',
            template='emails/welcome_with_password.html',
            name=user.full_name,
            username=user.username,
            password=password,
            login_url=url_for('auth.login', _external=True)
        )
        return True
    except Exception as e:
        import logging
        logging.error(f"Hoş geldin email hatası: {e}")
        return False

def send_order_status_update_email(order, status, tracking_number=None, shipping_company=None, estimated_delivery=None):
    """Sipariş durum güncelleme emaili gönder"""
    try:
        # Misafir veya kullanıcı emaili
        email = order.guest_email if order.guest_email else order.customer.email
        name = f"{order.shipping_first_name} {order.shipping_last_name}" if order.shipping_first_name else "Değerli Müşterimiz"
        
        # Durum mesajları
        status_messages = {
            'confirmed': 'Siparişiniz Onaylandı',
            'processing': 'Siparişiniz Hazırlanıyor',
            'shipped': 'Siparişiniz Kargoya Verildi',
            'delivered': 'Siparişiniz Teslim Edildi'
        }
        
        subject = f'{status_messages.get(status, "Sipariş Durumu Güncellendi")} - {order.order_number}'
        
        send_email(
            to=email,
            subject=subject,
            template='emails/order_status_update.html',
            name=name,
            order_number=order.order_number,
            status=status,
            update_date=order.updated_at.strftime('%d.%m.%Y %H:%M') if order.updated_at else order.created_at.strftime('%d.%m.%Y %H:%M'),
            tracking_number=tracking_number,
            shipping_company=shipping_company,
            estimated_delivery=estimated_delivery
        )
        return True
    except Exception as e:
        import logging
        logging.error(f"Sipariş durum güncelleme email hatası: {e}")
        return False

def send_newsletter_email(to, subject, template, **kwargs):
    """Newsletter emaili gönder"""
    try:
        send_email(
            to=to,
            subject=subject,
            template=template,
            **kwargs
        )
        return True
    except Exception as e:
        import logging
        logging.error(f"Newsletter email hatası: {e}")
        return False