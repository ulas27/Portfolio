"""
Main routes for the Inci Gold e-commerce platform.

This module handles the main application routes including homepage, about,
contact, newsletter subscription, and search functionality.
"""

import logging
from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for
from sqlalchemy import desc, or_

from models import Category, ContactMessage, NewsletterSubscriber, Product, db
from utils.email_utils import send_contact_confirmation_email
from utils.whatsapp_utils import send_whatsapp_message


main_bp = Blueprint('main', __name__)
logger = logging.getLogger(__name__)

@main_bp.route('/')
def index():
    """Homepage with featured products, new arrivals, and categories."""
    # Featured products
    featured_products = Product.query.filter_by(is_featured=True, is_active=True).limit(8).all()
    
    # New products
    new_products = Product.query.filter_by(is_active=True).order_by(desc(Product.created_at)).limit(8).all()
    
    # Categories - exclude "İndirimli Ürünler" category
    categories = Category.query.filter_by(is_active=True).filter(
        ~Category.name.ilike('%indirimli%')
    ).order_by(Category.sort_order).all()
    
    return render_template('index.html', 
                         featured_products=featured_products,
                         new_products=new_products,
                         categories=categories)

@main_bp.route('/about')
def about():
    """About page."""
    return render_template('about.html')

@main_bp.route('/contact', methods=['GET', 'POST'])
def contact():
    """Contact form handling."""
    if request.method == 'POST':
        try:
            form_data = {
                'name': request.form.get('name'),
                'email': request.form.get('email'),
                'phone': request.form.get('phone'),
                'subject': request.form.get('subject', 'Genel İletişim'),
                'message': request.form.get('message')
            }
            
            if not all(form_data.get(key) for key in ['name', 'email', 'message']):
                return jsonify({'success': False, 'message': 'Lütfen gerekli alanları doldurun.'}), 400
            
            contact_msg = ContactMessage(**form_data)
            db.session.add(contact_msg)
            db.session.commit()
            
            whatsapp_result = send_whatsapp_message(
                contact_msg.ticket_number, **form_data
            )
            
            if whatsapp_result.get('success'):
                contact_msg.whatsapp_sent = True
                db.session.commit()
            
            try:
                send_contact_confirmation_email(contact_msg)
            except Exception as e:
                logger.error(f"Contact confirmation email error: {e}", exc_info=True)
            
            return jsonify({
                'success': True,
                'message': f'Mesajınız başarıyla gönderildi! Ticket numaranız: {contact_msg.ticket_number}. En kısa sürede size dönüş yapacağız.'
            })
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Contact form submission error: {e}", exc_info=True)
            return jsonify({'success': False, 'message': 'Mesaj gönderilirken bir hata oluştu.'}), 500
    
    return render_template('contact.html')

@main_bp.route('/newsletter/subscribe', methods=['POST'])
def newsletter_subscribe():
    """Handle newsletter subscription requests."""
    try:
        email = (request.form.get('email') or request.json.get('email')).strip().lower()
        
        if not email:
            return jsonify({'success': False, 'message': 'E-posta adresi gereklidir.'}), 400
        
        existing = NewsletterSubscriber.query.filter_by(email=email).first()
        if existing:
            if existing.is_active:
                return jsonify({'success': False, 'message': 'Bu e-posta adresi zaten kayıtlı.'}), 409
            else:
                existing.is_active = True
                message = 'Newsletter aboneliğiniz yeniden aktifleştirildi.'
        else:
            subscriber = NewsletterSubscriber(email=email)
            db.session.add(subscriber)
            message = 'Newsletter aboneliğiniz başarıyla oluşturuldu.'
        
        db.session.commit()
        return jsonify({'success': True, 'message': message})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Newsletter subscription error: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'İşlem sırasında bir hata oluştu.'}), 500

@main_bp.route('/search')
def search():
    """Ürün arama"""
    query = request.args.get('q', '').strip()
    category_id = request.args.get('category')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    sort_by = request.args.get('sort', 'name')
    
    # Base query
    products_query = Product.query.filter_by(is_active=True)
    
    # Arama terimi
    if query:
        search_term = f"%{query}%"
        products_query = products_query.filter(
            or_(
                Product.name.ilike(search_term), 
                Product.description.ilike(search_term),
                Product.sku.ilike(search_term)
            )
        )
    
    # Kategori filtresi
    if category_id:
        products_query = products_query.filter_by(category_id=category_id)
    
    # Fiyat filtreleri
    if min_price:
        products_query = products_query.filter(Product.price >= min_price)
    if max_price:
        products_query = products_query.filter(Product.price <= max_price)
    
    # Sıralama
    if sort_by == 'price_asc':
        products_query = products_query.order_by(Product.price.asc())
    elif sort_by == 'price_desc':
        products_query = products_query.order_by(Product.price.desc())
    elif sort_by == 'newest':
        products_query = products_query.order_by(desc(Product.created_at))
    else:
        products_query = products_query.order_by(Product.name.asc())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = 12
    products = products_query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    categories = Category.query.filter_by(is_active=True).all()
    
    return render_template('search.html', 
                         products=products,
                         categories=categories,
                         query=query,
                         current_category=category_id,
                         min_price=min_price,
                         max_price=max_price,
                         sort_by=sort_by)

@main_bp.route('/privacy')
def privacy():
    """Gizlilik politikası"""
    return render_template('privacy.html')

@main_bp.route('/terms')
def terms():
    """Kullanım şartları"""
    return render_template('terms.html')

@main_bp.route('/api/products/featured')
def api_featured_products():
    """API: Öne çıkan ürünler"""
    products = Product.query.filter_by(is_featured=True, is_active=True).limit(8).all()
    
    products_data = []
    for product in products:
        products_data.append({
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'price': float(product.price),
            'compare_price': float(product.compare_price) if product.compare_price else None,
            'image': product.main_image_url,
            'category': product.category.name,
            'rating': product.average_rating,
            'review_count': product.review_count
        })
    
    return jsonify(products_data)
