#!/usr/bin/env python3
"""
Database Initialization Script for İnci Gold E-commerce Platform

This script initializes the database with default data (admin user, categories)
in an idempotent manner - it will not create duplicates if data already exists.

Usage:
    python init_db.py

The script will:
1. Create database tables if they don't exist
2. Create default admin user if not exists
3. Create default categories if not exist
4. Create backup before any operations
"""

import logging
import os
import sys
from datetime import datetime

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import Category, User, db
from backup_db import backup_database

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def init_database():
    """Initialize the database with default data if it doesn't already exist."""
    logging.info("Starting database initialization...")
    app = create_app()

    with app.app_context():
        try:
            logging.info("Creating database backup...")
            backup_file = backup_database()
            if backup_file:
                logging.info(f"Backup created: {backup_file}")
            else:
                logging.warning("Backup creation failed, continuing without backup.")

            logging.info("Creating database tables if they don't exist...")
            db.create_all()

            admin_user = User.query.filter_by(is_admin=True).first()
            if not admin_user:
                logging.info("Creating default admin user...")
                admin = User(
                    username='admin',
                    email='admin@incigold.com',
                    first_name='Admin',
                    last_name='User',
                    is_admin=True,
                    is_active=True,
                    email_verified=True
                )
                admin.set_password(os.getenv('ADMIN_DEFAULT_PASSWORD', 'Admin123!'))
                db.session.add(admin)
            else:
                logging.info("Admin user already exists.")

            default_categories = [
                {'name': 'Kolye', 'slug': 'kolye', 'description': 'Altın ve gümüş kolyeler'},
                {'name': 'Küpe', 'slug': 'kupe', 'description': 'Altın ve gümüş küpeler'},
                {'name': 'Yüzük', 'slug': 'yuzuk', 'description': 'Altın ve gümüş yüzükler'},
                {'name': 'Bileklik', 'slug': 'bileklik', 'description': 'Altın ve gümüş bileklikler'}
            ]

            categories_created_count = 0
            for cat_data in default_categories:
                if not Category.query.filter_by(slug=cat_data['slug']).first():
                    category = Category(**cat_data)
                    db.session.add(category)
                    categories_created_count += 1
            
            if categories_created_count > 0:
                logging.info(f"Created {categories_created_count} default categories.")
            else:
                logging.info("Default categories already exist.")

            db.session.commit()
            logging.info("Database initialization completed successfully.")
            return True

        except Exception as e:
            db.session.rollback()
            logging.error(f"Database initialization failed: {e}", exc_info=True)
            return False

if __name__ == '__main__':
    if init_database():
        logging.info("Database is ready.")
    else:
        sys.exit(1)
