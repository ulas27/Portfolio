# İnci Gold E-commerce Production Deployment Guide

Bu doküman, İnci Gold e-ticaret platformunun production ortamına dağıtımı için gerekli tüm adımları içermektedir.

## 📋 Ön Koşullar

### Sistem Gereksinimleri
- **Ubuntu 20.04+** veya **CentOS 7+**
- **Python 3.11+**
- **PostgreSQL 13+** (önerilen) veya **MySQL 8.0+**
- **Redis 6.0+**
- **Nginx**
- **SSL Sertifikası** (Let's Encrypt)
- **Domain** (production domain)

### Network Gereksinimleri
- **80/443 portları** açık
- **Domain DNS** yapılandırması tamamlanmış
- **Firewall** yapılandırması

## 🚀 Deployment Adımları

### 1. Sunucu Hazırlığı

#### 1.1 Sistem Güncellemeleri
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git htop vim ufw
```

#### 1.2 Güvenlik Yapılandırması
```bash
# Firewall yapılandırması
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# SSH güvenliği
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Fail2Ban kurulumu
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

#### 1.3 Python ve Pip Kurulumu
```bash
sudo apt install python3 python3-pip python3-venv
python3 --version
pip3 --version
```

### 2. Veritabanı Kurulumu

#### PostgreSQL Kurulumu (Önerilen)
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Veritabanı ve kullanıcı oluşturma
sudo -u postgres psql
```

```sql
CREATE DATABASE inci_gold_prod;
CREATE USER inci_gold_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE inci_gold_prod TO inci_gold_user;
ALTER USER inci_gold_user CREATEDB;
\q
```

#### Redis Kurulumu
```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Redis yapılandırması
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
sudo systemctl restart redis-server
```

### 3. Uygulama Dağıtımı

#### 3.1 Uygulama Dosyalarını Kopyalama
```bash
# Uygulama dizini oluşturma
sudo mkdir -p /var/www/inci-gold
cd /var/www/inci-gold

# Git ile kod çekme (private repo için SSH key gerekli)
git clone https://github.com/your-repo/inci-gold.git .
# veya
git clone git@github.com:your-repo/inci-gold.git .

# Uygulama sahibi oluşturma
sudo useradd -m -s /bin/bash inci-gold
sudo chown -R inci-gold:inci-gold /var/www/inci-gold
```

#### 3.2 Python Environment Kurulumu
```bash
sudo -u inci-gold bash
cd /var/www/inci-gold

# Virtual environment oluşturma
python3 -m venv venv
source venv/bin/activate

# Bağımlılıkları yükleme
pip install -r requirements.txt
pip install gunicorn

# Development bağımlılıklarını temizleme
pip uninstall -y Werkzeug flask-debugtoolbar
```

#### 3.3 Environment Variables Yapılandırması
```bash
# .env dosyası oluşturma
cp .env.example .env

# Production değerlerini düzenleme
nano .env
```

**Önemli Production Değerleri:**
```bash
# Production settings
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-secure-random-key-here

# Database
DATABASE_URL=postgresql://inci_gold_user:strong_password_here@localhost/inci_gold_prod

# Email (production SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-production-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-production-email@gmail.com

# Iyzico Production API Keys
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com

# Security
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax
FORCE_HTTPS=True

# Redis
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
```

### 4. Veritabanı Başlatma

#### 4.1 İlk Veri Yükleme
```bash
# Virtual environment aktifleştirme
source venv/bin/activate

# Veritabanı tablolarını oluşturma
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"

# İlk verileri yükleme
python init_db.py
```

#### 4.2 Veritabanı Yedekleme Sistemi
```bash
# Yedekleme scripti çalıştırma yetkisi
chmod +x backup_db.py

# Test yedeklemesi
python backup_db.py
```

### 5. Web Sunucusu Yapılandırması

#### 5.1 Gunicorn Yapılandırması
**gunicorn.conf.py oluşturma:**
```python
# Gunicorn configuration for production
bind = "127.0.0.1:8000"
workers = 4
worker_class = "gevent"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
user = "inci-gold"
group = "inci-gold"
tmp_upload_dir = None
accesslog = "/var/www/inci-gold/logs/gunicorn_access.log"
errorlog = "/var/www/inci-gold/logs/gunicorn_error.log"
loglevel = "info"
```

#### 5.2 Systemd Service Oluşturma
**/etc/systemd/system/inci-gold.service:**
```ini
[Unit]
Description=Inci Gold E-commerce Application
After=network.target postgresql.service redis-server.service

[Service]
User=inci-gold
Group=inci-gold
WorkingDirectory=/var/www/inci-gold
Environment="PATH=/var/www/inci-gold/venv/bin"
ExecStart=/var/www/inci-gold/venv/bin/gunicorn --config gunicorn.conf.py app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable inci-gold
sudo systemctl start inci-gold
```

#### 5.3 Nginx Yapılandırması
**/etc/nginx/sites-available/inci-gold:**
```nginx
# Upstream to Gunicorn
upstream inci_gold_app {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';";

    # Static files
    location /static/ {
        alias /var/www/inci-gold/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /uploads/ {
        alias /var/www/inci-gold/static/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Application
    location / {
        proxy_pass http://inci_gold_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check
    location /health {
        proxy_pass http://inci_gold_app;
        access_log off;
    }
}
```

```bash
# Site'yi aktifleştirme
sudo ln -s /etc/nginx/sites-available/inci-gold /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Sertifikası Kurulumu

#### Let's Encrypt ile SSL
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Cron job for auto-renewal (already configured by certbot)
sudo crontab -l | grep certbot
```

### 7. Monitoring ve Log Yapılandırması

#### 7.1 Log Rotation
**/etc/logrotate.d/inci-gold:**
```
/var/www/inci-gold/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 inci-gold inci-gold
    postrotate
        systemctl reload inci-gold
    endscript
}
```

#### 7.2 Monitoring (İsteğe bağlı)
```bash
# Prometheus kurulumu
sudo apt install prometheus prometheus-node-exporter

# Grafana kurulumu
sudo apt install grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### 8. Backup Sistemi

#### 8.1 Otomatik Backup Cron Job
```bash
# Crontab düzenleme
sudo -u inci-gold crontab -e

# Her gün 02:00'te yedekleme
0 2 * * * cd /var/www/inci-gold && python backup_db.py

# Her pazar 03:00'te tam yedekleme
0 3 * * 0 cd /var/www/inci-gold && python backup_db.py --full
```

#### 8.2 Off-site Backup (Önerilen)
```bash
# AWS S3 backup scripti (örnek)
pip install boto3

# backup_to_s3.py scripti oluşturma ve yapılandırma
# AWS credentials ve bucket bilgileri gerekli
```

### 9. Güvenlik Denetimleri

#### 9.1 Son Güvenlik Kontrolleri
```bash
# Dosya izinlerini kontrol etme
sudo find /var/www/inci-gold -type f -name "*.py" -exec chmod 644 {} \;
sudo find /var/www/inci-gold -type d -exec chmod 755 {} \;
sudo chown -R inci-gold:inci-gold /var/www/inci-gold

# Güvenlik güncellemeleri
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y

# UFW durum kontrolü
sudo ufw status
```

#### 9.2 Penetration Testing
```bash
# SSL test
sslscan your-domain.com

# Security headers test
curl -I https://your-domain.com

# SQL injection test (manuel)
# XSS test (manuel)
```

### 10. Production Go-Live Checklist

#### ✅ Teknik Kontroller
- [ ] Domain DNS yapılandırması tamamlandı
- [ ] SSL sertifikası aktif
- [ ] Nginx yapılandırması doğru
- [ ] Gunicorn servis çalışıyor
- [ ] Veritabanı bağlantısı çalışıyor
- [ ] Redis bağlantısı çalışıyor
- [ ] Email servisi çalışıyor
- [ ] Backup sistemi aktif
- [ ] Log rotation yapılandırıldı

#### ✅ Uygulama Kontrolleri
- [ ] Admin panel erişimi çalışıyor
- [ ] Ürün listesi yükleniyor
- [ ] Sepet işlemleri çalışıyor
- [ ] Ödeme entegrasyonu test edildi
- [ ] Newsletter sistemi çalışıyor
- [ ] İletişim formu çalışıyor

#### ✅ Güvenlik Kontrolleri
- [ ] Security headers aktif
- [ ] CSRF koruması aktif
- [ ] XSS koruması aktif
- [ ] SQL injection koruması aktif
- [ ] Rate limiting aktif
- [ ] SSL/TLS yapılandırması güvenli

#### ✅ Performance Kontrolleri
- [ ] Sayfa yükleme süreleri < 2 saniye
- [ ] Veritabanı sorguları optimize edildi
- [ ] Static dosyalar cache edildi
- [ ] CDN yapılandırması tamamlandı

## 🔧 Troubleshooting

### Yaygın Problemler

#### Uygulama Başlatılmıyor
```bash
# Log kontrolü
sudo journalctl -u inci-gold -f

# Gunicorn log kontrolü
tail -f /var/www/inci-gold/logs/gunicorn_error.log
```

#### Veritabanı Bağlantı Problemi
```bash
# PostgreSQL durum kontrolü
sudo systemctl status postgresql

# Bağlantı testi
sudo -u inci-gold psql -h localhost -U inci_gold_user -d inci_gold_prod
```

#### Nginx 502 Hatası
```bash
# Gunicorn durum kontrolü
sudo systemctl status inci-gold

# Port kontrolü
netstat -tlnp | grep 8000
```

#### SSL Sorunları
```bash
# Sertifika kontrolü
sudo certbot certificates

# Nginx yapılandırma testi
sudo nginx -t
```

## 📊 Monitoring ve Bakım

### Günlük Bakım Görevleri
1. **Log analizi**: `/var/www/inci-gold/logs/` dizinindeki log dosyalarını kontrol etme
2. **Disk kullanımı**: `df -h` ile disk doluluk kontrolü
3. **Memory kullanımı**: `htop` ile sistem kaynakları kontrolü
4. **Backup durumu**: Yedekleme dosyalarının varlığını kontrol etme

### Haftalık Bakım Görevleri
1. **Güvenlik güncellemeleri**: `sudo apt update && sudo apt upgrade`
2. **Log rotation**: Log dosyalarının düzgün döndüğünü kontrol etme
3. **Backup testi**: Yedekleme dosyalarının geri yüklenebilirliğini test etme

### Aylık Bakım Görevleri
1. **SSL sertifikası**: Sertifika yenileme durumunu kontrol etme
2. **Veritabanı optimizasyonu**: `VACUUM` ve index optimizasyonu
3. **Performance monitoring**: Uygulama performans metriklerini analiz etme

## 🚨 Emergency Procedures

### Site Down Durumunda
1. **İlk kontrol**: `sudo systemctl status inci-gold nginx postgresql redis-server`
2. **Log kontrolü**: Uygulama ve sistem loglarını inceleme
3. **Restart**: `sudo systemctl restart inci-gold nginx`
4. **Backup kontrolü**: Son yedeklemenin durumunu kontrol etme

### Veri Kaybı Durumunda
1. **Backup kontrolü**: En son yedekleme dosyasını bulma
2. **Test restore**: Geliştirme ortamında yedekleme geri yükleme testi
3. **Production restore**: Dikkatlice production ortamına geri yükleme

## 📞 Destek ve İletişim

Production deployment sonrası sorunlar için:
- **Log dosyaları**: `/var/www/inci-gold/logs/`
- **Sistem logları**: `sudo journalctl -u inci-gold`
- **Backup dosyaları**: `/var/www/inci-gold/backups/`

Bu dokümanda belirtilen tüm adımlar tamamlandıktan sonra uygulama production-ready olacaktır.
