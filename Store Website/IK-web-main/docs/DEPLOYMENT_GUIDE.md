# İnci Gold E-commerce Platform - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the İnci Gold E-commerce Platform to production environments. The platform supports multiple deployment strategies including Docker, Kubernetes, and traditional server deployment.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

### Software Dependencies

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Python**: 3.11+
- **Node.js**: 18+ (for build tools)
- **Nginx**: 1.18+
- **Redis**: 6.0+
- **PostgreSQL**: 13+ (optional, SQLite for development)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/ulas27/IK-web.git
cd IK-web
```

### 2. Environment Configuration

Create production environment file:

```bash
cp .env.example .env.production
```

Edit `.env.production`:

```env
# Application
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DEBUG=False

# Database
SQLALCHEMY_DATABASE_URI=postgresql://user:password@localhost:5432/incigold_prod
# Or for SQLite: sqlite:///incigold_production.db

# Redis
REDIS_URL=redis://localhost:6379/0

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=İnci Gold <noreply@incigold.com>

# Payment Gateway (İyzico)
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com

# Security
RECAPTCHA_PUBLIC_KEY=your-recaptcha-public-key
RECAPTCHA_PRIVATE_KEY=your-recaptcha-private-key
FORCE_HTTPS=True
SESSION_COOKIE_SECURE=True

# CDN
CDN_ENABLED=True
CDN_PROVIDER=cloudflare
CDN_DOMAIN=cdn.incigold.com
CDN_API_KEY=your-cloudflare-api-key
CDN_ZONE_ID=your-cloudflare-zone-id

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO

# Backup
BACKUP_DIR=/var/backups/incigold
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key

# Domain
DOMAIN=incigold.com
BASE_URL=https://incigold.com
```

### 3. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d incigold.com -d www.incigold.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Cloudflare (Alternative)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption mode: "Full (strict)"
4. Enable "Always Use HTTPS"

## Deployment Methods

### Method 1: Docker Compose (Recommended)

#### 1. Production Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### 2. Initialize Database

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec app python init_db.py

# Create admin user
docker-compose -f docker-compose.prod.yml exec app python -c "
from app import create_app, db
from models import User
app = create_app()
with app.app_context():
    admin = User(
        email='admin@incigold.com',
        first_name='Admin',
        last_name='User',
        is_admin=True
    )
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    print('Admin user created')
"
```

#### 3. Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Test health endpoint
curl https://incigold.com/health
```

### Method 2: Kubernetes Deployment

#### 1. Create Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: incigold
```

#### 2. ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: incigold-config
  namespace: incigold
data:
  FLASK_ENV: "production"
  REDIS_URL: "redis://redis-service:6379/0"
  # Add other non-sensitive config
```

#### 3. Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: incigold-secrets
  namespace: incigold
type: Opaque
data:
  SECRET_KEY: <base64-encoded-secret-key>
  DATABASE_URL: <base64-encoded-database-url>
  IYZICO_API_KEY: <base64-encoded-iyzico-api-key>
  # Add other sensitive config
```

#### 4. Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: incigold-app
  namespace: incigold
spec:
  replicas: 3
  selector:
    matchLabels:
      app: incigold-app
  template:
    metadata:
      labels:
        app: incigold-app
    spec:
      containers:
      - name: app
        image: incigold/web:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: incigold-config
        - secretRef:
            name: incigold-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 5. Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: incigold-service
  namespace: incigold
spec:
  selector:
    app: incigold-app
  ports:
  - port: 80
    targetPort: 5000
  type: ClusterIP
```

#### 6. Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: incigold-ingress
  namespace: incigold
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - incigold.com
    - www.incigold.com
    secretName: incigold-tls
  rules:
  - host: incigold.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: incigold-service
            port:
              number: 80
```

#### 7. Deploy to Kubernetes

```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n incigold
kubectl get services -n incigold
kubectl get ingress -n incigold
```

### Method 3: Traditional Server Deployment

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.11 python3.11-venv python3.11-dev
sudo apt install nginx redis-server postgresql postgresql-contrib
sudo apt install git curl wget

# Install Node.js (for build tools)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

#### 2. Setup Application

```bash
# Create application user
sudo useradd -m -s /bin/bash incigold
sudo usermod -aG sudo incigold

# Switch to application user
sudo su - incigold

# Clone repository
git clone https://github.com/ulas27/IK-web.git
cd IK-web

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Configure Database

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
createdb incigold_prod
createuser incigold_user
psql -c "ALTER USER incigold_user PASSWORD 'secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE incigold_prod TO incigold_user;"

# Exit postgres user
exit
```

#### 4. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/incigold
```

```nginx
server {
    listen 80;
    server_name incigold.com www.incigold.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name incigold.com www.incigold.com;

    ssl_certificate /etc/letsencrypt/live/incigold.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/incigold.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /static/ {
        alias /home/incigold/IK-web/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Application
    location / {
        proxy_pass http://127.0.0.1:5000;
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
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/incigold /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 5. Create Systemd Service

```bash
sudo nano /etc/systemd/system/incigold.service
```

```ini
[Unit]
Description=İnci Gold E-commerce Application
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=incigold
Group=incigold
WorkingDirectory=/home/incigold/IK-web
Environment=PATH=/home/incigold/IK-web/venv/bin
ExecStart=/home/incigold/IK-web/venv/bin/gunicorn --bind 127.0.0.1:5000 --workers 4 --timeout 120 app:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable incigold
sudo systemctl start incigold
sudo systemctl status incigold
```

## Database Setup

### PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb incigold_prod

# Create user
sudo -u postgres createuser incigold_user
sudo -u postgres psql -c "ALTER USER incigold_user PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE incigold_prod TO incigold_user;"

# Initialize database
python init_db.py
```

### Redis Setup

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

```conf
# Basic configuration
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 60

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your_redis_password
```

```bash
# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'incigold-app'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

### Grafana Dashboard

1. Install Grafana
2. Import dashboard from `monitoring/grafana-dashboard.json`
3. Configure data source to point to Prometheus

## Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/incigold"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="incigold_prod"
DB_USER="incigold_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /home/incigold/IK-web

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/incigold/backup.sh
```

## Security Hardening

### Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

```bash
# Start Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Performance Optimization

### Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### Application Optimization

```python
# gunicorn.conf.py
bind = "127.0.0.1:5000"
workers = 4
worker_class = "gevent"
worker_connections = 1000
timeout = 120
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
sudo journalctl -u incigold -f

# Check configuration
python -c "from app import create_app; app = create_app(); print('Config OK')"
```

#### 2. Database Connection Issues

```bash
# Test database connection
psql -h localhost -U incigold_user -d incigold_prod -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql
```

#### 3. Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis status
sudo systemctl status redis-server
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Log Locations

- **Application logs**: `/var/log/incigold/`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`
- **PostgreSQL logs**: `/var/log/postgresql/`
- **Redis logs**: `/var/log/redis/`

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Check application health: `curl https://incigold.com/health`
- Monitor disk space: `df -h`
- Check error logs

#### Weekly
- Review security logs
- Check backup status
- Update system packages

#### Monthly
- Review performance metrics
- Update SSL certificates
- Security audit

### Update Procedure

```bash
# 1. Backup current version
./backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Update dependencies
pip install -r requirements.txt

# 4. Run migrations
python init_db.py

# 5. Restart services
sudo systemctl restart incigold
sudo systemctl reload nginx

# 6. Verify deployment
curl https://incigold.com/health
```

## Support

For deployment support:
- Email: devops@incigold.com
- Documentation: https://docs.incigold.com
- Status Page: https://status.incigold.com
