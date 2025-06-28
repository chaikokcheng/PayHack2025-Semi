// NOTE: BluetoothManager now auto-selects real or mock based on device/emulator.
// See src/utils/BluetoothManager.js and src/utils/MockBluetoothManager.js for details.
// If you add new Bluetooth features, update both classes!
// import * as Device from 'expo-device';
import Constants from 'expo-constants';
import MockBluetoothManager from './MockBluetoothManager';

// Check if we're in Expo Go (which doesn't support native BLE)
const isExpoGo = Constants.appOwnership === 'expo';

let RealBluetoothManager;
if (!isExpoGo) {
    try {
        RealBluetoothManager = require('./BluetoothManager.real').default;
        } catch (error) {
        console.warn('Real BluetoothManager not available, using mock:', error.message);
    }
    }

// Auto-select the appropriate implementation
const BluetoothManager = isExpoGo || !RealBluetoothManager ? MockBluetoothManager : RealBluetoothManager;

// Create a singleton instance
const bluetoothManagerInstance = new BluetoothManager();

export default bluetoothManagerInstance; 