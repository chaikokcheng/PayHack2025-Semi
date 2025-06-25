import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from datetime import datetime
import joblib
import logging
from typing import Tuple, Dict, Any

class DataPreprocessor:
    """Handle data preprocessing for payment routing model"""
    
    def __init__(self):
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = [
            'amount', 'amount_log', 'hour', 'day_of_week', 'is_weekend',
            'is_high_value', 'country_encoded', 'payment_method_encoded',
            'merchant_category_encoded', 'fraud_score'
        ]
        
    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load transaction data from CSV"""
        try:
            df = pd.read_csv(file_path)
            logging.info(f"Loaded {len(df)} transactions from {file_path}")
            return df
        except Exception as e:
            logging.error(f"Error loading data: {e}")
            raise
    
    def feature_engineering(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features from raw transaction data"""
        df = df.copy()
        
        # Ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        else:
            df['timestamp'] = pd.to_datetime('2024-01-01')  # Default for demo
        
        # Numerical features
        df['amount_log'] = np.log1p(df['amount'])
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_high_value'] = (df['amount'] > 1000).astype(int)
        
        # Handle missing fraud_score
        if 'fraud_score' not in df.columns:
            df['fraud_score'] = np.random.uniform(0, 0.1, len(df))
        
        # Handle missing categorical columns
        for col in ['country', 'payment_method', 'merchant_category']:
            if col not in df.columns:
                df[col] = 'unknown'
        
        return df
    
    def encode_categorical_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Encode categorical features"""
        df = df.copy()
        
        categorical_cols = ['country', 'payment_method', 'merchant_category']
        
        for col in categorical_cols:
            if col in df.columns:
                if fit:
                    # Fit encoder during training
                    if col not in self.label_encoders:
                        self.label_encoders[col] = LabelEncoder()
                    df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Transform during prediction
                    if col in self.label_encoders:
                        # Handle unseen categories
                        df[f'{col}_encoded'] = df[col].astype(str).map(
                            lambda x: self.label_encoders[col].transform([x])[0] 
                            if x in self.label_encoders[col].classes_ else 0
                        )
                    else:
                        df[f'{col}_encoded'] = 0
        
        return df
    
    def create_target_variable(self, df: pd.DataFrame) -> pd.Series:
        """Create target variable (best PSP) from transaction outcomes"""
        # This is a simplified approach - in practice, you'd have more sophisticated logic
        targets = []
        
        for _, row in df.iterrows():
            # Determine best PSP based on transaction characteristics
            if row.get('status') == 'success' and row.get('processing_time_ms', 200) < 200:
                # If transaction was successful and fast, use actual PSP
                targets.append(row.get('psp', 'stripe'))
            else:
                # Otherwise, determine optimal PSP based on rules
                if row['amount'] > 1000:
                    targets.append('adyen')  # Reliable for high-value
                elif row.get('country') in ['US', 'CA']:
                    targets.append('stripe')
                elif row.get('country') in ['IN', 'SG']:
                    targets.append('razorpay')
                elif row.get('payment_method') == 'wallet':
                    targets.append('paypal')
                else:
                    targets.append('stripe')  # Default
        
        return pd.Series(targets)
    
    def prepare_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """Prepare final feature matrix"""
        # Feature engineering
        df = self.feature_engineering(df)
        
        # Encode categorical features
        df = self.encode_categorical_features(df, fit=fit)
        
        # Select final features
        available_features = [col for col in self.feature_columns if col in df.columns]
        if len(available_features) < len(self.feature_columns):
            missing = set(self.feature_columns) - set(available_features)
            logging.warning(f"Missing features: {missing}")
            
            # Add missing features with default values
            for col in missing:
                df[col] = 0
        
        return df[self.feature_columns]
    
    def scale_features(self, X: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """Scale numerical features"""
        if fit:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = self.scaler.transform(X)
        
        return X_scaled
    
    def save_preprocessor(self, filepath: str):
        """Save preprocessor objects"""
        preprocessor_data = {
            'label_encoders': self.label_encoders,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns
        }
        joblib.dump(preprocessor_data, filepath)
        logging.info(f"Preprocessor saved to {filepath}")
    
    def load_preprocessor(self, filepath: str):
        """Load preprocessor objects"""
        try:
            preprocessor_data = joblib.load(filepath)
            self.label_encoders = preprocessor_data['label_encoders']
            self.scaler = preprocessor_data['scaler']
            self.feature_columns = preprocessor_data['feature_columns']
            logging.info(f"Preprocessor loaded from {filepath}")
            return True
        except Exception as e:
            logging.error(f"Error loading preprocessor: {e}")
            return False