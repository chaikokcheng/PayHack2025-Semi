"""
Configuration settings for PinkPay Payment Switch
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'pinkpay-super-secret-jwt-key-payhack2025')
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://fpoyrthyyxwawmkwemkt.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww')
    
    # Database Configuration
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    
    if DB_PASSWORD:
        # Use Supabase PostgreSQL if password is provided
        SQLALCHEMY_DATABASE_URI = f"postgresql://postgres.fpoyrthyyxwawmkwemkt:{DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_pre_ping': True,
            'pool_recycle': 300,
            'pool_timeout': 20,
            'max_overflow': 0
        }
    else:
        # Use SQLite for local development/testing
        SQLALCHEMY_DATABASE_URI = 'sqlite:///pinkpay_dev.db'
        SQLALCHEMY_ENGINE_OPTIONS = {}
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    JWT_ALGORITHM = 'HS256'
    
    # Redis Configuration (for queue system)
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Plugin Configuration
    PLUGINS_ENABLED = os.getenv('PLUGINS_ENABLED', 'fx_converter,risk_checker,token_handler').split(',')
    
    # Payment Rails Configuration
    PAYMENT_RAILS = {
        'duitnow': {
            'url': os.getenv('DUITNOW_API_URL', 'https://api.duitnow.com.my'),
            'enabled': True,
            'timeout': 30
        },
        'paynow': {
            'url': os.getenv('PAYNOW_API_URL', 'https://api.paynow.sg'), 
            'enabled': True,
            'timeout': 30
        },
        'boost': {
            'url': os.getenv('BOOST_API_URL', 'https://api.boost.my'),
            'enabled': True,
            'timeout': 30
        },
        'tng': {
            'url': os.getenv('TNG_API_URL', 'https://api.touchngo.com.my'),
            'enabled': True,
            'timeout': 30
        }
    }
    
    # Security Configuration
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))
    RATE_LIMIT_PER_HOUR = int(os.getenv('RATE_LIMIT_PER_HOUR', 1000))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/pinkpay.log')
    
    # Application Configuration
    APP_NAME = 'PinkPay Payment Switch'
    APP_VERSION = '1.0.0'
    
    # QR Code Configuration
    QR_CODE_SIZE = 10
    QR_CODE_BORDER = 4
    QR_CODE_EXPIRY_MINUTES = 15
    
    # Offline Token Configuration
    OFFLINE_TOKEN_EXPIRY_HOURS = 24
    OFFLINE_TOKEN_LENGTH = 32
    
    # Risk Management Configuration
    RISK_THRESHOLDS = {
        'high_amount': 10000.0,  # MYR
        'suspicious_frequency': 10,  # transactions per hour
        'velocity_limit': 50000.0  # MYR per day
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    RATE_LIMIT_PER_MINUTE = 100
    RATE_LIMIT_PER_HOUR = 5000

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 