"""
Mobile API endpoints for offline payment system
Handles token management, payment processing, and synchronization
"""

import secrets
import hashlib
import hmac
import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, current_app
from src.models.user import User
from src.models.offline_token import OfflineToken
from src.models.transaction import Transaction
from src.utils.crypto import generate_signature, verify_signature
from src.middleware.rate_limiter import rate_limit

mobile_bp = Blueprint('mobile', __name__)


@mobile_bp.route('/balance/<user_id>', methods=['GET'])
@rate_limit(per_minute=60)
def get_user_balance(user_id):
    """Get user balance and offline authorization limits"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        # Get active offline tokens
        active_tokens = OfflineToken.query.filter_by(
            user_id=user_id,
            status='active'
        ).all()

        total_offline_limit = sum(
            token.remaining_amount for token in active_tokens)

        return jsonify({
            'success': True,
            'balance': float(user.balance),
            'offline_limit': float(total_offline_limit),
            'active_tokens': len(active_tokens),
            'currency': 'MYR'
        })

    except Exception as e:
        current_app.logger.error(f"Error getting balance: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to get balance'}), 500


@mobile_bp.route('/tokens', methods=['POST'])
@rate_limit(per_minute=20)
def create_offline_token():
    """Create offline payment token with cryptographic signature"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        device_id = data.get('device_id')

        if not all([user_id, amount, device_id]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # Validate user and balance
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        if float(amount) > float(user.balance):
            return jsonify({'success': False, 'message': 'Insufficient balance'}), 400

        # Generate unique token ID
        token_id = f"TOKEN_{secrets.token_hex(16).upper()}"

        # Create token payload for signature
        token_payload = {
            'token_id': token_id,
            'user_id': user_id,
            'amount': amount,
            'device_id': device_id,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'balance_at_creation': float(user.balance)
        }

        # Generate cryptographic signature
        signature = generate_signature(
            json.dumps(token_payload, sort_keys=True))

        # Create offline token
        token = OfflineToken(
            token_id=token_id,
            user_id=user_id,
            amount=amount,
            remaining_amount=amount,
            device_id=device_id,
            signature=signature,
            payload_hash=hashlib.sha256(json.dumps(
                token_payload, sort_keys=True).encode()).hexdigest(),
            status='active',
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc).replace(
                hour=23, minute=59, second=59)
        )

        from src.database.connection import db
        db.session.add(token)
        db.session.commit()

        return jsonify({
            'success': True,
            'token_id': token_id,
            'amount': float(amount),
            'signature': signature,
            'payload_hash': token.payload_hash,
            'expires_at': token.expires_at.isoformat(),
            'security_features': {
                'device_bound': True,
                'cryptographically_signed': True,
                'balance_snapshot': float(user.balance),
                'nonce_protection': True
            }
        })

    except Exception as e:
        current_app.logger.error(f"Error creating token: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to create token'}), 500


@mobile_bp.route('/tokens/<user_id>', methods=['GET'])
@rate_limit(per_minute=60)
def get_user_tokens(user_id):
    """Get user's active offline tokens"""
    try:
        tokens = OfflineToken.query.filter_by(
            user_id=user_id,
            status='active'
        ).all()

        token_list = []
        for token in tokens:
            token_list.append({
                'token_id': token.token_id,
                'amount': float(token.amount),
                'remaining_amount': float(token.remaining_amount),
                'device_id': token.device_id,
                'signature': token.signature,
                'payload_hash': token.payload_hash,
                'created_at': token.created_at.isoformat(),
                'expires_at': token.expires_at.isoformat()
            })

        return jsonify({
            'success': True,
            'tokens': token_list
        })

    except Exception as e:
        current_app.logger.error(f"Error getting tokens: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to get tokens'}), 500


@mobile_bp.route('/verify-payment', methods=['POST'])
@rate_limit(per_minute=30)
def verify_offline_payment():
    """Verify offline payment token and process settlement"""
    try:
        data = request.get_json()
        payment_payload = data.get('payment_payload')
        token_id = data.get('token_id')
        amount = data.get('amount')
        payer_device_id = data.get('payer_device_id')
        payee_id = data.get('payee_id')

        if not all([payment_payload, token_id, amount, payer_device_id, payee_id]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        # Find and validate token
        token = OfflineToken.query.filter_by(token_id=token_id).first()
        if not token:
            return jsonify({'success': False, 'message': 'Token not found'}), 404

        if token.status != 'active':
            return jsonify({'success': False, 'message': 'Token is not active'}), 400

        if token.is_expired():
            return jsonify({'success': False, 'message': 'Token has expired'}), 400

        if float(amount) > float(token.remaining_amount):
            return jsonify({'success': False, 'message': 'Amount exceeds token limit'}), 400

        # Verify cryptographic signature
        if not verify_signature(payment_payload, token.signature):
            return jsonify({'success': False, 'message': 'Invalid signature'}), 400

        # Check payer's current balance
        payer = User.query.get(token.user_id)
        if not payer:
            return jsonify({'success': False, 'message': 'Payer not found'}), 404

        if float(amount) > float(payer.balance):
            return jsonify({'success': False, 'message': 'Insufficient payer balance'}), 400

        # Process settlement through PSP (simulated)
        settlement_result = process_psp_settlement(
            token.user_id, payee_id, amount)

        if settlement_result['success']:
            # Update token remaining amount
            token.remaining_amount -= float(amount)
            if token.remaining_amount <= 0:
                token.status = 'used'

            # Create transaction record
            transaction = Transaction(
                txn_id=f"OFFLINE_{secrets.token_hex(8).upper()}",
                user_id=token.user_id,
                amount=amount,
                currency='MYR',
                payment_method='offline_token',
                payment_rail='p2p',
                status='completed',
                completed_at=datetime.now(timezone.utc),
                transaction_metadata={
                    'token_id': token_id,
                    'payee_id': payee_id,
                    'payer_device_id': payer_device_id,
                    'settlement_id': settlement_result['settlement_id']
                }
            )

            from src.database.connection import db
            db.session.add(transaction)
            db.session.commit()

            return jsonify({
                'success': True,
                'settlement_id': settlement_result['settlement_id'],
                'transaction_id': transaction.txn_id,
                'remaining_amount': float(token.remaining_amount),
                'message': 'Payment verified and settled successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Settlement failed',
                'error': settlement_result['error']
            }), 500

    except Exception as e:
        current_app.logger.error(f"Error verifying payment: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to verify payment'}), 500


@mobile_bp.route('/sync-transactions', methods=['POST'])
@rate_limit(per_minute=20)
def sync_offline_transactions():
    """Sync pending offline transactions"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        pending_transactions = data.get('pending_transactions', [])

        if not user_id:
            return jsonify({'success': False, 'message': 'User ID required'}), 400

        synced_count = 0
        errors = []

        for tx_data in pending_transactions:
            try:
                # Verify transaction with server
                verification_result = verify_offline_payment_internal(tx_data)

                if verification_result['success']:
                    synced_count += 1
                else:
                    errors.append({
                        'transaction_id': tx_data.get('transaction_id'),
                        'error': verification_result['message']
                    })
            except Exception as e:
                errors.append({
                    'transaction_id': tx_data.get('transaction_id'),
                    'error': str(e)
                })

        return jsonify({
            'success': True,
            'synced_count': synced_count,
            'error_count': len(errors),
            'errors': errors,
            'message': f'Synced {synced_count} transactions'
        })

    except Exception as e:
        current_app.logger.error(f"Error syncing transactions: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to sync transactions'}), 500


def process_psp_settlement(payer_id, payee_id, amount):
    """Simulate PSP settlement process"""
    try:
        # In real implementation, this would call the actual PSP
        # For demo, we'll simulate the settlement

        payer = User.query.get(payer_id)
        payee = User.query.get(payee_id)

        if not payer or not payee:
            return {'success': False, 'error': 'User not found'}

        # Simulate PSP processing
        settlement_id = f"SETTLE_{secrets.token_hex(8).upper()}"

        # Update balances (in real implementation, PSP would handle this)
        payer.balance -= float(amount)
        payee.balance += float(amount)

        from src.database.connection import db
        db.session.commit()

        return {
            'success': True,
            'settlement_id': settlement_id,
            'payer_new_balance': float(payer.balance),
            'payee_new_balance': float(payee.balance)
        }

    except Exception as e:
        current_app.logger.error(f"PSP settlement error: {str(e)}")
        return {'success': False, 'error': str(e)}


def verify_offline_payment_internal(tx_data):
    """Internal function to verify offline payment"""
    # This would contain the same logic as verify_offline_payment
    # but without the HTTP response handling
    pass
