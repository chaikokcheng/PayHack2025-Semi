"""
Payments API for SatuPay Payment Switch
Main payment processing endpoints
"""

import uuid
import asyncio
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from src.models.transaction import Transaction
from src.models.user import User
from src.models.offline_token import OfflineToken
from src.middleware.rate_limiter import rate_limit
from src.middleware.security import require_api_key

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/pay', methods=['POST'])
@rate_limit(per_minute=30)
def process_payment():
    """Process a payment transaction"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'currency', 'payment_method', 'merchant_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        # Generate transaction ID
        txn_id = f"TXN_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
        
        # Create transaction record
        transaction = Transaction.create_transaction(
            txn_id=txn_id,
            amount=data['amount'],
            currency=data['currency'],
            payment_method=data['payment_method'],
            payment_rail=data.get('payment_rail', 'duitnow'),
            merchant_id=data['merchant_id'],
            merchant_name=data.get('merchant_name'),
            user_id=data.get('user_id'),
            transaction_metadata=data.get('metadata', {})
        )
        
        # Process transaction asynchronously
        asyncio.create_task(process_transaction_async(transaction.id, data))
        
        return jsonify({
            'success': True,
            'txn_id': txn_id,
            'status': 'pending',
            'message': 'Payment initiated successfully',
            'timestamp': datetime.utcnow().isoformat(),
            'estimated_completion': '30-60 seconds'
        }), 202
        
    except Exception as e:
        current_app.logger.error(f"Payment processing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Payment processing failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@payments_bp.route('/payoffline', methods=['POST'])
@rate_limit(per_minute=20)
def process_offline_payment():
    """Process offline payment with token"""
    try:
        data = request.get_json()
        
        # Check if it's token creation or redemption
        if 'token_operation' in data and data['token_operation'] == 'create':
            return create_offline_token(data)
        else:
            return redeem_offline_token(data)
            
    except Exception as e:
        current_app.logger.error(f"Offline payment error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Offline payment processing failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

def create_offline_token(data):
    """Create an offline payment token"""
    required_fields = ['user_id', 'amount', 'currency']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'error': f'Missing required field: {field}',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
    
    # Create offline token
    token = OfflineToken.create_token(
        user_id=data['user_id'],
        amount=data['amount'],
        currency=data.get('currency', 'MYR'),
        expiry_hours=data.get('expiry_hours', 24)
    )
    
    return jsonify({
        'success': True,
        'token': token.to_dict(),
        'message': 'Offline token created successfully',
        'timestamp': datetime.utcnow().isoformat()
    }), 201

def redeem_offline_token(data):
    """Redeem an offline payment token"""
    token_id = data.get('token_id')
    if not token_id:
        return jsonify({
            'success': False,
            'error': 'Token ID required for redemption',
            'timestamp': datetime.utcnow().isoformat()
        }), 400
    
    # Find and validate token
    token = OfflineToken.get_by_token_id(token_id)
    if not token:
        return jsonify({
            'success': False,
            'error': 'Token not found',
            'timestamp': datetime.utcnow().isoformat()
        }), 404
    
    if not token.is_valid():
        return jsonify({
            'success': False,
            'error': 'Token is not valid for redemption',
            'reason': 'expired' if token.is_expired() else 'already_used',
            'timestamp': datetime.utcnow().isoformat()
        }), 400
    
    # Redeem token
    token.redeem()
    
    # Create transaction for token redemption
    txn_id = f"OFFLINE_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
    
    transaction = Transaction.create_transaction(
        txn_id=txn_id,
        amount=token.amount,
        currency=token.currency,
        payment_method='offline_token',
        payment_rail='offline',
        user_id=token.user_id,
        transaction_metadata={'token_id': token_id, 'redemption_type': 'offline_token'}
    )
    
    transaction.update_status('completed')
    
    return jsonify({
        'success': True,
        'txn_id': txn_id,
        'token_redeemed': True,
        'amount': float(token.amount),
        'currency': token.currency,
        'message': 'Offline token redeemed successfully',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@payments_bp.route('/status/<txn_id>', methods=['GET'])
@rate_limit(per_minute=100)
def get_transaction_status(txn_id):
    """Get transaction status"""
    try:
        transaction = Transaction.get_by_txn_id(txn_id)
        
        if not transaction:
            return jsonify({
                'success': False,
                'error': 'Transaction not found',
                'txn_id': txn_id,
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        # Get plugin logs
        plugin_logs = transaction.get_plugin_logs()
        
        response_data = {
            'success': True,
            'transaction': transaction.to_dict(),
            'plugin_logs': [log.to_dict() for log in plugin_logs],
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add processing time if completed
        processing_time = transaction.get_processing_time()
        if processing_time:
            response_data['processing_time_seconds'] = processing_time
        
        return jsonify(response_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Status check error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Status check failed',
            'txn_id': txn_id,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@payments_bp.route('/refund', methods=['POST'])
@rate_limit(per_minute=10)
def process_refund():
    """Process a refund"""
    try:
        data = request.get_json()
        
        txn_id = data.get('txn_id')
        refund_amount = data.get('refund_amount')
        reason = data.get('reason', 'Customer request')
        
        if not txn_id:
            return jsonify({
                'success': False,
                'error': 'Transaction ID required',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Find original transaction
        original_txn = Transaction.get_by_txn_id(txn_id)
        if not original_txn:
            return jsonify({
                'success': False,
                'error': 'Original transaction not found',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        if original_txn.status != 'completed':
            return jsonify({
                'success': False,
                'error': 'Cannot refund non-completed transaction',
                'current_status': original_txn.status,
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        # Validate refund amount
        if not refund_amount:
            refund_amount = original_txn.amount
        else:
            if refund_amount > original_txn.amount:
                return jsonify({
                    'success': False,
                    'error': 'Refund amount cannot exceed original amount',
                    'timestamp': datetime.utcnow().isoformat()
                }), 400
        
        # Create refund transaction
        refund_txn_id = f"REFUND_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{str(uuid.uuid4())[:8].upper()}"
        
        refund_transaction = Transaction.create_transaction(
            txn_id=refund_txn_id,
            amount=refund_amount,
            currency=original_txn.currency,
            payment_method='refund',
            payment_rail=original_txn.payment_rail,
            user_id=original_txn.user_id,
            merchant_id=original_txn.merchant_id,
            transaction_metadata={
                'original_txn_id': txn_id,
                'refund_reason': reason,
                'refund_type': 'full' if refund_amount == original_txn.amount else 'partial'
            }
        )
        
        # Update original transaction status
        original_txn.update_status('refunded' if refund_amount == original_txn.amount else 'partially_refunded')
        
        # Complete refund immediately (in production, this would be async)
        refund_transaction.update_status('completed')
        
        return jsonify({
            'success': True,
            'refund_txn_id': refund_txn_id,
            'original_txn_id': txn_id,
            'refund_amount': float(refund_amount),
            'currency': original_txn.currency,
            'status': 'completed',
            'message': 'Refund processed successfully',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Refund processing error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Refund processing failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

async def process_transaction_async(transaction_id, data):
    """Process transaction asynchronously with plugins"""
    try:
        from src.plugins.plugin_manager import PluginManager
        
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return
        
        # Update status to processing
        transaction.update_status('processing')
        
        # Prepare data for plugins
        plugin_data = {
            'txn_id': transaction.txn_id,
            'amount': float(transaction.amount),
            'currency': transaction.currency,
            'user_id': str(transaction.user_id) if transaction.user_id else None,
            'merchant_id': transaction.merchant_id,
            'payment_method': transaction.payment_method,
            'payment_rail': transaction.payment_rail,
            'created_at': transaction.created_at.isoformat()
        }
        
        # Execute plugins
        plugin_manager = PluginManager()
        plugin_result = await plugin_manager.execute_plugins(plugin_data, str(transaction.id))
        
        # Determine final status based on plugin results
        if plugin_result['success']:
            # Check if risk assessment blocked the transaction
            risk_action = plugin_result.get('data', {}).get('risk_action', {})
            if risk_action.get('action') == 'BLOCK':
                        transaction.update_status('failed', 
            transaction_metadata={'failure_reason': 'blocked_by_risk_assessment', 
                     'risk_score': plugin_result['data'].get('risk_assessment', {}).get('risk_score')})
            elif risk_action.get('action') == 'MANUAL_REVIEW':
                            transaction.update_status('pending_review',
                transaction_metadata={'review_reason': 'risk_assessment_review_required'})
            else:
                # Simulate payment rail processing
                await simulate_payment_rail_processing(transaction)
                transaction.update_status('completed')
        else:
            # Plugin execution failed
                    transaction.update_status('failed', 
            transaction_metadata={'failure_reason': 'plugin_execution_failed', 
                     'errors': plugin_result.get('errors', [])})
        
    except Exception as e:
        current_app.logger.error(f"Async transaction processing error: {str(e)}")
        if transaction:
                    transaction.update_status('failed', 
            transaction_metadata={'failure_reason': 'processing_error', 'error': str(e)})

async def simulate_payment_rail_processing(transaction):
    """Simulate payment rail processing delay"""
    # Different processing times for different rails
    rail_delays = {
        'duitnow': 2,    # 2 seconds
        'paynow': 3,     # 3 seconds
        'boost': 1,      # 1 second
        'tng': 1.5,      # 1.5 seconds
        'offline': 0.5   # 0.5 seconds
    }
    
    delay = rail_delays.get(transaction.payment_rail, 2)
    await asyncio.sleep(delay) 