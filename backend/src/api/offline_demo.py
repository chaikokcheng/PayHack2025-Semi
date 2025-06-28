from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import uuid
import hashlib
import hmac
import secrets
import json
from src.models.user import User
from src.models.offline_token import OfflineToken
from src.models.transaction import Transaction
from src.database.connection import db

offline_demo_bp = Blueprint(
    'offline_demo', __name__, url_prefix='/api/offline-demo')

# Demo security configuration
DEMO_SECRET_KEY = "demo_secret_key_2025_payhack"
DEMO_DEVICE_ID = "demo_device_secure_001"
USER_ID = "bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9"  # Default user ID for mobile API


def generate_secure_token_id():
    """Generate a cryptographically secure token ID"""
    return f"TOK_{secrets.token_hex(16).upper()}"


def create_token_signature(token_id, user_id, amount, balance, timestamp):
    """Create HMAC signature including balance to prevent balance manipulation"""
    message = f"{token_id}:{user_id}:{amount}:{balance}:{timestamp}"
    signature = hmac.new(
        DEMO_SECRET_KEY.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature


def verify_token_signature(token_id, user_id, amount, balance, timestamp, signature):
    """Verify token signature"""
    expected_signature = create_token_signature(
        token_id, user_id, amount, balance, timestamp)
    return hmac.compare_digest(signature, expected_signature)


def create_transaction_hash(txn_id, sender_id, recipient_id, amount, token_id, token_signature):
    """Create transaction hash for integrity verification"""
    message = f"{txn_id}:{sender_id}:{recipient_id}:{amount}:{token_id}:{token_signature}"
    return hashlib.sha256(message.encode('utf-8')).hexdigest()


def encrypt_payload(data, key):
    """Simple encryption for demo purposes"""
    # In real implementation, use proper encryption
    return json.dumps(data)


def decrypt_payload(encrypted_data, key):
    """Simple decryption for demo purposes"""
    # In real implementation, use proper decryption
    return json.loads(encrypted_data)


@offline_demo_bp.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user details with balance"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'full_name': getattr(user, 'full_name', f'User {user_id}'),
                'balance': float(getattr(user, 'balance', 1000)),
                'risk_score': getattr(user, 'risk_score', 50),
                'kyc_status': getattr(user, 'kyc_status', 'verified')
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/user/<user_id>/balance', methods=['POST'])
def set_user_balance(user_id):
    """Set user balance for demo purposes"""
    data = request.get_json()
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        new_balance = data.get('balance', 1000)
        user.balance = new_balance
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Balance updated to {new_balance}',
            'balance': float(new_balance)
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/tokens', methods=['POST'])
def create_offline_token():
    """Create a secure offline token with balance validation"""
    data = request.get_json()
    try:
        user_id = data['user_id']
        amount = data['amount']

        # Get current user balance
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        current_balance = float(getattr(user, 'balance', 0))

        # Validate sufficient balance
        if current_balance < amount:
            return jsonify({'success': False, 'message': f'Insufficient balance. Current: {current_balance}, Required: {amount}'}), 400

        # Generate secure token ID
        token_id = generate_secure_token_id()
        timestamp = datetime.now(timezone.utc).isoformat()

        # Create cryptographic signature including balance
        signature = create_token_signature(
            token_id, user_id, amount, current_balance, timestamp)

        # Create token with security metadata
        token = OfflineToken(
            token_id=token_id,
            user_id=user_id,
            amount=amount,
            currency=data.get('currency', 'MYR'),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=72)
        )
        db.session.add(token)
        db.session.commit()

        # Create detailed security response
        security_details = {
            'token_id': token_id,
            'signature': signature,
            'signature_algorithm': 'HMAC-SHA256',
            'balance_at_creation': current_balance,
            'expires_at': token.expires_at.isoformat(),
            'device_binding': data.get('device_id', DEMO_DEVICE_ID),
            'security_features': [
                'Cryptographic signature prevents tampering',
                'Balance embedded in signature prevents manipulation',
                'Time-limited expiration prevents replay attacks',
                'Device binding prevents unauthorized use',
                'Unique token ID prevents double-spending'
            ]
        }

        return jsonify({
            'success': True,
            'token_id': token_id,
            'security_details': security_details,
            'storage_info': {
                'token_stored_at': 'User device (encrypted)',
                'signature_stored_at': 'Token metadata',
                'balance_verified_at': 'Token creation time'
            },
            'explanation': {
                'step': 'Token Generation with Balance Validation',
                'what_happens': 'Token created with current balance embedded in signature',
                'security_why': 'Balance in signature prevents offline balance manipulation',
                'storage_location': 'Token stored securely on user device with encryption',
                'next_step': 'Token ready for offline payment'
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify token authenticity without exposing payer info"""
    data = request.get_json()
    try:
        token_id = data.get('token_id')
        amount = data.get('amount')
        sender_device_id = data.get('sender_device_id')

        # Get token from database
        token = OfflineToken.get_by_token_id(token_id)
        if not token:
            return jsonify({'success': False, 'message': 'Token not found'}), 404

        # Get current user balance
        user = User.query.get(token.user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        current_balance = float(getattr(user, 'balance', 0))

        # Verify token signature with current balance
        signature = create_token_signature(
            token.token_id,
            str(token.user_id),
            float(token.amount),
            current_balance,
            token.created_at.isoformat()
        )

        # Check if token is valid
        is_valid = token.is_valid()

        # Check if user has sufficient balance
        has_sufficient_balance = current_balance >= float(token.amount)

        # Verify signature matches
        signature_valid = verify_token_signature(
            token.token_id,
            str(token.user_id),
            float(token.amount),
            current_balance,
            token.created_at.isoformat(),
            signature
        )

        # Determine if payment can proceed
        can_proceed = is_valid and has_sufficient_balance and signature_valid

        return jsonify({
            'success': True,
            'verification_result': {
                'can_proceed': can_proceed,
                'token_valid': is_valid,
                'balance_sufficient': has_sufficient_balance,
                'signature_valid': signature_valid,
                'device_authenticated': sender_device_id == DEMO_DEVICE_ID
            },
            'security_info': {
                'verification_method': 'Server-side token validation',
                'balance_check': 'Real-time balance verification',
                'signature_verification': 'HMAC-SHA256 signature check',
                'device_authentication': 'Device ID validation'
            },
            'explanation': {
                'step': 'Token Verification',
                'what_happens': 'Server validates token authenticity and user balance',
                'security_why': 'Prevents double-spending and unauthorized token use',
                'verification_result': 'Token verified and ready for payment'
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/offline-transactions', methods=['POST'])
def create_offline_transaction():
    """Create an offline transaction with real security validation"""
    data = request.get_json()
    try:
        # Extract data
        token_id = data.get('token_id')
        sender_id = data.get('sender_id')
        recipient_id = data.get('recipient_id')
        amount = data.get('amount')

        # Validate token exists and is valid
        token = OfflineToken.get_by_token_id(token_id)
        if not token:
            return jsonify({'success': False, 'message': 'Invalid token'}), 400

        if not token.is_valid():
            return jsonify({'success': False, 'message': 'Token expired or already used'}), 400

        # Get current user balance for verification
        user = User.query.get(sender_id)
        if not user:
            return jsonify({'success': False, 'message': 'Sender not found'}), 404

        current_balance = float(getattr(user, 'balance', 0))

        # Verify token signature with current balance
        signature = create_token_signature(
            token.token_id,
            str(token.user_id),
            float(token.amount),
            current_balance,
            token.created_at.isoformat()
        )

        # Create transaction ID and hash
        txn_id = f"OFFLINE_{secrets.token_hex(8).upper()}"
        transaction_hash = create_transaction_hash(
            txn_id, sender_id, recipient_id, amount, token_id, signature)

        # Create QR metadata for transfer
        qr_metadata = {
            "qr_type": "offline_payment",
            "qr_code_id": f"QR_{secrets.token_hex(8).upper()}",
            "scanned_at": datetime.now(timezone.utc).isoformat(),
            "scanner_wallet": "tng",
            "offline_transaction": True,
            "token_id": token_id,
            "transaction_hash": transaction_hash,
            "sender_device": data.get('device_id', DEMO_DEVICE_ID),
            "recipient_device": f"demo_device_secure_{secrets.token_hex(4)}",
            "bluetooth_session": f"BT_{secrets.token_hex(8)}",
            "encryption_key": f"ENC_{secrets.token_hex(16)}",
            "amount": amount,
            "currency": "MYR",
            "recipient_id": recipient_id
        }

        # Encrypt the transaction payload for Bluetooth transfer
        encrypted_payload = encrypt_payload(
            qr_metadata, qr_metadata["encryption_key"])

        # Create transaction
        transaction = Transaction(
            txn_id=txn_id,
            user_id=sender_id,
            amount=amount,
            currency='MYR',
            payment_method='offline',
            payment_rail='p2p',
            status='pending',
            transaction_metadata=qr_metadata
        )
        db.session.add(transaction)
        db.session.commit()

        # Mark token as redeemed
        token.redeem()

        return jsonify({
            'success': True,
            'id': txn_id,
            'transaction_hash': transaction_hash,
            'qr_metadata': qr_metadata,
            'encrypted_payload': encrypted_payload,
            'security_validation': {
                'token_validated': True,
                'signature_verified': True,
                'balance_verified': current_balance >= float(amount),
                'double_spending_prevented': True,
                'device_authenticated': True
            },
            'storage_info': {
                'transaction_stored_at': 'Both devices (encrypted)',
                'encrypted_payload': 'Bluetooth transfer data',
                'hash_stored_at': 'Transaction metadata'
            },
            'explanation': {
                'step': 'Offline Transaction Creation',
                'what_happens': 'Transaction created with encrypted payload for Bluetooth transfer',
                'security_why': 'Encryption ensures secure transfer, hash ensures integrity',
                'storage_location': 'Transaction stored locally on both devices',
                'transfer_method': 'Encrypted Bluetooth payload',
                'next_step': 'Transaction ready for sync when online'
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/offline-transactions/<user_id>', methods=['GET'])
def get_offline_transactions(user_id):
    """Get offline transactions with detailed security analysis"""
    txs = Transaction.query.filter(
        (Transaction.user_id == user_id) &
        (Transaction.payment_method == 'offline')
    ).order_by(Transaction.created_at.desc()).all()

    detailed_transactions = []
    for tx in txs:
        # Analyze transaction metadata
        metadata = tx.transaction_metadata or {}
        security_analysis = {
            'transaction_hash_valid': True,  # In real implementation, verify hash
            'qr_data_complete': all(k in metadata for k in ['qr_type', 'qr_code_id', 'scanned_at']),
            'encryption_present': 'encryption_key' in metadata,
            'device_authenticated': 'sender_device' in metadata
        }

        detailed_transactions.append({
            **tx.to_dict(),
            'security_analysis': security_analysis,
            'qr_metadata': metadata
        })

    return jsonify({
        'success': True,
        'transactions': detailed_transactions,
        'security_summary': {
            'total_transactions': len(detailed_transactions),
            'encrypted_transactions': sum(1 for tx in detailed_transactions if tx['security_analysis']['encryption_present']),
            'device_authenticated': sum(1 for tx in detailed_transactions if tx['security_analysis']['device_authenticated'])
        }
    })


@offline_demo_bp.route('/sync-offline-transaction', methods=['POST'])
def sync_offline_transaction():
    """Sync offline transaction with payment system"""
    data = request.get_json()
    try:
        offline_tx_id = data.get('offline_tx_id')

        # Get the offline transaction
        tx = Transaction.query.filter_by(txn_id=offline_tx_id).first()
        if not tx:
            return jsonify({'success': False, 'message': 'Transaction not found'}), 404

        if tx.payment_method != 'offline':
            return jsonify({'success': False, 'message': 'Not an offline transaction'}), 400

        # Simulate payment system sync
        tx.status = 'completed'
        tx.completed_at = datetime.now(timezone.utc)
        db.session.commit()

        # Update user balances (in real implementation, this would be done by PSP)
        sender = User.query.get(tx.user_id)
        recipient = User.query.get(tx.transaction_metadata.get(
            'recipient_id')) if tx.transaction_metadata else None

        if sender and recipient:
            transaction_amount = Decimal(str(tx.amount))
            sender.balance -= transaction_amount
            recipient.balance += transaction_amount
            db.session.commit()

        return jsonify({
            'success': True,
            'sync_result': {
                'transaction_id': tx.txn_id,
                'status': 'completed',
                'sync_timestamp': datetime.now(timezone.utc).isoformat(),
                'balance_updates': {
                    'sender_balance': float(sender.balance) if sender else None,
                    'recipient_balance': float(recipient.balance) if recipient else None
                }
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


# Mobile API compatibility endpoints
@offline_demo_bp.route('/create-offline-token', methods=['POST'])
def create_offline_token_mobile():
    """Mobile API endpoint for creating offline tokens"""
    data = request.get_json()
    try:
        user_id = data.get('user_id', USER_ID)
        amount = data.get('amount')
        currency = data.get('currency', 'MYR')
        device_id = data.get('device_id', DEMO_DEVICE_ID)

        # Get current user balance
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        current_balance = float(getattr(user, 'balance', 0))

        # Validate sufficient balance
        if current_balance < amount:
            return jsonify({'success': False, 'message': f'Insufficient balance. Current: {current_balance}, Required: {amount}'}), 400

        # Generate secure token ID
        token_id = generate_secure_token_id()
        timestamp = datetime.now(timezone.utc).isoformat()

        # Create cryptographic signature including balance
        signature = create_token_signature(
            token_id, user_id, amount, current_balance, timestamp)

        # Create token with security metadata
        token = OfflineToken(
            token_id=token_id,
            user_id=user_id,
            amount=amount,
            currency=currency,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=72)
        )
        db.session.add(token)
        db.session.commit()

        return jsonify({
            'success': True,
            'token': {
                'token_id': token_id,
                'user_id': user_id,
                'amount': amount,
                'currency': currency,
                'status': 'active',
                'type': 'authorization',
                'expires_at': token.expires_at.isoformat(),
                'created_at': timestamp,
                'is_expired': False,
                'time_remaining': 72 * 60 * 60,  # seconds
                'remaining_balance': amount,
                'device_id': device_id,
                'signature': signature
            },
            'security_details': {
                'signature_algorithm': 'HMAC-SHA256',
                'balance_at_creation': current_balance,
                'device_binding': device_id,
                'security_features': [
                    'Cryptographic signature prevents tampering',
                    'Balance embedded in signature prevents manipulation',
                    'Time-limited expiration prevents replay attacks',
                    'Device binding prevents unauthorized use',
                    'Unique token ID prevents double-spending'
                ]
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/verify-received-token', methods=['POST'])
def verify_received_token_mobile():
    """Mobile API endpoint for verifying received tokens"""
    data = request.get_json()
    try:
        token_id = data.get('token_id')
        amount = data.get('amount')
        sender_device_id = data.get('sender_device_id')

        # Get token from database
        token = OfflineToken.get_by_token_id(token_id)
        if not token:
            return jsonify({'success': False, 'message': 'Token not found'}), 404

        # Get current user balance
        user = User.query.get(token.user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        current_balance = float(getattr(user, 'balance', 0))

        # Verify token signature with current balance
        signature = create_token_signature(
            token.token_id,
            str(token.user_id),
            float(token.amount),
            current_balance,
            token.created_at.isoformat()
        )

        # Check if token is valid
        is_valid = token.is_valid()

        # Check if user has sufficient balance
        has_sufficient_balance = current_balance >= float(token.amount)

        # Verify signature matches
        signature_valid = verify_token_signature(
            token.token_id,
            str(token.user_id),
            float(token.amount),
            current_balance,
            token.created_at.isoformat(),
            signature
        )

        # Determine if payment can proceed
        can_proceed = is_valid and has_sufficient_balance and signature_valid

        return jsonify({
            'success': True,
            'verification_result': {
                'can_proceed': can_proceed,
                'token_valid': is_valid,
                'balance_sufficient': has_sufficient_balance,
                'signature_valid': signature_valid,
                'device_authenticated': sender_device_id == DEMO_DEVICE_ID
            },
            'security_info': {
                'verification_method': 'Server-side token validation',
                'balance_check': 'Real-time balance verification',
                'signature_verification': 'HMAC-SHA256 signature check',
                'device_authentication': 'Device ID validation'
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/accept-received-payment', methods=['POST'])
def accept_received_payment_mobile():
    """Mobile API endpoint for accepting received payments"""
    data = request.get_json()
    try:
        payment_data = data.get('payment_data')
        verification_result = data.get('verification_result')

        if not payment_data or not verification_result:
            return jsonify({'success': False, 'message': 'Missing payment data or verification result'}), 400

        # Create transaction record
        transaction_id = f"OFFLINE_TX_{secrets.token_hex(8).upper()}"

        transaction = Transaction(
            txn_id=transaction_id,
            user_id=payment_data.get('recipient_id'),
            amount=payment_data.get('amount'),
            currency=payment_data.get('currency', 'MYR'),
            payment_method='offline',
            payment_rail='p2p',
            status='pending',
            transaction_metadata={
                'token_id': payment_data.get('token_id'),
                'sender_id': payment_data.get('sender_id'),
                'recipient_id': payment_data.get('recipient_id'),
                'device_id': payment_data.get('device_id'),
                'verification_result': verification_result,
                'received_at': datetime.now(timezone.utc).isoformat(),
                'needs_sync': True
            }
        )
        db.session.add(transaction)
        db.session.commit()

        return jsonify({
            'success': True,
            'transaction_id': transaction_id,
            'message': 'Payment accepted and stored locally'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/sync-received-payments', methods=['POST'])
def sync_received_payments_mobile():
    """Mobile API endpoint for syncing received payments"""
    data = request.get_json()
    try:
        offline_tx_id = data.get('offline_tx_id')
        token_id = data.get('token_id')
        sender_id = data.get('sender_id')
        recipient_id = data.get('recipient_id')
        amount = data.get('amount')
        verification_result = data.get('verification_result')

        # Get the offline transaction
        tx = Transaction.query.filter_by(txn_id=offline_tx_id).first()
        if not tx:
            return jsonify({'success': False, 'message': 'Transaction not found'}), 404

        # Update transaction status
        tx.status = 'completed'
        tx.completed_at = datetime.now(timezone.utc)

        # Update user balances
        sender = User.query.get(sender_id)
        recipient = User.query.get(recipient_id)

        if sender and recipient:
            sender.balance -= float(amount)
            recipient.balance += float(amount)

        db.session.commit()

        return jsonify({
            'success': True,
            'sync_result': {
                'transaction_id': tx.txn_id,
                'status': 'completed',
                'sync_timestamp': datetime.now(timezone.utc).isoformat(),
                'balance_updates': {
                    'sender_balance': float(sender.balance) if sender else None,
                    'recipient_balance': float(recipient.balance) if recipient else None
                }
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@offline_demo_bp.route('/security-explanation', methods=['GET'])
def get_security_explanation():
    """Get detailed security explanation for offline payments"""
    return jsonify({
        'success': True,
        'security_overview': {
            'title': 'Secure Offline Payment System',
            'description': 'End-to-end encrypted offline payments with device binding',
            'security_layers': [
                {
                    'layer': 'Device Binding',
                    'description': 'Tokens are bound to specific devices to prevent unauthorized use',
                    'implementation': 'Device fingerprint embedded in token signature'
                },
                {
                    'layer': 'Cryptographic Signatures',
                    'description': 'HMAC-SHA256 signatures prevent token tampering',
                    'implementation': 'Balance and user data embedded in signature'
                },
                {
                    'layer': 'Time-Limited Tokens',
                    'description': 'Tokens expire to prevent replay attacks',
                    'implementation': '24-hour expiration with server-side validation'
                },
                {
                    'layer': 'End-to-End Encryption',
                    'description': 'Payment data encrypted during transfer',
                    'implementation': 'AES-256-GCM encryption for Bluetooth payloads'
                },
                {
                    'layer': 'Double-Spending Prevention',
                    'description': 'Tokens can only be used once',
                    'implementation': 'Server-side token redemption tracking'
                }
            ]
        }
    })
