"use client";

import React, { useState } from "react";
import {
    Box, Card, CardHeader, CardBody, Heading, Text, Button, Badge, Divider, VStack, HStack, Flex, Input
} from "@chakra-ui/react";
import {
    Lock, CheckCircle2, Activity, BluetoothIcon, Key, RefreshCcw, WifiOff
} from "lucide-react";

const API = "http://127.0.0.1:8000/api/offline-demo";

const steps = [
    {
        title: "Generate Offline Token",
        description: "Create a secure token for the payer (User A) when online.",
        icon: <Key className="h-8 w-8 text-blue-500" />,
        action: "generateToken"
    },
    {
        title: "Store Token on Device",
        description: "Token is securely stored on User A's device.",
        icon: <Lock className="h-8 w-8 text-blue-500" />,
        action: null
    },
    {
        title: "Go Offline",
        description: "User A goes offline, ready to pay.",
        icon: <WifiOff className="h-8 w-8 text-yellow-500" />,
        action: null
    },
    {
        title: "Initiate Payment",
        description: "User A sends payment to User B via Bluetooth.",
        icon: <BluetoothIcon className="h-8 w-8 text-blue-500" />,
        action: "createOfflineTransaction"
    },
    {
        title: "Payee Receives",
        description: "User B receives and stores the transaction.",
        icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
        action: null
    },
    {
        title: "Sync with Backend",
        description: "When online, sync the transaction to the backend.",
        icon: <RefreshCcw className="h-8 w-8 text-blue-500" />,
        action: "syncOfflineTransaction"
    },
    {
        title: "Final State",
        description: "Both users see updated balances and transaction status.",
        icon: <Activity className="h-8 w-8 text-green-500" />,
        action: null
    }
];

