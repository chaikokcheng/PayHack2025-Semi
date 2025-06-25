import pandas as pd
import joblib
import logging
from datetime import datetime
from typing import Dict, Tuple, Optional
from .preprocess import DataPreprocessor

class PaymentRouterPredictor:
    """Production-ready payment router predictor"""
    
    def __init__(self, model_path: str, preprocessor_path: str):
        self.model = None
        self.preprocessor = DataPreprocessor()
        self.model_performance = {}
        self.is_loaded = False
        
        # Load model and preprocessor
        self.load_model(model_path, preprocessor_path)
    
    def load_model(self, model_path: str, preprocessor_path: str) -> bool:
        """Load trained model and preprocessor"""
        try:
            # Load model
            model_data = joblib.load(model_path)
            self.model = model_data['model']
            self.model_performance = model_data.get('performance', {})
            
            # Load preprocessor
            self.preprocessor.load_preprocessor(preprocessor_path)
            
            self.is_loaded = True
            logging.info(f"Model loaded successfully from {model_path}")
            logging.info(f"Model performance: {self.model_performance}")
            
            return True
            
        except Exception as e:
            logging.error(f"Error loading model: {e}")
            self.is_loaded = False
            return False
    
    def predict_best_gateway(self, transaction: Dict) -> Tuple[str, float]:
        """Predict best payment gateway for a transaction"""
        if not self.is_loaded:
            logging.error("Model not loaded. Cannot make predictions.")
            return self._fallback_prediction(transaction), 0.0
        
        try:
            # Convert transaction to DataFrame
            df = pd.DataFrame([transaction])
            
            # Preprocess
            X = self.preprocessor.prepare_features(df, fit=False)
            X_scaled = self.preprocessor.scale_features(X, fit=False)
            
            # Predict
            prediction = self.model.predict(X_scaled)[0]
            probabilities = self.model.predict_proba(X_scaled)[0]
            confidence = max(probabilities)
            
            logging.info(f"ML Prediction: {prediction} (confidence: {confidence:.3f})")
            
            return prediction, confidence
            
        except Exception as e:
            logging.error(f"Error during prediction: {e}")
            return self._fallback_prediction(transaction), 0.0
    
    def _fallback_prediction(self, transaction: Dict) -> str:
        """Fallback rule-based prediction"""
        amount = transaction.get('amount', 0)
        country = transaction.get('country', 'unknown')
        payment_method = transaction.get('payment_method', 'card')
        
        # Rule-based fallback
        if amount > 1000:
            return 'adyen'
        elif country in ['US', 'CA']:
            return 'stripe'
        elif country in ['IN', 'SG']:
            return 'razorpay'
        elif payment_method == 'wallet':
            return 'paypal'
        else:
            return 'stripe'
    
    def predict_with_fallback(self, transaction: Dict, confidence_threshold: float = 0.7) -> str:
        """Predict with fallback to rule-based routing"""
        prediction, confidence = self.predict_best_gateway(transaction)
        
        if confidence >= confidence_threshold:
            return prediction
        else:
            fallback = self._fallback_prediction(transaction)
            logging.info(f"Using fallback prediction: {fallback} (ML confidence: {confidence:.3f})")
            return fallback
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            'is_loaded': self.is_loaded,
            'performance': self.model_performance,
            'feature_columns': self.preprocessor.feature_columns if self.is_loaded else None
        }