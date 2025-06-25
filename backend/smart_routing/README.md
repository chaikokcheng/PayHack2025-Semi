"""
# Smart Payment Router

## Setup Instructions

### 1. Initial Setup (Do Once)
```bash
# Install dependencies
pip install -r requirements.txt

# Generate sample data (do this ONCE)
python generate_sample_data.py
```

### 2. Train Model (Do Once or When Retraining)
```bash
# Train the model
python src/train_model.py

# Or with custom parameters
python src/train_model.py --data data/transactions.csv --model_output models/best_gateway_model.pkl
```

### 3. Run Production Server (Every Time)
```bash
# Start the API server
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Usage

### Route a Payment
```bash
curl -X POST "http://localhost:8000/route" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 150.00,
       "country": "US",
       "payment_method": "card",
       "merchant_category": "retail"
     }'
```

Response:
```json
{
  "recommended_gateway": "stripe",
  "confidence": 0.89,
  "fallback_used": false,
  "model_info": {
    "is_loaded": true,
    "performance": {
      "test_accuracy": 0.92,
      "cv_mean": 0.91
    }
  }
}
```

### Check Health
```bash
curl http://localhost:8000/health
```

## Architecture Benefits

1. **Separation of Concerns**: Training and prediction are separate
2. **Production Ready**: Model loads once at startup, not per request
3. **Scalable**: API can handle many requests without retraining
4. **Maintainable**: Clear file structure and responsibilities
5. **Robust**: Fallback mechanism when ML confidence is low

## When to Retrain

- Weekly/Monthly with new transaction data
- When you notice performance degradation
- When adding new PSPs or changing business rules
- Use cron job or scheduled task for automatic retraining

## File Structure Explained

- `data/`: Training data storage
- `models/`: Saved models and preprocessors
- `src/preprocess.py`: Data preprocessing logic
- `src/train_model.py`: Model training script
- `src/predict.py`: Production prediction logic
- `main.py`: FastAPI server (loads model once)
- `requirements.txt`: Dependencies
"""