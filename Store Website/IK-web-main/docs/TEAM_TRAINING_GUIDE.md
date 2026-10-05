# İnci Gold E-commerce Platform - Team Training Guide

## Overview

This comprehensive training guide provides all necessary information for team members to understand, maintain, and develop the İnci Gold E-commerce Platform. The platform is built with enterprise-level security, performance, and scalability in mind.

## Table of Contents

1. [Platform Architecture](#platform-architecture)
2. [Security Overview](#security-overview)
3. [Development Workflow](#development-workflow)
4. [Deployment Procedures](#deployment-procedures)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Best Practices](#best-practices)
8. [Emergency Procedures](#emergency-procedures)

## Platform Architecture

### System Overview

The İnci Gold platform is built using modern web technologies with a focus on security, performance, and scalability:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (HTML/CSS/JS) │◄──►│   (Flask/Python)│◄──►│   (SQLite/PG)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   Redis Cache   │    │   File Storage  │
│   (CloudFlare)  │    │   (Session)     │    │   (Images)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: Flask 2.3.3
- **Database**: SQLite (development) / PostgreSQL (production)
- **Cache**: Redis 6.0+
- **Authentication**: JWT + Session-based
- **Security**: Flask-Talisman, Flask-WTF, Argon2
- **Payment**: İyzico Enterprise Integration

#### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Responsive design with Flexbox/Grid
- **JavaScript**: Vanilla JS with modern ES6+ features
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter, Poppins)

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **SSL/TLS**: Let's Encrypt certificates
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with rotation

### Key Components

#### 1. Application Core (`app.py`)
- Flask application factory
- Blueprint registration
- Middleware configuration
- Security headers setup

#### 2. Database Models (`models.py`)
- User management
- Product catalog
- Order processing
- Cart management

#### 3. Routes (`routes/`)
- Authentication (`auth.py`)
- Product management (`products.py`)
- Cart operations (`cart.py`)
- Payment processing (`payment.py`)
- Admin panel (`admin.py`)

#### 4. Utilities (`utils/`)
- Email services (`email_utils.py`)
- Security testing (`security_testing.py`)
- Performance optimization (`performance.py`)
- Compliance management (`compliance.py`)

## Security Overview

### Security Architecture

The platform implements multiple layers of security:

#### 1. Application Security
- **CSRF Protection**: Flask-WTF with token validation
- **XSS Prevention**: Input sanitization and output encoding
- **SQL Injection**: Parameterized queries with SQLAlchemy
- **Authentication**: JWT tokens with secure session management
- **Authorization**: Role-based access control (RBAC)

#### 2. Infrastructure Security
- **HTTPS Enforcement**: TLS 1.2+ with HSTS headers
- **Security Headers**: CSP, X-Frame-Options, X-XSS-Protection
- **Rate Limiting**: Redis-based distributed rate limiting
- **Firewall**: UFW with fail2ban integration
- **SSL/TLS**: Let's Encrypt certificates with auto-renewal

#### 3. Data Protection
- **Encryption**: AES-256 for sensitive data
- **Password Hashing**: Argon2 with salt
- **Session Security**: Secure, HttpOnly cookies
- **Data Backup**: Encrypted backups with retention policies

### Security Features

#### Authentication & Authorization
```python
# JWT Token Structure
{
  "user_id": 123,
  "email": "user@example.com",
  "role": "customer",
  "exp": 1640995200,
  "iat": 1640908800
}

# Role-based Access Control
@admin_required
def admin_dashboard():
    # Only admin users can access
    pass

@login_required
def user_profile():
    # Authenticated users only
    pass
```

#### Rate Limiting
```python
# Rate limiting configuration
@limiter.limit("5 per minute")
def login():
    # Login attempts limited to 5 per minute
    pass

@limiter.limit("100 per minute")
def api_endpoint():
    # API calls limited to 100 per minute
    pass
```

#### Security Headers
```python
# Security headers configuration
talisman = Talisman(
    app,
    force_https=True,
    strict_transport_security=True,
    content_security_policy={
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"]
    }
)
```

## Development Workflow

### Getting Started

#### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/ulas27/IK-web.git
cd IK-web

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python init_db.py

# Run development server
python app.py
```

#### 2. Development Tools
```bash
# Code formatting
black .
isort .

# Linting
flake8 .

# Security scanning
bandit -r .
safety check

# Testing
pytest tests/ -v --cov=.
```

### Code Structure

#### Project Layout
```
IK-web/
├── app.py                 # Application entry point
├── models.py              # Database models
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── config/               # Configuration files
│   ├── nginx.conf
│   ├── redis.conf
│   └── prometheus.yml
├── routes/               # Application routes
│   ├── auth.py
│   ├── products.py
│   ├── cart.py
│   ├── payment.py
│   └── admin.py
├── templates/            # HTML templates
│   ├── base.html
│   ├── auth/
│   ├── shop/
│   └── admin/
├── static/              # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── utils/               # Utility modules
│   ├── email_utils.py
│   ├── security_testing.py
│   ├── performance.py
│   └── compliance.py
├── tests/               # Test files
│   ├── test_integration.py
│   ├── test_security.py
│   └── performance/
└── docs/                # Documentation
    ├── API_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    └── TEAM_TRAINING_GUIDE.md
```

#### Coding Standards

##### Python Code Style
```python
# Use type hints
def process_order(order_id: int, user_id: int) -> bool:
    """Process an order for a user.
    
    Args:
        order_id: The ID of the order to process
        user_id: The ID of the user placing the order
        
    Returns:
        True if order was processed successfully, False otherwise
    """
    try:
        order = Order.query.get(order_id)
        if not order:
            logger.warning(f"Order {order_id} not found")
            return False
            
        # Process order logic
        order.status = 'processing'
        db.session.commit()
        
        logger.info(f"Order {order_id} processed for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error processing order {order_id}: {str(e)}")
        db.session.rollback()
        return False
```

##### HTML Template Structure
```html
<!-- Use semantic HTML5 elements -->
<main class="container">
    <header class="page-header">
        <h1>{% block page_title %}Default Title{% endblock %}</h1>
    </header>
    
    <section class="content">
        {% block content %}{% endblock %}
    </section>
    
    <footer class="page-footer">
        {% block footer %}{% endblock %}
    </footer>
</main>
```

##### CSS Organization
```css
/* Use BEM methodology */
.product-card {
    /* Block styles */
}

.product-card__title {
    /* Element styles */
}

.product-card--featured {
    /* Modifier styles */
}

/* Use CSS custom properties */
:root {
    --primary-color: #d4af37;
    --secondary-color: #f8f9fa;
    --text-color: #333;
    --border-radius: 8px;
    --spacing-unit: 1rem;
}
```

### Git Workflow

#### Branch Strategy
```bash
# Main branches
main        # Production-ready code
develop     # Integration branch
feature/*   # Feature development
hotfix/*    # Critical bug fixes
release/*   # Release preparation

# Example workflow
git checkout develop
git pull origin develop
git checkout -b feature/new-payment-method
# ... develop feature ...
git add .
git commit -m "feat: add new payment method integration"
git push origin feature/new-payment-method
# Create pull request to develop
```

#### Commit Message Format
```
type(scope): description

feat(auth): add two-factor authentication
fix(payment): resolve 3D Secure callback issue
docs(api): update payment endpoint documentation
test(cart): add integration tests for guest checkout
refactor(models): optimize database queries
```

## Deployment Procedures

### Pre-Deployment Checklist

#### 1. Code Quality
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] Documentation updated

#### 2. Environment Preparation
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] Backup system operational
- [ ] Monitoring configured

#### 3. Deployment Steps
```bash
# 1. Backup current version
./scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Update dependencies
pip install -r requirements.txt

# 4. Run database migrations
python init_db.py

# 5. Restart services
sudo systemctl restart incigold
sudo systemctl reload nginx

# 6. Verify deployment
curl https://incigold.com/health
```

### Rollback Procedure

```bash
# 1. Stop current version
sudo systemctl stop incigold

# 2. Restore previous version
git checkout <previous-commit-hash>

# 3. Restore database backup
./scripts/restore-db.sh <backup-file>

# 4. Restart services
sudo systemctl start incigold

# 5. Verify rollback
curl https://incigold.com/health
```

## Monitoring & Maintenance

### Monitoring Stack

#### 1. Application Monitoring
- **Health Checks**: `/health` endpoint
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Exception logging and alerting
- **Business Metrics**: Orders, revenue, user activity

#### 2. Infrastructure Monitoring
- **System Metrics**: CPU, memory, disk usage
- **Database Performance**: Query times, connection pools
- **Cache Performance**: Redis hit rates, memory usage
- **Network Monitoring**: Bandwidth, latency

#### 3. Security Monitoring
- **Access Logs**: Failed login attempts, suspicious activity
- **Security Events**: CSRF violations, XSS attempts
- **Compliance Monitoring**: Data access logs, consent tracking

### Maintenance Tasks

#### Daily Tasks
```bash
# Check system health
curl https://incigold.com/health

# Monitor disk space
df -h

# Check error logs
tail -f /var/log/incigold/error.log

# Verify backups
ls -la /var/backups/incigold/
```

#### Weekly Tasks
```bash
# Security log review
grep "FAILED" /var/log/auth.log | tail -100

# Performance metrics review
# Check Grafana dashboard

# Update system packages
sudo apt update && sudo apt upgrade -y
```

#### Monthly Tasks
```bash
# Security audit
python -m utils.security_testing

# Performance optimization review
python -m utils.performance

# Compliance report generation
python -m utils.compliance
```

## Troubleshooting Guide

### Common Issues

#### 1. Application Won't Start

**Symptoms:**
- Service fails to start
- 502 Bad Gateway errors
- Application logs show errors

**Diagnosis:**
```bash
# Check service status
sudo systemctl status incigold

# Check application logs
sudo journalctl -u incigold -f

# Check configuration
python -c "from app import create_app; app = create_app()"
```

**Solutions:**
- Verify environment variables
- Check database connectivity
- Ensure all dependencies are installed
- Verify file permissions

#### 2. Database Connection Issues

**Symptoms:**
- Database connection errors
- Slow query performance
- Connection timeouts

**Diagnosis:**
```bash
# Test database connection
psql -h localhost -U incigold_user -d incigold_prod -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# Monitor database connections
SELECT * FROM pg_stat_activity;
```

**Solutions:**
- Check database service status
- Verify connection parameters
- Review connection pool settings
- Check database logs

#### 3. Performance Issues

**Symptoms:**
- Slow page load times
- High server resource usage
- Timeout errors

**Diagnosis:**
```bash
# Check system resources
htop
iostat -x 1

# Monitor application performance
curl -w "@curl-format.txt" -o /dev/null -s https://incigold.com/

# Check database performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
```

**Solutions:**
- Optimize database queries
- Enable caching
- Scale application servers
- Review CDN configuration

#### 4. Security Issues

**Symptoms:**
- Failed login attempts
- Suspicious activity in logs
- Security alerts

**Diagnosis:**
```bash
# Check security logs
grep "FAILED" /var/log/auth.log
grep "suspicious" /var/log/incigold/security.log

# Run security scan
python -m utils.security_testing

# Check firewall status
sudo ufw status
```

**Solutions:**
- Review and update security policies
- Block suspicious IP addresses
- Update security patches
- Review access controls

### Log Analysis

#### Application Logs
```bash
# Error logs
tail -f /var/log/incigold/error.log

# Access logs
tail -f /var/log/incigold/access.log

# Security logs
tail -f /var/log/incigold/security.log
```

#### System Logs
```bash
# System messages
sudo journalctl -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

## Best Practices

### Development Best Practices

#### 1. Code Quality
- Write comprehensive tests
- Use type hints
- Follow PEP 8 style guide
- Document complex functions
- Use meaningful variable names

#### 2. Security
- Never commit secrets to version control
- Use parameterized queries
- Validate all input data
- Implement proper error handling
- Keep dependencies updated

#### 3. Performance
- Optimize database queries
- Use caching appropriately
- Minimize external API calls
- Compress static assets
- Use CDN for static content

#### 4. Maintenance
- Regular security updates
- Monitor system performance
- Backup data regularly
- Review logs frequently
- Document changes

### Operational Best Practices

#### 1. Deployment
- Test in staging environment
- Use blue-green deployments
- Monitor deployment health
- Have rollback plan ready
- Communicate changes to team

#### 2. Monitoring
- Set up comprehensive alerting
- Monitor key business metrics
- Track performance trends
- Review security events
- Plan for capacity scaling

#### 3. Security
- Regular security audits
- Keep systems updated
- Monitor access logs
- Implement least privilege
- Train team on security

## Emergency Procedures

### Incident Response

#### 1. Security Incident
```bash
# 1. Assess the situation
# Check security logs and alerts

# 2. Contain the threat
# Block suspicious IPs
sudo ufw deny from <suspicious-ip>

# 3. Preserve evidence
# Copy relevant logs
sudo cp /var/log/incigold/security.log /tmp/security-incident-$(date +%Y%m%d).log

# 4. Notify stakeholders
# Send alert to security team
# Document incident details

# 5. Recovery
# Apply security patches
# Update security policies
# Review access controls
```

#### 2. System Outage
```bash
# 1. Assess impact
# Check service status
sudo systemctl status incigold nginx postgresql redis

# 2. Quick fixes
# Restart services
sudo systemctl restart incigold

# 3. Escalation
# Notify management
# Activate backup systems

# 4. Recovery
# Restore from backup if needed
# Verify system functionality
# Document incident
```

#### 3. Data Loss
```bash
# 1. Stop all writes
# Prevent further data loss
sudo systemctl stop incigold

# 2. Assess damage
# Check database integrity
psql -h localhost -U incigold_user -d incigold_prod -c "SELECT COUNT(*) FROM users;"

# 3. Restore from backup
./scripts/restore-db.sh <latest-backup>

# 4. Verify data integrity
# Run data validation scripts
# Check application functionality

# 5. Resume operations
sudo systemctl start incigold
```

### Contact Information

#### Emergency Contacts
- **Technical Lead**: tech-lead@incigold.com
- **DevOps Engineer**: devops@incigold.com
- **Security Team**: security@incigold.com
- **Management**: management@incigold.com

#### External Services
- **Hosting Provider**: support@hosting-provider.com
- **Domain Registrar**: support@domain-registrar.com
- **SSL Certificate**: support@letsencrypt.org
- **Payment Gateway**: support@iyzico.com

### Escalation Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical | 15 minutes | CTO, CEO |
| High | 1 hour | Technical Lead |
| Medium | 4 hours | Team Lead |
| Low | 24 hours | Developer |

## Training Resources

### Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Security Policies](SECURITY_POLICIES.md)
- [Performance Guidelines](PERFORMANCE_GUIDELINES.md)

### External Resources
- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Redis Documentation](https://redis.io/documentation)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Training Schedule

#### Week 1: Platform Overview
- System architecture
- Technology stack
- Development environment setup
- Basic operations

#### Week 2: Development
- Code structure and standards
- Git workflow
- Testing procedures
- Code review process

#### Week 3: Security
- Security architecture
- Authentication and authorization
- Data protection
- Incident response

#### Week 4: Operations
- Deployment procedures
- Monitoring and maintenance
- Troubleshooting
- Emergency procedures

### Assessment

#### Knowledge Check
- [ ] Can explain system architecture
- [ ] Can set up development environment
- [ ] Can deploy application
- [ ] Can troubleshoot common issues
- [ ] Can respond to security incidents
- [ ] Can perform maintenance tasks

#### Practical Exercises
1. Set up local development environment
2. Deploy application to staging
3. Perform security audit
4. Troubleshoot simulated issues
5. Execute emergency procedures

## Conclusion

This training guide provides comprehensive coverage of the İnci Gold E-commerce Platform. Regular review and updates of this documentation ensure that team members stay current with platform capabilities and best practices.

For questions or clarifications, please contact the technical team at tech-team@incigold.com.
