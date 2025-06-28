export default class MockBluetoothManager {
    constructor() {
        this.isEmulator = true;
        this.device = null;
        this.isScanning = false;
        this.listeners = new Map();
        this.connectedDevice = null;
        this.discoveredDevices = new Map();
        this.sessionKey = null;
        this.pendingTransactions = new Map();
        this.receivedData = null;

        // Mock devices for demo
        this.mockDevices = [
            { id: 'B8:27:EB:12:34:56', name: 'HUAWEI P50 Pro', rssi: -38 },
            { id: '2C:F0:EE:AB:CD:EF', name: 'iPhone 14 Pro', rssi: -65 },
            { id: '48:D6:D5:9A:BC:DE', name: 'Samsung Galaxy A54', rssi: -58 },
            { id: '74:E5:43:78:90:12', name: 'Xiaomi 13', rssi: -42 },
        ];
    }

    initialize() {
        setTimeout(() => {
            this._notifyListeners('stateChange', { state: 'PoweredOn', mock: true });
        }, 500);
    }

    async requestPermissions() {
        return true;
    }

    async startScan() {
        this.isScanning = true;
        this._notifyListeners('scanStatus', { scanning: true });

        // Simulate discovering devices over time
        this.mockDevices.forEach((device, index) => {
            setTimeout(() => {
                if (this.isScanning) {
                    console.log('Mock device discovered:', device.name);
                    this._notifyListeners('deviceDiscovered', device);
                }
            }, (index + 1) * 800); // Stagger device discovery
        });

        // Stop scanning after 5 seconds
        setTimeout(() => {
            if (this.isScanning) {
                this.stopScan();
            }
        }, 5000);
    }

    stopScan() {
        this.isScanning = false;
        this._notifyListeners('scanStatus', { scanning: false });
    }

    async connectToDevice(deviceId) {
        // Simulate connection process
        this._notifyListeners('connectionStatus', { status: 'connecting', deviceId });

        setTimeout(() => {
            const device = this.mockDevices.find(d => d.id === deviceId) ||
                { id: deviceId, name: 'Unknown Device' };

            this.connectedDevice = device;

            // Generate session key for encrypted communication
            this.sessionKey = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

            this._notifyListeners('connectionStatus', {
                status: 'connected',
                deviceId,
                deviceName: device.name,
                sessionKey: this.sessionKey
            });
        }, 1500);

        return true;
    }

    async disconnect() {
        this.connectedDevice = null;
        this.sessionKey = null;
        this.receivedData = null;
        this._notifyListeners('connectionStatus', { status: 'disconnected' });
    }

    /**
     * Send encrypted payment data to connected device
     */
    async sendEncryptedPayment(encryptedPayload) {
        if (!this.connectedDevice) {
            throw new Error('No device connected');
        }

        if (!this.sessionKey) {
            throw new Error('No session key established');
        }

        // Simulate encrypted data transfer
        setTimeout(() => {
            // Store the received data for the connected device
            this.receivedData = {
                ...encryptedPayload,
                receivedAt: new Date().toISOString(),
                senderDevice: this.connectedDevice.id
            };

            // Notify that data was received
            this._notifyListeners('dataReceived', {
                data: this.receivedData,
                senderDevice: this.connectedDevice.id,
                timestamp: new Date().toISOString()
            });
        }, 1000);

        return {
            success: true,
            message: 'Encrypted payment sent successfully',
            sessionKey: this.sessionKey
        };
    }

    /**
     * Receive encrypted payment data
     */
    async receiveEncryptedPayment() {
        if (!this.connectedDevice) {
            throw new Error('No device connected');
        }

        // Simulate receiving data
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
                        error: 'No data received'
                    });
                }
            }, 500);
        });
    }

    /**
     * Get current session key
     */
    getSessionKey() {
        return this.sessionKey;
    }

    /**
     * Check if device is connected
     */
    isConnected() {
        return this.connectedDevice !== null;
    }

    /**
     * Get connected device info
     */
    getConnectedDevice() {
        return this.connectedDevice;
    }

    addListener(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
        return () => {
            this.listeners.get(eventName).delete(callback);
        };
    }

    _notifyListeners(eventName, data) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners) {
            eventListeners.forEach(cb => cb(data));
        }
    }
} 