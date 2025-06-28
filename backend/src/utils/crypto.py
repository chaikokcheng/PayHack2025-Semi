"""
Cryptographic utilities for offline payment security
Handles token signing, verification, and secure payload creation
"""

import hmac
import hashlib
import secrets
import json
import os
from base64 import b64encode, b64decode
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

# Server's private key for signing tokens (in production, use proper key management)
SERVER_PRIVATE_KEY = None
SERVER_PUBLIC_KEY = None


def initialize_crypto():
    """Initialize cryptographic keys"""
    global SERVER_PRIVATE_KEY, SERVER_PUBLIC_KEY

    # Generate RSA key pair if not exists
    if SERVER_PRIVATE_KEY is None:
        SERVER_PRIVATE_KEY = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        SERVER_PUBLIC_KEY = SERVER_PRIVATE_KEY.public_key()


def generate_signature(data):
    """Generate cryptographic signature for data"""
    initialize_crypto()

    # Create signature using RSA
    signature = SERVER_PRIVATE_KEY.sign(
        data.encode('utf-8'),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    return b64encode(signature).decode('utf-8')


def verify_signature(data, signature):
    """Verify cryptographic signature"""
    initialize_crypto()

    try:
        signature_bytes = b64decode(signature.encode('utf-8'))
        SERVER_PUBLIC_KEY.verify(
            signature_bytes,
            data.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False


def generate_device_fingerprint(device_info):
    """Generate unique device fingerprint"""
    device_string = f"{device_info.get('model', '')}-{device_info.get('platform', '')}-{device_info.get('uniqueId', '')}"
    return hashlib.sha256(device_string.encode()).hexdigest()


def create_secure_payment_payload(token_data, amount, recipient_id, device_id, nonce=None):
    """Create secure payment payload with cryptographic protection"""
    if nonce is None:
        nonce = secrets.token_hex(16)

    payload = {
        'token_id': token_data['token_id'],
        'amount': amount,
        'recipient_id': recipient_id,
        'payer_device_id': device_id,
        'nonce': nonce,
        'timestamp': int(os.urandom(4).hex(), 16),  # Random timestamp
        'token_signature': token_data['signature'],
        'payload_hash': token_data['payload_hash']
    }

    # Create payload signature
    payload_string = json.dumps(payload, sort_keys=True)
    payload_signature = generate_signature(payload_string)

    return {
        'payload': payload,
        'signature': payload_signature,
        'encrypted': False  # For demo, we'll use plain text with signature
    }


def verify_payment_payload(payload_data, signature):
    """Verify payment payload integrity"""
    try:
        payload_string = json.dumps(payload_data['payload'], sort_keys=True)
        return verify_signature(payload_string, signature)
    except Exception:
        return False


def encrypt_payment_data(data, session_key):
    """Encrypt payment data for Bluetooth transmission"""
    # Generate encryption key from session key
    key = hashlib.sha256(session_key.encode()).digest()
    iv = os.urandom(16)

    # Encrypt data
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv),
                    backend=default_backend())
    encryptor = cipher.encryptor()

    # Pad data to block size
    data_bytes = json.dumps(data).encode()
    padded_data = data_bytes + b'\0' * (16 - len(data_bytes) % 16)
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()

    return {
        'encrypted_data': b64encode(encrypted_data).decode(),
        'iv': b64encode(iv).decode(),
        'session_key_hash': hashlib.sha256(session_key.encode()).hexdigest()
    }


def decrypt_payment_data(encrypted_data, session_key):
    """Decrypt payment data from Bluetooth transmission"""
    try:
        # Generate decryption key from session key
        key = hashlib.sha256(session_key.encode()).digest()
        iv = b64decode(encrypted_data['iv'].encode())
        data = b64decode(encrypted_data['encrypted_data'].encode())

        # Decrypt data
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv),
                        backend=default_backend())
        decryptor = cipher.decryptor()
        decrypted_data = decryptor.update(data) + decryptor.finalize()

        # Remove padding
        decrypted_data = decrypted_data.rstrip(b'\0')
        return json.loads(decrypted_data.decode())
    except Exception:
        return None


def generate_session_key():
    """Generate secure session key for Bluetooth communication"""
    return secrets.token_hex(32)


def create_token_payload_hash(token_data):
    """Create hash of token payload for integrity checking"""
    payload_string = json.dumps(token_data, sort_keys=True)
    return hashlib.sha256(payload_string.encode()).hexdigest()
