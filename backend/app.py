#!/usr/bin/env python3
"""
PinkPay Payment Switch - Flask Backend
A modern, event-driven payment orchestration system
"""

import os
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.middleware.proxy_fix import ProxyFix

# Import configuration and utilities
from src.config.settings import Config
from src.database.connection import db, init_db
from src.utils.logger import setup_logger
from src.middleware.security import setup_security_headers
from src.middleware.rate_limiter import setup_rate_limiting

# Import API blueprints
from src.api.payments import payments_bp
from src.api.dashboard import dashboard_bp
from src.api.qr_workflow import qr_bp
from src.api.health import health_bp

# Import plugin system
from src.plugins.plugin_manager import PluginManager

# Import queue system
from src.task_queue.task_queue import init_celery

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Setup logging
    setup_logger(app)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:19006", "http://localhost:8080"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # JWT setup
    jwt = JWTManager(app)
    
    # Security middleware
    setup_security_headers(app)
    setup_rate_limiting(app)
    
    # Proxy fix for deployment
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
    
    # Initialize database
    with app.app_context():
        init_db()
    
    # Initialize plugin system
    plugin_manager = PluginManager()
    app.plugin_manager = plugin_manager
    
    # Initialize Celery for async tasks
    init_celery(app)
    
    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(payments_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(qr_bp, url_prefix='/api/qr')
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            "success": True,
            "message": "PinkPay Payment Switch API - Flask Backend",
            "version": "1.0.0",
            "environment": app.config.get('ENV', 'development'),
            "timestamp": datetime.utcnow().isoformat(),
            "endpoints": {
                "payments": {
                    "pay": "POST /api/pay",
                    "pay_offline": "POST /api/payoffline", 
                    "status": "GET /api/status/<txn_id>",
                    "refund": "POST /api/refund"
                },
                "qr_workflow": {
                    "generate_qr": "POST /api/qr/generate",
                    "scan_qr": "POST /api/qr/scan",
                    "route_payment": "POST /api/qr/route"
                },
                "dashboard": {
                    "overview": "GET /api/dashboard/overview",
                    "transactions": "GET /api/dashboard/transactions",
                    "logs": "GET /api/dashboard/logs",
                    "plugins": "GET /api/dashboard/plugins",
                    "queue": "GET /api/dashboard/queue"
                },
                "health": "GET /health"
            },
            "plugins": {
                "fx_converter": plugin_manager.is_plugin_enabled("fx_converter"),
                "risk_checker": plugin_manager.is_plugin_enabled("risk_checker"),
                "token_handler": plugin_manager.is_plugin_enabled("token_handler")
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Endpoint not found",
            "message": f"Cannot {request.method} {request.path}",
            "timestamp": datetime.utcnow().isoformat()
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad request",
            "message": str(error.description) if hasattr(error, 'description') else "Invalid request",
            "timestamp": datetime.utcnow().isoformat()
        }), 400
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Development server
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    ) 
"""
PinkPay Payment Switch - Flask Backend
A modern, event-driven payment orchestration system
"""

import os
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.middleware.proxy_fix import ProxyFix

# Import configuration and utilities
from src.config.settings import Config
from src.database.connection import db, init_db
from src.utils.logger import setup_logger
from src.middleware.security import setup_security_headers
from src.middleware.rate_limiter import setup_rate_limiting

# Import API blueprints
from src.api.payments import payments_bp
from src.api.dashboard import dashboard_bp
from src.api.qr_workflow import qr_bp
from src.api.health import health_bp

# Import plugin system
from src.plugins.plugin_manager import PluginManager

# Import queue system
from src.task_queue.task_queue import init_celery

def create_app(config_name='development'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Setup logging
    setup_logger(app)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:19006", "http://localhost:8080"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # JWT setup
    jwt = JWTManager(app)
    
    # Security middleware
    setup_security_headers(app)
    setup_rate_limiting(app)
    
    # Proxy fix for deployment
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
    
    # Initialize database
    with app.app_context():
        init_db()
    
    # Initialize plugin system
    plugin_manager = PluginManager()
    app.plugin_manager = plugin_manager
    
    # Initialize Celery for async tasks
    init_celery(app)
    
    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(payments_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(qr_bp, url_prefix='/api/qr')
    
    # Root endpoint
    @app.route('/')
    def root():
        return jsonify({
            "success": True,
            "message": "PinkPay Payment Switch API - Flask Backend",
            "version": "1.0.0",
            "environment": app.config.get('ENV', 'development'),
            "timestamp": datetime.utcnow().isoformat(),
            "endpoints": {
                "payments": {
                    "pay": "POST /api/pay",
                    "pay_offline": "POST /api/payoffline", 
                    "status": "GET /api/status/<txn_id>",
                    "refund": "POST /api/refund"
                },
                "qr_workflow": {
                    "generate_qr": "POST /api/qr/generate",
                    "scan_qr": "POST /api/qr/scan",
                    "route_payment": "POST /api/qr/route"
                },
                "dashboard": {
                    "overview": "GET /api/dashboard/overview",
                    "transactions": "GET /api/dashboard/transactions",
                    "logs": "GET /api/dashboard/logs",
                    "plugins": "GET /api/dashboard/plugins",
                    "queue": "GET /api/dashboard/queue"
                },
                "health": "GET /health"
            },
            "plugins": {
                "fx_converter": plugin_manager.is_plugin_enabled("fx_converter"),
                "risk_checker": plugin_manager.is_plugin_enabled("risk_checker"),
                "token_handler": plugin_manager.is_plugin_enabled("token_handler")
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Endpoint not found",
            "message": f"Cannot {request.method} {request.path}",
            "timestamp": datetime.utcnow().isoformat()
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": "Bad request",
            "message": str(error.description) if hasattr(error, 'description') else "Invalid request",
            "timestamp": datetime.utcnow().isoformat()
        }), 400
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Development server
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    ) 