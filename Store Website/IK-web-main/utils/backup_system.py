"""
Enterprise Backup & Disaster Recovery System
Automated backups, encryption, cross-region replication
"""

import os
import shutil
import gzip
import json
import hashlib
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import logging
from cryptography.fernet import Fernet
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class BackupManager:
    """Enterprise backup and disaster recovery manager"""
    
    def __init__(self, app=None):
        self.app = app
        self.backup_dir = os.path.join(os.getcwd(), 'backups')
        self.encryption_key = None
        self.s3_client = None
        self.retention_days = int(os.getenv('BACKUP_RETENTION_DAYS', '30'))
        self.s3_bucket = os.getenv('BACKUP_S3_BUCKET')
        self.aws_region = os.getenv('AWS_REGION', 'eu-west-1')
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize backup manager"""
        self.app = app
        
        # Create backup directory
        os.makedirs(self.backup_dir, exist_ok=True)
        
        # Initialize encryption
        self._init_encryption()
        
        # Initialize S3 if configured
        if self.s3_bucket:
            self._init_s3()
    
    def _init_encryption(self):
        """Initialize encryption key"""
        try:
            key_file = os.path.join(self.backup_dir, '.encryption_key')
            
            if os.path.exists(key_file):
                with open(key_file, 'rb') as f:
                    self.encryption_key = f.read()
            else:
                self.encryption_key = Fernet.generate_key()
                with open(key_file, 'wb') as f:
                    f.write(self.encryption_key)
                
                # Secure the key file
                os.chmod(key_file, 0o600)
                
            logger.info("Encryption initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing encryption: {str(e)}")
            raise
    
    def _init_s3(self):
        """Initialize S3 client"""
        try:
            self.s3_client = boto3.client(
                's3',
                region_name=self.aws_region,
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
            )
            
            # Test S3 connection
            self.s3_client.head_bucket(Bucket=self.s3_bucket)
            logger.info(f"S3 initialized successfully: {self.s3_bucket}")
            
        except Exception as e:
            logger.error(f"Error initializing S3: {str(e)}")
            self.s3_client = None
    
    def create_full_backup(self):
        """Create full system backup"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_name = f"full_backup_{timestamp}"
            backup_path = os.path.join(self.backup_dir, backup_name)
            
            logger.info(f"Starting full backup: {backup_name}")
            
            # Create backup directory
            os.makedirs(backup_path, exist_ok=True)
            
            # Backup database
            db_backup = self._backup_database(backup_path)
            
            # Backup application files
            app_backup = self._backup_application_files(backup_path)
            
            # Backup configuration
            config_backup = self._backup_configuration(backup_path)
            
            # Create backup manifest
            manifest = self._create_backup_manifest(backup_path, {
                'database': db_backup,
                'application': app_backup,
                'configuration': config_backup
            })
            
            # Compress backup
            compressed_backup = self._compress_backup(backup_path)
            
            # Encrypt backup
            encrypted_backup = self._encrypt_backup(compressed_backup)
            
            # Upload to S3 if configured
            if self.s3_client:
                self._upload_to_s3(encrypted_backup)
            
            # Clean up local files
            shutil.rmtree(backup_path)
            os.remove(compressed_backup)
            
            logger.info(f"Full backup completed: {backup_name}")
            return {
                'success': True,
                'backup_name': backup_name,
                'backup_size': os.path.getsize(encrypted_backup),
                'timestamp': timestamp
            }
            
        except Exception as e:
            logger.error(f"Error creating full backup: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_database_backup(self):
        """Create database-only backup"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_name = f"db_backup_{timestamp}"
            backup_path = os.path.join(self.backup_dir, backup_name)
            
            logger.info(f"Starting database backup: {backup_name}")
            
            # Create backup directory
            os.makedirs(backup_path, exist_ok=True)
            
            # Backup database
            db_backup = self._backup_database(backup_path)
            
            # Create backup manifest
            manifest = self._create_backup_manifest(backup_path, {
                'database': db_backup
            })
            
            # Compress backup
            compressed_backup = self._compress_backup(backup_path)
            
            # Encrypt backup
            encrypted_backup = self._encrypt_backup(compressed_backup)
            
            # Upload to S3 if configured
            if self.s3_client:
                self._upload_to_s3(encrypted_backup)
            
            # Clean up local files
            shutil.rmtree(backup_path)
            os.remove(compressed_backup)
            
            logger.info(f"Database backup completed: {backup_name}")
            return {
                'success': True,
                'backup_name': backup_name,
                'backup_size': os.path.getsize(encrypted_backup),
                'timestamp': timestamp
            }
            
        except Exception as e:
            logger.error(f"Error creating database backup: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _backup_database(self, backup_path):
        """Backup database"""
        try:
            db_path = os.path.join(self.app.instance_path, 'kuyumcu.db')
            
            if os.path.exists(db_path):
                # SQLite backup
                backup_file = os.path.join(backup_path, 'database.db')
                shutil.copy2(db_path, backup_file)
                
                # Create SQL dump
                dump_file = os.path.join(backup_path, 'database.sql')
                self._create_sql_dump(db_path, dump_file)
                
                return {
                    'type': 'sqlite',
                    'files': ['database.db', 'database.sql'],
                    'size': os.path.getsize(backup_file)
                }
            else:
                # PostgreSQL backup
                return self._backup_postgresql(backup_path)
                
        except Exception as e:
            logger.error(f"Error backing up database: {str(e)}")
            raise
    
    def _backup_postgresql(self, backup_path):
        """Backup PostgreSQL database"""
        try:
            db_url = self.app.config.get('DATABASE_URL')
            if not db_url:
                raise ValueError("DATABASE_URL not configured")
            
            dump_file = os.path.join(backup_path, 'database.sql')
            
            # Create pg_dump command
            cmd = [
                'pg_dump',
                '--verbose',
                '--clean',
                '--no-owner',
                '--no-privileges',
                db_url
            ]
            
            # Execute pg_dump
            with open(dump_file, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
                
                if result.returncode != 0:
                    raise Exception(f"pg_dump failed: {result.stderr}")
            
            return {
                'type': 'postgresql',
                'files': ['database.sql'],
                'size': os.path.getsize(dump_file)
            }
            
        except Exception as e:
            logger.error(f"Error backing up PostgreSQL: {str(e)}")
            raise
    
    def _create_sql_dump(self, db_path, dump_file):
        """Create SQL dump for SQLite"""
        try:
            cmd = ['sqlite3', db_path, '.dump']
            
            with open(dump_file, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
                
                if result.returncode != 0:
                    raise Exception(f"sqlite3 dump failed: {result.stderr}")
                    
        except Exception as e:
            logger.error(f"Error creating SQL dump: {str(e)}")
            raise
    
    def _backup_application_files(self, backup_path):
        """Backup application files"""
        try:
            app_files_path = os.path.join(backup_path, 'application')
            os.makedirs(app_files_path, exist_ok=True)
            
            # Backup static files
            static_path = os.path.join(self.app.root_path, 'static')
            if os.path.exists(static_path):
                shutil.copytree(static_path, os.path.join(app_files_path, 'static'))
            
            # Backup templates
            templates_path = os.path.join(self.app.root_path, 'templates')
            if os.path.exists(templates_path):
                shutil.copytree(templates_path, os.path.join(app_files_path, 'templates'))
            
            # Backup uploads
            uploads_path = os.path.join(self.app.root_path, 'static', 'uploads')
            if os.path.exists(uploads_path):
                shutil.copytree(uploads_path, os.path.join(app_files_path, 'uploads'))
            
            return {
                'type': 'application_files',
                'size': self._get_directory_size(app_files_path)
            }
            
        except Exception as e:
            logger.error(f"Error backing up application files: {str(e)}")
            raise
    
    def _backup_configuration(self, backup_path):
        """Backup configuration files"""
        try:
            config_path = os.path.join(backup_path, 'config')
            os.makedirs(config_path, exist_ok=True)
            
            # Backup .env file (without sensitive data)
            env_file = os.path.join(os.getcwd(), '.env')
            if os.path.exists(env_file):
                self._backup_env_file(env_file, config_path)
            
            # Backup configuration files
            config_files = ['requirements.txt', 'Dockerfile', 'docker-compose.yml']
            for config_file in config_files:
                file_path = os.path.join(os.getcwd(), config_file)
                if os.path.exists(file_path):
                    shutil.copy2(file_path, config_path)
            
            return {
                'type': 'configuration',
                'size': self._get_directory_size(config_path)
            }
            
        except Exception as e:
            logger.error(f"Error backing up configuration: {str(e)}")
            raise
    
    def _backup_env_file(self, env_file, config_path):
        """Backup .env file with sensitive data masked"""
        try:
            backup_env_file = os.path.join(config_path, '.env.example')
            
            with open(env_file, 'r') as f:
                lines = f.readlines()
            
            # Mask sensitive values
            sensitive_keys = ['SECRET_KEY', 'PASSWORD', 'API_KEY', 'TOKEN']
            masked_lines = []
            
            for line in lines:
                if '=' in line:
                    key, value = line.split('=', 1)
                    if any(sensitive in key.upper() for sensitive in sensitive_keys):
                        masked_lines.append(f"{key}=***MASKED***\n")
                    else:
                        masked_lines.append(line)
                else:
                    masked_lines.append(line)
            
            with open(backup_env_file, 'w') as f:
                f.writelines(masked_lines)
                
        except Exception as e:
            logger.error(f"Error backing up .env file: {str(e)}")
            raise
    
    def _create_backup_manifest(self, backup_path, components):
        """Create backup manifest"""
        try:
            manifest = {
                'backup_id': os.path.basename(backup_path),
                'timestamp': datetime.now().isoformat(),
                'version': '1.0',
                'components': components,
                'total_size': sum(comp.get('size', 0) for comp in components.values()),
                'checksum': None
            }
            
            # Calculate checksum
            manifest['checksum'] = self._calculate_checksum(backup_path)
            
            # Save manifest
            manifest_file = os.path.join(backup_path, 'manifest.json')
            with open(manifest_file, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            return manifest
            
        except Exception as e:
            logger.error(f"Error creating backup manifest: {str(e)}")
            raise
    
    def _calculate_checksum(self, path):
        """Calculate checksum for backup"""
        try:
            hasher = hashlib.sha256()
            
            for root, dirs, files in os.walk(path):
                for file in sorted(files):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'rb') as f:
                        for chunk in iter(lambda: f.read(4096), b""):
                            hasher.update(chunk)
            
            return hasher.hexdigest()
            
        except Exception as e:
            logger.error(f"Error calculating checksum: {str(e)}")
            return None
    
    def _compress_backup(self, backup_path):
        """Compress backup directory"""
        try:
            compressed_file = f"{backup_path}.tar.gz"
            
            # Create tar.gz archive
            cmd = ['tar', '-czf', compressed_file, '-C', os.path.dirname(backup_path), os.path.basename(backup_path)]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Compression failed: {result.stderr}")
            
            return compressed_file
            
        except Exception as e:
            logger.error(f"Error compressing backup: {str(e)}")
            raise
    
    def _encrypt_backup(self, backup_file):
        """Encrypt backup file"""
        try:
            encrypted_file = f"{backup_file}.encrypted"
            
            fernet = Fernet(self.encryption_key)
            
            with open(backup_file, 'rb') as f:
                data = f.read()
            
            encrypted_data = fernet.encrypt(data)
            
            with open(encrypted_file, 'wb') as f:
                f.write(encrypted_data)
            
            return encrypted_file
            
        except Exception as e:
            logger.error(f"Error encrypting backup: {str(e)}")
            raise
    
    def _upload_to_s3(self, backup_file):
        """Upload backup to S3"""
        try:
            if not self.s3_client:
                return
            
            key = f"backups/{os.path.basename(backup_file)}"
            
            # Upload with metadata
            metadata = {
                'backup_type': 'full' if 'full_backup' in key else 'database',
                'timestamp': datetime.now().isoformat(),
                'size': str(os.path.getsize(backup_file))
            }
            
            self.s3_client.upload_file(
                backup_file,
                self.s3_bucket,
                key,
                ExtraArgs={
                    'Metadata': metadata,
                    'ServerSideEncryption': 'AES256'
                }
            )
            
            logger.info(f"Backup uploaded to S3: {key}")
            
        except Exception as e:
            logger.error(f"Error uploading to S3: {str(e)}")
            raise
    
    def _get_directory_size(self, path):
        """Get directory size in bytes"""
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(path):
            for filename in filenames:
                filepath = os.path.join(dirpath, filename)
                if os.path.exists(filepath):
                    total_size += os.path.getsize(filepath)
        return total_size
    
    def restore_backup(self, backup_name, restore_path=None):
        """Restore from backup"""
        try:
            if not restore_path:
                restore_path = os.getcwd()
            
            logger.info(f"Starting restore from backup: {backup_name}")
            
            # Download from S3 if needed
            backup_file = self._download_backup(backup_name)
            
            # Decrypt backup
            decrypted_file = self._decrypt_backup(backup_file)
            
            # Extract backup
            extracted_path = self._extract_backup(decrypted_file)
            
            # Restore components
            self._restore_components(extracted_path, restore_path)
            
            # Clean up
            os.remove(backup_file)
            os.remove(decrypted_file)
            shutil.rmtree(extracted_path)
            
            logger.info(f"Restore completed: {backup_name}")
            return {
                'success': True,
                'backup_name': backup_name
            }
            
        except Exception as e:
            logger.error(f"Error restoring backup: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _download_backup(self, backup_name):
        """Download backup from S3"""
        try:
            if not self.s3_client:
                # Look for local backup
                local_backup = os.path.join(self.backup_dir, f"{backup_name}.tar.gz.encrypted")
                if os.path.exists(local_backup):
                    return local_backup
                else:
                    raise FileNotFoundError(f"Backup not found: {backup_name}")
            
            # Download from S3
            key = f"backups/{backup_name}.tar.gz.encrypted"
            local_file = os.path.join(self.backup_dir, f"{backup_name}.tar.gz.encrypted")
            
            self.s3_client.download_file(self.s3_bucket, key, local_file)
            
            return local_file
            
        except Exception as e:
            logger.error(f"Error downloading backup: {str(e)}")
            raise
    
    def _decrypt_backup(self, backup_file):
        """Decrypt backup file"""
        try:
            decrypted_file = backup_file.replace('.encrypted', '')
            
            fernet = Fernet(self.encryption_key)
            
            with open(backup_file, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = fernet.decrypt(encrypted_data)
            
            with open(decrypted_file, 'wb') as f:
                f.write(decrypted_data)
            
            return decrypted_file
            
        except Exception as e:
            logger.error(f"Error decrypting backup: {str(e)}")
            raise
    
    def _extract_backup(self, backup_file):
        """Extract backup archive"""
        try:
            extract_path = backup_file.replace('.tar.gz', '_extracted')
            os.makedirs(extract_path, exist_ok=True)
            
            cmd = ['tar', '-xzf', backup_file, '-C', extract_path]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"Extraction failed: {result.stderr}")
            
            return extract_path
            
        except Exception as e:
            logger.error(f"Error extracting backup: {str(e)}")
            raise
    
    def _restore_components(self, extracted_path, restore_path):
        """Restore backup components"""
        try:
            # Read manifest
            manifest_file = os.path.join(extracted_path, os.path.basename(extracted_path), 'manifest.json')
            with open(manifest_file, 'r') as f:
                manifest = json.load(f)
            
            # Restore database
            if 'database' in manifest['components']:
                self._restore_database(extracted_path, restore_path)
            
            # Restore application files
            if 'application' in manifest['components']:
                self._restore_application_files(extracted_path, restore_path)
            
            # Restore configuration
            if 'configuration' in manifest['components']:
                self._restore_configuration(extracted_path, restore_path)
                
        except Exception as e:
            logger.error(f"Error restoring components: {str(e)}")
            raise
    
    def _restore_database(self, extracted_path, restore_path):
        """Restore database"""
        try:
            backup_dir = os.path.join(extracted_path, os.path.basename(extracted_path))
            db_backup = os.path.join(backup_dir, 'database.db')
            
            if os.path.exists(db_backup):
                # Restore SQLite database
                db_path = os.path.join(restore_path, 'instance', 'kuyumcu.db')
                os.makedirs(os.path.dirname(db_path), exist_ok=True)
                shutil.copy2(db_backup, db_path)
                
                logger.info("SQLite database restored")
            else:
                # Restore PostgreSQL database
                self._restore_postgresql(backup_dir)
                
        except Exception as e:
            logger.error(f"Error restoring database: {str(e)}")
            raise
    
    def _restore_postgresql(self, backup_dir):
        """Restore PostgreSQL database"""
        try:
            dump_file = os.path.join(backup_dir, 'database.sql')
            
            if not os.path.exists(dump_file):
                raise FileNotFoundError("PostgreSQL dump file not found")
            
            db_url = self.app.config.get('DATABASE_URL')
            if not db_url:
                raise ValueError("DATABASE_URL not configured")
            
            # Restore database
            cmd = ['psql', db_url, '-f', dump_file]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"PostgreSQL restore failed: {result.stderr}")
            
            logger.info("PostgreSQL database restored")
            
        except Exception as e:
            logger.error(f"Error restoring PostgreSQL: {str(e)}")
            raise
    
    def _restore_application_files(self, extracted_path, restore_path):
        """Restore application files"""
        try:
            backup_dir = os.path.join(extracted_path, os.path.basename(extracted_path), 'application')
            
            # Restore static files
            static_backup = os.path.join(backup_dir, 'static')
            if os.path.exists(static_backup):
                static_path = os.path.join(restore_path, 'static')
                if os.path.exists(static_path):
                    shutil.rmtree(static_path)
                shutil.copytree(static_backup, static_path)
            
            # Restore templates
            templates_backup = os.path.join(backup_dir, 'templates')
            if os.path.exists(templates_backup):
                templates_path = os.path.join(restore_path, 'templates')
                if os.path.exists(templates_path):
                    shutil.rmtree(templates_path)
                shutil.copytree(templates_backup, templates_path)
            
            # Restore uploads
            uploads_backup = os.path.join(backup_dir, 'uploads')
            if os.path.exists(uploads_backup):
                uploads_path = os.path.join(restore_path, 'static', 'uploads')
                if os.path.exists(uploads_path):
                    shutil.rmtree(uploads_path)
                shutil.copytree(uploads_backup, uploads_path)
            
            logger.info("Application files restored")
            
        except Exception as e:
            logger.error(f"Error restoring application files: {str(e)}")
            raise
    
    def _restore_configuration(self, extracted_path, restore_path):
        """Restore configuration files"""
        try:
            backup_dir = os.path.join(extracted_path, os.path.basename(extracted_path), 'config')
            
            # Restore configuration files
            config_files = ['requirements.txt', 'Dockerfile', 'docker-compose.yml']
            for config_file in config_files:
                backup_file = os.path.join(backup_dir, config_file)
                if os.path.exists(backup_file):
                    restore_file = os.path.join(restore_path, config_file)
                    shutil.copy2(backup_file, restore_file)
            
            logger.info("Configuration files restored")
            
        except Exception as e:
            logger.error(f"Error restoring configuration: {str(e)}")
            raise
    
    def cleanup_old_backups(self):
        """Clean up old backups based on retention policy"""
        try:
            cutoff_date = datetime.now() - timedelta(days=self.retention_days)
            
            # Clean up local backups
            for backup_file in os.listdir(self.backup_dir):
                if backup_file.endswith('.encrypted'):
                    file_path = os.path.join(self.backup_dir, backup_file)
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    
                    if file_time < cutoff_date:
                        os.remove(file_path)
                        logger.info(f"Removed old backup: {backup_file}")
            
            # Clean up S3 backups
            if self.s3_client:
                self._cleanup_s3_backups(cutoff_date)
            
            logger.info("Backup cleanup completed")
            
        except Exception as e:
            logger.error(f"Error cleaning up backups: {str(e)}")
    
    def _cleanup_s3_backups(self, cutoff_date):
        """Clean up old S3 backups"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.s3_bucket,
                Prefix='backups/'
            )
            
            for obj in response.get('Contents', []):
                if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                    self.s3_client.delete_object(
                        Bucket=self.s3_bucket,
                        Key=obj['Key']
                    )
                    logger.info(f"Removed old S3 backup: {obj['Key']}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up S3 backups: {str(e)}")
    
    def get_backup_status(self):
        """Get backup system status"""
        try:
            status = {
                'backup_dir': self.backup_dir,
                'retention_days': self.retention_days,
                's3_configured': self.s3_client is not None,
                's3_bucket': self.s3_bucket,
                'encryption_enabled': self.encryption_key is not None,
                'last_backup': None,
                'backup_count': 0,
                'total_size': 0
            }
            
            # Get local backup info
            if os.path.exists(self.backup_dir):
                backup_files = [f for f in os.listdir(self.backup_dir) if f.endswith('.encrypted')]
                status['backup_count'] = len(backup_files)
                
                if backup_files:
                    # Get most recent backup
                    latest_backup = max(backup_files, key=lambda f: os.path.getmtime(os.path.join(self.backup_dir, f)))
                    status['last_backup'] = datetime.fromtimestamp(os.path.getmtime(os.path.join(self.backup_dir, latest_backup))).isoformat()
                    
                    # Calculate total size
                    for backup_file in backup_files:
                        file_path = os.path.join(self.backup_dir, backup_file)
                        status['total_size'] += os.path.getsize(file_path)
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting backup status: {str(e)}")
            return None

# Global backup manager instance
backup_manager = BackupManager()
