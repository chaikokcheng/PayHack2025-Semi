"""
QR Workflow API for PinkPay Payment Switch
Handles QR code generation, scanning, and payment routing
Specifically for TNG QR -> Boost payment demo workflow
"""

import uuid
import qrcode
import io
import base64
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from src.models.qr_code import QRCode
from src.models.transaction import Transaction
from src.models.user import User
from src.middleware.rate_limiter import rate_limit

qr_bp = Blueprint('qr', __name__)

@qr_bp.route('/generate', methods=['POST'])
@rate_limit(per_minute=30)
def generate_qr_code():
    """Generate QR code for payment"""
    try:
        data = request.get_json()
        
        qr_type = data.get('qr_type', 'merchant')
        merchant_id = data.get('merchant_id')
        amount = data.get('amount')
        currency = data.get('currency', 'MYR')
        expiry_minutes = data.get('expiry_minutes', 15)
        
        if qr_type == 'tng' and not all([merchant_id, amount]):
            return jsonify({
                'success': False,
                'error': 'TNG QR requires merchant_id and amount',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Create QR code based on type
        if qr_type == 'tng':
            qr_code = QRCode.create_tng_qr(
                merchant_id=merchant_id,
                amount=amount,
                currency=currency,
                expiry_minutes=expiry_minutes
            )
        elif qr_type == 'boost':
            user_id = data.get('user_id')
            if not user_id:
                return jsonify({
                    'success': False,
                    'error': 'Boost QR requires user_id',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
            
            qr_code = QRCode.create_boost_qr(
                user_id=user_id,
                amount=amount,
                currency=currency,
                expiry_minutes=expiry_minutes
            )
        else:
            # Default merchant QR
            if not merchant_id:
                return jsonify({
                    'success': False,
                    'error': 'Merchant QR requires merchant_id',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
            
            qr_code = QRCode.create_merchant_qr(
                merchant_id=merchant_id,
                amount=amount,
                currency=currency,
                expiry_minutes=expiry_minutes
            )
        
        # Generate QR code image
        qr_image_data = generate_qr_image(qr_code.qr_code_id, qr_code.payload)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code.to_dict(),
            'qr_image_base64': qr_image_data,
            'message': f'{qr_type.upper()} QR code generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"QR generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'QR code generation failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/scan', methods=['POST'])
@rate_limit(per_minute=50)
def scan_qr_code():
    """Scan and parse QR code"""
    try:
        data = request.get_json()
        
        qr_code_id = data.get('qr_code_id')
        scanner_user_id = data.get('user_id')  # User scanning the QR
        
        if not qr_code_id:
            return jsonify({
                'success': False,
                'error': 'QR code ID required',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Find QR code
        qr_code = QRCode.get_by_qr_id(qr_code_id)
        if not qr_code:
            return jsonify({
                'success': False,
                'error': 'QR code not found',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        if not qr_code.is_valid():
            return jsonify({
                'success': False,
                'error': 'QR code is expired or already used',
                'status': qr_code.status,
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Mark as scanned
        qr_code.scan()
        
        # Determine payment routing based on QR type
        routing_info = determine_payment_routing(qr_code, scanner_user_id)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code.to_dict(),
            'routing_info': routing_info,
            'message': 'QR code scanned successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"QR scan error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'QR code scanning failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/route', methods=['POST'])
@rate_limit(per_minute=30)
def route_payment():
    """Route payment between different e-wallets (TNG QR -> Boost payment)"""
    try:
        data = request.get_json()
        
        qr_code_id = data.get('qr_code_id')
        payer_user_id = data.get('payer_user_id')
        payer_wallet = data.get('payer_wallet', 'boost')
        
        required_fields = ['qr_code_id', 'payer_user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        # Get QR code details
        qr_code = QRCode.get_by_qr_id(qr_code_id)
        if not qr_code or qr_code.status != 'scanned':
            return jsonify({
                'success': False,
                'error': 'QR code not found or not in scanned state',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Validate payer
        payer = User.query.filter_by(id=payer_user_id).first()
        if not payer:
            return jsonify({
                'success': False,
                'error': 'Payer user not found',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        # Create cross-wallet payment transaction
        txn_id = f"XWALLET_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
        
        transaction = Transaction.create_transaction(
            txn_id=txn_id,
            amount=qr_code.amount,
            currency=qr_code.currency,
            payment_method='qr_cross_wallet',
            payment_rail='cross_wallet_routing',
            user_id=payer_user_id,
            merchant_id=qr_code.merchant_id,
            qr_code_id=qr_code.id,
            transaction_metadata={
                'source_qr_type': qr_code.qr_type,
                'payer_wallet': payer_wallet,
                'routing_type': f'{qr_code.qr_type}_to_{payer_wallet}',
                'demo_scenario': 'tng_qr_boost_payment'
            }
        )
        
        # Simulate payment routing process
        routing_result = simulate_cross_wallet_routing(qr_code, payer_wallet, transaction)
        
        return jsonify({
            'success': True,
            'txn_id': txn_id,
            'routing_result': routing_result,
            'message': f'Payment routed from {qr_code.qr_type.upper()} QR to {payer_wallet.upper()} wallet',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Payment routing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Payment routing failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/demo/tng-boost', methods=['POST'])
@rate_limit(per_minute=20)
def demo_tng_boost_workflow():
    """Demo endpoint for TNG QR -> Boost payment complete workflow"""
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
        
        # Step 2: Simulate customer scanning with Boost app
        customer_user_id = data.get('customer_user_id', 'demo_user_boost')
        
        # Create demo user if not exists
        demo_user = User.query.filter_by(phone_number='+60123456789').first()
        if not demo_user:
            demo_user = User.create_user(
                phone_number='+60123456789',
                full_name='Demo Boost User',
                email='demo@boost.my',
                primary_wallet='boost'
            )
            demo_user.add_linked_wallet('boost', {
                'wallet_id': 'boost_demo_123',
                'balance': 100.00,
                'status': 'active'
            })
        
        # Step 3: Scan QR code
        tng_qr.scan()
        
        # Step 4: Route payment
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
        
        # Step 5: Complete payment
        transaction.update_status('completed')
        
        return jsonify({
            'success': True,
            'demo_workflow': 'TNG QR to Boost Payment',
            'steps': {
                '1_tng_qr_generated': tng_qr.to_dict(),
                '2_customer_scanned': {
                    'user': demo_user.to_dict(),
                    'scanner_wallet': 'boost'
                },
                '3_payment_routed': {
                    'txn_id': txn_id,
                    'routing': 'TNG merchant QR -> PinkPay Switch -> Boost wallet',
                    'amount': float(amount),
                    'currency': 'MYR'
                },
                '4_payment_completed': transaction.to_dict()
            },
            'message': 'Demo workflow completed: TNG QR payment via Boost wallet',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Demo workflow error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Demo workflow failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def generate_qr_image(qr_code_id, payload):
    """Generate QR code image as base64"""
    try:
        # Create QR code data string
        qr_data = f"pinkpay://qr/{qr_code_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str
        
    except Exception as e:
        current_app.logger.error(f"QR image generation error: {str(e)}")
        return None

def determine_payment_routing(qr_code, scanner_user_id):
    """Determine payment routing based on QR type and scanner"""
    routing_info = {
        'qr_type': qr_code.qr_type,
        'amount': float(qr_code.amount) if qr_code.amount else None,
        'currency': qr_code.currency,
        'merchant_id': qr_code.merchant_id,
        'routing_options': []
    }
    
    # Get scanner user info
    scanner_user = User.query.filter_by(id=scanner_user_id).first() if scanner_user_id else None
    
    if qr_code.qr_type == 'tng':
        # TNG QR can be paid with any e-wallet via routing
        routing_info['routing_options'] = [
            {
                'wallet': 'boost',
                'description': 'Pay TNG merchant QR with Boost wallet',
                'routing_fee': 0.10,  # MYR
                'estimated_time': '2-5 seconds'
            },
            {
                'wallet': 'grabpay',
                'description': 'Pay TNG merchant QR with GrabPay wallet',
                'routing_fee': 0.15,  # MYR
                'estimated_time': '3-7 seconds'
            },
            {
                'wallet': 'maybank_qr',
                'description': 'Pay TNG merchant QR with Maybank QR',
                'routing_fee': 0.05,  # MYR
                'estimated_time': '1-3 seconds'
            }
        ]
        
        # If user has linked wallets, prioritize them
        if scanner_user and scanner_user.linked_wallets:
            user_wallets = [w.get('type') for w in scanner_user.linked_wallets]
            routing_info['user_wallets'] = user_wallets
            routing_info['recommended_wallet'] = scanner_user.primary_wallet
    
    elif qr_code.qr_type == 'boost':
        # Boost QR - direct payment or cross-wallet
        routing_info['routing_options'] = [
            {
                'wallet': 'boost',
                'description': 'Direct Boost payment',
                'routing_fee': 0.00,  # No fee for direct
                'estimated_time': '1-2 seconds'
            },
            {
                'wallet': 'other_wallets',
                'description': 'Cross-wallet payment via PinkPay routing',
                'routing_fee': 0.20,  # Higher fee for cross-wallet
                'estimated_time': '3-10 seconds'
            }
        ]
    
    return routing_info

def simulate_cross_wallet_routing(qr_code, payer_wallet, transaction):
    """Simulate cross-wallet payment routing"""
    routing_result = {
        'source_qr': qr_code.qr_type,
        'payer_wallet': payer_wallet,
        'routing_path': [],
        'fees': {},
        'timing': {}
    }
    
    # Define routing path
    if qr_code.qr_type == 'tng' and payer_wallet == 'boost':
        routing_result['routing_path'] = [
            'Customer scans TNG QR with Boost app',
            'PinkPay identifies cross-wallet transaction',
            'PinkPay debits from Boost wallet',
            'PinkPay credits to TNG merchant account',
            'Transaction completed with confirmation'
        ]
        
        routing_result['fees'] = {
            'routing_fee': 0.10,
            'currency': 'MYR',
            'charged_to': 'customer'
        }
        
        routing_result['timing'] = {
            'estimated_completion': '2-5 seconds',
            'actual_processing_time': '3.2 seconds'
        }
    
    # Update transaction with routing info
    transaction.add_metadata('routing_result', routing_result)
    
    return routing_result 
QR Workflow API for PinkPay Payment Switch
Handles QR code generation, scanning, and payment routing
Specifically for TNG QR -> Boost payment demo workflow
"""

import uuid
import qrcode
import io
import base64
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from src.models.qr_code import QRCode
from src.models.transaction import Transaction
from src.models.user import User
from src.middleware.rate_limiter import rate_limit

qr_bp = Blueprint('qr', __name__)

@qr_bp.route('/generate', methods=['POST'])
@rate_limit(per_minute=30)
def generate_qr_code():
    """Generate QR code for payment"""
    try:
        data = request.get_json()
        
        qr_type = data.get('qr_type', 'merchant')
        merchant_id = data.get('merchant_id')
        amount = data.get('amount')
        currency = data.get('currency', 'MYR')
        expiry_minutes = data.get('expiry_minutes', 15)
        
        if qr_type == 'tng' and not all([merchant_id, amount]):
            return jsonify({
                'success': False,
                'error': 'TNG QR requires merchant_id and amount',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Create QR code based on type
        if qr_type == 'tng':
            qr_code = QRCode.create_tng_qr(
                merchant_id=merchant_id,
                amount=amount,
                currency=currency,
                expiry_minutes=expiry_minutes
            )
        elif qr_type == 'boost':
            user_id = data.get('user_id')
            if not user_id:
                return jsonify({
                    'success': False,
                    'error': 'Boost QR requires user_id',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
            
            qr_code = QRCode.create_boost_qr(
                user_id=user_id,
                amount=amount,
                currency=currency,
                expiry_minutes=expiry_minutes
            )
        else:
            # Default merchant QR
            if not merchant_id:
                return jsonify({
                    'success': False,
                    'error': 'Merchant QR requires merchant_id',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
            
            qr_code = QRCode.create_merchant_qr(
                merchant_id=merchant_id,
                amount=amount,
                currency=currency,
                expiry_minutes=expiry_minutes
            )
        
        # Generate QR code image
        qr_image_data = generate_qr_image(qr_code.qr_code_id, qr_code.payload)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code.to_dict(),
            'qr_image_base64': qr_image_data,
            'message': f'{qr_type.upper()} QR code generated successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"QR generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'QR code generation failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/scan', methods=['POST'])
@rate_limit(per_minute=50)
def scan_qr_code():
    """Scan and parse QR code"""
    try:
        data = request.get_json()
        
        qr_code_id = data.get('qr_code_id')
        scanner_user_id = data.get('user_id')  # User scanning the QR
        
        if not qr_code_id:
            return jsonify({
                'success': False,
                'error': 'QR code ID required',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Find QR code
        qr_code = QRCode.get_by_qr_id(qr_code_id)
        if not qr_code:
            return jsonify({
                'success': False,
                'error': 'QR code not found',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        if not qr_code.is_valid():
            return jsonify({
                'success': False,
                'error': 'QR code is expired or already used',
                'status': qr_code.status,
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Mark as scanned
        qr_code.scan()
        
        # Determine payment routing based on QR type
        routing_info = determine_payment_routing(qr_code, scanner_user_id)
        
        return jsonify({
            'success': True,
            'qr_code': qr_code.to_dict(),
            'routing_info': routing_info,
            'message': 'QR code scanned successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"QR scan error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'QR code scanning failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/route', methods=['POST'])
@rate_limit(per_minute=30)
def route_payment():
    """Route payment between different e-wallets (TNG QR -> Boost payment)"""
    try:
        data = request.get_json()
        
        qr_code_id = data.get('qr_code_id')
        payer_user_id = data.get('payer_user_id')
        payer_wallet = data.get('payer_wallet', 'boost')
        
        required_fields = ['qr_code_id', 'payer_user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        # Get QR code details
        qr_code = QRCode.get_by_qr_id(qr_code_id)
        if not qr_code or qr_code.status != 'scanned':
            return jsonify({
                'success': False,
                'error': 'QR code not found or not in scanned state',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Validate payer
        payer = User.query.filter_by(id=payer_user_id).first()
        if not payer:
            return jsonify({
                'success': False,
                'error': 'Payer user not found',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        # Create cross-wallet payment transaction
        txn_id = f"XWALLET_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
        
        transaction = Transaction.create_transaction(
            txn_id=txn_id,
            amount=qr_code.amount,
            currency=qr_code.currency,
            payment_method='qr_cross_wallet',
            payment_rail='cross_wallet_routing',
            user_id=payer_user_id,
            merchant_id=qr_code.merchant_id,
            qr_code_id=qr_code.id,
            transaction_metadata={
                'source_qr_type': qr_code.qr_type,
                'payer_wallet': payer_wallet,
                'routing_type': f'{qr_code.qr_type}_to_{payer_wallet}',
                'demo_scenario': 'tng_qr_boost_payment'
            }
        )
        
        # Simulate payment routing process
        routing_result = simulate_cross_wallet_routing(qr_code, payer_wallet, transaction)
        
        return jsonify({
            'success': True,
            'txn_id': txn_id,
            'routing_result': routing_result,
            'message': f'Payment routed from {qr_code.qr_type.upper()} QR to {payer_wallet.upper()} wallet',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Payment routing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Payment routing failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/demo/tng-boost', methods=['POST'])
@rate_limit(per_minute=20)
def demo_tng_boost_workflow():
    """Demo endpoint for TNG QR -> Boost payment complete workflow"""
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
        
        # Step 2: Simulate customer scanning with Boost app
        customer_user_id = data.get('customer_user_id', 'demo_user_boost')
        
        # Create demo user if not exists
        demo_user = User.query.filter_by(phone_number='+60123456789').first()
        if not demo_user:
            demo_user = User.create_user(
                phone_number='+60123456789',
                full_name='Demo Boost User',
                email='demo@boost.my',
                primary_wallet='boost'
            )
            demo_user.add_linked_wallet('boost', {
                'wallet_id': 'boost_demo_123',
                'balance': 100.00,
                'status': 'active'
            })
        
        # Step 3: Scan QR code
        tng_qr.scan()
        
        # Step 4: Route payment
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
        
        # Step 5: Complete payment
        transaction.update_status('completed')
        
        return jsonify({
            'success': True,
            'demo_workflow': 'TNG QR to Boost Payment',
            'steps': {
                '1_tng_qr_generated': tng_qr.to_dict(),
                '2_customer_scanned': {
                    'user': demo_user.to_dict(),
                    'scanner_wallet': 'boost'
                },
                '3_payment_routed': {
                    'txn_id': txn_id,
                    'routing': 'TNG merchant QR -> PinkPay Switch -> Boost wallet',
                    'amount': float(amount),
                    'currency': 'MYR'
                },
                '4_payment_completed': transaction.to_dict()
            },
            'message': 'Demo workflow completed: TNG QR payment via Boost wallet',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Demo workflow error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Demo workflow failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def generate_qr_image(qr_code_id, payload):
    """Generate QR code image as base64"""
    try:
        # Create QR code data string
        qr_data = f"pinkpay://qr/{qr_code_id}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str
        
    except Exception as e:
        current_app.logger.error(f"QR image generation error: {str(e)}")
        return None

def determine_payment_routing(qr_code, scanner_user_id):
    """Determine payment routing based on QR type and scanner"""
    routing_info = {
        'qr_type': qr_code.qr_type,
        'amount': float(qr_code.amount) if qr_code.amount else None,
        'currency': qr_code.currency,
        'merchant_id': qr_code.merchant_id,
        'routing_options': []
    }
    
    # Get scanner user info
    scanner_user = User.query.filter_by(id=scanner_user_id).first() if scanner_user_id else None
    
    if qr_code.qr_type == 'tng':
        # TNG QR can be paid with any e-wallet via routing
        routing_info['routing_options'] = [
            {
                'wallet': 'boost',
                'description': 'Pay TNG merchant QR with Boost wallet',
                'routing_fee': 0.10,  # MYR
                'estimated_time': '2-5 seconds'
            },
            {
                'wallet': 'grabpay',
                'description': 'Pay TNG merchant QR with GrabPay wallet',
                'routing_fee': 0.15,  # MYR
                'estimated_time': '3-7 seconds'
            },
            {
                'wallet': 'maybank_qr',
                'description': 'Pay TNG merchant QR with Maybank QR',
                'routing_fee': 0.05,  # MYR
                'estimated_time': '1-3 seconds'
            }
        ]
        
        # If user has linked wallets, prioritize them
        if scanner_user and scanner_user.linked_wallets:
            user_wallets = [w.get('type') for w in scanner_user.linked_wallets]
            routing_info['user_wallets'] = user_wallets
            routing_info['recommended_wallet'] = scanner_user.primary_wallet
    
    elif qr_code.qr_type == 'boost':
        # Boost QR - direct payment or cross-wallet
        routing_info['routing_options'] = [
            {
                'wallet': 'boost',
                'description': 'Direct Boost payment',
                'routing_fee': 0.00,  # No fee for direct
                'estimated_time': '1-2 seconds'
            },
            {
                'wallet': 'other_wallets',
                'description': 'Cross-wallet payment via PinkPay routing',
                'routing_fee': 0.20,  # Higher fee for cross-wallet
                'estimated_time': '3-10 seconds'
            }
        ]
    
    return routing_info

def simulate_cross_wallet_routing(qr_code, payer_wallet, transaction):
    """Simulate cross-wallet payment routing"""
    routing_result = {
        'source_qr': qr_code.qr_type,
        'payer_wallet': payer_wallet,
        'routing_path': [],
        'fees': {},
        'timing': {}
    }
    
    # Define routing path
    if qr_code.qr_type == 'tng' and payer_wallet == 'boost':
        routing_result['routing_path'] = [
            'Customer scans TNG QR with Boost app',
            'PinkPay identifies cross-wallet transaction',
            'PinkPay debits from Boost wallet',
            'PinkPay credits to TNG merchant account',
            'Transaction completed with confirmation'
        ]
        
        routing_result['fees'] = {
            'routing_fee': 0.10,
            'currency': 'MYR',
            'charged_to': 'customer'
        }
        
        routing_result['timing'] = {
            'estimated_completion': '2-5 seconds',
            'actual_processing_time': '3.2 seconds'
        }
    
    # Update transaction with routing info
    transaction.add_metadata('routing_result', routing_result)
    
    return routing_result 