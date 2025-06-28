# SatuPay Payment Switch - Flask Backend

A modern, event-driven payment orchestration system built with Flask for PayHack2025. This backend simulates a real-time payment switch (like DuitNow/PayNet) with modular plugins, QR workflow routing, and comprehensive dashboard management.

## 🚀 Features

### Core Payment Switch

- **Payment Processing**: `/api/pay` - Process real-time payments with plugin orchestration
- **Offline Payments**: `/api/payoffline` - Handle offline payment tokens
- **Transaction Status**: `/api/status/<txn_id>` - Real-time transaction tracking
- **Refund Processing**: `/api/refund` - Full and partial refunds

### QR WorkFlow

- **QR Generation**: Generate TNG, Boost, or merchant QR codes
- **Cross-Wallet Routing**: TNG QR → Boost payment demonstration
- **Payment Routing**: Smart routing between different e-wallets
- **Demo Endpoint**: Complete TNG-to-Boost workflow simulation

### Plugin System

- **FX Converter**: Multi-currency conversion with real-time rates
- **Risk Checker**: Transaction risk assessment and fraud detection
- **Token Handler**: Offline payment token management
- **Modular Architecture**: Easy to add new plugins

### Management Dashboard

- **Overview**: Real-time metrics and system health
- **Transaction Management**: Filter, search, and analyze transactions
- **Plugin Management**: Enable/disable plugins, view execution logs
- **User Management**: User accounts and transaction history
- **Token Management**: Offline token lifecycle management

## 📋 Requirements

```txt
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
supabase==2.3.4
python-dotenv==1.0.0
qrcode[pil]==7.4.2
psutil==5.9.0
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000

# Supabase Configuration (Pre-configured for demo)
SUPABASE_URL=https://fpoyrthyyxwawmkwemkt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Plugin Configuration
PLUGINS_ENABLED=fx_converter,risk_checker,token_handler

# Security Configuration
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

### 3. Start the Server

```bash
# Method 1: Using the runner script
python run_server.py

# Method 2: Direct Flask run
python app.py

# Method 3: Using Flask CLI
export FLASK_APP=app.py
flask run --host=0.0.0.0 --port=5000
```

## 🔗 API Endpoints

### Payment APIs

```
POST   /api/pay                    # Process payment
POST   /api/payoffline             # Handle offline payments
GET    /api/status/<txn_id>        # Get transaction status
POST   /api/refund                 # Process refund
```

### QR Workflow APIs

```
POST   /api/qr/generate            # Generate QR codes
POST   /api/qr/scan                # Scan QR codes
POST   /api/qr/route               # Route cross-wallet payments
POST   /api/qr/demo/tng-boost      # Demo TNG→Boost workflow
```

### Dashboard APIs

```
GET    /api/dashboard/overview     # Dashboard overview
GET    /api/dashboard/transactions # Transaction management
GET    /api/dashboard/logs         # Plugin execution logs
GET    /api/dashboard/plugins      # Plugin management
GET    /api/dashboard/tokens       # Token management
GET    /api/dashboard/users        # User management
```

### System APIs

```
GET    /health                     # Basic health check
GET    /health/detailed           # Detailed system health
```

## 💳 Demo Workflows

### 1. Basic Payment Processing

```bash
# Create a payment
curl -X POST http://localhost:5000/api/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.50,
    "currency": "MYR",
    "payment_method": "qr",
    "merchant_id": "MERCHANT_001",
    "user_id": "user_123"
  }'

# Check status
curl http://localhost:5000/api/status/TXN_20250127120000_ABC123
```

### 2. TNG QR → Boost Payment Demo

```bash
# Run complete demo workflow
curl -X POST http://localhost:5000/api/qr/demo/tng-boost \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "DEMO_MERCHANT_001",
    "amount": 25.00,
    "customer_user_id": "demo_user_boost"
  }'
```

### 3. Offline Token Workflow

```bash
# Create offline token
curl -X POST http://localhost:5000/api/payoffline \
  -H "Content-Type: application/json" \
  -d '{
    "token_operation": "create",
    "user_id": "user_123",
    "amount": 50.00,
    "currency": "MYR"
  }'

# Redeem token
curl -X POST http://localhost:5000/api/payoffline \
  -H "Content-Type: application/json" \
  -d '{
    "token_id": "TOKEN_20250127120000_XYZ789"
  }'
