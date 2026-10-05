"""
Shop routes for the Inci Gold e-commerce platform.

This module handles shop functionality including product listing, filtering,
searching, and category management with caching optimization.
"""

from flask import Blueprint, current_app, flash, jsonify, redirect, render_template, request, url_for
from flask_caching import Cache
from flask_login import current_user
from sqlalchemy import asc, desc

from models import Category, Product, Review, db

shop_bp = Blueprint('shop', __name__)

@shop_bp.route('/')
def index():
    """Shop main page with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category')
    sort_by = request.args.get('sort', 'newest')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    # Base query
    query = Product.query.filter_by(is_active=True)
    
    # Category filter
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    # Price filters
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    
    # Sorting
    if sort_by == 'price_asc':
        query = query.order_by(asc(Product.price))
    elif sort_by == 'price_desc':
        query = query.order_by(desc(Product.price))
    elif sort_by == 'name':
        query = query.order_by(asc(Product.name))
    elif sort_by == 'featured':
        query = query.order_by(desc(Product.is_featured), desc(Product.created_at))
    else:  # newest
        query = query.order_by(desc(Product.created_at))
    
    # Pagination
    per_page = 12
    products = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Categories (cache separately) - cache only serializable data
    # Exclude "İndirimli Ürünler" category
    categories_cache_key = "categories_list"
    categories_data = current_app.cache.get(categories_cache_key)
    if not categories_data:
        categories = Category.query.filter_by(is_active=True).filter(
            ~Category.name.ilike('%indirimli%')
        ).order_by(Category.sort_order).all()
        # Convert to serializable format
        categories_data = [{
            'id': cat.id,
            'name': cat.name,
            'slug': cat.slug,
            'description': cat.description,
            'image': cat.image,
            'sort_order': cat.sort_order
        } for cat in categories]
        current_app.cache.set(categories_cache_key, categories_data, timeout=3600)  # 1 hour
    
    # Convert back to Category objects for template
    categories = []
    for cat_data in categories_data:
        cat = Category()
        cat.id = cat_data['id']
        cat.name = cat_data['name']
        cat.slug = cat_data['slug']
        cat.description = cat_data['description']
        cat.image = cat_data['image']
        cat.sort_order = cat_data['sort_order']
        categories.append(cat)
    
    # Price range (cache separately) - cache only serializable data
    price_range_cache_key = "price_range"
    price_range_data = current_app.cache.get(price_range_cache_key)
    if not price_range_data:
        price_range_result = db.session.query(
            db.func.min(Product.price).label('min_price'),
            db.func.max(Product.price).label('max_price')
        ).filter_by(is_active=True).first()
        # Convert to serializable format
        price_range_data = {
            'min_price': float(price_range_result.min_price) if price_range_result.min_price else 0,
            'max_price': float(price_range_result.max_price) if price_range_result.max_price else 0
        }
        current_app.cache.set(price_range_cache_key, price_range_data, timeout=1800)  # 30 minutes
    
    # Create a simple object for template compatibility
    class PriceRange:
        def __init__(self, min_price, max_price):
            self.min_price = min_price
            self.max_price = max_price
    
    price_range = PriceRange(price_range_data['min_price'], price_range_data['max_price'])
    
    return render_template('shop/index.html',
                         products=products,
                         categories=categories,
                         current_category=int(category_id) if category_id else None,
                         sort_by=sort_by,
                         min_price=min_price,
                         max_price=max_price,
                         price_range=price_range)

@shop_bp.route('/category/<slug>')
def category(slug):
    """Kategori sayfası"""
    category = Category.query.filter_by(slug=slug, is_active=True).first_or_404()
    
    # Özel durum: İndirimli Ürünler kategorisi için otomatik filtreleme
    if slug == 'indirimli-urunler' or 'indirimli' in category.name.lower():
        page = request.args.get('page', 1, type=int)
        products = Product.query.filter(
            Product.is_active == True,
            Product.compare_price.isnot(None),
            Product.compare_price > Product.price
        ).order_by(desc(Product.created_at)).paginate(
            page=page, per_page=12, error_out=False
        )
        categories = Category.query.filter_by(is_active=True).filter(
            ~Category.name.ilike('%indirimli%')
        ).order_by(Category.sort_order).all()
        return render_template('shop/category.html',
                             category=category,
                             products=products,
                             categories=categories,
                             sort_by='newest',
                             min_price=None,
                             max_price=None,
                             price_range=None)
    
    page = request.args.get('page', 1, type=int)
    sort_by = request.args.get('sort', 'newest')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    # Base query
    query = Product.query.filter_by(category_id=category.id, is_active=True)
    
    # Fiyat filtreleri
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    
    # Sorting
    if sort_by == 'price_asc':
        query = query.order_by(asc(Product.price))
    elif sort_by == 'price_desc':
        query = query.order_by(desc(Product.price))
    elif sort_by == 'name':
        query = query.order_by(asc(Product.name))
    elif sort_by == 'featured':
        query = query.order_by(desc(Product.is_featured), desc(Product.created_at))
    else:  # newest
        query = query.order_by(desc(Product.created_at))
    
    # Pagination
    per_page = 12
    products = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Kategoriler (sidebar için)
    categories = Category.query.filter_by(is_active=True).order_by(Category.sort_order).all()
    
    # Bu kategorideki ürünlerin fiyat aralığı
    price_range = db.session.query(
        db.func.min(Product.price).label('min_price'),
        db.func.max(Product.price).label('max_price')
    ).filter_by(category_id=category.id, is_active=True).first()
    
    return render_template('shop/category.html',
                         category=category,
                         products=products,
                         categories=categories,
                         sort_by=sort_by,
                         min_price=min_price,
                         max_price=max_price,
                         price_range=price_range)

@shop_bp.route('/product/<slug>')
def product_detail(slug):
    """Ürün detay sayfası"""
    product = Product.query.filter_by(slug=slug, is_active=True).first_or_404()
    
    # Onaylanmış yorumlar
    reviews = Review.query.filter_by(product_id=product.id, is_approved=True).order_by(desc(Review.created_at)).all()
    
    # İlgili ürünler (aynı kategoriden)
    related_products = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).limit(4).all()
    
    # Son görüntülenen ürünler (session'da tutulabilir)
    recently_viewed = []
    
    return render_template('shop/product_detail.html',
                         product=product,
                         reviews=reviews,
                         related_products=related_products,
                         recently_viewed=recently_viewed)

@shop_bp.route('/product/<int:product_id>/review', methods=['POST'])
def add_review(product_id):
    """Ürün yorumu ekle"""
    if not current_user.is_authenticated:
        return jsonify({'success': False, 'message': 'Yorum yapmak için giriş yapmalısınız.'})
    
    try:
        product = Product.query.get_or_404(product_id)
        
        rating = request.form.get('rating', type=int)
        title = request.form.get('title', '').strip()
        comment = request.form.get('comment', '').strip()
        
        # Validasyon
        if not rating or rating < 1 or rating > 5:
            return jsonify({'success': False, 'message': 'Geçerli bir puan verin (1-5).'})
        
        if not comment or len(comment) < 10:
            return jsonify({'success': False, 'message': 'Yorum en az 10 karakter olmalıdır.'})
        
        # Sipariş kontrolü - sadece ürünü sipariş eden kullanıcılar yorum yapabilir
        from models import Order, OrderItem
        has_ordered = db.session.query(OrderItem).join(Order).filter(
            Order.user_id == current_user.id,
            OrderItem.product_id == product_id,
            Order.payment_status == 'paid'
        ).first()
        
        if not has_ordered:
            return jsonify({'success': False, 'message': 'Bu ürünü sipariş etmediniz. Sadece sipariş verdiğiniz ürünler için yorum yapabilirsiniz.'})
        
        # Daha önce yorum yapmış mı kontrol et
        existing_review = Review.query.filter_by(
            user_id=current_user.id,
            product_id=product_id
        ).first()
        
        if existing_review:
            return jsonify({'success': False, 'message': 'Bu ürün için zaten yorum yapmışsınız.'})
        
        # Yorum oluştur
        review = Review(
            user_id=current_user.id,
            product_id=product_id,
            rating=rating,
            title=title,
            comment=comment,
            is_approved=False  # Admin onayı gerekli
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Yorumunuz gönderildi. Onaylandıktan sonra yayınlanacaktır.'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Yorum eklenirken bir hata oluştu.'})

@shop_bp.route('/featured')
def featured():
    """Öne çıkan ürünler"""
    page = request.args.get('page', 1, type=int)
    
    products = Product.query.filter_by(is_featured=True, is_active=True).order_by(
        desc(Product.created_at)
    ).paginate(
        page=page, per_page=12, error_out=False
    )
    
    return render_template('shop/featured.html', products=products)

@shop_bp.route('/new-arrivals')
def new_arrivals():
    """Yeni gelenler"""
    page = request.args.get('page', 1, type=int)
    
    products = Product.query.filter_by(is_active=True).order_by(
        desc(Product.created_at)
    ).paginate(
        page=page, per_page=12, error_out=False
    )
    
    return render_template('shop/new_arrivals.html', products=products)

@shop_bp.route('/sale')
def sale():
    """İndirimli ürünler"""
    page = request.args.get('page', 1, type=int)
    
    products = Product.query.filter(
        Product.is_active == True,
        Product.compare_price.isnot(None),
        Product.compare_price > Product.price
    ).order_by(desc(Product.created_at)).paginate(
        page=page, per_page=12, error_out=False
    )
    
    return render_template('shop/sale.html', products=products)

@shop_bp.route('/api/products')
def api_products():
    """API: Ürün listesi"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category_id = request.args.get('category_id', type=int)
    
    query = Product.query.filter_by(is_active=True)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    products = query.order_by(desc(Product.created_at)).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    products_data = []
    for product in products.items:
        products_data.append({
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'price': float(product.price),
            'compare_price': float(product.compare_price) if product.compare_price else None,
            'image': product.main_image_url,
            'category': product.category.name,
            'rating': product.average_rating,
            'review_count': product.review_count,
            'is_featured': product.is_featured,
            'discount_percentage': product.discount_percentage
        })
    
    return jsonify({
        'products': products_data,
        'pagination': {
            'page': products.page,
            'pages': products.pages,
            'per_page': products.per_page,
            'total': products.total,
            'has_next': products.has_next,
            'has_prev': products.has_prev
        }
    })