export default function OfflinePaymentPage() {
    const [payerId, setPayerId] = useState("");
    const [payeeId, setPayeeId] = useState("");
    const [payerBalance, setPayerBalance] = useState(0);
    const [payeeBalance, setPayeeBalance] = useState(0);
    const [amount] = useState(10);
    const [step, setStep] = useState(0);
    const [status, setStatus] = useState("");
    const [token, setToken] = useState<Record<string, any> | null>(null);
    const [offlineTx, setOfflineTx] = useState<Record<string, any> | null>(null);
    const [syncedTx, setSyncedTx] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch user balances
    async function fetchBalances() {
        if (!payerId || !payeeId) return;
        setLoading(true);
        try {
            const [payerRes, payeeRes] = await Promise.all([
                fetch(`${API}/user/${payerId}`).then(r => r.json()),
                fetch(`${API}/user/${payeeId}`).then(r => r.json())
            ]);
            if (payerRes.success) setPayerBalance(payerRes.user.balance);
            if (payeeRes.success) setPayeeBalance(payeeRes.user.balance);
        } finally {
            setLoading(false);
        }
    }

    // Step actions
    async function handleStep() {
        setStatus("");
        setLoading(true);
        try {
            if (steps[step].action === "generateToken") {
                // Create token for payer
                const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                const res = await fetch(`${API}/tokens`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: payerId,
                        amount,
                        device_id: "demo-device-a",
                        expires_at,
                        status: "active",
                        transaction_metadata: { demo: true }
                    })
                }).then(r => r.json());
                if (res.success) {
                    setToken({ token_id: res.token_id, amount, status: "active" });
                    setStatus("Token generated and stored on device.");
                } else {
                    setStatus(res.message || "Failed to generate token.");
                }
            } else if (steps[step].action === "createOfflineTransaction") {
                // Create offline transaction
                const res = await fetch(`${API}/offline-transactions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token_id: token.token_id,
                        sender_id: payerId,
                        recipient_id: payeeId,
                        amount,
                        status: "pending",
                        transaction_metadata: { demo: true }
                    })
                }).then(r => r.json());
                if (res.success) {
                    setOfflineTx({ id: res.id, amount, status: "pending" });
                    setStatus("Offline transaction created.");
                } else {
                    setStatus(res.message || "Failed to create offline transaction.");
                }
            } else if (steps[step].action === "syncOfflineTransaction") {
                // Sync offline transaction
                const res = await fetch(`${API}/sync-offline-transaction`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ offline_tx_id: offlineTx.id })
                }).then(r => r.json());
                if (res.success) {
                    setSyncedTx({ txn_id: res.txn_id, status: "completed" });
                    setStatus("Transaction synced to backend.");
                    // Optionally update balances
                    fetchBalances();
                } else {
                    setStatus(res.message || "Failed to sync transaction.");
                }
            }
            setStep(step + 1);
        } finally {
            setLoading(false);
        }
    }

    // Reset simulation
    function reset() {
        setStep(0);
        setStatus("");
        setToken(null);
        setOfflineTx(null);
        setSyncedTx(null);
    }

    return (
        <Box className="container mx-auto py-8">
            <Heading size="lg" mb={4}>Offline Payment Demo Workflow</Heading>
            <Text color="gray.500" mb={8}>
                Simulate a complete offline payment workflow between two users. Enter user IDs and balances, then step through the process. All actions use the real backend.
            </Text>
            <Card mb={8}>
                <CardHeader>
                    <Heading size="md">User Setup</Heading>
                </CardHeader>
                <CardBody>
                    <Flex gap={8}>
                        <VStack align="stretch" flex={1}>
                            <Text fontWeight="bold">Payer (User A)</Text>
                            <Input placeholder="User A ID" value={payerId} onChange={e => setPayerId(e.target.value)} mb={2} />
                            <Input type="number" placeholder="Balance" value={payerBalance} onChange={e => setPayerBalance(Number(e.target.value))} mb={2} />
                            <Button size="sm" onClick={async () => {
                                await fetch(`${API}/user/${payerId}/balance`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ balance: payerBalance })
                                });
                                fetchBalances();
                            }}>Set Balance</Button>
                        </VStack>
                        <VStack align="stretch" flex={1}>
                            <Text fontWeight="bold">Payee (User B)</Text>
                            <Input placeholder="User B ID" value={payeeId} onChange={e => setPayeeId(e.target.value)} mb={2} />
                            <Input type="number" placeholder="Balance" value={payeeBalance} onChange={e => setPayeeBalance(Number(e.target.value))} mb={2} />
                            <Button size="sm" onClick={async () => {
                                await fetch(`${API}/user/${payeeId}/balance`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ balance: payeeBalance })
                                });
                                fetchBalances();
                            }}>Set Balance</Button>
                        </VStack>
                    </Flex>
                </CardBody>
            </Card>
            <Card mb={8}>
                <CardHeader>
                    <Heading size="md">Workflow Simulation</Heading>
                </CardHeader>
                <CardBody>
                    <Flex gap={8}>
                        {/* Payer Column */}
                        <VStack align="stretch" flex={1}>
                            <Text fontWeight="bold">Payer (User A)</Text>
                            <Badge colorScheme="blue" mb={2}>ID: {payerId || "-"}</Badge>
                            <Text>Balance: <b>{payerBalance}</b></Text>
                            <Text>Token: <b>{token ? token.token_id : "-"}</b></Text>
                            <Text>Token Status: <b>{token ? token.status : "-"}</b></Text>
                            <Text>Offline Tx: <b>{offlineTx ? offlineTx.id : "-"}</b></Text>
                        </VStack>
                        {/* Payee Column */}
                        <VStack align="stretch" flex={1}>
                            <Text fontWeight="bold">Payee (User B)</Text>
                            <Badge colorScheme="green" mb={2}>ID: {payeeId || "-"}</Badge>
                            <Text>Balance: <b>{payeeBalance}</b></Text>
                            <Text>Received Tx: <b>{offlineTx ? offlineTx.id : "-"}</b></Text>
                            <Text>Synced Tx: <b>{syncedTx ? syncedTx.txn_id : "-"}</b></Text>
                        </VStack>
                    </Flex>
                    <Divider my={6} />
                    <HStack spacing={4} mb={4}>
                        {steps.map((s, i) => (
                            <VStack key={i} spacing={1} align="center">
                                <Box>{s.icon}</Box>
                                <Badge colorScheme={i === step ? "blue" : i < step ? "green" : "gray"}>{i + 1}</Badge>
                            </VStack>
                        ))}
                    </HStack>
                    <Box mb={4}>
                        <Heading size="sm">{steps[step].title}</Heading>
                        <Text color="gray.600">{steps[step].description}</Text>
                        {status && <Text color="blue.600" mt={2}>{status}</Text>}
                    </Box>
                    <Button colorScheme="blue" onClick={handleStep} isLoading={loading} isDisabled={step >= steps.length - 1 || !payerId || !payeeId} mr={2}>
                        {step < steps.length - 1 ? "Next Step" : "Done"}
                    </Button>
                    <Button onClick={reset} variant="outline">Reset</Button>
                </CardBody>
            </Card>
            <Card>
                <CardHeader>
                    <Heading size="md">How It Works</Heading>
                </CardHeader>
                <CardBody>
                    <VStack align="stretch" spacing={4}>
                        <Text><b>End-to-End Demo:</b> This page simulates a real offline payment workflow using the backend. You can set up users, create tokens, make offline transactions, and sync them to the server.</Text>
                        <Text><b>Security:</b> Tokens are unique, time-limited, and device-bound. Transactions are only valid if the token is active and not spent. Double-spending is prevented by backend checks.</Text>
                        <Text><b>Sync:</b> When the payee comes online, the offline transaction is synced to the main ledger, and balances are updated.</Text>
                    </VStack>
                </CardBody>
            </Card>
        </Box>
    );
} 