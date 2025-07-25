"""
Offline Token model for SatuPay Payment Switch
"""

import uuid
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.dialects.postgresql import UUID
from src.database.connection import db


class OfflineToken(db.Model):
    """Offline Token model for offline payment tokens"""

    __tablename__ = 'offline_tokens'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_id = db.Column(db.String(100), unique=True,
                         nullable=False, index=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey(
        'users.id'), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    currency = db.Column(db.String(3), default='MYR')
    # active, redeemed, expired, cancelled
    status = db.Column(db.String(20), default='active')
    redeemed_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<OfflineToken {self.token_id}>'

    @staticmethod
    def utc_now():
        """Get current UTC time as timezone-aware datetime"""
        return datetime.now(timezone.utc)

    def to_dict(self):
        """Convert offline token to dictionary"""
        return {
            'id': str(self.id),
            'token_id': self.token_id,
            'user_id': str(self.user_id),
            'amount': float(self.amount),
            'currency': self.currency,
            'status': self.status,
            'redeemed_at': self.redeemed_at.isoformat() if self.redeemed_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_expired': self.is_expired(),
            'time_remaining': self.get_time_remaining()
        }

    @classmethod
    def generate_token_id(cls):
        """Generate a secure token ID"""
        return secrets.token_urlsafe(32)

    @classmethod
    def create_token(cls, user_id, amount, currency='MYR', expiry_hours=72):
        """Create a new offline token"""
        token = cls(
            token_id=cls.generate_token_id(),
            user_id=user_id,
            amount=amount,
            currency=currency,
            expires_at=cls.utc_now() + timedelta(hours=expiry_hours)
        )
        db.session.add(token)
        db.session.commit()
        return token

    def is_expired(self):
        """Check if token is expired"""
        current_time = self.utc_now()
        expires_at = self.expires_at

        # Handle timezone-naive expires_at by assuming it's UTC
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        return current_time > expires_at

    def is_valid(self):
        """Check if token is valid for redemption"""
        return (
            self.status == 'active' and
            not self.is_expired() and
            self.redeemed_at is None
        )

    def redeem(self):
        """Redeem the token"""
        if not self.is_valid():
            raise ValueError("Token is not valid for redemption")

        self.status = 'redeemed'
        self.redeemed_at = self.utc_now()
        db.session.commit()
        return True

    def cancel(self):
        """Cancel the token"""
        if self.status in ['redeemed', 'expired']:
            raise ValueError("Cannot cancel a redeemed or expired token")

        self.status = 'cancelled'
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
    def get_by_token_id(cls, token_id):
        """Get token by token ID"""
        return cls.query.filter_by(token_id=token_id).first()

    @classmethod
    def get_user_tokens(cls, user_id, status=None):
        """Get tokens for a user"""
        query = cls.query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)
        return query.order_by(cls.created_at.desc()).all()

    @classmethod
    def get_active_tokens(cls):
        """Get all active tokens"""
        return cls.query.filter_by(status='active').all()

    @classmethod
    def cleanup_expired_tokens(cls):
        """Mark expired tokens as expired"""
        current_time = cls.utc_now()
        expired_tokens = cls.query.filter(
            cls.status == 'active',
            cls.expires_at < current_time
        ).all()

        count = 0
        for token in expired_tokens:
            token.status = 'expired'
            count += 1

        if count > 0:
            db.session.commit()

        return count

    @classmethod
    def get_token_stats(cls):
        """Get token statistics"""
        total = cls.query.count()
        active = cls.query.filter_by(status='active').count()
        redeemed = cls.query.filter_by(status='redeemed').count()
        expired = cls.query.filter_by(status='expired').count()
        cancelled = cls.query.filter_by(status='cancelled').count()

        # Calculate total value of active tokens
        active_value_result = db.session.query(
            db.func.sum(cls.amount)
        ).filter(cls.status == 'active').scalar()

        active_value = float(
            active_value_result) if active_value_result else 0.0

        # Calculate redemption rate
        redemption_rate = (redeemed / total * 100) if total > 0 else 0

        return {
            'total_tokens': total,
            'active': active,
            'redeemed': redeemed,
            'expired': expired,
            'cancelled': cancelled,
            'active_value': active_value,
            'redemption_rate': round(redemption_rate, 2)
        }
