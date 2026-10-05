"""
Advanced database configuration and connection pooling
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.pool import QueuePool, StaticPool
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Advanced database connection manager"""
    
    def __init__(self, app=None):
        self.engine = None
        self.session_factory = None
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize database with advanced configuration"""
        
        # Database URL with connection pooling
        database_url = app.config.get('SQLALCHEMY_DATABASE_URI')
        
        # Advanced engine configuration
        engine_options = {
            'poolclass': QueuePool,
            'pool_size': int(os.getenv('DB_POOL_SIZE', '10')),
            'pool_recycle': int(os.getenv('DB_POOL_RECYCLE', '3600')),
            'pool_pre_ping': True,
            'pool_timeout': int(os.getenv('DB_POOL_TIMEOUT', '30')),
            'max_overflow': int(os.getenv('DB_MAX_OVERFLOW', '20')),
            'echo': os.getenv('SQL_LOGGING', 'False').lower() == 'true',
            'echo_pool': os.getenv('SQL_LOGGING', 'False').lower() == 'true',
            'connect_args': {
                'check_same_thread': False,  # For SQLite
                'timeout': 30,
                'isolation_level': None
            }
        }
        
        # PostgreSQL specific options
        if database_url.startswith('postgresql'):
            engine_options['connect_args'] = {
                'connect_timeout': 30,
                'application_name': 'incigold_app',
                'options': '-c default_transaction_isolation=read_committed'
            }
        
        # MySQL specific options
        elif database_url.startswith('mysql'):
            engine_options['connect_args'] = {
                'connect_timeout': 30,
                'charset': 'utf8mb4',
                'autocommit': False
            }
        
        self.engine = create_engine(database_url, **engine_options)
        
        # Create session factory
        self.session_factory = sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False
        )
        
        # Add event listeners for monitoring
        self._add_event_listeners()
        
        logger.info(f"Database initialized with pool_size={engine_options['pool_size']}")
    
    def _add_event_listeners(self):
        """Add database event listeners for monitoring"""
        
        @event.listens_for(Engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            """Set SQLite pragmas for better performance"""
            if 'sqlite' in str(dbapi_connection):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA synchronous=NORMAL")
                cursor.execute("PRAGMA cache_size=10000")
                cursor.execute("PRAGMA temp_store=MEMORY")
                cursor.close()
        
        @event.listens_for(Engine, "checkout")
        def receive_checkout(dbapi_connection, connection_record, connection_proxy):
            """Log connection checkout"""
            logger.debug("Connection checked out from pool")
        
        @event.listens_for(Engine, "checkin")
        def receive_checkin(dbapi_connection, connection_record):
            """Log connection checkin"""
            logger.debug("Connection checked in to pool")
    
    def get_session(self):
        """Get a new database session"""
        return self.session_factory()
    
    def get_engine(self):
        """Get the database engine"""
        return self.engine
    
    def health_check(self):
        """Perform database health check"""
        try:
            with self.engine.connect() as conn:
                conn.execute("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    def get_pool_status(self):
        """Get connection pool status"""
        pool = self.engine.pool
        return {
            'size': pool.size(),
            'checked_in': pool.checkedin(),
            'checked_out': pool.checkedout(),
            'overflow': pool.overflow(),
            'invalid': pool.invalid()
        }

# Global database manager instance
db_manager = DatabaseManager()

def init_database(app):
    """Initialize database for Flask app"""
    db_manager.init_app(app)
    return db_manager

def get_db_session():
    """Get database session (for use in routes)"""
    return db_manager.get_session()

def get_db_engine():
    """Get database engine"""
    return db_manager.get_engine()

def db_health_check():
    """Database health check"""
    return db_manager.health_check()

def get_pool_status():
    """Get connection pool status"""
    return db_manager.get_pool_status()
