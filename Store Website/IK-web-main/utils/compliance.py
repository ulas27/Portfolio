"""
Enterprise Compliance & Governance System
KVKK/GDPR compliance, audit trails, data governance
"""

import json
import hashlib
import time
from datetime import datetime, timedelta
from flask import current_app, request, session
from enum import Enum
import logging
from collections import defaultdict
import uuid

logger = logging.getLogger(__name__)

class ComplianceType(Enum):
    """Compliance types"""
    KVKK = "kvkk"  # Turkish Data Protection Law
    GDPR = "gdpr"  # General Data Protection Regulation
    PCI_DSS = "pci_dss"  # Payment Card Industry Data Security Standard
    ISO_27001 = "iso_27001"  # Information Security Management
    SOX = "sox"  # Sarbanes-Oxley Act
    HIPAA = "hipaa"  # Health Insurance Portability and Accountability Act

class DataCategory(Enum):
    """Data categories"""
    PERSONAL = "personal"
    SENSITIVE = "sensitive"
    FINANCIAL = "financial"
    HEALTH = "health"
    BIOMETRIC = "biometric"
    LOCATION = "location"
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"

class ProcessingPurpose(Enum):
    """Data processing purposes"""
    SERVICE_PROVISION = "service_provision"
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    SECURITY = "security"
    LEGAL_COMPLIANCE = "legal_compliance"
    CUSTOMER_SUPPORT = "customer_support"
    PAYMENT_PROCESSING = "payment_processing"
    FRAUD_PREVENTION = "fraud_prevention"

