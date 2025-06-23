"""
Plugin Log model for PinkPay Payment Switch
"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class PluginLog(db.Model):
    """Plugin Log model for tracking plugin execution"""
    
    __tablename__ = 'plugin_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = db.Column(UUID(as_uuid=True), db.ForeignKey('transactions.id'), nullable=False)
    plugin_name = db.Column(db.String(100), nullable=False)
    plugin_version = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # success, error, warning, skipped
    input_data = db.Column(JSON, nullable=True)
    output_data = db.Column(JSON, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    execution_time_ms = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PluginLog {self.plugin_name} - {self.status}>'
    
    def to_dict(self):
        """Convert plugin log to dictionary"""
        return {
            'id': str(self.id),
            'transaction_id': str(self.transaction_id),
            'plugin_name': self.plugin_name,
            'plugin_version': self.plugin_version,
            'status': self.status,
            'input_data': self.input_data,
            'output_data': self.output_data,
            'error_message': self.error_message,
            'execution_time_ms': self.execution_time_ms,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def create_log(cls, transaction_id, plugin_name, plugin_version, status, **kwargs):
        """Create a new plugin log"""
        log = cls(
            transaction_id=transaction_id,
            plugin_name=plugin_name,
            plugin_version=plugin_version,
            status=status,
            **kwargs
        )
        db.session.add(log)
        db.session.commit()
        return log
    
    @classmethod
    def log_plugin_execution(cls, transaction_id, plugin_name, plugin_version, 
                           input_data=None, output_data=None, execution_time_ms=None, 
                           error_message=None):
        """Log plugin execution results"""
        status = 'error' if error_message else 'success'
        
        return cls.create_log(
            transaction_id=transaction_id,
            plugin_name=plugin_name,
            plugin_version=plugin_version,
            status=status,
            input_data=input_data,
            output_data=output_data,
            execution_time_ms=execution_time_ms,
            error_message=error_message
        )
    
    @classmethod
    def get_logs_by_transaction(cls, transaction_id):
        """Get all logs for a transaction"""
        return cls.query.filter_by(transaction_id=transaction_id).order_by(cls.created_at).all()
    
    @classmethod
    def get_logs_by_plugin(cls, plugin_name, limit=100):
        """Get recent logs for a specific plugin"""
        return cls.query.filter_by(plugin_name=plugin_name).order_by(cls.created_at.desc()).limit(limit).all()
    
    @classmethod
    def get_plugin_stats(cls):
        """Get plugin execution statistics"""
        # Get plugin performance stats
        plugin_stats = db.session.query(
            cls.plugin_name,
            db.func.count(cls.id).label('total_executions'),
            db.func.sum(db.case([(cls.status == 'success', 1)], else_=0)).label('successful'),
            db.func.sum(db.case([(cls.status == 'error', 1)], else_=0)).label('failed'),
            db.func.avg(cls.execution_time_ms).label('avg_execution_time')
        ).group_by(cls.plugin_name).all()
        
        results = []
        for stat in plugin_stats:
            success_rate = (stat.successful / stat.total_executions * 100) if stat.total_executions > 0 else 0
            results.append({
                'plugin_name': stat.plugin_name,
                'total_executions': stat.total_executions,
                'successful': stat.successful,
                'failed': stat.failed,
                'success_rate': round(success_rate, 2),
                'avg_execution_time_ms': round(float(stat.avg_execution_time), 2) if stat.avg_execution_time else 0
            })
        
        return results
    
    @classmethod
    def get_recent_logs(cls, limit=100):
        """Get recent plugin logs"""
        return cls.query.order_by(cls.created_at.desc()).limit(limit).all()
    
    @classmethod
    def get_error_logs(cls, limit=50):
        """Get recent error logs"""
        return cls.query.filter_by(status='error').order_by(cls.created_at.desc()).limit(limit).all() 
Plugin Log model for PinkPay Payment Switch
"""

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import JSON
from src.database.connection import db

class PluginLog(db.Model):
    """Plugin Log model for tracking plugin execution"""
    
    __tablename__ = 'plugin_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = db.Column(UUID(as_uuid=True), db.ForeignKey('transactions.id'), nullable=False)
    plugin_name = db.Column(db.String(100), nullable=False)
    plugin_version = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # success, error, warning, skipped
    input_data = db.Column(JSON, nullable=True)
    output_data = db.Column(JSON, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    execution_time_ms = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PluginLog {self.plugin_name} - {self.status}>'
    
    def to_dict(self):
        """Convert plugin log to dictionary"""
        return {
            'id': str(self.id),
            'transaction_id': str(self.transaction_id),
            'plugin_name': self.plugin_name,
            'plugin_version': self.plugin_version,
            'status': self.status,
            'input_data': self.input_data,
            'output_data': self.output_data,
            'error_message': self.error_message,
            'execution_time_ms': self.execution_time_ms,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def create_log(cls, transaction_id, plugin_name, plugin_version, status, **kwargs):
        """Create a new plugin log"""
        log = cls(
            transaction_id=transaction_id,
            plugin_name=plugin_name,
            plugin_version=plugin_version,
            status=status,
            **kwargs
        )
        db.session.add(log)
        db.session.commit()
        return log
    
    @classmethod
    def log_plugin_execution(cls, transaction_id, plugin_name, plugin_version, 
                           input_data=None, output_data=None, execution_time_ms=None, 
                           error_message=None):
        """Log plugin execution results"""
        status = 'error' if error_message else 'success'
        
        return cls.create_log(
            transaction_id=transaction_id,
            plugin_name=plugin_name,
            plugin_version=plugin_version,
            status=status,
            input_data=input_data,
            output_data=output_data,
            execution_time_ms=execution_time_ms,
            error_message=error_message
        )
    
    @classmethod
    def get_logs_by_transaction(cls, transaction_id):
        """Get all logs for a transaction"""
        return cls.query.filter_by(transaction_id=transaction_id).order_by(cls.created_at).all()
    
    @classmethod
    def get_logs_by_plugin(cls, plugin_name, limit=100):
        """Get recent logs for a specific plugin"""
        return cls.query.filter_by(plugin_name=plugin_name).order_by(cls.created_at.desc()).limit(limit).all()
    
    @classmethod
    def get_plugin_stats(cls):
        """Get plugin execution statistics"""
        # Get plugin performance stats
        plugin_stats = db.session.query(
            cls.plugin_name,
            db.func.count(cls.id).label('total_executions'),
            db.func.sum(db.case([(cls.status == 'success', 1)], else_=0)).label('successful'),
            db.func.sum(db.case([(cls.status == 'error', 1)], else_=0)).label('failed'),
            db.func.avg(cls.execution_time_ms).label('avg_execution_time')
        ).group_by(cls.plugin_name).all()
        
        results = []
        for stat in plugin_stats:
            success_rate = (stat.successful / stat.total_executions * 100) if stat.total_executions > 0 else 0
            results.append({
                'plugin_name': stat.plugin_name,
                'total_executions': stat.total_executions,
                'successful': stat.successful,
                'failed': stat.failed,
                'success_rate': round(success_rate, 2),
                'avg_execution_time_ms': round(float(stat.avg_execution_time), 2) if stat.avg_execution_time else 0
            })
        
        return results
    
    @classmethod
    def get_recent_logs(cls, limit=100):
        """Get recent plugin logs"""
        return cls.query.order_by(cls.created_at.desc()).limit(limit).all()
    
    @classmethod
    def get_error_logs(cls, limit=50):
        """Get recent error logs"""
        return cls.query.filter_by(status='error').order_by(cls.created_at.desc()).limit(limit).all() 