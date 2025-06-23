"""
QR Code model for PinkPay Payment Switch
"""

import uuid
import secrets
from datetime import datetime, timedelta
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class QRCode(db.Model):
    """QR Code model for QR code management"""
    
    __tablename__ = 'qr_codes'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    qr_code_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    qr_type = db.Column(db.String(50), nullable=False)  # merchant, payment, transfer, tng, boost
    merchant_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Numeric(15, 2), nullable=True)  # Can be null for dynamic amount QR
    currency = db.Column(db.String(3), default='MYR')
    payload = db.Column(JSON, nullable=False)  # QR code data payload
    qr_image_url = db.Column(db.Text, nullable=True)  # URL to QR code image
    status = db.Column(db.String(20), default='active')  # active, scanned, expired, cancelled
    scanned_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='qr_code', lazy='dynamic')
    
    def __repr__(self):
        return f'<QRCode {self.qr_code_id} - {self.qr_type}>'
    
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
    def generate_qr_id(cls, prefix='QR'):
        """Generate a unique QR code ID"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_part = secrets.token_hex(8).upper()
        return f"{prefix}_{timestamp}_{random_part}"
    
    @classmethod
    def create_merchant_qr(cls, merchant_id, amount=None, currency='MYR', expiry_minutes=15):
        """Create a merchant QR code"""
        qr_id = cls.generate_qr_id('MERCH')
        
        payload = {
            'type': 'merchant_payment',
            'merchant_id': merchant_id,
            'amount': float(amount) if amount else None,
            'currency': currency,
            'created_at': datetime.utcnow().isoformat()
        }
        
        qr_code = cls(
            qr_code_id=qr_id,
            qr_type='merchant',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=datetime.utcnow() + timedelta(minutes=expiry_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    @classmethod
    def create_tng_qr(cls, merchant_id, amount, currency='MYR', expiry_minutes=15):
        """Create a TNG-style QR code for demo"""
        qr_id = cls.generate_qr_id('TNG')
        
        payload = {
            'type': 'tng_payment',
            'merchant_id': merchant_id,
            'amount': float(amount),
            'currency': currency,
            'qr_format': 'tng_standard',
            'created_at': datetime.utcnow().isoformat()
        }
        
        qr_code = cls(
            qr_code_id=qr_id,
            qr_type='tng',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=datetime.utcnow() + timedelta(minutes=expiry_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    @classmethod
    def create_boost_qr(cls, user_id, amount=None, currency='MYR', expiry_minutes=15):
        """Create a Boost-style QR code for demo"""
        qr_id = cls.generate_qr_id('BOOST')
        
        payload = {
            'type': 'boost_payment',
            'user_id': str(user_id),
            'amount': float(amount) if amount else None,
            'currency': currency,
            'qr_format': 'boost_standard',
            'created_at': datetime.utcnow().isoformat()
        }
        
        qr_code = cls(
            qr_code_id=qr_id,
            qr_type='boost',
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=datetime.utcnow() + timedelta(minutes=expiry_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    def is_expired(self):
        """Check if QR code is expired"""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self):
        """Check if QR code is valid for scanning"""
        return (
            self.status == 'active' and 
            not self.is_expired()
        )
    
    def scan(self):
        """Mark QR code as scanned"""
        if not self.is_valid():
            raise ValueError("QR code is not valid for scanning")
        
        self.status = 'scanned'
        self.scanned_at = datetime.utcnow()
        db.session.commit()
        return True
    
    def get_time_remaining(self):
        """Get time remaining until expiry in seconds"""
        if self.is_expired():
            return 0
        
        remaining = self.expires_at - datetime.utcnow()
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
        expired_qrs = cls.query.filter(
            cls.status == 'active',
            cls.expires_at < datetime.utcnow()
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
        
        # Calculate scan rate
        scan_rate = (scanned / total * 100) if total > 0 else 0
        
        # Get stats by type
        type_stats = db.session.query(
            cls.qr_type,
            db.func.count(cls.id).label('count')
        ).group_by(cls.qr_type).all()
        
        type_breakdown = {stat.qr_type: stat.count for stat in type_stats}
        
        return {
            'total_qr_codes': total,
            'active': active,
            'scanned': scanned,
            'expired': expired,
            'scan_rate': round(scan_rate, 2),
            'type_breakdown': type_breakdown
        } 
QR Code model for PinkPay Payment Switch
"""

