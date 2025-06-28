"""
Risk Checker Plugin for SatuPay Payment Switch
Analyzes transaction risk and applies risk management rules
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List
from .plugin_manager import BasePlugin

class RiskCheckerPlugin(BasePlugin):
    """Risk Checker Plugin for transaction risk assessment"""
    
    def __init__(self):
        super().__init__()
        self.name = "Risk Checker"
        self.version = "1.0.0"
        self.description = "Transaction risk assessment and fraud detection"
        self.critical = False
        
        # Risk thresholds
        self.risk_thresholds = {
            'high_amount': 10000.0,  # MYR
            'very_high_amount': 50000.0,  # MYR
            'suspicious_frequency': 10,  # transactions per hour
            'velocity_limit': 50000.0,  # MYR per day
            'international_limit': 25000.0,  # MYR for international
            'max_risk_score': 85  # Block if risk score > 85
        }
        
        # Risk factors weights
        self.risk_weights = {
            'amount_factor': 0.3,
            'frequency_factor': 0.25,
            'velocity_factor': 0.2,
            'time_factor': 0.1,
            'merchant_factor': 0.1,
            'location_factor': 0.05
        }
        
        self.config = {
            'enabled_checks': [
                'amount_check',
                'frequency_check', 
                'velocity_check',
                'time_pattern_check',
                'merchant_reputation_check'
            ],
            'auto_block_threshold': 85,
            'manual_review_threshold': 70,
            'risk_thresholds': self.risk_thresholds
        }
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute risk assessment"""
        try:
            risk_assessment = await self._perform_risk_assessment(data)
            
            # Determine action based on risk score
            action = self._determine_action(risk_assessment['risk_score'])
            
            return {
                'success': True,
                'data': {
                    'risk_assessment': risk_assessment,
                    'risk_action': action,
                    'risk_checks_completed': True
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Risk assessment failed: {str(e)}",
                'critical': False
            }
    
    async def _perform_risk_assessment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive risk assessment"""
        
        risk_factors = {}
        total_risk_score = 0
        
        # Amount-based risk
        if 'amount_check' in self.config['enabled_checks']:
            amount_risk = await self._check_amount_risk(data)
            risk_factors['amount_risk'] = amount_risk
            total_risk_score += amount_risk['score'] * self.risk_weights['amount_factor']
        
        # Frequency-based risk
        if 'frequency_check' in self.config['enabled_checks']:
            frequency_risk = await self._check_frequency_risk(data)
            risk_factors['frequency_risk'] = frequency_risk
            total_risk_score += frequency_risk['score'] * self.risk_weights['frequency_factor']
        
        # Velocity-based risk
        if 'velocity_check' in self.config['enabled_checks']:
            velocity_risk = await self._check_velocity_risk(data)
            risk_factors['velocity_risk'] = velocity_risk
            total_risk_score += velocity_risk['score'] * self.risk_weights['velocity_factor']
        
        # Time pattern risk
        if 'time_pattern_check' in self.config['enabled_checks']:
            time_risk = await self._check_time_pattern_risk(data)
            risk_factors['time_risk'] = time_risk
            total_risk_score += time_risk['score'] * self.risk_weights['time_factor']
        
        # Merchant reputation risk
        if 'merchant_reputation_check' in self.config['enabled_checks']:
            merchant_risk = await self._check_merchant_reputation_risk(data)
            risk_factors['merchant_risk'] = merchant_risk
            total_risk_score += merchant_risk['score'] * self.risk_weights['merchant_factor']
        
        return {
            'risk_score': min(round(total_risk_score, 1), 100),
            'risk_level': self._get_risk_level(total_risk_score),
            'risk_factors': risk_factors,
            'assessment_timestamp': datetime.utcnow().isoformat()
        }
    
    async def _check_amount_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check amount-based risk"""
        amount = float(data.get('amount', 0))
        currency = data.get('currency', 'MYR')
        
        # Convert to MYR if needed (simplified)
        if currency != 'MYR':
            # Use rough conversion rates for risk assessment
            conversion_rates = {'USD': 4.7, 'SGD': 3.5, 'EUR': 5.1}
            amount = amount * conversion_rates.get(currency, 1)
        
        risk_score = 0
        risk_factors = []
        
        if amount >= self.risk_thresholds['very_high_amount']:
            risk_score = 80
            risk_factors.append(f"Very high amount: {amount:.2f} MYR")
        elif amount >= self.risk_thresholds['high_amount']:
            risk_score = 50
            risk_factors.append(f"High amount: {amount:.2f} MYR")
        elif amount >= self.risk_thresholds['high_amount'] * 0.5:
            risk_score = 25
            risk_factors.append(f"Moderate amount: {amount:.2f} MYR")
        else:
            risk_score = 5
            risk_factors.append(f"Normal amount: {amount:.2f} MYR")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'amount_myr': amount
        }
    
    async def _check_frequency_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check frequency-based risk (mock implementation)"""
        # In production, this would query the database for recent transactions
        await asyncio.sleep(0.05)  # Simulate DB query
        
        # Mock frequency data
        user_id = data.get('user_id')
        recent_txn_count = 3  # Mock: user has 3 transactions in last hour
        
        risk_score = 0
        risk_factors = []
        
        if recent_txn_count >= self.risk_thresholds['suspicious_frequency']:
            risk_score = 70
            risk_factors.append(f"Suspicious frequency: {recent_txn_count} txns/hour")
        elif recent_txn_count >= self.risk_thresholds['suspicious_frequency'] * 0.6:
            risk_score = 40
            risk_factors.append(f"High frequency: {recent_txn_count} txns/hour")
        elif recent_txn_count >= 5:
            risk_score = 20
            risk_factors.append(f"Moderate frequency: {recent_txn_count} txns/hour")
        else:
            risk_score = 5
            risk_factors.append(f"Normal frequency: {recent_txn_count} txns/hour")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'recent_transaction_count': recent_txn_count
        }
    
    async def _check_velocity_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check velocity-based risk (daily spending limit)"""
        # Mock implementation
        await asyncio.sleep(0.05)
        
        user_id = data.get('user_id')
        daily_total = 5500.0  # Mock: user has spent 5500 MYR today
        current_amount = float(data.get('amount', 0))
        
        projected_total = daily_total + current_amount
        
        risk_score = 0
        risk_factors = []
        
        if projected_total >= self.risk_thresholds['velocity_limit']:
            risk_score = 75
            risk_factors.append(f"Velocity limit exceeded: {projected_total:.2f} MYR/day")
        elif projected_total >= self.risk_thresholds['velocity_limit'] * 0.8:
            risk_score = 45
            risk_factors.append(f"High velocity: {projected_total:.2f} MYR/day")
        elif projected_total >= self.risk_thresholds['velocity_limit'] * 0.5:
            risk_score = 20
            risk_factors.append(f"Moderate velocity: {projected_total:.2f} MYR/day")
        else:
            risk_score = 5
            risk_factors.append(f"Normal velocity: {projected_total:.2f} MYR/day")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'daily_total': daily_total,
            'projected_total': projected_total
        }
    
    async def _check_time_pattern_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check time-based risk patterns"""
        current_hour = datetime.utcnow().hour
        
        risk_score = 0
        risk_factors = []
        
        # High-risk hours (late night/early morning)
        if current_hour >= 23 or current_hour <= 5:
            risk_score = 30
            risk_factors.append(f"Late night transaction: {current_hour}:00")
        elif current_hour <= 7:
            risk_score = 15
            risk_factors.append(f"Early morning transaction: {current_hour}:00")
        else:
            risk_score = 5
            risk_factors.append(f"Normal hours transaction: {current_hour}:00")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'transaction_hour': current_hour
        }
    
    async def _check_merchant_reputation_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check merchant reputation risk"""
        merchant_id = data.get('merchant_id')
        
        # Mock merchant reputation data
        merchant_reputation = {
            'MERCH_001': {'score': 95, 'category': 'trusted'},
            'MERCH_002': {'score': 60, 'category': 'moderate'},
            'UNKNOWN': {'score': 30, 'category': 'unknown'}
        }
        
        merchant_data = merchant_reputation.get(merchant_id, merchant_reputation['UNKNOWN'])
        merchant_score = merchant_data['score']
        
        # Invert score for risk (high reputation = low risk)
        risk_score = max(0, 100 - merchant_score) * 0.3
        
        risk_factors = [f"Merchant reputation: {merchant_data['category']} ({merchant_score}/100)"]
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'merchant_reputation': merchant_data
        }
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Get risk level based on score"""
        if risk_score >= 85:
            return 'CRITICAL'
        elif risk_score >= 70:
            return 'HIGH'
        elif risk_score >= 40:
            return 'MEDIUM'
        elif risk_score >= 20:
            return 'LOW'
        else:
            return 'MINIMAL'
    
    def _determine_action(self, risk_score: float) -> Dict[str, Any]:
        """Determine action based on risk score"""
        if risk_score >= self.config['auto_block_threshold']:
            return {
                'action': 'BLOCK',
                'reason': 'High risk transaction blocked automatically',
                'require_approval': False
            }
        elif risk_score >= self.config['manual_review_threshold']:
            return {
                'action': 'MANUAL_REVIEW',
                'reason': 'Transaction requires manual review',
                'require_approval': True
            }
        else:
            return {
                'action': 'APPROVE',
                'reason': 'Low risk transaction approved',
                'require_approval': False
            }
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input data for risk assessment"""
        required_fields = ['amount', 'user_id']
        
        for field in required_fields:
            if field not in data:
                return False
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return False
        except (ValueError, TypeError):
            return False
        
        return True 
