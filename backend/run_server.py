#!/usr/bin/env python3
"""
SatuPay Payment Switch - Development Server Runner
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app

if __name__ == '__main__':
    # Create Flask app
    app = create_app('development')
    
    # Get configuration from environment
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"""
🚀 Starting SatuPay Payment Switch...

📊 Dashboard: http://{host}:{port}/api/dashboard/overview
💳 Payments API: http://{host}:{port}/api/pay
🔄 QR Workflow: http://{host}:{port}/api/qr/demo/tng-boost
🩺 Health Check: http://{host}:{port}/health

Environment: {os.getenv('FLASK_ENV', 'development')}
Debug Mode: {debug}
    """)
    
    # Run the development server
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    ) 
"""
SatuPay Payment Switch - Development Server Runner
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app

if __name__ == '__main__':
    # Create Flask app
    app = create_app('development')
    
    # Get configuration from environment
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"""
🚀 Starting SatuPay Payment Switch...

📊 Dashboard: http://{host}:{port}/api/dashboard/overview
💳 Payments API: http://{host}:{port}/api/pay
🔄 QR Workflow: http://{host}:{port}/api/qr/demo/tng-boost
🩺 Health Check: http://{host}:{port}/health

Environment: {os.getenv('FLASK_ENV', 'development')}
Debug Mode: {debug}
    """)
    
    # Run the development server
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    ) 