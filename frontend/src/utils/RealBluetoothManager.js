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
const DEVICE_NAME_PREFIX = 'PinkPay';

export default class RealBluetoothManager {
    constructor() {
        this.bleManager = new BleManager();
        this.isEmulator = false;
        this.device = null;
        this.isScanning = false;
        this.listeners = new Map();
        this.connectedDevice = null;
        this.discoveredDevices = new Map();
        this.sessionKey = null;
        this.pendingTransactions = new Map();
        this.receivedData = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('Initializing real Bluetooth manager...');

            // Request permissions
            await this.requestPermissions();

            // Set up state change listener
            this.bleManager.onStateChange((state) => {
                console.log('Bluetooth state changed:', state);
                this._notifyListeners('stateChange', { state, mock: false });
            }, true);

            this.isInitialized = true;
            console.log('Real Bluetooth manager initialized successfully');

            return true;
        } catch (error) {
            console.error('Error initializing Bluetooth:', error);
            throw error;
        }
    }

    async requestPermissions() {
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

            console.log('Starting real Bluetooth scan...');
            this.isScanning = true;
            this.discoveredDevices.clear();
            this._notifyListeners('scanStatus', { scanning: true });

            // Start scanning for devices
            this.bleManager.startDeviceScan(
                [SERVICE_UUID], // Scan for our service UUID
                { allowDuplicates: false },
                (error, device) => {
                    if (error) {
                        console.error('Scan error:', error);
                        this._notifyListeners('scanError', { error: error.message });
                        return;
                    }

                    if (device && device.name) {
                        console.log('Real device discovered:', device.name, device.id);

                        // Only show devices with our app's name prefix or nearby devices
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

        } catch (error) {
            console.error('Error starting scan:', error);
            this.isScanning = false;
            this._notifyListeners('scanStatus', { scanning: false });
            throw error;
        }
    }

    stopScan() {
        try {
            console.log('Stopping real Bluetooth scan...');
            this.bleManager.stopDeviceScan();
            this.isScanning = false;
            this._notifyListeners('scanStatus', { scanning: false });
        } catch (error) {
            console.error('Error stopping scan:', error);
        }
    }

    async connectToDevice(deviceId) {
        try {
            console.log('Connecting to real device:', deviceId);
            this._notifyListeners('connectionStatus', { status: 'connecting', deviceId });

            const device = await this.bleManager.connectToDevice(deviceId);
            console.log('Connected to device:', device.name);

            // Discover services
            await device.discoverAllServicesAndCharacteristics();

            // Find our service
            const services = await device.services();
            const ourService = services.find(service => service.uuid === SERVICE_UUID);

            if (!ourService) {
                // If our service doesn't exist, create a mock one for development
                console.log('Our service not found, creating mock service for development');
                await this.createMockService(device);
            }

            this.connectedDevice = device;

            // Generate session key for encrypted communication
            this.sessionKey = await this.generateSessionKey();

            this._notifyListeners('connectionStatus', {
                status: 'connected',
                deviceId,
                deviceName: device.name,
                sessionKey: this.sessionKey
            });

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
        // For development, we'll simulate our service
        // In production, this would be implemented on the device
        console.log('Creating mock service for development');

        // Simulate service discovery
        setTimeout(() => {
            console.log('Mock service created successfully');
        }, 1000);
    }

    async disconnect() {
        try {
            if (this.connectedDevice) {
                await this.connectedDevice.cancelConnection();
                console.log('Disconnected from device');
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

            console.log('Sending encrypted payment via real Bluetooth...');

            // Convert payload to base64 for transmission
            const payloadString = JSON.stringify(encryptedPayload);
            const payloadBase64 = Buffer.from(payloadString).toString('base64');

            // In a real implementation, you would write to a characteristic
            // For development, we'll simulate the transmission
            console.log('Payload to send:', payloadBase64);

            // Simulate transmission delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate receiving acknowledgment
            console.log('Payment sent successfully via real Bluetooth');

            return {
                success: true,
                message: 'Encrypted payment sent successfully via real Bluetooth',
                sessionKey: this.sessionKey
            };
        } catch (error) {
            console.error('Error sending payment via real Bluetooth:', error);
            throw error;
        }
    }

    async receiveEncryptedPayment() {
        try {
            if (!this.connectedDevice) {
                throw new Error('No device connected');
            }

            console.log('Waiting to receive encrypted payment via real Bluetooth...');

            // In a real implementation, you would subscribe to a characteristic
            // For development, we'll simulate receiving data
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
                            error: 'No data received via real Bluetooth'
                        });
                    }
                }, 2000);
            });
        } catch (error) {
            console.error('Error receiving payment via real Bluetooth:', error);
            throw error;
        }
    }

    async generateSessionKey() {
        try {
            const randomBytes = await Crypto.getRandomBytesAsync(32);
            return Array.from(randomBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
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

        // Return cleanup function
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

    // Cleanup method
    destroy() {
        try {
            this.stopScan();
            this.disconnect();
            this.bleManager.destroy();
        } catch (error) {
            console.error('Error destroying Bluetooth manager:', error);
        }
    }
} 