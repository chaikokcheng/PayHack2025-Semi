# 📱 Mobile App Setup Guide

## 🎯 **Testing Environments**

### **1. Android Emulator**
```bash
# API URL automatically configured to: http://10.0.2.2:8000
# No configuration needed - works out of the box
```

### **2. iOS Simulator**
```bash
# API URL automatically configured to: http://127.0.0.1:8000
# No configuration needed - works out of the box
```

### **3. Physical Device (Android/iOS)**
```bash
# Step 1: Find your computer's IP address
node scripts/get-ip.js

# Step 2: Update the configuration
# Edit: frontend/src/utils/config.js
# Change: physical: 'http://YOUR_IP_ADDRESS:8000'

# Step 3: Start backend with external access
cd backend
python -m flask run --host=0.0.0.0 --port=8000
```

## 🔧 **Configuration**

### **Automatic Environment Detection**
The app automatically detects your environment:

- **Android Emulator**: `http://10.0.2.2:8000`
- **iOS Simulator**: `http://127.0.0.1:8000`
- **Physical Device**: `http://YOUR_IP:8000` (configurable)

### **Manual Configuration**
Edit `frontend/src/utils/config.js`:

```javascript
const ENV = {
    development: {
        android: 'http://10.0.2.2:8000',    // Android Emulator
        ios: 'http://127.0.0.1:8000',        // iOS Simulator
        physical: 'http://192.168.1.100:8000', // Physical Device (change IP)
    },
    // ...
};
```

## 🚀 **Quick Start**

### **For Emulator/Simulator:**
```bash
# 1. Start backend
cd backend
python -m flask run --port=8000

# 2. Start mobile app
cd frontend
npx expo start

# 3. Press 'a' for Android or 'i' for iOS
```

### **For Physical Device:**
```bash
# 1. Find your IP
node scripts/get-ip.js

# 2. Update config with your IP
# Edit frontend/src/utils/config.js

# 3. Start backend with external access
cd backend
python -m flask run --host=0.0.0.0 --port=8000

# 4. Start mobile app
cd frontend
npx expo start

# 5. Scan QR code with Expo Go app
```

## 🔍 **Debugging**

### **Check API Connection**
The app logs connection info on startup:
```
🔗 OfflineTokenService initialized with API URL: http://10.0.2.2:8000
📱 Debug Info: { platform: 'android', isDevelopment: true, ... }
```

### **Test API Endpoints**
```bash
# Test from your computer
curl http://127.0.0.1:8000/api/offline-demo/health

# Test from emulator (Android)
curl http://10.0.2.2:8000/api/offline-demo/health

# Test from physical device
curl http://YOUR_IP:8000/api/offline-demo/health
```

## 🛠 **Troubleshooting**

### **Connection Issues:**
1. **Emulator can't connect**: Make sure backend is running on `127.0.0.1:8000`
2. **Physical device can't connect**: 
   - Check firewall settings
   - Ensure same WiFi network
   - Verify IP address in config
   - Start backend with `--host=0.0.0.0`

### **Common Errors:**
- **"Network request failed"**: Check API URL configuration
- **"Connection refused"**: Backend not running or wrong port
- **"Timeout"**: Firewall blocking connection

## 📋 **API Endpoints**

The mobile app uses these endpoints:
- `POST /api/offline-demo/create-offline-token`
- `POST /api/offline-demo/verify-received-token`
- `POST /api/offline-demo/accept-received-payment`
- `POST /api/offline-demo/sync-received-payments`

All endpoints are automatically configured based on your environment! 