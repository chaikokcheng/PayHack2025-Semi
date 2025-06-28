"""
Database connection and initialization for SatuPay Payment Switch
Using Supabase with SQLAlchemy ORM
"""

import os
import logging
from flask_sqlalchemy import SQLAlchemy
from supabase import create_client, Client
from typing import Optional

# Initialize SQLAlchemy
db = SQLAlchemy()

# Supabase client
supabase_client: Optional[Client] = None

def init_supabase() -> Client:
    """Initialize Supabase client"""
    global supabase_client
    
    supabase_url = os.getenv('SUPABASE_URL', 'https://fpoyrthyyxwawmkwemkt.supabase.co')
    supabase_key = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww')
    
    if not supabase_client:
        supabase_client = create_client(supabase_url, supabase_key)
        logging.info("Supabase client initialized successfully")
    
    return supabase_client

def get_supabase() -> Client:
    """Get Supabase client instance"""
    if not supabase_client:
        return init_supabase()
    return supabase_client

def test_supabase_connection() -> bool:
    """Test Supabase connection"""
    try:
        client = get_supabase()
        # Test with a simple query
        result = client.table('users').select('id').limit(1).execute()
        logging.info("Supabase connection test successful")
        return True
    except Exception as e:
        logging.error(f"Supabase connection test failed: {str(e)}")
        return False

def init_db():
    """Initialize database tables"""
    try:
        # Import models to register them with SQLAlchemy
        from src.models.user import User
        from src.models.transaction import Transaction
        from src.models.plugin_log import PluginLog
        from src.models.offline_token import OfflineToken
        from src.models.qr_code import QRCode
        
        # Create all tables
        db.create_all()
        
        # Initialize Supabase
        init_supabase()
        
        # Test connections
        test_supabase_connection()
        
        logging.info("Database initialized successfully")
        
    except Exception as e:
        logging.error(f"Database initialization failed: {str(e)}")
        raise

def create_tables_supabase():
    """Create tables in Supabase (SQL commands)"""
    client = get_supabase()
    
    # SQL commands to create tables
    sql_commands = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            phone_number VARCHAR(20) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE,
            full_name VARCHAR(255) NOT NULL,
            primary_wallet VARCHAR(50) NOT NULL DEFAULT 'tng',
            linked_wallets JSONB DEFAULT '[]',
            kyc_status VARCHAR(20) DEFAULT 'pending',
            risk_score INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            txn_id VARCHAR(100) UNIQUE NOT NULL,
            user_id UUID REFERENCES users(id),
            amount DECIMAL(15,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'MYR',
            original_amount DECIMAL(15,2),
            original_currency VARCHAR(3),
            merchant_id VARCHAR(100),
            merchant_name VARCHAR(255),
            payment_method VARCHAR(50) NOT NULL,
            payment_rail VARCHAR(50) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            qr_code_id UUID,
            metadata JSONB DEFAULT '{}',
            processed_at TIMESTAMP,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS plugin_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            transaction_id UUID REFERENCES transactions(id),
            plugin_name VARCHAR(100) NOT NULL,
            plugin_version VARCHAR(20) NOT NULL,
            status VARCHAR(20) NOT NULL,
            input_data JSONB,
            output_data JSONB,
            error_message TEXT,
            execution_time_ms INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS offline_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            token_id VARCHAR(100) UNIQUE NOT NULL,
            user_id UUID REFERENCES users(id),
            amount DECIMAL(15,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'MYR',
            status VARCHAR(20) DEFAULT 'active',
            redeemed_at TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS qr_codes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            qr_code_id VARCHAR(100) UNIQUE NOT NULL,
            qr_type VARCHAR(50) NOT NULL,
            merchant_id VARCHAR(100),
            amount DECIMAL(15,2),
            currency VARCHAR(3) DEFAULT 'MYR',
            payload JSONB NOT NULL,
            qr_image_url TEXT,
            status VARCHAR(20) DEFAULT 'active',
            scanned_at TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]
    
    try:
        for sql in sql_commands:
            # Execute SQL using Supabase RPC or direct SQL execution
            # Note: This is a simplified approach, in production you'd use migrations
            client.rpc('execute_sql', {'sql': sql}).execute()
        
        logging.info("Supabase tables created successfully")
        
    except Exception as e:
        logging.warning(f"Supabase table creation: {str(e)} (tables may already exist)")

def reset_database():
    """Reset database (for development/testing)"""
    try:
        db.drop_all()
        db.create_all()
        logging.info("Database reset successfully")
    except Exception as e:
        logging.error(f"Database reset failed: {str(e)}")
        raise 