import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { FullScreenSafeArea } from '../../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import OfflineTokenService from '../../services/OfflineTokenService';
import SecureTokenManager from '../../utils/SecureTokenManager';
import { Colors } from '../../constants/Colors';

export default function PaymentTransferScreen({ route, navigation }) {
    const { deviceId, deviceName } = route.params || {};
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [offlineTokens, setOfflineTokens] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('');

    useEffect(() => {
        loadOfflineData();
    }, []);

    const showStatus = (message, type = 'error') => {
        setStatusMessage(message);
        setStatusType(type);
        setTimeout(() => {
            setStatusMessage('');
            setStatusType('');
        }, 3000);
    };

    const loadOfflineData = async () => {
        try {
            // Initialize service
            await OfflineTokenService.initialize();

            // Get active tokens for offline authorization
            const tokens = await OfflineTokenService.getActiveOfflineTokens();
            setOfflineTokens(tokens);

            // Calculate total offline authorization balance
            const totalOfflineLimit = tokens.reduce((sum, token) => {
                const remainingBalance = parseFloat(token.remaining_balance || token.amount);
                return sum + remainingBalance;
            }, 0);
            setAvailableBalance(totalOfflineLimit);
        } catch (error) {
            console.error('Error loading offline data:', error);
        }
    };

    const validateAmount = () => {
        const amountValue = parseFloat(amount);
        if (!amount || isNaN(amountValue) || amountValue <= 0) {
            showStatus('Please enter a valid amount greater than 0.', 'error');
            return false;
        }

        // Check if user has enough offline authorization
        if (amountValue > availableBalance) {
            showStatus(`You only have RM ${availableBalance.toFixed(2)} available for offline payments. Please create more authorization tokens.`, 'error');
            return false;
        }

        return true;
    };

    const sendPayment = async (amountValue) => {
        try {
            setLoading(true);

            // Create offline transaction
            const transaction = await OfflineTokenService.createOfflineTransaction(
                amountValue,
                deviceId,
                'outgoing'
            );

            // Update the transaction description if provided
            if (description) {
                transaction.description = description;
                // Save the updated transaction with custom description
                await SecureTokenManager.saveOfflineTransaction(transaction);
            }

            // Navigate to success screen
            navigation.replace('PaymentSuccess', {
                amount: amountValue,
                recipient: deviceName || 'Unknown Device',
                transactionId: transaction.id,
                isOffline: true
            });
        } catch (error) {
            console.error('Payment error:', error);
            showStatus(error.message || 'An error occurred during payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendPayment = async () => {
        if (!validateAmount()) {
            return;
        }

        const amountValue = parseFloat(amount);

        try {
            // Check if device supports biometric authentication
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                // Authenticate with biometrics
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: `Authenticate to send RM ${amountValue.toFixed(2)}`,
                    fallbackLabel: 'Use PIN'
                });

                if (!result.success) {
                    showStatus('Authentication failed. Please try again.', 'error');
                    return;
                }
            } else {
                // Fallback to PIN/password - proceed directly without popup
                await sendPayment(amountValue);
                return;
            }

            // If biometric authentication was successful, proceed with payment
            await sendPayment(amountValue);

        } catch (error) {
            console.error('Authentication error:', error);
            showStatus('Failed to authenticate. Please try again.', 'error');
        }
    };

    const formatBalance = (balance) => {
        return `RM ${balance.toFixed(2)}`;
    };

    return (
        <FullScreenSafeArea>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Send Payment</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Status Message */}
                {statusMessage ? (
                    <View style={[
                        styles.statusMessage,
                        statusType === 'error' && styles.statusError
                    ]}>
                        <Ionicons name="close-circle" size={16} color="white" />
                        <Text style={styles.statusMessageText}>{statusMessage}</Text>
                    </View>
                ) : null}

                <View style={styles.content}>
                    {/* Recipient Info */}
                    <View style={styles.recipientCard}>
                        <View style={styles.recipientIcon}>
                            <Ionicons name="phone-portrait" size={24} color={Colors.primary} />
                        </View>
                        <View style={styles.recipientInfo}>
                            <Text style={styles.recipientName}>
                                {deviceName || 'Unknown Device'}
                            </Text>
                            <Text style={styles.recipientId}>
                                ID: {deviceId ? deviceId.substring(0, 8) + '...' : 'Unknown'}
                            </Text>
                        </View>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.amountSection}>
                        <Text style={styles.amountLabel}>Amount (RM)</Text>
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="numeric"
                            maxLength={10}
                            autoFocus
                        />
                    </View>

                    {/* Description Input */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.descriptionLabel}>Description (Optional)</Text>
                        <TextInput
                            style={styles.descriptionInput}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="What's this payment for?"
                            multiline
                            maxLength={100}
                        />
                    </View>

                    {/* Balance Info */}
                    <View style={styles.balanceSection}>
                        <View style={styles.balanceRow}>
                            <Text style={styles.balanceLabel}>Available for Offline Payment:</Text>
                            <Text style={styles.balanceAmount}>{formatBalance(availableBalance)}</Text>
                        </View>
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!amount || parseFloat(amount) <= 0) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSendPayment}
                        disabled={loading || !amount || parseFloat(amount) <= 0}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="white" />
                                <Text style={styles.sendButtonText}>Send Payment</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Security Note */}
                    <View style={styles.securityNote}>
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text style={styles.securityText}>
                            This payment will be processed offline and synced when the recipient comes online
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </FullScreenSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardView: {
        flex: 1,
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
    content: {
        flex: 1,
        padding: 16,
    },
    recipientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 16,
    },
    recipientIcon: {
        marginRight: 12,
    },
    recipientInfo: {
        flex: 1,
    },
    recipientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    recipientId: {
        fontSize: 14,
        color: '#6B7280',
    },
    amountSection: {
        marginBottom: 16,
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    amountInput: {
        fontSize: 24,
        color: '#111827',
    },
    descriptionSection: {
        marginBottom: 16,
    },
    descriptionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    descriptionInput: {
        fontSize: 16,
        color: '#111827',
    },
    balanceSection: {
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    balanceAmount: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    sendButton: {
        backgroundColor: '#6366F1',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    sendButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    securityText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    statusMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#10B981',
        borderRadius: 8,
        marginBottom: 16,
    },
    statusError: {
        backgroundColor: '#EF4444',
    },
    statusMessageText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
}); 