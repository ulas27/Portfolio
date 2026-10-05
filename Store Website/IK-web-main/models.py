"""
Database models for the Inci Gold e-commerce platform.

This module contains all the database models including User, Product, Category,
Order, Cart, and related models with proper relationships and constraints.
"""

import uuid
from datetime import datetime

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from slugify import slugify
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

# Initialize Argon2 password hasher
_argon2_hasher = PasswordHasher()

class User(UserMixin, db.Model):
    """
    User model for authentication and profile management.
    
    Supports both regular users and admin users with proper password hashing
    using Argon2 and backward compatibility with Werkzeug hashing.
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    postal_code = db.Column(db.String(10))
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(255))
    reset_token_expires = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='customer', lazy=True)
    cart = db.relationship('Cart', backref='user', uselist=False, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy=True)
    
    def set_password(self, password):
        """Set password hash using Argon2"""
        try:
            # Try to use Argon2 first
            self.password_hash = _argon2_hasher.hash(password)
        except Exception:
            # Fallback to Werkzeug for backward compatibility
            self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        try:
            # Try Argon2 verification first
            _argon2_hasher.verify(self.password_hash, password)
            return True
        except VerifyMismatchError:
            return False
        except Exception:
            # Fallback to Werkzeug for backward compatibility
            return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}"
    
    def __repr__(self):
        return f'<User {self.username}>'

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    products = db.relationship('Product', backref='category', lazy=True)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.slug and self.name:
            self.slug = slugify(self.name)
    
    def __repr__(self):
        return f'<Category {self.name}>'

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text)
    short_description = db.Column(db.String(500))
    sku = db.Column(db.String(50), unique=True, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    compare_price = db.Column(db.Numeric(10, 2))  # Original price for discounts
    cost_price = db.Column(db.Numeric(10, 2))
    stock_quantity = db.Column(db.Integer, default=0)
    weight = db.Column(db.Float)  # in grams
    material = db.Column(db.String(100))  # Gold, Silver, etc.
    purity = db.Column(db.String(50))  # 14k, 18k, etc.
    stone_type = db.Column(db.String(100))  # Diamond, Ruby, etc.
    stone_weight = db.Column(db.Float)  # in carats
    size = db.Column(db.String(50))
    color = db.Column(db.String(50))
    image = db.Column(db.String(255))  # Main product image
    is_active = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    meta_title = db.Column(db.String(200))
    meta_description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    
    # Indexes for better performance
    __table_args__ = (
        db.Index('idx_product_active_featured', 'is_active', 'is_featured'),
        db.Index('idx_product_category_active', 'category_id', 'is_active'),
        db.Index('idx_product_price', 'price'),
        db.Index('idx_product_created_at', 'created_at'),
    )
    
    # Relationships
    images = db.relationship(
        'ProductImage',
        backref='product',
        lazy=True,
        cascade='all, delete-orphan',
        order_by=lambda: (ProductImage.is_main.desc(), ProductImage.sort_order.asc(), ProductImage.id.asc())
    )
    cart_items = db.relationship('CartItem', backref='product', lazy=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    reviews = db.relationship('Review', backref='product', lazy=True)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.slug and self.name:
            self.slug = slugify(self.name)
        if not self.sku:
            self.sku = f"PRD-{uuid.uuid4().hex[:8].upper()}"
    
    @property
    def main_image_url(self):
        """
        Get main product image URL.
        Relies on the ordered 'images' relationship to avoid an extra query.
        """
        if self.images:
            return self.images[0].image_url
        return '/static/images/no-image.jpg'
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.compare_price and self.compare_price > self.price:
            return int(((self.compare_price - self.price) / self.compare_price) * 100)
        return 0
    
    @property
    def average_rating(self):
        """Calculate average rating"""
        if self.reviews:
            return sum(review.rating for review in self.reviews) / len(self.reviews)
        return 0
    
    @property
    def review_count(self):
        """Get review count"""
        return len(self.reviews)
    
    def __repr__(self):
        return f'<Product {self.name}>'

class ProductImage(db.Model):
    __tablename__ = 'product_images'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    alt_text = db.Column(db.String(255))
    is_main = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Cart(db.Model):
    __tablename__ = 'carts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade='all, delete-orphan')
    
    # Indexes for better performance
    __table_args__ = (
        db.Index('idx_cart_user_id', 'user_id'),
    )
    
    @property
    def total_amount(self):
        """Calculate total cart amount"""
        return sum(item.total_price for item in self.items)
    
    @property
    def total_items(self):
        """Calculate total items in cart"""
        return sum(item.quantity for item in self.items)

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Price at the time of adding to cart
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @property
    def total_price(self):
        """Calculate total price for cart item"""
        return self.quantity * self.price

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # Nullable for guest orders
    guest_email = db.Column(db.String(120))  # For guest orders
    guest_phone = db.Column(db.String(20))   # For guest orders
    
    # Order details
    status = db.Column(db.String(50), default='pending')  # pending, confirmed, processing, shipped, delivered, cancelled
    payment_status = db.Column(db.String(50), default='pending')  # pending, paid, failed, refunded
    payment_method = db.Column(db.String(50))
    payment_id = db.Column(db.String(100))  # İyzico payment ID
    
    # Amounts
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    shipping_amount = db.Column(db.Numeric(10, 2), default=0)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Shipping details
    shipping_first_name = db.Column(db.String(50))
    shipping_last_name = db.Column(db.String(50))
    shipping_address = db.Column(db.Text)
    shipping_city = db.Column(db.String(50))
    shipping_postal_code = db.Column(db.String(10))
    shipping_phone = db.Column(db.String(20))
    
    # Billing details
    billing_first_name = db.Column(db.String(50))
    billing_last_name = db.Column(db.String(50))
    billing_address = db.Column(db.Text)
    billing_city = db.Column(db.String(50))
    billing_postal_code = db.Column(db.String(10))
    billing_phone = db.Column(db.String(20))
    
    notes = db.Column(db.Text)
    tracking_number = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    # Indexes for better performance
    __table_args__ = (
        db.Index('idx_order_user_status', 'user_id', 'status'),
        db.Index('idx_order_payment_status', 'payment_status'),
        db.Index('idx_order_created_at', 'created_at'),
        db.Index('idx_order_number', 'order_number'),
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.order_number:
            self.order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    def __repr__(self):
        return f'<Order {self.order_number}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Price at the time of order
    total = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Product details at time of order (for historical purposes)
    product_name = db.Column(db.String(200))
    product_sku = db.Column(db.String(50))

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200))
    comment = db.Column(db.Text)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Review {self.rating} stars for {self.product.name}>'

class NewsletterSubscriber(db.Model):
    __tablename__ = 'newsletter_subscribers'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, index=True)
    whatsapp_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.ticket_number:
            self.ticket_number = f"REF-{uuid.uuid4().hex[:2].upper()}{str(uuid.uuid4().int)[:2]}"

class ManualSale(db.Model):
    """Manuel satış kayıtları için model"""
    __tablename__ = 'manual_sales'
    
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(200), nullable=False)
    product_description = db.Column(db.Text)
    customer_name = db.Column(db.String(100))  # Artık opsiyonel
    customer_tc = db.Column(db.String(11))  # TC Kimlik No
    customer_phone = db.Column(db.String(20))
    customer_email = db.Column(db.String(120))
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), default='Nakit')  # Nakit, Kredi Kartı, Havale, vb.
    sale_date = db.Column(db.DateTime, nullable=False, index=True)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='manual_sales')
    
    def __repr__(self):
        return f'<ManualSale {self.product_name} - {self.customer_name or "Anonim"}>'
