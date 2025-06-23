# 🚀 PinkPay Payment Switch - Quick Start Guide

Get the Flask backend running in **2 minutes**!

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python run_server.py
```

The server will start on `http://localhost:5000`

## 🧪 Test the System

### Option 1: Run Automated Tests

```bash
python test_api.py
```

### Option 2: Manual API Testing

#### Health Check

```bash
curl http://localhost:5000/health
```

#### Create Payment

```bash
curl -X POST http://localhost:5000/api/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.50,
    "currency": "MYR",
    "payment_method": "qr",
    "merchant_id": "DEMO_MERCHANT",
    "user_id": "demo_user"
  }'
```

#### TNG QR → Boost Payment Demo

```bash
curl -X POST http://localhost:5000/api/qr/demo/tng-boost \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "DEMO_MERCHANT_001",
    "amount": 25.00
  }'
```

#### Dashboard Overview

```bash
curl http://localhost:5000/api/dashboard/overview
```

## 🐳 Docker Quick Start

### Build and Run

```bash
docker-compose up --build
```

### Access APIs

- Backend: http://localhost:5000
- Health: http://localhost:5000/health
- Dashboard: http://localhost:5000/api/dashboard/overview

## 📊 Key Endpoints

| Endpoint                  | Method | Description         |
| ------------------------- | ------ | ------------------- |
| `/health`                 | GET    | System health check |
| `/api/pay`                | POST   | Process payment     |
| `/api/payoffline`         | POST   | Offline tokens      |
| `/api/status/<txn_id>`    | GET    | Transaction status  |
| `/api/qr/demo/tng-boost`  | POST   | QR workflow demo    |
| `/api/dashboard/overview` | GET    | Dashboard data      |

## 🔧 Configuration

Default configuration works out of the box with Supabase. For custom setup:

1. Copy `.env.example` to `.env`
2. Update Supabase credentials if needed
3. Restart server

## 🏆 Demo Features

1. **Payment Processing** - Multi-currency with plugin orchestration
2. **QR Workflow** - TNG QR code → Boost wallet payment routing
3. **Plugin System** - FX conversion, risk assessment, token handling
4. **Dashboard** - Real-time transaction monitoring
5. **Offline Tokens** - Generate and redeem payment tokens

## 🆘 Troubleshooting

**Server won't start?**

- Check Python version (3.9+ required)
- Install missing dependencies: `pip install -r requirements.txt`

**Database errors?**

- Supabase is pre-configured and should work automatically
- Check internet connection for Supabase access

**Tests failing?**

- Ensure server is running: `python run_server.py`
- Check port 5000 is available

## 📈 Next Steps

1. Run the test suite: `python test_api.py`
2. Explore the dashboard: `http://localhost:5000/api/dashboard/overview`
3. Try the QR demo: See test script for examples
4. Check plugin logs: Monitor real-time execution
5. Customize plugins: Add your own business logic

**Ready for PayHack2025 presentation!** 🏆
