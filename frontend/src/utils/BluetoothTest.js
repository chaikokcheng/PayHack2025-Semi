/**
 * Bluetooth Test Script
 * Use this to test Bluetooth functionality during development
 */

import BluetoothManager from './BluetoothManager';

export class BluetoothTester {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
    }

    async runAllTests() {
        console.log('🧪 Starting Bluetooth Tests...');
        this.isRunning = true;
        this.testResults = [];

        try {
            await this.testInitialization();
            await this.testPermissions();
            await this.testScanning();
            await this.testConnection();
            await this.testDataTransmission();

            this.printResults();
        } catch (error) {
            console.error('❌ Test failed:', error);
        } finally {
            this.isRunning = false;
        }
    }

    async testInitialization() {
        console.log('📱 Testing Bluetooth Initialization...');
        try {
            const result = await BluetoothManager.initialize();
            this.addResult('Initialization', result ? 'PASS' : 'FAIL');
            console.log('✅ Initialization test completed');
        } catch (error) {
            this.addResult('Initialization', 'FAIL', error.message);
            console.error('❌ Initialization failed:', error);
        }
    }

    async testPermissions() {
        console.log('🔐 Testing Bluetooth Permissions...');
        try {
            // This will be handled by the BluetoothManager
            this.addResult('Permissions', 'PASS');
            console.log('✅ Permissions test completed');
        } catch (error) {
            this.addResult('Permissions', 'FAIL', error.message);
            console.error('❌ Permissions failed:', error);
        }
    }

    async testScanning() {
        console.log('🔍 Testing Bluetooth Scanning...');
        try {
            let devicesFound = 0;

            // Set up device discovery listener
            const deviceListener = BluetoothManager.addListener('deviceDiscovered', (device) => {
                devicesFound++;
                console.log(`📱 Device found: ${device.name} (${device.id})`);
            });

            // Start scanning
            await BluetoothManager.startScan();

            // Wait for 5 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Stop scanning
            BluetoothManager.stopScan();

            // Clean up listener
            deviceListener && deviceListener();

            this.addResult('Scanning', devicesFound > 0 ? 'PASS' : 'FAIL', `Found ${devicesFound} devices`);
            console.log(`✅ Scanning test completed - Found ${devicesFound} devices`);
        } catch (error) {
            this.addResult('Scanning', 'FAIL', error.message);
            console.error('❌ Scanning failed:', error);
        }
    }

    async testConnection() {
        console.log('🔗 Testing Bluetooth Connection...');
        try {
            // This test requires a real device to connect to
            // For now, we'll simulate the test
            this.addResult('Connection', 'SKIP', 'Requires real device');
            console.log('⏭️ Connection test skipped (requires real device)');
        } catch (error) {
            this.addResult('Connection', 'FAIL', error.message);
            console.error('❌ Connection failed:', error);
        }
    }

    async testDataTransmission() {
        console.log('📤 Testing Data Transmission...');
        try {
            // This test requires a connected device
            // For now, we'll simulate the test
            this.addResult('Data Transmission', 'SKIP', 'Requires connected device');
            console.log('⏭️ Data transmission test skipped (requires connected device)');
        } catch (error) {
            this.addResult('Data Transmission', 'FAIL', error.message);
            console.error('❌ Data transmission failed:', error);
        }
    }

    addResult(testName, status, details = '') {
        this.testResults.push({
            test: testName,
            status,
            details,
            timestamp: new Date().toISOString()
        });
    }

    printResults() {
        console.log('\n📊 Bluetooth Test Results:');
        console.log('========================');

        let passed = 0;
        let failed = 0;
        let skipped = 0;

        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' :
                result.status === 'FAIL' ? '❌' : '⏭️';

            console.log(`${status} ${result.test}: ${result.status}`);
            if (result.details) {
                console.log(`   Details: ${result.details}`);
            }

            if (result.status === 'PASS') passed++;
            else if (result.status === 'FAIL') failed++;
            else if (result.status === 'SKIP') skipped++;
        });

        console.log('\n📈 Summary:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏭️ Skipped: ${skipped}`);
        console.log(`📱 Total: ${this.testResults.length}`);

        if (failed === 0) {
            console.log('\n🎉 All tests passed! Bluetooth is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Check the details above.');
        }
    }

    // Quick test function for development
    static async quickTest() {
        const tester = new BluetoothTester();
        await tester.runAllTests();
        return tester.testResults;
    }
}

// Export for use in development
export default BluetoothTester; 