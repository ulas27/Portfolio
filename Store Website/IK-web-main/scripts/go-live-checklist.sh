#!/bin/bash

# İnci Gold E-commerce Platform - Go-Live Checklist
# Production deployment validation script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="incigold.com"
BASE_URL="https://incigold.com"
ADMIN_EMAIL="admin@incigold.com"
BACKUP_DIR="/var/backups/incigold"

# Logging
LOG_FILE="/var/log/incigold/go-live-$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a $LOG_FILE)
exec 2>&1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}İnci Gold Go-Live Checklist${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗ FAIL${NC} - $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠ WARN${NC} - $message"
    else
        echo -e "${BLUE}ℹ INFO${NC} - $message"
    fi
}

# Function to check HTTP response
check_http() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30)
    
    if [ "$response" = "$expected_status" ]; then
        print_status "PASS" "$description (HTTP $response)"
    else
        print_status "FAIL" "$description (HTTP $response, expected $expected_status)"
    fi
}

# Function to check service status
check_service() {
    local service=$1
    local description=$2
    
    if systemctl is-active --quiet "$service"; then
        print_status "PASS" "$description is running"
    else
        print_status "FAIL" "$description is not running"
    fi
}

# Function to check port
check_port() {
    local port=$1
    local description=$2
    
    if netstat -tuln | grep -q ":$port "; then
        print_status "PASS" "$description is listening on port $port"
    else
        print_status "FAIL" "$description is not listening on port $port"
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    
    expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    if [ -n "$expiry_date" ]; then
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ $days_until_expiry -gt 30 ]; then
            print_status "PASS" "SSL certificate valid for $days_until_expiry days"
        elif [ $days_until_expiry -gt 7 ]; then
            print_status "WARN" "SSL certificate expires in $days_until_expiry days"
        else
            print_status "FAIL" "SSL certificate expires in $days_until_expiry days"
        fi
    else
        print_status "FAIL" "SSL certificate check failed"
    fi
}

echo -e "\n${BLUE}1. SYSTEM SERVICES CHECK${NC}"
echo "================================"

check_service "incigold" "İnci Gold Application"
check_service "nginx" "Nginx Web Server"
check_service "postgresql" "PostgreSQL Database"
check_service "redis-server" "Redis Cache"
check_service "fail2ban" "Fail2Ban Security"

echo -e "\n${BLUE}2. NETWORK CONNECTIVITY CHECK${NC}"
echo "=================================="

check_port "80" "HTTP"
check_port "443" "HTTPS"
check_port "5000" "Application"
check_port "5432" "PostgreSQL"
check_port "6379" "Redis"

echo -e "\n${BLUE}3. SSL/TLS CERTIFICATE CHECK${NC}"
echo "================================="

check_ssl "$DOMAIN"
check_ssl "www.$DOMAIN"

echo -e "\n${BLUE}4. APPLICATION ENDPOINTS CHECK${NC}"
echo "=================================="

check_http "$BASE_URL/" "200" "Homepage"
check_http "$BASE_URL/shop" "200" "Shop Page"
check_http "$BASE_URL/about" "200" "About Page"
check_http "$BASE_URL/contact" "200" "Contact Page"
check_http "$BASE_URL/health" "200" "Health Check"
check_http "$BASE_URL/auth/login" "200" "Login Page"
check_http "$BASE_URL/auth/register" "200" "Registration Page"

echo -e "\n${BLUE}5. SECURITY HEADERS CHECK${NC}"
echo "============================="

security_headers=$(curl -s -I "$BASE_URL/" | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security|Content-Security-Policy)")

if echo "$security_headers" | grep -q "X-Frame-Options"; then
    print_status "PASS" "X-Frame-Options header present"
else
    print_status "FAIL" "X-Frame-Options header missing"
fi

if echo "$security_headers" | grep -q "X-Content-Type-Options"; then
    print_status "PASS" "X-Content-Type-Options header present"
else
    print_status "FAIL" "X-Content-Type-Options header missing"
fi

if echo "$security_headers" | grep -q "Strict-Transport-Security"; then
    print_status "PASS" "Strict-Transport-Security header present"
else
    print_status "FAIL" "Strict-Transport-Security header missing"
fi

echo -e "\n${BLUE}6. DATABASE CONNECTIVITY CHECK${NC}"
echo "=================================="

if psql -h localhost -U incigold_user -d incigold_prod -c "SELECT 1;" >/dev/null 2>&1; then
    print_status "PASS" "Database connection successful"
else
    print_status "FAIL" "Database connection failed"
fi

# Check database tables
tables=$(psql -h localhost -U incigold_user -d incigold_prod -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ "$tables" -gt 0 ]; then
    print_status "PASS" "Database tables exist ($tables tables)"
else
    print_status "FAIL" "No database tables found"
fi

echo -e "\n${BLUE}7. REDIS CONNECTIVITY CHECK${NC}"
echo "==============================="

if redis-cli ping >/dev/null 2>&1; then
    print_status "PASS" "Redis connection successful"
else
    print_status "FAIL" "Redis connection failed"
fi

