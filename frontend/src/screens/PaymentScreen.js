import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';

export default function PaymentScreen({ navigation, route }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', or null

  const { merchant, amount, reference, items, total, paymentMethod } = route.params || {};

  // Mock payment data if coming from QR scan
  const paymentData = {
    merchant: merchant || 'Jaya Grocer',
    amount: amount || total || 85.50,
    reference: reference || `REF${Date.now()}`,
    paymentMethod: paymentMethod || {
      id: 'primary',
      name: 'Primary Wallet',
      balance: 2547.89,
      icon: 'wallet'
    }
  };

  const handleAuthentication = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        // Allow bypass in development
        if (__DEV__) {
          Alert.alert(
            'Biometric Not Available',
            'Biometric authentication is not available on this device. Do you want to proceed for development/testing?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Proceed', style: 'destructive', onPress: () => processPayment() }
            ]
          );
          return;
        } else {
          Alert.alert('Biometric Error', 'Biometric authentication not available on this device.');
          return;
        }
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to confirm payment',
        fallbackLabel: 'Enter Passcode',
      });
      if (!result.success) {
        Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again.');
        return;
      }
      processPayment();
    } catch (e) {
      Alert.alert('Authentication Error', 'An error occurred during authentication.');
    }
  };

  const processPayment = () => {
    setIsProcessing(true);

    // Simulate payment processing with smart routing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Randomly determine success or failure for demo purposes
      const isSuccess = Math.random() > 0.3; // 70% success rate
      setPaymentStatus(isSuccess ? 'success' : 'failed');
      setPaymentComplete(true);

      // Auto navigate to bill page after showing receipt (only for successful payments)
      if (isSuccess) {
        setTimeout(() => {
          handlePaymentSuccess();
        }, 5000); // Increased time to 5 seconds to read receipt
      }

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 3000);
    }, 2000);
  };

  const handlePaymentSuccess = () => {
    // Navigate to BillScreen with payment details
    navigation.navigate('BillScreen', {
      merchantName: paymentData.merchant,
      items: items || [],
      subtotal: paymentData.amount,
      sst: paymentData.amount * 0.06, // 6% SST
      serviceCharge: paymentData.amount * 0.10, // 10% service charge
      total: paymentData.amount,
      isPaid: true,
      transactionId: paymentData.reference,
      paymentMethod: paymentData.paymentMethod.name,
      paymentTime: new Date().toLocaleTimeString(),
      // Pass cart context for item removal
      cartContext: {
        items: items,
        splitMode: route.params?.splitMode,
        selectedItems: route.params?.selectedItems,
        merchantId: route.params?.merchantId,
        // Pass the actual selected item indices for removal
        selectedIndices: route.params?.selectedItems || []
      }
    });
  };

  const handleDoneButton = () => {
    if (paymentStatus === 'success') {
      handlePaymentSuccess();
    } else {
      // For failed payments, go back to previous screen
      navigation.goBack();
    }
  };

  if (paymentComplete) {
    const isSuccess = paymentStatus === 'success';
    const gradientColors = isSuccess 
      ? ['#22C55E', '#16A34A', '#15803D'] 
      : ['#EF4444', '#DC2626', '#B91C1C'];
    const statusIcon = isSuccess ? 'checkmark' : 'close';
    const statusTitle = isSuccess ? 'Payment Successful!' : 'Payment Failed';
    const statusSubtitle = isSuccess 
      ? `Your payment of RM ${paymentData.amount.toFixed(2)} has been processed successfully`
      : `Payment of RM ${paymentData.amount.toFixed(2)} could not be processed`;

    return (
      <View style={styles.fullscreenSuccessContainer}>
        <LinearGradient
          colors={gradientColors}
          style={styles.successGradientBackground}
        >
          {/* Status Animation Area */}
          <View style={styles.successAnimationContainer}>
            <View style={styles.successIconWrapper}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.successIconBackground}
              >
                <Ionicons name={statusIcon} size={60} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={styles.successTitle}>{statusTitle}</Text>
            <Text style={styles.successSubtitle}>
              {statusSubtitle}
            </Text>
          </View>

          {/* Payment Details Card */}
          <View style={styles.successDetailsCard}>
            <View style={styles.successAmountSection}>
              <Text style={styles.successAmountLabel}>Amount</Text>
              <Text style={styles.successAmountValue}>RM {paymentData.amount.toFixed(2)}</Text>
            </View>

            <View style={styles.successDetailsGrid}>
              <View style={styles.successDetailItem}>
                <Ionicons name="receipt-outline" size={20} color="#666" />
                <View style={styles.successDetailText}>
                  <Text style={styles.successDetailLabel}>Transaction ID</Text>
                  <Text style={styles.successDetailValue}>{paymentData.reference}</Text>
                </View>
              </View>

              <View style={styles.successDetailItem}>
                <Ionicons name="storefront-outline" size={20} color="#666" />
                <View style={styles.successDetailText}>
                  <Text style={styles.successDetailLabel}>Merchant</Text>
                  <Text style={styles.successDetailValue}>{paymentData.merchant}</Text>
                </View>
              </View>

              <View style={styles.successDetailItem}>
                <Ionicons name="card-outline" size={20} color="#666" />
                <View style={styles.successDetailText}>
                  <Text style={styles.successDetailLabel}>Payment Method</Text>
                  <Text style={styles.successDetailValue}>{paymentData.paymentMethod.name}</Text>
                </View>
              </View>

              <View style={styles.successDetailItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <View style={styles.successDetailText}>
                  <Text style={styles.successDetailLabel}>Time</Text>
                  <Text style={styles.successDetailValue}>{new Date().toLocaleTimeString()}</Text>
                </View>
              </View>

              <View style={styles.successDetailItem}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <View style={styles.successDetailText}>
                  <Text style={styles.successDetailLabel}>Status</Text>
                  <Text style={[styles.successDetailValue, { color: isSuccess ? '#22C55E' : '#EF4444', fontWeight: 'bold' }]}>
                    {isSuccess ? 'COMPLETED' : 'FAILED'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional details for failed payments */}
            {!isSuccess && (
              <View style={styles.failureDetails}>
                <Text style={styles.failureTitle}>Payment Failed</Text>
                <Text style={styles.failureReason}>
                  Possible reasons:
                </Text>
                <Text style={styles.failureReason}>• Insufficient balance</Text>
                <Text style={styles.failureReason}>• Network connectivity issues</Text>
                <Text style={styles.failureReason}>• Payment method restrictions</Text>
                <Text style={styles.failureReason}>• Transaction timeout</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.successActionsContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                // Share receipt functionality
                Alert.alert('Share Receipt', 'Receipt sharing would be implemented here');
              }}
            >
              <Ionicons name="share-outline" size={20} color={isSuccess ? '#22C55E' : '#EF4444'} />
              <Text style={[styles.shareButtonText, { color: isSuccess ? '#22C55E' : '#EF4444' }]}>
                Share Receipt
              </Text>
            </TouchableOpacity>

            {!isSuccess && (
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: '#EF4444' }]}
                onPress={() => {
                  setPaymentComplete(false);
                  setPaymentStatus(null);
                  setIsProcessing(false);
                }}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDoneButton}
            >
              <Text style={styles.doneButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <ScreenSafeArea style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingTitle}>Processing Payment</Text>
          <Text style={styles.processingSubtitle}>
            Smart routing to optimal payment method...
          </Text>

          <View style={styles.routingSteps}>
            <View style={styles.routingStep}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.routingStepText}>Fraud check passed</Text>
            </View>
            <View style={styles.routingStep}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.routingStepText}>Payment method verified</Text>
            </View>
            <View style={styles.routingStep}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.routingStepText}>Processing transaction...</Text>
            </View>
          </View>
        </View>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Merchant Info */}
        <View style={styles.merchantCard}>
          <View style={styles.merchantIcon}>
            <Text style={styles.merchantEmoji}>🏪</Text>
          </View>
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantName}>{paymentData.merchant}</Text>
            <Text style={styles.merchantLocation}>Kuala Lumpur, Malaysia</Text>
          </View>
        </View>

        {/* Payment Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Payment Amount</Text>
          <Text style={styles.amountValue}>RM {paymentData.amount.toFixed(2)}</Text>
          <Text style={styles.referenceText}>Ref: {paymentData.reference}</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentMethodCard}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <View style={styles.selectedPaymentMethod}>
            <Ionicons name={paymentData.paymentMethod.icon} size={24} color="#007AFF" />
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>
                {paymentData.paymentMethod.name}
              </Text>
              <Text style={styles.paymentMethodBalance}>
                Balance: RM {paymentData.paymentMethod.balance.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeMethodText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Smart Features */}
        <View style={styles.smartFeaturesCard}>
          <Text style={styles.cardTitle}>Smart Payment Features</Text>

          <View style={styles.smartFeature}>
            <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
            <Text style={styles.smartFeatureText}>
              AI Fraud Protection Active
            </Text>
          </View>

          <View style={styles.smartFeature}>
            <Ionicons name="flash" size={20} color="#FFB800" />
            <Text style={styles.smartFeatureText}>
              Optimal routing selected
            </Text>
          </View>

          <View style={styles.smartFeature}>
            <Ionicons name="finger-print" size={20} color="#8B5CF6" />
            <Text style={styles.smartFeatureText}>
              Biometric authentication required
            </Text>
          </View>
        </View>

        {/* Transaction Details */}
        {items && (
          <View style={styles.itemsCard}>
            <Text style={styles.cardTitle}>Items ({items.length})</Text>
            {items.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemEmoji}>{item.image}</Text>
                <Text style={styles.itemName}>{item.name?.en || item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
            ))}
            {items.length > 3 && (
              <Text style={styles.moreItemsText}>
                +{items.length - 3} more items
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Pay Button */}
      <View style={styles.payButtonContainer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handleAuthentication}
          disabled={isProcessing}
        >
          <View style={styles.payButtonContent}>
            <Ionicons
              name={authenticationRequired ? "finger-print" : "card"}
              size={24}
              color="white"
            />
            <Text style={styles.payButtonText}>
              {authenticationRequired
                ? 'Authenticate & Pay'
                : `Pay RM ${paymentData.amount.toFixed(2)}`
              }
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScreenSafeArea>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  merchantCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  merchantIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  merchantEmoji: {
    fontSize: 32,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  merchantLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 14,
    color: '#999',
  },
  paymentMethodCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  selectedPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodBalance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  changeMethodText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  smartFeaturesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  smartFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smartFeatureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  itemsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  moreItemsText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
  },
  payButtonContainer: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  // Processing Screen Styles
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  routingSteps: {
    alignSelf: 'stretch',
  },
  routingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routingStepText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  // Success Screen Styles
  fullscreenSuccessContainer: {
    flex: 1,
  },
  successGradientBackground: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  successAnimationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconWrapper: {
    marginBottom: 32,
  },
  successIconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  successSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  successDetailsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  successAmountSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  successAmountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  successAmountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  successDetailsGrid: {
    gap: 20,
  },
  successDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successDetailText: {
    marginLeft: 16,
    flex: 1,
  },
  successDetailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  successDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  successActionsContainer: {
    gap: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  failureDetails: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  failureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  failureReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 