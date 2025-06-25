import asyncio
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import uvicorn
from datetime import datetime
import os
from src.predict import PaymentRouterPredictor

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Smart Payment Router", version="1.0.0")

# Initialize predictor (load model once at startup)
MODEL_PATH = "models/best_gateway_model.pkl"
PREPROCESSOR_PATH = "models/preprocessor.pkl"

try:
    predictor = PaymentRouterPredictor(MODEL_PATH, PREPROCESSOR_PATH)
    logger.info("Payment router initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize payment router: {e}")
    predictor = None

class TransactionRequest(BaseModel):
    amount: float
    currency: str = "USD"
    country: str
    payment_method: str
    merchant_category: str = "retail"
    timestamp: Optional[datetime] = None

class RoutingResponse(BaseModel):
    recommended_gateway: str
    confidence: float
    fallback_used: bool
    model_info: Dict

@app.get("/")
async def root():
    return {"message": "Smart Payment Router API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": predictor.is_loaded if predictor else False,
        "timestamp": datetime.now()
    }

@app.post("/route", response_model=RoutingResponse)
async def route_payment(transaction: TransactionRequest):
    """Route payment to optimal gateway"""
    if not predictor or not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not available")
    
    try:
        # Prepare transaction data
        transaction_data = {
            "amount": transaction.amount,
            "currency": transaction.currency,
            "country": transaction.country,
            "payment_method": transaction.payment_method,
            "merchant_category": transaction.merchant_category,
            "timestamp": transaction.timestamp or datetime.now()
        }
        
        # Get prediction
        gateway, confidence = predictor.predict_best_gateway(transaction_data)
        
        # Check if fallback was used
        fallback_used = confidence < 0.7
        if fallback_used:
            gateway = predictor.predict_with_fallback(transaction_data)
        
        return RoutingResponse(
            recommended_gateway=gateway,
            confidence=confidence,
            fallback_used=fallback_used,
            model_info=predictor.get_model_info()
        )
        
    except Exception as e:
        logger.error(f"Routing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/info")
async def get_model_info():
    """Get model information"""
    if not predictor:
        raise HTTPException(status_code=503, detail="Predictor not initialized")
    
    return predictor.get_model_info()

if __name__ == "__main__":
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model file not found at {MODEL_PATH}")
        logger.info("Please run training first: python src/train_model.py")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)