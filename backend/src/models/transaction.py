"""
Transaction model for SatuPay Payment Switch
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db


class Transaction(db.Model):
    """Transaction model for payment transactions"""

    __tablename__ = 'transactions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    txn_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    user_id = db.Column(UUID(as_uuid=True),
                        db.ForeignKey('users.id'), nullable=True)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    currency = db.Column(db.String(3), default='MYR')
    original_amount = db.Column(db.Numeric(
        15, 2), nullable=True)  # Before FX conversion
    original_currency = db.Column(db.String(3), nullable=True)
    merchant_id = db.Column(db.String(100), nullable=True)
    merchant_name = db.Column(db.String(255), nullable=True)
    # qr, nfc, online, etc.
    payment_method = db.Column(db.String(50), nullable=False)
    # duitnow, paynow, boost, tng
    payment_rail = db.Column(db.String(50), nullable=False)
    # pending, processing, completed, failed, refunded
    status = db.Column(db.String(20), default='pending')
    qr_code_id = db.Column(UUID(as_uuid=True), db.ForeignKey(
        'qr_codes.id'), nullable=True)
    transaction_metadata = db.Column(JSON, default=dict)
    processed_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    plugin_logs = db.relationship(
        'PluginLog', backref='transaction', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Transaction {self.txn_id}>'

    @staticmethod
    def utc_now():
        """Get current UTC time as timezone-aware datetime"""
        return datetime.now(timezone.utc)

    def to_dict(self):
        """Convert transaction to dictionary"""
        return {
            'id': str(self.id),
            'txn_id': self.txn_id,
            'user_id': str(self.user_id) if self.user_id else None,
            'amount': float(self.amount),
            'currency': self.currency,
            'original_amount': float(self.original_amount) if self.original_amount else None,
            'original_currency': self.original_currency,
            'merchant_id': self.merchant_id,
            'merchant_name': self.merchant_name,
            'payment_method': self.payment_method,
            'payment_rail': self.payment_rail,
            'status': self.status,
            'qr_code_id': str(self.qr_code_id) if self.qr_code_id else None,
            'transaction_metadata': self.transaction_metadata,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def create_transaction(cls, txn_id, amount, currency='MYR', **kwargs):
        """Create a new transaction"""
        transaction = cls(
            txn_id=txn_id,
            amount=amount,
            currency=currency,
            **kwargs
        )
        db.session.add(transaction)
        db.session.commit()
        return transaction

    def update_status(self, status, **kwargs):
        """Update transaction status with timestamp"""
        self.status = status
        self.updated_at = self.utc_now()

        if status == 'processing':
            self.processed_at = self.utc_now()
        elif status in ['completed', 'failed', 'refunded']:
            self.completed_at = self.utc_now()

        # Update any additional fields
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

        db.session.commit()

    def add_metadata(self, key, value):
        """Add metadata to transaction"""
        if not self.transaction_metadata:
            self.transaction_metadata = {}

        self.transaction_metadata[key] = value
        db.session.merge(self)  # For JSONB updates
        db.session.commit()

    def get_plugin_logs(self):
        """Get all plugin logs for this transaction"""
        return self.plugin_logs.order_by(PluginLog.created_at).all()

    def get_processing_time(self):
        """Calculate total processing time"""
        if self.completed_at and self.created_at:
            return (self.completed_at - self.created_at).total_seconds()
        return None

    @classmethod
    def get_by_txn_id(cls, txn_id):
        """Get transaction by transaction ID"""
        return cls.query.filter_by(txn_id=txn_id).first()

    @classmethod
    def get_transactions_by_status(cls, status, limit=100):
        """Get transactions by status"""
        return cls.query.filter_by(status=status).limit(limit).all()

    @classmethod
    def get_recent_transactions(cls, limit=50):
        """Get recent transactions"""
        return cls.query.order_by(cls.created_at.desc()).limit(limit).all()

    @classmethod
    def get_transaction_stats(cls):
        """Get transaction statistics"""
        total = cls.query.count()
        pending = cls.query.filter_by(status='pending').count()
        completed = cls.query.filter_by(status='completed').count()
        failed = cls.query.filter_by(status='failed').count()

        # Calculate success rate
        success_rate = (completed / total * 100) if total > 0 else 0

        # Calculate total volume
        volume_result = db.session.query(
            db.func.sum(cls.amount)
        ).filter(cls.status == 'completed').scalar()

        total_volume = float(volume_result) if volume_result else 0.0

        return {
            'total_transactions': total,
            'pending': pending,
            'completed': completed,
            'failed': failed,
            'success_rate': round(success_rate, 2),
            'total_volume': total_volume
        }
