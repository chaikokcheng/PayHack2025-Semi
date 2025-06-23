# PinkPay - Smart Payment Superapp | PayHack2025

A revolutionary payment superapp built for PayHack2025 Hackathon featuring **Ambient Commerce**, digital wallet aggregation, smart analytics, and innovative IoT-powered shopping experiences.

## 🛠️ **Tech Stack & Dependencies**

### **Core Technologies**

- **React Native Expo** - Cross-platform mobile development
- **JavaScript ES6+** - Modern JavaScript with React Hooks
- **React Navigation v6** - Navigation with nested stack/tab navigators
- **Expo Camera** - QR code scanning and RFID simulation
- **Linear Gradient** - Modern gradient UI components
- **Gesture Handler** - Smooth touch interactions

## 🚀 \*\*Getting Started

### **Quick Setup**

```bash
# 1. Navigate to project
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npx expo start --clear

# 4. Scan QR code with Expo Go app (iOS/Android)
# OR run in simulator:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
```

### **Key Files to Understand**

- `App.js` - Navigation structure
- `src/screens/HomeScreen.js` - Main dashboard
- `src/screens/ShoppingScreen.js` - Ambient Commerce features
- `src/screens/AnalyticsScreen.js` - Financial insights
- `src/constants/Colors.js` - Design system colors

### **Key Dependencies**

```json
{
  "expo": "~51.0.28",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "@react-navigation/native": "^6.0.2",
  "@react-navigation/bottom-tabs": "^6.0.5",
  "@react-navigation/stack": "^6.0.7",
  "expo-camera": "~15.0.16",
  "expo-linear-gradient": "~13.0.2",
  "react-native-gesture-handler": "~2.16.1",
  "@expo/vector-icons": "^14.0.2"
}
```

### **Development Setup**

```bash
# Prerequisites
node -v    # v14+ required
npm -v     # Latest npm

# Installation
cd frontend
npm install

# Development
npx expo start --clear    # Start development server
npx expo start --ios      # Run on iOS simulator
npx expo start --android  # Run on Android emulator
```

## 📁 **Project Structure**

```
frontend/
├── App.js                 # Main app entry point with navigation
├── src/
│   ├── screens/           # All application screens
│   │   ├── HomeScreen.js           # Dashboard with wallets & transactions
│   │   ├── ShoppingScreen.js       # Ambient Commerce & IoT shopping
│   │   ├── AnalyticsScreen.js      # Financial insights & AI chatbot
│   │   ├── QRScannerScreen.js      # QR/RFID scanning with smart routing
│   │   ├── ProfileScreen.js        # User profile & digital identity
│   │   ├── ProductDetailScreen.js  # RFID product details
│   │   ├── CartScreen.js           # Smart shopping cart
│   │   ├── PaymentScreen.js        # Payment processing
│   │   └── TransferScreen.js       # Money transfers
│   ├── constants/
│   │   └── Colors.js              # Modern pink color palette
│   ├── components/        # Reusable UI components (planned)
│   ├── services/          # API integrations (planned)
│   └── utils/            # Helper functions (planned)
├── assets/               # App icons and images
└── package.json         # Dependencies and scripts
```

## 🚀 **Revolutionary Features**

### 🏪 **Ambient Commerce (IoT Shopping)**

- **Smart Store Entry**: IoT sensors detect your phone automatically
- **RFID Product Scanning**: Detailed product info with nutrition facts
- **Auto-Checkout**: Walk out and payment processes instantly
- **Featured Stores**: Jaya Grocer Smart, Village Grocer AI, IKEA Experience

### 🔗 **Digital Wallet Aggregation**

- **Multiple Wallets**: Touch 'n Go eWallet, Maybank, GrabPay
- **Primary Wallet System**: Smart payment routing
- **Global E-Wallet Support**: PromptPay, PayNow, DuitNow, GoPay, etc.
- **No App Balance**: Acts as payment aggregator, not e-wallet

### 📊 **Smart Analytics & AI**

- **Expense Tracking**: Visual charts and spending breakdown
- **AI Financial Assistant**: "Ask PinkPay AI" chatbot
- **Top Merchants Analysis**: Smart spending insights
- **Weekly Trends**: Data visualization with charts

### 📱 **Advanced QR & RFID**

- **Universal QR Support**: Payment, transfer, product codes
- **RFID Tag Simulation**: Detailed product scanning experience
- **Smart Routing**: Auto-detects code type and routes appropriately
- **Demo Mode**: Fallback for camera permissions

### 🎨 **Modern Design System**

- **Pink Color Palette**: Professional gradient themes
- **Clean Light Theme**: Modern typography and spacing
- **Smooth Animations**: Gesture-based interactions
- **Malaysian Context**: RM currency, local businesses

## 🌟 **Innovation Highlights**

### **1. Ambient Commerce**

Revolutionary shopping experience:

- Walk into stores → IoT detection → shop freely → walk out
- RFID product scanning with comprehensive details
- Seamless auto-checkout with payment processing visualization

### **2. Payment Aggregation**

- Unified interface for multiple wallets and banks
- Smart payment routing based on balance/preferences
- Global e-wallet support (ASEAN + worldwide)

### **3. AI-Powered Insights**

- Intelligent expense categorization
- Smart financial recommendations
- Cross-country spending comparisons
- Conversational AI assistant

### **4. Malaysian Market Focus**

- Local retailers (Jaya Grocer, Village Grocer)
- Malaysian ringgit (RM) currency
- Regional e-wallet integration (Touch 'n Go, GrabPay)

## 🏗️ **Architecture Overview**

### **Frontend Architecture**

- **Modular Screens**: Each feature as separate screen component
- **Nested Navigation**: Tab navigator with stack navigators
- **State Management**: React hooks for local state
- **Responsive Design**: Works on iOS and Android

### **Smart Features**

- **IoT Simulation**: Animated sensors and device detection
- **RFID Scanning**: Product database with detailed information
- **Payment Processing**: Multi-step checkout with animations
- **AI Integration**: Mock chatbot for financial advice

## 📱 **User Experience Flow**

1. **Home Dashboard**: View linked wallets, recent transactions, quick actions
2. **Ambient Shopping**: Enter smart stores, scan RFID products, auto-checkout
3. **Financial Insights**: Analyze spending, get AI recommendations
4. **QR Payments**: Scan codes for instant payments
5. **Profile Management**: Digital identity and security settings

## 🎯 **PayHack2025 Demonstration**

### **Innovation**

- **Ambient Commerce**: First-of-its-kind IoT shopping experience
- **Wallet Aggregation**: Unified payment management
- **AI Financial Assistant**: Smart spending insights

### **Technical Excellence**

- **Modern React Native**: Latest Expo SDK and navigation
- **Professional UI/UX**: Clean design with smooth animations
- **Modular Architecture**: Scalable and maintainable code

### **Market Relevance**

- **Malaysian Focus**: Local retailers and payment methods
- **Global Reach**: Worldwide e-wallet support
- **Future-Ready**: IoT and AI integration

## 🔧 **Development Notes**

### **Known Issues Fixed**

- ✅ Gesture handler integration
- ✅ Navigation routing conflicts
- ✅ Animation state management
- ✅ React 19 compatibility

### **Testing**

- Test RFID scanning modal (realistic 2-second detection)
- Test auto-checkout flow (3-step animated process)
- Test wallet navigation and analytics
- Test QR scanner with demo mode

## 🏆 **Demo Highlights for Judges**

1. **Ambient Commerce**: Show IoT store entry and RFID scanning
2. **Wallet Aggregation**: Demonstrate multiple payment methods
3. **AI Analytics**: Show spending insights and chatbot
4. **Modern Design**: Highlight smooth animations and UX
5. **Malaysian Context**: Local integration and currency

---

**Built with ❤️ for PayHack2025 by Team [Your Team Name]**

_Revolutionizing payments through IoT, AI, and seamless user experiences_

# PinkPay Payment Switch Backend

A modern, modular, and event-driven payment switch backend system that simulates how a national real-time payment system (like DuitNow/PayNet) routes, processes, and tracks payments across multiple banks, wallets, and plug-ins.

## 🚀 Features

### Core Payment Processing

- **Event-driven architecture** with async queue processing
- **Modular plugin system** for extensible features
- **Multi-currency support** with FX conversion
- **Risk assessment** and fraud detection
- **Offline payment tokens** for ambient commerce
- **Real-time transaction status** tracking
- **Comprehensive logging** and monitoring

### Plugin System

- **FX Converter**: Currency conversion with mock exchange rates
- **Risk Checker**: Fraud detection and transaction risk scoring
- **Token Handler**: Offline payment token generation and management
- **Easy extensibility** - add new plugins by creating JS files

### Dashboard & Analytics

- **Transaction analytics** with filtering and pagination
- **Plugin performance monitoring**
- **Queue status** and job tracking
- **Real-time statistics** for various time periods
- **User management** and token tracking

### API Endpoints

- **Payment APIs**: `/pay`, `/payoffline`, `/status`, `/refund`
- **Dashboard APIs**: Analytics, logs, queue status, plugin info
- **Health monitoring** and system status

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Express API    │────│   Payment       │
│   (React Native)│    │   Gateway        │    │   Queue         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Plugin         │    │   Supabase      │
                       │   Manager        │    │   Database      │
                       └──────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌──────────┐ ┌─────────────┐ ┌──────────┐
            │    FX    │ │    Risk     │ │  Token   │
            │Converter │ │  Checker    │ │ Handler  │
            └──────────┘ └─────────────┘ └──────────┘
```

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (database provided)

### Setup

1. **Clone and Navigate**

   ```bash
   cd backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   The system uses the provided Supabase database. Configuration is in `src/utils/config.js`.

4. **Start the Server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

5. **Verify Installation**
   ```bash
   curl http://localhost:3000/health
   ```

## 🔧 Usage

### 1. Process Payment

```bash
curl -X POST http://localhost:3000/api/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "currency": "MYR",
    "userEmail": "user@example.com",
    "merchantId": "MERCHANT_001",
    "merchantName": "Test Store",
    "description": "Test payment",
    "paymentMethod": "touchngo"
  }'
```

### 2. Generate Offline Token

```bash
curl -X POST http://localhost:3000/api/payoffline \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "generateToken",
    "amount": 50.00,
    "currency": "MYR",
    "userEmail": "user@example.com",
    "expiryHours": 24
  }'
```

### 3. Check Transaction Status

```bash
curl http://localhost:3000/api/status/TXN-1703123456-abc123
```

### 4. Dashboard Overview

```bash
curl http://localhost:3000/api/dashboard/overview
```

## 📊 API Reference

### Payment APIs

| Endpoint             | Method | Description                       |
| -------------------- | ------ | --------------------------------- |
| `/api/pay`           | POST   | Process payment request           |
| `/api/payoffline`    | POST   | Handle offline payment operations |
| `/api/status/:txnId` | GET    | Get transaction status            |
| `/api/refund`        | POST   | Process refund request            |
| `/api/health`        | GET    | Health check                      |

### Dashboard APIs

| Endpoint                            | Method | Description                         |
| ----------------------------------- | ------ | ----------------------------------- |
| `/api/dashboard/overview`           | GET    | Dashboard overview with key metrics |
| `/api/dashboard/transactions`       | GET    | List transactions with filtering    |
| `/api/dashboard/transactions/stats` | GET    | Transaction statistics              |
| `/api/dashboard/logs`               | GET    | Plugin execution logs               |
| `/api/dashboard/queue`              | GET    | Payment queue status                |
| `/api/dashboard/plugins`            | GET    | Plugin information                  |
| `/api/dashboard/tokens`             | GET    | Offline tokens                      |
| `/api/dashboard/users`              | GET    | User management                     |

## 🔌 Plugin System

### Available Plugins

1. **FX Converter** (`fx-converter`)

   - Converts between currencies (MYR, SGD, USD, EUR, etc.)
   - Mock exchange rates for demo
   - Fee calculation

2. **Risk Checker** (`risk-checker`)

   - Transaction amount analysis
   - Velocity checks
   - Time-based risk (off-hours)
   - User profile assessment
   - Configurable thresholds

3. **Token Handler** (`token-handler`)
   - Generate offline payment tokens
   - Token validation and redemption
   - Merchant restrictions
   - QR code generation

### Creating Custom Plugins

1. Create a new file in `/src/plugins/`
2. Implement the plugin interface:

```javascript
class MyPlugin {
  constructor() {
    this.name = "my-plugin";
    this.version = "1.0.0";
    this.description = "My custom plugin";
  }

  isEnabled(transaction, context) {
    return true; // Plugin enablement logic
  }

  async process(transaction, context) {
    // Plugin processing logic
    return {
      success: true,
      action: "processed",
      // ... plugin results
    };
  }

  isCritical(transaction, context) {
    return false; // Whether plugin failure should stop processing
  }
}

module.exports = MyPlugin;
```

3. Add plugin name to enabled plugins in config
4. Restart server

## 📈 Monitoring & Analytics

### Transaction Statistics

- Total transactions and amounts
- Success rates by status, type, currency
- Processing times and trends

### Plugin Performance

- Execution times per plugin
- Success/failure rates
- Plugin-specific metrics

### Queue Monitoring

- Queue length and processing status
- Job success/failure rates
- Active job tracking

### Real-time Metrics

Available for different time periods: `1h`, `24h`, `7d`, `30d`

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** (configurable)
- **Input validation** with express-validator
- **Error handling** without information leakage
- **Request logging** for audit trails

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and wallet balances
- **transactions**: All payment transactions
- **plugin_logs**: Plugin execution logs
- **offline_tokens**: Offline payment tokens
- **payment_rails_logs**: External payment rail logs

## 🔧 Configuration

Configuration is managed in `src/utils/config.js`:

```javascript
{
  app: { name, version, env, port },
  supabase: { url, key },
  plugins: { enabled, thresholds },
  currency: { base, supported },
  limits: { minAmount, maxAmount, dailyLimit }
}
```

## 🧪 Testing

### API Testing Examples

1. **Test Payment Flow**

   ```bash
   # Create user first (if needed)
   # Then process payment
   curl -X POST http://localhost:3000/api/pay -H "Content-Type: application/json" -d '{"amount":10,"currency":"MYR","userEmail":"test@example.com","description":"Test payment"}'
   ```

2. **Test Plugin Processing**

   ```bash
   # High-risk transaction to trigger risk checker
   curl -X POST http://localhost:3000/api/pay -H "Content-Type: application/json" -d '{"amount":15000,"currency":"MYR","userEmail":"test@example.com","description":"High value test"}'
   ```

3. **Test Offline Tokens**

   ```bash
   # Generate token
   curl -X POST http://localhost:3000/api/payoffline -H "Content-Type: application/json" -d '{"operation":"generateToken","amount":100,"currency":"MYR","userEmail":"test@example.com"}'

   # Validate token (use token from previous response)
   curl -X POST http://localhost:3000/api/payoffline -H "Content-Type: application/json" -d '{"operation":"validateToken","token":"OT-ABC123"}'
   ```

### Frontend Integration

The backend is designed to work with the PinkPay React Native frontend. Key integration points:

1. **Analytics Screen**: Uses `/api/dashboard/*` endpoints
2. **Payment Processing**: Uses `/api/pay` for transactions
3. **Offline Payments**: Uses `/api/payoffline` for ambient commerce
4. **Transaction History**: Uses `/api/dashboard/transactions`

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow the plugin architecture for new features
2. Add comprehensive logging for debugging
3. Include input validation for all endpoints
4. Update documentation for new APIs
5. Test with both sync and async processing

## 📝 License

MIT License - Built for PayHack2025 Hackathon

## 🎯 Demo Features

This system demonstrates:

- **Modern payment switch architecture**
- **Plugin-based extensibility**
- **Event-driven processing**
- **Comprehensive monitoring**
- **Multi-currency support**
- **Risk assessment and fraud detection**
- **Offline payment capabilities**
- **Real-time analytics and reporting**

Perfect for demonstrating how a national payment system could be modernized with cloud-native, microservices architecture while maintaining the reliability and security required for financial transactions.

---

**Built with ❤️ for PayHack2025 by Team PinkPay**

_Revolutionizing payment infrastructure through modern architecture and innovative features_
