"""
Admin routes for the Inci Gold e-commerce platform.

This module handles admin panel functionality including dashboard, user management,
product management, order management, and system administration.
"""

import os
import uuid
from datetime import datetime, timedelta
from functools import wraps
import logging

from PIL import Image
from flask import Blueprint, current_app, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required
from sqlalchemy import desc, func
from werkzeug.utils import secure_filename

from models import (Category, ContactMessage, ManualSale, NewsletterSubscriber, Order, OrderItem,
                    Product, ProductImage, Review, User, db)
from utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)

def clear_cache_by_prefix(prefix):
    """Clear cache keys starting with a prefix."""
    try:
        # This is a simplified approach. For Redis, you could use SCAN.
        # For simple cache, we might need to iterate keys if possible,
        # but flask-caching's simple cache doesn't expose keys easily.
        # A full clear is often the only reliable option for 'simple' cache.
        current_app.cache.clear()
        logging.info(f"Cache cleared for prefix '{prefix}' (full clear).")
    except Exception as e:
        logging.error(f"Cache clear error: {e}")

def clear_product_cache():
    """Clear product-related cache keys."""
    clear_cache_by_prefix("shop_index_")
    clear_cache_by_prefix("categories_list")
    clear_cache_by_prefix("price_range")
    clear_cache_by_prefix("featured_products")
    clear_cache_by_prefix("new_products")

def allowed_file(filename):
    """İzin verilen dosya formatları"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file, folder='products'):
    """Resim kaydetme ve boyutlandırma"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], folder)
        os.makedirs(upload_path, exist_ok=True)
        
        file_path = os.path.join(upload_path, unique_filename)
        
        image = Image.open(file)
        
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        image.thumbnail((800, 800), Image.Resampling.LANCZOS)
        image.save(file_path, 'JPEG', quality=85, optimize=True)
        
        return os.path.join('uploads', folder, unique_filename).replace('\\', '/')
    return None

@admin_bp.route('/')
@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    """Admin dashboard"""
    # İstatistikler
    total_users = User.query.filter_by(is_admin=False).count()
    total_products = Product.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total_amount)).filter_by(payment_status='paid').scalar() or 0
    
    # Son siparişler
    recent_orders = Order.query.order_by(desc(Order.created_at)).limit(10).all()
    
    # Düşük stok ürünleri
    low_stock_products = Product.query.filter(Product.stock_quantity <= 5).all()
    
    # Onay bekleyen yorumlar
    pending_reviews = Review.query.filter_by(is_approved=False).count()
    
    # Okunmamış mesajlar
    try:
        unread_messages = ContactMessage.query.filter_by(is_read=False).count()
    except Exception:
        unread_messages = 0
    
    # Aylık satış grafiği için veri
    monthly_sales = []
    for i in range(12):
        start_date = datetime.now().replace(day=1) - timedelta(days=30*i)
        end_date = start_date.replace(day=28) + timedelta(days=4)
        end_date = end_date - timedelta(days=end_date.day)
        
        sales = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= start_date,
            Order.created_at <= end_date,
            Order.payment_status == 'paid'
        ).scalar() or 0
        
        monthly_sales.append({
            'month': start_date.strftime('%Y-%m'),
            'sales': float(sales)
        })
    
    monthly_sales.reverse()
    
    # Bu ay ve geçen ay gelirleri
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = current_month_start - timedelta(days=1)
    
    monthly_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= current_month_start,
        Order.payment_status == 'paid'
    ).scalar() or 0
    
    last_month_revenue = db.session.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= last_month_start,
        Order.created_at <= last_month_end,
        Order.payment_status == 'paid'
    ).scalar() or 0
    
    # Gelir detayları için siparişler
    revenue_orders = Order.query.filter_by(payment_status='paid').order_by(desc(Order.created_at)).limit(10).all()
    
    return render_template('admin/dashboard.html',
                         total_users=total_users,
                         total_products=total_products,
                         total_orders=total_orders,
                         total_revenue=total_revenue,
                         recent_orders=recent_orders,
                         low_stock_products=low_stock_products,
                         pending_reviews=pending_reviews,
                         unread_messages=unread_messages,
                         monthly_sales=monthly_sales,
                         monthly_revenue=monthly_revenue,
                         last_month_revenue=last_month_revenue,
                         revenue_orders=revenue_orders)

