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
    Progress,
    Icon,
    useToast,
    Alert,
    AlertIcon,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
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
} from 'lucide-react'
import Link from 'next/link'

interface OfflineStats {
    totalTransactions: number
    activeTokens: number
    successRate: number
    averageAmount: number
}

export function OfflinePaymentPreview() {
    const [stats, setStats] = useState<OfflineStats>({
        totalTransactions: 0,
        activeTokens: 0,
        successRate: 0,
        averageAmount: 0,
    })
    const [isOnline, setIsOnline] = useState(true)
    const [demoStep, setDemoStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    // Simulate offline payment stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/offline-demo/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                } else {
                    // Fallback demo stats
                    setStats({
                        totalTransactions: 156,
                        activeTokens: 23,
                        successRate: 98.7,
                        averageAmount: 45.50,
                    })
                }
            } catch (error) {
                // Fallback demo stats
                setStats({
                    totalTransactions: 156,
                    activeTokens: 23,
                    successRate: 98.7,
                    averageAmount: 45.50,
                })
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
        return () => clearInterval(interval)
    }, [])

    // Demo animation
    useEffect(() => {
        const interval = setInterval(() => {
            setDemoStep(prev => (prev + 1) % 4)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const demoSteps = [
        {
            icon: <Key className="h-6 w-6" />,
            title: 'Generate Token',
            description: 'Secure offline token created',
            color: 'blue',
        },
        {
            icon: <WifiOff className="h-6 w-6" />,
            title: 'Go Offline',
            description: 'Device disconnected from network',
            color: 'orange',
        },
        {
            icon: <Bluetooth className="h-6 w-6" />,
            title: 'Send Payment',
            description: 'Payment transmitted via Bluetooth',
            color: 'purple',
        },
        {
            icon: <CheckCircle className="h-6 w-6" />,
            title: 'Sync Complete',
            description: 'Transaction synced to backend',
            color: 'green',
        },
    ]

    const features = [
        {
            icon: <Shield className="h-5 w-5" />,
            title: 'Device-Bound Security',
            description: 'Tokens locked to specific devices',
        },
        {
            icon: <Zap className="h-5 w-5" />,
            title: 'Instant Transfer',
            description: 'Real-time peer-to-peer payments',
        },
        {
            icon: <Smartphone className="h-5 w-5" />,
            title: 'Offline Capable',
            description: 'Works without internet connection',
        },
        {
            icon: <Clock className="h-5 w-5" />,
            title: 'Time-Limited',
            description: 'Automatic expiration for security',
        },
    ]

    return (
        <Card bg="white" shadow="sm" border="1px solid" borderColor="gray.200">
            <CardHeader>
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                            <Icon as={WifiOff} color="orange.500" />
                            <Heading size="md" color="gray.800">
                                Offline Payment System
                            </Heading>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            Secure peer-to-peer payments without internet
                        </Text>
                    </VStack>
                    <Badge colorScheme="orange" variant="solid" fontSize="sm">
                        LIVE
                    </Badge>
                </Flex>
            </CardHeader>

            <CardBody>
                <VStack spacing={6} align="stretch">
                    {/* LIVE Animation */}
                    <Box bg="gray.50" p={4} borderRadius="lg">
                        <VStack spacing={3}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                🎬 LIVE Flow
                            </Text>
                            <HStack spacing={4} justify="center">
                                {demoSteps.map((step, index) => (
                                    <VStack
                                        key={index}
                                        spacing={2}
                                        opacity={demoStep === index ? 1 : 0.6}
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
                                        <VStack spacing={0} align="center">
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                                {step.title}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                                {step.description}
                                            </Text>
                                        </VStack>
                                    </VStack>
                                ))}
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Statistics */}
                    <SimpleGrid columns={4} spacing={4}>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">
                                Total Transactions
                            </StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">
                                {stats.totalTransactions}
                            </StatNumber>
                            <StatHelpText fontSize="xs" color="green.500">
                                +12% this week
                            </StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">
                                Active Tokens
                            </StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">
                                {stats.activeTokens}
                            </StatNumber>
                            <StatHelpText fontSize="xs" color="blue.500">
                                Currently active
                            </StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">
                                Success Rate
                            </StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">
                                {stats.successRate}%
                            </StatNumber>
                            <StatHelpText fontSize="xs" color="green.500">
                                Excellent reliability
                            </StatHelpText>
                        </Stat>
                        <Stat>
                            <StatLabel fontSize="xs" color="gray.600">
                                Avg Amount
                            </StatLabel>
                            <StatNumber fontSize="lg" color="gray.800">
                                RM{stats.averageAmount}
                            </StatNumber>
                            <StatHelpText fontSize="xs" color="purple.500">
                                Per transaction
                            </StatHelpText>
                        </Stat>
                    </SimpleGrid>

                    {/* Features */}
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                            🔒 Security Features
                        </Text>
                        <SimpleGrid columns={2} spacing={3}>
                            {features.map((feature, index) => (
                                <HStack key={index} spacing={3} p={2} bg="gray.50" borderRadius="md">
                                    <Box color="blue.500">{feature.icon}</Box>
                                    <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.700">
                                            {feature.title}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                            {feature.description}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Box>

                    {/* Quick Actions */}
                    <VStack spacing={3}>
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold">
                                    Try the Interactive Demo
                                </Text>
                                <Text fontSize="xs">
                                    Experience the complete offline payment workflow with real-time simulation
                                </Text>
                            </Box>
                        </Alert>

                        <HStack spacing={3} w="full">
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
                </VStack>
            </CardBody>
        </Card>
    )
} 