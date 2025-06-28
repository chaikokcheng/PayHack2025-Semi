import { BarCodeScanner } from 'expo-barcode-scanner';
import MockScanner from './MockScanner.js';
import { CONFIG } from './config.js';

class UnifiedScanner {
    constructor() {
        this.mockScanner = new MockScanner();
        this.useMockScanner = CONFIG.USE_MOCK_SCANNER;
        this.isScanning = false;
        this.hasPermission = false;
        this.scanned = false;
    }

    /**
     * Request camera permissions
     */
    async requestPermissions() {
        if (this.useMockScanner) {
            // Mock scanner doesn't need camera permissions
            this.hasPermission = true;
            return true;
        }

        try {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            this.hasPermission = status === 'granted';
            return this.hasPermission;
        } catch (error) {
            console.error('Error requesting camera permissions:', error);
            this.hasPermission = false;
            return false;
        }
    }

    /**
     * Check if we have camera permissions
     */
    hasCameraPermission() {
        return this.hasPermission;
    }

    /**
     * Start scanning
     */
    async startScan(onResult, onError) {
        if (this.isScanning) {
            throw new Error('Scanner is already running');
        }

        this.isScanning = true;
        this.scanned = false;

        if (this.useMockScanner) {
            console.log('🔍 Using mock scanner');
            return this.mockScanner.startScan(onResult, onError);
        } else {
            console.log('🔍 Using real camera scanner');
            // Real scanner is handled by the BarCodeScanner component
            // This method is mainly for mock scanner
            return Promise.resolve();
        }
    }

    /**
     * Stop scanning
     */
    stopScan() {
        this.isScanning = false;

        if (this.useMockScanner) {
            this.mockScanner.stopScan();
        }

        console.log('🛑 Scanner stopped');
    }

    /**
     * Handle scan result from real camera
     */
    handleBarCodeScanned(result, onResult, onError) {
        if (this.scanned) return;

        this.scanned = true;

        try {
            console.log('📱 Real scan result:', result);

            // Parse the scanned data
            const parsedResult = this.parseScannedData(result.data);

            if (onResult) {
                onResult(parsedResult);
            }
        } catch (error) {
            console.error('❌ Error parsing scan result:', error);
            if (onError) {
                onError(error);
            }
        }
    }

    /**
     * Parse scanned QR code data
     */
    parseScannedData(data) {
        try {
            // Try to parse as JSON first
            const jsonData = JSON.parse(data);
            return {
                type: 'QR_CODE',
                data: data,
                ...jsonData
            };
        } catch (e) {
            // If not JSON, try to parse as payment token format
            if (data.startsWith('PAYMENT_TOKEN:')) {
                const parts = data.split(':');
                if (parts.length >= 5) {
                    return {
                        type: 'QR_CODE',
                        data: data,
                        tokenId: parts[1],
                        amount: parseFloat(parts[2]),
                        currency: parts[3],
                        timestamp: parts[4]
                    };
                }
            }

            // Return raw data if parsing fails
            return {
                type: 'QR_CODE',
                data: data,
                rawData: data
            };
        }
    }

    /**
     * Toggle between mock and real scanner
     */
    toggleScannerMode() {
        this.useMockScanner = !this.useMockScanner;
        console.log(`🔄 Switched to ${this.useMockScanner ? 'mock' : 'real'} scanner`);
        return this.useMockScanner;
    }

    /**
     * Set scanner mode explicitly
     */
    setScannerMode(useMock) {
        this.useMockScanner = useMock;
        console.log(`🔄 Set scanner to ${useMock ? 'mock' : 'real'} mode`);
    }

    /**
     * Get current scanner mode
     */
    getScannerMode() {
        return {
            isMock: this.useMockScanner,
            mode: this.useMockScanner ? 'mock' : 'real'
        };
    }

    /**
     * Generate mock QR data for testing
     */
    generateMockQRData(amount = 100.00, currency = 'MYR') {
        return this.mockScanner.generateMockQRData(amount, currency);
    }

    /**
     * Add custom mock data
     */
    addMockData(data) {
        this.mockScanner.addMockData(data);
    }

    /**
     * Get mock data
     */
    getMockData() {
        return this.mockScanner.getMockData();
    }

    /**
     * Clear mock data
     */
    clearMockData() {
        this.mockScanner.clearMockData();
    }

    /**
     * Check if currently scanning
     */
    isCurrentlyScanning() {
        return this.isScanning;
    }

    /**
     * Reset scan state
     */
    resetScanState() {
        this.scanned = false;
        this.isScanning = false;
    }

    /**
     * Get scanner configuration
     */
    getConfig() {
        return {
            useMockScanner: this.useMockScanner,
            hasPermission: this.hasPermission,
            isScanning: this.isScanning,
            scanned: this.scanned,
            mockConfig: {
                delay: CONFIG.MOCK_SCAN_DELAY,
                successRate: CONFIG.MOCK_SCAN_SUCCESS_RATE
            }
        };
    }
}

export default UnifiedScanner; 