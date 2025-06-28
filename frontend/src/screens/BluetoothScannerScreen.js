import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { FullScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import BluetoothManager from '../utils/BluetoothManager';
import OfflineTokenService from '../services/OfflineTokenService';
import { Colors } from '../constants/Colors';

export default function BluetoothScannerScreen({ navigation }) {
    const [devices, setDevices] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [offlineLimit, setOfflineLimit] = useState(0);
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        setupBluetooth();

        return () => {
            // Clean up Bluetooth connection when leaving the screen
            BluetoothManager.disconnect();
        };
    }, []);

    // Load pending transactions when screen is focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadPendingTransactions();
            setupBluetooth(); // Refresh authorization limits too
        });

        return unsubscribe;
    }, [navigation]);

    const loadPendingTransactions = async () => {
        try {
            const pending = await OfflineTokenService.getPendingTransactions();
            setPendingTransactions(pending);
        } catch (error) {
            console.error('Error loading pending transactions:', error);
        }
    };

    const handleSyncTransactions = async () => {
        try {
            setSyncing(true);
            const result = await OfflineTokenService.syncTransactions();

            if (result.success) {
                await loadPendingTransactions();
                await setupBluetooth();
            }
        } catch (error) {
            console.error('Error syncing transactions:', error);
        } finally {
            setSyncing(false);
        }
    };

    const setupBluetooth = async () => {
        try {
            // Initialize Bluetooth Manager
            BluetoothManager.initialize();

            // Check if we have tokens available for offline payment
            await OfflineTokenService.initialize();

            // Get active tokens
            const activeTokens = await OfflineTokenService.getActiveOfflineTokens();

            // Calculate offline limit (sum of remaining authorization balances)
            const totalLimit = activeTokens.reduce((sum, token) => {
                const remainingBalance = parseFloat(token.remaining_balance || token.amount);
                return sum + remainingBalance;
            }, 0);
            setOfflineLimit(totalLimit);

            // Load pending transactions
            await loadPendingTransactions();

            // Request permissions
            const hasPermission = await BluetoothManager.requestPermissions();
            setPermissionGranted(hasPermission);

            if (!hasPermission) {
                return;
            }

            // Set up device discovery listener
            const deviceListener = BluetoothManager.addListener('deviceDiscovered', (device) => {
                setDevices(currentDevices => {
                    // Check if device already exists
                    const exists = currentDevices.some(d => d.id === device.id);
                    if (exists) {
                        return currentDevices;
                    } else {
                        return [...currentDevices, device];
                    }
                });
            });

            // Set up scan status listener
            const scanListener = BluetoothManager.addListener('scanStatus', (status) => {
                setScanning(status.scanning);
            });

            // Set up connection status listener
            const connectionListener = BluetoothManager.addListener('connectionStatus', (status) => {
                setConnecting(status.status === 'connecting');

                if (status.status === 'connected') {
                    setConnectedDevice({
                        id: status.deviceId,
                        name: status.deviceName
                    });

                    // Navigate to transfer screen when connected
                    navigation.navigate('PaymentTransfer', {
                        deviceId: status.deviceId,
                        deviceName: status.deviceName
                    });
                }
            });

            // Set up error listener
            const errorListener = BluetoothManager.addListener('error', (error) => {
                console.error('Bluetooth error:', error);
            });

            // Start scan automatically
            startScan();

            // Return cleanup function
            return () => {
                deviceListener();
                scanListener();
                connectionListener();
                errorListener();
            };
        } catch (error) {
            console.error('Error setting up Bluetooth:', error);
        }
    };

    const startScan = async () => {
        try {
            setDevices([]); // Clear previous devices
            await BluetoothManager.startScan();
        } catch (error) {
            console.error('Error starting scan:', error);

            // Provide more specific error messages
            let errorMessage = 'Failed to start scanning';
            let errorTitle = 'Bluetooth Error';

            if (error.message.includes('permission')) {
                errorTitle = 'Permission Required';
                errorMessage = 'Bluetooth permission is required to scan for devices. Please enable it in your device settings.';
            } else if (error.message.includes('bluetooth')) {
                errorTitle = 'Bluetooth Not Available';
                errorMessage = 'Please make sure Bluetooth is enabled on your device.';
            } else if (error.message.includes('token')) {
                errorTitle = 'No Tokens Available';
                errorMessage = 'You need to create offline tokens first.';
            }

            // Log error instead of showing popup
            console.error(errorTitle, errorMessage);
        }
    };

    const stopScan = () => {
        BluetoothManager.stopScan();
    };

    const connectToDevice = async (deviceId) => {
        try {
            await BluetoothManager.connectToDevice(deviceId);
        } catch (error) {
            console.error('Error connecting to device:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.deviceItem}
            onPress={() => connectToDevice(item.id)}
            disabled={connecting}
        >
            <View style={styles.deviceIcon}>
                <Ionicons name="phone-portrait" size={24} color="#6366F1" />
            </View>

            <View style={styles.deviceDetails}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceInfo}>Signal: {item.rssi} dBm</Text>
            </View>

            <View style={styles.deviceAction}>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            {scanning ? (
                <>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.emptyText}>Scanning for devices...</Text>
                </>
            ) : offlineLimit <= 0 ? (
                <>
                    <Ionicons name="wallet-outline" size={50} color="#EF4444" />
                    <Text style={styles.emptyText}>No offline tokens available</Text>
                    <Text style={styles.emptySubtext}>
                        Create authorization tokens first to enable offline payments
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyStateButton}
                        onPress={() => navigation.navigate('OfflinePayment')}
                    >
                        <Text style={styles.emptyStateButtonText}>Create Authorization Tokens</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Ionicons name="bluetooth" size={50} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No nearby devices found</Text>
                    <Text style={styles.emptySubtext}>Make sure Bluetooth is enabled on both devices</Text>
                </>
            )}
        </View>
    );

    return (
        <FullScreenSafeArea style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Connect to Device</Text>
                <TouchableOpacity onPress={scanning ? stopScan : startScan}>
                    <Ionicons
                        name={scanning ? "stop-circle" : "refresh"}
                        size={24}
                        color={scanning ? "#EF4444" : "#3B82F6"}
                    />
                </TouchableOpacity>
            </View>

            {/* Status Card */}
            <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: scanning ? '#10B981' : (offlineLimit > 0 ? '#F59E0B' : '#EF4444') }
                    ]} />
                    <Text style={styles.statusText}>
                        {scanning ? 'Scanning for devices...' : (offlineLimit > 0 ? 'Ready to scan' : 'No authorization tokens')}
                    </Text>
                </View>

                <View style={styles.statusRow}>
                    <Text style={styles.limitLabel}>Authorization Limit:</Text>
                    <Text style={[
                        styles.limitAmount,
                        offlineLimit <= 0 && styles.limitAmountWarning
                    ]}>
                        RM {offlineLimit.toFixed(2)}
                    </Text>
                </View>

                {/* Pending Transactions */}
                {pendingTransactions.length > 0 && (
                    <View style={styles.statusRow}>
                        <Text style={styles.limitLabel}>Pending Sync:</Text>
                        <Text style={styles.pendingCount}>
                            {pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}

                {/* Demo Mode Indicator */}
                <View style={styles.demoModeContainer}>
                    <Ionicons name="phone-portrait" size={16} color="#6366F1" />
                    <Text style={styles.demoModeText}>Demo Mode - Mock Devices</Text>
                </View>

                {/* Sync Button */}
                {pendingTransactions.length > 0 && (
                    <TouchableOpacity
                        style={styles.syncButton}
                        onPress={handleSyncTransactions}
                        disabled={syncing}
                    >
                        <Ionicons
                            name={syncing ? "sync" : "cloud-upload"}
                            size={16}
                            color="white"
                        />
                        <Text style={styles.syncButtonText}>
                            {syncing ? 'Syncing...' : 'Sync Transactions'}
                        </Text>
                    </TouchableOpacity>
                )}

                {offlineLimit <= 0 && (
                    <TouchableOpacity
                        style={styles.createTokenButton}
                        onPress={() => navigation.navigate('OfflinePayment')}
                    >
                        <Ionicons name="add-circle" size={16} color="white" />
                        <Text style={styles.createTokenButtonText}>Create Authorization Tokens</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Device List */}
            <Text style={styles.sectionTitle}>
                {devices.length > 0 ? 'Available Devices' : (scanning ? 'Scanning...' : 'No devices found')}
            </Text>

            <FlatList
                data={devices}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
            />

            {/* Action Button */}
            <View style={styles.buttonContainer}>
                {scanning ? (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.stopButton]}
                        onPress={stopScan}
                    >
                        <Ionicons name="stop" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Stop Scanning</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={startScan}
                    >
                        <Ionicons name="scan" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Scan Again</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Connecting Indicator */}
            {connecting && (
                <View style={styles.connectingOverlay}>
                    <View style={styles.connectingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.connectingText}>Connecting...</Text>
                    </View>
                </View>
            )}
        </FullScreenSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statusCard: {
        margin: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
    },
    limitLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    limitAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    limitAmountWarning: {
        color: '#EF4444',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        paddingHorizontal: 16,
        marginVertical: 12,
    },
    listContainer: {
        paddingHorizontal: 16,
        flexGrow: 1,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    deviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deviceDetails: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    deviceInfo: {
        fontSize: 12,
        color: '#6B7280',
    },
    deviceAction: {
        padding: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
        color: '#4B5563',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    buttonContainer: {
        padding: 16,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#6366F1',
        borderRadius: 8,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
    connectingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectingContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 32,
        paddingVertical: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    connectingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    createTokenButton: {
        backgroundColor: '#6366F1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    createTokenButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 6,
    },
    emptyStateButton: {
        backgroundColor: '#6366F1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 6,
    },
    demoModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    demoModeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6366F1',
        marginLeft: 8,
    },
    pendingCount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    syncButton: {
        backgroundColor: '#6366F1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 6,
    },
}); 