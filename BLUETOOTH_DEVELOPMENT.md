# Bluetooth Development Guide

## Overview
This guide covers how to set up and test real Bluetooth Low Energy (BLE) functionality for the offline payment system.

## Prerequisites

### For Android Development:
1. **Android Studio** - Install and configure Android SDK
2. **Physical Android Device** - Required for real Bluetooth testing
3. **ADB (Android Debug Bridge)** - For device communication
4. **Enable Developer Options** on your device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Enable "USB Debugging" and "Bluetooth Debugging"

### For iOS Development:
1. **Xcode** - Latest version
2. **iOS Simulator** or **Physical iOS Device**
3. **Apple Developer Account** (for physical device testing)

## Setup Instructions

### 1. Install Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (already done)
npm install

# For Android, ensure you have the right permissions in app.json
```

### 2. Configure App Permissions

Add these permissions to `frontend/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": true,
          "modes": ["peripheral", "central"]
        }
      ]
    ],
    "android": {
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    },
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "This app uses Bluetooth for offline payments",
        "NSBluetoothPeripheralUsageDescription": "This app uses Bluetooth for offline payments"
      }
    }
  }
}
```

### 3. Development Build

```bash
# Create development build
npx expo install --fix
npx expo prebuild

# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Testing Bluetooth Functionality

### 1. Basic Bluetooth Test

```javascript
// Test in your app
import BluetoothManager from '../utils/BluetoothManager';

// Initialize Bluetooth
await BluetoothManager.initialize();

// Start scanning
await BluetoothManager.startScan();

// Check for discovered devices
BluetoothManager.addListener('deviceDiscovered', (device) => {
  console.log('Device found:', device.name, device.id);
});
```

### 2. Device Discovery Test

1. **Enable Bluetooth** on both devices
2. **Open the app** on both devices
3. **Start scanning** on one device
4. **Check console logs** for discovered devices
5. **Verify device names** appear in the UI

### 3. Connection Test

```javascript
// Connect to a discovered device
const deviceId = 'discovered-device-id';
await BluetoothManager.connectToDevice(deviceId);

// Listen for connection status
BluetoothManager.addListener('connectionStatus', (status) => {
  console.log('Connection status:', status);
});
```

### 4. Payment Transmission Test

```javascript
// Send a test payment
const testPayload = {
  payload: {
    token_id: 'test-token-123',
    amount: 10.50,
    recipient_id: 'recipient-456',
    payer_device_id: 'device-789',
    nonce: 'test-nonce',
    timestamp: Date.now()
  },
  signature: 'test-signature',
  encrypted: false
};

const result = await BluetoothManager.sendEncryptedPayment(testPayload);
console.log('Send result:', result);
```

## Debugging Bluetooth Issues

### Common Issues and Solutions

#### 1. "Bluetooth permission denied"
```bash
# Android: Check permissions in device settings
Settings > Apps > Your App > Permissions > Location > Allow

# iOS: Check in Settings app
Settings > Privacy & Security > Bluetooth > Your App > Allow
```

#### 2. "No devices found"
- Ensure Bluetooth is enabled on both devices
- Check if devices are discoverable
- Verify location permissions (required for BLE scanning on Android)
- Try restarting Bluetooth on both devices

#### 3. "Connection failed"
- Ensure devices are within range (typically 10 meters)
- Check if device is already connected to another app
- Try disconnecting and reconnecting

#### 4. "Service not found"
- This is expected in development as we're using mock services
- The app will create a mock service for testing

### Debug Commands

#### Android Debugging:
```bash
# Check connected devices
adb devices

# View Bluetooth logs
adb logcat | grep -i bluetooth

# Check app permissions
adb shell dumpsys package your.package.name | grep permission
```

#### iOS Debugging:
```bash
# View device logs in Xcode
# Window > Devices and Simulators > View Device Logs

# Check Bluetooth state in Settings
# Settings > Bluetooth
```

## Development vs Production

### Development Mode (Current Implementation)
- Uses mock services for BLE characteristics
- Simulates data transmission
- Works with any nearby Bluetooth device
- Good for UI/UX testing

### Production Mode (Future Implementation)
- Real BLE service and characteristics
- Actual encrypted data transmission
- Device-specific service UUIDs
- Proper error handling and retry logic

## Testing Scenarios

### Scenario 1: Two Physical Devices
1. Install app on two Android/iOS devices
2. Enable Bluetooth on both
3. Start scanning on Device A
4. Verify Device B appears in scan results
5. Connect devices
6. Send test payment
7. Verify payment received

### Scenario 2: One Physical + One Simulator
1. Install app on physical device
2. Run app in iOS Simulator (with Bluetooth enabled)
3. Scan from physical device
4. Verify simulator appears (if supported)
5. Test connection and payment

### Scenario 3: Mock Mode Testing
1. Run in Expo Go (automatically uses mock mode)
2. Test UI flows without real Bluetooth
3. Verify mock devices appear
4. Test payment flow with mock data

## Performance Considerations

### Battery Optimization
- Stop scanning when not needed
- Disconnect devices when done
- Use appropriate scan intervals

### Security Best Practices
- Always encrypt sensitive data
- Validate device identities
- Use secure session keys
- Implement timeout mechanisms

## Troubleshooting Checklist

- [ ] Bluetooth enabled on both devices
- [ ] Location permissions granted (Android)
- [ ] Devices within range (10m)
- [ ] App has necessary permissions
- [ ] Development build installed (not Expo Go)
- [ ] Console logs show no errors
- [ ] Device names appear in scan results
- [ ] Connection status updates properly

## Next Steps

1. **Test with real devices** using the development build
2. **Implement real BLE services** for production
3. **Add proper error handling** and retry logic
4. **Implement security features** (encryption, authentication)
5. **Add background mode** support for continuous scanning
6. **Optimize battery usage** and performance

## Resources

- [react-native-ble-plx Documentation](https://github.com/Polidea/react-native-ble-plx)
- [Android Bluetooth Guide](https://developer.android.com/guide/topics/connectivity/bluetooth)
- [iOS Bluetooth Guide](https://developer.apple.com/documentation/corebluetooth)
- [BLE UUID Generator](https://www.uuidgenerator.net/) 