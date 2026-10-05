"""
Comprehensive Security Audit for İnci Gold E-commerce Platform
Final security validation and penetration testing
"""

import pytest
import requests
import json
import time
from datetime import datetime
from utils.security_testing import SecurityTester, SecurityTestType
from utils.compliance import ComplianceManager, ComplianceType

class TestSecurityAudit:
    """Comprehensive security audit tests"""
    
    @pytest.fixture
    def security_tester(self):
        """Initialize security tester"""
        return SecurityTester()
    
    @pytest.fixture
    def compliance_manager(self):
        """Initialize compliance manager"""
        return ComplianceManager()
    
    def test_comprehensive_security_scan(self, security_tester):
        """Run comprehensive security scan"""
        # Run all security tests
        test_results = security_tester.run_comprehensive_security_test()
        
        assert test_results is not None
        assert 'summary' in test_results
        
        # Check for critical vulnerabilities
        assert test_results['summary']['critical_vulnerabilities'] == 0, "Critical vulnerabilities found!"
        assert test_results['summary']['high_vulnerabilities'] == 0, "High vulnerabilities found!"
        
        # Check test coverage
        assert test_results['summary']['total_tests'] >= 10, "Insufficient security test coverage"
        
        print(f"Security Test Results: {test_results['summary']}")
    
    def test_sql_injection_protection(self, security_tester):
        """Test SQL injection protection"""
        result = security_tester.test_sql_injection()
        
        assert result['status'] == 'pass', f"SQL injection vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "SQL injection vulnerabilities detected"
    
    def test_xss_protection(self, security_tester):
        """Test XSS protection"""
        result = security_tester.test_xss_vulnerabilities()
        
        assert result['status'] == 'pass', f"XSS vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "XSS vulnerabilities detected"
    
    def test_csrf_protection(self, security_tester):
        """Test CSRF protection"""
        result = security_tester.test_csrf_protection()
        
        assert result['status'] == 'pass', f"CSRF vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "CSRF vulnerabilities detected"
    
    def test_authentication_security(self, security_tester):
        """Test authentication security"""
        result = security_tester.test_authentication_security()
        
        assert result['status'] == 'pass', f"Authentication vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Authentication vulnerabilities detected"
    
    def test_authorization_controls(self, security_tester):
        """Test authorization controls"""
        result = security_tester.test_authorization()
        
        assert result['status'] == 'pass', f"Authorization vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Authorization vulnerabilities detected"
    
    def test_session_management(self, security_tester):
        """Test session management security"""
        result = security_tester.test_session_management()
        
        assert result['status'] == 'pass', f"Session management vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Session management vulnerabilities detected"
    
    def test_input_validation(self, security_tester):
        """Test input validation"""
        result = security_tester.test_input_validation()
        
        assert result['status'] == 'pass', f"Input validation vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Input validation vulnerabilities detected"
    
    def test_file_upload_security(self, security_tester):
        """Test file upload security"""
        result = security_tester.test_file_upload_security()
        
        assert result['status'] == 'pass', f"File upload vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "File upload vulnerabilities detected"
    
    def test_directory_traversal_protection(self, security_tester):
        """Test directory traversal protection"""
        result = security_tester.test_directory_traversal()
        
        assert result['status'] == 'pass', f"Directory traversal vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Directory traversal vulnerabilities detected"
    
    def test_security_headers(self, security_tester):
        """Test security headers"""
        result = security_tester.test_security_headers()
        
        assert result['status'] == 'pass', f"Security header issues found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Security header issues detected"
    
    def test_ssl_tls_configuration(self, security_tester):
        """Test SSL/TLS configuration"""
        result = security_tester.test_ssl_tls_configuration()
        
        assert result['status'] == 'pass', f"SSL/TLS issues found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "SSL/TLS configuration issues detected"
    
    def test_dependency_vulnerabilities(self, security_tester):
        """Test dependency vulnerabilities"""
        result = security_tester.test_dependency_vulnerabilities()
        
        assert result['status'] == 'pass', f"Dependency vulnerabilities found: {result.get('vulnerabilities', [])}"
        assert len(result.get('vulnerabilities', [])) == 0, "Dependency vulnerabilities detected"
    
    def test_kvkk_compliance(self, compliance_manager):
        """Test KVKK compliance"""
        compliance_status = compliance_manager.get_compliance_status(ComplianceType.KVKK.value)
        
        assert compliance_status is not None
        assert ComplianceType.KVKK.value in compliance_status
        assert compliance_status[ComplianceType.KVKK.value]['enabled'] is True
        assert compliance_status[ComplianceType.KVKK.value]['compliance_score'] >= 90
    
    def test_gdpr_compliance(self, compliance_manager):
        """Test GDPR compliance"""
        compliance_status = compliance_manager.get_compliance_status(ComplianceType.GDPR.value)
        
        assert compliance_status is not None
        assert ComplianceType.GDPR.value in compliance_status
        assert compliance_status[ComplianceType.GDPR.value]['enabled'] is True
        assert compliance_status[ComplianceType.GDPR.value]['compliance_score'] >= 90
    
    def test_consent_management(self, compliance_manager):
        """Test consent management system"""
        # Test consent recording
        compliance_manager.record_consent(
            user_id=1,
            consent_type='marketing',
            purpose='marketing',
            granted=True
        )
        
        # Test consent checking
        has_consent = compliance_manager.check_consent(
            user_id=1,
            consent_type='marketing',
            purpose='marketing'
        )
        
        assert has_consent is True, "Consent management not working properly"
    
    def test_data_export_functionality(self, compliance_manager):
        """Test data export functionality"""
        user_data = compliance_manager.export_user_data(user_id=1)
        
        assert user_data is not None, "Data export functionality not working"
        assert 'user_id' in user_data, "User data export missing user_id"
        assert 'exported_at' in user_data, "User data export missing timestamp"
    
    def test_data_deletion_functionality(self, compliance_manager):
        """Test data deletion functionality"""
        deleted_data = compliance_manager.delete_user_data(user_id=1, reason='test')
        
        assert deleted_data is not None, "Data deletion functionality not working"
        assert 'deletion_id' in deleted_data, "Data deletion missing deletion_id"
        assert 'deleted_at' in deleted_data, "Data deletion missing timestamp"
    
    def test_audit_logging(self, compliance_manager):
        """Test audit logging functionality"""
        # Log a test action
        compliance_manager.log_data_access(
            user_id=1,
            data_type='test',
            data_id='test-123',
            action='read',
            purpose='testing',
            legal_basis='consent'
        )
        
        # Check if audit log was created
        audit_logs = compliance_manager.audit_logs
        assert len(audit_logs) > 0, "Audit logging not working"
        
        # Find our test log
        test_log = next((log for log in audit_logs if log['data_id'] == 'test-123'), None)
        assert test_log is not None, "Test audit log not found"
        assert test_log['action'] == 'read', "Audit log action incorrect"
    
    def test_security_report_generation(self, security_tester):
        """Test security report generation"""
        # Run security test first
        test_results = security_tester.run_comprehensive_security_test()
        
        # Generate report
        report = security_tester.generate_security_report(test_results['test_id'])
        
        assert report is not None, "Security report generation failed"
        assert 'executive_summary' in report, "Security report missing executive summary"
        assert 'detailed_findings' in report, "Security report missing detailed findings"
        assert 'remediation_recommendations' in report, "Security report missing recommendations"
        assert 'risk_assessment' in report, "Security report missing risk assessment"
    
    def test_compliance_report_generation(self, compliance_manager):
        """Test compliance report generation"""
        # Generate KVKK compliance report
        kvkk_report = compliance_manager.generate_compliance_report(
            ComplianceType.KVKK,
            start_date=datetime.utcnow() - timedelta(days=30),
            end_date=datetime.utcnow()
        )
        
        assert kvkk_report is not None, "KVKK compliance report generation failed"
        assert 'compliance_type' in kvkk_report, "Compliance report missing type"
        assert 'summary' in kvkk_report, "Compliance report missing summary"
        assert 'compliance_status' in kvkk_report, "Compliance report missing status"
        assert 'recommendations' in kvkk_report, "Compliance report missing recommendations"
    
    def test_penetration_testing_scenarios(self):
        """Test common penetration testing scenarios"""
        base_url = "http://localhost:5000"
        
        # Test 1: SQL Injection in search
        sql_payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --"
        ]
        
        for payload in sql_payloads:
            response = requests.get(f"{base_url}/shop/search", params={'q': payload}, timeout=10)
            assert response.status_code == 200, f"SQL injection test failed for payload: {payload}"
            # Check that no SQL errors are in response
            assert 'SQL' not in response.text.upper(), f"SQL error found in response for payload: {payload}"
        
        # Test 2: XSS in contact form
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')"
        ]
        
        for payload in xss_payloads:
            response = requests.post(f"{base_url}/contact", data={
                'name': 'Test',
                'email': 'test@example.com',
                'message': payload
            }, timeout=10)
            assert response.status_code == 200, f"XSS test failed for payload: {payload}"
            # Check that payload is not reflected in response
            assert payload not in response.text, f"XSS payload reflected in response: {payload}"
        
        # Test 3: CSRF protection
        response = requests.post(f"{base_url}/admin/users/create", data={
            'email': 'test@example.com',
            'password': 'password'
        }, timeout=10)
        # Should be rejected due to missing CSRF token
        assert response.status_code in [400, 403], "CSRF protection not working"
        
        # Test 4: Directory traversal
        traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd"
        ]
        
        for payload in traversal_payloads:
            response = requests.get(f"{base_url}/static/uploads/{payload}", timeout=10)
            assert response.status_code in [200, 404], f"Directory traversal test failed for payload: {payload}"
            # Check that sensitive file content is not returned
            assert 'root:' not in response.text, f"Sensitive file content returned for payload: {payload}"
    
    def test_rate_limiting_protection(self):
        """Test rate limiting protection"""
        base_url = "http://localhost:5000"
        
        # Test login rate limiting
        for i in range(10):
            response = requests.post(f"{base_url}/auth/login", data={
                'email': 'test@example.com',
                'password': 'wrongpassword'
            }, timeout=10)
        
        # Should be rate limited after multiple failed attempts
        assert response.status_code == 429, "Rate limiting not working for login"
    
    def test_security_headers_validation(self):
        """Test security headers are present"""
        base_url = "http://localhost:5000"
        
        response = requests.get(f"{base_url}/", timeout=10)
        
        # Check for essential security headers
        required_headers = [
            'X-Frame-Options',
            'X-Content-Type-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'Referrer-Policy'
        ]
        
        for header in required_headers:
            assert header in response.headers, f"Missing security header: {header}"
        
        # Validate header values
        assert response.headers['X-Frame-Options'] in ['DENY', 'SAMEORIGIN'], "Invalid X-Frame-Options value"
        assert response.headers['X-Content-Type-Options'] == 'nosniff', "Invalid X-Content-Type-Options value"
        assert 'max-age=' in response.headers['Strict-Transport-Security'], "Invalid HSTS header"

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