# ÜRÜN YÖNETİMİ
@admin_bp.route('/products')
@login_required
@admin_required
def products():
    """Ürün listesi"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    category_id = request.args.get('category')
    
    query = Product.query
    
    if search:
        query = query.filter(Product.name.contains(search) | Product.sku.contains(search))
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    products = query.order_by(desc(Product.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    # Exclude "İndirimli Ürünler" category
    categories = Category.query.filter(
        ~Category.name.ilike('%indirimli%')
    ).all()
    
    return render_template('admin/products.html', products=products, categories=categories)

@admin_bp.route('/products/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_product():
    """Ürün ekleme"""
    if request.method == 'POST':
        try:
            # Form verilerini al
            name = request.form.get('name', '').strip()
            category_id = request.form.get('category_id', type=int)
            description = request.form.get('description', '').strip()
            price = request.form.get('price', type=float)
            compare_price = request.form.get('compare_price', type=float)
            cost_price = request.form.get('cost_price', type=float)
            stock_quantity = request.form.get('stock_quantity', type=int)
            weight = request.form.get('weight', type=float)
            material = request.form.get('material', '').strip()
            purity = request.form.get('purity', '').strip()
            stone_type = request.form.get('stone_type', '').strip()
            stone_weight = request.form.get('stone_weight', type=float)
            size = request.form.get('size', '').strip()
            color = request.form.get('color', '').strip()
            is_featured = request.form.get('is_featured') == 'on'
            is_active = request.form.get('is_active') == 'on'
            
            # Validasyon
            if not name or not category_id or not price:
                flash('Ürün adı, kategori ve fiyat gereklidir.', 'error')
                # Exclude "İndirimli Ürünler" category
                categories = Category.query.filter(
                    ~Category.name.ilike('%indirimli%')
                ).all()
                return render_template('admin/add_product.html', categories=categories)
            
            # Ürün oluştur
            product = Product(
                name=name,
                category_id=category_id,
                description=description,
                price=price,
                compare_price=compare_price,
                cost_price=cost_price,
                stock_quantity=stock_quantity or 0,
                weight=weight,
                material=material,
                purity=purity,
                stone_type=stone_type,
                stone_weight=stone_weight,
                size=size,
                color=color,
                is_featured=is_featured,
                is_active=is_active
            )
            
            db.session.add(product)
            db.session.flush()  # ID'yi al
            
            # Resimleri işle
            images = request.files.getlist('images')
            main_image_set = False
            
            for i, image_file in enumerate(images):
                if image_file and image_file.filename:
                    image_url = save_image(image_file)
                    if image_url:
                        product_image = ProductImage(
                            product_id=product.id,
                            image_url=image_url,
                            is_main=not main_image_set,  # İlk resim ana resim
                            sort_order=i
                        )
                        db.session.add(product_image)
                        main_image_set = True
            
            db.session.commit()
            
            # Clear cache after adding product
            clear_product_cache()
            
            flash('Ürün başarıyla eklendi.', 'success')
            return redirect(url_for('admin.products'))
            
        except Exception as e:
            db.session.rollback()
            flash('Ürün eklenirken bir hata oluştu.', 'error')
            # Exclude "İndirimli Ürünler" category
            categories = Category.query.filter(
                ~Category.name.ilike('%indirimli%')
            ).all()
            return render_template('admin/add_product.html', categories=categories)
    
    # Exclude "İndirimli Ürünler" category
    categories = Category.query.filter_by(is_active=True).filter(
        ~Category.name.ilike('%indirimli%')
    ).all()
    return render_template('admin/add_product.html', categories=categories)

@admin_bp.route('/products/<int:product_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_product(product_id):
    """Ürün düzenleme"""
    product = Product.query.get_or_404(product_id)
    
    if request.method == 'POST':
        try:
            # Form verilerini al ve güncelle
            product.name = request.form.get('name', '').strip()
            product.category_id = request.form.get('category_id', type=int)
            product.description = request.form.get('description', '').strip()
            product.price = request.form.get('price', type=float)
            product.compare_price = request.form.get('compare_price', type=float)
            product.cost_price = request.form.get('cost_price', type=float)
            product.stock_quantity = request.form.get('stock_quantity', type=int)
            product.weight = request.form.get('weight', type=float)
            product.material = request.form.get('material', '').strip()
            product.purity = request.form.get('purity', '').strip()
            product.stone_type = request.form.get('stone_type', '').strip()
            product.stone_weight = request.form.get('stone_weight', type=float)
            product.size = request.form.get('size', '').strip()
            product.color = request.form.get('color', '').strip()
            product.is_featured = request.form.get('is_featured') == 'on'
            product.is_active = request.form.get('is_active') == 'on'
            
            # Yeni resimleri işle
            images = request.files.getlist('new_images')
            for i, image_file in enumerate(images):
                if image_file and image_file.filename:
                    image_url = save_image(image_file)
                    if image_url:
                        # Mevcut ana resim var mı kontrol et
                        has_main = ProductImage.query.filter_by(product_id=product.id, is_main=True).first()
                        
                        product_image = ProductImage(
                            product_id=product.id,
                            image_url=image_url,
                            is_main=not has_main,  # Ana resim yoksa ilk yüklenen ana resim olsun
                            sort_order=len(product.images) + i
                        )
                        db.session.add(product_image)
            
            db.session.commit()
            
            flash('Ürün başarıyla güncellendi.', 'success')
            return redirect(url_for('admin.products'))
            
        except Exception as e:
            db.session.rollback()
            flash('Ürün güncellenirken bir hata oluştu.', 'error')
    
    # Exclude "İndirimli Ürünler" category
    categories = Category.query.filter_by(is_active=True).filter(
        ~Category.name.ilike('%indirimli%')
    ).all()
    return render_template('admin/edit_product.html', product=product, categories=categories)

@admin_bp.route('/products/<int:product_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_product(product_id):
    """Ürün silme"""
    try:
        product = Product.query.get_or_404(product_id)
        
        # Resim dosyalarını sil
        for image in product.images:
            try:
                if image.image_url.startswith('/static/uploads/'):
                    file_path = os.path.join(current_app.root_path, image.image_url[1:])  # '/' karakterini kaldır
                    if os.path.exists(file_path):
                        os.remove(file_path)
            except:
                pass  # Dosya silme hatası önemli değil
        
        db.session.delete(product)
        db.session.commit()
        
        flash('Ürün başarıyla silindi.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Ürün silinirken bir hata oluştu.', 'error')
    
    return redirect(url_for('admin.products'))

@admin_bp.route('/products/<int:product_id>/images/<int:image_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_product_image(product_id, image_id):
    """Ürün resmi silme"""
    try:
        image = ProductImage.query.filter_by(id=image_id, product_id=product_id).first_or_404()
        was_main = image.is_main
        
        # Dosyayı sil
        try:
            if image.image_url.startswith('/static/uploads/'):
                file_path = os.path.join(current_app.root_path, image.image_url[1:])
                if os.path.exists(file_path):
                    os.remove(file_path)
        except:
            pass
        
        db.session.delete(image)
        db.session.flush()

        # Eğer ana resim silindiyse, mevcut diğer resimlerden birini ana resim yap
        if was_main:
            remaining_main = ProductImage.query.filter_by(product_id=product_id, is_main=True).first()
            if not remaining_main:
                candidate = ProductImage.query.filter_by(product_id=product_id).order_by(ProductImage.sort_order.asc(), ProductImage.id.asc()).first()
                if candidate:
                    candidate.is_main = True

        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@admin_bp.route('/products/<int:product_id>/images/<int:image_id>/set-main', methods=['POST'])
@login_required
@admin_required
def set_product_main_image(product_id, image_id):
    """Bir ürüne ait ana resmi ayarla"""
    try:
        product = Product.query.get_or_404(product_id)
        image = ProductImage.query.filter_by(id=image_id, product_id=product_id).first_or_404()

        # Tüm resimlerin ana bayrağını kaldır
        ProductImage.query.filter_by(product_id=product_id).update({ProductImage.is_main: False})

        # Seçileni ana resim yap
        image.is_main = True
        db.session.commit()

        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

# KATEGORİ YÖNETİMİ
@admin_bp.route('/categories')
@login_required
@admin_required
def categories():
    """Kategori listesi - exclude "İndirimli Ürünler" category"""
    categories = Category.query.filter(
        ~Category.name.ilike('%indirimli%')
    ).order_by(Category.sort_order.asc(), Category.name).all()
    return render_template('admin/categories.html', categories=categories)

@admin_bp.route('/categories/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_category():
    """Kategori ekleme"""
    if request.method == 'POST':
        try:
            name = request.form.get('name', '').strip()
            description = request.form.get('description', '').strip()
            is_active = request.form.get('is_active') == 'on'
            
            if not name:
                flash('Kategori adı gereklidir.', 'error')
                return render_template('admin/add_category.html')
            
            # Slug oluştur
            slug = name.lower().replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ı', 'i').replace('ö', 'o').replace('ç', 'c').replace(' ', '-')
            slug = ''.join(c for c in slug if c.isalnum() or c == '-').strip('-')
            
            # Otomatik sıra numarası - en sona ekle
            max_sort_order = db.session.query(db.func.max(Category.sort_order)).scalar() or 0
            next_sort_order = max_sort_order + 1
            
            category = Category(
                name=name,
                slug=slug,
                description=description,
                sort_order=next_sort_order,
                is_active=is_active
            )
            
            # Resim varsa kaydet
            image_file = request.files.get('image')
            if image_file and image_file.filename:
                image_url = save_image(image_file, 'categories')
                if image_url:
                    # Sadece dosya adını kaydet (klasör yolu olmadan)
                    filename = os.path.basename(image_url)
                    category.image = filename
            
            db.session.add(category)
            db.session.commit()
            
            flash('Kategori başarıyla eklendi.', 'success')
            return redirect(url_for('admin.categories'))
            
        except Exception as e:
            db.session.rollback()
            flash('Kategori eklenirken bir hata oluştu.', 'error')
    
    # Mevcut kategorileri al - exclude "İndirimli Ürünler" category
    categories = Category.query.filter(
        ~Category.name.ilike('%indirimli%')
    ).order_by(Category.sort_order.asc()).all()
    
    return render_template('admin/add_category.html', categories=categories)

@admin_bp.route('/categories/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_category(id):
    """Kategori düzenleme"""
    category = Category.query.get_or_404(id)
    
    if request.method == 'POST':
        try:
            name = request.form.get('name', '').strip()
            category.description = request.form.get('description', '').strip()
            category.sort_order = request.form.get('sort_order', type=int) or 0
            category.is_active = request.form.get('is_active') == 'on'
            
            # Slug güncelle
            if name != category.name:
                slug = name.lower().replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ı', 'i').replace('ö', 'o').replace('ç', 'c').replace(' ', '-')
                slug = ''.join(c for c in slug if c.isalnum() or c == '-').strip('-')
                category.slug = slug
            
            category.name = name
            
            if not category.name:
                flash('Kategori adı gereklidir.', 'error')
                return render_template('admin/edit_category.html', category=category)
            
            # Resim işlemleri
            remove_image = request.form.get('remove_image') == 'true'
            if remove_image:
                # Mevcut resmi sil
                if category.image:
                    try:
                        old_image_path = os.path.join(current_app.static_folder, 'uploads', 'categories', category.image)
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    except:
                        pass
                category.image = None
            
            image_file = request.files.get('image')
            if image_file and image_file.filename:
                image_url = save_image(image_file, 'categories')
                if image_url:
                    # Eski resmi sil
                    if category.image:
                        old_image_path = os.path.join(current_app.static_folder, 'uploads', 'categories', category.image)
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    # Sadece dosya adını kaydet (klasör yolu olmadan)
                    filename = os.path.basename(image_url)
                    category.image = filename
            
            db.session.commit()
            
            flash('Kategori başarıyla güncellendi.', 'success')
            return redirect(url_for('admin.categories'))
            
        except Exception as e:
            db.session.rollback()
            flash('Kategori güncellenirken bir hata oluştu.', 'error')
    
    return render_template('admin/edit_category.html', category=category)

@admin_bp.route('/categories/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_category(id):
    """Kategori silme"""
    print(f"Kategori silme isteği geldi - ID: {id}")  # Debug
    try:
        category = Category.query.get_or_404(id)
        print(f"Kategori bulundu: {category.name}")  # Debug
        
        # Kategoriye ait ürün sayısını kontrol et
        product_count = len(category.products)
        print(f"Kategoriye ait ürün sayısı: {product_count}")  # Debug
        
        # Önce kategoriye bağlı ürünleri sil
        for product in category.products:
            # Ürün resimlerini sil
            for image in product.images:
                try:
                    if image.image_url.startswith('/static/uploads/'):
                        file_path = os.path.join(current_app.root_path, image.image_url[1:])
                        if os.path.exists(file_path):
                            os.remove(file_path)
                except:
                    pass
            db.session.delete(product)
        
        # Kategori resmini sil
        if category.image:
            image_path = os.path.join(current_app.static_folder, 'uploads', 'categories', category.image)
            if os.path.exists(image_path):
                os.remove(image_path)
        
        # Kategoriyi sil
        db.session.delete(category)
        db.session.commit()
        
        clear_product_cache()
        
        print(f"Kategori başarıyla silindi: {category.name}")  # Debug
        return jsonify({
            'success': True,
            'message': f'Kategori ve {product_count} ürün başarıyla silindi.'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Kategori silme hatası: {str(e)}")  # Debug için
        return jsonify({
            'success': False,
            'message': f'Kategori silinirken bir hata oluştu: {str(e)}'
        })

@admin_bp.route('/categories/<int:id>/move-up', methods=['POST'])
@login_required
@admin_required
def move_category_up(id):
    """Kategoriyi yukarı taşı"""
    try:
        category = Category.query.get_or_404(id)
        prev_category = Category.query.filter(
            Category.sort_order < category.sort_order
        ).order_by(Category.sort_order.desc()).first()
        
        if prev_category:
            # Sıraları değiştir
            temp_order = category.sort_order
            category.sort_order = prev_category.sort_order
            prev_category.sort_order = temp_order
            
            db.session.commit()
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Zaten en üstte'})
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@admin_bp.route('/categories/<int:id>/move-down', methods=['POST'])
@login_required
@admin_required
def move_category_down(id):
    """Kategoriyi aşağı taşı"""
    try:
        category = Category.query.get_or_404(id)
        next_category = Category.query.filter(
            Category.sort_order > category.sort_order
        ).order_by(Category.sort_order.asc()).first()
        
        if next_category:
            # Sıraları değiştir
            temp_order = category.sort_order
            category.sort_order = next_category.sort_order
            next_category.sort_order = temp_order
            
            db.session.commit()
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': 'Zaten en altta'})
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@admin_bp.route('/categories/update-order', methods=['POST'])
@login_required
@admin_required
def update_category_order():
    """Kategori sıralamasını güncelle (drag & drop)"""
    try:
        data = request.get_json()
        categories = data.get('categories', [])
        
        if not categories:
            return jsonify({'success': False, 'message': 'Kategori verisi bulunamadı'})
        
        # Her kategori için sıra numarasını güncelle
        for cat_data in categories:
            category_id = cat_data.get('id')
            sort_order = cat_data.get('sort_order')
            
            if category_id and sort_order:
                category = Category.query.get(category_id)
                if category:
                    category.sort_order = sort_order
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Sıralama güncellendi'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Sıralama güncellenirken hata: {str(e)}'})

# SİPARİŞ YÖNETİMİ
@admin_bp.route('/orders')
@login_required
@admin_required
def orders():
    """Sipariş listesi"""
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status')
    
    query = Order.query.filter(Order.status != 'failed')
    
    if status:
        query = query.filter_by(status=status)
    
    orders = query.order_by(desc(Order.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/orders.html', orders=orders)

@admin_bp.route('/orders/<int:order_id>')
@login_required
@admin_required
def order_detail(order_id):
    """Sipariş detayı"""
    order = Order.query.get_or_404(order_id)
    return render_template('admin/order_detail.html', order=order)

@admin_bp.route('/orders/<int:order_id>/update-status', methods=['POST'])
@login_required
@admin_required
def update_order_status(order_id):
    """Sipariş durumu güncelleme"""
    try:
        order = Order.query.get_or_404(order_id)
        new_status = request.form.get('status')
        tracking_number = request.form.get('tracking_number', '').strip()
        shipping_company = request.form.get('shipping_company', '').strip()
        
        if new_status:
            # Eğer sipariş onaylanıyorsa ve ödeme manuel ise, stoktan düş
            if new_status == 'confirmed' and order.payment_method == 'bank_transfer' and order.payment_status == 'pending':
                # Stok kontrolü
                for item in order.items:
                    product = Product.query.get(item.product_id)
                    if product and product.stock_quantity < item.quantity:
                        flash(f'{product.name} ürünü için yeterli stok bulunmamaktadır.', 'error')
                        return redirect(url_for('admin.order_detail', order_id=order_id))
                
                # Stoktan düş
                for item in order.items:
                    product = Product.query.get(item.product_id)
                    if product:
                        product.stock_quantity -= item.quantity
                
                order.payment_status = 'paid'
                
                # Email gönder
                from utils.email_utils import send_order_confirmation_email
                send_order_confirmation_email(order)
                
                flash('Sipariş onaylandı ve stoktan düşürüldü.', 'success')
            
            # Eğer sipariş iptal ediliyorsa ve ödeme yapılmışsa, stok geri ekle
            elif new_status == 'cancelled' and order.payment_status == 'paid':
                for item in order.items:
                    product = Product.query.get(item.product_id)
                    if product:
                        product.stock_quantity += item.quantity
                
                order.payment_status = 'refunded'
                flash('Sipariş iptal edildi ve stok geri eklendi.', 'info')
            
            # Durum değişikliği kontrolü
            old_status = order.status
            order.status = new_status
            if tracking_number:
                order.tracking_number = tracking_number
            if shipping_company:
                order.shipping_company = shipping_company
            
            db.session.commit()
            
            # Sipariş durumu değiştiyse email gönder
            if old_status != new_status:
                from utils.email_utils import send_order_status_update_email
                send_order_status_update_email(
                    order=order,
                    status=new_status,
                    tracking_number=tracking_number if new_status == 'shipped' else None,
                    shipping_company=shipping_company if new_status == 'shipped' else None,
                    estimated_delivery='1-3 iş günü' if new_status == 'shipped' else None
                )
            
            flash('Sipariş durumu güncellendi ve müşteriye email gönderildi.', 'success')
        
    except Exception as e:
        db.session.rollback()
        flash('Sipariş durumu güncellenirken bir hata oluştu.', 'error')
    
    return redirect(url_for('admin.order_detail', order_id=order_id))

# KULLANICI YÖNETİMİ
@admin_bp.route('/users')
@login_required
@admin_required
def users():
    """Kullanıcı listesi"""
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    
    query = User.query.filter_by(is_admin=False)
    
    if search:
        query = query.filter(
            User.first_name.contains(search) |
            User.last_name.contains(search) |
            User.email.contains(search) |
            User.username.contains(search)
        )
    
    users = query.order_by(desc(User.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/users.html', users=users)

# MESAJLAR
@admin_bp.route('/messages')
@login_required
@admin_required
def messages():
    """İletişim mesajları (sadece okunmamış)"""
    try:
        page = request.args.get('page', 1, type=int)
        messages = ContactMessage.query.filter_by(is_read=False).order_by(desc(ContactMessage.created_at)).paginate(
            page=page, per_page=20, error_out=False
        )
        return render_template('admin/messages.html', messages=messages)
    except Exception as e:
        # Veritabanını güncelle
        db.create_all()
        flash('Veritabanı güncellendi. Sayfayı yenileyin.', 'success')
        return render_template('admin/messages.html', messages=None)

@admin_bp.route('/messages/past')
@login_required
@admin_required
def past_messages():
    """Geçmiş (okunmuş) mesajlar"""
    try:
        page = request.args.get('page', 1, type=int)
        messages = ContactMessage.query.filter_by(is_read=True).order_by(desc(ContactMessage.created_at)).paginate(
            page=page, per_page=20, error_out=False
        )
        return render_template('admin/past_messages.html', messages=messages)
    except Exception as e:
        flash('Geçmiş mesajlar yüklenirken bir hata oluştu.', 'error')
        return redirect(url_for('admin.messages'))

@admin_bp.route('/messages/<int:message_id>/mark-read', methods=['POST'])
@login_required
@admin_required
def mark_message_read(message_id):
    """Mesajı okundu olarak işaretle"""
    try:
        message = ContactMessage.query.get_or_404(message_id)
        message.is_read = True
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

# YORUMLAR
@admin_bp.route('/reviews')
@login_required
@admin_required
def reviews():
    """Ürün yorumları"""
    page = request.args.get('page', 1, type=int)
    reviews = Review.query.order_by(desc(Review.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('admin/reviews.html', reviews=reviews)

@admin_bp.route('/reviews/<int:review_id>/approve', methods=['POST'])
@login_required
@admin_required
def approve_review(review_id):
    """Yorumu onayla"""
    try:
        review = Review.query.get_or_404(review_id)
        review.is_approved = True
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@admin_bp.route('/manual-sale', methods=['GET', 'POST'])
@login_required
@admin_required
def manual_sale():
    """Manuel satış girişi"""
    if request.method == 'POST':
        try:
            # Müşteri bilgilerini al
            customer_name = request.form.get('customer_name', '').strip()
            customer_tc = request.form.get('customer_tc', '').strip()
            customer_phone = request.form.get('customer_phone', '').strip()
            customer_email = request.form.get('customer_email', '').strip()
            payment_method = request.form.get('payment_method', 'Nakit')
            sale_date_str = request.form.get('sale_date', '')
            notes = request.form.get('notes', '').strip()
            
            # Tarih işleme
            if sale_date_str:
                try:
                    sale_date = datetime.strptime(sale_date_str, '%Y-%m-%d')
                except ValueError:
                    flash('Geçersiz tarih formatı.', 'error')
                    return render_template('admin/manual_sale.html')
            else:
                sale_date = datetime.now()
            
            # TC validasyonu
            if customer_tc:
                if len(customer_tc) != 11 or not customer_tc.isdigit():
                    flash('TC Kimlik numarası 11 haneli olmalıdır.', 'error')
                    return render_template('admin/manual_sale.html')
                if int(customer_tc[10]) % 2 != 0:
                    flash('TC Kimlik numarasının son hanesi çift olmalıdır.', 'error')
                    return render_template('admin/manual_sale.html')
            
            # Ürünleri işle - form'dan tüm products[*] alanlarını bul
            total_sales_amount = 0
            saved_products = []
            
            # Form'dan tüm products alanlarını bul
            i = 0
            while True:
                product_name = request.form.get(f'products[{i}][product_name]', '').strip()
                if not product_name:  # Bu index'te ürün yoksa dur
                    break
                    
                product_description = request.form.get(f'products[{i}][product_description]', '').strip()
                quantity_str = request.form.get(f'products[{i}][quantity]', '1')
                unit_price_str = request.form.get(f'products[{i}][unit_price]', '0')
                
                try:
                    quantity = int(quantity_str) if quantity_str else 1
                    unit_price = float(unit_price_str) if unit_price_str else 0
                except (ValueError, TypeError):
                    i += 1
                    continue
                
                if unit_price <= 0:
                    i += 1
                    continue  # Geçersiz fiyatı atla
                
                total_amount = quantity * unit_price
                total_sales_amount += total_amount
                
                # Manuel satış kaydını oluştur
                manual_sale = ManualSale(
                    product_name=product_name,
                    product_description=product_description,
                    customer_name=customer_name if customer_name else None,
                    customer_tc=customer_tc if customer_tc else None,
                    customer_phone=customer_phone if customer_phone else None,
                    customer_email=customer_email if customer_email else None,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_amount=total_amount,
                    payment_method=payment_method,
                    sale_date=sale_date,
                    notes=notes,
                    created_by=current_user.id
                )
                
                db.session.add(manual_sale)
                saved_products.append(product_name)
                i += 1
            
            if not saved_products:
                flash('En az bir geçerli ürün girmelisiniz.', 'error')
                return render_template('admin/manual_sale.html')
            
            db.session.commit()
            
            flash(f'{len(saved_products)} ürün satışı başarıyla kaydedildi. Toplam tutar: ₺{total_sales_amount:.2f}', 'success')
            return redirect(url_for('admin.sales_history'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Satış kaydedilirken bir hata oluştu: {str(e)}', 'error')
            return render_template('admin/manual_sale.html')
    
    # GET isteği - formu göster
    return render_template('admin/manual_sale.html')

@admin_bp.route('/sales-history')
@login_required
@admin_required
def sales_history():
    """Geçmiş satışlar listesi"""
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    # Manuel satışları getir (en yeni önce)
    manual_sales = ManualSale.query.order_by(desc(ManualSale.sale_date)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # İstatistikler
    total_manual_sales = ManualSale.query.count()
    total_manual_revenue = db.session.query(func.sum(ManualSale.total_amount)).scalar() or 0
    
    return render_template('admin/sales_history.html', 
                         manual_sales=manual_sales,
                         total_manual_sales=total_manual_sales,
                         total_manual_revenue=total_manual_revenue)

@admin_bp.route('/sales-history/<int:sale_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_manual_sale(sale_id):
    """Manuel satış kaydını sil"""
    try:
        manual_sale = ManualSale.query.get_or_404(sale_id)
        db.session.delete(manual_sale)
        db.session.commit()
        flash('Manuel satış kaydı başarıyla silindi.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Satış kaydı silinirken bir hata oluştu: {str(e)}', 'error')
    
    return redirect(url_for('admin.sales_history'))
