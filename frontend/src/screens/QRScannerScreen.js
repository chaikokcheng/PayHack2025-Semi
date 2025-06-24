import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const BACKEND_URL = 'http://192.168.0.12:8000'; // Flask backend URL - use local network IP for mobile access
const USER_ID = 'bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9'; // Customer user ID

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  
  // Balance and Payment States
  const [balance, setBalance] = useState(300.00); // Initial RM 300
  const [selectedWallet, setSelectedWallet] = useState('boost');
  const [scannedQRData, setScannedQRData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [routingDetails, setRoutingDetails] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request camera permission
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Load saved balance or set initial balance
      await loadBalance();
    } catch (error) {
      console.log('Initialization error:', error);
      setHasPermission(false);
      setDemoMode(true);
    }
  };

  const loadBalance = async () => {
    try {
      const savedBalance = await AsyncStorage.getItem('userBalance');
      if (savedBalance !== null) {
        setBalance(parseFloat(savedBalance));
      } else {
        // Set initial balance to RM 300
        const initialBalance = 300.00;
        setBalance(initialBalance);
        await AsyncStorage.setItem('userBalance', initialBalance.toString());
      }
    } catch (error) {
      console.log('Error loading balance:', error);
      setBalance(300.00);
    }
  };

  const saveBalance = async (newBalance) => {
    try {
      await AsyncStorage.setItem('userBalance', newBalance.toString());
      setBalance(newBalance);
    } catch (error) {
      console.log('Error saving balance:', error);
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    // Prevent multiple rapid scans
    if (scanned || scanCooldown || processing || !data) {
      return;
    }

    // Check if this is the same data we just scanned
    if (lastScannedData === data) {
      return;
    }

    setScanned(true);
    setScanCooldown(true);
    setLastScannedData(data);
    
    // Process the QR code
    processQRCode(data);

    // Reset scan cooldown after 2 seconds
    setTimeout(() => {
      setScanCooldown(false);
    }, 2000);
  };

  const simulateQRScan = (demoData) => {
    setScanned(true);
    processQRCode(demoData);
  };

  const processQRCode = (data) => {
    // Filter out non-string or empty data
    if (!data || typeof data !== 'string' || data.trim().length < 5) {
      return;
    }

    // Skip if we just processed this QR code (debouncing)
    if (scannedQRData && JSON.stringify(scannedQRData.rawData) === data) {
      return;
    }

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      console.log('Scanned QR Data:', qrData);

      // Validate QR code structure - must have essential payment fields
      if (qrData.merchant_id && qrData.amount && qrData.currency && parseFloat(qrData.amount) > 0) {
        // Payment QR Code
        const parsedQR = {
          qr_code_id: qrData.qr_code_id || `QR_${Date.now()}`,
          merchant_id: qrData.merchant_id,
          amount: parseFloat(qrData.amount),
          currency: qrData.currency || 'MYR',
          qr_type: qrData.qr_type || 'merchant',
          description: qrData.description || 'Payment',
          expires_at: qrData.expires_at,
          rawData: qrData
        };

        setScannedQRData(parsedQR);
        analyzeRouting(parsedQR);
        setShowPaymentModal(true);
      } else {
        console.log('Invalid QR structure - missing required fields');
      }
    } catch (error) {
      // Only process as legacy if it looks like a merchant name (letters/spaces)
      if (/^[a-zA-Z\s\-&'\.]+$/.test(data.trim()) && data.trim().length > 2) {
        console.log('Processing as legacy merchant QR:', data);
        handleLegacyQR(data);
      } else {
        // Ignore non-QR data (camera noise, etc.)
        console.log('Ignoring non-QR data');
      }
    }
  };

  const handleLegacyQR = (data) => {
    Alert.alert(
      'QR Code Detected',
      `Merchant: ${data}\nWould you like to make a payment?`,
      [
        { text: 'Cancel', onPress: () => setScanned(false) },
        { 
          text: 'Pay', 
          onPress: () => {
            const legacyQR = {
              qr_code_id: `LEGACY_${Date.now()}`,
              merchant_id: data,
              amount: 0, // Will need to be entered manually
              currency: 'MYR',
              qr_type: 'merchant',
              description: 'Legacy QR Payment',
              expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
              rawData: { legacy: true, data }
            };
            setScannedQRData(legacyQR);
            setShowPaymentModal(true);
          }
        }
      ]
    );
  };

  const analyzeRouting = (qrData) => {
    const isDirectPayment = qrData.qr_type === selectedWallet || qrData.qr_type === 'merchant';
    
    const routing = {
      isDirectPayment,
      sourceWallet: qrData.qr_type,
      targetWallet: selectedWallet,
      routingType: isDirectPayment ? 'Direct Payment' : 'Cross-Wallet Routing',
      route: isDirectPayment 
        ? `${selectedWallet.toUpperCase()} → Merchant`
        : `${qrData.qr_type.toUpperCase()} QR → PinkPay Switch → ${selectedWallet.toUpperCase()}`,
      processingTime: isDirectPayment ? '1-2 seconds' : '2-3 seconds',
      benefits: isDirectPayment 
        ? ['Direct processing', 'Instant confirmation']
        : ['Universal compatibility', 'Seamless wallet switching', 'Real-time conversion']
    };

    setRoutingDetails(routing);
  };

  const processPayment = async () => {
    if (!scannedQRData || scannedQRData.amount > balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to complete this payment.');
      return;
    }

    setProcessing(true);
    setShowPaymentModal(false);

    try {
      console.log('Processing payment for:', scannedQRData.merchant_id, 'Amount:', scannedQRData.amount);

      // Send real-time update to dashboard about QR scan
      const notifyDashboard = async (status, data) => {
        try {
          await fetch(`${BACKEND_URL}/api/mobile/scan-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              timestamp: new Date().toISOString(),
              mobile_user_id: USER_ID,
              qr_data: scannedQRData,
              ...data
            })
          });
        } catch (error) {
          console.log('Dashboard notification failed:', error.message);
        }
      };

      // Notify dashboard that QR scan started
      await notifyDashboard('scan_started', { 
        message: 'QR Code scanned - processing payment...',
        progress: 0 
      });

      // Simulate realistic payment processing steps
      const processingSteps = [
        { step: 'Validating QR Code', progress: 20, delay: 500 },
        { step: 'Checking Balance', progress: 40, delay: 300 },
        { step: 'Processing Payment', progress: 60, delay: 800 },
        { step: 'Updating Balance', progress: 80, delay: 400 },
        { step: 'Generating Receipt', progress: 100, delay: 300 }
      ];

      for (const { step, progress, delay } of processingSteps) {
        await new Promise(resolve => setTimeout(resolve, delay));
        await notifyDashboard('processing', { 
          message: step,
          progress 
        });
      }

      // Try backend payment first
      let paymentSuccess = false;
      let backendResponse = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const paymentResponse = await fetch(`${BACKEND_URL}/api/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: scannedQRData.amount.toString(),
            currency: scannedQRData.currency,
            payment_method: 'qr_scan',
            merchant_id: scannedQRData.merchant_id,
            user_id: USER_ID,
            description: `Mobile QR Payment: ${scannedQRData.description}`,
            metadata: {
              qr_type: scannedQRData.qr_type,
              scanner_wallet: selectedWallet,
              scanned_at: new Date().toISOString(),
              qr_code_id: scannedQRData.qr_code_id,
              platform: 'mobile',
              routing_type: routingDetails?.routingType,
              demo_mode: false
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        backendResponse = await paymentResponse.json();
        paymentSuccess = paymentResponse.ok && backendResponse.success;

      } catch (error) {
        console.log('Backend payment failed, using demo mode:', error.message);
      }

      // Process payment (backend or demo)
      const newBalance = balance - scannedQRData.amount;
      await saveBalance(newBalance);

      const transactionId = paymentSuccess && backendResponse?.txn_id 
        ? backendResponse.txn_id 
        : `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const resultData = {
        success: true,
        transaction_id: transactionId,
        message: paymentSuccess 
          ? 'Payment completed successfully!' 
          : 'Payment completed successfully! (Demo Mode)',
        amount: scannedQRData.amount,
        merchant: scannedQRData.merchant_id,
        newBalance: newBalance,
        backend_connected: paymentSuccess
      };

      setPaymentResult(resultData);

      // Notify dashboard of successful payment
      await notifyDashboard('payment_success', {
        message: 'Payment completed successfully!',
        progress: 100,
        transaction_id: transactionId,
        amount: scannedQRData.amount,
        merchant: scannedQRData.merchant_id,
        new_balance: newBalance,
        backend_mode: paymentSuccess ? 'connected' : 'demo'
      });

      console.log('Payment completed:', transactionId);

    } catch (error) {
      console.log('Payment error:', error);
      
      setPaymentResult({
        success: false,
        message: 'Payment failed. Please try again.',
        error: error.message
      });

      // Notify dashboard of payment failure
      try {
        await fetch(`${BACKEND_URL}/api/mobile/scan-update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'payment_failed',
            timestamp: new Date().toISOString(),
            mobile_user_id: USER_ID,
            message: 'Payment failed',
            error: error.message
          })
        });
      } catch (notifyError) {
        console.log('Failed to notify dashboard of error:', notifyError.message);
      }
    } finally {
      setProcessing(false);
      setShowResultModal(true);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanCooldown(false);
    setLastScannedData(null);
    setScannedQRData(null);
    setShowPaymentModal(false);
    setShowResultModal(false);
    setPaymentResult(null);
    setRoutingDetails(null);
  };

  const getWalletIcon = (wallet) => {
    const icons = {
      'boost': '🚀',
      'tng': '💙',
      'grabpay': '🟢',
      'shopee': '🛍️',
      'merchant': '🏪'
    };
    return icons[wallet] || '💳';
  };

  const handleManualEntry = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode);
      setManualEntry(false);
      setManualCode('');
    }
  };

  const demoQRCodes = [
    {
      label: 'Starbucks Payment - RM 12.50',
      data: JSON.stringify({
        qr_code_id: 'QR_DEMO_STARBUCKS',
        merchant_id: 'Starbucks KLCC',
        amount: 12.50,
        currency: 'MYR',
        qr_type: 'merchant',
        description: 'Coffee and Pastry'
      })
    },
    {
      label: 'TNG QR - McDonald\'s RM 15.90',
      data: JSON.stringify({
        qr_code_id: 'QR_DEMO_TNG_MCD',
        merchant_id: 'McDonald\'s SS15',
        amount: 15.90,
        currency: 'MYR',
        qr_type: 'tng',
        description: 'Big Mac Meal'
      })
    },
    {
      label: 'Boost QR - AEON Mall RM 45.00',
      data: JSON.stringify({
        qr_code_id: 'QR_DEMO_BOOST_AEON',
        merchant_id: 'AEON Mall',
        amount: 45.00,
        currency: 'MYR',
        qr_type: 'boost',
        description: 'Shopping'
      })
    },
    {
      label: 'Jaya Grocer - RM 67.30',
      data: JSON.stringify({
        qr_code_id: 'QR_DEMO_JAYA',
        merchant_id: 'Jaya Grocer KL',
        amount: 67.30,
        currency: 'MYR',
        qr_type: 'merchant',
        description: 'Groceries'
      })
    }
  ];

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false || demoMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <Text style={styles.balanceText}>RM {balance.toFixed(2)}</Text>
        </View>
        
        <View style={styles.demoContainer}>
          <Text style={styles.demoIcon}>📱</Text>
          <Text style={styles.demoTitle}>QR Scanner Demo Mode</Text>
          <Text style={styles.demoSubtitle}>
            {demoMode ? 
              'Camera unavailable - Try these demo QR codes:' : 
              'No camera access - Try these demo QR codes:'
            }
          </Text>
          
          <ScrollView style={styles.demoScrollView} showsVerticalScrollIndicator={false}>
            {demoQRCodes.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.demoOption}
                onPress={() => simulateQRScan(option.data)}
              >
                <Ionicons name="qr-code" size={24} color={Colors.primary} />
                <Text style={styles.demoOptionText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.manualButton}
            onPress={() => setManualEntry(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text style={styles.manualButtonText}>Manual Entry</Text>
          </TouchableOpacity>
        </View>

        {renderModals()}
      </SafeAreaView>
    );
  }

  const renderModals = () => (
    <>
      {/* Manual Entry Modal */}
      <Modal
        visible={manualEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setManualEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter QR Code Manually</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="Paste or type QR code content here..."
              value={manualCode}
              onChangeText={setManualCode}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setManualEntry(false);
                  setManualCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleManualEntry}
              >
                <Text style={styles.confirmButtonText}>Process</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <Text style={styles.paymentModalTitle}>Confirm Payment</Text>
            
            {scannedQRData && (
              <View style={styles.paymentDetails}>
                <View style={styles.merchantInfo}>
                  <Text style={styles.merchantName}>{scannedQRData.merchant_id}</Text>
                  <Text style={styles.amountText}>
                    {scannedQRData.currency} {scannedQRData.amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Description:</Text>
                  <Text style={styles.paymentValue}>{scannedQRData.description}</Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>QR Type:</Text>
                  <Text style={styles.qrTypeBadge}>{scannedQRData.qr_type.toUpperCase()}</Text>
                </View>

                {routingDetails && (
                  <View style={styles.routingInfo}>
                    <Text style={styles.routingTitle}>{routingDetails.routingType}</Text>
                    <Text style={styles.routingRoute}>{routingDetails.route}</Text>
                    <Text style={styles.routingTime}>Processing time: {routingDetails.processingTime}</Text>
                  </View>
                )}

                <View style={styles.walletSelection}>
                  <Text style={styles.walletLabel}>Pay with:</Text>
                  <View style={styles.walletOption}>
                    <Text style={styles.walletIcon}>{getWalletIcon(selectedWallet)}</Text>
                    <Text style={styles.walletName}>{selectedWallet.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.balanceInfo}>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Current Balance:</Text>
                    <Text style={styles.balanceAmount}>RM {balance.toFixed(2)}</Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>After Payment:</Text>
                    <Text style={[
                      styles.balanceAmount,
                      (balance - scannedQRData.amount) < 0 ? styles.insufficientBalance : styles.sufficientBalance
                    ]}>
                      RM {(balance - scannedQRData.amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.paymentActions}>
              <TouchableOpacity 
                style={styles.cancelPaymentButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelPaymentText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.confirmPaymentButton,
                  scannedQRData && scannedQRData.amount > balance && styles.disabledButton
                ]}
                onPress={processPayment}
                disabled={scannedQRData && scannedQRData.amount > balance}
              >
                <Text style={styles.confirmPaymentText}>
                  {scannedQRData && scannedQRData.amount > balance ? 'Insufficient Balance' : 'Confirm Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Modal */}
      <Modal
        visible={processing}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.processingModal}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Processing Payment...</Text>
            <Text style={styles.processingSubtext}>Please wait</Text>
          </View>
        </View>
      </Modal>

      {/* Payment Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalContent}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={paymentResult?.success ? "checkmark-circle" : "close-circle"} 
                size={60} 
                color={paymentResult?.success ? "#4CAF50" : "#F44336"} 
              />
              <Text style={styles.resultTitle}>
                {paymentResult?.success ? 'Payment Successful!' : 'Payment Failed'}
              </Text>
            </View>

            {paymentResult && (
              <View style={styles.resultDetails}>
                <Text style={styles.resultMessage}>{paymentResult.message}</Text>
                
                {paymentResult.success && (
                  <>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Transaction ID:</Text>
                      <Text style={styles.resultValue}>{paymentResult.transaction_id}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Amount Paid:</Text>
                      <Text style={styles.resultValue}>RM {paymentResult.amount?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Merchant:</Text>
                      <Text style={styles.resultValue}>{paymentResult.merchant}</Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>New Balance:</Text>
                      <Text style={[styles.resultValue, styles.newBalanceText]}>
                        RM {paymentResult.newBalance?.toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={styles.resultButton}
              onPress={resetScanner}
            >
              <Text style={styles.resultButtonText}>
                {paymentResult?.success ? 'Done' : 'Try Again'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Balance */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Scanner</Text>
        <View style={styles.headerBalance}>
          <View style={styles.balanceContainer}>
            <Ionicons name="wallet-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.balanceLabel}>Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>RM {balance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanningArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Flash Toggle */}
        <TouchableOpacity 
          style={styles.flashButton}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons 
            name={flashOn ? "flash" : "flash-off"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Point your camera at a payment QR code
        </Text>
        <Text style={styles.subInstructionText}>
          Supports all major e-wallet QR codes
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setManualEntry(true)}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Manual Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setScanned(false)}
          disabled={!scanned}
        >
          <Ionicons name="refresh-outline" size={24} color={scanned ? Colors.primary : "#999"} />
          <Text style={[styles.actionButtonText, { color: scanned ? Colors.primary : "#999" }]}>
            Scan Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Home</Text>
        </TouchableOpacity>
      </View>

      {renderModals()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  balanceText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  processingModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  // Demo Mode Styles
  demoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  demoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  demoScrollView: {
    width: '100%',
    marginBottom: 32,
  },
  demoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  demoOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  manualInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerBalance: {
    alignItems: 'flex-end',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flashButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  paymentModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '92%',
    maxWidth: 380,
    maxHeight: '85%',
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentDetails: {
    marginBottom: 20,
  },
  merchantInfo: {
    backgroundColor: '#F8F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  qrTypeBadge: {
    backgroundColor: Colors.primary,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  routingInfo: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  routingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 6,
  },
  routingRoute: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  routingTime: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  walletSelection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  walletName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceInfo: {
    backgroundColor: '#FFFBF0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  insufficientBalance: {
    color: '#F44336',
  },
  sufficientBalance: {
    color: '#4CAF50',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelPaymentButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelPaymentText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmPaymentButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmPaymentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  resultModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  resultDetails: {
    width: '100%',
    marginBottom: 24,
  },
  resultMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  newBalanceText: {
    color: '#4CAF50',
  },
  resultButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  resultButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 