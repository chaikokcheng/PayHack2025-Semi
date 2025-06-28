// import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import SecureTokenManager from './SecureTokenManager';
import * as Crypto from 'expo-crypto';
import { v4 as uuidv4 } from 'uuid';

// UUID constants for service and characteristics
const SERVICE_UUID = '00001234-0000-1000-8000-00805f9b34fb';
const TX_CHARACTERISTIC_UUID = '00001235-0000-1000-8000-00805f9b34fb';
const RX_CHARACTERISTIC_UUID = '00001236-0000-1000-8000-00805f9b34fb';

// Export a mock class that does nothing
const BluetoothManager = class { };
export default BluetoothManager; 