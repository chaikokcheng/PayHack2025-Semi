#!/usr/bin/env python3
"""
SatuPay Payment Switch - Production Demo Server
Complete payment switch functionality for PayHack2025 demonstration
"""

import sys
import os
import uuid
from datetime import datetime, timedelta

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask, jsonify, request
from src.database.connection import db, init_db
from src.config.settings import config
from src.models.user import User
from src.models.transaction import Transaction
from src.models.qr_code import QRCode
from src.models.offline_token import OfflineToken

def create_demo_app():
    """Create the SatuPay Payment Switch demo app"""
    app = Flask(__name__)
    
    # Load configuration
    config_name = 'development'
    app.config.from_object(config[config_name])
    
    # Initialize database
    db.init_app(app)
    
    @app.route('/health')
    def health():
        """System health check"""
        return jsonify({
            'status': 'healthy',
            'service': 'SatuPay Payment Switch',
            'version': '1.0.0',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat(),
            'environment': 'demo'
        })
    
    @app.route('/api/pay', methods=['POST'])
    def process_payment():
        """Process a payment transaction"""
        try:
            data = request.get_json()
            
            # Generate transaction ID
            txn_id = f"PAY_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
            
            # Create transaction
            transaction = Transaction.create_transaction(
                txn_id=txn_id,
                amount=data.get('amount'),
                currency=data.get('currency', 'MYR'),
                payment_method=data.get('payment_method', 'qr'),
                payment_rail=data.get('payment_rail', 'duitnow'),
                user_id=data.get('user_id'),
                merchant_id=data.get('merchant_id'),
                merchant_name=data.get('merchant_name'),
                transaction_metadata=data.get('metadata', {})
            )
            
            # Complete transaction
            transaction.update_status('completed')
            
            return jsonify({
                'success': True,
                'txn_id': txn_id,
                'status': 'completed',
                'amount': float(data.get('amount')),
                'currency': data.get('currency', 'MYR'),
                'message': 'Payment processed successfully',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Payment processing failed: {str(e)}',
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    
    @app.route('/api/qr/demo/tng-boost', methods=['POST'])
    def demo_tng_boost_workflow():
        """Demo: Complete TNG QR → Boost payment workflow"""
        try:
            data = request.get_json()
            
            # Step 1: Create TNG merchant QR
            merchant_id = data.get('merchant_id', 'DEMO_MERCHANT_001')
            amount = data.get('amount', 25.00)
            
            tng_qr = QRCode.create_tng_qr(
                merchant_id=merchant_id,
                amount=amount,
                currency='MYR',
                expiry_minutes=15
            )
            
            # Step 2: Create demo Boost user
            demo_user = User.create_user(
                phone_number=f'+6012{str(uuid.uuid4())[:7]}',
                full_name='Demo Boost User',
                email='demo@boost.my',
                primary_wallet='boost'
            )
            
            # Step 3: Create transaction
            txn_id = f"DEMO_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
            
            transaction = Transaction.create_transaction(
                txn_id=txn_id,
                amount=amount,
                currency='MYR',
                payment_method='qr_cross_wallet',
                payment_rail='demo_routing',
                user_id=demo_user.id,
                merchant_id=merchant_id,
                qr_code_id=tng_qr.id,
                transaction_metadata={
                    'demo_workflow': True,
                    'source_qr': 'tng',
                    'payer_wallet': 'boost',
                    'routing_demo': True
                }
            )
            
            # Complete payment
            transaction.update_status('completed')
            
            return jsonify({
                'success': True,
                'demo_workflow': 'TNG QR to Boost Payment',
                'steps': {
                    'tng_qr_generated': tng_qr.to_dict(),
                    'customer_info': demo_user.to_dict(),
                    'payment_completed': transaction.to_dict()
                },
                'routing_info': {
                    'from': 'TNG Merchant QR',
                    'to': 'Boost Wallet',
                    'via': 'SatuPay Payment Switch',
                    'processing_time': '3.2 seconds'
                },
                'message': 'Demo: TNG QR payment completed via Boost wallet',
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Demo workflow failed: {str(e)}',
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    
    @app.route('/api/dashboard/overview')
    def dashboard_overview():
        """Get dashboard overview with real-time metrics"""
        try:
            # Transaction statistics
            txn_stats = Transaction.get_transaction_stats()
            
            # Token statistics
            token_stats = OfflineToken.get_token_stats()
            
            # QR code statistics
            qr_stats = QRCode.get_qr_stats()
            
            overview = {
                'system_status': 'operational',
                'transaction_stats': txn_stats,
                'token_stats': token_stats,
                'qr_stats': qr_stats,
                'uptime': '99.9%',
                'processing_rate': '1,200 TPS',
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return jsonify({
                'success': True,
                'overview': overview,
                'message': 'Dashboard overview retrieved successfully'
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Dashboard overview failed: {str(e)}',
                'timestamp': datetime.utcnow().isoformat()
            }), 500
    
    @app.route('/api/mobile/scan-update', methods=['POST'])
    def mobile_scan_update():
        """Receive real-time updates from mobile QR scanner"""
        try:
            data = request.get_json()
            
            # Store the mobile scan update in memory for real-time dashboard updates
            # In production, this would use Redis, WebSockets, or a proper queue
            mobile_update = {
                'timestamp': data.get('timestamp', datetime.utcnow().isoformat()),
                'status': data.get('status'),
                'mobile_user_id': data.get('mobile_user_id'),
                'message': data.get('message'),
                'progress': data.get('progress', 0),
                'qr_data': data.get('qr_data'),
                'transaction_id': data.get('transaction_id'),
                'amount': data.get('amount'),
                'merchant': data.get('merchant'),
                'new_balance': data.get('new_balance'),
                'backend_mode': data.get('backend_mode', 'demo'),
                'error': data.get('error')
            }
            
            # Store in app context for dashboard polling
            if not hasattr(app, 'mobile_updates'):
                app.mobile_updates = []
            
            app.mobile_updates.append(mobile_update)
            
            # Keep only last 10 updates
            if len(app.mobile_updates) > 10:
                app.mobile_updates = app.mobile_updates[-10:]
            
            print(f"📱 Mobile Update: {mobile_update['status']} - {mobile_update['message']}")
            
            return jsonify({
                'success': True,
                'message': 'Mobile update received',
                'status': mobile_update['status']
            }), 200
            
        except Exception as e:
            print(f"❌ Mobile update error: {e}")
            return jsonify({
                'success': False,
                'error': f'Failed to process mobile update: {str(e)}'
            }), 500

    @app.route('/api/dashboard/mobile-updates', methods=['GET'])
    def get_mobile_updates():
        """Get recent mobile QR scan updates for dashboard"""
        try:
            # Return recent mobile updates
            updates = getattr(app, 'mobile_updates', [])
            
            # Get the latest update for current status
            latest_update = updates[-1] if updates else None
            
            return jsonify({
                'success': True,
                'latest_update': latest_update,
                'recent_updates': updates[-5:],  # Last 5 updates
                'total_scans': len([u for u in updates if u['status'] == 'payment_success']),
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to get mobile updates: {str(e)}'
            }), 500

    @app.route('/api/dashboard/live-status', methods=['GET'])
    def get_live_status():
        """Get live system status including mobile activity"""
        try:
            updates = getattr(app, 'mobile_updates', [])
            
            # Count activity in last 5 minutes
            recent_activity = [
                u for u in updates 
                if (datetime.utcnow() - datetime.fromisoformat(u['timestamp'].replace('Z', '+00:00'))).total_seconds() < 300
            ]
            
            successful_payments = [u for u in updates if u['status'] == 'payment_success']
            total_amount = sum(float(u.get('amount', 0)) for u in successful_payments)
            
            status = {
                'mobile_scanner_active': len(recent_activity) > 0,
                'recent_scans': len([u for u in recent_activity if u['status'] in ['scan_started', 'processing']]),
                'successful_payments': len(successful_payments),
                'total_transaction_value': total_amount,
                'last_activity': updates[-1]['timestamp'] if updates else None,
                'backend_mode': updates[-1].get('backend_mode', 'demo') if updates else 'demo',
                'system_status': 'active' if len(recent_activity) > 0 else 'idle'
            }
            
            return jsonify({
                'success': True,
                'live_status': status,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to get live status: {str(e)}'
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_demo_app()
    
    with app.app_context():
        try:
            print("🔧 Initializing SatuPay Payment Switch database...")
            init_db()
            print("✅ Database initialized successfully")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            sys.exit(1)
    
    print(f"""
🚀 SatuPay Payment Switch - Demo Server Starting...

📊 Dashboard: http://192.168.0.12:8000/api/dashboard/overview
💳 Payment API: http://192.168.0.12:8000/api/pay
📱 Mobile Updates: http://192.168.0.12:8000/api/mobile/scan-update
🔄 QR Demo: http://192.168.0.12:8000/api/qr/demo/tng-boost
🩺 Health Check: http://192.168.0.12:8000/health

🌟 Ready for PayHack2025 Demo!
🔗 Mobile devices can connect on local network!
""")
    
    app.run(host='0.0.0.0', port=8000, debug=False)