@shop_bp.route('/api/product/<int:product_id>')
def api_product_detail(product_id):
    """API: Ürün detayı"""
    product = Product.query.filter_by(id=product_id, is_active=True).first_or_404()
    
    # Ürün resimleri
    images = []
    for img in product.images:
        images.append({
            'id': img.id,
            'url': img.image_url,
            'alt_text': img.alt_text,
            'is_main': img.is_main
        })
    
    # Onaylanmış yorumlar
    reviews_data = []
    reviews = Review.query.filter_by(product_id=product.id, is_approved=True).order_by(desc(Review.created_at)).limit(10).all()
    for review in reviews:
        reviews_data.append({
            'id': review.id,
            'user_name': review.user.first_name,
            'rating': review.rating,
            'title': review.title,
            'comment': review.comment,
            'created_at': review.created_at.isoformat()
        })
    
    product_data = {
        'id': product.id,
        'name': product.name,
        'slug': product.slug,
        'description': product.description,
        'short_description': product.short_description,
        'price': float(product.price),
        'compare_price': float(product.compare_price) if product.compare_price else None,
        'stock_quantity': product.stock_quantity,
        'weight': product.weight,
        'material': product.material,
        'purity': product.purity,
        'stone_type': product.stone_type,
        'stone_weight': product.stone_weight,
        'size': product.size,
        'color': product.color,
        'category': {
            'id': product.category.id,
            'name': product.category.name,
            'slug': product.category.slug
        },
        'images': images,
        'reviews': reviews_data,
        'average_rating': product.average_rating,
        'review_count': product.review_count,
        'discount_percentage': product.discount_percentage,
        'is_featured': product.is_featured
    }
    
    return jsonify(product_data)
