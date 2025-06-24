#!/usr/bin/env python3
"""
PinkPay Backend Startup Script with Supabase Integration
"""

import os
import sys
import logging
from datetime import datetime

def setup_environment():
    """Setup environment variables for Supabase"""
    # Set environment variables if not already set
    env_vars = {
        'SUPABASE_URL': 'https://fpoyrthyyxwawmkwemkt.supabase.co',
        'SUPABASE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww',
        'FLASK_ENV': 'development',
        'FLASK_DEBUG': 'True',
        'FLASK_HOST': '127.0.0.1',
        'FLASK_PORT': '8000',
        'JWT_SECRET_KEY': 'pinkpay-super-secret-jwt-key-payhack2025',
        'PLUGINS_ENABLED': 'fx_converter,risk_checker,token_handler',
        'LOG_LEVEL': 'INFO'
    }
    
    for key, value in env_vars.items():
        if not os.getenv(key):
            os.environ[key] = value
    
    print("✅ Environment variables set for Supabase integration")

def test_dependencies():
    """Test if required dependencies are installed"""
    try:
        import flask
        import supabase
        import psycopg2
        print("✅ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def test_supabase_connection():
    """Test Supabase connection before starting"""
    try:
        from supabase import create_client
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        client = create_client(supabase_url, supabase_key)
        
        # Test connection
        result = client.table('users').select('id').limit(1).execute()
        print("✅ Supabase connection successful")
        return True
        
    except Exception as e:
        print(f"⚠️  Supabase connection test failed: {str(e)}")
        print("   The app will run with SQLite fallback")
        return False

def create_sample_data():
    """Create sample data in Supabase (optional)"""
    try:
        from supabase import create_client
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        client = create_client(supabase_url, supabase_key)
        
        # Create sample user if none exists
        users_result = client.table('users').select('id').limit(1).execute()
        
        if not users_result.data:
            sample_user = {
                'phone_number': '+60123456789',
                'email': 'demo@pinkpay.com',
                'full_name': 'Demo User',
                'primary_wallet': 'boost',
                'linked_wallets': ['tng', 'boost'],
                'kyc_status': 'verified',
                'risk_score': 25,
                'is_active': True
            }
            
            client.table('users').insert(sample_user).execute()
            print("✅ Sample user created in Supabase")
        
        # Create sample transaction if none exists
        txns_result = client.table('transactions').select('id').limit(1).execute()
        
        if not txns_result.data:
            sample_txn = {
                'txn_id': 'TXN_DEMO_001',
                'amount': 75.50,
                'currency': 'MYR',
                'merchant_id': 'PAYHACK_DEMO_001',
                'merchant_name': 'Demo Merchant',
                'payment_method': 'qr',
                'payment_rail': 'tng_to_boost',
                'status': 'completed',
                'metadata': {
                    'demo': True,
                    'cross_wallet': True,
                    'source': 'tng',
                    'target': 'boost'
                }
            }
            
            client.table('transactions').insert(sample_txn).execute()
            print("✅ Sample transaction created in Supabase")
            
        return True
        
    except Exception as e:
        print(f"⚠️  Could not create sample data: {str(e)}")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting PinkPay Backend with Supabase Integration")
    print("=" * 60)
    
    # Setup environment
    setup_environment()
    
    # Test dependencies
    if not test_dependencies():
        sys.exit(1)
    
    # Test Supabase connection
    supabase_connected = test_supabase_connection()
    
    # Create sample data if connected
    if supabase_connected:
        create_sample_data()
    
    print("\n🎯 Starting Flask application...")
    print(f"   URL: http://{os.getenv('FLASK_HOST')}:{os.getenv('FLASK_PORT')}")
    print(f"   Supabase: {'✅ Connected' if supabase_connected else '❌ Fallback to SQLite'}")
    print(f"   Environment: {os.getenv('FLASK_ENV')}")
    print(f"   Debug: {os.getenv('FLASK_DEBUG')}")
    print("=" * 60)
    
    # Import and run the Flask app
    try:
        from app import create_app
        app = create_app()
        
        app.run(
            host=os.getenv('FLASK_HOST', '127.0.0.1'),
            port=int(os.getenv('FLASK_PORT', 8000)),
            debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
        )
        
    except Exception as e:
        print(f"❌ Failed to start application: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 