```

## 🔌 Plugin System

### Available Plugins

#### FX Converter Plugin

- **Purpose**: Currency conversion for international payments
- **Features**: Real-time rates, markup calculation, multi-currency support
- **Supported**: MYR, USD, SGD, EUR, GBP, THB, IDR

#### Risk Checker Plugin

- **Purpose**: Transaction risk assessment and fraud detection
- **Features**: Amount analysis, frequency checking, velocity limits, time patterns
- **Actions**: APPROVE, MANUAL_REVIEW, BLOCK

#### Token Handler Plugin

- **Purpose**: Offline payment token management
- **Features**: Token generation, validation, redemption, expiry management
- **Limits**: 5-1000 MYR, 24-hour expiry, 5 tokens per user

### Adding Custom Plugins

1. Create plugin class inheriting from `BasePlugin`:

```python
from src.plugins.plugin_manager import BasePlugin

class CustomPlugin(BasePlugin):
    def __init__(self):
        super().__init__()
        self.name = "Custom Plugin"
        self.version = "1.0.0"

    async def execute(self, data):
        # Plugin logic here
        return {
            'success': True,
            'data': {'custom_field': 'value'}
        }
```

2. Register in `PluginManager._load_plugins()`
3. Add to `PLUGINS_ENABLED` config

## 📊 Dashboard Features

### Overview Dashboard

- Real-time transaction metrics
- Success rates and volume tracking
- Plugin performance monitoring
- System health indicators

### Transaction Management

- Advanced filtering (status, date, payment rail)
- Pagination and search
- Detailed transaction logs
- Plugin execution tracking

### Plugin Management

- Enable/disable plugins dynamically
- View execution statistics
- Monitor plugin errors
- Performance metrics

### Analytics

- Daily transaction trends
- Payment rail breakdown
- Amount distribution analysis
- User activity patterns

## 🏗️ Architecture

### Project Structure

```
backend/
├── app.py                     # Main Flask application
├── run_server.py              # Development server runner
├── requirements.txt           # Python dependencies
├── src/
│   ├── config/
│   │   └── settings.py        # Configuration management
│   ├── database/
│   │   └── connection.py      # Supabase connection
│   ├── models/                # Database models
│   │   ├── user.py
│   │   ├── transaction.py
│   │   ├── plugin_log.py
│   │   ├── offline_token.py
│   │   └── qr_code.py
│   ├── plugins/               # Plugin system
│   │   ├── plugin_manager.py
│   │   ├── fx_converter.py
│   │   ├── risk_checker.py
│   │   └── token_handler.py
│   ├── api/                   # API endpoints
│   │   ├── payments.py
│   │   ├── qr_workflow.py
│   │   ├── dashboard.py
│   │   └── health.py
│   ├── middleware/            # Security & rate limiting
│   ├── queue/                 # Task queue system
│   └── utils/                 # Utilities
```

### Database Schema

#### Users Table

- User identification and wallet management
- KYC status and risk scoring
- Linked wallet information

#### Transactions Table

- Payment transaction records
- Status tracking and metadata
- Plugin execution results

#### Plugin Logs Table

- Plugin execution history
- Performance metrics
- Error tracking

#### Offline Tokens Table

- Token lifecycle management
- Expiry and redemption tracking

#### QR Codes Table

- QR code generation and scanning
- Cross-wallet routing information

## 🔒 Security Features

- **Rate Limiting**: Per-minute and per-hour limits
- **Security Headers**: OWASP recommended headers
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **API Key Authentication**: Optional API key protection
- **JWT Support**: Token-based authentication

## 🚀 Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables

```env
FLASK_ENV=production
FLASK_DEBUG=False
JWT_SECRET_KEY=your-production-secret-key
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=5000
```

## 📈 Monitoring & Observability

### Health Checks

- Basic: `/health`
- Detailed: `/health/detailed`
- System metrics via psutil
- Database connectivity

### Logging

- Structured logging with timestamps
- Plugin execution tracking
- Error logging and alerting
- Configurable log levels

### Metrics

- Transaction success rates
- Plugin performance
- System resource usage
- API response times

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the health check endpoints
- Examine the plugin logs in the dashboard

---

**Built with ❤️ for PayHack2025** 🏆
