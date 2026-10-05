"""
Newsletter management routes
"""

import logging
import secrets
from datetime import datetime

from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user

from models import NewsletterSubscriber, db
from utils.decorators import admin_required
from utils.email_utils import send_newsletter_email
from utils.validators import sanitize_html, validate_email

newsletter_bp = Blueprint('newsletter', __name__)
logger = logging.getLogger(__name__)


@newsletter_bp.route('/newsletter/subscribe', methods=['POST'])
def subscribe():
    """Handle newsletter subscription requests."""
    try:
        email = (request.form.get('email') or request.json.get('email', '')).strip().lower()
        
        is_valid, error_msg = validate_email(email)
        if not is_valid:
            return jsonify({'success': False, 'message': error_msg}), 400
        
        subscriber = NewsletterSubscriber.query.filter_by(email=email).first()
        if subscriber:
            if subscriber.is_active:
                return jsonify({'success': False, 'message': 'Bu email adresi zaten abone.'}), 409
            else:
                subscriber.is_active = True
                subscriber.subscribed_at = datetime.utcnow()
                message = 'Aboneliğiniz yeniden aktifleştirildi!'
        else:
            subscriber = NewsletterSubscriber(
                email=email, 
                unsubscribe_token=secrets.token_urlsafe(32)
            )
            db.session.add(subscriber)
            message = 'Newsletter aboneliğiniz başarıyla oluşturuldu!'
        
        db.session.commit()
        
        try:
            unsubscribe_url = url_for('newsletter.unsubscribe', token=subscriber.unsubscribe_token, _external=True)
            send_newsletter_email(
                to=email,
                subject='Newsletter Aboneliği Onaylandı',
                template='emails/newsletter_welcome.html',
                subscriber=subscriber,
                unsubscribe_url=unsubscribe_url
            )
        except Exception as e:
            logger.error(f"Newsletter welcome email error for {email}: {e}", exc_info=True)

        return jsonify({'success': True, 'message': message})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Newsletter subscription error: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Abonelik sırasında bir hata oluştu.'}), 500

@newsletter_bp.route('/newsletter/unsubscribe/<token>')
def unsubscribe(token):
    """Handle newsletter unsubscription requests."""
    try:
        subscriber = NewsletterSubscriber.query.filter_by(unsubscribe_token=token, is_active=True).first()
        
        if not subscriber:
            flash('Geçersiz veya süresi dolmuş abonelik iptal bağlantısı.', 'warning')
            return redirect(url_for('main.index'))
        
        subscriber.is_active = False
        subscriber.unsubscribed_at = datetime.utcnow()
        db.session.commit()
        
        flash('Newsletter aboneliğiniz başarıyla iptal edildi.', 'success')
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unsubscribe error for token {token}: {e}", exc_info=True)
        flash('Abonelik iptal edilirken bir hata oluştu.', 'error')
        
    return redirect(url_for('main.index'))

@newsletter_bp.route('/admin/newsletter')
@admin_required
def admin_newsletter_dashboard():
    """Display the newsletter management dashboard for admins."""
    try:
        page = request.args.get('page', 1, type=int)
        subscribers = NewsletterSubscriber.query.order_by(
            NewsletterSubscriber.is_active.desc(), 
            NewsletterSubscriber.subscribed_at.desc()
        ).paginate(page=page, per_page=20, error_out=False)
        
        stats = {
            'total': NewsletterSubscriber.query.count(),
            'active': NewsletterSubscriber.query.filter_by(is_active=True).count()
        }
        stats['inactive'] = stats['total'] - stats['active']
        
        return render_template('admin/newsletter.html', subscribers=subscribers, stats=stats)
    except Exception as e:
        logger.error(f"Error loading admin newsletter dashboard: {e}", exc_info=True)
        flash("Bülten yönetim paneli yüklenirken bir hata oluştu.", "error")
        return redirect(url_for('admin.dashboard'))


@newsletter_bp.route('/admin/newsletter/send', methods=['POST'])
@admin_required
def admin_send_newsletter():
    """Handle sending newsletters from the admin panel."""
    try:
        subject = request.form.get('subject', '').strip()
        content = request.form.get('content', '').strip()

        if not subject or not content:
            return jsonify({'success': False, 'message': 'Konu ve içerik gereklidir.'}), 400

        content = sanitize_html(content)
        
        subscribers = NewsletterSubscriber.query.filter_by(is_active=True).all()
        if not subscribers:
            return jsonify({'success': False, 'message': 'Aktif abone bulunamadı.'}), 404
        
        success_count = 0
        for subscriber in subscribers:
            try:
                unsubscribe_url = url_for('newsletter.unsubscribe', token=subscriber.unsubscribe_token, _external=True)
                send_newsletter_email(
                    to=subscriber.email,
                    subject=subject,
                    template='emails/newsletter.html',
                    subscriber=subscriber,
                    newsletter_subject=subject,
                    newsletter_content=content,
                    unsubscribe_url=unsubscribe_url
                )
                success_count += 1
            except Exception as e:
                logger.error(f"Newsletter send error for {subscriber.email}: {e}", exc_info=True)
        
        return jsonify({
            'success': True, 
            'message': f'Newsletter {success_count}/{len(subscribers)} aboneye gönderildi.'
        })
        
    except Exception as e:
        logger.error(f"General newsletter send error: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Newsletter gönderilirken bir hata oluştu.'}), 500
