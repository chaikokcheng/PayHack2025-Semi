import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta
import random
import json
from geopy.distance import geodesic

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

def generate_sample_transaction_data(num_samples=10000, fraud_percentage=0.05):
    """
    Generate sample transaction data for fraud detection model training
    
    Args:
        num_samples (int): Number of transaction samples to generate
        fraud_percentage (float): Percentage of fraudulent transactions (0.0 to 1.0)
    
    Returns:
        pd.DataFrame: Generated transaction data
    """
    
    # Common merchant data
    merchants = [
        "Amazon", "Walmart", "Target", "Best Buy", "McDonald's", "Starbucks",
        "Shell", "Exxon", "CVS", "Walgreens", "Home Depot", "Costco",
        "Apple Store", "Google Play", "Netflix", "Uber", "Lyft", "Airbnb"
    ]
    
    # Payment methods and rails
    payment_methods = ["credit_card", "debit_card", "digital_wallet", "bank_transfer", "crypto"]
    payment_rails = ["visa", "mastercard", "amex", "paypal", "stripe", "square", "bitcoin"]
    
    # Currency codes
    currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "INR"]
    
    # Status options
    statuses = ["completed", "pending", "failed", "cancelled", "disputed"]
    
    # Major cities with coordinates for location generation
    cities = [
        ("New York", 40.7128, -74.0060),
        ("Los Angeles", 34.0522, -118.2437),
        ("Chicago", 41.8781, -87.6298),
        ("Houston", 29.7604, -95.3698),
        ("London", 51.5074, -0.1278),
        ("Paris", 48.8566, 2.3522),
        ("Tokyo", 35.6762, 139.6503),
        ("Sydney", -33.8688, 151.2093),
        ("Toronto", 43.6532, -79.3832),
        ("Berlin", 52.5200, 13.4050)
    ]
    
    data = []
    user_location_history = {}  # Track user locations for distance calculation
    
    num_fraud = int(num_samples * fraud_percentage)
    fraud_indices = set(random.sample(range(num_samples), num_fraud))
    
    for i in range(num_samples):
        is_fraud = i in fraud_indices
        
        # Generate base transaction data
        txn_id = f"txn_{uuid.uuid4().hex[:12]}"
        user_id = f"user_{uuid.uuid4()}"
        merchant_id = f"merchant_{uuid.uuid4().hex[:8]}"
        qr_code_id = f"qr_{uuid.uuid4()}" if random.random() > 0.3 else None
        
        # Timestamps
        created_at = datetime.now() - timedelta(days=random.randint(1, 365))
        processed_at = created_at + timedelta(minutes=random.randint(1, 30))
        completed_at = processed_at + timedelta(minutes=random.randint(1, 60)) if random.random() > 0.1 else None
        updated_at = max(processed_at, completed_at) if completed_at else processed_at
        
        # Location data
        current_city = random.choice(cities)
        current_location = (
            current_city[1] + random.uniform(-0.1, 0.1),  # Add some noise
            current_city[2] + random.uniform(-0.1, 0.1)
        )
        
        # Calculate location difference
        if user_id in user_location_history:
            previous_location = user_location_history[user_id]
            location_difference = geodesic(previous_location, current_location).kilometers
        else:
            location_difference = 0.0  # First transaction for this user
        
        user_location_history[user_id] = current_location
        
        # Generate amounts based on fraud likelihood
        if is_fraud:
            # Fraudulent transactions tend to be either very small (testing) or very large
            if random.random() < 0.3:
                amount = round(random.uniform(1, 10), 2)  # Small test amounts
            else:
                amount = round(random.uniform(500, 5000), 2)  # Large suspicious amounts
        else:
            # Normal transaction amounts follow more typical patterns
            amount = round(np.random.lognormal(mean=3, sigma=1), 2)
            amount = max(1.0, min(amount, 1000.0))  # Cap between $1-$1000
        
        # Currency conversion
        currency = random.choice(currencies)
        if currency == "USD":
            original_amount = amount
            original_currency = currency
        else:
            # Simulate currency conversion
            exchange_rate = random.uniform(0.5, 2.0)
            original_amount = round(amount * exchange_rate, 2)
            original_currency = currency
            currency = "USD"  # Convert to USD
        
        # Merchant selection
        merchant_name = random.choice(merchants)
        
        # Payment method and rail
        payment_method = random.choice(payment_methods)
        payment_rail = random.choice(payment_rails)
        
        # Status based on fraud
        if is_fraud:
            status = random.choices(
                ["failed", "disputed", "cancelled", "completed"], 
                weights=[0.4, 0.3, 0.2, 0.1]
            )[0]
        else:
            status = random.choices(
                ["completed", "pending", "failed"], 
                weights=[0.85, 0.10, 0.05]
            )[0]
        
        # Transaction metadata (additional features for fraud detection)
        device_info = {
            "device_type": random.choice(["mobile", "desktop", "tablet"]),
            "browser": random.choice(["chrome", "firefox", "safari", "edge"]),
            "ip_country": random.choice(["US", "CA", "UK", "DE", "FR", "AU"]),
            "is_vpn": random.random() < (0.3 if is_fraud else 0.05)
        }
        
        # Time-based features that can indicate fraud
        hour_of_day = created_at.hour
        is_weekend = created_at.weekday() >= 5
        is_night_transaction = hour_of_day < 6 or hour_of_day > 22
        
        # Velocity features (simulated)
        transactions_last_hour = np.random.poisson(2 if is_fraud else 0.5)
        transactions_last_day = np.random.poisson(10 if is_fraud else 3)
        
        # Add velocity and behavioral features to metadata
        device_info.update({
            "hour_of_day": hour_of_day,
            "is_weekend": is_weekend,
            "is_night_transaction": is_night_transaction,
            "transactions_last_hour": transactions_last_hour,
            "transactions_last_day": transactions_last_day,
            "location_lat": current_location[0],
            "location_lon": current_location[1]
        })
        
        record = {
            "id": str(uuid.uuid4()),
            "txn_id": txn_id,
            "user_id": user_id,
            "amount": amount,
            "currency": currency,
            "original_amount": original_amount,
            "original_currency": original_currency,
            "merchant_id": merchant_id,
            "merchant_name": merchant_name,
            "payment_method": payment_method,
            "payment_rail": payment_rail,
            "status": status,
            "qr_code_id": qr_code_id,
            "transaction_metadata": json.dumps(device_info),
            "processed_at": processed_at.isoformat(),
            "completed_at": completed_at.isoformat() if completed_at else None,
            "created_at": created_at.isoformat(),
            "updated_at": updated_at.isoformat(),
            "location_difference": round(location_difference, 2),
            "is_fraud": int(is_fraud)  # Target variable for supervised learning
        }
        
        data.append(record)
    
    return pd.DataFrame(data)

