#!/usr/bin/env python3
"""
Simple test script to verify core SatuPay functionality
"""

import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask, jsonify
from src.database.connection import db, init_db
from src.config.settings import config
from src.models.user import User
from src.models.transaction import Transaction

def create_simple_app():
    """Create a minimal Flask app for testing"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = 'development'
    app.config.from_object(config[config_name])
    
    # Initialize database
    db.init_app(app)
    
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'SatuPay Payment Switch',
            'version': '1.0.0',
            'database': 'connected'
        })
    
    @app.route('/test/user')
    def test_user():
        """Test user creation"""
        try:
            user = User.create_user(
                phone_number='+60123456789',
                full_name='Test User',
                email='test@SatuPay.com'
            )
            return jsonify({
                'success': True,
                'user': user.to_dict(),
                'message': 'User created successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/test/transaction')
    def test_transaction():
        """Test transaction creation"""
        try:
            txn = Transaction.create_transaction(
                txn_id='TEST_TXN_001',
                amount=10.00,
                currency='MYR',
                payment_method='test',
                payment_rail='test'
            )
            return jsonify({
                'success': True,
                'transaction': txn.to_dict(),
                'message': 'Transaction created successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/test/dashboard')
    def test_dashboard():
        """Test dashboard data"""
        try:
            stats = Transaction.get_transaction_stats()
            return jsonify({
                'success': True,
                'stats': stats,
                'message': 'Dashboard data retrieved successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_simple_app()
    
    with app.app_context():
        try:
            print("🔧 Initializing database...")
            init_db()
            print("✅ Database initialized successfully")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            sys.exit(1)
    
    print("🚀 Starting simple SatuPay test server on port 8001...")
    app.run(host='0.0.0.0', port=8001, debug=False) 
"""
Simple test script to verify core SatuPay functionality
"""

import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask, jsonify
from src.database.connection import db, init_db
from src.config.settings import config
from src.models.user import User
from src.models.transaction import Transaction

def create_simple_app():
    """Create a minimal Flask app for testing"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = 'development'
    app.config.from_object(config[config_name])
    
    # Initialize database
    db.init_app(app)
    
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'SatuPay Payment Switch',
            'version': '1.0.0',
            'database': 'connected'
        })
    
    @app.route('/test/user')
    def test_user():
        """Test user creation"""
        try:
            user = User.create_user(
                phone_number='+60123456789',
                full_name='Test User',
                email='test@SatuPay.com'
            )
            return jsonify({
                'success': True,
                'user': user.to_dict(),
                'message': 'User created successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/test/transaction')
    def test_transaction():
        """Test transaction creation"""
        try:
            txn = Transaction.create_transaction(
                txn_id='TEST_TXN_001',
                amount=10.00,
                currency='MYR',
                payment_method='test',
                payment_rail='test'
            )
            return jsonify({
                'success': True,
                'transaction': txn.to_dict(),
                'message': 'Transaction created successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/test/dashboard')
    def test_dashboard():
        """Test dashboard data"""
        try:
            stats = Transaction.get_transaction_stats()
            return jsonify({
                'success': True,
                'stats': stats,
                'message': 'Dashboard data retrieved successfully'
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_simple_app()
    
    with app.app_context():
        try:
            print("🔧 Initializing database...")
            init_db()
            print("✅ Database initialized successfully")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            sys.exit(1)
    
    print("🚀 Starting simple SatuPay test server on port 8001...")
    app.run(host='0.0.0.0', port=8001, debug=False) 