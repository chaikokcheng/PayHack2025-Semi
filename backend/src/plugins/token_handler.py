"""
Token Handler Plugin for PinkPay Payment Switch
Manages offline payment tokens for situations with poor connectivity
"""

import asyncio
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from .plugin_manager import BasePlugin

class TokenHandlerPlugin(BasePlugin):
    """Token Handler Plugin for offline payment tokens"""
    
    def __init__(self):
        super().__init__()
        self.name = "Token Handler"
        self.version = "1.0.0"
        self.description = "Offline payment token management and redemption"
        self.critical = False
        
        self.config = {
            'token_expiry_hours': 24,
            'max_token_amount': 1000.0,  # MYR
            'min_token_amount': 5.0,     # MYR
            'max_tokens_per_user': 5,
            'supported_currencies': ['MYR', 'USD', 'SGD'],
            'auto_cleanup_expired': True
        }
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute token handling logic"""
        try:
            operation = data.get('token_operation', 'validate')
            
            if operation == 'create':
                return await self._create_token(data)
            elif operation == 'redeem':
                return await self._redeem_token(data)
            elif operation == 'validate':
                return await self._validate_token(data)
            elif operation == 'cancel':
                return await self._cancel_token(data)
            else:
                return {
                    'success': True,
                    'data': {
                        'token_operation': 'none',
                        'token_required': False
                    }
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token handling failed: {str(e)}",
                'critical': False
            }
    
    async def _create_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new offline token"""
        try:
            user_id = data.get('user_id')
            amount = float(data.get('amount', 0))
            currency = data.get('currency', 'MYR')
            
            # Validate token creation
            validation_result = self._validate_token_creation(amount, currency, user_id)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': validation_result['reason'],
                    'critical': False
                }
            
            # Generate token
            token_data = await self._generate_offline_token(user_id, amount, currency)
            
            # In production, this would save to database
            # For demo, we'll simulate the database operation
            await asyncio.sleep(0.1)
            
            return {
                'success': True,
                'data': {
                    'token_created': True,
                    'token_data': token_data,
                    'token_operation': 'create'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token creation failed: {str(e)}",
                'critical': False
            }
    
    async def _redeem_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Redeem an offline token"""
        try:
            token_id = data.get('token_id')
            
            if not token_id:
                return {
                    'success': False,
                    'error': "Token ID required for redemption",
                    'critical': False
                }
            
            # Validate and redeem token
            redemption_result = await self._validate_and_redeem_token(token_id)
            
            return {
                'success': True,
                'data': {
                    'token_redeemed': redemption_result['valid'],
                    'redemption_data': redemption_result,
                    'token_operation': 'redeem'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token redemption failed: {str(e)}",
                'critical': False
            }
    
    async def _validate_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate an offline token without redeeming"""
        try:
            token_id = data.get('token_id')
            
            if not token_id:
                return {
                    'success': True,
                    'data': {
                        'token_valid': False,
                        'token_operation': 'validate',
                        'reason': 'No token provided'
                    }
                }
            
            # Validate token
            validation_result = await self._check_token_validity(token_id)
            
            return {
                'success': True,
                'data': {
                    'token_valid': validation_result['valid'],
                    'validation_data': validation_result,
                    'token_operation': 'validate'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token validation failed: {str(e)}",
                'critical': False
            }
    
    async def _cancel_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cancel an offline token"""
        try:
            token_id = data.get('token_id')
            user_id = data.get('user_id')
            
            # Validate cancellation
            cancellation_result = await self._cancel_user_token(token_id, user_id)
            
            return {
                'success': True,
                'data': {
                    'token_cancelled': cancellation_result['cancelled'],
                    'cancellation_data': cancellation_result,
                    'token_operation': 'cancel'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token cancellation failed: {str(e)}",
                'critical': False
            }
    
    async def _generate_offline_token(self, user_id: str, amount: float, currency: str) -> Dict[str, Any]:
        """Generate a new offline token"""
        
        # Generate secure token ID
        token_id = self._generate_token_id()
        
        # Calculate expiry
        expires_at = datetime.utcnow() + timedelta(hours=self.config['token_expiry_hours'])
        
        # Create token data
        token_data = {
            'token_id': token_id,
            'user_id': user_id,
            'amount': amount,
            'currency': currency,
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': expires_at.isoformat(),
            'creation_location': 'unknown',  # Could be enhanced with geolocation
            'qr_code': self._generate_token_qr_code(token_id)
        }
        
        return token_data
    
    async def _validate_and_redeem_token(self, token_id: str) -> Dict[str, Any]:
        """Validate and redeem a token"""
        
        # Simulate database lookup
        await asyncio.sleep(0.1)
        
        # Mock token data (in production, fetch from database)
        mock_tokens = {
            'TOKEN_12345': {
                'token_id': 'TOKEN_12345',
                'user_id': 'user_001',
                'amount': 50.0,
                'currency': 'MYR',
                'status': 'active',
                'expires_at': (datetime.utcnow() + timedelta(hours=12)).isoformat()
            }
        }
        
        token_data = mock_tokens.get(token_id)
        
        if not token_data:
            return {
                'valid': False,
                'reason': 'Token not found',
                'redeemed': False
            }
        
        # Check if token is still valid
        if token_data['status'] != 'active':
            return {
                'valid': False,
                'reason': f"Token status is {token_data['status']}",
                'redeemed': False
            }
        
        # Check expiry
        expires_at = datetime.fromisoformat(token_data['expires_at'].replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at.replace(tzinfo=None):
            return {
                'valid': False,
                'reason': 'Token has expired',
                'redeemed': False
            }
        
        # Token is valid, mark as redeemed
        token_data['status'] = 'redeemed'
        token_data['redeemed_at'] = datetime.utcnow().isoformat()
        
        return {
            'valid': True,
            'redeemed': True,
            'token_data': token_data,
            'redemption_timestamp': datetime.utcnow().isoformat()
        }
    
    async def _check_token_validity(self, token_id: str) -> Dict[str, Any]:
        """Check if a token is valid without redeeming it"""
        
        # Simulate database lookup
        await asyncio.sleep(0.05)
        
        # Mock validation (in production, query database)
        if token_id.startswith('TOKEN_'):
            return {
                'valid': True,
                'reason': 'Token is valid and active',
                'amount': 50.0,
                'currency': 'MYR',
                'expires_in_hours': 12
            }
        else:
            return {
                'valid': False,
                'reason': 'Invalid token format'
            }
    
    async def _cancel_user_token(self, token_id: str, user_id: str) -> Dict[str, Any]:
        """Cancel a user's token"""
        
        # Simulate database operation
        await asyncio.sleep(0.1)
        
        # Mock cancellation logic
        if token_id and user_id:
            return {
                'cancelled': True,
                'reason': 'Token cancelled successfully',
                'cancellation_timestamp': datetime.utcnow().isoformat()
            }
        else:
            return {
                'cancelled': False,
                'reason': 'Invalid token ID or user ID'
            }
    
    def _validate_token_creation(self, amount: float, currency: str, user_id: str) -> Dict[str, Any]:
        """Validate token creation parameters"""
        
        # Check amount limits
        if amount < self.config['min_token_amount']:
            return {
                'valid': False,
                'reason': f"Amount below minimum: {self.config['min_token_amount']} {currency}"
            }
        
        if amount > self.config['max_token_amount']:
            return {
                'valid': False,
                'reason': f"Amount exceeds maximum: {self.config['max_token_amount']} {currency}"
            }
        
        # Check currency support
        if currency not in self.config['supported_currencies']:
            return {
                'valid': False,
                'reason': f"Currency {currency} not supported for tokens"
            }
        
        # Check user ID
        if not user_id:
            return {
                'valid': False,
                'reason': 'User ID required for token creation'
            }
        
        return {
            'valid': True,
            'reason': 'Token creation parameters valid'
        }
    
    def _generate_token_id(self) -> str:
        """Generate a secure token ID"""
        prefix = "TOKEN"
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_part = secrets.token_hex(8).upper()
        return f"{prefix}_{timestamp}_{random_part}"
    
    def _generate_token_qr_code(self, token_id: str) -> str:
        """Generate QR code data for token"""
        # In production, this would generate actual QR code
        qr_data = {
            'type': 'offline_token',
            'token_id': token_id,
            'version': '1.0'
        }
        return f"pinkpay://token/{token_id}"
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input data for token operations"""
        operation = data.get('token_operation', 'validate')
        
        if operation == 'create':
            required_fields = ['user_id', 'amount']
        elif operation in ['redeem', 'validate']:
            required_fields = ['token_id']
        elif operation == 'cancel':
            required_fields = ['token_id', 'user_id']
        else:
            return True  # No validation needed for other operations
        
        for field in required_fields:
            if field not in data:
                return False
        
        return True
    
    async def cleanup_expired_tokens(self) -> Dict[str, Any]:
        """Cleanup expired tokens (background task)"""
        if not self.config['auto_cleanup_expired']:
            return {'cleaned': 0, 'reason': 'Auto cleanup disabled'}
        
        # In production, this would query and update database
        # Mock cleanup operation
        await asyncio.sleep(0.2)
        
        return {
            'cleaned': 5,  # Mock: cleaned 5 expired tokens
            'cleanup_timestamp': datetime.utcnow().isoformat()
        } 
Token Handler Plugin for PinkPay Payment Switch
Manages offline payment tokens for situations with poor connectivity
"""

import asyncio
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from .plugin_manager import BasePlugin

class TokenHandlerPlugin(BasePlugin):
    """Token Handler Plugin for offline payment tokens"""
    
    def __init__(self):
        super().__init__()
        self.name = "Token Handler"
        self.version = "1.0.0"
        self.description = "Offline payment token management and redemption"
        self.critical = False
        
        self.config = {
            'token_expiry_hours': 24,
            'max_token_amount': 1000.0,  # MYR
            'min_token_amount': 5.0,     # MYR
            'max_tokens_per_user': 5,
            'supported_currencies': ['MYR', 'USD', 'SGD'],
            'auto_cleanup_expired': True
        }
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute token handling logic"""
        try:
            operation = data.get('token_operation', 'validate')
            
            if operation == 'create':
                return await self._create_token(data)
            elif operation == 'redeem':
                return await self._redeem_token(data)
            elif operation == 'validate':
                return await self._validate_token(data)
            elif operation == 'cancel':
                return await self._cancel_token(data)
            else:
                return {
                    'success': True,
                    'data': {
                        'token_operation': 'none',
                        'token_required': False
                    }
                }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token handling failed: {str(e)}",
                'critical': False
            }
    
    async def _create_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new offline token"""
        try:
            user_id = data.get('user_id')
            amount = float(data.get('amount', 0))
            currency = data.get('currency', 'MYR')
            
            # Validate token creation
            validation_result = self._validate_token_creation(amount, currency, user_id)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': validation_result['reason'],
                    'critical': False
                }
            
            # Generate token
            token_data = await self._generate_offline_token(user_id, amount, currency)
            
            # In production, this would save to database
            # For demo, we'll simulate the database operation
            await asyncio.sleep(0.1)
            
            return {
                'success': True,
                'data': {
                    'token_created': True,
                    'token_data': token_data,
                    'token_operation': 'create'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token creation failed: {str(e)}",
                'critical': False
            }
    
    async def _redeem_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Redeem an offline token"""
        try:
            token_id = data.get('token_id')
            
            if not token_id:
                return {
                    'success': False,
                    'error': "Token ID required for redemption",
                    'critical': False
                }
            
            # Validate and redeem token
            redemption_result = await self._validate_and_redeem_token(token_id)
            
            return {
                'success': True,
                'data': {
                    'token_redeemed': redemption_result['valid'],
                    'redemption_data': redemption_result,
                    'token_operation': 'redeem'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token redemption failed: {str(e)}",
                'critical': False
            }
    
    async def _validate_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate an offline token without redeeming"""
        try:
            token_id = data.get('token_id')
            
            if not token_id:
                return {
                    'success': True,
                    'data': {
                        'token_valid': False,
                        'token_operation': 'validate',
                        'reason': 'No token provided'
                    }
                }
            
            # Validate token
            validation_result = await self._check_token_validity(token_id)
            
            return {
                'success': True,
                'data': {
                    'token_valid': validation_result['valid'],
                    'validation_data': validation_result,
                    'token_operation': 'validate'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token validation failed: {str(e)}",
                'critical': False
            }
    
    async def _cancel_token(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cancel an offline token"""
        try:
            token_id = data.get('token_id')
            user_id = data.get('user_id')
            
            # Validate cancellation
            cancellation_result = await self._cancel_user_token(token_id, user_id)
            
            return {
                'success': True,
                'data': {
                    'token_cancelled': cancellation_result['cancelled'],
                    'cancellation_data': cancellation_result,
                    'token_operation': 'cancel'
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Token cancellation failed: {str(e)}",
                'critical': False
            }
    
    async def _generate_offline_token(self, user_id: str, amount: float, currency: str) -> Dict[str, Any]:
        """Generate a new offline token"""
        
        # Generate secure token ID
        token_id = self._generate_token_id()
        
        # Calculate expiry
        expires_at = datetime.utcnow() + timedelta(hours=self.config['token_expiry_hours'])
        
        # Create token data
        token_data = {
            'token_id': token_id,
            'user_id': user_id,
            'amount': amount,
            'currency': currency,
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': expires_at.isoformat(),
            'creation_location': 'unknown',  # Could be enhanced with geolocation
            'qr_code': self._generate_token_qr_code(token_id)
        }
        
        return token_data
    
    async def _validate_and_redeem_token(self, token_id: str) -> Dict[str, Any]:
        """Validate and redeem a token"""
        
        # Simulate database lookup
        await asyncio.sleep(0.1)
        
        # Mock token data (in production, fetch from database)
        mock_tokens = {
            'TOKEN_12345': {
                'token_id': 'TOKEN_12345',
                'user_id': 'user_001',
                'amount': 50.0,
                'currency': 'MYR',
                'status': 'active',
                'expires_at': (datetime.utcnow() + timedelta(hours=12)).isoformat()
            }
        }
        
        token_data = mock_tokens.get(token_id)
        
        if not token_data:
            return {
                'valid': False,
                'reason': 'Token not found',
                'redeemed': False
            }
        
        # Check if token is still valid
        if token_data['status'] != 'active':
            return {
                'valid': False,
                'reason': f"Token status is {token_data['status']}",
                'redeemed': False
            }
        
        # Check expiry
        expires_at = datetime.fromisoformat(token_data['expires_at'].replace('Z', '+00:00'))
        if datetime.utcnow() > expires_at.replace(tzinfo=None):
            return {
                'valid': False,
                'reason': 'Token has expired',
                'redeemed': False
            }
        
        # Token is valid, mark as redeemed
        token_data['status'] = 'redeemed'
        token_data['redeemed_at'] = datetime.utcnow().isoformat()
        
        return {
            'valid': True,
            'redeemed': True,
            'token_data': token_data,
            'redemption_timestamp': datetime.utcnow().isoformat()
        }
    
    async def _check_token_validity(self, token_id: str) -> Dict[str, Any]:
        """Check if a token is valid without redeeming it"""
        
        # Simulate database lookup
        await asyncio.sleep(0.05)
        
        # Mock validation (in production, query database)
        if token_id.startswith('TOKEN_'):
            return {
                'valid': True,
                'reason': 'Token is valid and active',
                'amount': 50.0,
                'currency': 'MYR',
                'expires_in_hours': 12
            }
        else:
            return {
                'valid': False,
                'reason': 'Invalid token format'
            }
    
    async def _cancel_user_token(self, token_id: str, user_id: str) -> Dict[str, Any]:
        """Cancel a user's token"""
        
        # Simulate database operation
        await asyncio.sleep(0.1)
        
        # Mock cancellation logic
        if token_id and user_id:
            return {
                'cancelled': True,
                'reason': 'Token cancelled successfully',
                'cancellation_timestamp': datetime.utcnow().isoformat()
            }
        else:
            return {
                'cancelled': False,
                'reason': 'Invalid token ID or user ID'
            }
    
    def _validate_token_creation(self, amount: float, currency: str, user_id: str) -> Dict[str, Any]:
        """Validate token creation parameters"""
        
        # Check amount limits
        if amount < self.config['min_token_amount']:
            return {
                'valid': False,
                'reason': f"Amount below minimum: {self.config['min_token_amount']} {currency}"
            }
        
        if amount > self.config['max_token_amount']:
            return {
                'valid': False,
                'reason': f"Amount exceeds maximum: {self.config['max_token_amount']} {currency}"
            }
        
        # Check currency support
        if currency not in self.config['supported_currencies']:
            return {
                'valid': False,
                'reason': f"Currency {currency} not supported for tokens"
            }
        
        # Check user ID
        if not user_id:
            return {
                'valid': False,
                'reason': 'User ID required for token creation'
            }
        
        return {
            'valid': True,
            'reason': 'Token creation parameters valid'
        }
    
    def _generate_token_id(self) -> str:
        """Generate a secure token ID"""
        prefix = "TOKEN"
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_part = secrets.token_hex(8).upper()
        return f"{prefix}_{timestamp}_{random_part}"
    
    def _generate_token_qr_code(self, token_id: str) -> str:
        """Generate QR code data for token"""
        # In production, this would generate actual QR code
        qr_data = {
            'type': 'offline_token',
            'token_id': token_id,
            'version': '1.0'
        }
        return f"pinkpay://token/{token_id}"
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input data for token operations"""
        operation = data.get('token_operation', 'validate')
        
        if operation == 'create':
            required_fields = ['user_id', 'amount']
        elif operation in ['redeem', 'validate']:
            required_fields = ['token_id']
        elif operation == 'cancel':
            required_fields = ['token_id', 'user_id']
        else:
            return True  # No validation needed for other operations
        
        for field in required_fields:
            if field not in data:
                return False
        
        return True
    
    async def cleanup_expired_tokens(self) -> Dict[str, Any]:
        """Cleanup expired tokens (background task)"""
        if not self.config['auto_cleanup_expired']:
            return {'cleaned': 0, 'reason': 'Auto cleanup disabled'}
        
        # In production, this would query and update database
        # Mock cleanup operation
        await asyncio.sleep(0.2)
        
        return {
            'cleaned': 5,  # Mock: cleaned 5 expired tokens
            'cleanup_timestamp': datetime.utcnow().isoformat()
        } 