def save_data_to_files(df, filename_prefix='fraud_detection'):
    """
    Save generated data to CSV files
    
    Args:
        df (pd.DataFrame): Generated transaction data
        filename_prefix (str): Prefix for output files
    """
    
    # Save main dataset
    main_filename = f'{filename_prefix}_data.csv'
    df.to_csv(main_filename, index=False)
    print(f"Main dataset saved to '{main_filename}'")
    
    # Create a summary report
    summary = {
        'total_transactions': len(df),
        'fraudulent_transactions': df['is_fraud'].sum(),
        'fraud_rate': f"{df['is_fraud'].mean():.2%}",
        'date_range': f"{df['created_at'].min()} to {df['created_at'].max()}",
        'unique_users': df['user_id'].nunique(),
        'unique_merchants': df['merchant_name'].nunique(),
        'average_amount': f"${df['amount'].mean():.2f}",
        'median_amount': f"${df['amount'].median():.2f}",
        'max_location_difference': f"{df['location_difference'].max():.2f} km",
        'avg_location_difference': f"{df['location_difference'].mean():.2f} km"
    }
    
    summary_filename = f'{filename_prefix}_summary.txt'
    with open(summary_filename, 'w') as f:
        f.write("Transaction Data Summary\n")
        f.write("=" * 25 + "\n\n")
        for key, value in summary.items():
            f.write(f"{key.replace('_', ' ').title()}: {value}\n")
    
    print(f"Summary report saved to '{summary_filename}'")
    
    return main_filename, summary_filename

# Generate and save data immediately
print("Generating sample transaction data...")
df = generate_sample_transaction_data(num_samples=10000, fraud_percentage=0.05)

print(f"Generated {len(df)} transactions with {df['is_fraud'].sum()} fraudulent transactions")
print(f"Fraud rate: {df['is_fraud'].mean():.2%}")

# Display sample data
print("\nFirst 5 rows of generated data:")
print(df.head())

# Save the dataset to specific path
import os
output_path = os.path.join('backend', 'smart_routing', 'data')
os.makedirs(output_path, exist_ok=True)  # Create directory if it doesn't exist

csv_filename = os.path.join(output_path, 'fraud_detection_data.csv')
df.to_csv(csv_filename, index=False)
print(f"\n✅ Data saved to '{csv_filename}'")

# Display basic statistics
print("\nDataset Summary:")
print(f"Total transactions: {len(df)}")
print(f"Fraudulent transactions: {df['is_fraud'].sum()}")
print(f"Legitimate transactions: {len(df) - df['is_fraud'].sum()}")
print(f"Fraud rate: {df['is_fraud'].mean():.2%}")
print(f"Average transaction amount: ${df['amount'].mean():.2f}")
print(f"Average location difference: {df['location_difference'].mean():.2f} km")
print(f"Max location difference: {df['location_difference'].max():.2f} km")

# Show column info
print(f"\nDataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

print(f"\n🎉 Dataset generation complete! Your fraud detection data is ready in '{csv_filename}'")