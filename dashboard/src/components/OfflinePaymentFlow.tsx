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
    Progress,
    Alert,
    AlertIcon,
} from '@chakra-ui/react'
import {
    Key,
    WifiOff,
    Bluetooth,
    ArrowRight,
    CheckCircle,
    Shield,
    Smartphone,
    Database,
    Zap,
    Wifi,
    ArrowLeftRight,
    Building2,
} from 'lucide-react'
import Link from 'next/link'

interface PaymentStep {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    status: 'pending' | 'active' | 'completed'
    device: 'payer' | 'payee' | 'system' | 'network' | 'bank'
}

export function OfflinePaymentFlow() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isDemoActive, setIsDemoActive] = useState(false)
    const [animationData, setAnimationData] = useState('')

    // Original Flow Steps (Before Orchestration)
    const originalPaymentSteps: PaymentStep[] = [
        {
            id: 'token-generate',
            title: 'Generate Token',
            description: 'Create secure offline payment token',
            icon: <Key className="h-5 w-5" />,
            status: 'pending',
            device: 'payer',
        },
        {
            id: 'go-offline',
            title: 'Go Offline',
            description: 'Payer disconnects from network',
            icon: <WifiOff className="h-5 w-5" />,
            status: 'pending',
            device: 'payer',
        },
        {
            id: 'bluetooth-send',
            title: 'Send Payment',
            description: 'Transfer encrypted token via Bluetooth',
            icon: <Bluetooth className="h-5 w-5" />,
            status: 'pending',
            device: 'system',
        },
        {
            id: 'payee-verify',
            title: 'Verify Token',
            description: 'Payee validates token with server',
            icon: <Shield className="h-5 w-5" />,
            status: 'pending',
            device: 'payee',
        },
        {
            id: 'server-authorize',
            title: 'Authorize',
            description: 'Server processes payment transaction',
            icon: <CheckCircle className="h-5 w-5" />,
            status: 'pending',
            device: 'network',
        },
        {
            id: 'result-return',
            title: 'Return Result',
            description: 'Send payment confirmation back',
            icon: <ArrowLeftRight className="h-5 w-5" />,
            status: 'pending',
            device: 'payee',
        },
    ]

    // Orchestration Flow Steps (Current Version)
    const orchestrationPaymentSteps: PaymentStep[] = [
        {
            id: 'token-generate',
            title: 'Generate Token',
            description: 'Create secure offline payment token',
            icon: <Key className="h-5 w-5" />,
            status: 'pending',
            device: 'payer',
        },
        {
            id: 'go-offline',
            title: 'Go Offline',
            description: 'Payer disconnects from network',
            icon: <WifiOff className="h-5 w-5" />,
            status: 'pending',
            device: 'payer',
        },
        {
            id: 'bluetooth-send',
            title: 'Send Payment',
            description: 'Transfer encrypted token via Bluetooth',
            icon: <Bluetooth className="h-5 w-5" />,
            status: 'pending',
            device: 'system',
        },
        {
            id: 'payee-verify',
            title: 'Verify Token',
            description: 'Payee validates with orchestration server',
            icon: <Shield className="h-5 w-5" />,
            status: 'pending',
            device: 'payee',
        },
        {
            id: 'server-authorize',
            title: 'Authorize',
            description: 'Server authorizes and initiates transfer',
            icon: <Zap className="h-5 w-5" />,
            status: 'pending',
            device: 'network',
        },
        {
            id: 'bank-process',
            title: 'Bank Transfer',
            description: 'Financial institutions process funds',
            icon: <Building2 className="h-5 w-5" />,
            status: 'pending',
            device: 'bank',
        },
        {
            id: 'result-return',
            title: 'Return Result',
            description: 'Send payment confirmation back',
            icon: <ArrowLeftRight className="h-5 w-5" />,
            status: 'pending',
            device: 'payee',
        },
    ]

    // Demo animation for original flow
    useEffect(() => {
        if (!isDemoActive) return

        const stepDurations = [2000, 1000, 2500, 2000, 2500, 2000, 1500]
        let finalTimer: NodeJS.Timeout | null = null

        const timer = setTimeout(() => {
            setCurrentStep(prev => {
                const newStep = prev + 1

                // Bounds check
                if (newStep > originalPaymentSteps.length) {
                    setIsDemoActive(false)
                    setAnimationData('')
                    return prev
                }

                // Set animation data based on step
                const animationMap = {
                    1: '🔑 Token',
                    2: '💰 Payment',
                    3: '🔍 Verify Token',
                    4: '⚡ Initiate',
                    5: '💳 Process',
                    6: '📋 Receipt'
                }
                setAnimationData(animationMap[newStep as keyof typeof animationMap] || '')

                // If this is the final step, schedule demo stop
                if (newStep === originalPaymentSteps.length) {
                    finalTimer = setTimeout(() => {
                        setIsDemoActive(false)
                        setAnimationData('')
                    }, 1500)
                }

                return newStep
            })
        }, stepDurations[currentStep] || 2000)

        return () => {
            clearTimeout(timer)
            if (finalTimer) clearTimeout(finalTimer)
        }
    }, [isDemoActive, currentStep, originalPaymentSteps.length])

    const startDemo = () => {
        setCurrentStep(0)
        setAnimationData('')
        setIsDemoActive(true)
    }

    const resetDemo = () => {
        setIsDemoActive(false)
        setCurrentStep(0)
        setAnimationData('')
    }

    const getDeviceColor = (device: string) => {
        switch (device) {
            case 'payer': return 'blue'
            case 'payee': return 'green'
            case 'system': return 'orange'
            case 'network': return 'purple'
            case 'bank': return 'cyan'
            default: return 'gray'
        }
    }

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return 'completed'
        if (stepIndex === currentStep && isDemoActive) return 'active'
        return 'pending'
    }

    return (
        <VStack spacing={8} align="stretch">
            {/* Direct Processing Flow */}
            <Card bg="white" shadow="lg" border="2px solid" borderColor="blue.200">
                <CardHeader bg="blue.50" borderBottom="1px solid" borderColor="blue.200">
                    <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                                <Box p={2} borderRadius="full" bg="blue.100" color="blue.600">
                                    <WifiOff className="h-6 w-6" />
                                </Box>
                                <Heading size="lg" color="gray.800">
                                    Offline Payment Flow
                                </Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                Payee acts as bridge between offline Payer and payment server
                            </Text>
                        </VStack>
                        <VStack align="end" spacing={1}>
                            <Badge colorScheme="blue" variant="solid" fontSize="sm">
                                SATUPAY
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                                SatuPay2025
                            </Text>
                        </VStack>
                    </Flex>
                </CardHeader>

                <CardBody>
                    <VStack spacing={6} align="stretch">
                        {/* Horizontal Device Interaction - Original */}
                        <Box bg="gray.50" p={6} borderRadius="lg">
                            <HStack justify="space-between" align="center" mb={4}>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Direct Payment Processing Flow
                                </Text>
                                <HStack spacing={2}>
                                    <Button size="sm" colorScheme="blue" onClick={startDemo} isDisabled={isDemoActive}>
                                        Start Flow
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={resetDemo}>
                                        Reset
                                    </Button>
                                </HStack>
                            </HStack>

                            {/* Simple Horizontal Flow Visualization */}
                            <Flex justify="space-between" align="center" position="relative" h="140px">
                                {/* Payer Device (Offline) */}
                                <VStack spacing={2}>
                                    <Box
                                        p={4}
                                        borderRadius="full"
                                        bg={currentStep >= 0 && currentStep <= 2 ? "blue.100" : currentStep >= 5 ? "blue.100" : "gray.100"}
                                        color={currentStep >= 0 && currentStep <= 2 ? "blue.600" : currentStep >= 5 ? "blue.600" : "gray.500"}
                                        border="3px solid"
                                        borderColor={currentStep >= 0 && currentStep <= 2 ? "blue.300" : currentStep >= 5 ? "blue.300" : "gray.300"}
                                        transition="all 0.3s"
                                    >
                                        <Smartphone className="h-6 w-6" />
                                    </Box>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                        Payer Device
                                    </Text>
                                    <Badge colorScheme={currentStep <= 1 ? "green" : "red"} size="sm">
                                        {currentStep <= 1 ? 'Online' : 'Offline'}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600" textAlign="center">
                                        {currentStep <= 0 ? 'Generating token' :
                                            currentStep <= 2 ? 'Sending payment' :
                                                currentStep <= 4 ? 'Waiting...' : 'Receives result'}
                                    </Text>
                                </VStack>

                                {/* Animation Arrow 1 (Payer → Payee) */}
                                <Box position="relative" flex={1} mx={4}>
                                    {currentStep === 2 && (
                                        <Box
                                            position="absolute"
                                            top="50%"
                                            left="10%"
                                            transform="translateY(-50%)"
                                            bg="orange.500"
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            maxW="160px"
                                            whiteSpace="nowrap"
                                            animation={isDemoActive ? "slideRight 2s ease-in-out forwards" : "none"}
                                        >
                                            {animationData}
                                        </Box>
                                    )}
                                    {/* Return confirmation (Payee → Payer) */}
                                    {currentStep === 6 && (
                                        <Box
                                            position="absolute"
                                            top="30%"
                                            left="60%"
                                            transform="translateY(-50%)"
                                            bg="green.500"
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            maxW="160px"
                                            whiteSpace="nowrap"
                                            animation={isDemoActive ? "slideLeft 2s ease-in-out forwards" : "none"}
                                        >
                                            {animationData}
                                        </Box>
                                    )}
                                    <VStack spacing={1}>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                        <Bluetooth className="h-4 w-4 text-orange-500" />
                                        <ArrowRight className="h-5 w-5 text-gray-400" style={{ transform: 'rotate(180deg)' }} />
                                    </VStack>
                                </Box>

                                {/* Payee Device (Online) */}
                                <VStack spacing={2}>
                                    <Box
                                        p={4}
                                        borderRadius="full"
                                        bg={currentStep >= 3 ? "green.100" : "gray.100"}
                                        color={currentStep >= 3 ? "green.600" : "gray.500"}
                                        border="3px solid"
                                        borderColor={currentStep >= 3 ? "green.300" : "gray.300"}
                                        transition="all 0.3s"
                                    >
                                        <Smartphone className="h-6 w-6" />
                                    </Box>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                        Payee Device
                                    </Text>
                                    <Badge colorScheme="green" size="sm">
                                        Online
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600" textAlign="center">
                                        {currentStep <= 2 ? 'Waiting for payment' :
                                            currentStep <= 3 ? 'Verifying token' :
                                                currentStep <= 4 ? 'Processing...' : 'Sending result'}
                                    </Text>
                                </VStack>

                                {/* Animation Arrow 2 (Payee → Server) */}
                                <Box position="relative" flex={1} mx={4}>
                                    {currentStep === 3 && (
                                        <Box
                                            position="absolute"
                                            top="50%"
                                            left="10%"
                                            transform="translateY(-50%)"
                                            bg="purple.500"
                                            color="white"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            maxW="160px"
                                            whiteSpace="nowrap"
                                            animation={isDemoActive ? "slideRight 2s ease-in-out forwards" : "none"}
                                        >
                                            {animationData}
                                        </Box>
                                    )}
                                    <VStack spacing={1}>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                        <Wifi className="h-4 w-4 text-green-500" />
                                    </VStack>
                                </Box>

                                {/* Payment Server */}
                                <VStack spacing={2}>
                                    <Box
                                        p={4}
                                        borderRadius="full"
                                        bg={currentStep >= 4 ? "purple.100" : "gray.100"}
                                        color={currentStep >= 4 ? "purple.600" : "gray.500"}
                                        border="3px solid"
                                        borderColor={currentStep >= 4 ? "purple.300" : "gray.300"}
                                        transition="all 0.3s"
                                    >
                                        <Database className="h-6 w-6" />
                                    </Box>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                        Payment Server
                                    </Text>
                                    <Badge colorScheme="purple" size="sm">
                                        {currentStep >= 4 ? 'Processing' : 'Standby'}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600" textAlign="center">
                                        {currentStep <= 3 ? 'Waiting for verification' :
                                            currentStep <= 4 ? 'Processing payment' : 'Transaction complete'}
                                    </Text>
                                </VStack>
                            </Flex>

                            {/* Flow Description */}
                            <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                                <Text fontSize="xs" color="blue.800" textAlign="center">
                                    <strong>Offline Payment Flow:</strong> Payer generates secure token while online, goes offline,
                                    then transfers payment via Bluetooth to online Payee who processes the transaction.
                                </Text>
                            </Box>
                        </Box>

                        {/* Progress Bar */}
                        <Box>
                            <Progress
                                value={(currentStep) / originalPaymentSteps.length * 100}
                                colorScheme="blue"
                                size="sm"
                                borderRadius="full"
                                mb={4}
                            />
                        </Box>

                        {/* Step Cards */}
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={3}>
                            {originalPaymentSteps.map((step, index) => {
                                const status = getStepStatus(index)
                                const isTransferring = isDemoActive && (
                                    (index === 2 && currentStep === 3) || // Bluetooth transfer
                                    (index === 3 && currentStep === 4) || // Payee verify
                                    (index === 4 && currentStep === 5) || // Server authorize
                                    (index === 5 && currentStep === 6)    // Return result
                                )

                                return (
                                    <VStack
                                        key={step.id}
                                        spacing={2}
                                        p={3}
                                        bg={status === 'active' ? `${getDeviceColor(step.device)}.50` : 'gray.50'}
                                        borderRadius="lg"
                                        border="2px solid"
                                        borderColor={
                                            status === 'completed' ? 'green.300' :
                                                status === 'active' ? `${getDeviceColor(step.device)}.300` :
                                                    'gray.200'
                                        }
                                        transition="all 0.3s"
                                        opacity={status === 'pending' ? 0.6 : 1}
                                        transform="scale(1)"
                                        animation="none"
                                        boxShadow={isTransferring ? "0 0 20px rgba(59, 130, 246, 0.5)" : "none"}
                                    >
                                        <Box
                                            p={2}
                                            borderRadius="full"
                                            bg={
                                                status === 'completed' ? 'green.100' :
                                                    status === 'active' ? `${getDeviceColor(step.device)}.100` :
                                                        'gray.200'
                                            }
                                            color={
                                                status === 'completed' ? 'green.600' :
                                                    status === 'active' ? `${getDeviceColor(step.device)}.600` :
                                                        'gray.500'
                                            }
                                            transform="rotateZ(0deg)"
                                            transition="all 0.2s"
                                        >
                                            {status === 'completed' ? <CheckCircle className="h-5 w-5" /> : step.icon}
                                        </Box>
                                        <VStack spacing={1} textAlign="center">
                                            <Text
                                                fontSize="xs"
                                                fontWeight="bold"
                                                color="gray.800"
                                                transform="scale(1)"
                                                transition="all 0.2s"
                                            >
                                                {step.title}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="gray.600"
                                                lineHeight="1.2"
                                                minH="24px"
                                                transform="skewX(0deg)"
                                                transition="all 0.2s"
                                            >
                                                {step.description}
                                            </Text>
                                        </VStack>
                                    </VStack>
                                )
                            })}
                        </SimpleGrid>
                    </VStack>
                </CardBody>
            </Card>

            {/* Multi-Layer Processing Flow */}
            <OrchestrationFlow steps={orchestrationPaymentSteps} />

            {/* Interactive Workflow */}
            <Alert status="info" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={1} flex={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                        Try the interactive workflow
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                        Experience the full offline payment process step-by-step with real user controls
                    </Text>
                </VStack>
                <Link href="/offline-payment/interactive-workflow">
                    <Button size="sm" colorScheme="blue" ml={3}>
                        Launch Interactive Flow
                    </Button>
                </Link>
            </Alert>

            {/* Add keyframes for animations */}
            <style jsx>{`
                @keyframes slideRight {
                    from {
                        left: 0%;
                        opacity: 0;
                    }
                    to {
                        left: 50%;
                        opacity: 1;
                    }
                }
                @keyframes slideLeft {
                    from {
                        left: 60%;
                        opacity: 0;
                    }
                    to {
                        left: 10%;
                        opacity: 1;
                    }
                }
            `}</style>
        </VStack>
    )
}

