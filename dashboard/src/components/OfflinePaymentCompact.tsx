'use client'

import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    Button,
    Badge,
    VStack,
    HStack,
    Flex,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Progress,
    Alert,
    AlertIcon,
} from '@chakra-ui/react'
import {
    WifiOff,
    Bluetooth,
    Shield,
    Key,
    CheckCircle,
    Clock,
    DollarSign,
    Smartphone,
    ArrowRight,
    Zap,
    Lock,
    Fingerprint,
    Database,
    Server,
} from 'lucide-react'
import Link from 'next/link'

interface CompactStats {
    totalTransactions: number
    activeTokens: number
    successRate: number
    averageAmount: number
}

export function OfflinePaymentCompact() {
    const [stats, setStats] = useState<CompactStats>({
        totalTransactions: 156,
        activeTokens: 23,
        successRate: 98.7,
        averageAmount: 45.50,
    })
    const [currentStep, setCurrentStep] = useState(0)
    const [isDemoActive, setIsDemoActive] = useState(false)

    // Demo animation
    useEffect(() => {
        if (!isDemoActive) return

        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % 4)
        }, 2000)
        return () => clearInterval(interval)
    }, [isDemoActive])

    useEffect(() => {
        // Auto-Start after 1 second
        const timer = setTimeout(() => setIsDemoActive(true), 1000)
        return () => clearTimeout(timer)
    }, [])

    const demoSteps = [
        {
            icon: <Key className="h-5 w-5" />,
            title: 'Generate Token',
            status: 'active',
            color: 'blue',
        },
        {
            icon: <WifiOff className="h-5 w-5" />,
            title: 'Go Offline',
            status: 'pending',
            color: 'orange',
        },
        {
            icon: <Bluetooth className="h-5 w-5" />,
            title: 'Send Payment',
            status: 'pending',
            color: 'purple',
        },
        {
            icon: <CheckCircle className="h-5 w-5" />,
            title: 'Sync Complete',
            status: 'pending',
            color: 'green',
        },
    ]

    const securityFeatures = [
        { icon: <Lock className="h-4 w-4" />, title: 'Device Binding' },
        { icon: <Fingerprint className="h-4 w-4" />, title: 'Crypto Signatures' },
        { icon: <Shield className="h-4 w-4" />, title: 'End-to-End Encryption' },
        { icon: <Clock className="h-4 w-4" />, title: 'Time-Limited Tokens' },
    ]

    const systemStatus = [
        { name: 'Payer Device', status: 'Online', color: 'green' },
        { name: 'Payee Device', status: 'Online', color: 'green' },
        { name: 'Payment Server', status: 'Connected', color: 'green' },
        { name: 'Database', status: 'Synced', color: 'green' },
    ]

    return (
        <Card bg="white" shadow="lg" border="2px solid" borderColor="orange.200">
            <CardHeader bg="orange.50" borderBottom="1px solid" borderColor="orange.200">
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                            <Box p={2} borderRadius="full" bg="orange.100" color="orange.600">
                                <WifiOff className="h-6 w-6" />
                            </Box>
                            <Heading size="lg" color="gray.800">
                                Offline Payment System
                            </Heading>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            Secure peer-to-peer payments without internet connection
                        </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                        <Badge colorScheme="orange" variant="solid" fontSize="sm">
                            LIVE
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                            PayHack2025
                        </Text>
                    </VStack>
                </Flex>
            </CardHeader>

            <CardBody>
                <VStack spacing={6} align="stretch">
                    {/* LIVE Flow */}
                    <Box bg="gray.50" p={4} borderRadius="lg">
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                            🎬 LIVE Flow
                        </Text>
                        <SimpleGrid columns={4} spacing={3}>
                            {demoSteps.map((step, index) => (
                                <VStack
                                    key={index}
                                    spacing={2}
                                    opacity={currentStep === index ? 1 : 0.6}
                                    transition="all 0.3s"
                                >
                                    <Box
                                        p={2}
                                        borderRadius="full"
                                        bg={`${step.color}.100`}
                                        color={`${step.color}.600`}
                                    >
                                        {step.icon}
                                    </Box>
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" textAlign="center">
                                        {step.title}
                                    </Text>
                                </VStack>
                            ))}
                        </SimpleGrid>
                    </Box>

                    {/* Key Statistics */}
                    <SimpleGrid columns={4} spacing={4}>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">Total Transactions</StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">{stats.totalTransactions}</StatNumber>
                            <StatHelpText fontSize="xs" color="green.500">+12% this week</StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">Active Tokens</StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">{stats.activeTokens}</StatNumber>
                            <StatHelpText fontSize="xs" color="blue.500">Currently active</StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">Success Rate</StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">{stats.successRate}%</StatNumber>
                            <StatHelpText fontSize="xs" color="green.500">Excellent reliability</StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">Avg Amount</StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">RM{stats.averageAmount}</StatNumber>
                            <StatHelpText fontSize="xs" color="purple.500">Per transaction</StatHelpText>
                        </Stat>
                    </SimpleGrid>

                    {/* System Status */}
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                            📱 System Status
                        </Text>
                        <SimpleGrid columns={4} spacing={3}>
                            {systemStatus.map((item, index) => (
                                <VStack key={index} spacing={1} p={2} bg="gray.50" borderRadius="md">
                                    <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                        {item.name}
                                    </Text>
                                    <Badge colorScheme={item.color} size="sm">
                                        {item.status}
                                    </Badge>
                                </VStack>
                            ))}
                        </SimpleGrid>
                    </Box>

                    {/* Security Features */}
                    <Box bg="blue.50" p={4} borderRadius="lg">
                        <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={3}>
                            🔒 Security Features
                        </Text>
                        <SimpleGrid columns={4} spacing={3}>
                            {securityFeatures.map((feature, index) => (
                                <HStack key={index} spacing={2} justify="center">
                                    <Box color="blue.600">{feature.icon}</Box>
                                    <Text fontSize="xs" color="blue.700" fontWeight="semibold">
                                        {feature.title}
                                    </Text>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Box>

                    {/* Quick Actions */}
                    <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold">
                                Try Interactive Demo
                            </Text>
                            <Text fontSize="xs">
                                Experience the complete offline payment workflow with real-time simulation
                            </Text>
                        </Box>
                    </Alert>

                    <HStack spacing={3}>
                        <Link href="/offline-payment/interactive-workflow" style={{ flex: 1 }}>
                            <Button
                                leftIcon={<Zap className="h-4 w-4" />}
                                colorScheme="orange"
                                variant="solid"
                                size="sm"
                                w="full"
                            >
                                Interactive Demo
                            </Button>
                        </Link>
                        <Link href="/offline-payment" style={{ flex: 1 }}>
                            <Button
                                leftIcon={<ArrowRight className="h-4 w-4" />}
                                colorScheme="blue"
                                variant="outline"
                                size="sm"
                                w="full"
                            >
                                Learn More
                            </Button>
                        </Link>
                    </HStack>
                </VStack>
            </CardBody>
        </Card>
    )
} 