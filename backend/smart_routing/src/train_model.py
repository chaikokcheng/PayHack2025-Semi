import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import joblib
import logging
from preprocess import DataPreprocessor
import argparse
import os

class ModelTrainer:
    """Train payment routing model"""
    
    def __init__(self):
        self.model = None
        self.preprocessor = DataPreprocessor()
        self.model_performance = {}
    
    def train(self, data_path: str, model_save_path: str, preprocessor_save_path: str):
        """Train the routing model"""
        logging.info("Starting model training...")
        
        # Load and preprocess data
        df = self.preprocessor.load_data(data_path)
        X = self.preprocessor.prepare_features(df, fit=True)
        y = self.preprocessor.create_target_variable(df)
        
        # Scale features
        X_scaled = self.preprocessor.scale_features(X, fit=True)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced',
            n_jobs=-1
        )
        
        logging.info("Training Random Forest model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        train_accuracy = accuracy_score(y_train, self.model.predict(X_train))
        test_accuracy = accuracy_score(y_test, self.model.predict(X_test))
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_scaled, y, cv=5)
        
        self.model_performance = {
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
        
        logging.info(f"Model Performance:")
        logging.info(f"  Training Accuracy: {train_accuracy:.4f}")
        logging.info(f"  Test Accuracy: {test_accuracy:.4f}")
        logging.info(f"  CV Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Feature importance
        feature_importance = dict(zip(
            self.preprocessor.feature_columns, 
            self.model.feature_importances_
        ))
        
        logging.info("Top 5 Important Features:")
        for feature, importance in sorted(feature_importance.items(), 
                                        key=lambda x: x[1], reverse=True)[:5]:
            logging.info(f"  {feature}: {importance:.4f}")
        
        # Detailed classification report
        y_pred = self.model.predict(X_test)
        logging.info("\nClassification Report:")
        logging.info(classification_report(y_test, y_pred))
        
        # Save model and preprocessor
        self.save_model(model_save_path)
        self.preprocessor.save_preprocessor(preprocessor_save_path)
        
        return self.model_performance
    
    def save_model(self, filepath: str):
        """Save trained model"""
        model_data = {
            'model': self.model,
            'performance': self.model_performance,
            'feature_columns': self.preprocessor.feature_columns
        }
        joblib.dump(model_data, filepath)
        logging.info(f"Model saved to {filepath}")

def main():
    """Main training script"""
    parser = argparse.ArgumentParser(description='Train payment routing model')
    parser.add_argument('--data', default='data/transactions.csv', 
                       help='Path to training data')
    parser.add_argument('--model_output', default='models/best_gateway_model.pkl',
                       help='Path to save trained model')
    parser.add_argument('--preprocessor_output', default='models/preprocessor.pkl',
                       help='Path to save preprocessor')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, 
                       format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(args.model_output), exist_ok=True)
    
    # Train model
    trainer = ModelTrainer()
    performance = trainer.train(args.data, args.model_output, args.preprocessor_output)
    
    logging.info("Training completed successfully!")
    return performance

if __name__ == "__main__":
    main()