// Separate component for Orchestration Flow
function OrchestrationFlow({ steps }: { steps: PaymentStep[] }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isDemoActive, setIsDemoActive] = useState(false)
    const [animationData, setAnimationData] = useState('')

    // Demo animation for orchestration flow
    useEffect(() => {
        if (!isDemoActive) return

        const stepDurations = [2000, 1000, 2500, 2000, 2000, 2500, 2000, 1500]
        let finalTimer: NodeJS.Timeout | null = null

        const timer = setTimeout(() => {
            setCurrentStep(prev => {
                const newStep = prev + 1

                // Bounds check
                if (newStep > steps.length) {
                    setIsDemoActive(false)
                    setAnimationData('')
                    return prev
                }

                // Set animation data based on step
                const animationMap = {
                    1: '🔑 Token',
                    2: '💰 Payment',
                    3: '🔍 Verify Token',
                    4: '⚡ Initiate',
                    5: '💳 Process',
                    6: '📋 Receipt',
                    7: '✅ Confirmation'
                }
                setAnimationData(animationMap[newStep as keyof typeof animationMap] || '')

                // If this is the final step, schedule demo stop
                if (newStep === steps.length) {
                    finalTimer = setTimeout(() => {
                        setIsDemoActive(false)
                        setAnimationData('')
                    }, 1500)
                }

                return newStep
            })
        }, stepDurations[currentStep] || 2000)

        return () => {
            clearTimeout(timer)
            if (finalTimer) clearTimeout(finalTimer)
        }
    }, [isDemoActive, currentStep, steps.length])

    const startDemo = () => {
        setCurrentStep(0)
        setAnimationData('')
        setIsDemoActive(true)
    }

    const resetDemo = () => {
        setIsDemoActive(false)
        setCurrentStep(0)
        setAnimationData('')
    }

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return 'completed'
        if (stepIndex === currentStep && isDemoActive) return 'active'
        return 'pending'
    }

    return (
        <Card bg="white" shadow="lg" border="2px solid" borderColor="orange.200">
            <CardHeader bg="orange.50" borderBottom="1px solid" borderColor="orange.200">
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                            <Box p={2} borderRadius="full" bg="orange.100" color="orange.600">
                                <Building2 className="h-6 w-6" />
                            </Box>
                            <Heading size="lg" color="gray.800">
                                Offline Payment Flow
                            </Heading>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            Payee bridges offline Payer with payment orchestration system
                        </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                        <Badge colorScheme="orange" variant="solid" fontSize="sm">
                            SATUPAY
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                            SatuPay2025
                        </Text>
                    </VStack>
                </Flex>
            </CardHeader>

            <CardBody>
                <VStack spacing={6} align="stretch">
                    {/* Horizontal Device Interaction */}
                    <Box bg="gray.50" p={6} borderRadius="lg">
                        <HStack justify="space-between" align="center" mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                Multi-Layer Payment Processing Flow
                            </Text>
                            <HStack spacing={2}>
                                <Button size="sm" colorScheme="orange" onClick={startDemo} isDisabled={isDemoActive}>
                                    Start Flow
                                </Button>
                                <Button size="sm" variant="outline" onClick={resetDemo}>
                                    Reset
                                </Button>
                            </HStack>
                        </HStack>

                        {/* Single Row Flow Visualization */}
                        <Flex justify="space-between" align="center" position="relative" h="140px">
                            {/* Payer Device (Offline) */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 0 && currentStep <= 2 ? "blue.100" : currentStep >= 6 ? "blue.100" : "gray.100"}
                                    color={currentStep >= 0 && currentStep <= 2 ? "blue.600" : currentStep >= 6 ? "blue.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 0 && currentStep <= 2 ? "blue.300" : currentStep >= 6 ? "blue.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <Smartphone className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Payer Device
                                </Text>
                                <Badge colorScheme={currentStep <= 1 ? "green" : "red"} size="sm">
                                    {currentStep <= 1 ? 'Online' : 'Offline'}
                                </Badge>
                                <Text fontSize="xs" color="gray.600" textAlign="center">
                                    {currentStep <= 0 ? 'Generating token' :
                                        currentStep <= 2 ? 'Sending payment' :
                                            currentStep <= 5 ? 'Waiting...' : 'Receives result'}
                                </Text>
                            </VStack>

                            {/* Animation Arrow 1 (Payer → Payee) */}
                            <Box position="relative" flex={1} mx={4}>
                                {currentStep === 2 && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="10%"
                                        transform="translateY(-50%)"
                                        bg="orange.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        maxW="160px"
                                        whiteSpace="nowrap"
                                        animation={isDemoActive ? "slideRight 2s ease-in-out forwards" : "none"}
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                {/* Return confirmation (Payee → Payer) */}
                                {currentStep === 7 && (
                                    <Box
                                        position="absolute"
                                        top="30%"
                                        left="60%"
                                        transform="translateY(-50%)"
                                        bg="green.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        maxW="120px"
                                        whiteSpace="nowrap"
                                        animation={isDemoActive ? "slideLeft 2s ease-in-out forwards" : "none"}
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                <VStack spacing={1}>
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                    <Bluetooth className="h-4 w-4 text-orange-500" />
                                    <ArrowRight className="h-5 w-5 text-gray-400" style={{ transform: 'rotate(180deg)' }} />
                                </VStack>
                            </Box>

                            {/* Payee Device (Online) */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 3 ? "green.100" : "gray.100"}
                                    color={currentStep >= 3 ? "green.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 3 ? "green.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <Smartphone className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Payee Device
                                </Text>
                                <Badge colorScheme="green" size="sm">
                                    Online
                                </Badge>
                                <Text fontSize="xs" color="gray.600" textAlign="center">
                                    {currentStep <= 2 ? 'Waiting for payment' :
                                        currentStep <= 3 ? 'Verifying token' :
                                            currentStep <= 5 ? 'Processing...' : 'Sending result'}
                                </Text>
                            </VStack>

                            {/* Animation Arrow 2 (Payee → Server) */}
                            <Box position="relative" flex={1} mx={4}>
                                {currentStep === 3 && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="10%"
                                        transform="translateY(-50%)"
                                        bg="purple.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        maxW="120px"
                                        whiteSpace="nowrap"
                                        animation={isDemoActive ? "slideRight 2s ease-in-out forwards" : "none"}
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                {/* Receipt return (Server → Payee) */}
                                {currentStep === 6 && (
                                    <Box
                                        position="absolute"
                                        top="30%"
                                        left="60%"
                                        transform="translateY(-50%)"
                                        bg="green.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        maxW="120px"
                                        whiteSpace="nowrap"
                                        animation={isDemoActive ? "slideLeft 2s ease-in-out forwards" : "none"}
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                <VStack spacing={1}>
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                    <Wifi className="h-4 w-4 text-green-500" />
                                </VStack>
                            </Box>

                            {/* Orchestration Server */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 4 ? "purple.100" : "gray.100"}
                                    color={currentStep >= 4 ? "purple.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 4 ? "purple.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <Database className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    SatuPay Server
                                </Text>
                                <Badge colorScheme="purple" size="sm">
                                    Orchestration
                                </Badge>
                                <Text fontSize="xs" color="gray.600" textAlign="center">
                                    {currentStep <= 3 ? 'Waiting for verification' :
                                        currentStep <= 4 ? 'Authorizing payment' :
                                            currentStep <= 5 ? 'Sending to banks' : 'Transaction complete'}
                                </Text>
                            </VStack>

                            {/* Animation Arrow 3 (Server ↔ Banks) */}
                            <Box position="relative" flex={1} mx={4}>
                                {currentStep === 4 && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="10%"
                                        transform="translateY(-50%)"
                                        bg="cyan.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        maxW="120px"
                                        whiteSpace="nowrap"
                                        animation={isDemoActive ? "slideRight 2s ease-in-out forwards" : "none"}
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                {/* Payment processing return (Banks → Server) */}
                                {currentStep === 5 && (
                                    <Box
                                        position="absolute"
                                        top="30%"
                                        left="60%"
                                        transform="translateY(-50%)"
                                        bg="blue.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        maxW="120px"
                                        whiteSpace="nowrap"
                                        animation={isDemoActive ? "slideLeft 2s ease-in-out forwards" : "none"}
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                <VStack spacing={1}>
                                    <ArrowRight className="h-5 w-5 text-gray-400" />
                                    <Wifi className="h-4 w-4 text-purple-500" />
                                </VStack>
                            </Box>

                            {/* Financial Institutions */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 5 ? "cyan.100" : "gray.100"}
                                    color={currentStep >= 5 ? "cyan.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 5 ? "cyan.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <Building2 className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Banks/E-wallets
                                </Text>
                                <Badge colorScheme="cyan" size="sm">
                                    Fund Holders
                                </Badge>
                                <Text fontSize="xs" color="gray.600" textAlign="center">
                                    {currentStep <= 4 ? 'Waiting for request' :
                                        currentStep <= 5 ? 'Processing funds' : 'Transfer complete'}
                                </Text>
                            </VStack>
                        </Flex>

                        {/* Flow Description */}
                        <Box mt={4} p={3} bg="orange.50" borderRadius="md">
                            <Text fontSize="xs" color="orange.800" textAlign="center">
                                <strong>Offline Payment Flow:</strong> Payer generates secure token while online, goes offline,
                                then transfers payment via Bluetooth to online Payee who processes the transaction.
                            </Text>
                        </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box>
                        <Progress
                            value={(currentStep) / steps.length * 100}
                            colorScheme="orange"
                            size="sm"
                            borderRadius="full"
                            mb={4}
                        />
                    </Box>

                    {/* Step Cards */}
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 7 }} spacing={3}>
                        {steps.map((step, index) => {
                            const status = getStepStatus(index)
                            const getDeviceColor = (device: string) => {
                                switch (device) {
                                    case 'payer': return 'blue'
                                    case 'payee': return 'green'
                                    case 'system': return 'orange'
                                    case 'network': return 'purple'
                                    case 'bank': return 'cyan'
                                    default: return 'gray'
                                }
                            }

                            const isTransferring = isDemoActive && (
                                (index === 2 && currentStep === 3) || // Bluetooth transfer
                                (index === 3 && currentStep === 4) || // Payee verify
                                (index === 4 && currentStep === 5) || // Server authorize
                                (index === 5 && currentStep === 6) || // Bank process
                                (index === 6 && currentStep === 7)    // Return result
                            )

                            return (
                                <VStack
                                    key={step.id}
                                    spacing={2}
                                    p={3}
                                    bg={status === 'active' ? `${getDeviceColor(step.device)}.50` : 'gray.50'}
                                    borderRadius="lg"
                                    border="2px solid"
                                    borderColor={
                                        status === 'completed' ? 'green.300' :
                                            status === 'active' ? `${getDeviceColor(step.device)}.300` :
                                                'gray.200'
                                    }
                                    transition="all 0.3s"
                                    opacity={status === 'pending' ? 0.6 : 1}
                                    transform="scale(1)"
                                    animation="none"
                                    boxShadow={isTransferring ? "0 0 20px rgba(168, 85, 247, 0.5)" : "none"}
                                >
                                    <Box
                                        p={2}
                                        borderRadius="full"
                                        bg={
                                            status === 'completed' ? 'green.100' :
                                                status === 'active' ? `${getDeviceColor(step.device)}.100` :
                                                    'gray.200'
                                        }
                                        color={
                                            status === 'completed' ? 'green.600' :
                                                status === 'active' ? `${getDeviceColor(step.device)}.600` :
                                                    'gray.500'
                                        }
                                        transform="rotateZ(0deg)"
                                        transition="all 0.2s"
                                    >
                                        {status === 'completed' ? <CheckCircle className="h-5 w-5" /> : step.icon}
                                    </Box>
                                    <VStack spacing={1} textAlign="center">
                                        <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="gray.800"
                                            transform="scale(1)"
                                            transition="all 0.2s"
                                        >
                                            {step.title}
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color="gray.600"
                                            lineHeight="1.2"
                                            minH="24px"
                                            transform="skewX(0deg)"
                                            transition="all 0.2s"
                                        >
                                            {step.description}
                                        </Text>
                                    </VStack>
                                </VStack>
                            )
                        })}
                    </SimpleGrid>
                </VStack>
            </CardBody>
        </Card>
    )
} 