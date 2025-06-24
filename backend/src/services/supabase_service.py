"""
Supabase Service - Centralized Supabase operations for PinkPay
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from flask import current_app
from supabase import Client

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service class for Supabase operations"""
    
    @staticmethod
    def get_client() -> Optional[Client]:
        """Get Supabase client from Flask app"""
        try:
            if hasattr(current_app, 'supabase'):
                return current_app.supabase
            return None
        except Exception as e:
            logger.error(f"Failed to get Supabase client: {str(e)}")
            return None
    
    @staticmethod
    def test_connection() -> bool:
        """Test Supabase connection"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return False
            
            # Test with simple query
            result = client.table('users').select('id').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Supabase connection test failed: {str(e)}")
            return False
    
    # User Operations
    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> Optional[Dict]:
        """Create a new user in Supabase"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('users').insert(user_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            return None
    
    @staticmethod
    def get_user(user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('users').select('*').eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {str(e)}")
            return None
    
    @staticmethod
    def update_user(user_id: str, updates: Dict[str, Any]) -> Optional[Dict]:
        """Update user data"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            updates['updated_at'] = datetime.utcnow().isoformat()
            result = client.table('users').update(updates).eq('id', user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {str(e)}")
            return None
    
    # Transaction Operations
    @staticmethod
    def create_transaction(transaction_data: Dict[str, Any]) -> Optional[Dict]:
        """Create a new transaction"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('transactions').insert(transaction_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to create transaction: {str(e)}")
            return None
    
    @staticmethod
    def get_transaction(txn_id: str) -> Optional[Dict]:
        """Get transaction by transaction ID"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('transactions').select('*').eq('txn_id', txn_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get transaction {txn_id}: {str(e)}")
            return None
    
    @staticmethod
    def update_transaction(txn_id: str, updates: Dict[str, Any]) -> Optional[Dict]:
        """Update transaction status"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            updates['updated_at'] = datetime.utcnow().isoformat()
            result = client.table('transactions').update(updates).eq('txn_id', txn_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to update transaction {txn_id}: {str(e)}")
            return None
    
    @staticmethod
    def get_recent_transactions(limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get recent transactions with pagination"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return []
            
            result = client.table('transactions')\
                .select('*')\
                .order('created_at', desc=True)\
                .range(offset, offset + limit - 1)\
                .execute()
            
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Failed to get recent transactions: {str(e)}")
            return []
    
    # QR Code Operations
    @staticmethod
    def create_qr_code(qr_data: Dict[str, Any]) -> Optional[Dict]:
        """Create a new QR code record"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('qr_codes').insert(qr_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to create QR code: {str(e)}")
            return None
    
    @staticmethod
    def get_qr_code(qr_code_id: str) -> Optional[Dict]:
        """Get QR code by ID"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('qr_codes').select('*').eq('qr_code_id', qr_code_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get QR code {qr_code_id}: {str(e)}")
            return None
    
    @staticmethod
    def update_qr_code(qr_code_id: str, updates: Dict[str, Any]) -> Optional[Dict]:
        """Update QR code status"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('qr_codes').update(updates).eq('qr_code_id', qr_code_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to update QR code {qr_code_id}: {str(e)}")
            return None
    
    # Plugin Log Operations
    @staticmethod
    def log_plugin_execution(log_data: Dict[str, Any]) -> Optional[Dict]:
        """Log plugin execution"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return None
            
            result = client.table('plugin_logs').insert(log_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to log plugin execution: {str(e)}")
            return None
    
    # Analytics Operations
    @staticmethod
    def get_transaction_analytics() -> Dict[str, Any]:
        """Get transaction analytics data"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return {}
            
            # Get total transaction count
            total_result = client.table('transactions').select('id', count='exact').execute()
            total_transactions = total_result.count
            
            # Get successful transactions
            success_result = client.table('transactions')\
                .select('id', count='exact')\
                .eq('status', 'completed')\
                .execute()
            successful_transactions = success_result.count
            
            # Get today's transactions
            today = datetime.utcnow().date().isoformat()
            today_result = client.table('transactions')\
                .select('id', count='exact')\
                .gte('created_at', f'{today}T00:00:00')\
                .execute()
            today_transactions = today_result.count
            
            return {
                'total_transactions': total_transactions,
                'successful_transactions': successful_transactions,
                'today_transactions': today_transactions,
                'success_rate': round((successful_transactions / total_transactions) * 100, 2) if total_transactions > 0 else 0
            }
        except Exception as e:
            logger.error(f"Failed to get transaction analytics: {str(e)}")
            return {}
    
    @staticmethod
    def get_user_analytics() -> Dict[str, Any]:
        """Get user analytics data"""
        try:
            client = SupabaseService.get_client()
            if not client:
                return {}
            
            # Total users
            total_result = client.table('users').select('id', count='exact').execute()
            total_users = total_result.count
            
            # Active users
            active_result = client.table('users')\
                .select('id', count='exact')\
                .eq('is_active', True)\
                .execute()
            active_users = active_result.count
            
            return {
                'total_users': total_users,
                'active_users': active_users
            }
        except Exception as e:
            logger.error(f"Failed to get user analytics: {str(e)}")
            return {}

# Helper functions for backward compatibility
def get_supabase_client() -> Optional[Client]:
    """Get Supabase client - helper function"""
    return SupabaseService.get_client()

def test_supabase_connection() -> bool:
    """Test Supabase connection - helper function"""
    return SupabaseService.test_connection() 