class ComplianceManager:
    """Enterprise compliance and governance manager"""
    
    def __init__(self, app=None):
        self.app = app
        self.audit_logs = []
        self.data_inventory = {}
        self.consent_records = {}
        self.data_processing_records = {}
        self.breach_incidents = []
        self.compliance_policies = {}
        self.retention_schedules = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize compliance manager"""
        self.app = app
        
        # Load compliance policies
        self._load_compliance_policies()
        
        # Setup audit logging
        self._setup_audit_logging()
    
    def _load_compliance_policies(self):
        """Load compliance policies and configurations"""
        try:
            self.compliance_policies = {
                'kvkk': {
                    'enabled': True,
                    'data_controller': 'İnci Gold',
                    'data_controller_address': 'Değirmiçem, Gazi Muhtar Paşa Blv. No:31, 27090 Şehitkamil/Gaziantep, Türkiye',
                    'data_controller_contact': 'info@incigold.com',
                    'dpo_contact': 'dpo@incigold.com',
                    'retention_periods': {
                        'customer_data': 365 * 5,  # 5 years
                        'transaction_data': 365 * 10,  # 10 years
                        'marketing_data': 365 * 2,  # 2 years
                        'log_data': 365 * 1,  # 1 year
                        'support_data': 365 * 3  # 3 years
                    },
                    'lawful_bases': [
                        'consent',
                        'contract',
                        'legal_obligation',
                        'vital_interests',
                        'public_task',
                        'legitimate_interests'
                    ]
                },
                'gdpr': {
                    'enabled': True,
                    'data_controller': 'İnci Gold',
                    'data_controller_address': 'Değirmiçem, Gazi Muhtar Paşa Blv. No:31, 27090 Şehitkamil/Gaziantep, Türkiye',
                    'data_controller_contact': 'info@incigold.com',
                    'dpo_contact': 'dpo@incigold.com',
                    'retention_periods': {
                        'customer_data': 365 * 5,  # 5 years
                        'transaction_data': 365 * 10,  # 10 years
                        'marketing_data': 365 * 2,  # 2 years
                        'log_data': 365 * 1,  # 1 year
                        'support_data': 365 * 3  # 3 years
                    },
                    'lawful_bases': [
                        'consent',
                        'contract',
                        'legal_obligation',
                        'vital_interests',
                        'public_task',
                        'legitimate_interests'
                    ]
                },
                'pci_dss': {
                    'enabled': True,
                    'merchant_id': 'incigold_merchant',
                    'compliance_level': 'Level 1',
                    'last_assessment': None,
                    'next_assessment': None,
                    'requirements': [
                        'secure_network',
                        'cardholder_data_protection',
                        'vulnerability_management',
                        'access_control',
                        'network_monitoring',
                        'security_policy'
                    ]
                }
            }
            
            logger.info("Compliance policies loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading compliance policies: {str(e)}")
    
    def _setup_audit_logging(self):
        """Setup comprehensive audit logging"""
        try:
            # This would typically integrate with the application's request handling
            # For now, we'll set up the structure
            
            logger.info("Audit logging setup completed")
            
        except Exception as e:
            logger.error(f"Error setting up audit logging: {str(e)}")
    
    def log_data_access(self, user_id, data_type, data_id, action, purpose, legal_basis):
        """Log data access for compliance"""
        try:
            audit_entry = {
                'id': str(uuid.uuid4()),
                'timestamp': datetime.utcnow().isoformat(),
                'user_id': user_id,
                'data_type': data_type,
                'data_id': data_id,
                'action': action,  # read, write, delete, export
                'purpose': purpose.value if isinstance(purpose, ProcessingPurpose) else purpose,
                'legal_basis': legal_basis,
                'ip_address': request.remote_addr if request else None,
                'user_agent': request.headers.get('User-Agent') if request else None,
                'session_id': session.get('session_id') if session else None,
                'compliance_type': 'kvkk'  # Default to KVKK for Turkish operations
            }
            
            self.audit_logs.append(audit_entry)
            
            # Keep only last 10000 audit logs
            if len(self.audit_logs) > 10000:
                self.audit_logs = self.audit_logs[-10000:]
            
            logger.info(f"Data access logged: {action} on {data_type} by user {user_id}")
            
        except Exception as e:
            logger.error(f"Error logging data access: {str(e)}")
    
    def record_consent(self, user_id, consent_type, purpose, granted=True, 
                      consent_method='explicit', consent_text=None, ip_address=None):
        """Record user consent for data processing"""
        try:
            consent_record = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'consent_type': consent_type,
                'purpose': purpose.value if isinstance(purpose, ProcessingPurpose) else purpose,
                'granted': granted,
                'consent_method': consent_method,
                'consent_text': consent_text,
                'timestamp': datetime.utcnow().isoformat(),
                'ip_address': ip_address or (request.remote_addr if request else None),
                'user_agent': request.headers.get('User-Agent') if request else None,
                'withdrawal_timestamp': None,
                'active': granted
            }
            
            if user_id not in self.consent_records:
                self.consent_records[user_id] = []
            
            self.consent_records[user_id].append(consent_record)
            
            # Log consent action
            self.log_data_access(
                user_id=user_id,
                data_type='consent',
                data_id=consent_record['id'],
                action='create',
                purpose=ProcessingPurpose.LEGAL_COMPLIANCE,
                legal_basis='consent'
            )
            
            logger.info(f"Consent recorded for user {user_id}: {consent_type} - {granted}")
            
        except Exception as e:
            logger.error(f"Error recording consent: {str(e)}")
    
    def withdraw_consent(self, user_id, consent_type, purpose):
        """Withdraw user consent"""
        try:
            if user_id in self.consent_records:
                for consent in self.consent_records[user_id]:
                    if (consent['consent_type'] == consent_type and 
                        consent['purpose'] == purpose and 
                        consent['active']):
                        
                        consent['withdrawal_timestamp'] = datetime.utcnow().isoformat()
                        consent['active'] = False
                        
                        # Log withdrawal
                        self.log_data_access(
                            user_id=user_id,
                            data_type='consent',
                            data_id=consent['id'],
                            action='withdraw',
                            purpose=ProcessingPurpose.LEGAL_COMPLIANCE,
                            legal_basis='consent'
                        )
                        
                        logger.info(f"Consent withdrawn for user {user_id}: {consent_type}")
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error withdrawing consent: {str(e)}")
            return False
    
    def check_consent(self, user_id, consent_type, purpose):
        """Check if user has given consent"""
        try:
            if user_id in self.consent_records:
                for consent in self.consent_records[user_id]:
                    if (consent['consent_type'] == consent_type and 
                        consent['purpose'] == purpose and 
                        consent['active']):
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking consent: {str(e)}")
            return False
    
    def record_data_processing(self, user_id, data_category, processing_purpose, 
                              legal_basis, data_subjects=None, retention_period=None):
        """Record data processing activity"""
        try:
            processing_record = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'data_category': data_category.value if isinstance(data_category, DataCategory) else data_category,
                'processing_purpose': processing_purpose.value if isinstance(processing_purpose, ProcessingPurpose) else processing_purpose,
                'legal_basis': legal_basis,
                'data_subjects': data_subjects or [],
                'retention_period': retention_period,
                'processing_start': datetime.utcnow().isoformat(),
                'processing_end': None,
                'status': 'active'
            }
            
            if user_id not in self.data_processing_records:
                self.data_processing_records[user_id] = []
            
            self.data_processing_records[user_id].append(processing_record)
            
            # Log processing activity
            self.log_data_access(
                user_id=user_id,
                data_type='data_processing',
                data_id=processing_record['id'],
                action='create',
                purpose=ProcessingPurpose.LEGAL_COMPLIANCE,
                legal_basis=legal_basis
            )
            
            logger.info(f"Data processing recorded for user {user_id}: {processing_purpose}")
            
        except Exception as e:
            logger.error(f"Error recording data processing: {str(e)}")
    
    def record_data_breach(self, breach_type, description, affected_users=None, 
                          severity='medium', discovered_at=None, reported_at=None):
        """Record data breach incident"""
        try:
            breach_incident = {
                'id': str(uuid.uuid4()),
                'breach_type': breach_type,
                'description': description,
                'affected_users': affected_users or [],
                'severity': severity,
                'discovered_at': discovered_at or datetime.utcnow().isoformat(),
                'reported_at': reported_at,
                'contained_at': None,
                'investigation_completed_at': None,
                'authorities_notified_at': None,
                'users_notified_at': None,
                'status': 'discovered',
                'impact_assessment': None,
                'remediation_actions': [],
                'lessons_learned': None
            }
            
            self.breach_incidents.append(breach_incident)
            
            # Log breach incident
            self.log_data_access(
                user_id='system',
                data_type='breach_incident',
                data_id=breach_incident['id'],
                action='create',
                purpose=ProcessingPurpose.LEGAL_COMPLIANCE,
                legal_basis='legal_obligation'
            )
            
            logger.warning(f"Data breach incident recorded: {breach_type} - {severity}")
            
        except Exception as e:
            logger.error(f"Error recording data breach: {str(e)}")
    
    def generate_data_inventory(self):
        """Generate comprehensive data inventory"""
        try:
            data_inventory = {
                'generated_at': datetime.utcnow().isoformat(),
                'data_categories': {},
                'processing_activities': {},
                'data_flows': {},
                'retention_schedules': {},
                'security_measures': {},
                'third_party_sharing': {}
            }
            
            # Categorize data by type
            for user_id, processing_records in self.data_processing_records.items():
                for record in processing_records:
                    data_category = record['data_category']
                    if data_category not in data_inventory['data_categories']:
                        data_inventory['data_categories'][data_category] = {
                            'count': 0,
                            'purposes': set(),
                            'legal_bases': set(),
                            'retention_periods': set()
                        }
                    
                    data_inventory['data_categories'][data_category]['count'] += 1
                    data_inventory['data_categories'][data_category]['purposes'].add(record['processing_purpose'])
                    data_inventory['data_categories'][data_category]['legal_bases'].add(record['legal_basis'])
                    if record['retention_period']:
                        data_inventory['data_categories'][data_category]['retention_periods'].add(record['retention_period'])
            
            # Convert sets to lists for JSON serialization
            for category in data_inventory['data_categories']:
                data_inventory['data_categories'][category]['purposes'] = list(data_inventory['data_categories'][category]['purposes'])
                data_inventory['data_categories'][category]['legal_bases'] = list(data_inventory['data_categories'][category]['legal_bases'])
                data_inventory['data_categories'][category]['retention_periods'] = list(data_inventory['data_categories'][category]['retention_periods'])
            
            self.data_inventory = data_inventory
            
            logger.info("Data inventory generated successfully")
            return data_inventory
            
        except Exception as e:
            logger.error(f"Error generating data inventory: {str(e)}")
            return None
    
    def generate_compliance_report(self, compliance_type, start_date=None, end_date=None):
        """Generate compliance report"""
        try:
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=30)
            if not end_date:
                end_date = datetime.utcnow()
            
            report = {
                'report_id': str(uuid.uuid4()),
                'compliance_type': compliance_type.value if isinstance(compliance_type, ComplianceType) else compliance_type,
                'report_period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'generated_at': datetime.utcnow().isoformat(),
                'summary': {},
                'audit_logs': [],
                'consent_records': [],
                'data_processing_records': [],
                'breach_incidents': [],
                'compliance_status': {},
                'recommendations': []
            }
            
            # Filter audit logs by date range
            report['audit_logs'] = [
                log for log in self.audit_logs
                if start_date <= datetime.fromisoformat(log['timestamp']) <= end_date
            ]
            
            # Filter consent records
            for user_id, consents in self.consent_records.items():
                for consent in consents:
                    if start_date <= datetime.fromisoformat(consent['timestamp']) <= end_date:
                        report['consent_records'].append(consent)
            
            # Filter data processing records
            for user_id, processing_records in self.data_processing_records.items():
                for record in processing_records:
                    if start_date <= datetime.fromisoformat(record['processing_start']) <= end_date:
                        report['data_processing_records'].append(record)
            
            # Filter breach incidents
            report['breach_incidents'] = [
                incident for incident in self.breach_incidents
                if start_date <= datetime.fromisoformat(incident['discovered_at']) <= end_date
            ]
            
            # Generate summary
            report['summary'] = {
                'total_audit_logs': len(report['audit_logs']),
                'total_consent_records': len(report['consent_records']),
                'total_processing_records': len(report['data_processing_records']),
                'total_breach_incidents': len(report['breach_incidents']),
                'active_consents': len([c for c in report['consent_records'] if c['active']]),
                'withdrawn_consents': len([c for c in report['consent_records'] if not c['active']])
            }
            
            # Assess compliance status
            report['compliance_status'] = self._assess_compliance_status(compliance_type, report)
            
            # Generate recommendations
            report['recommendations'] = self._generate_compliance_recommendations(compliance_type, report)
            
            logger.info(f"Compliance report generated: {compliance_type}")
            return report
            
        except Exception as e:
            logger.error(f"Error generating compliance report: {str(e)}")
            return None
    
    def _assess_compliance_status(self, compliance_type, report):
        """Assess compliance status"""
        try:
            status = {
                'overall_status': 'compliant',
                'score': 100,
                'issues': [],
                'strengths': []
            }
            
            if compliance_type == ComplianceType.KVKK.value or compliance_type == ComplianceType.GDPR.value:
                # Check consent management
                if report['summary']['total_consent_records'] == 0:
                    status['issues'].append('No consent records found')
                    status['score'] -= 20
                
                # Check data processing records
                if report['summary']['total_processing_records'] == 0:
                    status['issues'].append('No data processing records found')
                    status['score'] -= 15
                
                # Check breach incidents
                if report['summary']['total_breach_incidents'] > 0:
                    status['issues'].append(f'{report["summary"]["total_breach_incidents"]} breach incidents found')
                    status['score'] -= 30
                
                # Check audit logging
                if report['summary']['total_audit_logs'] < 100:
                    status['issues'].append('Insufficient audit logging')
                    status['score'] -= 10
                
                # Determine overall status
                if status['score'] >= 90:
                    status['overall_status'] = 'compliant'
                elif status['score'] >= 70:
                    status['overall_status'] = 'mostly_compliant'
                elif status['score'] >= 50:
                    status['overall_status'] = 'partially_compliant'
                else:
                    status['overall_status'] = 'non_compliant'
            
            return status
            
        except Exception as e:
            logger.error(f"Error assessing compliance status: {str(e)}")
            return {'overall_status': 'unknown', 'score': 0, 'error': str(e)}
    
    def _generate_compliance_recommendations(self, compliance_type, report):
        """Generate compliance recommendations"""
        try:
            recommendations = []
            
            if compliance_type == ComplianceType.KVKK.value or compliance_type == ComplianceType.GDPR.value:
                # Consent management recommendations
                if report['summary']['total_consent_records'] == 0:
                    recommendations.append({
                        'category': 'consent_management',
                        'priority': 'high',
                        'title': 'Implement Consent Management System',
                        'description': 'No consent records found. Implement a comprehensive consent management system.',
                        'action_items': [
                            'Create consent collection forms',
                            'Implement consent withdrawal mechanisms',
                            'Set up consent tracking and auditing'
                        ]
                    })
                
                # Data processing recommendations
                if report['summary']['total_processing_records'] == 0:
                    recommendations.append({
                        'category': 'data_processing',
                        'priority': 'high',
                        'title': 'Document Data Processing Activities',
                        'description': 'No data processing records found. Document all data processing activities.',
                        'action_items': [
                            'Create data processing inventory',
                            'Document lawful basis for each processing activity',
                            'Implement data processing tracking'
                        ]
                    })
                
                # Breach management recommendations
                if report['summary']['total_breach_incidents'] > 0:
                    recommendations.append({
                        'category': 'breach_management',
                        'priority': 'critical',
                        'title': 'Review Breach Management Procedures',
                        'description': 'Breach incidents found. Review and improve breach management procedures.',
                        'action_items': [
                            'Conduct breach impact assessments',
                            'Implement breach notification procedures',
                            'Review security measures and controls'
                        ]
                    })
                
                # Audit logging recommendations
                if report['summary']['total_audit_logs'] < 100:
                    recommendations.append({
                        'category': 'audit_logging',
                        'priority': 'medium',
                        'title': 'Enhance Audit Logging',
                        'description': 'Insufficient audit logging. Enhance audit logging capabilities.',
                        'action_items': [
                            'Implement comprehensive audit logging',
                            'Set up log monitoring and alerting',
                            'Establish log retention policies'
                        ]
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating compliance recommendations: {str(e)}")
            return []
    
    def export_user_data(self, user_id, include_audit_logs=True):
        """Export all user data for data portability"""
        try:
            user_data = {
                'export_id': str(uuid.uuid4()),
                'user_id': user_id,
                'exported_at': datetime.utcnow().isoformat(),
                'data_categories': {},
                'consent_records': [],
                'processing_records': [],
                'audit_logs': []
            }
            
            # Get user consent records
            if user_id in self.consent_records:
                user_data['consent_records'] = self.consent_records[user_id]
            
            # Get user data processing records
            if user_id in self.data_processing_records:
                user_data['processing_records'] = self.data_processing_records[user_id]
            
            # Get user audit logs
            if include_audit_logs:
                user_data['audit_logs'] = [
                    log for log in self.audit_logs
                    if log['user_id'] == user_id
                ]
            
            # Log data export
            self.log_data_access(
                user_id=user_id,
                data_type='user_data_export',
                data_id=user_data['export_id'],
                action='export',
                purpose=ProcessingPurpose.LEGAL_COMPLIANCE,
                legal_basis='data_portability'
            )
            
            logger.info(f"User data exported for user {user_id}")
            return user_data
            
        except Exception as e:
            logger.error(f"Error exporting user data: {str(e)}")
            return None
    
    def delete_user_data(self, user_id, reason='user_request'):
        """Delete all user data (right to be forgotten)"""
        try:
            deleted_data = {
                'deletion_id': str(uuid.uuid4()),
                'user_id': user_id,
                'deleted_at': datetime.utcnow().isoformat(),
                'reason': reason,
                'deleted_categories': []
            }
            
            # Delete consent records
            if user_id in self.consent_records:
                deleted_data['deleted_categories'].append('consent_records')
                del self.consent_records[user_id]
            
            # Delete data processing records
            if user_id in self.data_processing_records:
                deleted_data['deleted_categories'].append('data_processing_records')
                del self.data_processing_records[user_id]
            
            # Mark audit logs as deleted (don't actually delete for compliance)
            audit_logs_deleted = 0
            for log in self.audit_logs:
                if log['user_id'] == user_id:
                    log['deleted_at'] = datetime.utcnow().isoformat()
                    log['deletion_reason'] = reason
                    audit_logs_deleted += 1
            
            if audit_logs_deleted > 0:
                deleted_data['deleted_categories'].append('audit_logs')
                deleted_data['audit_logs_deleted'] = audit_logs_deleted
            
            # Log data deletion
            self.log_data_access(
                user_id=user_id,
                data_type='user_data_deletion',
                data_id=deleted_data['deletion_id'],
                action='delete',
                purpose=ProcessingPurpose.LEGAL_COMPLIANCE,
                legal_basis='user_request'
            )
            
            logger.info(f"User data deleted for user {user_id}: {reason}")
            return deleted_data
            
        except Exception as e:
            logger.error(f"Error deleting user data: {str(e)}")
            return None
    
    def get_compliance_status(self, compliance_type=None):
        """Get current compliance status"""
        try:
            if compliance_type:
                compliance_types = [compliance_type]
            else:
                compliance_types = [ct.value for ct in ComplianceType]
            
            status = {}
            
            for ct in compliance_types:
                if ct in self.compliance_policies:
                    policy = self.compliance_policies[ct]
                    status[ct] = {
                        'enabled': policy.get('enabled', False),
                        'last_assessment': policy.get('last_assessment'),
                        'next_assessment': policy.get('next_assessment'),
                        'compliance_score': self._calculate_compliance_score(ct),
                        'requirements_met': self._check_requirements(ct),
                        'recommendations': self._get_compliance_recommendations(ct)
                    }
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting compliance status: {str(e)}")
            return None
    
    def _calculate_compliance_score(self, compliance_type):
        """Calculate compliance score for specific type"""
        try:
            # This would be a more sophisticated calculation
            # For now, return a basic score based on available data
            
            score = 100
            
            # Check if compliance is enabled
            if not self.compliance_policies.get(compliance_type, {}).get('enabled', False):
                score -= 50
            
            # Check for breach incidents
            if self.breach_incidents:
                score -= len(self.breach_incidents) * 10
            
            # Check audit logging
            if len(self.audit_logs) < 100:
                score -= 20
            
            return max(0, score)
            
        except Exception as e:
            logger.error(f"Error calculating compliance score: {str(e)}")
            return 0
    
    def _check_requirements(self, compliance_type):
        """Check specific compliance requirements"""
        try:
            requirements = {}
            
            if compliance_type in ['kvkk', 'gdpr']:
                requirements = {
                    'consent_management': len(self.consent_records) > 0,
                    'data_processing_records': len(self.data_processing_records) > 0,
                    'audit_logging': len(self.audit_logs) > 0,
                    'breach_management': True,  # System is in place
                    'data_inventory': len(self.data_inventory) > 0,
                    'user_rights': True  # Export and deletion functions available
                }
            
            return requirements
            
        except Exception as e:
            logger.error(f"Error checking requirements: {str(e)}")
            return {}
    
    def _get_compliance_recommendations(self, compliance_type):
        """Get compliance recommendations for specific type"""
        try:
            recommendations = []
            
            if compliance_type in ['kvkk', 'gdpr']:
                if len(self.consent_records) == 0:
                    recommendations.append("Implement consent management system")
                
                if len(self.data_processing_records) == 0:
                    recommendations.append("Document data processing activities")
                
                if len(self.audit_logs) < 100:
                    recommendations.append("Enhance audit logging")
                
                if len(self.breach_incidents) > 0:
                    recommendations.append("Review breach management procedures")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting compliance recommendations: {str(e)}")
            return []

# Global compliance manager instance
compliance_manager = ComplianceManager()
