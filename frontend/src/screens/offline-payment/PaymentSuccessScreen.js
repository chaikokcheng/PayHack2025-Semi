import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { FullScreenSafeArea } from '../../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

export default function PaymentSuccessScreen({ route, navigation }) {
    const { amount, recipient, transactionId, isOffline } = route.params || {};

    const formatAmount = (amount) => {
        return `RM ${parseFloat(amount).toFixed(2)}`;
    };

    const formatDate = () => {
        const now = new Date();
        return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    };

    const handleBackToOffline = () => {
        navigation.popToTop();
    };

    const handleBackToHome = () => {
        navigation.navigate('MainTabs', { screen: 'Home' });
    };

    return (
        <FullScreenSafeArea style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Success Animation */}
                <View style={styles.successContainer}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.successCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="checkmark" size={40} color="white" />
                    </LinearGradient>
                    <Text style={styles.successTitle}>Payment Successful!</Text>
                    <Text style={styles.successSubtitle}>
                        {isOffline ? 'Offline payment completed' : 'Payment processed successfully'}
                    </Text>
                </View>

                {/* Receipt Card */}
                <View style={styles.receiptCard}>
                    <View style={styles.receiptHeader}>
                        <Ionicons name="receipt-outline" size={24} color={Colors.primary} />
                        <Text style={styles.receiptTitle}>Payment Receipt</Text>
                    </View>

                    <View style={styles.receiptContent}>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Amount:</Text>
                            <Text style={styles.receiptAmount}>{formatAmount(amount)}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Recipient:</Text>
                            <Text style={styles.receiptValue}>{recipient}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Transaction ID:</Text>
                            <Text style={styles.receiptValue}>{transactionId}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Date & Time:</Text>
                            <Text style={styles.receiptValue}>{formatDate()}</Text>
                        </View>

                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Status:</Text>
                            <View style={styles.statusContainer}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>
                                    {isOffline ? 'Pending Sync' : 'Completed'}
                                </Text>
                            </View>
                        </View>

                        {isOffline && (
                            <View style={styles.offlineNote}>
                                <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
                                <Text style={styles.offlineNoteText}>
                                    This payment will be synced when the recipient comes online
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {isOffline && (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleBackToOffline}
                        >
                            <Ionicons name="bluetooth" size={20} color={Colors.primary} />
                            <Text style={styles.secondaryButtonText}>Back to Offline Payment</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleBackToHome}
                    >
                        <Ionicons name="home" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>

                {/* Additional Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                    <Text style={styles.infoText}>
                        Your payment is secure and encrypted. Transaction details are stored locally.
                    </Text>
                </View>
            </ScrollView>
        </FullScreenSafeArea>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    successContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    successCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 4,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    receiptCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    receiptHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    receiptTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 12,
    },
    receiptContent: {
        gap: 12,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    receiptLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    receiptAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    receiptValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F59E0B',
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#F59E0B',
        fontWeight: '500',
    },
    offlineNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    offlineNoteText: {
        fontSize: 12,
        color: '#92400E',
        marginLeft: 8,
        flex: 1,
        lineHeight: 16,
    },
    actionButtons: {
        gap: 10,
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        elevation: 2,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    secondaryButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F0F9FF',
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    infoText: {
        fontSize: 14,
        color: '#0C4A6E',
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
}); 