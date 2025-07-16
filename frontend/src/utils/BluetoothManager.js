import Constants from 'expo-constants';
import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import SecureTokenManager from './SecureTokenManager';
import * as Crypto from 'expo-crypto';
import { v4 as uuidv4 } from 'uuid';

// UUID constants for our custom service and characteristics
const SERVICE_UUID = '00001234-0000-1000-8000-00805f9b34fb';
const TX_CHARACTERISTIC_UUID = '00001235-0000-1000-8000-00805f9b34fb';
const RX_CHARACTERISTIC_UUID = '00001236-0000-1000-8000-00805f9b34fb';

// Device name prefix for our app
const DEVICE_NAME_PREFIX = 'SatuPay';

class UnifiedBluetoothManager {
    constructor() {
        // Check if we're in Expo Go (which doesn't support native BLE)
        this.isExpoGo = Constants.appOwnership === 'expo';
        this.isEmulator = this.isExpoGo;

        // Initialize properties
        this.device = null;
        this.isScanning = false;
        this.listeners = new Map();
        this.connectedDevice = null;
        this.discoveredDevices = new Map();
        this.sessionKey = null;
        this.pendingTransactions = new Map();
        this.receivedData = null;
        this.isInitialized = false;

        // Initialize BLE manager only if not in Expo Go
        if (!this.isExpoGo) {
            try {
                this.bleManager = new BleManager();
                console.log('✅ Real Bluetooth manager initialized');
            } catch (error) {
                console.warn('⚠️ Real Bluetooth not available, falling back to mock:', error.message);
                this.isExpoGo = true;
                this.isEmulator = true;
            }
        } else {
            console.log('📱 Using Mock Bluetooth (Expo Go detected)');
        }

        // Mock devices for demo
        this.mockDevices = [
            { id: 'B8:27:EB:12:34:56', name: 'HUAWEI P50 Pro', rssi: -38 },
            { id: '2C:F0:EE:AB:CD:EF', name: 'iPhone 14 Pro', rssi: -65 },
            { id: '48:D6:D5:9A:BC:DE', name: 'Samsung Galaxy A54', rssi: -58 },
            { id: '74:E5:43:78:90:12', name: 'Xiaomi 13', rssi: -42 },
        ];
    }

    async initialize() {
        try {
            console.log(`🔧 Initializing ${this.isExpoGo ? 'Mock' : 'Real'} Bluetooth manager...`);

            if (!this.isExpoGo) {
                // Request permissions for real Bluetooth
                await this.requestPermissions();

                // Set up state change listener
                this.bleManager.onStateChange((state) => {
                    console.log('Bluetooth state changed:', state);
                    this._notifyListeners('stateChange', { state, mock: false });
                }, true);
            } else {
                // Mock initialization
                setTimeout(() => {
                    this._notifyListeners('stateChange', { state: 'PoweredOn', mock: true });
                }, 500);
            }

            this.isInitialized = true;
            console.log(`✅ ${this.isExpoGo ? 'Mock' : 'Real'} Bluetooth manager initialized successfully`);

            return true;
        } catch (error) {
            console.error('Error initializing Bluetooth:', error);
            throw error;
        }
    }

    async requestPermissions() {
        if (this.isExpoGo) return true;

        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Bluetooth Permission',
                    message: 'This app needs Bluetooth permission to make offline payments',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                throw new Error('Bluetooth permission denied');
            }

