"""
QR Workflow API for PinkPay Payment Switch
Cross-wallet QR routing and payment processing
"""

import json
import base64
import qrcode
from io import BytesIO
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from src.models.qr_code import QRCode
from src.models.transaction import Transaction
from src.models.user import User
from src.middleware.rate_limiter import rate_limit
from src.middleware.security import require_api_key
import uuid

qr_bp = Blueprint('qr', __name__)

@qr_bp.route('/generate', methods=['POST'])
@rate_limit(per_minute=30)
def generate_qr():
    """Generate QR code for payment"""
    try:
        data = request.get_json()
        
        # Required fields validation
        required_fields = ['qr_type', 'merchant_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        qr_type = data['qr_type']
        merchant_id = data['merchant_id']
        amount = data['amount']
        currency = data.get('currency', 'MYR')
        expires_in_minutes = data.get('expires_in_minutes', 15)
        
        # Validate QR type
        if qr_type not in ['merchant', 'tng', 'boost']:
            return jsonify({
                'success': False,
                'error': 'Invalid QR type. Must be one of: merchant, tng, boost',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Create QR code data without database operations (fallback approach)
        try:
            # Try database creation first
            if qr_type == 'merchant':
                qr_code = QRCode.create_merchant_qr(
                    merchant_id=merchant_id,
                    amount=amount,
                    currency=currency,
                    expires_in_minutes=expires_in_minutes
                )
            elif qr_type == 'tng':
                qr_code = QRCode.create_tng_qr(
                    merchant_id=merchant_id,
                    amount=amount,
                    currency=currency,
                    expires_in_minutes=expires_in_minutes
                )
            elif qr_type == 'boost':
                qr_code = QRCode.create_boost_qr(
                    merchant_id=merchant_id,
                    amount=amount,
                    currency=currency,
                    expires_in_minutes=expires_in_minutes
                )
            
            # Generate QR code image
            qr_image_base64 = generate_qr_image(qr_code.payload)
            
            response_data = {
                'success': True,
                'qr_code': qr_code.to_dict(),
                'qr_image_base64': qr_image_base64,
                'message': f'{qr_type.upper()} QR code generated successfully',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as db_error:
            # Fallback: Generate QR without database
            current_app.logger.warning(f"Database QR creation failed: {str(db_error)}, using fallback")
            
            qr_code_id = f"QR_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
            expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
            
            # Create QR payload
            if qr_type == 'merchant':
                payload = {
                    'version': '01',
                    'merchant_account_info': {'merchant_id': merchant_id},
                    'transaction_amount': str(amount),
                    'transaction_currency': '458',  # MYR
                    'country_code': 'MY',
                    'additional_data': {'bill_number': qr_code_id}
                }
            elif qr_type == 'tng':
                payload = {
                    'qr_type': 'tng',
                    'merchant_id': merchant_id,
                    'amount': str(amount),
                    'currency': currency,
                    'ref_id': qr_code_id,
                    'wallet_type': 'tng'
                }
            elif qr_type == 'boost':
                payload = {
                    'qr_type': 'boost',
                    'merchant_id': merchant_id,
                    'amount': str(amount),
                    'currency': currency,
                    'transaction_ref': qr_code_id,
                    'wallet_type': 'boost'
                }
            
            # Generate QR image directly
            qr_image_base64 = generate_qr_image(payload)
            
            # Create response without database QR object
            fallback_qr_data = {
                'qr_code_id': qr_code_id,
                'qr_type': qr_type,
                'merchant_id': merchant_id,
                'amount': amount,
                'currency': currency,
                'status': 'active',
                'expires_at': expires_at.isoformat(),
                'created_at': datetime.utcnow().isoformat()
            }
            
            response_data = {
                'success': True,
                'qr_code': fallback_qr_data,
                'qr_image_base64': qr_image_base64,
                'message': f'{qr_type.upper()} QR code generated successfully (fallback mode)',
                'timestamp': datetime.utcnow().isoformat(),
                'fallback_mode': True
            }
        
        # Add routing information for demo
        if qr_type in ['tng', 'boost']:
            response_data['routing_info'] = {
                'cross_wallet_compatible': True,
                'supported_wallets': ['tng', 'boost', 'grabpay'],
                'routing_enabled': True
            }
        
        return jsonify(response_data), 201
        
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
def scan_qr():
    """Scan and parse QR code"""
    try:
        data = request.get_json()
        
        qr_code_id = data.get('qr_code_id')
        scanner_wallet = data.get('scanner_wallet')  # Which wallet is scanning
        
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
        
        # Check if QR code is valid
        if not qr_code.is_valid_for_scan():
            status_reason = 'expired' if qr_code.is_expired() else f'status is {qr_code.status}'
            return jsonify({
                'success': False,
                'error': f'QR code is not valid for scanning: {status_reason}',
                'qr_status': qr_code.status,
                'is_expired': qr_code.is_expired(),
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Determine payment routing
        routing_decision = determine_routing(qr_code, scanner_wallet)
        
        # Mark QR as scanned
        qr_code.mark_as_scanned()
        
        response_data = {
            'success': True,
            'qr_code': qr_code.to_dict(),
            'routing': routing_decision,
            'message': 'QR code scanned successfully',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        current_app.logger.error(f"QR scan error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'QR code scanning failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/route-payment', methods=['POST'])
@rate_limit(per_minute=30)
def route_payment():
    """Route payment between different e-wallets (TNG QR -> Boost payment)"""
    try:
        data = request.get_json()
        
        # Required fields
        required_fields = ['qr_code_id', 'scanner_wallet', 'user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        qr_code_id = data['qr_code_id']
        scanner_wallet = data['scanner_wallet']
        user_id = data['user_id']
        
        # Find QR code
        qr_code = QRCode.get_by_qr_id(qr_code_id)
        if not qr_code:
            return jsonify({
                'success': False,
                'error': 'QR code not found',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        # Check cross-wallet compatibility
        routing_info = simulate_cross_wallet_routing(qr_code.qr_type, scanner_wallet)
        
        if not routing_info['compatible']:
            return jsonify({
                'success': False,
                'error': f'Cross-wallet routing not supported: {qr_code.qr_type} -> {scanner_wallet}',
                'routing_info': routing_info,
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Create transaction for the routed payment
        txn_id = f"ROUTE_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{qr_code_id[-8:]}"
        
        transaction = Transaction.create_transaction(
            txn_id=txn_id,
            amount=qr_code.amount,
            currency=qr_code.currency,
            payment_method='qr_scan',
            payment_rail=routing_info['target_rail'],
            user_id=user_id,
            merchant_id=qr_code.merchant_id,
            qr_code_id=qr_code.id,
            transaction_metadata={
                'qr_type': qr_code.qr_type,
                'scanner_wallet': scanner_wallet,
                'routing_type': 'cross_wallet',
                'original_qr_wallet': qr_code.qr_type,
                'routing_fee': routing_info.get('routing_fee', 0),
                'conversion_rate': routing_info.get('conversion_rate', 1.0)
            }
        )
        
        # Simulate processing
        transaction.update_status('processing')
        
        # In a real implementation, this would trigger the actual payment processing
        # For demo, we'll mark it as completed after a short delay
        import asyncio
        
        async def complete_routed_payment():
            await asyncio.sleep(2)  # Simulate processing time
            transaction.update_status('completed')
        
        # Start async processing
        asyncio.create_task(complete_routed_payment())
        
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict(),
            'routing_info': routing_info,
            'qr_code': qr_code.to_dict(),
            'message': f'Cross-wallet payment initiated: {qr_code.qr_type} QR -> {scanner_wallet} payment',
            'estimated_completion': '2-5 seconds',
            'timestamp': datetime.utcnow().isoformat()
        }), 202
        
    except Exception as e:
        current_app.logger.error(f"Payment routing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Payment routing failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@qr_bp.route('/demo/tng-to-boost', methods=['POST'])
@rate_limit(per_minute=20)
def demo_tng_to_boost():
    """Demo endpoint for TNG QR -> Boost payment complete workflow"""
    try:
        data = request.get_json()
        
        # Demo parameters
        merchant_id = data.get('merchant_id', 'DEMO_MERCHANT_001')
        amount = data.get('amount', 25.50)
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'User ID required for demo',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Step 1: Generate TNG QR code
        tng_qr = QRCode.create_tng_qr(
            merchant_id=merchant_id,
            amount=amount,
            currency='MYR',
            expires_in_minutes=15
        )
        
        # Step 2: Generate QR image for display
        qr_image_base64 = generate_qr_image(tng_qr.payload)
        
        # Step 3: Simulate Boost wallet scanning the TNG QR
        boost_scan_result = {
            'scanner_wallet': 'boost',
            'qr_detected': True,
            'cross_wallet_routing_available': True,
            'original_wallet': 'tng'
        }
        
        # Step 4: Process cross-wallet routing
        routing_info = simulate_cross_wallet_routing('tng', 'boost')
        
        # Step 5: Create routed transaction
        txn_id = f"DEMO_ROUTE_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        transaction = Transaction.create_transaction(
            txn_id=txn_id,
            amount=amount,
            currency='MYR',
            payment_method='qr_scan',
            payment_rail='boost',
            user_id=user_id,
            merchant_id=merchant_id,
            qr_code_id=tng_qr.id,
            transaction_metadata={
                'demo_workflow': 'tng_qr_to_boost_payment',
                'qr_type': 'tng',
                'scanner_wallet': 'boost',
                'routing_type': 'cross_wallet',
                'routing_fee': 0.10,  # MYR 0.10 routing fee
                'conversion_rate': 1.0,
                'demo_timestamp': datetime.utcnow().isoformat()
            }
        )
        
        # Mark QR as scanned
        tng_qr.mark_as_scanned()
        
        # Simulate payment processing steps
        processing_steps = [
            {
                'step': 1,
                'description': 'TNG QR code generated',
                'status': 'completed',
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'step': 2,
                'description': 'Boost wallet scanned TNG QR',
                'status': 'completed',
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'step': 3,
                'description': 'Cross-wallet routing enabled',
                'status': 'completed',
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'step': 4,
                'description': 'Payment routed through PinkPay switch',
                'status': 'processing',
                'timestamp': datetime.utcnow().isoformat()
            },
            {
                'step': 5,
                'description': 'Payment settlement',
                'status': 'pending',
                'estimated_completion': '2-5 seconds'
            }
        ]
        
        # Update transaction status
        transaction.update_status('processing')
        
        return jsonify({
            'success': True,
            'demo_workflow': 'TNG QR -> Boost Payment',
            'tng_qr_code': tng_qr.to_dict(),
            'qr_image_base64': qr_image_base64,
            'boost_scan_result': boost_scan_result,
            'routing_info': routing_info,
            'transaction': transaction.to_dict(),
            'processing_steps': processing_steps,
            'demo_highlights': {
                'cross_wallet_compatibility': True,
                'real_time_routing': True,
                'unified_settlement': True,
                'transparent_fees': True
            },
            'message': 'Demo workflow completed: TNG QR code successfully processed via Boost payment',
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

@qr_bp.route('/generate-simple', methods=['POST'])
@rate_limit(per_minute=30)
def generate_qr_simple():
    """Generate QR code for payment - Simple version without database"""
    try:
        import uuid
        data = request.get_json()
        
        # Required fields validation
        required_fields = ['qr_type', 'merchant_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        qr_type = data['qr_type']
        merchant_id = data['merchant_id']
        amount = data['amount']
        currency = data.get('currency', 'MYR')
        expires_in_minutes = data.get('expires_in_minutes', 15)
        
        # Validate QR type
        if qr_type not in ['merchant', 'tng', 'boost']:
            return jsonify({
                'success': False,
                'error': 'Invalid QR type. Must be one of: merchant, tng, boost',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Generate QR code data without database
        qr_code_id = f"QR_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        
        # Create QR payload based on type
        if qr_type == 'merchant':
            payload = {
                'version': '01',
                'merchant_account_info': {'merchant_id': merchant_id},
                'transaction_amount': str(amount),
                'transaction_currency': '458',  # MYR
                'country_code': 'MY',
                'merchant_name': 'PinkPay Demo Merchant',
                'additional_data': {'bill_number': qr_code_id},
                'qr_code_id': qr_code_id,
                'qr_type': qr_type
            }
        elif qr_type == 'tng':
            payload = {
                'qr_type': 'tng',
                'merchant_id': merchant_id,
                'amount': str(amount),
                'currency': currency,
                'ref_id': qr_code_id,
                'wallet_type': 'tng',
                'qr_code_id': qr_code_id,
                'routing_info': {
                    'accepts': ['tng', 'boost', 'grabpay']
                }
            }
        elif qr_type == 'boost':
            payload = {
                'qr_type': 'boost',
                'merchant_id': merchant_id,
                'amount': str(amount),
                'currency': currency,
                'transaction_ref': qr_code_id,
                'wallet_type': 'boost',
                'qr_code_id': qr_code_id,
                'routing_info': {
                    'accepts': ['boost', 'tng', 'grabpay']
                }
            }
        
        # Generate QR image
        qr_image_base64 = generate_qr_image(payload)
        
        # Create QR code data
        qr_data = {
            'qr_code_id': qr_code_id,
            'qr_type': qr_type,
            'merchant_id': merchant_id,
            'amount': amount,
            'currency': currency,
            'status': 'active',
            'expires_at': expires_at.isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'payload': payload
        }
        
        response_data = {
            'success': True,
            'qr_code': qr_data,
            'qr_image_base64': qr_image_base64,
            'message': f'{qr_type.upper()} QR code generated successfully (simple mode)',
            'timestamp': datetime.utcnow().isoformat(),
            'simple_mode': True
        }
        
        # Add routing information for cross-wallet QRs
        if qr_type in ['tng', 'boost']:
            response_data['routing_info'] = {
                'cross_wallet_compatible': True,
                'supported_wallets': ['tng', 'boost', 'grabpay'],
                'routing_enabled': True
            }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        current_app.logger.error(f"Simple QR generation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'QR code generation failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def generate_qr_image(payload):
    """Generate QR code image as base64"""
    try:
        # Convert payload to JSON string for QR encoding
        qr_data = json.dumps(payload, ensure_ascii=False)
        
        # Create QR code
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
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        current_app.logger.error(f"QR image generation error: {str(e)}")
        return None

def determine_routing(qr_code, scanner_wallet):
    """Determine payment routing based on QR type and scanner"""
    routing = {
        'qr_wallet': qr_code.qr_type,
        'scanner_wallet': scanner_wallet,
        'routing_required': qr_code.qr_type != scanner_wallet,
        'compatible': True,
        'routing_method': 'direct'
    }
    
    if routing['routing_required']:
        # Cross-wallet routing needed
        routing['routing_method'] = 'cross_wallet'
        routing['routing_rail'] = 'pinkpay_switch'
        routing['estimated_time'] = '2-5 seconds'
        routing['routing_fee'] = 0.10  # MYR 0.10
        
        # Check compatibility matrix
        compatibility_matrix = {
            ('tng', 'boost'): True,
            ('boost', 'tng'): True,
            ('tng', 'grabpay'): True,
            ('boost', 'grabpay'): True,
            ('merchant', 'tng'): True,
            ('merchant', 'boost'): True,
            ('merchant', 'grabpay'): True
        }
        
        routing['compatible'] = compatibility_matrix.get(
            (qr_code.qr_type, scanner_wallet), False
        )
        
        if not routing['compatible']:
            routing['error'] = f'Cross-wallet routing not supported: {qr_code.qr_type} -> {scanner_wallet}'
    
    return routing

def simulate_cross_wallet_routing(qr_wallet, scanner_wallet):
    """Simulate cross-wallet payment routing"""
    routing_info = {
        'source_wallet': qr_wallet,
        'target_wallet': scanner_wallet,
        'compatible': True,
        'routing_method': 'pinkpay_switch',
        'target_rail': scanner_wallet,
        'routing_fee': 0.10,
        'conversion_rate': 1.0,
        'estimated_time_seconds': 3,
        'settlement_method': 'real_time'
    }
    
    # Define routing rules
    routing_rules = {
        ('tng', 'boost'): {
            'compatible': True,
            'routing_fee': 0.10,
            'priority': 'high'
        },
        ('boost', 'tng'): {
            'compatible': True,
            'routing_fee': 0.12,
            'priority': 'high'
        },
        ('merchant', 'tng'): {
            'compatible': True,
            'routing_fee': 0.05,
            'priority': 'standard'
        },
        ('merchant', 'boost'): {
            'compatible': True,
            'routing_fee': 0.05,
            'priority': 'standard'
        }
    }
    
    rule_key = (qr_wallet, scanner_wallet)
    if rule_key in routing_rules:
        routing_info.update(routing_rules[rule_key])
    else:
        routing_info['compatible'] = False
        routing_info['error'] = f'No routing rule found for {qr_wallet} -> {scanner_wallet}'
    
    return routing_info 