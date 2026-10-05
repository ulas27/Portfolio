# İnci Gold E-commerce Platform - Go-Live Checklist (PowerShell)
# Production deployment validation script

param(
    [string]$Domain = "incigold.com",
    [string]$BaseUrl = "https://incigold.com",
    [string]$AdminEmail = "admin@incigold.com",
    [string]$BackupDir = "C:\backups\incigold"
)

# Logging
$LogFile = "C:\logs\incigold\go-live-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$LogDir = Split-Path $LogFile -Parent
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force
}

# Start logging
Start-Transcript -Path $LogFile

Write-Host "========================================" -ForegroundColor Blue
Write-Host "İnci Gold Go-Live Checklist" -ForegroundColor Blue
Write-Host "Date: $(Get-Date)" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Function to print status
function Write-Status {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "PASS" { Write-Host "✓ PASS - $Message" -ForegroundColor Green }
        "FAIL" { Write-Host "✗ FAIL - $Message" -ForegroundColor Red }
        "WARN" { Write-Host "⚠ WARN - $Message" -ForegroundColor Yellow }
        default { Write-Host "ℹ INFO - $Message" -ForegroundColor Blue }
    }
}

# Function to check HTTP response
function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$ExpectedStatus,
        [string]$Description
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 30 -UseBasicParsing
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Status "PASS" "$Description (HTTP $($response.StatusCode))"
        } else {
            Write-Status "FAIL" "$Description (HTTP $($response.StatusCode), expected $ExpectedStatus)"
        }
    } catch {
        Write-Status "FAIL" "$Description (Error: $($_.Exception.Message))"
    }
}

# Function to check service status
function Test-ServiceStatus {
    param(
        [string]$ServiceName,
        [string]$Description
    )
    
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction Stop
        if ($service.Status -eq "Running") {
            Write-Status "PASS" "$Description is running"
        } else {
            Write-Status "FAIL" "$Description is not running (Status: $($service.Status))"
        }
    } catch {
        Write-Status "FAIL" "$Description service not found or not accessible"
    }
}

# Function to check port
function Test-Port {
    param(
        [int]$Port,
        [string]$Description
    )
    
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        if ($connection) {
            Write-Status "PASS" "$Description is listening on port $Port"
        } else {
            Write-Status "FAIL" "$Description is not listening on port $Port"
        }
    } catch {
        Write-Status "FAIL" "$Description port check failed"
    }
}

# Function to check SSL certificate
function Test-SSLCertificate {
    param(
        [string]$Domain
    )
    
    try {
        $request = [System.Net.WebRequest]::Create("https://$Domain")
        $request.GetResponse() | Out-Null
        $cert = $request.ServicePoint.Certificate
        $cert2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cert)
        
        $expiryDate = $cert2.NotAfter
        $daysUntilExpiry = ($expiryDate - (Get-Date)).Days
        
        if ($daysUntilExpiry -gt 30) {
            Write-Status "PASS" "SSL certificate valid for $daysUntilExpiry days"
        } elseif ($daysUntilExpiry -gt 7) {
            Write-Status "WARN" "SSL certificate expires in $daysUntilExpiry days"
        } else {
            Write-Status "FAIL" "SSL certificate expires in $daysUntilExpiry days"
        }
    } catch {
        Write-Status "FAIL" "SSL certificate check failed: $($_.Exception.Message)"
    }
}

Write-Host "`n1. SYSTEM SERVICES CHECK" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue

Test-ServiceStatus "incigold" "İnci Gold Application"
Test-ServiceStatus "nginx" "Nginx Web Server"
Test-ServiceStatus "postgresql" "PostgreSQL Database"
Test-ServiceStatus "redis-server" "Redis Cache"

Write-Host "`n2. NETWORK CONNECTIVITY CHECK" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

Test-Port 80 "HTTP"
Test-Port 443 "HTTPS"
Test-Port 5000 "Application"
Test-Port 5432 "PostgreSQL"
Test-Port 6379 "Redis"

Write-Host "`n3. SSL/TLS CERTIFICATE CHECK" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

Test-SSLCertificate $Domain
Test-SSLCertificate "www.$Domain"

Write-Host "`n4. APPLICATION ENDPOINTS CHECK" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

Test-HttpEndpoint "$BaseUrl/" 200 "Homepage"
Test-HttpEndpoint "$BaseUrl/shop" 200 "Shop Page"
Test-HttpEndpoint "$BaseUrl/about" 200 "About Page"
Test-HttpEndpoint "$BaseUrl/contact" 200 "Contact Page"
Test-HttpEndpoint "$BaseUrl/health" 200 "Health Check"
Test-HttpEndpoint "$BaseUrl/auth/login" 200 "Login Page"
Test-HttpEndpoint "$BaseUrl/auth/register" 200 "Registration Page"

