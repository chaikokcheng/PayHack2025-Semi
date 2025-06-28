"use client";

import React, { useState, useEffect } from "react";
import {
    Box, Card, CardHeader, CardBody, Heading, Text, Button, Badge, VStack, HStack, Input,
    NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
    Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td, Code, useToast, Modal,
    ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Grid, GridItem,
    Progress, Divider, Container, useColorModeValue
} from "@chakra-ui/react";
import { FiHome, FiGrid, FiCamera, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import {
    Wifi, WifiOff, Bluetooth, User, Key, ArrowRight, ArrowLeft, CheckCircle, Database, RefreshCcw,
    Shield, Lock, Fingerprint, Smartphone, AlertTriangle, Clock, DollarSign
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/offline-demo";

interface User {
    id: string;
    full_name: string;
    balance: number;
    risk_score: number;
    kyc_status: string;
}

interface Token {
    token_id: string;
    amount: number;
    status: string;
    security_details: any;
    balance_at_creation: number;
    expires_at: string;
    device_id: string;
    remaining_amount: number;
}

interface DatabaseFlow {
    step: string;
    action: string;
    data: any;
    timestamp: string;
    status: 'pending' | 'success' | 'error';
}

export default function InteractiveWorkflowPage() {
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    const [payerId, setPayerId] = useState("9d4afd74-0dfc-4b33-9903-470171a72b29");
    const [payeeId, setPayeeId] = useState("bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9");
    const [payer, setPayer] = useState<User | null>(null);
    const [payee, setPayee] = useState<User | null>(null);
    const [tokenAmount, setTokenAmount] = useState(50);
    const [paymentAmount, setPaymentAmount] = useState(25);
    const [token, setToken] = useState<Token | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [bluetoothConnected, setBluetoothConnected] = useState(false);
    const [paymentSent, setPaymentSent] = useState(false);
    const [paymentReceived, setPaymentReceived] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [transaction, setTransaction] = useState<any>(null);
    const [syncedTransaction, setSyncedTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [databaseFlow, setDatabaseFlow] = useState<DatabaseFlow[]>([]);
    const [showDatabaseFlow, setShowDatabaseFlow] = useState(true);
    const [bluetoothPayload, setBluetoothPayload] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState<'setup' | 'token' | 'offline' | 'payment' | 'complete'>('setup');
    const [connectionMethod] = useState('bluetooth');
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Add database flow entry
    const addDatabaseFlow = (step: string, action: string, data: any, status: 'pending' | 'success' | 'error' = 'success') => {
        const flowEntry: DatabaseFlow = {
            step,
            action,
            data,
            timestamp: new Date().toISOString(),
            status
        };
        setDatabaseFlow(prev => [...prev, flowEntry]);
    };

    // Load both users at once
    const loadBothUsers = async () => {
        setLoading(true);
        try {
            const [payerResponse, payeeResponse] = await Promise.all([
                fetch(`${API}/user/${payerId}`),
                fetch(`${API}/user/${payeeId}`)
            ]);

            const [payerResult, payeeResult] = await Promise.all([
                payerResponse.json(),
                payeeResponse.json()
            ]);

            if (payerResult.success && payeeResult.success) {
                setPayer(payerResult.user);
                setPayee(payeeResult.user);

                addDatabaseFlow(
                    'Users Load',
                    'Load Payer and Payee Details',
                    { payer: payerResult.user, payee: payeeResult.user },
                    'success'
                );

                toast({
                    title: 'Both users loaded successfully',
                    status: 'success',
                    duration: 3000,
                });
            } else {
                const errors = [];
                if (!payerResult.success) errors.push(`Payer: ${payerResult.message}`);
                if (!payeeResult.success) errors.push(`Payee: ${payeeResult.message}`);

                toast({
                    title: 'Failed to load users',
                    description: errors.join(', '),
                    status: 'error',
                    duration: 3000,
                });
            }
        } catch (error) {
            toast({
                title: 'Error loading users',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Refresh user balances from database
    const refreshUserBalances = async () => {
        try {
            if (payer?.id) {
                const payerResponse = await fetch(`${API}/user/${payer.id}`);
                const payerResult = await payerResponse.json();
                if (payerResult.success) {
                    setPayer(prev => prev ? { ...prev, balance: payerResult.user.balance } : null);
                }
            }

            if (payee?.id) {
                const payeeResponse = await fetch(`${API}/user/${payee.id}`);
                const payeeResult = await payeeResponse.json();
                if (payeeResult.success) {
                    setPayee(prev => prev ? { ...prev, balance: payeeResult.user.balance } : null);
                }
            }
        } catch (error) {
            console.error('Error refreshing balances:', error);
        }
    };

    // Load user details (individual)
    const loadUser = async (userId: string, isPayer: boolean) => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/user/${userId}`);
            const result = await response.json();

            if (result.success) {
                if (isPayer) {
                    setPayer(result.user);
                } else {
                    setPayee(result.user);
                }

                addDatabaseFlow(
                    'User Load',
                    `Load ${isPayer ? 'Payer' : 'Payee'} Details`,
                    result.user,
                    'success'
                );

                toast({
                    title: `${isPayer ? 'Payer' : 'Payee'} loaded successfully`,
                    status: 'success',
                    duration: 3000,
                });
            } else {
                toast({
                    title: 'Failed to load user',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                });
            }
        } catch (error) {
            toast({
                title: 'Error loading user',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Generate offline token with proper security
    const generateToken = async () => {
        if (!payer || tokenAmount > payer.balance) {
            toast({
                title: 'Insufficient balance',
                description: `Available: ${payer?.balance}, Requested: ${tokenAmount}`,
                status: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            // Generate secure device fingerprint
            const deviceId = `DEV_${payer.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const response = await fetch(`${API}/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: payer.id,
                    amount: tokenAmount,
                    currency: 'MYR',
                    device_id: deviceId
                })
            });

            const result = await response.json();

            if (result.success) {
                const newToken: Token = {
                    token_id: result.token_id,
                    amount: tokenAmount,
                    status: 'active',
                    security_details: result.security_details,
                    balance_at_creation: result.security_details.balance_at_creation,
                    expires_at: result.security_details.expires_at,
                    device_id: deviceId,
                    remaining_amount: tokenAmount
                };

                setToken(newToken);
                setCurrentStep('token');

                addDatabaseFlow(
                    'Token Generation',
                    'Create Secure Offline Token',
                    {
                        token_id: result.token_id,
                        amount: tokenAmount,
                        user_id: payer.id,
                        device_id: deviceId,
                        security_features: [
                            'Device binding prevents unauthorized use',
                            'Cryptographic signature prevents tampering',
                            'Balance embedded in signature',
                            'Time-limited expiration',
                            'Unique token ID prevents double-spending'
                        ]
                    },
                    'success'
                );

                toast({
                    title: 'Secure token generated',
                    description: 'Token bound to device and user, saved locally and in database',
                    status: 'success',
                    duration: 3000,
                });
            } else {
                toast({
                    title: 'Failed to generate token',
                    description: result.message,
                    status: 'error',
                    duration: 3000,
                });
            }
        } catch (error) {
            toast({
                title: 'Error generating token',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Go offline
    const goOffline = () => {
        setIsOnline(false);
        setCurrentStep('offline');
        addDatabaseFlow(
            'Network Status',
            'Payer Goes Offline',
            {
                status: 'offline',
                timestamp: new Date().toISOString(),
                device_id: token?.device_id
            },
            'success'
        );
        toast({
            title: 'Payer is now offline',
            description: 'Can still make payments using stored token',
            status: 'info',
            duration: 3000,
        });
    };

    // Connect via chosen method
    const connectDevices = () => {
        setLoading(true);
        setTimeout(() => {
            setBluetoothConnected(true);
            setLoading(false);
            addDatabaseFlow(
                'Device Connection',
                `${connectionMethod.toUpperCase()} Connection`,
                {
                    payer_id: payer?.id,
                    payee_id: payee?.id,
                    connection_method: connectionMethod,
                    connection_status: 'connected',
                    device_id: token?.device_id
                },
                'success'
            );
            toast({
                title: `${connectionMethod.toUpperCase()} connected`,
                description: 'Device connection established',
                status: 'success',
                duration: 3000,
            });
        }, 2000);
    };

    // Send secure payment via encrypted payload
    const sendPayment = async () => {
        if (!payer || !token || !paymentAmount) {
            toast({
                title: 'Missing payment details',
                description: 'Please ensure all payment information is provided',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        // Validate payment amount against user balance
        if (paymentAmount > payer.balance) {
            toast({
                title: 'Insufficient balance',
                description: `Available: $${payer.balance}, Requested: $${paymentAmount}`,
                status: 'error',
                duration: 5000,
            });
            return;
        }

        // Validate payment amount against token authorization limit
        if (paymentAmount > (token.remaining_amount || 0)) {
            toast({
                title: 'Exceeds authorization limit',
                description: `Token limit: $${token.remaining_amount}, Requested: $${paymentAmount}`,
                status: 'error',
                duration: 5000,
            });
            return;
        }

        setLoading(true);
        try {
            // Generate secure device fingerprint
            const deviceId = token.device_id || `DEV_${payer.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Prepare payment data for Bluetooth transfer (don't create transaction yet)
            const bluetoothData = {
                token_id: token.token_id,
                sender_id: payer.id,
                recipient_id: payee?.id || payeeId,
                amount: paymentAmount,
                device_id: deviceId,
                signature: `SIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString()
            };

            setBluetoothPayload(bluetoothData);
                setPaymentSent(true);
                setCurrentStep('payment');

                addDatabaseFlow(
                'Payment Transmission',
                'Send Encrypted Payment via Bluetooth',
                    {
                        amount: paymentAmount,
                    sender: payer.full_name,
                    recipient: payee?.full_name || payeeId,
                    device_id: deviceId,
                    status: 'transmitted'
                    },
                    'success'
                );

                toast({
                title: 'Payment sent',
                description: `$${paymentAmount} sent via Bluetooth`,
                    status: 'success',
                    duration: 3000,
                });
        } catch (error) {
            toast({
                title: 'Error sending payment',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Receive and verify payment
    const receivePayment = async () => {
        if (!bluetoothPayload) {
            toast({
                title: 'No payment data',
                description: 'No payment data received to verify',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            // Prepare verification data with all required fields
            const verificationData = {
                token_id: bluetoothPayload.token_id || (token?.token_id),
                sender_id: bluetoothPayload.sender_id || (payer?.id),
                recipient_id: bluetoothPayload.recipient_id || (payee?.id),
                amount: bluetoothPayload.amount || paymentAmount,
                device_id: bluetoothPayload.device_id || (token?.device_id),
                signature: bluetoothPayload.signature || 'demo_signature',
                timestamp: bluetoothPayload.timestamp || new Date().toISOString()
            };

            console.log('Verifying payment with data:', verificationData);

            const response = await fetch(`${API}/verify-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationData)
            });

            const result = await response.json();
            console.log('Verification result:', result);

            if (result.success) {
                // Update bluetoothPayload with complete data for acceptPayment
                const completePayload = {
                    ...bluetoothPayload,
                    ...verificationData,
                    verified: true,
                    verification_timestamp: new Date().toISOString()
                };

                setBluetoothPayload(completePayload);
                setVerificationResult(result);
                setPaymentReceived(true);

                addDatabaseFlow(
                    'Payment Verification',
                    'Verify Token',
                    {
                        verification_data: verificationData,
                        verification_result: result.verification_result,
                        can_proceed: result.verification_result.can_proceed
                    },
                    'success'
                );

                toast({
                    title: 'Payment verified',
                    description: result.verification_result.can_proceed ?
                        'Payment is valid and ready to accept' :
                        'Payment verification failed',
                    status: result.verification_result.can_proceed ? 'success' : 'warning',
                    duration: 3000,
                });
            } else {
                throw new Error(result.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);

            addDatabaseFlow(
                'Verification Error',
                'Failed to Verify Payment',
                {
                    error: error.message,
                    payload: bluetoothPayload,
                    timestamp: new Date().toISOString()
                },
                'error'
            );

            toast({
                title: 'Error verifying payment',
                description: error.message || 'Unknown verification error',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Accept payment and sync
    const acceptPayment = async () => {
        if (!verificationResult || !bluetoothPayload) {
            toast({
                title: 'Missing verification data',
                description: 'Please verify payment first',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        setLoading(true);
        try {
            // First verify that all required fields are present
            const requiredFields = ['token_id', 'sender_id', 'recipient_id', 'amount'];
            const missingFields = requiredFields.filter(field => !bluetoothPayload[field]);

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Create secure offline transaction
            const transactionData = {
                    token_id: bluetoothPayload.token_id,
                    sender_id: bluetoothPayload.sender_id,
                    recipient_id: bluetoothPayload.recipient_id,
                    amount: bluetoothPayload.amount,
                    device_id: bluetoothPayload.device_id
            };

            console.log('Creating transaction with data:', transactionData);

            const response = await fetch(`${API}/offline-transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData)
            });

            const result = await response.json();
            console.log('Transaction creation result:', result);

            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            if (result.success) {
                const newTransaction = {
                    id: result.id,
                    amount: bluetoothPayload.amount,
                    status: 'pending',
                    sender_id: bluetoothPayload.sender_id,
                    recipient_id: bluetoothPayload.recipient_id,
                    token_id: bluetoothPayload.token_id,
                    device_id: bluetoothPayload.device_id,
                    created_at: new Date().toISOString()
                };

                setTransaction(newTransaction);

                addDatabaseFlow(
                    'Transaction Creation',
                    'Create Offline Transaction',
                    {
                        ...newTransaction
                    },
                    'success'
                );

                // Sync with payment system
                console.log('Syncing transaction:', result.id);
                const syncResponse = await fetch(`${API}/sync-offline-transaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ offline_tx_id: result.id })
                });

                const syncResult = await syncResponse.json();
                console.log('Sync result:', syncResult);

                if (syncResult.success) {
                    setSyncedTransaction({
                        ...newTransaction,
                        status: 'completed',
                        synced_at: new Date().toISOString()
                    });

                    setCurrentStep('complete');

                    // Update balances after successful sync
                    if (syncResult.sync_result?.balance_updates) {
                        const { sender_balance, recipient_balance } = syncResult.sync_result.balance_updates;

                        // Update payer balance
                        if (payer && sender_balance !== null) {
                            setPayer({
                                ...payer,
                                balance: sender_balance
                            });
                        }

                        // Update payee balance
                        if (payee && recipient_balance !== null) {
                            setPayee({
                                ...payee,
                                balance: recipient_balance
                            });
                        }
                    }

                    // Also refresh balances from database to ensure consistency
                    await refreshUserBalances();

                    addDatabaseFlow(
                        'Transaction Settlement',
                        'Sync with Payment System',
                        {
                            transaction_id: result.id,
                            device_id: bluetoothPayload.device_id,
                            sync_result: syncResult.sync_result,
                            final_status: 'completed',
                            balance_updates: syncResult.sync_result?.balance_updates
                        },
                        'success'
                    );

                    toast({
                        title: 'Payment completed',
                        description: `Transaction settled. Payer: $${payer?.balance}, Payee: $${payee?.balance}`,
                        status: 'success',
                        duration: 3000,
                    });
                } else {
                    throw new Error(`Sync failed: ${syncResult.message}`);
                }
            } else {
                throw new Error(result.message || 'Transaction creation failed');
            }
        } catch (error) {
            console.error('Accept payment error:', error);

            addDatabaseFlow(
                'Transaction Error',
                'Failed to Accept Payment',
                {
                    error: error.message,
                    payload: bluetoothPayload,
                    timestamp: new Date().toISOString()
                },
                'error'
            );

            toast({
                title: 'Error accepting payment',
                description: error.message || 'Unknown error occurred',
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset workflow
    const resetWorkflow = () => {
        setPayer(null);
        setPayee(null);
        setToken(null);
        setIsOnline(true);
        setBluetoothConnected(false);
        setPaymentSent(false);
        setPaymentReceived(false);
        setVerificationResult(null);
        setTransaction(null);
        setSyncedTransaction(null);
        setDatabaseFlow([]);
        setBluetoothPayload(null);
        setCurrentStep('setup');
        setConnectionMethod('bluetooth');
    };

    return (
        <Box minH="100vh" bg={bgColor}>
            <Container maxW="7xl" py={8}>
                <VStack spacing={8} align="stretch">
                {/* Header */}
                    <Card bg={cardBg}>
                    <CardHeader pb={2}>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                    <HStack spacing={2}>
                                        <Text fontSize="2xl">🔒</Text>
                                        <Heading size="lg">Offline Payment Interactive Workflow</Heading>
                                    </HStack>
                                    <Text color="gray.600" fontSize="sm">Device-bound tokens for secure offline payments</Text>
                            </VStack>
                            <HStack spacing={3}>
                                <Badge colorScheme={isOnline ? "green" : "red"} p={2}>
                                    <HStack spacing={1}>
                                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                                        <Text fontSize="xs">{isOnline ? "Online" : "Offline"}</Text>
                                    </HStack>
                                </Badge>
                                <Button
                                    leftIcon={<Database size={14} />}
                                    onClick={() => setShowDatabaseFlow(!showDatabaseFlow)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {showDatabaseFlow ? "Hide" : "Show"} Flow
                                </Button>
                                <Button
                                    leftIcon={<RefreshCcw size={14} />}
                                    onClick={resetWorkflow}
                                    variant="outline"
                                    size="sm"
                                >
                                    Reset
                                </Button>
                            </HStack>
                        </HStack>
                    </CardHeader>
                </Card>

                {/* Main Workflow - Payer and Payee Screens */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                    {/* Payer Screen */}
                    <Card>
                        <CardHeader pb={2}>
                            <HStack justify="space-between">
                                <Heading size="md" color="blue.600">Payer Screen</Heading>
                                <Badge colorScheme={currentStep === 'complete' ? "green" : "blue"}>
                                    {currentStep === 'setup' && 'Setup'}
                                    {currentStep === 'token' && 'Token Ready'}
                                    {currentStep === 'offline' && 'Offline'}
                                    {currentStep === 'payment' && 'Payment Sent'}
                                    {currentStep === 'complete' && 'Complete'}
                                </Badge>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={3} align="stretch">
                                    {/* Always show payer info if loaded */}
                                {payer && (
                                    <Card bg="blue.50" p={3} size="sm">
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold" fontSize="sm">Payer: {payer.full_name}</Text>
                                            <Text fontSize="sm">Balance: ${payer.balance}</Text>
                                                <Text fontSize="sm" color="green.600">KYC: {payer.kyc_status}</Text>
                                        </VStack>
                                    </Card>
                                )}

                                    {/* Always show token info if generated */}
                                    {token && (
                                        <Card bg="purple.50" p={3} size="sm">
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="bold" fontSize="sm">Authorization Token</Text>
                                                <Text fontSize="xs" color="gray.600">ID: {token.token_id.slice(0, 12)}...</Text>
                                                <Text fontSize="sm">Limit: ${token.amount}</Text>
                                                <Text fontSize="sm">Available: ${token.remaining_amount}</Text>
                                                <Text fontSize="xs" color="gray.600">Device: {token.device_id.slice(0, 20)}...</Text>
                                            </VStack>
                                        </Card>
                                    )}

                                    {/* Step 1: Load Users */}
                                    {currentStep === 'setup' && (!payer || !payee) && (
                                    <VStack spacing={3} align="stretch">
                                            <VStack spacing={2}>
                                            <Input
                                                value={payerId}
                                                onChange={(e) => setPayerId(e.target.value)}
                                                placeholder="Payer ID"
                                                size="sm"
                                            />
                                                <Input
                                                    value={payeeId}
                                                    onChange={(e) => setPayeeId(e.target.value)}
                                                    placeholder="Payee ID"
                                                    size="sm"
                                                />
                                            <Button
                                                    onClick={loadBothUsers}
                                                isLoading={loading}
                                                colorScheme="blue"
                                                size="sm"
                                                leftIcon={<User size={14} />}
                                                    width="full"
                                            >
                                                    Load Both Users
                                            </Button>
                                            </VStack>
                                    </VStack>
                                )}

                                {/* Step 2: Generate Token */}
                                    {currentStep === 'setup' && payer && payee && !token && (
                                    <VStack spacing={3} align="stretch">
                                            <Text fontSize="sm" color="gray.600">Both users loaded. Generate authorization token:</Text>
                                        <HStack spacing={2}>
                                            <NumberInput
                                                value={tokenAmount}
                                                onChange={(_, value) => setTokenAmount(value)}
                                                min={1}
                                                max={payer?.balance || 1000}
                                                size="sm"
                                            >
                                                <NumberInputField placeholder="Token Amount" />
                                            </NumberInput>
                                            <Button
                                                onClick={generateToken}
                                                isLoading={loading}
                                                colorScheme="purple"
                                                size="sm"
                                                leftIcon={<Key size={14} />}
                                            >
                                                Generate
                                            </Button>
                                        </HStack>
                                            <Text fontSize="xs" color="gray.600">
                                                Max: ${payer?.balance || 0}
                                            </Text>
                                    </VStack>
                                )}

                                {/* Step 3: Token Ready */}
                                {currentStep === 'token' && token && (
                                    <VStack spacing={3} align="stretch">
                                            <Alert status="success" size="sm">
                                                <AlertIcon />
                                                <Text fontSize="sm">Secure token generated and stored</Text>
                                            </Alert>
                                        <Button
                                            onClick={goOffline}
                                            colorScheme="orange"
                                            size="sm"
                                            leftIcon={<WifiOff size={14} />}
                                        >
                                            Go Offline
                                        </Button>
                                    </VStack>
                                )}

                                {/* Step 4: Connection & Payment */}
                                {currentStep === 'offline' && (
                                    <VStack spacing={3} align="stretch">
                                        <HStack spacing={2}>
                                                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                                                    Connection Method: Bluetooth
                                                </Text>
                                        </HStack>

                                        <Button
                                            onClick={connectDevices}
                                            isLoading={loading}
                                            colorScheme="blue"
                                            size="sm"
                                            leftIcon={<Bluetooth size={14} />}
                                        >
                                                Connect via Bluetooth
                                        </Button>

                                        {bluetoothConnected && (
                                            <VStack spacing={2} align="stretch">
                                                <HStack spacing={2}>
                                                    <NumberInput
                                                        value={paymentAmount}
                                                        onChange={(_, value) => setPaymentAmount(value)}
                                                        min={1}
                                                            max={Math.min(token?.remaining_amount || 0, payer?.balance || 0)}
                                                        size="sm"
                                                    >
                                                        <NumberInputField placeholder="Amount" />
                                                    </NumberInput>
                                                    <Button
                                                        onClick={sendPayment}
                                                        isLoading={loading}
                                                        colorScheme="green"
                                                        size="sm"
                                                        leftIcon={<ArrowRight size={14} />}
                                                    >
                                                        Send
                                                    </Button>
                                                </HStack>
                                                    <VStack spacing={1} align="start">
                                                <Text fontSize="xs" color="gray.600">
                                                            Token Available: ${token?.remaining_amount || 0}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.600">
                                                            Account Balance: ${payer?.balance || 0}
                                                        </Text>
                                                        <Text fontSize="xs" color="blue.600">
                                                            Max: ${Math.min(token?.remaining_amount || 0, payer?.balance || 0)}
                                                </Text>
                                                    </VStack>
                                            </VStack>
                                        )}
                                    </VStack>
                                )}

                                {/* Payment Sent Status */}
                                {currentStep === 'payment' && (
                                    <VStack spacing={3} align="stretch">
                                        <Alert status="success" size="sm">
                                            <AlertIcon />
                                                <Text fontSize="sm">Payment sent via Bluetooth</Text>
                                        </Alert>
                                        <Card bg="green.50" p={3} size="sm">
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="bold" fontSize="sm">Sent: ${paymentAmount}</Text>
                                                    <Text fontSize="sm">Token Remaining: ${token?.remaining_amount || 0}</Text>
                                                <Text fontSize="sm" color="gray.600">Pending sync...</Text>
                                            </VStack>
                                        </Card>
                                    </VStack>
                                )}

                                {/* Complete Status */}
                                {currentStep === 'complete' && (
                                    <VStack spacing={3} align="stretch">
                                        <Alert status="success" size="sm">
                                            <AlertIcon />
                                            <Text fontSize="sm">Payment completed and synced</Text>
                                        </Alert>
                                        <Card bg="green.50" p={3} size="sm">
                                            <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="sm">Final Balance: ${payer?.balance || 0}</Text>
                                                <Text fontSize="sm">Transaction: {syncedTransaction?.id.slice(0, 8)}...</Text>
                                            </VStack>
                                        </Card>
                                    </VStack>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Payee Screen */}
                    <Card>
                        <CardHeader pb={2}>
                            <HStack justify="space-between">
                                <Heading size="md" color="green.600">Payee Screen</Heading>
                                <Badge colorScheme={paymentReceived ? "green" : "gray"}>
                                    {paymentReceived ? "Payment Received" : "Waiting"}
                                </Badge>
                            </HStack>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={3} align="stretch">
                                    {/* Always show payee info if loaded */}
                                {payee && (
                                    <Card bg="green.50" p={3} size="sm">
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold" fontSize="sm">Payee: {payee.full_name}</Text>
                                            <Text fontSize="sm">Balance: ${payee.balance}</Text>
                                                <Text fontSize="sm" color="green.600">KYC: {payee.kyc_status}</Text>
                                        </VStack>
                                    </Card>
                                )}

                                {/* Waiting for Payment */}
                                {currentStep === 'offline' && payee && (
                                    <VStack spacing={3} align="stretch">
                                            <Text fontSize="sm" color="gray.600">Waiting for payment...</Text>
                                        <Card bg="gray.50" p={3} size="sm">
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm">Status: Ready to receive</Text>
                                                <Text fontSize="sm">Connection: {bluetoothConnected ? "Connected" : "Disconnected"}</Text>
                                                    <Text fontSize="sm">Method: Bluetooth</Text>
                                            </VStack>
                                        </Card>
                                    </VStack>
                                )}

                                {/* Payment Received */}
                                {currentStep === 'payment' && (
                                    <VStack spacing={3} align="stretch">
                                        <Alert status="info" size="sm">
                                            <AlertIcon />
                                                <Text fontSize="sm">Payment received</Text>
                                        </Alert>

                                        <Button
                                            onClick={receivePayment}
                                            isLoading={loading}
                                            colorScheme="orange"
                                            size="sm"
                                            leftIcon={<Shield size={14} />}
                                        >
                                                Verify Payment
                                        </Button>

                                        {verificationResult && (
                                            <Card bg="orange.50" p={3} size="sm">
                                                <VStack align="start" spacing={1}>
                                                    <Text fontWeight="bold" fontSize="sm">Verified: {verificationResult.verification_result.can_proceed ? 'Valid' : 'Invalid'}</Text>
                                                        <Text fontSize="sm">Device: {bluetoothPayload?.device_id?.slice(0, 20)}...</Text>
                                                    <Text fontSize="sm">Amount: ${bluetoothPayload?.amount}</Text>
                                                </VStack>
                                            </Card>
                                        )}

                                        {paymentReceived && (
                                            <Button
                                                onClick={acceptPayment}
                                                isLoading={loading}
                                                colorScheme="green"
                                                size="sm"
                                                leftIcon={<CheckCircle size={14} />}
                                            >
                                                Accept & Sync
                                            </Button>
                                        )}
                                    </VStack>
                                )}

                                {/* Payment Complete */}
                                {currentStep === 'complete' && (
                                    <VStack spacing={3} align="stretch">
                                        <Alert status="success" size="sm">
                                            <AlertIcon />
                                                <Text fontSize="sm">Payment received and synced</Text>
                                        </Alert>
                                        <Card bg="green.50" p={3} size="sm">
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="bold" fontSize="sm">Received: ${paymentAmount}</Text>
                                                    <Text fontSize="sm">New Balance: ${payee?.balance || 0}</Text>
                                            </VStack>
                                        </Card>
                                    </VStack>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Database Flow Panel */}
                {showDatabaseFlow && (
                        <Card bg={cardBg}>
                        <CardHeader pb={2}>
                                <Heading size="md">Database Flow</Heading>
                        </CardHeader>
                        <CardBody pt={2}>
                            <VStack spacing={3} align="stretch">
                                {databaseFlow.length === 0 ? (
                                    <Text color="gray.500" fontSize="sm">No database events yet. Start the workflow to see events.</Text>
                                ) : (
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th fontSize="xs">Time</Th>
                                                <Th fontSize="xs">Step</Th>
                                                <Th fontSize="xs">Action</Th>
                                                <Th fontSize="xs">Status</Th>
                                                <Th fontSize="xs">Details</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {databaseFlow.map((flow, index) => (
                                                <Tr key={index}>
                                                    <Td fontSize="xs">{new Date(flow.timestamp).toLocaleTimeString()}</Td>
                                                    <Td fontSize="xs">{flow.step}</Td>
                                                    <Td fontSize="xs">{flow.action}</Td>
                                                    <Td>
                                                        <Badge colorScheme={flow.status === 'success' ? 'green' : flow.status === 'error' ? 'red' : 'yellow'} size="sm">
                                                            {flow.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Button
                                                            size="xs"
                                                            onClick={() => {
                                                                setBluetoothPayload(flow.data);
                                                                onOpen();
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                )}

                    {/* Quick Navigation */}
                    <Card bg={cardBg}>
                        <CardHeader pb={2}>
                            <Heading size="md" textAlign="center">🚀 Quick Navigation</Heading>
                        </CardHeader>
                        <CardBody pt={2}>
                            <HStack spacing={4} justify="center" flexWrap="wrap">
                                <Link href="/">
                                    <Button leftIcon={<FiHome />} variant="outline" size="sm">
                                        Dashboard Home
                                    </Button>
                                </Link>

                                <Link href="/qr-generator">
                                    <Button leftIcon={<FiGrid />} variant="outline" size="sm">
                                        QR Generator
                                    </Button>
                                </Link>

                                <Link href="/scanner">
                                    <Button leftIcon={<FiCamera />} variant="outline" size="sm">
                                        QR Scanner
                                    </Button>
                                </Link>

                                <Link href="/test-flow">
                                    <Button leftIcon={<FiArrowRight />} variant="outline" size="sm">
                                        QR Test Flow
                                    </Button>
                                </Link>

                                <Link href="/offline-payment">
                                    <Button leftIcon={<FiArrowRight />} variant="outline" size="sm">
                                        Offline Payment Demo
                                    </Button>
                                </Link>
                            </HStack>
                        </CardBody>
                    </Card>
            </VStack>
            </Container>

            {/* Modal for viewing data details */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Data Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Code p={4} bg="gray.100" borderRadius="md" fontSize="xs" whiteSpace="pre-wrap">
                            {JSON.stringify(bluetoothPayload, null, 2)}
                        </Code>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
} 