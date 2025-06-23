"""
Rate limiting middleware for PinkPay Payment Switch
"""

import time
from collections import defaultdict, deque
from flask import Flask, request, jsonify
from functools import wraps

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.per_minute_limit = 60
        self.per_hour_limit = 1000
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed based on rate limits"""
        now = time.time()
        
        # Clean old requests
        self._cleanup_old_requests(key, now)
        
        # Check per-minute limit
        minute_requests = len([t for t in self.requests[key] if now - t < 60])
        if minute_requests >= self.per_minute_limit:
            return False
        
        # Check per-hour limit
        hour_requests = len([t for t in self.requests[key] if now - t < 3600])
        if hour_requests >= self.per_hour_limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        
        return True
    
    def _cleanup_old_requests(self, key: str, now: float):
        """Remove requests older than 1 hour"""
        while self.requests[key] and now - self.requests[key][0] > 3600:
            self.requests[key].popleft()

# Global rate limiter instance
rate_limiter = RateLimiter()

def setup_rate_limiting(app: Flask):
    """Setup rate limiting for the application"""
    
    # Configure limits from config
    rate_limiter.per_minute_limit = app.config.get('RATE_LIMIT_PER_MINUTE', 60)
    rate_limiter.per_hour_limit = app.config.get('RATE_LIMIT_PER_HOUR', 1000)
    
    app.logger.info(f"Rate limiting configured - {rate_limiter.per_minute_limit}/min, {rate_limiter.per_hour_limit}/hour")

def rate_limit(per_minute: int = None, per_hour: int = None):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client identifier
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            user_agent = request.headers.get('User-Agent', '')
            key = f"{client_ip}:{user_agent[:50]}"
            
            # Check rate limits
            if not rate_limiter.is_allowed(key):
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded',
                    'message': f'Maximum {rate_limiter.per_minute_limit} requests per minute allowed',
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                }), 429
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator 
Rate limiting middleware for PinkPay Payment Switch
"""

import time
from collections import defaultdict, deque
from flask import Flask, request, jsonify
from functools import wraps

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.per_minute_limit = 60
        self.per_hour_limit = 1000
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed based on rate limits"""
        now = time.time()
        
        # Clean old requests
        self._cleanup_old_requests(key, now)
        
        # Check per-minute limit
        minute_requests = len([t for t in self.requests[key] if now - t < 60])
        if minute_requests >= self.per_minute_limit:
            return False
        
        # Check per-hour limit
        hour_requests = len([t for t in self.requests[key] if now - t < 3600])
        if hour_requests >= self.per_hour_limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        
        return True
    
    def _cleanup_old_requests(self, key: str, now: float):
        """Remove requests older than 1 hour"""
        while self.requests[key] and now - self.requests[key][0] > 3600:
            self.requests[key].popleft()

# Global rate limiter instance
rate_limiter = RateLimiter()

def setup_rate_limiting(app: Flask):
    """Setup rate limiting for the application"""
    
    # Configure limits from config
    rate_limiter.per_minute_limit = app.config.get('RATE_LIMIT_PER_MINUTE', 60)
    rate_limiter.per_hour_limit = app.config.get('RATE_LIMIT_PER_HOUR', 1000)
    
    app.logger.info(f"Rate limiting configured - {rate_limiter.per_minute_limit}/min, {rate_limiter.per_hour_limit}/hour")

def rate_limit(per_minute: int = None, per_hour: int = None):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client identifier
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            user_agent = request.headers.get('User-Agent', '')
            key = f"{client_ip}:{user_agent[:50]}"
            
            # Check rate limits
            if not rate_limiter.is_allowed(key):
                return jsonify({
                    'success': False,
                    'error': 'Rate limit exceeded',
                    'message': f'Maximum {rate_limiter.per_minute_limit} requests per minute allowed',
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                }), 429
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator 