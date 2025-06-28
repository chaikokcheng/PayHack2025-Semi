# SatuPay - Smart Payment Superapp | PayHack2025

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
- **AI Financial Assistant**: "Ask SatuPay AI" chatbot
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