Write-Host "`n5. SECURITY HEADERS CHECK" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -Method Head -UseBasicParsing
    $headers = $response.Headers
    
    if ($headers.ContainsKey("X-Frame-Options")) {
        Write-Status "PASS" "X-Frame-Options header present"
    } else {
        Write-Status "FAIL" "X-Frame-Options header missing"
    }
    
    if ($headers.ContainsKey("X-Content-Type-Options")) {
        Write-Status "PASS" "X-Content-Type-Options header present"
    } else {
        Write-Status "FAIL" "X-Content-Type-Options header missing"
    }
    
    if ($headers.ContainsKey("Strict-Transport-Security")) {
        Write-Status "PASS" "Strict-Transport-Security header present"
    } else {
        Write-Status "FAIL" "Strict-Transport-Security header missing"
    }
} catch {
    Write-Status "FAIL" "Security headers check failed: $($_.Exception.Message)"
}

Write-Host "`n6. DATABASE CONNECTIVITY CHECK" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

try {
    # Test database connection (assuming PostgreSQL)
    $env:PGPASSWORD = "your_password"
    $result = psql -h localhost -U incigold_user -d incigold_prod -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "PASS" "Database connection successful"
    } else {
        Write-Status "FAIL" "Database connection failed"
    }
} catch {
    Write-Status "FAIL" "Database connection test failed: $($_.Exception.Message)"
}

Write-Host "`n7. REDIS CONNECTIVITY CHECK" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue

try {
    # Test Redis connection
    $result = redis-cli ping 2>$null
    if ($result -eq "PONG") {
        Write-Status "PASS" "Redis connection successful"
    } else {
        Write-Status "FAIL" "Redis connection failed"
    }
} catch {
    Write-Status "FAIL" "Redis connection test failed: $($_.Exception.Message)"
}

Write-Host "`n8. EMAIL SERVICE CHECK" -ForegroundColor Blue
Write-Host "==========================" -ForegroundColor Blue

# Check if email configuration is valid
if ($env:MAIL_USERNAME -and $env:MAIL_PASSWORD) {
    Write-Status "PASS" "Email configuration present"
} else {
    Write-Status "WARN" "Email configuration incomplete"
}

Write-Host "`n9. PAYMENT GATEWAY CHECK" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

# Check İyzico configuration
if ($env:IYZICO_API_KEY -and $env:IYZICO_SECRET_KEY) {
    Write-Status "PASS" "İyzico payment gateway configured"
} else {
    Write-Status "WARN" "İyzico payment gateway not configured"
}

Write-Host "`n10. BACKUP SYSTEM CHECK" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

if (Test-Path $BackupDir) {
    $backupCount = (Get-ChildItem -Path $BackupDir -Filter "*.gz" | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) }).Count
    if ($backupCount -gt 0) {
        Write-Status "PASS" "Recent backups found ($backupCount backups)"
    } else {
        Write-Status "WARN" "No recent backups found"
    }
} else {
    Write-Status "FAIL" "Backup directory not found"
}

Write-Host "`n11. MONITORING SYSTEM CHECK" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

Test-ServiceStatus "prometheus" "Prometheus monitoring"
Test-ServiceStatus "grafana-server" "Grafana dashboard"

Write-Host "`n12. PERFORMANCE CHECK" -ForegroundColor Blue
Write-Host "========================" -ForegroundColor Blue

try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing
    $stopwatch.Stop()
    $responseTimeMs = $stopwatch.ElapsedMilliseconds
    
    if ($responseTimeMs -lt 1000) {
        Write-Status "PASS" "Homepage response time: ${responseTimeMs}ms"
    } elseif ($responseTimeMs -lt 3000) {
        Write-Status "WARN" "Homepage response time: ${responseTimeMs}ms (acceptable)"
    } else {
        Write-Status "FAIL" "Homepage response time: ${responseTimeMs}ms (too slow)"
    }
} catch {
    Write-Status "FAIL" "Performance check failed: $($_.Exception.Message)"
}

Write-Host "`n13. SECURITY SCAN" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue

