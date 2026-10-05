#!/usr/bin/env python3
"""
Basit veritabanı yedekleme scripti
"""

import os
import shutil
from datetime import datetime

def backup_database():
    """Veritabanını yedekle"""
    # Mevcut dizini al
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "instance", "kuyumcu.db")
    backup_dir = os.path.join(current_dir, "backups")
    
    # Backup dizinini oluştur
    os.makedirs(backup_dir, exist_ok=True)
    
    # Tarih damgası ile yedek dosya adı
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"kuyumcu_backup_{timestamp}.db"
    backup_path = os.path.join(backup_dir, backup_filename)
    
    # Veritabanını kopyala
    if os.path.exists(db_path):
        shutil.copy2(db_path, backup_path)
        print(f"[OK] Veritabani yedeklendi: {backup_path}")
        return backup_path
    else:
        print("[HATA] Veritabani dosyasi bulunamadi!")
        return None

def restore_database(backup_path):
    """Veritabanını geri yükle"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "instance", "kuyumcu.db")
    
    if os.path.exists(backup_path):
        shutil.copy2(backup_path, db_path)
        print(f"[OK] Veritabani geri yuklendi: {backup_path}")
        return True
    else:
        print("[HATA] Yedek dosyasi bulunamadi!")
        return False

def list_backups():
    """Mevcut yedekleri listele"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = os.path.join(current_dir, "backups")
    
    if not os.path.exists(backup_dir):
        print("[HATA] Yedek dizini bulunamadi!")
        return []
    
    backups = []
    for file in os.listdir(backup_dir):
        if file.startswith("kuyumcu_backup_") and file.endswith(".db"):
            file_path = os.path.join(backup_dir, file)
            file_time = os.path.getmtime(file_path)
            backups.append((file, file_time))
    
    # Tarihe göre sırala (en yeni önce)
    backups.sort(key=lambda x: x[1], reverse=True)
    
    print("Mevcut Yedekler:")
    for i, (filename, file_time) in enumerate(backups, 1):
        date_str = datetime.fromtimestamp(file_time).strftime("%Y-%m-%d %H:%M:%S")
        print(f"  {i}. {filename} ({date_str})")
    
    return [backup[0] for backup in backups]

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Kullanım:")
        print("  python backup_db.py backup     - Veritabanını yedekle")
        print("  python backup_db.py list       - Yedekleri listele")
        print("  python backup_db.py restore    - Yedekten geri yükle")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "backup":
        backup_database()
    elif command == "list":
        list_backups()
    elif command == "restore":
        backups = list_backups()
        if backups:
            print(f"\nEn son yedek: {backups[0]}")
            current_dir = os.path.dirname(os.path.abspath(__file__))
            restore_database(os.path.join(current_dir, "backups", backups[0]))
        else:
            print("[HATA] Geri yuklenecek yedek bulunamadi!")
    else:
        print("[HATA] Gecersiz komut!")