import uuid
import secrets
from datetime import datetime, timedelta
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class QRCode(db.Model):
    """QR Code model for QR code management"""
    
    __tablename__ = 'qr_codes'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    qr_code_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    qr_type = db.Column(db.String(50), nullable=False)  # merchant, payment, transfer, tng, boost
    merchant_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Numeric(15, 2), nullable=True)  # Can be null for dynamic amount QR
    currency = db.Column(db.String(3), default='MYR')
    payload = db.Column(JSON, nullable=False)  # QR code data payload
    qr_image_url = db.Column(db.Text, nullable=True)  # URL to QR code image
    status = db.Column(db.String(20), default='active')  # active, scanned, expired, cancelled
    scanned_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='qr_code', lazy='dynamic')
    
    def __repr__(self):
        return f'<QRCode {self.qr_code_id} - {self.qr_type}>'
    
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
    def generate_qr_id(cls, prefix='QR'):
        """Generate a unique QR code ID"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_part = secrets.token_hex(8).upper()
        return f"{prefix}_{timestamp}_{random_part}"
    
    @classmethod
    def create_merchant_qr(cls, merchant_id, amount=None, currency='MYR', expiry_minutes=15):
        """Create a merchant QR code"""
        qr_id = cls.generate_qr_id('MERCH')
        
        payload = {
            'type': 'merchant_payment',
            'merchant_id': merchant_id,
            'amount': float(amount) if amount else None,
            'currency': currency,
            'created_at': datetime.utcnow().isoformat()
        }
        
        qr_code = cls(
            qr_code_id=qr_id,
            qr_type='merchant',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=datetime.utcnow() + timedelta(minutes=expiry_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    @classmethod
    def create_tng_qr(cls, merchant_id, amount, currency='MYR', expiry_minutes=15):
        """Create a TNG-style QR code for demo"""
        qr_id = cls.generate_qr_id('TNG')
        
        payload = {
            'type': 'tng_payment',
            'merchant_id': merchant_id,
            'amount': float(amount),
            'currency': currency,
            'qr_format': 'tng_standard',
            'created_at': datetime.utcnow().isoformat()
        }
        
        qr_code = cls(
            qr_code_id=qr_id,
            qr_type='tng',
            merchant_id=merchant_id,
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=datetime.utcnow() + timedelta(minutes=expiry_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    @classmethod
    def create_boost_qr(cls, user_id, amount=None, currency='MYR', expiry_minutes=15):
        """Create a Boost-style QR code for demo"""
        qr_id = cls.generate_qr_id('BOOST')
        
        payload = {
            'type': 'boost_payment',
            'user_id': str(user_id),
            'amount': float(amount) if amount else None,
            'currency': currency,
            'qr_format': 'boost_standard',
            'created_at': datetime.utcnow().isoformat()
        }
        
        qr_code = cls(
            qr_code_id=qr_id,
            qr_type='boost',
            amount=amount,
            currency=currency,
            payload=payload,
            expires_at=datetime.utcnow() + timedelta(minutes=expiry_minutes)
        )
        
        db.session.add(qr_code)
        db.session.commit()
        return qr_code
    
    def is_expired(self):
        """Check if QR code is expired"""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self):
        """Check if QR code is valid for scanning"""
        return (
            self.status == 'active' and 
            not self.is_expired()
        )
    
    def scan(self):
        """Mark QR code as scanned"""
        if not self.is_valid():
            raise ValueError("QR code is not valid for scanning")
        
        self.status = 'scanned'
        self.scanned_at = datetime.utcnow()
        db.session.commit()
        return True
    
    def get_time_remaining(self):
        """Get time remaining until expiry in seconds"""
        if self.is_expired():
            return 0
        
        remaining = self.expires_at - datetime.utcnow()
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
        expired_qrs = cls.query.filter(
            cls.status == 'active',
            cls.expires_at < datetime.utcnow()
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
        
        # Calculate scan rate
        scan_rate = (scanned / total * 100) if total > 0 else 0
        
        # Get stats by type
        type_stats = db.session.query(
            cls.qr_type,
            db.func.count(cls.id).label('count')
        ).group_by(cls.qr_type).all()
        
        type_breakdown = {stat.qr_type: stat.count for stat in type_stats}
        
        return {
            'total_qr_codes': total,
            'active': active,
            'scanned': scanned,
            'expired': expired,
            'scan_rate': round(scan_rate, 2),
            'type_breakdown': type_breakdown
        } 