Risk Checker Plugin for SatuPay Payment Switch
Analyzes transaction risk and applies risk management rules
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List
from .plugin_manager import BasePlugin

class RiskCheckerPlugin(BasePlugin):
    """Risk Checker Plugin for transaction risk assessment"""
    
    def __init__(self):
        super().__init__()
        self.name = "Risk Checker"
        self.version = "1.0.0"
        self.description = "Transaction risk assessment and fraud detection"
        self.critical = False
        
        # Risk thresholds
        self.risk_thresholds = {
            'high_amount': 10000.0,  # MYR
            'very_high_amount': 50000.0,  # MYR
            'suspicious_frequency': 10,  # transactions per hour
            'velocity_limit': 50000.0,  # MYR per day
            'international_limit': 25000.0,  # MYR for international
            'max_risk_score': 85  # Block if risk score > 85
        }
        
        # Risk factors weights
        self.risk_weights = {
            'amount_factor': 0.3,
            'frequency_factor': 0.25,
            'velocity_factor': 0.2,
            'time_factor': 0.1,
            'merchant_factor': 0.1,
            'location_factor': 0.05
        }
        
        self.config = {
            'enabled_checks': [
                'amount_check',
                'frequency_check', 
                'velocity_check',
                'time_pattern_check',
                'merchant_reputation_check'
            ],
            'auto_block_threshold': 85,
            'manual_review_threshold': 70,
            'risk_thresholds': self.risk_thresholds
        }
    
    async def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute risk assessment"""
        try:
            risk_assessment = await self._perform_risk_assessment(data)
            
            # Determine action based on risk score
            action = self._determine_action(risk_assessment['risk_score'])
            
            return {
                'success': True,
                'data': {
                    'risk_assessment': risk_assessment,
                    'risk_action': action,
                    'risk_checks_completed': True
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Risk assessment failed: {str(e)}",
                'critical': False
            }
    
    async def _perform_risk_assessment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive risk assessment"""
        
        risk_factors = {}
        total_risk_score = 0
        
        # Amount-based risk
        if 'amount_check' in self.config['enabled_checks']:
            amount_risk = await self._check_amount_risk(data)
            risk_factors['amount_risk'] = amount_risk
            total_risk_score += amount_risk['score'] * self.risk_weights['amount_factor']
        
        # Frequency-based risk
        if 'frequency_check' in self.config['enabled_checks']:
            frequency_risk = await self._check_frequency_risk(data)
            risk_factors['frequency_risk'] = frequency_risk
            total_risk_score += frequency_risk['score'] * self.risk_weights['frequency_factor']
        
        # Velocity-based risk
        if 'velocity_check' in self.config['enabled_checks']:
            velocity_risk = await self._check_velocity_risk(data)
            risk_factors['velocity_risk'] = velocity_risk
            total_risk_score += velocity_risk['score'] * self.risk_weights['velocity_factor']
        
        # Time pattern risk
        if 'time_pattern_check' in self.config['enabled_checks']:
            time_risk = await self._check_time_pattern_risk(data)
            risk_factors['time_risk'] = time_risk
            total_risk_score += time_risk['score'] * self.risk_weights['time_factor']
        
        # Merchant reputation risk
        if 'merchant_reputation_check' in self.config['enabled_checks']:
            merchant_risk = await self._check_merchant_reputation_risk(data)
            risk_factors['merchant_risk'] = merchant_risk
            total_risk_score += merchant_risk['score'] * self.risk_weights['merchant_factor']
        
        return {
            'risk_score': min(round(total_risk_score, 1), 100),
            'risk_level': self._get_risk_level(total_risk_score),
            'risk_factors': risk_factors,
            'assessment_timestamp': datetime.utcnow().isoformat()
        }
    
    async def _check_amount_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check amount-based risk"""
        amount = float(data.get('amount', 0))
        currency = data.get('currency', 'MYR')
        
        # Convert to MYR if needed (simplified)
        if currency != 'MYR':
            # Use rough conversion rates for risk assessment
            conversion_rates = {'USD': 4.7, 'SGD': 3.5, 'EUR': 5.1}
            amount = amount * conversion_rates.get(currency, 1)
        
        risk_score = 0
        risk_factors = []
        
        if amount >= self.risk_thresholds['very_high_amount']:
            risk_score = 80
            risk_factors.append(f"Very high amount: {amount:.2f} MYR")
        elif amount >= self.risk_thresholds['high_amount']:
            risk_score = 50
            risk_factors.append(f"High amount: {amount:.2f} MYR")
        elif amount >= self.risk_thresholds['high_amount'] * 0.5:
            risk_score = 25
            risk_factors.append(f"Moderate amount: {amount:.2f} MYR")
        else:
            risk_score = 5
            risk_factors.append(f"Normal amount: {amount:.2f} MYR")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'amount_myr': amount
        }
    
    async def _check_frequency_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check frequency-based risk (mock implementation)"""
        # In production, this would query the database for recent transactions
        await asyncio.sleep(0.05)  # Simulate DB query
        
        # Mock frequency data
        user_id = data.get('user_id')
        recent_txn_count = 3  # Mock: user has 3 transactions in last hour
        
        risk_score = 0
        risk_factors = []
        
        if recent_txn_count >= self.risk_thresholds['suspicious_frequency']:
            risk_score = 70
            risk_factors.append(f"Suspicious frequency: {recent_txn_count} txns/hour")
        elif recent_txn_count >= self.risk_thresholds['suspicious_frequency'] * 0.6:
            risk_score = 40
            risk_factors.append(f"High frequency: {recent_txn_count} txns/hour")
        elif recent_txn_count >= 5:
            risk_score = 20
            risk_factors.append(f"Moderate frequency: {recent_txn_count} txns/hour")
        else:
            risk_score = 5
            risk_factors.append(f"Normal frequency: {recent_txn_count} txns/hour")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'recent_transaction_count': recent_txn_count
        }
    
    async def _check_velocity_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check velocity-based risk (daily spending limit)"""
        # Mock implementation
        await asyncio.sleep(0.05)
        
        user_id = data.get('user_id')
        daily_total = 5500.0  # Mock: user has spent 5500 MYR today
        current_amount = float(data.get('amount', 0))
        
        projected_total = daily_total + current_amount
        
        risk_score = 0
        risk_factors = []
        
        if projected_total >= self.risk_thresholds['velocity_limit']:
            risk_score = 75
            risk_factors.append(f"Velocity limit exceeded: {projected_total:.2f} MYR/day")
        elif projected_total >= self.risk_thresholds['velocity_limit'] * 0.8:
            risk_score = 45
            risk_factors.append(f"High velocity: {projected_total:.2f} MYR/day")
        elif projected_total >= self.risk_thresholds['velocity_limit'] * 0.5:
            risk_score = 20
            risk_factors.append(f"Moderate velocity: {projected_total:.2f} MYR/day")
        else:
            risk_score = 5
            risk_factors.append(f"Normal velocity: {projected_total:.2f} MYR/day")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'daily_total': daily_total,
            'projected_total': projected_total
        }
    
    async def _check_time_pattern_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check time-based risk patterns"""
        current_hour = datetime.utcnow().hour
        
        risk_score = 0
        risk_factors = []
        
        # High-risk hours (late night/early morning)
        if current_hour >= 23 or current_hour <= 5:
            risk_score = 30
            risk_factors.append(f"Late night transaction: {current_hour}:00")
        elif current_hour <= 7:
            risk_score = 15
            risk_factors.append(f"Early morning transaction: {current_hour}:00")
        else:
            risk_score = 5
            risk_factors.append(f"Normal hours transaction: {current_hour}:00")
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'transaction_hour': current_hour
        }
    
    async def _check_merchant_reputation_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Check merchant reputation risk"""
        merchant_id = data.get('merchant_id')
        
        # Mock merchant reputation data
        merchant_reputation = {
            'MERCH_001': {'score': 95, 'category': 'trusted'},
            'MERCH_002': {'score': 60, 'category': 'moderate'},
            'UNKNOWN': {'score': 30, 'category': 'unknown'}
        }
        
        merchant_data = merchant_reputation.get(merchant_id, merchant_reputation['UNKNOWN'])
        merchant_score = merchant_data['score']
        
        # Invert score for risk (high reputation = low risk)
        risk_score = max(0, 100 - merchant_score) * 0.3
        
        risk_factors = [f"Merchant reputation: {merchant_data['category']} ({merchant_score}/100)"]
        
        return {
            'score': risk_score,
            'factors': risk_factors,
            'merchant_reputation': merchant_data
        }
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Get risk level based on score"""
        if risk_score >= 85:
            return 'CRITICAL'
        elif risk_score >= 70:
            return 'HIGH'
        elif risk_score >= 40:
            return 'MEDIUM'
        elif risk_score >= 20:
            return 'LOW'
        else:
            return 'MINIMAL'
    
    def _determine_action(self, risk_score: float) -> Dict[str, Any]:
        """Determine action based on risk score"""
        if risk_score >= self.config['auto_block_threshold']:
            return {
                'action': 'BLOCK',
                'reason': 'High risk transaction blocked automatically',
                'require_approval': False
            }
        elif risk_score >= self.config['manual_review_threshold']:
            return {
                'action': 'MANUAL_REVIEW',
                'reason': 'Transaction requires manual review',
                'require_approval': True
            }
        else:
            return {
                'action': 'APPROVE',
                'reason': 'Low risk transaction approved',
                'require_approval': False
            }
    
    def validate_input(self, data: Dict[str, Any]) -> bool:
        """Validate input data for risk assessment"""
        required_fields = ['amount', 'user_id']
        
        for field in required_fields:
            if field not in data:
                return False
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return False
        except (ValueError, TypeError):
            return False
        
        return True 