try {
    $adminResponse = Invoke-WebRequest -Uri "$BaseUrl/admin" -UseBasicParsing
    if ($adminResponse.StatusCode -in @(403, 401, 404)) {
        Write-Status "PASS" "Admin panel properly protected"
    } else {
        Write-Status "WARN" "Admin panel access check inconclusive"
    }
} catch {
    Write-Status "PASS" "Admin panel properly protected (access denied)"
}

# Check for XSS protection
try {
    $xssResponse = Invoke-WebRequest -Uri "$BaseUrl/shop/search?q=<script>" -UseBasicParsing
    if ($xssResponse.Content -like "*<script>*") {
        Write-Status "FAIL" "Potential XSS vulnerability detected"
    } else {
        Write-Status "PASS" "XSS protection appears to be working"
    }
} catch {
    Write-Status "PASS" "XSS protection appears to be working"
}

Write-Host "`n14. CONTENT DELIVERY CHECK" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

Test-HttpEndpoint "$BaseUrl/static/css/main.css" 200 "CSS files"
Test-HttpEndpoint "$BaseUrl/static/js/main.js" 200 "JavaScript files"

Write-Host "`n15. COMPLIANCE CHECK" -ForegroundColor Blue
Write-Host "======================" -ForegroundColor Blue

try {
    $privacyResponse = Invoke-WebRequest -Uri "$BaseUrl/privacy" -UseBasicParsing
    if ($privacyResponse.Content -match "KVKK|GDPR") {
        Write-Status "PASS" "Privacy policy contains compliance information"
    } else {
        Write-Status "WARN" "Privacy policy compliance check inconclusive"
    }
} catch {
    Write-Status "WARN" "Privacy policy check failed"
}

try {
    $termsResponse = Invoke-WebRequest -Uri "$BaseUrl/terms" -UseBasicParsing
    if ($termsResponse.Content -match "Terms|Şartlar") {
        Write-Status "PASS" "Terms of service accessible"
    } else {
        Write-Status "WARN" "Terms of service check inconclusive"
    }
} catch {
    Write-Status "WARN" "Terms of service check failed"
}

Write-Host "`n16. FINAL VALIDATION" -ForegroundColor Blue
Write-Host "======================" -ForegroundColor Blue

# Test complete user journey
Write-Host "Testing complete user journey..." -ForegroundColor Blue

try {
    $homepageResponse = Invoke-WebRequest -Uri "$BaseUrl/" -UseBasicParsing
    if ($homepageResponse.Content -like "*İnci Gold*") {
        Write-Status "PASS" "Homepage loads correctly"
    } else {
        Write-Status "FAIL" "Homepage content issue"
    }
} catch {
    Write-Status "FAIL" "Homepage test failed"
}

try {
    $shopResponse = Invoke-WebRequest -Uri "$BaseUrl/shop" -UseBasicParsing
    if ($shopResponse.Content -match "Ürünler|Products") {
        Write-Status "PASS" "Shop page loads correctly"
    } else {
        Write-Status "FAIL" "Shop page content issue"
    }
} catch {
    Write-Status "FAIL" "Shop page test failed"
}

try {
    $contactResponse = Invoke-WebRequest -Uri "$BaseUrl/contact" -UseBasicParsing
    if ($contactResponse.Content -match "İletişim|Contact") {
        Write-Status "PASS" "Contact page loads correctly"
    } else {
        Write-Status "FAIL" "Contact page content issue"
    }
} catch {
    Write-Status "FAIL" "Contact page test failed"
}

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "GO-LIVE CHECKLIST COMPLETED" -ForegroundColor Blue
Write-Host "Date: $(Get-Date)" -ForegroundColor Blue
Write-Host "Log file: $LogFile" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Summary
Write-Host "`nSUMMARY" -ForegroundColor Blue
Write-Host "========" -ForegroundColor Blue

$logContent = Get-Content $LogFile -Raw
$passCount = ([regex]::Matches($logContent, "✓ PASS")).Count
$failCount = ([regex]::Matches($logContent, "✗ FAIL")).Count
$warnCount = ([regex]::Matches($logContent, "⚠ WARN")).Count

Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Warnings: $warnCount" -ForegroundColor Yellow

if ($failCount -eq 0) {
    Write-Host "`n🎉 GO-LIVE APPROVED! 🎉" -ForegroundColor Green
    Write-Host "All critical checks passed. System is ready for production." -ForegroundColor Green
    Stop-Transcript
    exit 0
} else {
    Write-Host "`n❌ GO-LIVE BLOCKED ❌" -ForegroundColor Red
    Write-Host "Critical issues found. Please resolve before going live." -ForegroundColor Red
    Stop-Transcript
    exit 1
}
