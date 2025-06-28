import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ReceivePaymentScreen({ navigation }) {
    const [connectionStatus, setConnectionStatus] = useState('ready'); // ready, connecting, connected, receiving, payment_request, accepted, receipt
    const [paymentData, setPaymentData] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState('');

    useEffect(() => {
        if (!hasStarted) {
            setHasStarted(true);
            startDemoFlow();
        }
    }, [hasStarted]);

    const startDemoFlow = async () => {
        try {
            // Set the device that will connect to us
            const deviceNames = ['Samsung Galaxy S23', 'iPhone 14 Pro', 'Huawei P50 Pro'];
            const selectedDevice = deviceNames[Math.floor(Math.random() * deviceNames.length)];
            setConnectedDevice(selectedDevice);

            // Step 1: Start connecting
            setConnectionStatus('connecting');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Step 2: Connected
            setConnectionStatus('connected');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Receiving payment
            setConnectionStatus('receiving');
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Step 4: Payment request received
            const mockPaymentData = {
                sender: 'Sze Kai',
                amount: 25.50,
                description: 'Belanja you Starbucks',
                timestamp: new Date().toISOString(),
                transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
            };
            setPaymentData(mockPaymentData);
            setConnectionStatus('payment_request');

        } catch (error) {
            console.error('Demo flow error:', error);
        }
    };

    const handleAcceptPayment = () => {
        setConnectionStatus('accepted');
        setTimeout(() => {
            setConnectionStatus('receipt');
        }, 1000);
    };

    const handleDeclinePayment = () => {
        Alert.alert(
            'Payment Declined',
            'You have declined the payment request.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const handleDisconnect = () => {
        Alert.alert(
            'Disconnect Device',
            'Are you sure you want to disconnect?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disconnect', onPress: () => navigation.goBack() }
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusInfo = () => {
        switch (connectionStatus) {
            case 'ready':
                return { title: 'Ready to Receive', subtitle: 'Waiting for payment requests...', icon: 'radio-outline', color: '#6366F1' };
            case 'connecting':
                return { title: 'Connecting', subtitle: `Connecting to ${connectedDevice}...`, icon: 'bluetooth-outline', color: '#F59E0B' };
            case 'connected':
                return { title: 'Connected', subtitle: `Connected to ${connectedDevice}`, icon: 'checkmark-circle-outline', color: '#10B981' };
            case 'receiving':
                return { title: 'Receiving', subtitle: 'Waiting for payment data...', icon: 'download-outline', color: '#6366F1' };
            case 'payment_request':
                return { title: 'Payment Request', subtitle: 'Review and accept payment', icon: 'card-outline', color: '#F59E0B' };
            case 'accepted':
                return { title: 'Processing', subtitle: 'Payment accepted, processing...', icon: 'time-outline', color: '#6366F1' };
            case 'receipt':
                return { title: 'Payment Received', subtitle: 'Transaction completed successfully', icon: 'checkmark-circle', color: '#10B981' };
            default:
                return { title: 'Ready', subtitle: 'Waiting...', icon: 'radio-outline', color: '#6366F1' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Receive Payment</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: connectionStatus === 'ready' ? '#10B981' : connectionStatus === 'connected' ? '#6366F1' : '#F59E0B',
                        marginRight: 4
                    }} />
                    <Text style={{
                        fontSize: 12,
                        color: connectionStatus === 'ready' ? '#10B981' : connectionStatus === 'connected' ? '#6366F1' : '#F59E0B',
                        fontWeight: 'bold'
                    }}>
                        {connectionStatus === 'ready' ? 'Ready' : connectionStatus === 'connected' ? 'Active' : 'Processing'}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Message for Receipt */}
                {connectionStatus === 'receipt' && (
                    <View style={[styles.statusMessage, styles.statusSuccess]}>
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                        <Text style={styles.statusMessageText}>
                            Payment received successfully! Amount: RM {paymentData?.amount?.toFixed(2)}
                        </Text>
                    </View>
                )}

                {/* Status Card */}
                <LinearGradient
                    colors={[statusInfo.color, statusInfo.color === '#10B981' ? '#059669' : statusInfo.color === '#F59E0B' ? '#D97706' : '#4F46E5']}
                    style={styles.statusCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.statusHeader}>
                        <Ionicons name={statusInfo.icon} size={24} color="white" />
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusBadgeText}>{statusInfo.title}</Text>
                        </View>
                    </View>

                    <Text style={styles.statusTitle}>Bluetooth Receiver</Text>
                    <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
                </LinearGradient>

                {/* Payment Request Card */}
                {connectionStatus === 'payment_request' && paymentData && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Payment Request</Text>
                        <View style={styles.paymentRequestCard}>
                            <View style={styles.paymentHeader}>
                                <View style={styles.senderInfo}>
                                    <Ionicons name="person-circle" size={32} color="#6366F1" />
                                    <View style={styles.senderDetails}>
                                        <Text style={styles.senderName} numberOfLines={1}>{paymentData.sender}</Text>
                                        <Text style={styles.senderSubtext}>wants to send you</Text>
                                    </View>
                                </View>
                                <View style={styles.amountContainer}>
                                    <Text style={styles.requestAmount} numberOfLines={1}>RM {paymentData.amount.toFixed(2)}</Text>
                                </View>
                            </View>

                            <Text style={styles.paymentDescription} numberOfLines={2}>{paymentData.description}</Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.declineButton}
                                    onPress={handleDeclinePayment}
                                >
                                    <Text style={styles.declineButtonText}>Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={handleAcceptPayment}
                                >
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Receipt Card */}
                {connectionStatus === 'receipt' && paymentData && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Transaction Receipt</Text>
                        <View style={styles.receiptCard}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.receiptHeader}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="checkmark-circle" size={32} color="white" />
                                <Text style={styles.receiptTitle}>Payment Received</Text>
                                <Text style={styles.receiptAmount}>RM {paymentData.amount.toFixed(2)}</Text>
                            </LinearGradient>

                            <View style={styles.receiptDetails}>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>From:</Text>
                                    <Text style={styles.receiptValue}>{paymentData.sender}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Description:</Text>
                                    <Text style={styles.receiptValue}>{paymentData.description}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Transaction ID:</Text>
                                    <Text style={styles.receiptValue}>{paymentData.transactionId}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Date & Time:</Text>
                                    <Text style={styles.receiptValue}>{formatDate(paymentData.timestamp)}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Status:</Text>
                                    <Text style={[styles.receiptValue, styles.statusComplete]}>Completed</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleDisconnect}
                            >
                                <Ionicons name="power" size={20} color="white" />
                                <Text style={styles.disconnectButtonText}>Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    statusCard: {
        margin: 12,
        borderRadius: 12,
        padding: 16,
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
        marginBottom: 8,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    sectionContainer: {
        padding: 12,
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    paymentRequestCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    senderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    senderDetails: {
        marginLeft: 12,
        flex: 1,
    },
    senderName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    senderSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    requestAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6366F1',
        textAlign: 'right',
    },
    paymentDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    declineButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    declineButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#10B981',
        alignItems: 'center',
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    receiptCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    receiptHeader: {
        padding: 20,
        alignItems: 'center',
    },
    receiptTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
        marginBottom: 4,
    },
    receiptAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    receiptDetails: {
        padding: 20,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    receiptLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    receiptValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    statusMessage: {
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        marginBottom: 12,
    },
    statusMessageText: {
        fontSize: 14,
        color: '#111827',
    },
    statusSuccess: {
        backgroundColor: '#d1fae5',
    },
    statusComplete: {
        fontWeight: 'bold',
        color: '#10B981',
    },
    disconnectButton: {
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disconnectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
    },
    amountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
}); 