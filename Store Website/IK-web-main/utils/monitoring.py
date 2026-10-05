"""
Enterprise Advanced Monitoring & APM
Application Performance Monitoring, Distributed Tracing, Custom Metrics
"""

import time
import psutil
import threading
from datetime import datetime, timedelta
from flask import current_app, request, g
from functools import wraps
import logging
import json
from collections import defaultdict, deque
import uuid

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Advanced metrics collection system"""
    
    def __init__(self, app=None):
        self.app = app
        self.metrics = defaultdict(lambda: defaultdict(list))
        self.custom_metrics = {}
        self.performance_data = deque(maxlen=1000)
        self.error_tracking = deque(maxlen=500)
        self.user_activity = defaultdict(int)
        self.api_usage = defaultdict(int)
        self.database_queries = deque(maxlen=1000)
        self.cache_stats = defaultdict(int)
        self.background_tasks = {}
        self.running = False
        self.collection_thread = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize metrics collector"""
        self.app = app
        
        # Start metrics collection
        self._start_collection()
        
        # Setup request monitoring
        self._setup_request_monitoring()
    
    def _start_collection(self):
        """Start metrics collection thread"""
        try:
            self.running = True
            self.collection_thread = threading.Thread(
                target=self._collect_system_metrics,
                name="MetricsCollector",
                daemon=True
            )
            self.collection_thread.start()
            
            logger.info("Metrics collection started")
            
        except Exception as e:
            logger.error(f"Error starting metrics collection: {str(e)}")
    
    def _collect_system_metrics(self):
        """Collect system metrics continuously"""
        while self.running:
            try:
                # Collect system metrics
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                disk = psutil.disk_usage('/')
                
                # Store metrics
                timestamp = datetime.utcnow()
                self.metrics['system']['cpu'].append({
                    'timestamp': timestamp,
                    'value': cpu_percent
                })
                
                self.metrics['system']['memory'].append({
                    'timestamp': timestamp,
                    'value': memory.percent,
                    'available': memory.available,
                    'used': memory.used
                })
                
                self.metrics['system']['disk'].append({
                    'timestamp': timestamp,
                    'value': (disk.used / disk.total) * 100,
                    'free': disk.free,
                    'used': disk.used
                })
                
                # Clean old metrics (keep last 24 hours)
                self._cleanup_old_metrics()
                
                time.sleep(60)  # Collect every minute
                
            except Exception as e:
                logger.error(f"Error collecting system metrics: {str(e)}")
                time.sleep(60)
    
    def _cleanup_old_metrics(self):
        """Clean up old metrics data"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=24)
            
            for category in self.metrics:
                for metric_type in self.metrics[category]:
                    self.metrics[category][metric_type] = [
                        m for m in self.metrics[category][metric_type]
                        if m['timestamp'] > cutoff_time
                    ]
                    
        except Exception as e:
            logger.error(f"Error cleaning up old metrics: {str(e)}")
    
    def _setup_request_monitoring(self):
        """Setup request monitoring"""
        try:
            @self.app.before_request
            def before_request():
                g.request_start_time = time.time()
                g.request_id = str(uuid.uuid4())
                
                # Track user activity
                if hasattr(g, 'current_user_id'):
                    self.user_activity[g.current_user_id] += 1
                
                # Track API usage
                endpoint = request.endpoint
                if endpoint:
                    self.api_usage[endpoint] += 1
            
            @self.app.after_request
            def after_request(response):
                # Calculate request duration
                if hasattr(g, 'request_start_time'):
                    duration = time.time() - g.request_start_time
                    
                    # Store performance data
                    self.performance_data.append({
                        'request_id': getattr(g, 'request_id', None),
                        'endpoint': request.endpoint,
                        'method': request.method,
                        'status_code': response.status_code,
                        'duration': duration,
                        'timestamp': datetime.utcnow(),
                        'user_id': getattr(g, 'current_user_id', None),
                        'ip_address': request.remote_addr,
                        'user_agent': request.headers.get('User-Agent', '')
                    })
                    
                    # Add response time header
                    response.headers['X-Response-Time'] = f"{duration:.3f}s"
                
                return response
            
            logger.info("Request monitoring setup completed")
            
        except Exception as e:
            logger.error(f"Error setting up request monitoring: {str(e)}")
    
    def track_database_query(self, query, duration, success=True):
        """Track database query performance"""
        try:
            self.database_queries.append({
                'query': query,
                'duration': duration,
                'success': success,
                'timestamp': datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Error tracking database query: {str(e)}")
    
    def track_cache_operation(self, operation, key, hit=True):
        """Track cache operations"""
        try:
            self.cache_stats[f"{operation}_{'hit' if hit else 'miss'}"] += 1
            
        except Exception as e:
            logger.error(f"Error tracking cache operation: {str(e)}")
    
    def track_error(self, error_type, error_message, user_id=None, request_id=None):
        """Track application errors"""
        try:
            self.error_tracking.append({
                'error_type': error_type,
                'error_message': error_message,
                'user_id': user_id,
                'request_id': request_id,
                'timestamp': datetime.utcnow(),
                'stack_trace': None  # Would include stack trace in real implementation
            })
            
        except Exception as e:
            logger.error(f"Error tracking error: {str(e)}")
    
    def track_custom_metric(self, name, value, tags=None):
        """Track custom business metrics"""
        try:
            if name not in self.custom_metrics:
                self.custom_metrics[name] = []
            
            self.custom_metrics[name].append({
                'value': value,
                'tags': tags or {},
                'timestamp': datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Error tracking custom metric: {str(e)}")
    
    def track_background_task(self, task_name, duration, success=True, error=None):
        """Track background task performance"""
        try:
            if task_name not in self.background_tasks:
                self.background_tasks[task_name] = {
                    'total_runs': 0,
                    'successful_runs': 0,
                    'failed_runs': 0,
                    'total_duration': 0,
                    'avg_duration': 0,
                    'last_run': None
                }
            
            task_stats = self.background_tasks[task_name]
            task_stats['total_runs'] += 1
            task_stats['total_duration'] += duration
            task_stats['avg_duration'] = task_stats['total_duration'] / task_stats['total_runs']
            task_stats['last_run'] = datetime.utcnow()
            
            if success:
                task_stats['successful_runs'] += 1
            else:
                task_stats['failed_runs'] += 1
                if error:
                    self.track_error('background_task_error', str(error))
            
        except Exception as e:
            logger.error(f"Error tracking background task: {str(e)}")
    
    def get_system_metrics(self, hours=1):
        """Get system metrics for specified time period"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            metrics = {
                'cpu': [],
                'memory': [],
                'disk': []
            }
            
            for metric_type in ['cpu', 'memory', 'disk']:
                if metric_type in self.metrics['system']:
                    metrics[metric_type] = [
                        m for m in self.metrics['system'][metric_type]
                        if m['timestamp'] > cutoff_time
                    ]
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting system metrics: {str(e)}")
            return None
    
    def get_performance_metrics(self, hours=1):
        """Get performance metrics"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Filter recent performance data
            recent_data = [
                p for p in self.performance_data
                if p['timestamp'] > cutoff_time
            ]
            
            if not recent_data:
                return None
            
            # Calculate metrics
            total_requests = len(recent_data)
            avg_response_time = sum(p['duration'] for p in recent_data) / total_requests
            max_response_time = max(p['duration'] for p in recent_data)
            min_response_time = min(p['duration'] for p in recent_data)
            
            # Status code distribution
            status_codes = defaultdict(int)
            for p in recent_data:
                status_codes[p['status_code']] += 1
            
            # Endpoint performance
            endpoint_performance = defaultdict(list)
            for p in recent_data:
                if p['endpoint']:
                    endpoint_performance[p['endpoint']].append(p['duration'])
            
            endpoint_metrics = {}
            for endpoint, durations in endpoint_performance.items():
                endpoint_metrics[endpoint] = {
                    'count': len(durations),
                    'avg_duration': sum(durations) / len(durations),
                    'max_duration': max(durations),
                    'min_duration': min(durations)
                }
            
            return {
                'total_requests': total_requests,
                'avg_response_time': avg_response_time,
                'max_response_time': max_response_time,
                'min_response_time': min_response_time,
                'status_codes': dict(status_codes),
                'endpoint_performance': endpoint_metrics
            }
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {str(e)}")
            return None
    
    def get_database_metrics(self, hours=1):
        """Get database performance metrics"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Filter recent queries
            recent_queries = [
                q for q in self.database_queries
                if q['timestamp'] > cutoff_time
            ]
            
            if not recent_queries:
                return None
            
            # Calculate metrics
            total_queries = len(recent_queries)
            successful_queries = len([q for q in recent_queries if q['success']])
            failed_queries = total_queries - successful_queries
            
            avg_duration = sum(q['duration'] for q in recent_queries) / total_queries
            max_duration = max(q['duration'] for q in recent_queries)
            
            # Slow queries (over 1 second)
            slow_queries = [q for q in recent_queries if q['duration'] > 1.0]
            
            return {
                'total_queries': total_queries,
                'successful_queries': successful_queries,
                'failed_queries': failed_queries,
                'success_rate': (successful_queries / total_queries) * 100,
                'avg_duration': avg_duration,
                'max_duration': max_duration,
                'slow_queries': len(slow_queries),
                'slow_queries_list': slow_queries[-10:]  # Last 10 slow queries
            }
            
        except Exception as e:
            logger.error(f"Error getting database metrics: {str(e)}")
            return None
    
    def get_error_metrics(self, hours=1):
        """Get error metrics"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            # Filter recent errors
            recent_errors = [
                e for e in self.error_tracking
                if e['timestamp'] > cutoff_time
            ]
            
            if not recent_errors:
                return None
            
            # Error type distribution
            error_types = defaultdict(int)
            for error in recent_errors:
                error_types[error['error_type']] += 1
            
            return {
                'total_errors': len(recent_errors),
                'error_types': dict(error_types),
                'recent_errors': recent_errors[-20:]  # Last 20 errors
            }
            
        except Exception as e:
            logger.error(f"Error getting error metrics: {str(e)}")
            return None
    
    def get_user_activity_metrics(self, hours=1):
        """Get user activity metrics"""
        try:
            # This would typically be more sophisticated
            # For now, return basic user activity data
            
            return {
                'active_users': len(self.user_activity),
                'top_users': dict(sorted(self.user_activity.items(), key=lambda x: x[1], reverse=True)[:10])
            }
            
        except Exception as e:
            logger.error(f"Error getting user activity metrics: {str(e)}")
            return None
    
    def get_api_usage_metrics(self, hours=1):
        """Get API usage metrics"""
        try:
            return {
                'total_endpoints': len(self.api_usage),
                'endpoint_usage': dict(sorted(self.api_usage.items(), key=lambda x: x[1], reverse=True))
            }
            
        except Exception as e:
            logger.error(f"Error getting API usage metrics: {str(e)}")
            return None
    
    def get_cache_metrics(self):
        """Get cache performance metrics"""
        try:
            total_operations = sum(self.cache_stats.values())
            
            if total_operations == 0:
                return None
            
            hit_rate = (self.cache_stats.get('get_hit', 0) / 
                       (self.cache_stats.get('get_hit', 0) + self.cache_stats.get('get_miss', 0))) * 100
            
            return {
                'total_operations': total_operations,
                'hit_rate': hit_rate,
                'operations': dict(self.cache_stats)
            }
            
        except Exception as e:
            logger.error(f"Error getting cache metrics: {str(e)}")
            return None
    
    def get_background_task_metrics(self):
        """Get background task metrics"""
        try:
            return dict(self.background_tasks)
            
        except Exception as e:
            logger.error(f"Error getting background task metrics: {str(e)}")
            return None
    
    def get_custom_metrics(self, name=None, hours=1):
        """Get custom metrics"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            if name:
                if name in self.custom_metrics:
                    return [
                        m for m in self.custom_metrics[name]
                        if m['timestamp'] > cutoff_time
                    ]
                else:
                    return []
            else:
                result = {}
                for metric_name, metrics in self.custom_metrics.items():
                    result[metric_name] = [
                        m for m in metrics
                        if m['timestamp'] > cutoff_time
                    ]
                return result
                
        except Exception as e:
            logger.error(f"Error getting custom metrics: {str(e)}")
            return None
    
    def get_health_status(self):
        """Get overall system health status"""
        try:
            # Get recent metrics
            system_metrics = self.get_system_metrics(hours=1)
            performance_metrics = self.get_performance_metrics(hours=1)
            error_metrics = self.get_error_metrics(hours=1)
            
            # Calculate health score
            health_score = 100
            
            # CPU usage impact
            if system_metrics and system_metrics['cpu']:
                avg_cpu = sum(m['value'] for m in system_metrics['cpu']) / len(system_metrics['cpu'])
                if avg_cpu > 80:
                    health_score -= 20
                elif avg_cpu > 60:
                    health_score -= 10
            
            # Memory usage impact
            if system_metrics and system_metrics['memory']:
                avg_memory = sum(m['value'] for m in system_metrics['memory']) / len(system_metrics['memory'])
                if avg_memory > 90:
                    health_score -= 20
                elif avg_memory > 80:
                    health_score -= 10
            
            # Response time impact
            if performance_metrics:
                if performance_metrics['avg_response_time'] > 2.0:
                    health_score -= 20
                elif performance_metrics['avg_response_time'] > 1.0:
                    health_score -= 10
            
            # Error rate impact
            if error_metrics and performance_metrics:
                error_rate = (error_metrics['total_errors'] / performance_metrics['total_requests']) * 100
                if error_rate > 5:
                    health_score -= 30
                elif error_rate > 1:
                    health_score -= 15
            
            # Determine status
            if health_score >= 90:
                status = 'healthy'
            elif health_score >= 70:
                status = 'warning'
            elif health_score >= 50:
                status = 'degraded'
            else:
                status = 'critical'
            
            return {
                'status': status,
                'health_score': max(0, health_score),
                'timestamp': datetime.utcnow().isoformat(),
                'system_metrics': system_metrics,
                'performance_metrics': performance_metrics,
                'error_metrics': error_metrics
            }
            
        except Exception as e:
            logger.error(f"Error getting health status: {str(e)}")
            return {
                'status': 'unknown',
                'health_score': 0,
                'error': str(e)
            }
    
    def stop(self):
        """Stop metrics collection"""
        try:
            self.running = False
            
            if self.collection_thread:
                self.collection_thread.join(timeout=5)
            
            logger.info("Metrics collection stopped")
            
        except Exception as e:
            logger.error(f"Error stopping metrics collection: {str(e)}")

# Global metrics collector instance
metrics_collector = MetricsCollector()

# Decorators
def track_performance(metric_name=None):
    """Decorator to track function performance"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            success = True
            error = None
            
            try:
                result = f(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                error = e
                raise
            finally:
                duration = time.time() - start_time
                name = metric_name or f"{f.__module__}.{f.__name__}"
                metrics_collector.track_background_task(name, duration, success, error)
        
        return decorated_function
    return decorator

def track_database_query(f):
    """Decorator to track database queries"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        success = True
        
        try:
            result = f(*args, **kwargs)
            return result
        except Exception as e:
            success = False
            raise
        finally:
            duration = time.time() - start_time
            query = f"{f.__name__}({', '.join(map(str, args))})"
            metrics_collector.track_database_query(query, duration, success)
    
    return decorated_function

def track_custom_metric(name, tags=None):
    """Decorator to track custom metrics"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = f(*args, **kwargs)
                metrics_collector.track_custom_metric(name, 1, tags)
                return result
            except Exception as e:
                metrics_collector.track_custom_metric(f"{name}_error", 1, tags)
                raise
            finally:
                duration = time.time() - start_time
                metrics_collector.track_custom_metric(f"{name}_duration", duration, tags)
        
        return decorated_function
    return decorator
