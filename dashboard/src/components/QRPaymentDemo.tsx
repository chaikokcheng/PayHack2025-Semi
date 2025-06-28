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
    QrCode,
    Smartphone,
    ArrowRight,
    CheckCircle,
    DollarSign,
    Zap,
    Shield,
    Smartphone as PhoneIcon,
    CreditCard,
    Database,
} from 'lucide-react'

interface PaymentStep {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    status: 'pending' | 'active' | 'completed'
    device: 'merchant' | 'customer' | 'pinkpay' | 'boost'
    duration?: string
}

export function QRPaymentDemo() {
    const [currentStep, setCurrentStep] = useState(0)
    const [isDemoActive, setIsDemoActive] = useState(false)
    const [animationData, setAnimationData] = useState('')

    const paymentSteps: PaymentStep[] = [
        {
            id: 'qr-display',
            title: 'Merchant Shows QR',
            description: 'TNG QR code displayed for customer',
            icon: <QrCode className="h-5 w-5" />,
            status: 'pending',
            device: 'merchant',
        },
        {
            id: 'qr-scan',
            title: 'Customer Scans QR',
            description: 'Customer scans with Boost app',
            icon: <Smartphone className="h-5 w-5" />,
            status: 'pending',
            device: 'customer',
        },
        {
            id: 'pinkpay-routing',
            title: 'PinkPay Routes',
            description: 'Smart routing to customer\'s Boost wallet',
            icon: <Zap className="h-5 w-5" />,
            status: 'pending',
            device: 'pinkpay',
        },
        {
            id: 'boost-auth',
            title: 'Boost Authorization',
            description: 'Customer authorizes in Boost app',
            icon: <Shield className="h-5 w-5" />,
            status: 'pending',
            device: 'boost',
        },
        {
            id: 'settlement',
            title: 'Funds Transfer',
            description: 'Money moves between wallets',
            icon: <DollarSign className="h-5 w-5" />,
            status: 'pending',
            device: 'pinkpay',
        },
        {
            id: 'confirmation',
            title: 'Payment Confirmed',
            description: 'Both parties receive confirmation',
            icon: <CheckCircle className="h-5 w-5" />,
            status: 'pending',
            device: 'merchant',
        },
    ]

    // Demo animation
    useEffect(() => {
        if (!isDemoActive) return

        const stepDurations = [1500, 2000, 1000, 3000, 2000, 1000]

        const timer = setTimeout(() => {
            setCurrentStep(prev => {
                const newStep = prev + 1
                if (newStep < paymentSteps.length) {
                    // Set animation data based on step
                    switch (newStep) {
                        case 1: setAnimationData('📱 QR Code'); break
                        case 2: setAnimationData('💳 Payment Request'); break
                        case 3: setAnimationData('🔀 Routing'); break
                        case 4: setAnimationData('🔐 Authorization'); break
                        case 5: setAnimationData('💰 Funds'); break
                        case 6: setAnimationData('✅ Confirmation'); break
                        default: setAnimationData(''); break
                    }
                    return newStep
                } else {
                    // Stop demo
                    setIsDemoActive(false)
                    setAnimationData('')
                    return prev
                }
            })
        }, stepDurations[currentStep] || 2000)

        return () => clearTimeout(timer)
    }, [isDemoActive, currentStep, paymentSteps.length])

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
            case 'merchant': return 'purple'
            case 'customer': return 'blue'
            case 'pinkpay': return 'orange'
            case 'boost': return 'green'
            default: return 'gray'
        }
    }

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return 'completed'
        if (stepIndex === currentStep && isDemoActive) return 'active'
        return 'pending'
    }

    return (
        <Card bg="white" shadow="lg" border="2px solid" borderColor="blue.200">
            <CardHeader bg="blue.50" borderBottom="1px solid" borderColor="blue.200">
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                            <Box p={2} borderRadius="full" bg="blue.100" color="blue.600">
                                <QrCode className="h-6 w-6" />
                            </Box>
                            <Heading size="lg" color="gray.800">
                                QR Payment Flow Demo
                            </Heading>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                            Interactive demonstration of TNG → PinkPay → Boost cross-wallet payment orchestration
                        </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                        <Badge colorScheme="blue" variant="solid" fontSize="sm">
                            LIVE DEMO
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                            PayHack2025
                        </Text>
                    </VStack>
                </Flex>
            </CardHeader>

            <CardBody>
                <VStack spacing={6} align="stretch">
                    {/* Horizontal Wallet Interaction */}
                    <Box bg="gray.50" p={6} borderRadius="lg">
                        <HStack justify="space-between" align="center" mb={4}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                Cross-Wallet Payment Flow
                            </Text>
                            <HStack spacing={2}>
                                <Button size="sm" colorScheme="blue" onClick={startDemo} isDisabled={isDemoActive}>
                                    Start Demo
                                </Button>
                                <Button size="sm" variant="outline" onClick={resetDemo}>
                                    Reset
                                </Button>
                            </HStack>
                        </HStack>

                        {/* Horizontal Flow Visualization */}
                        <Flex justify="space-between" align="center" position="relative" h="120px">
                            {/* Merchant TNG */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 0 && currentStep <= 1 ? "purple.100" : currentStep >= 5 ? "purple.100" : "gray.100"}
                                    color={currentStep >= 0 && currentStep <= 1 ? "purple.600" : currentStep >= 5 ? "purple.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 0 && currentStep <= 1 ? "purple.300" : currentStep >= 5 ? "purple.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <CreditCard className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Merchant TNG
                                </Text>
                                <Badge colorScheme="purple" size="sm">
                                    {currentStep === 0 ? 'Displaying QR' : currentStep >= 5 ? 'Receiving' : 'Waiting'}
                                </Badge>
                            </VStack>

                            {/* Animation Arrow 1 */}
                            <Box position="relative" flex={1} mx={4}>
                                {currentStep >= 1 && currentStep <= 2 && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="20%"
                                        transform="translateY(-50%)"
                                        bg="blue.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                            </Box>

                            {/* Customer Boost */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 1 && currentStep <= 3 ? "blue.100" : "gray.100"}
                                    color={currentStep >= 1 && currentStep <= 3 ? "blue.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 1 && currentStep <= 3 ? "blue.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <PhoneIcon className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Customer Boost
                                </Text>
                                <Badge colorScheme="blue" size="sm">
                                    {currentStep <= 0 ? 'Ready' : currentStep <= 2 ? 'Scanning' : currentStep <= 3 ? 'Authorizing' : 'Paying'}
                                </Badge>
                            </VStack>

                            {/* Animation Arrow 2 */}
                            <Box position="relative" flex={1} mx={4}>
                                {currentStep >= 2 && currentStep <= 4 && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="20%"
                                        transform="translateY(-50%)"
                                        bg="orange.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                            </Box>

                            {/* PinkPay Router */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 2 && currentStep <= 4 ? "orange.100" : "gray.100"}
                                    color={currentStep >= 2 && currentStep <= 4 ? "orange.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 2 && currentStep <= 4 ? "orange.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <Zap className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    PinkPay Router
                                </Text>
                                <Badge colorScheme="orange" size="sm">
                                    {currentStep <= 1 ? 'Standby' : currentStep <= 2 ? 'Routing' : currentStep <= 4 ? 'Processing' : 'Settling'}
                                </Badge>
                            </VStack>

                            {/* Animation Arrow 3 */}
                            <Box position="relative" flex={1} mx={4}>
                                {currentStep >= 4 && (
                                    <Box
                                        position="absolute"
                                        top="50%"
                                        left="20%"
                                        transform="translateY(-50%)"
                                        bg="green.500"
                                        color="white"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {animationData}
                                    </Box>
                                )}
                                <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                            </Box>

                            {/* Settlement System */}
                            <VStack spacing={2}>
                                <Box
                                    p={4}
                                    borderRadius="full"
                                    bg={currentStep >= 4 ? "green.100" : "gray.100"}
                                    color={currentStep >= 4 ? "green.600" : "gray.500"}
                                    border="3px solid"
                                    borderColor={currentStep >= 4 ? "green.300" : "gray.300"}
                                    transition="all 0.3s"
                                >
                                    <Database className="h-6 w-6" />
                                </Box>
                                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                                    Settlement
                                </Text>
                                <Badge colorScheme="green" size="sm">
                                    {currentStep <= 3 ? 'Waiting' : currentStep <= 4 ? 'Authorizing' : currentStep <= 5 ? 'Transferring' : 'Complete'}
                                </Badge>
                            </VStack>
                        </Flex>
                    </Box>

                    {/* Progress Bar */}
                    <Box>
                        <Progress
                            value={(currentStep) / paymentSteps.length * 100}
                            colorScheme="blue"
                            size="sm"
                            borderRadius="full"
                            mb={4}
                        />
                    </Box>

                    {/* Step Cards */}
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={3}>
                        {paymentSteps.map((step, index) => {
                            const status = getStepStatus(index)
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
                                    transform={status === 'active' ? 'scale(1.05)' : 'scale(1)'}
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
                                    >
                                        {status === 'completed' ? <CheckCircle className="h-5 w-5" /> : step.icon}
                                    </Box>
                                    <VStack spacing={1} textAlign="center">
                                        <Text fontSize="xs" fontWeight="bold" color="gray.800">
                                            {step.title}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                            {step.description}
                                        </Text>
                                    </VStack>
                                </VStack>
                            )
                        })}
                    </SimpleGrid>

                    {/* Call to Action */}
                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize="sm" fontWeight="semibold">
                                Want to try the QR test flow?
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Experience the full QR payment process with real user interactions
                            </Text>
                        </VStack>
                        <Box ml={3}>
                            <Button as="a" href="/test-flow" size="sm" colorScheme="blue">
                                Try QR Test Flow
                            </Button>
                        </Box>
                    </Alert>
                </VStack>
            </CardBody>
        </Card>
    )
} 