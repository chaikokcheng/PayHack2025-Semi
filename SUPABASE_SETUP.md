# 🚀 SatuPay Supabase Setup Guide

Complete guide to set up Supabase for your SatuPay Payment Switch platform.

## 📋 Prerequisites

- Supabase account: https://supabase.com
- Your Supabase project: `https://fpoyrthyyxwawmkwemkt.supabase.co`
- API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (already configured)

## 🗃️ Step 1: Create Database Tables

1. **Open Supabase SQL Editor:**

   - Go to your Supabase Dashboard
   - Navigate to **SQL Editor** in the sidebar
   - Click **New Query**

2. **Run the SQL Setup Script:**

   ```sql
   -- Copy and paste the entire content from: backend/supabase_setup.sql
   ```

   Or copy the content from `backend/supabase_setup.sql` and execute it.

3. **Verify Tables Created:**
   After running the script, you should see these tables:
   - `users` - User accounts and wallet linking
   - `transactions` - Payment transactions
   - `qr_codes` - QR code management
   - `plugin_logs` - Plugin execution logs
   - `offline_tokens` - Offline payment tokens

## 🔧 Step 2: Backend Configuration

### Option A: Automatic Setup (Recommended)

```bash
cd backend
python setup_supabase.py
```

### Option B: Manual Setup

1. **Create `.env` file in the backend directory:**

```bash
cd backend
touch .env
```

2. **Add configuration to `.env`:**

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
JWT_SECRET_KEY=SatuPay-super-secret-jwt-key-payhack2025

# Supabase Configuration
SUPABASE_URL=https://fpoyrthyyxwawmkwemkt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww

# Database Configuration
# Get your password from: Supabase Dashboard > Settings > Database
DB_PASSWORD=your_supabase_db_password_here

# Other configurations...
LOG_LEVEL=DEBUG
PLUGINS_ENABLED=fx_converter,risk_checker,token_handler
```

3. **Install Dependencies:**

```bash
pip install -r requirements.txt
```

## 🎛️ Step 3: Dashboard Configuration

The dashboard is already configured to work with Supabase! The configuration is in:

- `dashboard/src/lib/supabase.ts` - Supabase client and helper functions

## 🧪 Step 4: Test the Setup

### Test Backend Connection:

```bash
cd backend
python -c "
from supabase import create_client
url = 'https://fpoyrthyyxwawmkwemkt.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  # Your key
supabase = create_client(url, key)
result = supabase.table('users').select('*').limit(5).execute()
print(f'✅ Found {len(result.data)} users')
"
```

### Test Dashboard Connection:

1. Start the dashboard: `cd dashboard && npm run dev`
2. Open http://localhost:3000
3. Check the Analytics component for real Supabase data

### Test Backend Server:

```bash
cd backend
python run_server.py
```

Then test: http://127.0.0.1:8000/health

## 📊 Step 5: Verify Data Integration

### Check Demo Data:

After running the SQL script, you should have:

- ✅ 3 demo users (Alice, Bob, Charlie)
- ✅ 4 demo transactions
- ✅ 3 demo QR codes
- ✅ Plugin execution logs

### Dashboard Features with Supabase:

- **Real-time Analytics:** Live data from Supabase
- **Transaction Monitoring:** Direct database queries
- **User Management:** Full CRUD operations
- **QR Code Tracking:** Real-time status updates

## 🔒 Step 6: Security Configuration

### Row Level Security (RLS):

The setup script automatically enables RLS with basic policies. For production:

1. **Update RLS Policies** in Supabase Dashboard > Authentication > Policies
2. **Configure User Authentication** based on your needs
3. **Set up proper access controls** for different user roles

### Environment Variables:

- Keep your `DB_PASSWORD` secure
- Use different keys for development/production
- Never commit `.env` files to version control

## 🚀 Step 7: Start the System

### Backend (Port 8000):

```bash
cd backend
python run_server.py
```

### Dashboard (Port 3000):

```bash
cd dashboard
npm run dev
```

## 🎯 Features Now Available:

### Backend:

- ✅ **Supabase PostgreSQL** connection
- ✅ **Real-time data** storage and retrieval
- ✅ **Cross-wallet routing** with database logging
- ✅ **Plugin system** with execution tracking
- ✅ **Transaction management** with full audit trail

### Dashboard:

- ✅ **Live analytics** from Supabase
- ✅ **Real-time transactions** display
- ✅ **QR code management** interface
- ✅ **System health** monitoring
- ✅ **Interactive testing** tools

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Failed:**

   - Check your `DB_PASSWORD` in `.env`
   - Verify Supabase project URL and key
   - Ensure tables are created (run SQL script)

2. **Import Errors:**

   ```bash
   pip install supabase psycopg2-binary python-dotenv
   ```

3. **Dashboard Not Loading:**

   ```bash
   cd dashboard
   npm install @supabase/supabase-js
   npm run dev
   ```

4. **No Data in Dashboard:**
   - Run the SQL setup script to create demo data
   - Check browser console for errors
   - Verify Supabase RLS policies

### Support:

- Check Supabase logs in Dashboard > Logs
- Review backend logs in `backend/logs/SatuPay.log`
- Test connections with the provided scripts

---

## 🎉 Success!

Your SatuPay Payment Switch is now fully integrated with Supabase, providing:

- **Enterprise-grade database** with PostgreSQL
- **Real-time synchronization** between backend and dashboard
- **Scalable architecture** ready for production
- **Complete audit trail** for all transactions

Perfect for your PayHack2025 demo! 🚀
