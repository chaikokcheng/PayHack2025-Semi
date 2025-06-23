"""
User model for PinkPay Payment Switch
"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class User(db.Model):
    """User model for payment switch users"""
    
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=True)
    full_name = db.Column(db.String(255), nullable=False)
    primary_wallet = db.Column(db.String(50), nullable=False, default='tng')
    linked_wallets = db.Column(JSON, default=list)
    kyc_status = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    risk_score = db.Column(db.Integer, default=0)  # 0-100 risk score
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    offline_tokens = db.relationship('OfflineToken', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.phone_number}>'
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': str(self.id),
            'phone_number': self.phone_number,
            'email': self.email,
            'full_name': self.full_name,
            'primary_wallet': self.primary_wallet,
            'linked_wallets': self.linked_wallets,
            'kyc_status': self.kyc_status,
            'risk_score': self.risk_score,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_user(cls, phone_number, full_name, email=None, primary_wallet='tng'):
        """Create a new user"""
        user = cls(
            phone_number=phone_number,
            full_name=full_name,
            email=email,
            primary_wallet=primary_wallet
        )
        db.session.add(user)
        db.session.commit()
        return user
    
    def add_linked_wallet(self, wallet_type, wallet_data):
        """Add a linked wallet to user"""
        if not self.linked_wallets:
            self.linked_wallets = []
        
        # Check if wallet already exists
        for wallet in self.linked_wallets:
            if wallet.get('type') == wallet_type:
                wallet.update(wallet_data)
                break
        else:
            # Add new wallet
            wallet_info = {
                'type': wallet_type,
                'linked_at': datetime.utcnow().isoformat(),
                **wallet_data
            }
            self.linked_wallets.append(wallet_info)
        
        # Mark column as modified for JSONB
        db.session.merge(self)
        db.session.commit()
    
    def get_active_transactions(self):
        """Get active transactions for user"""
        return self.transactions.filter_by(status='pending').all()
    
    def get_transaction_count_today(self):
        """Get number of transactions today"""
        today = datetime.utcnow().date()
        return self.transactions.filter(
            db.func.date(Transaction.created_at) == today
        ).count()
    
    def calculate_daily_amount(self):
        """Calculate total amount transacted today"""
        today = datetime.utcnow().date()
        result = db.session.query(
            db.func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == self.id,
            db.func.date(Transaction.created_at) == today,
            Transaction.status.in_(['completed', 'settled'])
        ).scalar()
        
        return float(result) if result else 0.0 
User model for PinkPay Payment Switch
"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class User(db.Model):
    """User model for payment switch users"""
    
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=True)
    full_name = db.Column(db.String(255), nullable=False)
    primary_wallet = db.Column(db.String(50), nullable=False, default='tng')
    linked_wallets = db.Column(JSON, default=list)
    kyc_status = db.Column(db.String(20), default='pending')  # pending, verified, rejected
    risk_score = db.Column(db.Integer, default=0)  # 0-100 risk score
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy='dynamic')
    offline_tokens = db.relationship('OfflineToken', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.phone_number}>'
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': str(self.id),
            'phone_number': self.phone_number,
            'email': self.email,
            'full_name': self.full_name,
            'primary_wallet': self.primary_wallet,
            'linked_wallets': self.linked_wallets,
            'kyc_status': self.kyc_status,
            'risk_score': self.risk_score,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create_user(cls, phone_number, full_name, email=None, primary_wallet='tng'):
        """Create a new user"""
        user = cls(
            phone_number=phone_number,
            full_name=full_name,
            email=email,
            primary_wallet=primary_wallet
        )
        db.session.add(user)
        db.session.commit()
        return user
    
    def add_linked_wallet(self, wallet_type, wallet_data):
        """Add a linked wallet to user"""
        if not self.linked_wallets:
            self.linked_wallets = []
        
        # Check if wallet already exists
        for wallet in self.linked_wallets:
            if wallet.get('type') == wallet_type:
                wallet.update(wallet_data)
                break
        else:
            # Add new wallet
            wallet_info = {
                'type': wallet_type,
                'linked_at': datetime.utcnow().isoformat(),
                **wallet_data
            }
            self.linked_wallets.append(wallet_info)
        
        # Mark column as modified for JSONB
        db.session.merge(self)
        db.session.commit()
    
    def get_active_transactions(self):
        """Get active transactions for user"""
        return self.transactions.filter_by(status='pending').all()
    
    def get_transaction_count_today(self):
        """Get number of transactions today"""
        today = datetime.utcnow().date()
        return self.transactions.filter(
            db.func.date(Transaction.created_at) == today
        ).count()
    
    def calculate_daily_amount(self):
        """Calculate total amount transacted today"""
        today = datetime.utcnow().date()
        result = db.session.query(
            db.func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == self.id,
            db.func.date(Transaction.created_at) == today,
            Transaction.status.in_(['completed', 'settled'])
        ).scalar()
        
        return float(result) if result else 0.0 