# Check Redis memory usage
redis_memory=$(redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
print_status "INFO" "Redis memory usage: $redis_memory"

echo -e "\n${BLUE}8. EMAIL SERVICE CHECK${NC}"
echo "=========================="

# Check if email configuration is valid
if [ -n "$MAIL_USERNAME" ] && [ -n "$MAIL_PASSWORD" ]; then
    print_status "PASS" "Email configuration present"
else
    print_status "WARN" "Email configuration incomplete"
fi

echo -e "\n${BLUE}9. PAYMENT GATEWAY CHECK${NC}"
echo "============================="

# Check İyzico configuration
if [ -n "$IYZICO_API_KEY" ] && [ -n "$IYZICO_SECRET_KEY" ]; then
    print_status "PASS" "İyzico payment gateway configured"
else
    print_status "WARN" "İyzico payment gateway not configured"
fi

echo -e "\n${BLUE}10. BACKUP SYSTEM CHECK${NC}"
echo "============================="

if [ -d "$BACKUP_DIR" ]; then
    backup_count=$(find "$BACKUP_DIR" -name "*.gz" -mtime -1 | wc -l)
    if [ "$backup_count" -gt 0 ]; then
        print_status "PASS" "Recent backups found ($backup_count backups)"
    else
        print_status "WARN" "No recent backups found"
    fi
else
    print_status "FAIL" "Backup directory not found"
fi

echo -e "\n${BLUE}11. MONITORING SYSTEM CHECK${NC}"
echo "================================="

# Check if monitoring tools are running
if systemctl is-active --quiet prometheus; then
    print_status "PASS" "Prometheus monitoring is running"
else
    print_status "WARN" "Prometheus monitoring not running"
fi

if systemctl is-active --quiet grafana-server; then
    print_status "PASS" "Grafana dashboard is running"
else
    print_status "WARN" "Grafana dashboard not running"
fi

echo -e "\n${BLUE}12. PERFORMANCE CHECK${NC}"
echo "========================"

# Check response time
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/" --max-time 30)
response_time_ms=$(echo "$response_time * 1000" | bc)

if (( $(echo "$response_time_ms < 1000" | bc -l) )); then
    print_status "PASS" "Homepage response time: ${response_time_ms}ms"
elif (( $(echo "$response_time_ms < 3000" | bc -l) )); then
    print_status "WARN" "Homepage response time: ${response_time_ms}ms (acceptable)"
else
    print_status "FAIL" "Homepage response time: ${response_time_ms}ms (too slow)"
fi

echo -e "\n${BLUE}13. SECURITY SCAN${NC}"
echo "=================="

# Run basic security checks
if curl -s "$BASE_URL/admin" | grep -q "403\|401\|404"; then
    print_status "PASS" "Admin panel properly protected"
else
    print_status "WARN" "Admin panel access check inconclusive"
fi

# Check for common vulnerabilities
if curl -s "$BASE_URL/shop/search?q=<script>" | grep -q "<script>"; then
    print_status "FAIL" "Potential XSS vulnerability detected"
else
    print_status "PASS" "XSS protection appears to be working"
fi

echo -e "\n${BLUE}14. CONTENT DELIVERY CHECK${NC}"
echo "============================="

# Check static assets
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/static/css/main.css" | grep -q "200"; then
    print_status "PASS" "CSS files accessible"
else
    print_status "FAIL" "CSS files not accessible"
fi

if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/static/js/main.js" | grep -q "200"; then
    print_status "PASS" "JavaScript files accessible"
else
    print_status "FAIL" "JavaScript files not accessible"
fi

echo -e "\n${BLUE}15. COMPLIANCE CHECK${NC}"
echo "======================"

# Check privacy policy and terms
if curl -s "$BASE_URL/privacy" | grep -q "KVKK\|GDPR"; then
    print_status "PASS" "Privacy policy contains compliance information"
else
    print_status "WARN" "Privacy policy compliance check inconclusive"
fi

if curl -s "$BASE_URL/terms" | grep -q "Terms\|Şartlar"; then
    print_status "PASS" "Terms of service accessible"
else
    print_status "WARN" "Terms of service check inconclusive"
fi

echo -e "\n${BLUE}16. FINAL VALIDATION${NC}"
echo "======================"

# Test complete user journey
echo -e "${BLUE}Testing complete user journey...${NC}"

# Test homepage
if curl -s "$BASE_URL/" | grep -q "İnci Gold"; then
    print_status "PASS" "Homepage loads correctly"
else
    print_status "FAIL" "Homepage content issue"
fi

# Test shop page
if curl -s "$BASE_URL/shop" | grep -q "Ürünler\|Products"; then
    print_status "PASS" "Shop page loads correctly"
else
    print_status "FAIL" "Shop page content issue"
fi

# Test contact form
if curl -s "$BASE_URL/contact" | grep -q "İletişim\|Contact"; then
    print_status "PASS" "Contact page loads correctly"
else
    print_status "FAIL" "Contact page content issue"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}GO-LIVE CHECKLIST COMPLETED${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo -e "${BLUE}Log file: $LOG_FILE${NC}"
echo -e "${BLUE}========================================${NC}"

# Summary
echo -e "\n${BLUE}SUMMARY${NC}"
echo "========"

pass_count=$(grep -c "✓ PASS" "$LOG_FILE" 2>/dev/null || echo "0")
fail_count=$(grep -c "✗ FAIL" "$LOG_FILE" 2>/dev/null || echo "0")
warn_count=$(grep -c "⚠ WARN" "$LOG_FILE" 2>/dev/null || echo "0")

echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$fail_count${NC}"
echo -e "Warnings: ${YELLOW}$warn_count${NC}"

if [ "$fail_count" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 GO-LIVE APPROVED! 🎉${NC}"
    echo -e "${GREEN}All critical checks passed. System is ready for production.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ GO-LIVE BLOCKED ❌${NC}"
    echo -e "${RED}Critical issues found. Please resolve before going live.${NC}"
    exit 1
fi
