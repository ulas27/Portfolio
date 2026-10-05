"""
Enterprise Performance Optimization System
CDN integration, caching strategies, database optimization, image optimization
"""

import os
import time
import hashlib
import json
from datetime import datetime, timedelta
from flask import current_app, request, g
from functools import wraps
import logging
from PIL import Image
import io
import requests
from urllib.parse import urljoin, urlparse
import threading
from queue import Queue, Empty

logger = logging.getLogger(__name__)

class CacheStrategy(Enum):
    """Cache strategies"""
    NO_CACHE = "no_cache"
    MEMORY = "memory"
    REDIS = "redis"
    CDN = "cdn"
    DATABASE = "database"

class ImageFormat(Enum):
    """Image formats"""
    JPEG = "jpeg"
    PNG = "png"
    WEBP = "webp"
    AVIF = "avif"

class PerformanceOptimizer:
    """Enterprise performance optimization system"""
    
    def __init__(self, app=None):
        self.app = app
        self.cache_store = {}
        self.cdn_config = {}
        self.image_cache = {}
        self.optimization_queue = Queue()
        self.worker_threads = []
        self.running = False
        self.performance_metrics = {
            'cache_hits': 0,
            'cache_misses': 0,
            'cdn_requests': 0,
            'image_optimizations': 0,
            'database_optimizations': 0
        }
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize performance optimizer"""
        self.app = app
        
        # Load CDN configuration
        self._load_cdn_config()
        
        # Start optimization workers
        self._start_workers()
        
        # Setup performance monitoring
        self._setup_performance_monitoring()
    
    def _load_cdn_config(self):
        """Load CDN configuration"""
        try:
            self.cdn_config = {
                'enabled': current_app.config.get('CDN_ENABLED', False),
                'provider': current_app.config.get('CDN_PROVIDER', 'cloudflare'),
                'domain': current_app.config.get('CDN_DOMAIN', ''),
                'api_key': current_app.config.get('CDN_API_KEY', ''),
                'zone_id': current_app.config.get('CDN_ZONE_ID', ''),
                'cache_ttl': int(current_app.config.get('CDN_CACHE_TTL', 3600)),
                'purge_on_update': current_app.config.get('CDN_PURGE_ON_UPDATE', True)
            }
            
            logger.info("CDN configuration loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading CDN configuration: {str(e)}")
    
    def _start_workers(self):
        """Start optimization worker threads"""
        try:
            self.running = True
            
            # Start image optimization worker
            image_worker = threading.Thread(
                target=self._image_optimization_worker,
                name="ImageOptimizationWorker",
                daemon=True
            )
            image_worker.start()
            self.worker_threads.append(image_worker)
            
            # Start cache warming worker
            cache_worker = threading.Thread(
                target=self._cache_warming_worker,
                name="CacheWarmingWorker",
                daemon=True
            )
            cache_worker.start()
            self.worker_threads.append(cache_worker)
            
            logger.info("Performance optimization workers started")
            
        except Exception as e:
            logger.error(f"Error starting optimization workers: {str(e)}")
    
    def _setup_performance_monitoring(self):
        """Setup performance monitoring"""
        try:
            @self.app.before_request
            def before_request():
                g.performance_start_time = time.time()
            
            @self.app.after_request
            def after_request(response):
                if hasattr(g, 'performance_start_time'):
                    duration = time.time() - g.performance_start_time
                    
                    # Add performance headers
                    response.headers['X-Response-Time'] = f"{duration:.3f}s"
                    response.headers['X-Cache-Status'] = getattr(g, 'cache_status', 'MISS')
                    
                    # Log slow requests
                    if duration > 1.0:  # Requests taking more than 1 second
                        logger.warning(f"Slow request detected: {request.endpoint} took {duration:.3f}s")
                
                return response
            
            logger.info("Performance monitoring setup completed")
            
        except Exception as e:
            logger.error(f"Error setting up performance monitoring: {str(e)}")
    
    def cache_get(self, key, strategy=CacheStrategy.MEMORY):
        """Get value from cache"""
        try:
            if strategy == CacheStrategy.MEMORY:
                if key in self.cache_store:
                    cache_entry = self.cache_store[key]
                    if cache_entry['expires_at'] > datetime.utcnow():
                        self.performance_metrics['cache_hits'] += 1
                        g.cache_status = 'HIT'
                        return cache_entry['value']
                    else:
                        del self.cache_store[key]
            
            elif strategy == CacheStrategy.REDIS:
                # This would use Redis
                pass
            
            elif strategy == CacheStrategy.CDN:
                # This would check CDN cache
                pass
            
            self.performance_metrics['cache_misses'] += 1
            g.cache_status = 'MISS'
            return None
            
        except Exception as e:
            logger.error(f"Error getting from cache: {str(e)}")
            return None
    
    def cache_set(self, key, value, ttl=3600, strategy=CacheStrategy.MEMORY):
        """Set value in cache"""
        try:
            if strategy == CacheStrategy.MEMORY:
                self.cache_store[key] = {
                    'value': value,
                    'expires_at': datetime.utcnow() + timedelta(seconds=ttl),
                    'created_at': datetime.utcnow()
                }
            
            elif strategy == CacheStrategy.REDIS:
                # This would use Redis
                pass
            
            elif strategy == CacheStrategy.CDN:
                # This would set CDN cache
                pass
            
            return True
            
        except Exception as e:
            logger.error(f"Error setting cache: {str(e)}")
            return False
    
    def cache_invalidate(self, key_pattern, strategy=CacheStrategy.MEMORY):
        """Invalidate cache entries"""
        try:
            if strategy == CacheStrategy.MEMORY:
                keys_to_remove = []
                for key in self.cache_store:
                    if key_pattern in key:
                        keys_to_remove.append(key)
                
                for key in keys_to_remove:
                    del self.cache_store[key]
            
            elif strategy == CacheStrategy.REDIS:
                # This would use Redis pattern matching
                pass
            
            elif strategy == CacheStrategy.CDN:
                # This would purge CDN cache
                self._purge_cdn_cache(key_pattern)
            
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating cache: {str(e)}")
            return False
    
    def optimize_image(self, image_path, output_format=ImageFormat.WEBP, 
                      quality=85, max_width=None, max_height=None):
        """Optimize image for web delivery"""
        try:
            # Check if image is already optimized
            cache_key = f"optimized_image_{hashlib.md5(image_path.encode()).hexdigest()}_{output_format.value}_{quality}_{max_width}_{max_height}"
            
            cached_result = self.cache_get(cache_key)
            if cached_result:
                return cached_result
            
            # Load image
            if image_path.startswith('http'):
                # Download image
                response = requests.get(image_path, timeout=30)
                image = Image.open(io.BytesIO(response.content))
            else:
                # Load from file system
                full_path = os.path.join(current_app.root_path, image_path)
                if not os.path.exists(full_path):
                    return None
                image = Image.open(full_path)
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                if output_format == ImageFormat.JPEG:
                    # JPEG doesn't support transparency
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    if image.mode == 'P':
                        image = image.convert('RGBA')
                    background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                    image = background
                else:
                    image = image.convert('RGBA')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if needed
            if max_width or max_height:
                image.thumbnail((max_width or image.width, max_height or image.height), Image.Resampling.LANCZOS)
            
            # Optimize image
            output_buffer = io.BytesIO()
            
            if output_format == ImageFormat.JPEG:
                image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
            elif output_format == ImageFormat.PNG:
                image.save(output_buffer, format='PNG', optimize=True)
            elif output_format == ImageFormat.WEBP:
                image.save(output_buffer, format='WEBP', quality=quality, optimize=True)
            elif output_format == ImageFormat.AVIF:
                # AVIF support requires pillow-avif-plugin
                try:
                    image.save(output_buffer, format='AVIF', quality=quality)
                except Exception:
                    # Fallback to WebP if AVIF not supported
                    image.save(output_buffer, format='WEBP', quality=quality)
            
            output_buffer.seek(0)
            optimized_data = output_buffer.getvalue()
            
            # Cache the result
            self.cache_set(cache_key, optimized_data, ttl=86400)  # Cache for 24 hours
            
            self.performance_metrics['image_optimizations'] += 1
            
            logger.info(f"Image optimized: {image_path} -> {output_format.value}")
            
            return optimized_data
            
        except Exception as e:
            logger.error(f"Error optimizing image: {str(e)}")
            return None
    
    def _image_optimization_worker(self):
        """Image optimization worker thread"""
        while self.running:
            try:
                # Get optimization task from queue
                task = self.optimization_queue.get(timeout=1)
                
                # Process image optimization
                self.optimize_image(
                    task['image_path'],
                    task.get('output_format', ImageFormat.WEBP),
                    task.get('quality', 85),
                    task.get('max_width'),
                    task.get('max_height')
                )
                
                # Mark task as done
                self.optimization_queue.task_done()
                
            except Empty:
                # No tasks in queue, continue
                continue
            except Exception as e:
                logger.error(f"Error in image optimization worker: {str(e)}")
                time.sleep(1)
    
    def queue_image_optimization(self, image_path, output_format=ImageFormat.WEBP, 
                                quality=85, max_width=None, max_height=None):
        """Queue image for optimization"""
        try:
            task = {
                'image_path': image_path,
                'output_format': output_format,
                'quality': quality,
                'max_width': max_width,
                'max_height': max_height
            }
            
            self.optimization_queue.put(task)
            
        except Exception as e:
            logger.error(f"Error queuing image optimization: {str(e)}")
    
    def generate_responsive_images(self, image_path, sizes=None):
        """Generate responsive image set"""
        try:
            if sizes is None:
                sizes = [
                    {'width': 320, 'suffix': 'sm'},
                    {'width': 640, 'suffix': 'md'},
                    {'width': 1024, 'suffix': 'lg'},
                    {'width': 1920, 'suffix': 'xl'}
                ]
            
            responsive_images = {}
            
            for size in sizes:
                optimized_data = self.optimize_image(
                    image_path,
                    output_format=ImageFormat.WEBP,
                    quality=85,
                    max_width=size['width']
                )
                
                if optimized_data:
                    responsive_images[size['suffix']] = {
                        'data': optimized_data,
                        'width': size['width'],
                        'format': 'webp'
                    }
            
            return responsive_images
            
        except Exception as e:
            logger.error(f"Error generating responsive images: {str(e)}")
            return {}
    
    def _cache_warming_worker(self):
        """Cache warming worker thread"""
        while self.running:
            try:
                # This would implement cache warming strategies
                # For now, we'll just sleep
                time.sleep(300)  # Run every 5 minutes
                
            except Exception as e:
                logger.error(f"Error in cache warming worker: {str(e)}")
                time.sleep(60)
    
    def warm_cache(self, urls=None):
        """Warm cache with frequently accessed content"""
        try:
            if urls is None:
                # Default URLs to warm
                urls = [
                    '/',
                    '/shop',
                    '/about',
                    '/contact'
                ]
            
            for url in urls:
                try:
                    full_url = urljoin(current_app.config.get('BASE_URL', 'http://localhost:5000'), url)
                    response = requests.get(full_url, timeout=30)
                    
                    if response.status_code == 200:
                        # Cache the response
                        cache_key = f"page_cache_{url}"
                        self.cache_set(cache_key, response.text, ttl=3600)
                        
                        logger.info(f"Cache warmed for: {url}")
                
                except Exception as e:
                    logger.warning(f"Error warming cache for {url}: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error warming cache: {str(e)}")
    
    def _purge_cdn_cache(self, pattern):
        """Purge CDN cache"""
        try:
            if not self.cdn_config.get('enabled'):
                return False
            
            if self.cdn_config['provider'] == 'cloudflare':
                return self._purge_cloudflare_cache(pattern)
            elif self.cdn_config['provider'] == 'aws_cloudfront':
                return self._purge_cloudfront_cache(pattern)
            
            return False
            
        except Exception as e:
            logger.error(f"Error purging CDN cache: {str(e)}")
            return False
    
    def _purge_cloudflare_cache(self, pattern):
        """Purge Cloudflare cache"""
        try:
            url = f"https://api.cloudflare.com/client/v4/zones/{self.cdn_config['zone_id']}/purge_cache"
            
            headers = {
                'Authorization': f"Bearer {self.cdn_config['api_key']}",
                'Content-Type': 'application/json'
            }
            
            data = {
                'files': [pattern] if isinstance(pattern, str) else pattern
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                logger.info(f"Cloudflare cache purged: {pattern}")
                return True
            else:
                logger.error(f"Failed to purge Cloudflare cache: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error purging Cloudflare cache: {str(e)}")
            return False
    
    def _purge_cloudfront_cache(self, pattern):
        """Purge AWS CloudFront cache"""
        try:
            # This would use boto3 to create CloudFront invalidation
            # For now, we'll just log it
            logger.info(f"CloudFront cache purge requested: {pattern}")
            return True
            
        except Exception as e:
            logger.error(f"Error purging CloudFront cache: {str(e)}")
            return False
    
    def optimize_database_queries(self, queries):
        """Optimize database queries"""
        try:
            optimized_queries = []
            
            for query in queries:
                # Basic query optimization
                optimized_query = self._optimize_single_query(query)
                optimized_queries.append(optimized_query)
            
            self.performance_metrics['database_optimizations'] += len(optimized_queries)
            
            return optimized_queries
            
        except Exception as e:
            logger.error(f"Error optimizing database queries: {str(e)}")
            return queries
    
    def _optimize_single_query(self, query):
        """Optimize a single database query"""
        try:
            # Basic query optimization rules
            optimized = query
            
            # Add LIMIT if not present and query might return many rows
            if 'SELECT' in query.upper() and 'LIMIT' not in query.upper():
                if 'WHERE' not in query.upper() or 'COUNT' in query.upper():
                    # Don't add LIMIT to queries that might need all results
                    pass
                else:
                    # Add reasonable LIMIT
                    optimized += ' LIMIT 1000'
            
            # Suggest indexes for common patterns
            if 'WHERE' in query.upper():
                # This would analyze WHERE clauses and suggest indexes
                pass
            
            return optimized
            
        except Exception as e:
            logger.error(f"Error optimizing single query: {str(e)}")
            return query
    
    def minify_css(self, css_content):
        """Minify CSS content"""
        try:
            # Remove comments
            import re
            css_content = re.sub(r'/\*.*?\*/', '', css_content, flags=re.DOTALL)
            
            # Remove unnecessary whitespace
            css_content = re.sub(r'\s+', ' ', css_content)
            css_content = re.sub(r';\s*}', '}', css_content)
            css_content = re.sub(r'{\s*', '{', css_content)
            css_content = re.sub(r';\s*', ';', css_content)
            
            return css_content.strip()
            
        except Exception as e:
            logger.error(f"Error minifying CSS: {str(e)}")
            return css_content
    
    def minify_js(self, js_content):
        """Minify JavaScript content"""
        try:
            # Basic JavaScript minification
            import re
            
            # Remove single-line comments
            js_content = re.sub(r'//.*$', '', js_content, flags=re.MULTILINE)
            
            # Remove multi-line comments
            js_content = re.sub(r'/\*.*?\*/', '', js_content, flags=re.DOTALL)
            
            # Remove unnecessary whitespace
            js_content = re.sub(r'\s+', ' ', js_content)
            js_content = re.sub(r';\s*}', '}', js_content)
            js_content = re.sub(r'{\s*', '{', js_content)
            js_content = re.sub(r';\s*', ';', js_content)
            
            return js_content.strip()
            
        except Exception as e:
            logger.error(f"Error minifying JavaScript: {str(e)}")
            return js_content
    
    def compress_content(self, content, compression_type='gzip'):
        """Compress content"""
        try:
            if compression_type == 'gzip':
                import gzip
                compressed = gzip.compress(content.encode('utf-8'))
            elif compression_type == 'brotli':
                import brotli
                compressed = brotli.compress(content.encode('utf-8'))
            else:
                return content
            
            return compressed
            
        except Exception as e:
            logger.error(f"Error compressing content: {str(e)}")
            return content
    
    def get_performance_metrics(self):
        """Get performance optimization metrics"""
        try:
            cache_hit_rate = 0
            total_cache_requests = self.performance_metrics['cache_hits'] + self.performance_metrics['cache_misses']
            
            if total_cache_requests > 0:
                cache_hit_rate = (self.performance_metrics['cache_hits'] / total_cache_requests) * 100
            
            return {
                'cache_metrics': {
                    'hits': self.performance_metrics['cache_hits'],
                    'misses': self.performance_metrics['cache_misses'],
                    'hit_rate': cache_hit_rate,
                    'total_entries': len(self.cache_store)
                },
                'optimization_metrics': {
                    'image_optimizations': self.performance_metrics['image_optimizations'],
                    'database_optimizations': self.performance_metrics['database_optimizations'],
                    'cdn_requests': self.performance_metrics['cdn_requests']
                },
                'queue_metrics': {
                    'optimization_queue_size': self.optimization_queue.qsize(),
                    'active_workers': len([t for t in self.worker_threads if t.is_alive()])
                },
                'cdn_metrics': {
                    'enabled': self.cdn_config.get('enabled', False),
                    'provider': self.cdn_config.get('provider', 'none'),
                    'domain': self.cdn_config.get('domain', '')
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting performance metrics: {str(e)}")
            return None
    
    def stop(self):
        """Stop performance optimizer"""
        try:
            self.running = False
            
            # Wait for workers to finish
            for worker in self.worker_threads:
                worker.join(timeout=5)
            
            logger.info("Performance optimizer stopped")
            
        except Exception as e:
            logger.error(f"Error stopping performance optimizer: {str(e)}")

# Global performance optimizer instance
performance_optimizer = PerformanceOptimizer()

# Decorators
def cache_result(ttl=3600, strategy=CacheStrategy.MEMORY, key_prefix=''):
    """Decorator to cache function results"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}{f.__name__}_{hashlib.md5(str(args).encode() + str(kwargs).encode()).hexdigest()}"
            
            # Try to get from cache
            cached_result = performance_optimizer.cache_get(cache_key, strategy)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = f(*args, **kwargs)
            performance_optimizer.cache_set(cache_key, result, ttl, strategy)
            
            return result
        
        return decorated_function
    return decorator

def optimize_image_endpoint(f):
    """Decorator to optimize images in endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        result = f(*args, **kwargs)
        
        # If result contains image URLs, queue them for optimization
        if isinstance(result, dict):
            for key, value in result.items():
                if isinstance(value, str) and value.endswith(('.jpg', '.jpeg', '.png', '.gif')):
                    performance_optimizer.queue_image_optimization(value)
        
        return result
    
    return decorated_function

def minify_response(f):
    """Decorator to minify response content"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        result = f(*args, **kwargs)
        
        # Minify CSS and JS in response
        if isinstance(result, str):
            if 'text/css' in request.headers.get('Accept', ''):
                result = performance_optimizer.minify_css(result)
            elif 'application/javascript' in request.headers.get('Accept', ''):
                result = performance_optimizer.minify_js(result)
        
        return result
    
    return decorated_function
