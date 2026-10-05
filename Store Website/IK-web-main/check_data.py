#!/usr/bin/env python3
"""
Mevcut veritabanı içeriğini kontrol et
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Category, Product, User

def check_current_data():
    app = create_app()
    with app.app_context():
        print("=== MEVCUT VERİTABANI DURUMU ===")
        print()
        
        # Kategoriler
        categories = Category.query.all()
        print(f"Kategoriler ({len(categories)} adet):")
        for cat in categories:
            print(f"  - {cat.name} (ID: {cat.id})")
        print()
        
        # Ürünler
        products = Product.query.all()
        print(f"Urunler ({len(products)} adet):")
        for prod in products:
            category_name = prod.category.name if prod.category else "Kategori Yok"
            print(f"  - {prod.name} - {prod.price} TL (Kategori: {category_name})")
        print()
        
        # Kullanıcılar
        users = User.query.all()
        print(f"Kullanicilar ({len(users)} adet):")
        for user in users:
            admin_status = " (Admin)" if user.is_admin else ""
            print(f"  - {user.username} - {user.email}{admin_status}")
        print()
        
        # Upload klasörleri
        print("Upload Klasorleri:")
        upload_dirs = ['static/uploads/categories', 'static/uploads/products']
        for upload_dir in upload_dirs:
            if os.path.exists(upload_dir):
                files = os.listdir(upload_dir)
                print(f"  - {upload_dir}: {len(files)} dosya")
            else:
                print(f"  - {upload_dir}: Klasör yok")

if __name__ == "__main__":
    check_current_data()
