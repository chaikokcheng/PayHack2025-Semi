import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
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
import { ScreenSafeArea } from '../utils/SafeAreaHelper';

const BACKEND_URL = 'http://192.168.0.12:8000'; // Flask backend URL - use local network IP for mobile access
const USER_ID = 'bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9'; // Customer user ID

export default function QRScannerScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [lastScannedData, setLastScannedData] = useState(null);
    const [scanCooldown, setScanCooldown] = useState(false);

    // Balance and Payment States
    const [balance, setBalance] = useState(300.00); // Initial RM 300
    const [selectedWallet, setSelectedWallet] = useState('tng'); // Changed to Touch and Go as default
    const [scannedQRData, setScannedQRData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [routingDetails, setRoutingDetails] = useState(null);

    // New states for overseas payments
    const [exchangeRate, setExchangeRate] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [isOverseasPayment, setIsOverseasPayment] = useState(false);
    const [conversionLoading, setConversionLoading] = useState(false);

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

    // Currency conversion rates (mock data - in real app, fetch from API)
    const exchangeRates = {
        SGD: 3.45, // 1 SGD = 3.45 MYR
        USD: 4.72, // 1 USD = 4.72 MYR
        THB: 0.13, // 1 THB = 0.13 MYR
        IDR: 0.00031, // 1 IDR = 0.00031 MYR
        VND: 0.00019, // 1 VND = 0.00019 MYR
        EUR: 5.12, // 1 EUR = 5.12 MYR
        GBP: 5.98, // 1 GBP = 5.98 MYR
        JPY: 0.032, // 1 JPY = 0.032 MYR
    };

    // Detect overseas payment systems
    const detectOverseasPayment = (qrData) => {
        const overseasPatterns = {
            'paynow': { country: 'Singapore', currency: 'SGD', system: 'PayNow' },
            'promptpay': { country: 'Thailand', currency: 'THB', system: 'PromptPay' },
            'qris': { country: 'Indonesia', currency: 'IDR', system: 'QRIS' },
            'vnpay': { country: 'Vietnam', currency: 'VND', system: 'VNPay' },
            'alipay': { country: 'China', currency: 'CNY', system: 'Alipay' },
            'wechatpay': { country: 'China', currency: 'CNY', system: 'WeChat Pay' },
        };

        // Check QR type or merchant ID for overseas patterns
        const qrType = qrData.qr_type?.toLowerCase() || '';
        const merchantId = qrData.merchant_id?.toLowerCase() || '';
        const description = qrData.description?.toLowerCase() || '';

        for (const [pattern, info] of Object.entries(overseasPatterns)) {
            if (qrType.includes(pattern) || merchantId.includes(pattern) || description.includes(pattern)) {
                return info;
            }
        }

        // Check currency code
        if (qrData.currency && qrData.currency !== 'MYR' && exchangeRates[qrData.currency]) {
            return {
                country: getCurrencyCountry(qrData.currency),
                currency: qrData.currency,
                system: getPaymentSystem(qrData.currency)
            };
        }

        return null;
    };

    const getCurrencyCountry = (currency) => {
        const currencyMap = {
            'SGD': 'Singapore',
            'USD': 'United States',
            'THB': 'Thailand',
            'IDR': 'Indonesia',
            'VND': 'Vietnam',
            'EUR': 'Europe',
            'GBP': 'United Kingdom',
            'JPY': 'Japan',
            'CNY': 'China'
        };
        return currencyMap[currency] || 'International';
    };

    const getPaymentSystem = (currency) => {
        const systemMap = {
            'SGD': 'PayNow',
            'THB': 'PromptPay',
            'IDR': 'QRIS',
            'VND': 'VNPay',
            'CNY': 'Alipay/WeChat',
            'USD': 'International',
            'EUR': 'SEPA',
            'GBP': 'Faster Payments',
            'JPY': 'J-Coin'
        };
        return systemMap[currency] || 'International Payment';
    };

    const convertCurrency = async (amount, fromCurrency) => {
        if (fromCurrency === 'MYR') {
            return { convertedAmount: amount, rate: 1 };
        }

        setConversionLoading(true);

        try {
            // In real app, call exchange rate API
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

            const rate = exchangeRates[fromCurrency];
            if (!rate) {
                throw new Error(`Exchange rate not available for ${fromCurrency}`);
            }

            const convertedAmount = amount * rate;

            setConversionLoading(false);
            return { convertedAmount: Math.round(convertedAmount * 100) / 100, rate };
        } catch (error) {
            setConversionLoading(false);
            console.error('Currency conversion error:', error);
            Alert.alert('Conversion Error', 'Unable to get exchange rate. Please try again.');
            return null;
        }
    };

    const processQRCode = async (data) => {
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
                // Check if this is an overseas payment
                const overseasInfo = detectOverseasPayment(qrData);
                const isOverseas = overseasInfo !== null;

                // Payment QR Code
                const parsedQR = {
                    qr_code_id: qrData.qr_code_id || `QR_${Date.now()}`,
                    merchant_id: qrData.merchant_id,
                    amount: parseFloat(qrData.amount),
                    currency: qrData.currency || 'MYR',
                    qr_type: qrData.qr_type || 'merchant',
                    description: qrData.description || 'Payment',
                    expires_at: qrData.expires_at,
                    rawData: qrData,
                    isOverseas: isOverseas,
                    overseasInfo: overseasInfo
                };

                setScannedQRData(parsedQR);
                setIsOverseasPayment(isOverseas);

                // Convert currency if overseas payment
                if (isOverseas && qrData.currency !== 'MYR') {
                    const conversionResult = await convertCurrency(parsedQR.amount, qrData.currency);
                    if (conversionResult) {
                        setConvertedAmount(conversionResult.convertedAmount);
                        setExchangeRate(conversionResult.rate);
                        parsedQR.convertedAmount = conversionResult.convertedAmount;
                        parsedQR.exchangeRate = conversionResult.rate;
                    }
                } else {
                    setConvertedAmount(null);
                    setExchangeRate(null);
                }

                analyzeRouting(parsedQR);
                setShowPaymentModal(true);
            } else {
                console.log('Invalid QR structure - missing required fields');
            }
        } catch (error) {
            // Check if this might be a PayNow QR (different format)
            if (data.includes('paynow') || data.includes('PayNow')) {
                await handlePayNowQR(data);
            } else if (/^[a-zA-Z\s\-&'\.]+$/.test(data.trim()) && data.trim().length > 2) {
                console.log('Processing as legacy merchant QR:', data);
                handleLegacyQR(data);
            } else {
                console.log('Ignoring non-QR data');
            }
        }
    };

    const handlePayNowQR = async (data) => {
        // Simulate PayNow QR processing
        const payNowQR = {
            qr_code_id: `PAYNOW_${Date.now()}`,
            merchant_id: 'Singapore Merchant',
            amount: 25.00, // Demo amount in SGD
            currency: 'SGD',
            qr_type: 'paynow',
            description: 'PayNow Payment',
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            rawData: { paynow: true, data },
            isOverseas: true,
            overseasInfo: { country: 'Singapore', currency: 'SGD', system: 'PayNow' }
        };

        setScannedQRData(payNowQR);
        setIsOverseasPayment(true);

        // Convert SGD to MYR
        const conversionResult = await convertCurrency(payNowQR.amount, 'SGD');
        if (conversionResult) {
            setConvertedAmount(conversionResult.convertedAmount);
            setExchangeRate(conversionResult.rate);
            payNowQR.convertedAmount = conversionResult.convertedAmount;
            payNowQR.exchangeRate = conversionResult.rate;
        }

        analyzeRouting(payNowQR);
        setShowPaymentModal(true);
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
        const paymentAmount = convertedAmount || scannedQRData.amount; // Use converted amount for overseas payments

        if (!scannedQRData || paymentAmount > balance) {
            Alert.alert('Insufficient Balance', 'You do not have enough balance to complete this payment.');
            return;
        }

        setProcessing(true);
        setShowPaymentModal(false);

        try {
            console.log('Processing payment for:', scannedQRData.merchant_id, 'Amount:', paymentAmount);

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
                message: isOverseasPayment ? 'Overseas QR Code scanned - processing payment...' : 'QR Code scanned - processing payment...',
                progress: 0,
                overseas_payment: isOverseasPayment,
                original_amount: scannedQRData.amount,
                original_currency: scannedQRData.currency,
                converted_amount: convertedAmount,
                exchange_rate: exchangeRate
            });

            // Simulate realistic payment processing steps
            const processingSteps = isOverseasPayment ? [
                { step: 'Validating QR Code', progress: 15, delay: 500 },
                { step: 'Converting Currency', progress: 30, delay: 800 },
                { step: 'Checking Balance', progress: 45, delay: 300 },
                { step: 'Processing International Payment', progress: 70, delay: 1200 },
                { step: 'Updating Balance', progress: 85, delay: 400 },
                { step: 'Generating Receipt', progress: 100, delay: 300 }
            ] : [
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
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for overseas payments

                const paymentResponse = await fetch(`${BACKEND_URL}/api/pay`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: paymentAmount.toString(),
                        currency: 'MYR', // Always MYR after conversion
                        original_amount: scannedQRData.amount.toString(),
                        original_currency: scannedQRData.currency,
                        exchange_rate: exchangeRate,
                        payment_method: 'qr_scan',
                        merchant_id: scannedQRData.merchant_id,
                        user_id: USER_ID,
                        description: `${isOverseasPayment ? 'International ' : ''}Mobile QR Payment: ${scannedQRData.description}`,
                        metadata: {
                            qr_type: scannedQRData.qr_type,
                            scanner_wallet: selectedWallet,
                            scanned_at: new Date().toISOString(),
                            qr_code_id: scannedQRData.qr_code_id,
                            platform: 'mobile',
                            routing_type: routingDetails?.routingType,
                            overseas_payment: isOverseasPayment,
                            overseas_info: scannedQRData.overseasInfo,
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
            const newBalance = balance - paymentAmount;
            await saveBalance(newBalance);

            const transactionId = paymentSuccess && backendResponse?.txn_id
                ? backendResponse.txn_id
                : `${isOverseasPayment ? 'INTL_' : 'DEMO_'}${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

            const resultData = {
                success: true,
                transaction_id: transactionId,
                message: paymentSuccess
                    ? `${isOverseasPayment ? 'International p' : 'P'}ayment completed successfully!`
                    : `${isOverseasPayment ? 'International p' : 'P'}ayment completed successfully! (Demo Mode)`,
                amount: paymentAmount,
                original_amount: isOverseasPayment ? scannedQRData.amount : null,
                original_currency: isOverseasPayment ? scannedQRData.currency : null,
                exchange_rate: exchangeRate,
                merchant: scannedQRData.merchant_id,
                newBalance: newBalance,
                backend_connected: paymentSuccess,
                overseas_payment: isOverseasPayment
            };

            setPaymentResult(resultData);

            // Notify dashboard of successful payment
            await notifyDashboard('payment_success', {
                message: `${isOverseasPayment ? 'International p' : 'P'}ayment completed successfully!`,
                progress: 100,
                transaction_id: transactionId,
                amount: paymentAmount,
                original_amount: isOverseasPayment ? scannedQRData.amount : null,
                original_currency: isOverseasPayment ? scannedQRData.currency : null,
                exchange_rate: exchangeRate,
                merchant: scannedQRData.merchant_id,
                new_balance: newBalance,
                backend_mode: paymentSuccess ? 'connected' : 'demo',
                overseas_payment: isOverseasPayment
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
                        error: error.message,
                        overseas_payment: isOverseasPayment
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
            label: 'Singapore PayNow - S$ 25.00',
            data: JSON.stringify({
                qr_code_id: 'QR_DEMO_PAYNOW',
                merchant_id: 'Marina Bay Sands',
                amount: 25.00,
                currency: 'SGD',
                qr_type: 'paynow',
                description: 'Shopping at Singapore'
            })
        },
        {
            label: 'Thailand PromptPay - ฿ 150.00',
            data: JSON.stringify({
                qr_code_id: 'QR_DEMO_PROMPTPAY',
                merchant_id: 'Bangkok Street Food',
                amount: 150.00,
                currency: 'THB',
                qr_type: 'promptpay',
                description: 'Thai Food'
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
            label: 'Indonesia QRIS - Rp 45,000',
            data: JSON.stringify({
                qr_code_id: 'QR_DEMO_QRIS',
                merchant_id: 'Bali Warung',
                amount: 45000,
                currency: 'IDR',
                qr_type: 'qris',
                description: 'Indonesian Cuisine'
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
            <ScreenSafeArea style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Initializing camera...</Text>
                </View>
            </ScreenSafeArea>
        );
    }

    if (hasPermission === false || demoMode) {
        return (
            <ScreenSafeArea style={styles.container}>
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
                        style={styles.offlineButton}
                        onPress={() => navigation.navigate('OfflinePayment', { screen: 'OfflinePaymentMain' })}
                    >
                        <Ionicons name="bluetooth-outline" size={20} color="white" />
                        <Text style={styles.offlineButtonText}>Offline Payment</Text>
                    </TouchableOpacity>
                </View>

                {renderModals()}
            </ScreenSafeArea>
        );
    }

    const renderModals = () => (
        <>
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
                            <ScrollView style={styles.paymentDetails} showsVerticalScrollIndicator={false}>
                                {/* Overseas Payment Alert */}
                                {isOverseasPayment && scannedQRData.overseasInfo && (
                                    <View style={styles.overseasAlert}>
                                        <Ionicons name="globe-outline" size={20} color="#FF9500" />
                                        <Text style={styles.overseasAlertText}>
                                            Overseas Payment • {scannedQRData.overseasInfo.country}
                                        </Text>
                                        <Text style={styles.overseasSystemText}>
                                            {scannedQRData.overseasInfo.system}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.merchantInfo}>
                                    <Text style={styles.merchantName}>{scannedQRData.merchant_id}</Text>
                                    <Text style={styles.amountText}>
                                        {scannedQRData.currency} {scannedQRData.amount.toFixed(2)}
                                    </Text>
                                </View>

                                {/* Currency Conversion Section */}
                                {isOverseasPayment && scannedQRData.currency !== 'MYR' && (
                                    <View style={styles.conversionSection}>
                                        {conversionLoading ? (
                                            <View style={styles.conversionLoading}>
                                                <ActivityIndicator size="small" color={Colors.primary} />
                                                <Text style={styles.conversionLoadingText}>Converting currency...</Text>
                                            </View>
                                        ) : convertedAmount && exchangeRate ? (
                                            <>
                                                <View style={styles.conversionHeader}>
                                                    <Ionicons name="swap-horizontal" size={16} color="#007AFF" />
                                                    <Text style={styles.conversionTitle}>Currency Conversion</Text>
                                                </View>

                                                <View style={styles.conversionDetails}>
                                                    <View style={styles.conversionRow}>
                                                        <Text style={styles.originalAmountLabel}>Original Amount:</Text>
                                                        <Text style={styles.originalAmountValue}>
                                                            {scannedQRData.currency} {scannedQRData.amount.toFixed(2)}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.exchangeRateRow}>
                                                        <Text style={styles.exchangeRateLabel}>Exchange Rate:</Text>
                                                        <Text style={styles.exchangeRateValue}>
                                                            1 {scannedQRData.currency} = RM {exchangeRate.toFixed(4)}
                                                        </Text>
                                                    </View>

                                                    <View style={styles.convertedAmountRow}>
                                                        <Text style={styles.convertedAmountLabel}>You'll Pay:</Text>
                                                        <Text style={styles.convertedAmountValue}>
                                                            RM {convertedAmount.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <Text style={styles.rateDisclaimer}>
                                                    * Exchange rate updated in real-time
                                                </Text>
                                            </>
                                        ) : null}
                                    </View>
                                )}

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
                                        <Text style={styles.routingTitle}>
                                            {isOverseasPayment ? 'International Routing' : routingDetails.routingType}
                                        </Text>
                                        <Text style={styles.routingRoute}>{routingDetails.route}</Text>
                                        <Text style={styles.routingTime}>Processing time: {routingDetails.processingTime}</Text>
                                    </View>
                                )}

                                <View style={styles.walletSelection}>
                                    <Text style={styles.walletLabel}>Pay with:</Text>
                                    <View style={styles.walletOption}>
                                        <Text style={styles.walletIcon}>{getWalletIcon(selectedWallet)}</Text>
                                        <Text style={styles.walletName}>
                                            {selectedWallet === 'tng' ? 'TOUCH N GO' : selectedWallet.toUpperCase()}
                                        </Text>
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
                                            (balance - (convertedAmount || scannedQRData.amount)) < 0 ? styles.insufficientBalance : styles.sufficientBalance
                                        ]}>
                                            RM {(balance - (convertedAmount || scannedQRData.amount)).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>
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
                                    scannedQRData && (convertedAmount || scannedQRData.amount) > balance && styles.disabledButton
                                ]}
                                onPress={processPayment}
                                disabled={scannedQRData && (convertedAmount || scannedQRData.amount) > balance}
                            >
                                <Text style={styles.confirmPaymentText}>
                                    {scannedQRData && (convertedAmount || scannedQRData.amount) > balance ? 'Insufficient Balance' : 'Confirm Payment'}
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
                                        {paymentResult.overseas_payment && (
                                            <View style={styles.overseasResultSection}>
                                                <Text style={styles.overseasResultTitle}>🌍 International Payment</Text>
                                                <View style={styles.resultRow}>
                                                    <Text style={styles.resultLabel}>Original Amount:</Text>
                                                    <Text style={styles.resultValue}>
                                                        {paymentResult.original_currency} {paymentResult.original_amount?.toFixed(2)}
                                                    </Text>
                                                </View>
                                                <View style={styles.resultRow}>
                                                    <Text style={styles.resultLabel}>Exchange Rate:</Text>
                                                    <Text style={styles.resultValue}>
                                                        1 {paymentResult.original_currency} = RM {paymentResult.exchange_rate?.toFixed(4)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

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
        <ScreenSafeArea style={styles.container}>
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
                    Point your camera at any payment QR code
                </Text>
                <Text style={styles.subInstructionText}>
                    Supports domestic & international QR payments with auto currency conversion
                </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('OfflinePayment', { screen: 'OfflinePaymentMain' })}
                >
                    <Ionicons name="bluetooth-outline" size={24} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Offline Payment</Text>
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
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                >
                    <Ionicons name="home-outline" size={24} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Home</Text>
                </TouchableOpacity>
            </View>

            {renderModals()}
        </ScreenSafeArea>
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
    offlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
    },
    offlineButtonText: {
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
        maxHeight: 400,
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
    },
    cancelPaymentButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 14,
        borderRadius: 12,
        marginRight: 8,
    },
    cancelPaymentText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    confirmPaymentButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        marginLeft: 8,
    },
    confirmPaymentText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    resultModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    resultHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 12,
        textAlign: 'center',
    },
    resultDetails: {
        marginBottom: 24,
    },
    resultMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    resultLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    resultValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        maxWidth: '60%',
        textAlign: 'right',
    },
    newBalanceText: {
        color: '#22C55E',
        fontWeight: 'bold',
    },
    resultButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    resultButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    overseasAlert: {
        backgroundColor: '#FFF3CD',
        borderColor: '#FFEAA7',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    overseasAlertText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF9500',
        marginLeft: 8,
        flex: 1,
    },
    overseasSystemText: {
        fontSize: 12,
        color: '#FF9500',
        fontStyle: 'italic',
    },
    conversionSection: {
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    conversionLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    conversionLoadingText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    conversionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    conversionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginLeft: 8,
    },
    conversionDetails: {
        marginBottom: 12,
    },
    conversionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    exchangeRateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    convertedAmountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E3F2FD',
    },
    originalAmountLabel: {
        fontSize: 13,
        color: '#666',
    },
    originalAmountValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    exchangeRateLabel: {
        fontSize: 12,
        color: '#666',
    },
    exchangeRateValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#007AFF',
    },
    convertedAmountLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    convertedAmountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#22C55E',
    },
    rateDisclaimer: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    overseasResultSection: {
        backgroundColor: '#F0F8FF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    overseasResultTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
        textAlign: 'center',
    },
}); 