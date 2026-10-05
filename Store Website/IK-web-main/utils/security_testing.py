"""
Enterprise Security Testing & Vulnerability Scanning
Penetration testing, vulnerability assessment, security validation
"""

import os
import re
import json
import time
import requests
import subprocess
from datetime import datetime, timedelta
from flask import current_app, request, session
import logging
from enum import Enum
import hashlib
import hmac
import base64

logger = logging.getLogger(__name__)

class SecurityTestType(Enum):
    """Security test types"""
    SQL_INJECTION = "sql_injection"
    XSS = "xss"
    CSRF = "csrf"
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    SESSION_MANAGEMENT = "session_management"
    INPUT_VALIDATION = "input_validation"
    FILE_UPLOAD = "file_upload"
    DIRECTORY_TRAVERSAL = "directory_traversal"
    SECURITY_HEADERS = "security_headers"
    SSL_TLS = "ssl_tls"
    DEPENDENCY_SCAN = "dependency_scan"

class SecurityTestResult(Enum):
    """Security test results"""
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"
    INFO = "info"

class SecurityTester:
    """Enterprise security testing framework"""
    
    def __init__(self, app=None):
        self.app = app
        self.test_results = {}
        self.vulnerability_database = {}
        self.security_headers_expected = {
            'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
            'X-Content-Type-Options': ['nosniff'],
            'X-XSS-Protection': ['1; mode=block'],
            'Strict-Transport-Security': [r'max-age=\d+'],
            'Content-Security-Policy': [r".*"],
            'Referrer-Policy': [r".*"],
            'Permissions-Policy': [r".*"]
        }
        self.sql_injection_payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "1' OR 1=1 --",
            "admin'--",
            "' OR 1=1 #",
            "1' OR '1'='1' --",
            "' OR 'x'='x",
            "') OR ('1'='1",
            "1' OR 1=1 LIMIT 1 --"
        ]
        self.xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')",
            "<svg onload=alert('XSS')>",
            "<iframe src=javascript:alert('XSS')>",
            "<body onload=alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>"
        ]
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security tester"""
        self.app = app
        
        # Load vulnerability database
        self._load_vulnerability_database()
    
    def _load_vulnerability_database(self):
        """Load vulnerability database"""
        try:
            # This would typically load from a comprehensive vulnerability database
            # For now, we'll use a basic set of known vulnerabilities
            
            self.vulnerability_database = {
                'sql_injection': {
                    'severity': 'high',
                    'description': 'SQL injection vulnerability detected',
                    'remediation': 'Use parameterized queries and input validation'
                },
                'xss': {
                    'severity': 'medium',
                    'description': 'Cross-site scripting vulnerability detected',
                    'remediation': 'Implement proper input validation and output encoding'
                },
                'csrf': {
                    'severity': 'medium',
                    'description': 'Cross-site request forgery vulnerability detected',
                    'remediation': 'Implement CSRF tokens and same-origin policy'
                },
                'weak_authentication': {
                    'severity': 'high',
                    'description': 'Weak authentication mechanism detected',
                    'remediation': 'Implement strong password policies and multi-factor authentication'
                },
                'insecure_session': {
                    'severity': 'medium',
                    'description': 'Insecure session management detected',
                    'remediation': 'Use secure session cookies and proper session timeout'
                },
                'missing_security_headers': {
                    'severity': 'low',
                    'description': 'Missing security headers',
                    'remediation': 'Implement proper security headers'
                },
                'weak_ssl': {
                    'severity': 'high',
                    'description': 'Weak SSL/TLS configuration',
                    'remediation': 'Use strong SSL/TLS configuration and disable weak protocols'
                }
            }
            
            logger.info("Vulnerability database loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading vulnerability database: {str(e)}")
    
    def run_comprehensive_security_test(self):
        """Run comprehensive security test suite"""
        try:
            logger.info("Starting comprehensive security test")
            
            test_results = {
                'test_id': f"security_test_{int(time.time())}",
                'start_time': datetime.utcnow().isoformat(),
                'tests': {},
                'summary': {
                    'total_tests': 0,
                    'passed': 0,
                    'failed': 0,
                    'warnings': 0,
                    'critical_vulnerabilities': 0,
                    'high_vulnerabilities': 0,
                    'medium_vulnerabilities': 0,
                    'low_vulnerabilities': 0
                }
            }
            
            # Run all security tests
            test_methods = [
                self.test_sql_injection,
                self.test_xss_vulnerabilities,
                self.test_csrf_protection,
                self.test_authentication_security,
                self.test_authorization,
                self.test_session_management,
                self.test_input_validation,
                self.test_file_upload_security,
                self.test_directory_traversal,
                self.test_security_headers,
                self.test_ssl_tls_configuration,
                self.test_dependency_vulnerabilities
            ]
            
            for test_method in test_methods:
                try:
                    test_name = test_method.__name__
                    logger.info(f"Running security test: {test_name}")
                    
                    result = test_method()
                    test_results['tests'][test_name] = result
                    
                    # Update summary
                    test_results['summary']['total_tests'] += 1
                    if result['status'] == SecurityTestResult.PASS.value:
                        test_results['summary']['passed'] += 1
                    elif result['status'] == SecurityTestResult.FAIL.value:
                        test_results['summary']['failed'] += 1
                        # Count vulnerabilities by severity
                        for vulnerability in result.get('vulnerabilities', []):
                            severity = vulnerability.get('severity', 'low')
                            if severity == 'critical':
                                test_results['summary']['critical_vulnerabilities'] += 1
                            elif severity == 'high':
                                test_results['summary']['high_vulnerabilities'] += 1
                            elif severity == 'medium':
                                test_results['summary']['medium_vulnerabilities'] += 1
                            else:
                                test_results['summary']['low_vulnerabilities'] += 1
                    elif result['status'] == SecurityTestResult.WARNING.value:
                        test_results['summary']['warnings'] += 1
                    
                except Exception as e:
                    logger.error(f"Error running test {test_method.__name__}: {str(e)}")
                    test_results['tests'][test_method.__name__] = {
                        'status': SecurityTestResult.FAIL.value,
                        'error': str(e),
                        'vulnerabilities': []
                    }
            
            test_results['end_time'] = datetime.utcnow().isoformat()
            test_results['duration'] = (
                datetime.fromisoformat(test_results['end_time']) - 
                datetime.fromisoformat(test_results['start_time'])
            ).total_seconds()
            
            # Store results
            self.test_results[test_results['test_id']] = test_results
            
            logger.info(f"Comprehensive security test completed: {test_results['test_id']}")
            return test_results
            
        except Exception as e:
            logger.error(f"Error running comprehensive security test: {str(e)}")
            return None
    
    def test_sql_injection(self):
        """Test for SQL injection vulnerabilities"""
        try:
            vulnerabilities = []
            
            # Test common endpoints with SQL injection payloads
            test_endpoints = [
                '/auth/login',
                '/shop/search',
                '/admin/users',
                '/api/products'
            ]
            
            for endpoint in test_endpoints:
                for payload in self.sql_injection_payloads:
                    try:
                        # Test GET parameters
                        response = requests.get(
                            f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}{endpoint}",
                            params={'q': payload, 'search': payload},
                            timeout=10
                        )
                        
                        # Check for SQL error patterns
                        sql_error_patterns = [
                            r"SQL syntax.*MySQL",
                            r"Warning.*mysql_.*",
                            r"valid MySQL result",
                            r"PostgreSQL.*ERROR",
                            r"Warning.*pg_.*",
                            r"valid PostgreSQL result",
                            r"SQLite.*error",
                            r"SQLite.*SQLITE_ERROR",
                            r"ORA-\d+",
                            r"Microsoft.*ODBC.*SQL Server",
                            r"SQLServer JDBC Driver",
                            r"SQLException"
                        ]
                        
                        for pattern in sql_error_patterns:
                            if re.search(pattern, response.text, re.IGNORECASE):
                                vulnerabilities.append({
                                    'type': 'sql_injection',
                                    'endpoint': endpoint,
                                    'payload': payload,
                                    'severity': 'high',
                                    'description': f'SQL injection vulnerability detected in {endpoint}',
                                    'evidence': f'SQL error pattern matched: {pattern}'
                                })
                                break
                    
                    except Exception as e:
                        logger.warning(f"Error testing SQL injection on {endpoint}: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_endpoints': len(test_endpoints),
                'tested_payloads': len(self.sql_injection_payloads)
            }
            
        except Exception as e:
            logger.error(f"Error testing SQL injection: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_xss_vulnerabilities(self):
        """Test for XSS vulnerabilities"""
        try:
            vulnerabilities = []
            
            # Test common endpoints with XSS payloads
            test_endpoints = [
                '/contact',
                '/shop/search',
                '/auth/register',
                '/admin/messages'
            ]
            
            for endpoint in test_endpoints:
                for payload in self.xss_payloads:
                    try:
                        # Test form submission
                        response = requests.post(
                            f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}{endpoint}",
                            data={
                                'message': payload,
                                'search': payload,
                                'name': payload,
                                'email': f"test{payload}@example.com"
                            },
                            timeout=10
                        )
                        
                        # Check if payload is reflected in response
                        if payload in response.text:
                            vulnerabilities.append({
                                'type': 'xss',
                                'endpoint': endpoint,
                                'payload': payload,
                                'severity': 'medium',
                                'description': f'XSS vulnerability detected in {endpoint}',
                                'evidence': f'Payload reflected in response: {payload[:50]}...'
                            })
                    
                    except Exception as e:
                        logger.warning(f"Error testing XSS on {endpoint}: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_endpoints': len(test_endpoints),
                'tested_payloads': len(self.xss_payloads)
            }
            
        except Exception as e:
            logger.error(f"Error testing XSS: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_csrf_protection(self):
        """Test CSRF protection"""
        try:
            vulnerabilities = []
            
            # Test endpoints that should have CSRF protection
            protected_endpoints = [
                '/admin/users/create',
                '/admin/products/create',
                '/auth/change-password',
                '/cart/checkout'
            ]
            
            for endpoint in protected_endpoints:
                try:
                    # Test without CSRF token
                    response = requests.post(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}{endpoint}",
                        data={'test': 'data'},
                        timeout=10
                    )
                    
                    # Check if request was rejected due to missing CSRF token
                    if response.status_code not in [403, 400]:
                        vulnerabilities.append({
                            'type': 'csrf',
                            'endpoint': endpoint,
                            'severity': 'medium',
                            'description': f'CSRF protection missing on {endpoint}',
                            'evidence': f'Request accepted without CSRF token (status: {response.status_code})'
                        })
                
                except Exception as e:
                    logger.warning(f"Error testing CSRF on {endpoint}: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_endpoints': len(protected_endpoints)
            }
            
        except Exception as e:
            logger.error(f"Error testing CSRF: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_authentication_security(self):
        """Test authentication security"""
        try:
            vulnerabilities = []
            
            # Test weak password policies
            weak_passwords = ['123456', 'password', 'admin', 'qwerty', '12345']
            
            for weak_password in weak_passwords:
                try:
                    response = requests.post(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/auth/register",
                        data={
                            'email': f'test{int(time.time())}@example.com',
                            'password': weak_password,
                            'confirm_password': weak_password,
                            'first_name': 'Test',
                            'last_name': 'User'
                        },
                        timeout=10
                    )
                    
                    # Check if weak password was accepted
                    if response.status_code == 200 and 'error' not in response.text.lower():
                        vulnerabilities.append({
                            'type': 'weak_authentication',
                            'severity': 'high',
                            'description': 'Weak password accepted during registration',
                            'evidence': f'Weak password "{weak_password}" was accepted'
                        })
                        break
                
                except Exception as e:
                    logger.warning(f"Error testing weak password: {str(e)}")
            
            # Test account lockout
            try:
                for i in range(10):  # Try 10 failed login attempts
                    response = requests.post(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/auth/login",
                        data={
                            'email': 'nonexistent@example.com',
                            'password': 'wrongpassword'
                        },
                        timeout=10
                    )
                
                # Check if account lockout is implemented
                if response.status_code != 429:  # Rate limiting should kick in
                    vulnerabilities.append({
                        'type': 'weak_authentication',
                        'severity': 'medium',
                        'description': 'Account lockout not implemented',
                        'evidence': 'Multiple failed login attempts not blocked'
                    })
            
            except Exception as e:
                logger.warning(f"Error testing account lockout: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities
            }
            
        except Exception as e:
            logger.error(f"Error testing authentication: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_authorization(self):
        """Test authorization controls"""
        try:
            vulnerabilities = []
            
            # Test admin endpoints without authentication
            admin_endpoints = [
                '/admin/dashboard',
                '/admin/users',
                '/admin/products',
                '/admin/orders'
            ]
            
            for endpoint in admin_endpoints:
                try:
                    response = requests.get(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}{endpoint}",
                        timeout=10
                    )
                    
                    # Check if admin endpoint is accessible without authentication
                    if response.status_code == 200:
                        vulnerabilities.append({
                            'type': 'authorization',
                            'endpoint': endpoint,
                            'severity': 'high',
                            'description': f'Admin endpoint accessible without authentication: {endpoint}',
                            'evidence': f'Endpoint returned status 200 without authentication'
                        })
                
                except Exception as e:
                    logger.warning(f"Error testing authorization on {endpoint}: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_endpoints': len(admin_endpoints)
            }
            
        except Exception as e:
            logger.error(f"Error testing authorization: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_session_management(self):
        """Test session management security"""
        try:
            vulnerabilities = []
            
            # Test session cookie security
            try:
                response = requests.get(
                    f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/",
                    timeout=10
                )
                
                cookies = response.cookies
                session_cookie = None
                
                for cookie in cookies:
                    if 'session' in cookie.name.lower():
                        session_cookie = cookie
                        break
                
                if session_cookie:
                    # Check if session cookie is secure
                    if not session_cookie.secure:
                        vulnerabilities.append({
                            'type': 'insecure_session',
                            'severity': 'medium',
                            'description': 'Session cookie not marked as secure',
                            'evidence': 'Session cookie missing Secure flag'
                        })
                    
                    # Check if session cookie has HttpOnly flag
                    if not session_cookie.has_nonstandard_attr('HttpOnly'):
                        vulnerabilities.append({
                            'type': 'insecure_session',
                            'severity': 'medium',
                            'description': 'Session cookie not marked as HttpOnly',
                            'evidence': 'Session cookie missing HttpOnly flag'
                        })
                
            except Exception as e:
                logger.warning(f"Error testing session cookies: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities
            }
            
        except Exception as e:
            logger.error(f"Error testing session management: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_input_validation(self):
        """Test input validation"""
        try:
            vulnerabilities = []
            
            # Test various input validation scenarios
            test_cases = [
                {'field': 'email', 'value': 'invalid-email', 'expected_error': True},
                {'field': 'phone', 'value': 'invalid-phone', 'expected_error': True},
                {'field': 'age', 'value': 'not-a-number', 'expected_error': True},
                {'field': 'name', 'value': 'A' * 1000, 'expected_error': True},  # Too long
                {'field': 'description', 'value': '<script>alert("xss")</script>', 'expected_error': True}
            ]
            
            for test_case in test_cases:
                try:
                    response = requests.post(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/contact",
                        data={test_case['field']: test_case['value']},
                        timeout=10
                    )
                    
                    # Check if validation error was returned
                    if test_case['expected_error'] and 'error' not in response.text.lower():
                        vulnerabilities.append({
                            'type': 'input_validation',
                            'field': test_case['field'],
                            'value': test_case['value'][:50],
                            'severity': 'medium',
                            'description': f'Input validation failed for {test_case["field"]}',
                            'evidence': f'Invalid input accepted: {test_case["value"][:50]}'
                        })
                
                except Exception as e:
                    logger.warning(f"Error testing input validation: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_cases': len(test_cases)
            }
            
        except Exception as e:
            logger.error(f"Error testing input validation: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_file_upload_security(self):
        """Test file upload security"""
        try:
            vulnerabilities = []
            
            # Test malicious file uploads
            malicious_files = [
                {'name': 'test.php', 'content': '<?php echo "hacked"; ?>', 'type': 'application/x-php'},
                {'name': 'test.jsp', 'content': '<% out.println("hacked"); %>', 'type': 'application/x-jsp'},
                {'name': 'test.exe', 'content': b'MZ\x90\x00', 'type': 'application/x-executable'},
                {'name': '../../../etc/passwd', 'content': 'test', 'type': 'text/plain'}
            ]
            
            for malicious_file in malicious_files:
                try:
                    files = {'file': (malicious_file['name'], malicious_file['content'], malicious_file['type'])}
                    
                    response = requests.post(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/admin/upload",
                        files=files,
                        timeout=10
                    )
                    
                    # Check if malicious file was accepted
                    if response.status_code == 200:
                        vulnerabilities.append({
                            'type': 'file_upload',
                            'filename': malicious_file['name'],
                            'severity': 'high',
                            'description': f'Malicious file upload accepted: {malicious_file["name"]}',
                            'evidence': f'File upload returned status 200 for {malicious_file["name"]}'
                        })
                
                except Exception as e:
                    logger.warning(f"Error testing file upload: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_files': len(malicious_files)
            }
            
        except Exception as e:
            logger.error(f"Error testing file upload: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_directory_traversal(self):
        """Test directory traversal vulnerabilities"""
        try:
            vulnerabilities = []
            
            # Test directory traversal payloads
            traversal_payloads = [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
                '....//....//....//etc/passwd',
                '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
                '..%252f..%252f..%252fetc%252fpasswd'
            ]
            
            for payload in traversal_payloads:
                try:
                    response = requests.get(
                        f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/static/uploads/{payload}",
                        timeout=10
                    )
                    
                    # Check if sensitive file content is returned
                    if 'root:' in response.text or 'localhost' in response.text:
                        vulnerabilities.append({
                            'type': 'directory_traversal',
                            'payload': payload,
                            'severity': 'high',
                            'description': 'Directory traversal vulnerability detected',
                            'evidence': f'Sensitive file content returned for payload: {payload}'
                        })
                
                except Exception as e:
                    logger.warning(f"Error testing directory traversal: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'tested_payloads': len(traversal_payloads)
            }
            
        except Exception as e:
            logger.error(f"Error testing directory traversal: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_security_headers(self):
        """Test security headers"""
        try:
            vulnerabilities = []
            
            try:
                response = requests.get(
                    f"{current_app.config.get('BASE_URL', 'http://localhost:5000')}/",
                    timeout=10
                )
                
                headers = response.headers
                
                # Check each expected security header
                for header_name, expected_values in self.security_headers_expected.items():
                    if header_name not in headers:
                        vulnerabilities.append({
                            'type': 'missing_security_headers',
                            'header': header_name,
                            'severity': 'low',
                            'description': f'Missing security header: {header_name}',
                            'evidence': f'Header {header_name} not present in response'
                        })
                    else:
                        header_value = headers[header_name]
                        # Check if header value matches expected pattern
                        if not any(re.match(pattern, header_value) for pattern in expected_values):
                            vulnerabilities.append({
                                'type': 'missing_security_headers',
                                'header': header_name,
                                'value': header_value,
                                'severity': 'low',
                                'description': f'Incorrect security header value: {header_name}',
                                'evidence': f'Header {header_name} has unexpected value: {header_value}'
                            })
                
            except Exception as e:
                logger.warning(f"Error testing security headers: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'checked_headers': len(self.security_headers_expected)
            }
            
        except Exception as e:
            logger.error(f"Error testing security headers: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_ssl_tls_configuration(self):
        """Test SSL/TLS configuration"""
        try:
            vulnerabilities = []
            
            # This would typically use SSL testing tools like SSL Labs API
            # For now, we'll do basic checks
            
            try:
                import ssl
                import socket
                
                hostname = current_app.config.get('DOMAIN', 'localhost')
                port = 443
                
                # Test SSL connection
                context = ssl.create_default_context()
                with socket.create_connection((hostname, port), timeout=10) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        # Check SSL version
                        ssl_version = ssock.version()
                        if ssl_version in ['SSLv2', 'SSLv3', 'TLSv1', 'TLSv1.1']:
                            vulnerabilities.append({
                                'type': 'weak_ssl',
                                'severity': 'high',
                                'description': f'Weak SSL/TLS version: {ssl_version}',
                                'evidence': f'SSL version {ssl_version} is considered insecure'
                            })
                        
                        # Check cipher
                        cipher = ssock.cipher()
                        if cipher:
                            cipher_name = cipher[0]
                            if 'RC4' in cipher_name or 'DES' in cipher_name or 'MD5' in cipher_name:
                                vulnerabilities.append({
                                    'type': 'weak_ssl',
                                    'severity': 'medium',
                                    'description': f'Weak cipher suite: {cipher_name}',
                                    'evidence': f'Cipher {cipher_name} is considered weak'
                                })
            
            except Exception as e:
                logger.warning(f"Error testing SSL/TLS: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities
            }
            
        except Exception as e:
            logger.error(f"Error testing SSL/TLS: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def test_dependency_vulnerabilities(self):
        """Test for known dependency vulnerabilities"""
        try:
            vulnerabilities = []
            
            # This would typically use tools like safety, pip-audit, or Snyk
            # For now, we'll check for common vulnerable packages
            
            vulnerable_packages = [
                'django<2.2.0',
                'flask<1.0.0',
                'requests<2.20.0',
                'urllib3<1.24.0',
                'pillow<6.0.0'
            ]
            
            try:
                # Check installed packages
                result = subprocess.run(['pip', 'list'], capture_output=True, text=True, timeout=30)
                installed_packages = result.stdout
                
                for vulnerable_package in vulnerable_packages:
                    package_name = vulnerable_package.split('<')[0]
                    if package_name in installed_packages:
                        vulnerabilities.append({
                            'type': 'dependency_vulnerability',
                            'package': package_name,
                            'severity': 'medium',
                            'description': f'Potentially vulnerable package: {package_name}',
                            'evidence': f'Package {package_name} may have known vulnerabilities'
                        })
            
            except Exception as e:
                logger.warning(f"Error checking dependencies: {str(e)}")
            
            return {
                'status': SecurityTestResult.FAIL.value if vulnerabilities else SecurityTestResult.PASS.value,
                'vulnerabilities': vulnerabilities,
                'checked_packages': len(vulnerable_packages)
            }
            
        except Exception as e:
            logger.error(f"Error testing dependencies: {str(e)}")
            return {
                'status': SecurityTestResult.FAIL.value,
                'error': str(e),
                'vulnerabilities': []
            }
    
    def get_test_results(self, test_id=None):
        """Get security test results"""
        try:
            if test_id:
                return self.test_results.get(test_id)
            else:
                return self.test_results
                
        except Exception as e:
            logger.error(f"Error getting test results: {str(e)}")
            return None
    
    def generate_security_report(self, test_id):
        """Generate comprehensive security report"""
        try:
            test_result = self.test_results.get(test_id)
            if not test_result:
                return None
            
            report = {
                'report_id': f"security_report_{test_id}",
                'generated_at': datetime.utcnow().isoformat(),
                'test_summary': test_result['summary'],
                'executive_summary': self._generate_executive_summary(test_result),
                'detailed_findings': self._generate_detailed_findings(test_result),
                'remediation_recommendations': self._generate_remediation_recommendations(test_result),
                'risk_assessment': self._generate_risk_assessment(test_result)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating security report: {str(e)}")
            return None
    
    def _generate_executive_summary(self, test_result):
        """Generate executive summary"""
        summary = test_result['summary']
        
        if summary['critical_vulnerabilities'] > 0:
            risk_level = 'CRITICAL'
        elif summary['high_vulnerabilities'] > 0:
            risk_level = 'HIGH'
        elif summary['medium_vulnerabilities'] > 0:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        return {
            'overall_risk_level': risk_level,
            'total_vulnerabilities': (summary['critical_vulnerabilities'] + 
                                    summary['high_vulnerabilities'] + 
                                    summary['medium_vulnerabilities'] + 
                                    summary['low_vulnerabilities']),
            'critical_vulnerabilities': summary['critical_vulnerabilities'],
            'high_vulnerabilities': summary['high_vulnerabilities'],
            'medium_vulnerabilities': summary['medium_vulnerabilities'],
            'low_vulnerabilities': summary['low_vulnerabilities'],
            'tests_passed': summary['passed'],
            'tests_failed': summary['failed'],
            'tests_with_warnings': summary['warnings']
        }
    
    def _generate_detailed_findings(self, test_result):
        """Generate detailed findings"""
        findings = []
        
        for test_name, test_data in test_result['tests'].items():
            if test_data.get('vulnerabilities'):
                for vulnerability in test_data['vulnerabilities']:
                    findings.append({
                        'test_name': test_name,
                        'vulnerability_type': vulnerability['type'],
                        'severity': vulnerability['severity'],
                        'description': vulnerability['description'],
                        'evidence': vulnerability.get('evidence', ''),
                        'remediation': self.vulnerability_database.get(vulnerability['type'], {}).get('remediation', '')
                    })
        
        return findings
    
    def _generate_remediation_recommendations(self, test_result):
        """Generate remediation recommendations"""
        recommendations = []
        
        # Group vulnerabilities by type
        vulnerability_types = {}
        for test_name, test_data in test_result['tests'].items():
            if test_data.get('vulnerabilities'):
                for vulnerability in test_data['vulnerabilities']:
                    vuln_type = vulnerability['type']
                    if vuln_type not in vulnerability_types:
                        vulnerability_types[vuln_type] = []
                    vulnerability_types[vuln_type].append(vulnerability)
        
        # Generate recommendations for each vulnerability type
        for vuln_type, vulnerabilities in vulnerability_types.items():
            vuln_info = self.vulnerability_database.get(vuln_type, {})
            recommendations.append({
                'vulnerability_type': vuln_type,
                'count': len(vulnerabilities),
                'severity': max(v['severity'] for v in vulnerabilities),
                'description': vuln_info.get('description', ''),
                'remediation': vuln_info.get('remediation', ''),
                'affected_endpoints': list(set(v.get('endpoint', '') for v in vulnerabilities if v.get('endpoint')))
            })
        
        return recommendations
    
    def _generate_risk_assessment(self, test_result):
        """Generate risk assessment"""
        summary = test_result['summary']
        
        # Calculate risk score
        risk_score = (summary['critical_vulnerabilities'] * 10 + 
                     summary['high_vulnerabilities'] * 7 + 
                     summary['medium_vulnerabilities'] * 4 + 
                     summary['low_vulnerabilities'] * 1)
        
        # Determine risk level
        if risk_score >= 50:
            risk_level = 'CRITICAL'
        elif risk_score >= 30:
            risk_level = 'HIGH'
        elif risk_score >= 15:
            risk_level = 'MEDIUM'
        elif risk_score >= 5:
            risk_level = 'LOW'
        else:
            risk_level = 'MINIMAL'
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'business_impact': self._assess_business_impact(risk_level),
            'recommended_actions': self._get_recommended_actions(risk_level)
        }
    
    def _assess_business_impact(self, risk_level):
        """Assess business impact based on risk level"""
        impact_map = {
            'CRITICAL': 'Immediate action required. High risk of data breach, financial loss, and reputational damage.',
            'HIGH': 'Urgent action required. Significant risk of security incidents and business disruption.',
            'MEDIUM': 'Action required within 30 days. Moderate risk that should be addressed promptly.',
            'LOW': 'Action recommended within 90 days. Low risk but should be monitored.',
            'MINIMAL': 'Minimal risk. Continue monitoring and maintain security best practices.'
        }
        
        return impact_map.get(risk_level, 'Unknown risk level')
    
    def _get_recommended_actions(self, risk_level):
        """Get recommended actions based on risk level"""
        actions_map = {
            'CRITICAL': [
                'Immediately patch or mitigate critical vulnerabilities',
                'Implement emergency security measures',
                'Conduct additional security testing',
                'Review and update incident response procedures'
            ],
            'HIGH': [
                'Prioritize high-severity vulnerabilities for immediate remediation',
                'Implement additional security controls',
                'Schedule follow-up security testing',
                'Update security policies and procedures'
            ],
            'MEDIUM': [
                'Develop remediation plan for medium-severity vulnerabilities',
                'Implement security improvements',
                'Schedule regular security assessments',
                'Provide security training to development team'
            ],
            'LOW': [
                'Include low-severity issues in regular maintenance schedule',
                'Continue monitoring for new vulnerabilities',
                'Maintain current security practices',
                'Plan for future security improvements'
            ],
            'MINIMAL': [
                'Continue regular security monitoring',
                'Maintain current security practices',
                'Plan for future security enhancements',
                'Keep security tools and processes up to date'
            ]
        }
        
        return actions_map.get(risk_level, [])

# Global security tester instance
security_tester = SecurityTester()
