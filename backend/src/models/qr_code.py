"""
QR Code model for SatuPay Payment Switch
"""

import uuid
import base64
import qrcode
from io import BytesIO
from datetime import datetime, timedelta, timezone
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class QRCode(db.Model):
    """QR Code model for QR code management"""
    
    __tablename__ = 'qr_codes'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    qr_code_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    qr_type = db.Column(db.String(50), nullable=False)  # merchant, tng, boost, dynamic
    merchant_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Numeric(15, 2), nullable=True)  # None for dynamic QR
    currency = db.Column(db.String(3), default='MYR')
    payload = db.Column(JSON, nullable=False)
    qr_image_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='active')  # active, scanned, expired, cancelled
    scanned_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    transactions = db.relationship('Transaction', backref='qr_code', lazy='dynamic')
    
    def __repr__(self):
        return f'<QRCode {self.qr_code_id} - {self.qr_type}>'
    
    @staticmethod
    def utc_now():
        """Get current UTC time as timezone-aware datetime"""
        return datetime.now(timezone.utc)
    
    def to_dict(self):
        """Convert QR code to dictionary"""
        return {
            'id': str(self.id),
            'qr_code_id': self.qr_code_id,
            'qr_type': self.qr_type,
            'merchant_id': self.merchant_id,
            'amount': float(self.amount) if self.amount else None,
            'currency': self.currency,
            'payload': self.payload,
            'qr_image_url': self.qr_image_url,
            'status': self.status,
            'scanned_at': self.scanned_at.isoformat() if self.scanned_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_expired': self.is_expired(),
            'time_remaining': self.get_time_remaining()
        }
    
    @classmethod
    def generate_qr_id(cls):
        """Generate a unique QR code ID"""
        timestamp = cls.utc_now().strftime('%Y%m%d%H%M%S')
        unique_id = str(uuid.uuid4())[:8].upper()
        return f"QR_{timestamp}_{unique_id}"
    
    @classmethod
    def create_merchant_qr(cls, merchant_id, amount=None, currency='MYR', expires_in_minutes=15):
        """Create a merchant QR code"""
        qr_code_id = cls.generate_qr_id()
        
        # Create QR payload based on EMV QR Code specification (simplified)
        payload = {
            'version': '01',
            'point_of_initiation': '11' if amount else '12',  # Static or dynamic
            'merchant_account_info': {
                'guid': '0002',
                'merchant_id': merchant_id
            },
            'merchant_category_code': '5812',  # Restaurant
            'transaction_currency': '458',  # MYR
            'transaction_amount': str(amount) if amount else None,
            'country_code': 'MY',
            'merchant_name': 'SatuPay Merchant',
            'merchant_city': 'Kuala Lumpur',
            'additional_data': {
                'bill_number': qr_code_id,
                'store_label': merchant_id
            }
        }
        
        qr_code = cls(
            qr_code_id=qr_code_id,
            qr_type='merchant',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=cls.utc_now() + timedelta(minutes=expires_in_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    @classmethod
    def create_tng_qr(cls, merchant_id, amount, currency='MYR', expires_in_minutes=15):
        """Create a TNG-style QR code for demo"""
        qr_code_id = cls.generate_qr_id()
        
        # TNG QR code format (simplified for demo)
        payload = {
            'qr_type': 'tng',
            'version': '1.0',
            'merchant_id': merchant_id,
            'amount': str(amount),
            'currency': currency,
            'timestamp': cls.utc_now().isoformat(),
            'ref_id': qr_code_id,
            'wallet_type': 'tng',
            'routing_info': {
                'accepts': ['tng', 'boost', 'grabpay'],  # Cross-wallet compatibility
                'preferred_route': 'tng'
            }
        }
        
        qr_code = cls(
            qr_code_id=qr_code_id,
            qr_type='tng',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=cls.utc_now() + timedelta(minutes=expires_in_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    @classmethod
    def create_boost_qr(cls, merchant_id, amount, currency='MYR', expires_in_minutes=15):
        """Create a Boost-style QR code for demo"""
        qr_code_id = cls.generate_qr_id()
        
        # Boost QR code format (simplified for demo)
        payload = {
            'qr_type': 'boost',
            'version': '2.1',
            'merchant_id': merchant_id,
            'amount': str(amount),
            'currency': currency,
            'timestamp': cls.utc_now().isoformat(),
            'transaction_ref': qr_code_id,
            'wallet_type': 'boost',
            'routing_info': {
                'accepts': ['boost', 'tng', 'grabpay'],
                'preferred_route': 'boost'
            }
        }
        
        qr_code = cls(
            qr_code_id=qr_code_id,
            qr_type='boost',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=cls.utc_now() + timedelta(minutes=expires_in_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    def is_expired(self):
        """Check if QR code is expired"""
        current_time = self.utc_now()
        expires_at = self.expires_at
        
        # Handle timezone-naive expires_at by assuming it's UTC
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        return current_time > expires_at
    
    def is_valid_for_scan(self):
        """Check if QR code is valid for scanning"""
        return self.status == 'active' and not self.is_expired()
    
    def mark_as_scanned(self):
        """Mark QR code as scanned"""
        self.status = 'scanned'
        self.scanned_at = self.utc_now()
        db.session.commit()
        return True
    
    def get_time_remaining(self):
        """Get time remaining until expiry in seconds"""
        if self.is_expired():
            return 0
        
        current_time = self.utc_now()
        expires_at = self.expires_at
        
        # Handle timezone-naive expires_at by assuming it's UTC
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        remaining = expires_at - current_time
        return int(remaining.total_seconds())
    
    @classmethod
    def get_by_qr_id(cls, qr_code_id):
        """Get QR code by QR code ID"""
        return cls.query.filter_by(qr_code_id=qr_code_id).first()
    
    @classmethod
    def get_merchant_qrs(cls, merchant_id, status=None):
        """Get QR codes for a merchant"""
        query = cls.query.filter_by(merchant_id=merchant_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(cls.created_at.desc()).all()
    
    @classmethod
    def get_active_qrs(cls):
        """Get all active QR codes"""
        return cls.query.filter_by(status='active').all()
    
    @classmethod
    def cleanup_expired_qrs(cls):
        """Mark expired QR codes as expired"""
        current_time = cls.utc_now()
        expired_qrs = cls.query.filter(
            cls.status == 'active',
            cls.expires_at < current_time
        ).all()
        
        count = 0
        for qr in expired_qrs:
            qr.status = 'expired'
            count += 1
        
        if count > 0:
            db.session.commit()
        
        return count
    
    @classmethod
    def get_qr_stats(cls):
        """Get QR code statistics"""
        total = cls.query.count()
        active = cls.query.filter_by(status='active').count()
        scanned = cls.query.filter_by(status='scanned').count()
        expired = cls.query.filter_by(status='expired').count()
        
        # Get stats by type
        type_stats = db.session.query(
            cls.qr_type,
            db.func.count(cls.id).label('count')
        ).group_by(cls.qr_type).all()
        
        type_breakdown = {stat.qr_type: stat.count for stat in type_stats}
        
        # Calculate scan rate
        scan_rate = (scanned / total * 100) if total > 0 else 0
        
        return {
            'total_qr_codes': total,
            'active': active,
            'scanned': scanned,
            'expired': expired,
            'scan_rate': round(scan_rate, 2),
            'by_type': type_breakdown
        } 