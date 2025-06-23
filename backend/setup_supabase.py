#!/usr/bin/env python3
"""
Supabase Setup Script for PinkPay Payment Switch
Run this script to configure Supabase connection
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with Supabase configuration"""
    
    env_content = """# PinkPay Payment Switch Environment Configuration

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
JWT_SECRET_KEY=pinkpay-super-secret-jwt-key-payhack2025

# Supabase Configuration
SUPABASE_URL=https://fpoyrthyyxwawmkwemkt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww

# Database Configuration 
# Set DB_PASSWORD to enable Supabase PostgreSQL connection
# Get your password from: Supabase Dashboard > Settings > Database
DB_PASSWORD=kcpasswordsupabase

# Payment Rails Configuration
DUITNOW_API_URL=https://api.duitnow.com.my
PAYNOW_API_URL=https://api.paynow.sg
BOOST_API_URL=https://api.boost.my
TNG_API_URL=https://api.touchngo.com.my

# Security Configuration
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Logging Configuration
LOG_LEVEL=DEBUG
LOG_FILE=logs/pinkpay.log

# Plugin Configuration
PLUGINS_ENABLED=fx_converter,risk_checker,token_handler

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0
"""
    
    env_path = Path('.env')
    
    if env_path.exists():
        print("⚠️  .env file already exists!")
        overwrite = input("Do you want to overwrite it? (y/N): ").lower().strip()
        if overwrite != 'y':
            print("❌ Setup cancelled.")
            return False
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    return True

def install_dependencies():
    """Install required Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    dependencies = [
        'supabase==2.8.0',
        'python-dotenv==1.0.0',
        'flask==3.0.0',
        'flask-sqlalchemy==3.1.1',
        'flask-jwt-extended==4.6.0',
        'psycopg2-binary==2.9.9',
        'qrcode[pil]==7.4.2'
    ]
    
    for dep in dependencies:
        os.system(f'pip install {dep}')
    
    print("✅ Dependencies installed!")

def test_connection():
    """Test Supabase connection"""
    print("🔌 Testing Supabase connection...")
    
    try:
        from supabase import create_client
        
        url = "https://fpoyrthyyxwawmkwemkt.supabase.co"
        key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww"
        
        supabase = create_client(url, key)
        
        # Test with a simple query
        result = supabase.table('users').select('count').execute()
        print("✅ Supabase connection successful!")
        print(f"📊 Found {len(result.data) if result.data else 0} users in database")
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 PinkPay Payment Switch - Supabase Setup")
    print("=" * 50)
    
    # Step 1: Create .env file
    print("\n📝 Step 1: Creating environment configuration...")
    if not create_env_file():
        sys.exit(1)
    
    # Step 2: Install dependencies
    print("\n📦 Step 2: Installing dependencies...")
    install_dependencies()
    
    # Step 3: Test connection
    print("\n🔌 Step 3: Testing connection...")
    if test_connection():
        print("\n🎉 Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Run the SQL script in your Supabase SQL Editor:")
        print("   📁 backend/supabase_setup.sql")
        print("2. Set your DB_PASSWORD in .env file to enable PostgreSQL")
        print("3. Start the server: python run_server.py")
    else:
        print("\n⚠️  Setup completed with warnings.")
        print("Please check your Supabase configuration.")

if __name__ == "__main__":
    main() 
"""
Supabase Setup Script for PinkPay Payment Switch
Run this script to configure Supabase connection
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with Supabase configuration"""
    
    env_content = """# PinkPay Payment Switch Environment Configuration

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
JWT_SECRET_KEY=pinkpay-super-secret-jwt-key-payhack2025

# Supabase Configuration
SUPABASE_URL=https://fpoyrthyyxwawmkwemkt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww

# Database Configuration 
# Set DB_PASSWORD to enable Supabase PostgreSQL connection
# Get your password from: Supabase Dashboard > Settings > Database
DB_PASSWORD=kcpasswordsupabase

# Payment Rails Configuration
DUITNOW_API_URL=https://api.duitnow.com.my
PAYNOW_API_URL=https://api.paynow.sg
BOOST_API_URL=https://api.boost.my
TNG_API_URL=https://api.touchngo.com.my

# Security Configuration
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Logging Configuration
LOG_LEVEL=DEBUG
LOG_FILE=logs/pinkpay.log

# Plugin Configuration
PLUGINS_ENABLED=fx_converter,risk_checker,token_handler

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0
"""
    
    env_path = Path('.env')
    
    if env_path.exists():
        print("⚠️  .env file already exists!")
        overwrite = input("Do you want to overwrite it? (y/N): ").lower().strip()
        if overwrite != 'y':
            print("❌ Setup cancelled.")
            return False
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    return True

def install_dependencies():
    """Install required Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    dependencies = [
        'supabase==2.8.0',
        'python-dotenv==1.0.0',
        'flask==3.0.0',
        'flask-sqlalchemy==3.1.1',
        'flask-jwt-extended==4.6.0',
        'psycopg2-binary==2.9.9',
        'qrcode[pil]==7.4.2'
    ]
    
    for dep in dependencies:
        os.system(f'pip install {dep}')
    
    print("✅ Dependencies installed!")

def test_connection():
    """Test Supabase connection"""
    print("🔌 Testing Supabase connection...")
    
    try:
        from supabase import create_client
        
        url = "https://fpoyrthyyxwawmkwemkt.supabase.co"
        key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww"
        
        supabase = create_client(url, key)
        
        # Test with a simple query
        result = supabase.table('users').select('count').execute()
        print("✅ Supabase connection successful!")
        print(f"📊 Found {len(result.data) if result.data else 0} users in database")
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 PinkPay Payment Switch - Supabase Setup")
    print("=" * 50)
    
    # Step 1: Create .env file
    print("\n📝 Step 1: Creating environment configuration...")
    if not create_env_file():
        sys.exit(1)
    
    # Step 2: Install dependencies
    print("\n📦 Step 2: Installing dependencies...")
    install_dependencies()
    
    # Step 3: Test connection
    print("\n🔌 Step 3: Testing connection...")
    if test_connection():
        print("\n🎉 Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Run the SQL script in your Supabase SQL Editor:")
        print("   📁 backend/supabase_setup.sql")
        print("2. Set your DB_PASSWORD in .env file to enable PostgreSQL")
        print("3. Start the server: python run_server.py")
    else:
        print("\n⚠️  Setup completed with warnings.")
        print("Please check your Supabase configuration.")

if __name__ == "__main__":
    main() 