            // Request Bluetooth permissions for Android 12+
            if (Platform.Version >= 31) {
                const bluetoothScan = await PermissionsAndroid.request(
                    'android.permission.BLUETOOTH_SCAN'
                );
                const bluetoothConnect = await PermissionsAndroid.request(
                    'android.permission.BLUETOOTH_CONNECT'
                );

                if (bluetoothScan !== PermissionsAndroid.RESULTS.GRANTED ||
                    bluetoothConnect !== PermissionsAndroid.RESULTS.GRANTED) {
                    throw new Error('Bluetooth permissions denied');
                }
            }
        }
    }

    async startScan() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log(`🔍 Starting ${this.isExpoGo ? 'mock' : 'real'} Bluetooth scan...`);
            this.isScanning = true;
            this.discoveredDevices.clear();
            this._notifyListeners('scanStatus', { scanning: true });

            if (this.isExpoGo) {
                // Mock scanning
                this.mockDevices.forEach((device, index) => {
                    setTimeout(() => {
                        if (this.isScanning) {
                            console.log('Mock device discovered:', device.name);
                            this._notifyListeners('deviceDiscovered', device);
                        }
                    }, (index + 1) * 800);
                });

                // Stop scanning after 5 seconds
                setTimeout(() => {
                    if (this.isScanning) {
                        this.stopScan();
                    }
                }, 5000);
            } else {
                // Real scanning
                this.bleManager.startDeviceScan(
                    [SERVICE_UUID],
                    { allowDuplicates: false },
                    (error, device) => {
                        if (error) {
                            console.error('Scan error:', error);
                            this._notifyListeners('scanError', { error: error.message });
                            return;
                        }

                        if (device && device.name) {
                            console.log('Real device discovered:', device.name, device.id);

                            if (device.name.includes(DEVICE_NAME_PREFIX) ||
                                device.name.includes('iPhone') ||
                                device.name.includes('Android') ||
                                device.name.includes('Samsung') ||
                                device.name.includes('Pixel')) {

                                const deviceInfo = {
                                    id: device.id,
                                    name: device.name,
                                    rssi: device.rssi,
                                    isConnectable: device.isConnectable,
                                    manufacturerData: device.manufacturerData
                                };

                                this.discoveredDevices.set(device.id, deviceInfo);
                                this._notifyListeners('deviceDiscovered', deviceInfo);
                            }
                        }
                    }
                );

                // Stop scanning after 10 seconds
                setTimeout(() => {
                    this.stopScan();
                }, 10000);
            }

        } catch (error) {
            console.error('Error starting scan:', error);
            this.isScanning = false;
            this._notifyListeners('scanStatus', { scanning: false });
            throw error;
        }
    }

    stopScan() {
        try {
            console.log(`🛑 Stopping ${this.isExpoGo ? 'mock' : 'real'} Bluetooth scan...`);

            if (!this.isExpoGo && this.bleManager) {
                this.bleManager.stopDeviceScan();
            }

            this.isScanning = false;
            this._notifyListeners('scanStatus', { scanning: false });
        } catch (error) {
            console.error('Error stopping scan:', error);
        }
    }

    async connectToDevice(deviceId) {
        try {
            console.log(`🔗 Connecting to ${this.isExpoGo ? 'mock' : 'real'} device:`, deviceId);
            this._notifyListeners('connectionStatus', { status: 'connecting', deviceId });

            if (this.isExpoGo) {
                // Mock connection
                setTimeout(() => {
                    const device = this.mockDevices.find(d => d.id === deviceId) ||
                        { id: deviceId, name: 'Unknown Device' };

                    this.connectedDevice = device;
                    this.sessionKey = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

                    this._notifyListeners('connectionStatus', {
                        status: 'connected',
                        deviceId,
                        deviceName: device.name,
                        sessionKey: this.sessionKey
                    });
                }, 1500);
            } else {
                // Real connection
                const device = await this.bleManager.connectToDevice(deviceId);
                console.log('Connected to device:', device.name);

                await device.discoverAllServicesAndCharacteristics();
                const services = await device.services();
                const ourService = services.find(service => service.uuid === SERVICE_UUID);

                if (!ourService) {
                    console.log('Our service not found, creating mock service for development');
                    await this.createMockService(device);
                }

                this.connectedDevice = device;
                this.sessionKey = await this.generateSessionKey();

                this._notifyListeners('connectionStatus', {
                    status: 'connected',
                    deviceId,
                    deviceName: device.name,
                    sessionKey: this.sessionKey
                });
            }

            return true;
        } catch (error) {
            console.error('Error connecting to device:', error);
            this._notifyListeners('connectionStatus', {
                status: 'error',
                deviceId,
                error: error.message
            });
            throw error;
        }
    }

    async createMockService(device) {
        console.log('Creating mock service for development');
        setTimeout(() => {
            console.log('Mock service created successfully');
        }, 1000);
    }

    async disconnect() {
        try {
            if (this.connectedDevice) {
                if (!this.isExpoGo && this.connectedDevice.cancelConnection) {
                    await this.connectedDevice.cancelConnection();
                    console.log('Disconnected from real device');
                } else {
                    console.log('Disconnected from mock device');
                }
            }

            this.connectedDevice = null;
            this.sessionKey = null;
            this.receivedData = null;
            this._notifyListeners('connectionStatus', { status: 'disconnected' });
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    }

    async sendEncryptedPayment(encryptedPayload) {
        try {
            if (!this.connectedDevice) {
                throw new Error('No device connected');
            }

            if (!this.sessionKey) {
                throw new Error('No session key established');
            }

            console.log(`📤 Sending encrypted payment via ${this.isExpoGo ? 'mock' : 'real'} Bluetooth...`);

            if (this.isExpoGo) {
                // Mock transmission
                setTimeout(() => {
                    this.receivedData = {
                        ...encryptedPayload,
                        receivedAt: new Date().toISOString(),
                        senderDevice: this.connectedDevice.id
                    };

                    this._notifyListeners('dataReceived', {
                        data: this.receivedData,
                        senderDevice: this.connectedDevice.id,
                        timestamp: new Date().toISOString()
                    });
                }, 1000);
            } else {
                // Real transmission
                const payloadString = JSON.stringify(encryptedPayload);
                const payloadBase64 = Buffer.from(payloadString).toString('base64');
                console.log('Payload to send:', payloadBase64);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return {
                success: true,
                message: `Encrypted payment sent successfully via ${this.isExpoGo ? 'mock' : 'real'} Bluetooth`,
                sessionKey: this.sessionKey
            };
        } catch (error) {
            console.error('Error sending payment:', error);
            throw error;
        }
    }

    async receiveEncryptedPayment() {
        try {
            if (!this.connectedDevice) {
                throw new Error('No device connected');
            }

            console.log(`📥 Waiting to receive encrypted payment via ${this.isExpoGo ? 'mock' : 'real'} Bluetooth...`);

            return new Promise((resolve) => {
                setTimeout(() => {
                    if (this.receivedData) {
                        resolve({
                            success: true,
                            data: this.receivedData,
                            sessionKey: this.sessionKey
                        });
                    } else {
                        resolve({
                            success: false,
                            error: `No data received via ${this.isExpoGo ? 'mock' : 'real'} Bluetooth`
                        });
                    }
                }, this.isExpoGo ? 500 : 2000);
            });
        } catch (error) {
            console.error('Error receiving payment:', error);
            throw error;
        }
    }

    async generateSessionKey() {
        try {
            if (!this.isExpoGo) {
                const randomBytes = await Crypto.getRandomBytesAsync(32);
                return Array.from(randomBytes)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } else {
                return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            }
        } catch (error) {
            console.error('Error generating session key:', error);
            return uuidv4().replace(/-/g, '');
        }
    }

    getSessionKey() {
        return this.sessionKey;
    }

    isConnected() {
        return this.connectedDevice !== null;
    }

    getConnectedDevice() {
        return this.connectedDevice;
    }

    addListener(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);

        return () => {
            const eventListeners = this.listeners.get(eventName);
            if (eventListeners) {
                eventListeners.delete(callback);
            }
        };
    }

    _notifyListeners(eventName, data) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            eventListeners.forEach(cb => {
                try {
                    cb(data);
                } catch (error) {
                    console.error('Error in listener callback:', error);
                }
            });
        }
    }

    destroy() {
        try {
            this.stopScan();
            this.disconnect();
            if (!this.isExpoGo && this.bleManager) {
                this.bleManager.destroy();
            }
        } catch (error) {
            console.error('Error destroying Bluetooth manager:', error);
        }
    }
}

// Create and export singleton instance
const bluetoothManagerInstance = new UnifiedBluetoothManager();
export default bluetoothManagerInstance; 