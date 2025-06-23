"""
Security middleware for PinkPay Payment Switch
"""

from flask import Flask
from functools import wraps

def setup_security_headers(app: Flask):
    """Setup security headers for the application"""
    
    @app.after_request
    def add_security_headers(response):
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # API specific headers
        response.headers['X-API-Version'] = '1.0.0'
        response.headers['X-Powered-By'] = 'PinkPay Payment Switch'
        
        return response
    
    app.logger.info("Security headers configured")

def require_api_key(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request, jsonify
        
        api_key = request.headers.get('X-API-Key')
        
        # In production, validate against database or config
        # For demo, we'll use a simple check
        if not api_key or api_key != 'pinkpay-demo-key':
            return jsonify({
                'success': False,
                'error': 'Invalid or missing API key',
                'timestamp': '2025-01-27T12:00:00Z'
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function

def require_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request, jsonify
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'message': str(e),
                'timestamp': '2025-01-27T12:00:00Z'
            }), 401
    
    return decorated_function 
Security middleware for PinkPay Payment Switch
"""

from flask import Flask
from functools import wraps

def setup_security_headers(app: Flask):
    """Setup security headers for the application"""
    
    @app.after_request
    def add_security_headers(response):
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # API specific headers
        response.headers['X-API-Version'] = '1.0.0'
        response.headers['X-Powered-By'] = 'PinkPay Payment Switch'
        
        return response
    
    app.logger.info("Security headers configured")

def require_api_key(f):
    """Decorator to require API key authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request, jsonify
        
        api_key = request.headers.get('X-API-Key')
        
        # In production, validate against database or config
        # For demo, we'll use a simple check
        if not api_key or api_key != 'pinkpay-demo-key':
            return jsonify({
                'success': False,
                'error': 'Invalid or missing API key',
                'timestamp': '2025-01-27T12:00:00Z'
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function

def require_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request, jsonify
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'message': str(e),
                'timestamp': '2025-01-27T12:00:00Z'
            }), 401
    
    return decorated_function 