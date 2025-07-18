import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';
import { FullScreenSafeArea } from '../../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import OfflineTokenService from '../../services/OfflineTokenService';
import BluetoothManager from '../../utils/BluetoothManager';
import { Colors } from '../../constants/Colors';

export default function OfflinePaymentScreen({ navigation }) {
    const [balance, setBalance] = useState(0);
    const [offlineLimit, setOfflineLimit] = useState(0);
    const [offlineTokens, setOfflineTokens] = useState([]);
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [devices, setDevices] = useState([]);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [tokenAmount, setTokenAmount] = useState('');
    const [creatingToken, setCreatingToken] = useState(false);
    const [showDeviceList, setShowDeviceList] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState(''); // 'success', 'error', 'info'
    const [isOnline, setIsOnline] = useState(true);
    const [receivedPayment, setReceivedPayment] = useState(null);
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendAmount, setSendAmount] = useState('');
    const [sendingPayment, setSendingPayment] = useState(false);
    const [selectedToken, setSelectedToken] = useState(null);

    // Load data when screen mounts
    useEffect(() => {
        loadData();

        // Refresh data when screen is focused
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const check = async () => {
            try {
                const online = await OfflineTokenService.checkConnectivity();
                setIsOnline(online);
            } catch {
                setIsOnline(false);
            }
        };
        check();
        const unsubscribe = navigation.addListener('focus', check);
        return unsubscribe;
    }, [navigation]);

    // Set up Bluetooth data reception listener
    useEffect(() => {
        const dataListener = BluetoothManager.addListener('dataReceived', (data) => {
            handleReceivedPayment(data);
        });

        return () => {
            dataListener && dataListener();
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Initialize services
            await OfflineTokenService.initialize();

            // Get balance
            const userBalance = OfflineTokenService.getBalance();
            setBalance(userBalance);

            // Get active tokens
            const activeTokens = await OfflineTokenService.getActiveOfflineTokens();
            setOfflineTokens(activeTokens);

            // Calculate offline limit (sum of remaining authorization balances)
            const totalLimit = activeTokens.reduce((sum, token) => {
                const remainingBalance = parseFloat(token.remaining_balance || token.amount);
                return sum + remainingBalance;
            }, 0);
            setOfflineLimit(totalLimit);

            // Get pending transactions
            const pending = await OfflineTokenService.getPendingTransactions();
            setPendingTransactions(pending);

            setLoading(false);
        } catch (error) {
            console.error('Error loading offline payment data:', error);
            showStatus('Failed to load offline payment data', 'error');
            setLoading(false);
        }
    };

    const showStatus = (message, type = 'info') => {
        setStatusMessage(message);
        setStatusType(type);
        setTimeout(() => {
            setStatusMessage('');
            setStatusType('');
        }, 3000);
    };

    const handleSyncTransactions = async () => {
        try {
            setSyncLoading(true);
            const result = await OfflineTokenService.syncTransactions();

            if (result.success) {
                if (result.count > 0) {
                    showStatus(result.message, 'success');
                } else {
                    showStatus(result.message, 'info');
                }
                await loadData(); // Refresh data
            } else {
                showStatus(result.message, 'error');
            }
        } catch (error) {
            // Provide more user-friendly error messages
            if (error.message.includes('No internet connection') || error.message.includes('Network')) {
                showStatus('No internet connection. Transactions will sync when you\'re back online.', 'info');
            } else {
                showStatus('Failed to sync transactions: ' + error.message, 'error');
            }
        } finally {
            setSyncLoading(false);
        }
    };

    const handleCreateToken = async () => {
        if (!tokenAmount || isNaN(parseFloat(tokenAmount)) || parseFloat(tokenAmount) <= 0) {
            showStatus('Please enter a valid amount', 'error');
            return;
        }

        const amount = parseFloat(tokenAmount);

        // Check if user has enough balance
        if (amount > balance) {
            showStatus(`Insufficient balance. You have RM ${balance.toFixed(2)} available.`, 'error');
            return;
        }

        try {
            setCreatingToken(true);
            await OfflineTokenService.createOfflineToken(amount);
            setShowTokenModal(false);
            setTokenAmount('');
            await loadData(); // Refresh data
            showStatus(`Created authorization token for RM ${amount.toFixed(2)}`, 'success');
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            setCreatingToken(false);
        }
    };

    const handleDeleteToken = async (tokenId) => {
        try {
            await OfflineTokenService.deleteOfflineToken(tokenId);
            await loadData(); // Refresh data
            showStatus('Token deleted successfully', 'success');
        } catch (error) {
            showStatus(error.message, 'error');
        }
    };

    const startBluetoothScan = async () => {
        try {
            setDevices([]);
            setScanning(true);
            setShowDeviceList(true);

            // Initialize Bluetooth
            BluetoothManager.initialize();

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

            // Start scan
            await BluetoothManager.startScan();

            // Stop scanning after 10 seconds
            setTimeout(() => {
                BluetoothManager.stopScan();
                setScanning(false);
            }, 10000);

            // Return cleanup function
            return () => {
                deviceListener();
                scanListener();
            };
        } catch (error) {
            console.error('Error starting scan:', error);
            showStatus('Failed to start scanning for devices.', 'error');
            setScanning(false);
        }
    };

    const connectToDevice = async (device) => {
        try {
            // Stop scanning
            BluetoothManager.stopScan();
            setScanning(false);
            setShowDeviceList(false);

            // Navigate to payment screen
            navigation.navigate('PaymentTransfer', {
                deviceId: device.id,
                deviceName: device.name
            });
        } catch (error) {
            console.error('Error connecting to device:', error);
            showStatus('Failed to connect to the selected device.', 'error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const formatTimeRemaining = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const handleReceivedPayment = async (data) => {
        try {
            setReceivedPayment(data);
            setShowReceiveModal(true);

            showStatus('Payment received! Please verify and accept/reject.', 'info');
        } catch (error) {
            console.error('Error handling received payment:', error);
            showStatus('Error processing received payment', 'error');
        }
    };

    const verifyAndAcceptPayment = async () => {
        if (!receivedPayment) return;

        try {
            setVerifyingPayment(true);

            // Extract payment data
            const paymentData = receivedPayment.data;
            const sessionKey = receivedPayment.sessionKey;

            // Verify the payment payload
            const verificationResult = await OfflineTokenService.verifyReceivedToken(
                paymentData.token_id,
                paymentData.amount,
                paymentData.sender_device
            );

            if (verificationResult.success && verificationResult.can_accept) {
                // Accept the payment
                const acceptResult = await OfflineTokenService.acceptReceivedPayment(
                    paymentData,
                    verificationResult.verification
                );

                if (acceptResult.success) {
                    showStatus('Payment accepted and stored locally!', 'success');
                    setShowReceiveModal(false);
                    setReceivedPayment(null);
                    await loadData(); // Refresh data
                } else {
                    showStatus('Failed to accept payment: ' + acceptResult.error, 'error');
                }
            } else {
                // Reject the payment
                const rejectResult = await OfflineTokenService.rejectReceivedPayment(
                    paymentData,
                    verificationResult.error || 'Token verification failed'
                );

                if (rejectResult.success) {
                    showStatus('Payment rejected: ' + rejectResult.rejection_reason, 'error');
                    setShowReceiveModal(false);
                    setReceivedPayment(null);
                } else {
                    showStatus('Failed to reject payment: ' + rejectResult.error, 'error');
                }
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            showStatus('Error verifying payment: ' + error.message, 'error');
        } finally {
            setVerifyingPayment(false);
        }
    };

    const rejectPayment = async () => {
        if (!receivedPayment) return;

        try {
            setVerifyingPayment(true);

            const paymentData = receivedPayment.data;
            const rejectResult = await OfflineTokenService.rejectReceivedPayment(
                paymentData,
                'Payment rejected by user'
            );

            if (rejectResult.success) {
                showStatus('Payment rejected', 'info');
                setShowReceiveModal(false);
                setReceivedPayment(null);
            } else {
                showStatus('Failed to reject payment: ' + rejectResult.error, 'error');
            }
        } catch (error) {
            console.error('Error rejecting payment:', error);
            showStatus('Error rejecting payment: ' + error.message, 'error');
        } finally {
            setVerifyingPayment(false);
        }
    };

    const handleSendPayment = async (device) => {
        if (!BluetoothManager.isConnected()) {
            showStatus('Please connect to a device first', 'error');
            return;
        }

        if (offlineTokens.length === 0) {
            showStatus('No authorization tokens available', 'error');
            return;
        }

        setSelectedToken(offlineTokens[0]); // Use first available token
        setShowSendModal(true);
    };

    const sendPayment = async () => {
        if (!selectedToken || !sendAmount || isNaN(parseFloat(sendAmount))) {
            showStatus('Please select a token and enter a valid amount', 'error');
            return;
        }

        const amount = parseFloat(sendAmount);

        // Check if token has enough remaining balance
        const remainingBalance = parseFloat(selectedToken.remaining_balance || selectedToken.amount);
        if (amount > remainingBalance) {
            showStatus(`Amount exceeds token limit. Available: RM ${remainingBalance.toFixed(2)}`, 'error');
            return;
        }

        try {
            setSendingPayment(true);

            // Get session key from Bluetooth connection
            const sessionKey = BluetoothManager.getSessionKey();
            if (!sessionKey) {
                throw new Error('No secure session established');
            }

            // Create secure payment payload
            const securePayload = await OfflineTokenService.createSecurePaymentPayload(
                selectedToken,
                'recipient_user_id', // In real app, get from connected device
                amount,
                sessionKey
            );

            // Send encrypted payment via Bluetooth
            const sendResult = await BluetoothManager.sendEncryptedPayment(securePayload);

            if (sendResult.success) {
                // Update token remaining balance
                await OfflineTokenService.updateAuthorizationBalances(amount);

                showStatus(`Payment sent successfully! Amount: RM ${amount.toFixed(2)}`, 'success');
                setShowSendModal(false);
                setSendAmount('');
                await loadData(); // Refresh data
            } else {
                showStatus('Failed to send payment: ' + sendResult.error, 'error');
            }
        } catch (error) {
            console.error('Error sending payment:', error);
            showStatus('Error sending payment: ' + error.message, 'error');
        } finally {
            setSendingPayment(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading offline payment data...</Text>
            </View>
        );
    }

    return (
        <FullScreenSafeArea style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offline Payment</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: isOnline ? '#10B981' : '#EF4444',
                        marginRight: 4
                    }} />
                    <Text style={{ fontSize: 12, color: isOnline ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Message */}
                {statusMessage ? (
                    <View style={[
                        styles.statusMessage,
                        statusType === 'success' && styles.statusSuccess,
                        statusType === 'error' && styles.statusError,
                        statusType === 'info' && styles.statusInfo
                    ]}>
                        <Ionicons
                            name={
                                statusType === 'success' ? 'checkmark-circle' :
                                    statusType === 'error' ? 'close-circle' :
                                        'information-circle'
                            }
                            size={16}
                            color="white"
                        />
                        <Text style={styles.statusMessageText}>{statusMessage}</Text>
                    </View>
                ) : null}

                {/* Authorization Status Card */}
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.statusCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.statusHeader}>
                        <Ionicons name="shield-outline" size={20} color="white" />
                        <View style={styles.statusBadge}>
                            {offlineLimit > 0 ? (
                                <Text style={styles.statusBadgeText}>Ready</Text>
                            ) : (
                                <Text style={styles.statusBadgeText}>Not configured</Text>
                            )}
                        </View>
                    </View>

                    <Text style={styles.statusTitle}>Authorization Limit</Text>
                    <Text style={styles.statusAmount}>RM {offlineLimit.toFixed(2)}</Text>

                    <View style={styles.statusInfo}>
                        <Text style={styles.statusInfoText}>
                            {offlineTokens.length} Token{offlineTokens.length !== 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.statusInfoText}>
                            {pendingTransactions.length} Pending
                        </Text>
                    </View>
                </LinearGradient>

                {/* Token Management Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Authorization Tokens</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowTokenModal(true)}
                        >
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {offlineTokens.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="key-outline" size={40} color="#6B7280" />
                            <Text style={styles.emptyStateText}>No authorization tokens</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Create a token to enable offline payments
                            </Text>
                        </View>
                    ) : (
                        offlineTokens.map((token) => (
                            <View key={token.token_id} style={styles.tokenItem}>
                                <View style={styles.tokenIcon}>
                                    <Ionicons name="key" size={20} color="#6366F1" />
                                </View>

                                <View style={styles.tokenDetails}>
                                    <Text style={styles.tokenTitle}>
                                        Token {token.token_id.slice(-8)}
                                    </Text>
                                    <Text style={styles.tokenAmount}>
                                        RM {parseFloat(token.remaining_balance || token.amount).toFixed(2)}
                                    </Text>
                                    <Text style={styles.tokenTime}>
                                        Expires in {formatTimeRemaining(token.time_remaining)}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteToken(token.token_id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>

                {/* Pending Transactions Section */}
                {pendingTransactions.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Pending Transactions</Text>
                            <TouchableOpacity
                                style={styles.syncButton}
                                onPress={handleSyncTransactions}
                                disabled={syncLoading}
                            >
                                {syncLoading ? (
                                    <ActivityIndicator color="#6366F1" size="small" />
                                ) : (
                                    <Ionicons name="sync" size={20} color="#6366F1" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {pendingTransactions.map((tx) => (
                            <View key={tx.id} style={styles.transactionItem}>
                                <View style={[styles.transactionIcon,
                                tx.type === 'outgoing' ? { backgroundColor: '#EF4444' } : { backgroundColor: '#10B981' }
                                ]}>
                                    <Ionicons
                                        name={tx.type === 'outgoing' ? 'arrow-up' : 'arrow-down'}
                                        size={20}
                                        color="white"
                                    />
                                </View>
                                <View style={styles.transactionDetails}>
                                    <Text style={styles.transactionAmount}>
                                        RM {parseFloat(tx.amount).toFixed(2)}
                                    </Text>
                                    <Text style={styles.transactionDesc}>{tx.description}</Text>
                                    <Text style={styles.transactionTime}>
                                        {formatDate(tx.timestamp)}
                                    </Text>
                                </View>
                                <View style={styles.transactionStatus}>
                                    <Text style={styles.statusText}>Pending</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Bluetooth Actions Section */}
                {!showDeviceList && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Bluetooth Actions</Text>

                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={startBluetoothScan}
                            disabled={scanning}
                        >
                            <Ionicons name="bluetooth" size={24} color="white" />
                            <Text style={styles.scanButtonText}>
                                {scanning ? 'Scanning...' : 'Scan Devices'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.receiveButton}
                            onPress={() => navigation.navigate('ReceivePayment')}
                        >
                            <Ionicons name="download" size={24} color="white" />
                            <Text style={styles.receiveButtonText}>
                                Receive Payment
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Device List */}
                {showDeviceList && (
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Available Devices ({devices.length})</Text>
                            <TouchableOpacity
                                style={styles.stopButton}
                                onPress={() => {
                                    BluetoothManager.stopScan();
                                    setScanning(false);
                                    setShowDeviceList(false);
                                    setDevices([]);
                                }}
                            >
                                <Ionicons name="close" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>

                        {devices.length === 0 ? (
                            <View style={styles.emptyState}>
                                {scanning ? (
                                    <ActivityIndicator size="large" color={Colors.primary} />
                                ) : (
                                    <Ionicons name="bluetooth" size={40} color="#6B7280" />
                                )}
                                <Text style={styles.emptyStateText}>
                                    {scanning ? 'Scanning for devices...' : 'No devices found'}
                                </Text>
                            </View>
                        ) : (
                            <View>
                                {devices.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.deviceItem}
                                        onPress={() => connectToDevice(item)}
                                    >
                                        <View style={styles.deviceIcon}>
                                            <Ionicons name="phone-portrait" size={24} color={Colors.primary} />
                                        </View>
                                        <View style={styles.deviceDetails}>
                                            <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
                                            <Text style={styles.deviceId}>ID: {item.id.substring(0, 8)}...</Text>
                                            <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Token Creation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showTokenModal}
                onRequestClose={() => setShowTokenModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Create Auth Token</Text>

                        {/* Balance Information */}
                        <View style={styles.balanceInfoContainer}>
                            <View style={styles.balanceInfoRow}>
                                <Text style={styles.balanceInfoLabel}>Wallet Balance:</Text>
                                <Text style={styles.balanceInfoAmount}>RM {balance.toFixed(2)}</Text>
                            </View>
                            <View style={styles.balanceInfoRow}>
                                <Text style={styles.balanceInfoLabel}>Maximum Limit:</Text>
                                <Text style={styles.balanceInfoAmount}>RM {balance.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Amount (RM)</Text>
                            <TextInput
                                style={styles.amountInput}
                                value={tokenAmount}
                                onChangeText={setTokenAmount}
                                placeholder="0.00"
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            <Text style={styles.inputHint}>
                                This creates permission for offline payments up to this amount
                            </Text>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowTokenModal(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={handleCreateToken}
                                disabled={creatingToken}
                            >
                                {creatingToken ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.modalConfirmButtonText}>Create</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Receive Payment Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showReceiveModal}
                onRequestClose={() => setShowReceiveModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Verify Payment</Text>

                        <Text style={styles.modalDescription}>
                            Payment received! Please verify and accept/reject.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={verifyAndAcceptPayment}
                                disabled={verifyingPayment}
                            >
                                {verifyingPayment ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={rejectPayment}
                                disabled={verifyingPayment}
                            >
                                {verifyingPayment ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.rejectButtonText}>Reject</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Send Payment Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showSendModal}
                onRequestClose={() => setShowSendModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Send Payment</Text>

                        <Text style={styles.modalDescription}>
                            Send encrypted payment to connected device
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Amount (MYR)</Text>
                            <TextInput
                                style={styles.input}
                                value={sendAmount}
                                onChangeText={setSendAmount}
                                placeholder="Enter amount"
                                keyboardType="numeric"
                                editable={!sendingPayment}
                            />
                        </View>

                        {selectedToken && (
                            <View style={styles.tokenInfo}>
                                <Text style={styles.tokenInfoText}>
                                    Token: {selectedToken.token_id.substring(0, 8)}...
                                </Text>
                                <Text style={styles.tokenInfoText}>
                                    Available: RM {parseFloat(selectedToken.remaining_balance || selectedToken.amount).toFixed(2)}
                                </Text>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={sendPayment}
                                disabled={sendingPayment}
                            >
                                {sendingPayment ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.acceptButtonText}>Send</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => setShowSendModal(false)}
                                disabled={sendingPayment}
                            >
                                <Text style={styles.rejectButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </FullScreenSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6B7280',
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
        margin: 8,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '500',
    },
    statusTitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    statusAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 6,
    },
    statusInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusInfoText: {
        fontSize: 11,
        color: '#92400E',
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 13,
        color: '#4B5563',
    },
    sectionContainer: {
        padding: 12,
        marginBottom: 6,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    syncButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    transactionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    transactionDesc: {
        fontSize: 12,
        color: '#6B7280',
    },
    transactionTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    transactionStatus: {
        width: 80,
        height: 24,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        color: '#6B7280',
    },
    securityCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 16,
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    securityText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
    addButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#6366F1',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginVertical: 8,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
    tokenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tokenIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tokenDetails: {
        flex: 1,
    },
    tokenTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    tokenAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6366F1',
        marginBottom: 2,
    },
    tokenTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        marginVertical: 8,
    },
    scanButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginLeft: 12,
    },
    receiveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        marginVertical: 8,
    },
    receiveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginLeft: 12,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        maxWidth: 400,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    amountInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    modalCancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    modalConfirmButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#6366F1',
        alignItems: 'center',
    },
    modalConfirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    deviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
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
        marginBottom: 2,
    },
    deviceId: {
        fontSize: 12,
        color: '#6B7280',
    },
    deviceRssi: {
        fontSize: 12,
        color: '#6B7280',
    },
    deviceActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#6366F1',
        marginRight: 8,
    },
    connectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    sendButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#10B981',
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    deviceList: {
        flex: 1,
    },
    stopButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    statusMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statusSuccess: {
        backgroundColor: '#d1fae5',
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    statusError: {
        backgroundColor: '#fef2f2',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
    },
    statusInfo: {
        backgroundColor: '#fef3c7',
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    statusMessageText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 8,
        flex: 1,
    },
    balanceInfoContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    balanceInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceInfoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    balanceInfoAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6366F1',
    },
    inputHint: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
    },
    acceptButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#10B981',
        alignItems: 'center',
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    rejectButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        alignItems: 'center',
    },
    rejectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    modalDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    tokenInfo: {
        marginBottom: 20,
    },
    tokenInfoText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    deviceListContent: {
        padding: 16,
    },
}); 