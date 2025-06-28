# SatuPay Supabase Integration Setup

## 🚀 Quick Start

Your SatuPay backend is now integrated with Supabase! Here's how to get started:

### 1. **Automatic Setup (Recommended)**

Run the startup script which handles everything automatically:

```bash
cd backend
python start_with_supabase.py
```

This script will:

- ✅ Set up environment variables automatically
- ✅ Test Supabase connection
- ✅ Create sample data if Supabase is connected
- ✅ Fall back to SQLite if Supabase is unavailable
- ✅ Start the Flask server on http://127.0.0.1:8000

### 2. **Manual Setup**

If you prefer manual setup, create a `.env` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://fpoyrthyyxwawmkwemkt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww

# Flask Configuration
FLASK_HOST=127.0.0.1
FLASK_PORT=8000
FLASK_DEBUG=True
```

Then run:

```bash
python app.py
```

## 🔍 Testing Your Setup

### 1. **Health Check**

```bash
curl http://127.0.0.1:8000/
```

You should see Supabase status in the response:

```json
{
  "success": true,
  "database": {
    "supabase_status": "connected",
    "url": "https://fpoyrthyyxwawmkwemkt.supabase.co"
  }
}
```

### 2. **Direct Supabase Test**

```bash
curl http://127.0.0.1:8000/api/supabase/test
```

### 3. **Dashboard Data (with Supabase)**

```bash
curl http://127.0.0.1:8000/api/dashboard
```

## 📊 Database Schema

Your Supabase database includes these tables:

### **users**

```sql
- id (UUID, Primary Key)
- phone_number (VARCHAR, Unique)
- email (VARCHAR)
- full_name (VARCHAR)
- primary_wallet (VARCHAR) - 'tng', 'boost', etc.
- linked_wallets (JSONB) - Array of wallet types
- kyc_status (VARCHAR) - 'pending', 'verified', 'rejected'
- risk_score (INTEGER) - 0-100
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### **transactions**

```sql
- id (UUID, Primary Key)
- txn_id (VARCHAR, Unique)
- user_id (UUID, Foreign Key)
- amount (DECIMAL)
- currency (VARCHAR) - 'MYR', 'USD', etc.
- merchant_id (VARCHAR)
- payment_method (VARCHAR) - 'qr', 'nfc', 'online'
- payment_rail (VARCHAR) - 'tng_to_boost', 'duitnow', etc.
- status (VARCHAR) - 'pending', 'completed', 'failed'
- metadata (JSONB) - Additional transaction data
- created_at, updated_at (TIMESTAMP)
```

### **qr_codes**

```sql
- id (UUID, Primary Key)
- qr_code_id (VARCHAR, Unique)
- qr_type (VARCHAR) - 'static', 'dynamic'
- merchant_id (VARCHAR)
- amount (DECIMAL)
- payload (JSONB) - QR code data
- status (VARCHAR) - 'active', 'scanned', 'expired'
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### **plugin_logs**

```sql
- id (UUID, Primary Key)
- transaction_id (UUID, Foreign Key)
- plugin_name (VARCHAR) - 'fx_converter', 'risk_checker'
- status (VARCHAR) - 'success', 'error'
- input_data, output_data (JSONB)
- execution_time_ms (INTEGER)
- created_at (TIMESTAMP)
```

## 🛠 Available Services

The `SupabaseService` class provides easy access to all operations:

```python
from src.services.supabase_service import SupabaseService

# User operations
user = SupabaseService.create_user({
    'phone_number': '+60123456789',
    'full_name': 'John Doe',
    'primary_wallet': 'boost'
})

# Transaction operations
txn = SupabaseService.create_transaction({
    'txn_id': 'TXN_123',
    'amount': 50.00,
    'currency': 'MYR'
})

# Analytics
analytics = SupabaseService.get_transaction_analytics()
```

## 🔄 Fallback Behavior

If Supabase is unavailable:

- ✅ App continues running with SQLite
- ✅ All endpoints remain functional
- ✅ Health check shows fallback status
- ✅ No data loss or service interruption

## 📡 API Endpoints Enhanced

All your existing endpoints now work with Supabase:

### **Core Endpoints**

- `GET /` - Shows Supabase connection status
- `GET /health` - Includes Supabase health check
- `GET /api/supabase/test` - Direct Supabase test

### **Payment Endpoints**

- `POST /api/pay` - Stores transactions in Supabase
- `GET /api/status/<txn_id>` - Retrieves from Supabase

### **Dashboard Endpoints**

- `GET /api/dashboard` - Real analytics from Supabase
- `GET /api/transactions` - Transaction history from Supabase

### **QR Code Endpoints**

- `POST /api/qr/generate` - Stores QR data in Supabase
- `POST /api/qr/demo/tng-to-boost` - Demo with Supabase logging

## 🎯 Sample Data

When starting with Supabase, the system automatically creates:

- **Demo User**: `demo@SatuPay.com` with Boost wallet
- **Sample Transaction**: TNG→Boost cross-wallet demo
- **Plugin Logs**: FX conversion and risk check examples

## 🐛 Troubleshooting

### **Connection Issues**

```bash
# Test Supabase directly
curl -H "apikey: YOUR_SUPABASE_KEY" \
     "https://fpoyrthyyxwawmkwemkt.supabase.co/rest/v1/users?select=id"
```

### **Missing Tables**

Tables are created automatically by the models. If missing:

```bash
# Force table creation
python -c "from app import create_app; app = create_app(); app.app_context().push(); from src.database.connection import db; db.create_all()"
```

### **Environment Variables**

Check if variables are set:

```bash
echo $SUPABASE_URL
echo $SUPABASE_KEY
```

## 📈 Next Steps

1. **Set up Supabase Dashboard**: Visit https://supabase.com/dashboard
2. **Configure RLS**: Set up Row Level Security for production
3. **Add Authentication**: Implement Supabase Auth for user management
4. **Real-time Features**: Use Supabase realtime for live dashboard updates
5. **Edge Functions**: Deploy serverless functions to Supabase Edge

## 🔒 Security Notes

- The provided JWT token is an anonymous key for development
- For production, implement proper authentication
- Set up Row Level Security (RLS) policies
- Use service role key for admin operations only

---

Your SatuPay backend is now running with Supabase! 🎉

**Quick Test**: `curl http://127.0.0.1:8000/api/supabase/test`
