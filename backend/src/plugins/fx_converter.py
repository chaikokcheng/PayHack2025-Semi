"""
FX Converter Plugin for PinkPay Payment Switch
Handles foreign exchange conversion between different currencies
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

class BasePlugin:
    """Base plugin class"""
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugin logic"""
        raise NotImplementedError("Plugin must implement execute method")

class FXConverterPlugin(BasePlugin):
    """Foreign Exchange Converter Plugin"""
    
    def __init__(self):
        super().__init__()
        self.name = "fx_converter"
        self.version = "1.0.0"
        
        # Mock exchange rates (in production, fetch from real API)
        self.exchange_rates = {
            'MYR': {
                'USD': 0.21,
                'SGD': 0.29,
                'EUR': 0.20,
                'GBP': 0.17,
                'THB': 7.50,
                'IDR': 3200.0,
                'MYR': 1.0
            },
            'USD': {
                'MYR': 4.75,
                'SGD': 1.35,
                'EUR': 0.92,
                'GBP': 0.79,
                'THB': 35.0,
                'IDR': 15000.0,
                'USD': 1.0
            }
        }
        
        self.markup_percentage = 2.5  # 2.5% markup for FX conversion
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute FX conversion"""
        try:
            amount = data.get('amount', 0)
            from_currency = data.get('from_currency', 'MYR')
            to_currency = data.get('to_currency', 'MYR')
            
            if from_currency == to_currency:
                return {
                    'success': True,
                    'original_amount': amount,
                    'converted_amount': amount,
                    'from_currency': from_currency,
                    'to_currency': to_currency,
                    'exchange_rate': 1.0,
                    'markup_applied': 0.0,
                    'conversion_needed': False
                }
            
            # Get exchange rate
            if from_currency in self.exchange_rates:
                rate = self.exchange_rates[from_currency].get(to_currency)
                if rate:
                    # Apply markup
                    marked_up_rate = rate * (1 + self.markup_percentage / 100)
                    converted_amount = amount * marked_up_rate
                    markup_applied = converted_amount - (amount * rate)
                    
                    return {
                        'success': True,
                        'original_amount': amount,
                        'converted_amount': round(converted_amount, 2),
                        'from_currency': from_currency,
                        'to_currency': to_currency,
                        'exchange_rate': rate,
                        'marked_up_rate': marked_up_rate,
                        'markup_applied': round(markup_applied, 2),
                        'markup_percentage': self.markup_percentage,
                        'conversion_needed': True,
                        'timestamp': datetime.utcnow().isoformat()
                    }
            
            return {
                'success': False,
                'error': f'Exchange rate not available for {from_currency} to {to_currency}',
                'original_amount': amount,
                'from_currency': from_currency,
                'to_currency': to_currency
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'FX conversion failed: {str(e)}',
                'original_amount': data.get('amount', 0),
                'from_currency': data.get('from_currency', 'MYR'),
                'to_currency': data.get('to_currency', 'MYR')
            }
    
    def get_supported_currencies(self):
        """Get list of supported currencies"""
        return list(self.exchange_rates.keys())
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> Optional[float]:
        """Get exchange rate between two currencies"""
        if from_currency in self.exchange_rates:
            return self.exchange_rates[from_currency].get(to_currency)
        return None 
FX Converter Plugin for PinkPay Payment Switch
Handles foreign exchange conversion between different currencies
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

class BasePlugin:
    """Base plugin class"""
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugin logic"""
        raise NotImplementedError("Plugin must implement execute method")

class FXConverterPlugin(BasePlugin):
    """Foreign Exchange Converter Plugin"""
    
    def __init__(self):
        super().__init__()
        self.name = "fx_converter"
        self.version = "1.0.0"
        
        # Mock exchange rates (in production, fetch from real API)
        self.exchange_rates = {
            'MYR': {
                'USD': 0.21,
                'SGD': 0.29,
                'EUR': 0.20,
                'GBP': 0.17,
                'THB': 7.50,
                'IDR': 3200.0,
                'MYR': 1.0
            },
            'USD': {
                'MYR': 4.75,
                'SGD': 1.35,
                'EUR': 0.92,
                'GBP': 0.79,
                'THB': 35.0,
                'IDR': 15000.0,
                'USD': 1.0
            }
        }
        
        self.markup_percentage = 2.5  # 2.5% markup for FX conversion
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute FX conversion"""
        try:
            amount = data.get('amount', 0)
            from_currency = data.get('from_currency', 'MYR')
            to_currency = data.get('to_currency', 'MYR')
            
            if from_currency == to_currency:
                return {
                    'success': True,
                    'original_amount': amount,
                    'converted_amount': amount,
                    'from_currency': from_currency,
                    'to_currency': to_currency,
                    'exchange_rate': 1.0,
                    'markup_applied': 0.0,
                    'conversion_needed': False
                }
            
            # Get exchange rate
            if from_currency in self.exchange_rates:
                rate = self.exchange_rates[from_currency].get(to_currency)
                if rate:
                    # Apply markup
                    marked_up_rate = rate * (1 + self.markup_percentage / 100)
                    converted_amount = amount * marked_up_rate
                    markup_applied = converted_amount - (amount * rate)
                    
                    return {
                        'success': True,
                        'original_amount': amount,
                        'converted_amount': round(converted_amount, 2),
                        'from_currency': from_currency,
                        'to_currency': to_currency,
                        'exchange_rate': rate,
                        'marked_up_rate': marked_up_rate,
                        'markup_applied': round(markup_applied, 2),
                        'markup_percentage': self.markup_percentage,
                        'conversion_needed': True,
                        'timestamp': datetime.utcnow().isoformat()
                    }
            
            return {
                'success': False,
                'error': f'Exchange rate not available for {from_currency} to {to_currency}',
                'original_amount': amount,
                'from_currency': from_currency,
                'to_currency': to_currency
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'FX conversion failed: {str(e)}',
                'original_amount': data.get('amount', 0),
                'from_currency': data.get('from_currency', 'MYR'),
                'to_currency': data.get('to_currency', 'MYR')
            }
    
    def get_supported_currencies(self):
        """Get list of supported currencies"""
        return list(self.exchange_rates.keys())
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> Optional[float]:
        """Get exchange rate between two currencies"""
        if from_currency in self.exchange_rates:
            return self.exchange_rates[from_currency].get(to_currency)
        return None 