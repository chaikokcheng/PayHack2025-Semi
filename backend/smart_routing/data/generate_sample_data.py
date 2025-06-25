# =============================================================================
# smart_routing/generate_sample_data.py - Run this ONCE to create sample data
# =============================================================================
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_sample_transactions(n_samples=5000):
    """Generate sample transaction data for training"""
    np.random.seed(42)
    random.seed(42)
    
    # Transaction parameters
    amounts = np.random.lognormal(mean=3, sigma=1.5, size=n_samples)
    amounts = np.clip(amounts, 10, 50000)  # Reasonable range
    
    countries = np.random.choice([
        'US', 'UK', 'IN', 'CA', 'DE', 'FR', 'AU', 'SG', 'JP', 'BR'
    ], size=n_samples, p=[0.3, 0.15, 0.1, 0.08, 0.07, 0.06, 0.05, 0.05, 0.04, 0.1])
    
    payment_methods = np.random.choice([
        'card', 'wallet', 'bank', 'crypto'
    ], size=n_samples, p=[0.6, 0.25, 0.1, 0.05])
    
    merchant_categories = np.random.choice([
        'retail', 'digital', 'food', 'travel', 'finance', 'gaming'
    ], size=n_samples, p=[0.3, 0.2, 0.15, 0.15, 0.1, 0.1])
    
    currencies = np.random.choice([
        'USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD', 'JPY', 'BRL'
    ], size=n_samples, p=[0.4, 0.2, 0.1, 0.08, 0.05, 0.04, 0.03, 0.05, 0.05])
    
    # Generate timestamps (last 6 months)
    start_date = datetime.now() - timedelta(days=180)
    timestamps = [
        start_date + timedelta(
            days=random.randint(0, 180),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        ) for _ in range(n_samples)
    ]
    
    # Generate PSPs based on realistic rules
    psps = []
    processing_times = []
    statuses = []
    costs = []
    
    psp_configs = {
        'stripe': {'base_cost': 0.029, 'fixed_fee': 0.30, 'success_rate': 0.94, 'avg_time': 120},
        'paypal': {'base_cost': 0.034, 'fixed_fee': 0.49, 'success_rate': 0.91, 'avg_time': 180},
        'razorpay': {'base_cost': 0.024, 'fixed_fee': 0.25, 'success_rate': 0.89, 'avg_time': 140},
        'square': {'base_cost': 0.026, 'fixed_fee': 0.10, 'success_rate': 0.92, 'avg_time': 110},
        'adyen': {'base_cost': 0.028, 'fixed_fee': 0.12, 'success_rate': 0.95, 'avg_time': 100}
    }
    
    for i in range(n_samples):
        # Rule-based PSP selection (simulating historical decisions)
        if amounts[i] > 1000:
            psp = 'adyen'  # High value -> reliable PSP
        elif countries[i] in ['US', 'CA']:
            psp = 'stripe'  # North America
        elif countries[i] in ['IN', 'SG']:
            psp = 'razorpay'  # Asia
        elif payment_methods[i] == 'wallet':
            psp = 'paypal'  # Wallet preference
        else:
            psp = random.choice(['stripe', 'square', 'adyen'])
        
        psps.append(psp)
        
        # Generate processing time with some randomness
        base_time = psp_configs[psp]['avg_time']
        processing_time = max(50, int(np.random.normal(base_time, 30)))
        processing_times.append(processing_time)
        
        # Generate status based on PSP success rate and other factors
        success_rate = psp_configs[psp]['success_rate']
        
        # Reduce success rate for high amounts and certain countries
        if amounts[i] > 5000:
            success_rate *= 0.9
        if countries[i] in ['BR', 'IN']:
            success_rate *= 0.95
        
        status = 'success' if random.random() < success_rate else 'failed'
        statuses.append(status)
        
        # Calculate cost
        cost = amounts[i] * psp_configs[psp]['base_cost'] + psp_configs[psp]['fixed_fee']
        costs.append(round(cost, 2))
    
    # Generate fraud scores
    fraud_scores = np.random.beta(1, 20, n_samples)  # Most transactions low fraud score
    
    # Create DataFrame
    df = pd.DataFrame({
        'transaction_id': [f'txn_{i:06d}' for i in range(n_samples)],
        'amount': np.round(amounts, 2),
        'currency': currencies,
        'country': countries,
        'payment_method': payment_methods,
        'merchant_category': merchant_categories,
        'psp': psps,
        'status': statuses,
        'timestamp': timestamps,
        'processing_time_ms': processing_times,
        'cost': costs,
        'fraud_score': np.round(fraud_scores, 3)
    })
    
    return df

if __name__ == "__main__":
    print("Generating sample transaction data...")
    df = generate_sample_transactions(5000)
    
    # Create data directory
    import os
    os.makedirs('data', exist_ok=True)
    
    # Save to CSV
    df.to_csv('data/transactions.csv', index=False)
    print(f"Generated {len(df)} sample transactions")
    print(f"Saved to data/transactions.csv")
    
    # Show sample
    print("\nSample data:")
    print(df.head())
    
    print(f"\nData distribution:")
    print(f"PSPs: {df['psp'].value_counts().to_dict()}")
    print(f"Countries: {df['country'].value_counts().to_dict()}")
    print(f"Status: {df['status'].value_counts().to_dict()}")