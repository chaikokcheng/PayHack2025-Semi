'use client'

import React, { useState } from 'react'
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
    Icon,
    SimpleGrid,
    Alert,
    AlertIcon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    List,
    ListItem,
    ListIcon,
} from '@chakra-ui/react'
import {
    Zap,
    Coffee,
    Store,
    AlertTriangle,
    Play,
    Info,
    CheckCircle,
    ArrowRight,
    Clock,
    DollarSign,
    Smartphone,
} from 'lucide-react'
import Link from 'next/link'

interface DemoScenario {
    id: string
    title: string
    description: string
    amount: number
    icon: React.ReactNode
    color: string
    setup: {
        payerBalance: number
        payeeBalance: number
        payerId: string
        payeeId: string
    }
}

const demoScenarios: DemoScenario[] = [
    {
        id: 'coffee-shop',
        title: 'Coffee Shop Payment',
        description: 'Quick payment for your morning coffee',
        amount: 15,
        icon: <Coffee className="h-5 w-5" />,
        color: 'orange',
        setup: {
            payerBalance: 100,
            payeeBalance: 50,
            payerId: '9d4afd74-0dfc-4b33-9903-470171a72b29',
            payeeId: 'bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9',
        },
    },
    {
        id: 'street-vendor',
        title: 'Street Vendor Payment',
        description: 'Small payment to a local vendor',
        amount: 5,
        icon: <Store className="h-5 w-5" />,
        color: 'green',
        setup: {
            payerBalance: 50,
            payeeBalance: 25,
            payerId: '9d4afd74-0dfc-4b33-9903-470171a72b29',
            payeeId: 'bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9',
        },
    },
    {
        id: 'emergency',
        title: 'Emergency Payment',
        description: 'Urgent payment when network is down',
        amount: 50,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'red',
        setup: {
            payerBalance: 200,
            payeeBalance: 10,
            payerId: '9d4afd74-0dfc-4b33-9903-470171a72b29',
            payeeId: 'bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9',
        },
    },
]

const guidedTourSteps = [
    {
        title: 'Welcome to Offline Payments',
        description: 'Learn how to make secure payments without internet connection',
        icon: <Smartphone className="h-6 w-6" />,
    },
    {
        title: 'Generate Secure Token',
        description: 'Create a device-bound token when you have internet',
        icon: <DollarSign className="h-6 w-6" />,
    },
    {
        title: 'Go Offline',
        description: 'Disconnect from network and use your stored token',
        icon: <Clock className="h-6 w-6" />,
    },
    {
        title: 'Send Payment',
        description: 'Transmit payment via Bluetooth or QR code',
        icon: <Zap className="h-6 w-6" />,
    },
    {
        title: 'Sync Later',
        description: 'Update the backend when you\'re back online',
        icon: <CheckCircle className="h-6 w-6" />,
    },
]

export function QuickStartDemo() {
    const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    const startScenario = (scenario: DemoScenario) => {
        setSelectedScenario(scenario)
        onOpen()
    }

    const launchInteractiveDemo = () => {
        // Navigate to interactive demo with scenario data
        const params = new URLSearchParams({
            scenario: selectedScenario?.id || 'coffee-shop',
            amount: selectedScenario?.amount.toString() || '15',
            payerId: selectedScenario?.setup.payerId || '',
            payeeId: selectedScenario?.setup.payeeId || '',
        })
        window.open(`/offline-payment/interactive-workflow?${params}`, '_blank')
        onClose()
    }

    return (
        <>
            <Card bg="white" shadow="sm" border="1px solid" borderColor="gray.200">
                <CardHeader>
                    <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                                <Icon as={Zap} color="green.500" />
                                <Heading size="md" color="gray.800">
                                    Quick Start
                                </Heading>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                                Choose a scenario and start the offline payment demo instantly
                            </Text>
                        </VStack>
                        <Badge colorScheme="green" variant="solid" fontSize="sm">
                            EASY START
                        </Badge>
                    </Flex>
                </CardHeader>

                <CardBody>
                    <VStack spacing={6} align="stretch">
                        {/* Demo Scenarios */}
                        <Box>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                                🎯 Choose a Demo Scenario
                            </Text>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                {demoScenarios.map((scenario) => (
                                    <Box
                                        key={scenario.id}
                                        p={4}
                                        border="1px solid"
                                        borderColor="gray.200"
                                        borderRadius="lg"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        _hover={{
                                            borderColor: `${scenario.color}.300`,
                                            bg: `${scenario.color}.50`,
                                        }}
                                        onClick={() => startScenario(scenario)}
                                    >
                                        <VStack spacing={3} align="start">
                                            <HStack spacing={2}>
                                                <Box
                                                    p={2}
                                                    borderRadius="full"
                                                    bg={`${scenario.color}.100`}
                                                    color={`${scenario.color}.600`}
                                                >
                                                    {scenario.icon}
                                                </Box>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                                        {scenario.title}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        RM{scenario.amount}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.600">
                                                {scenario.description}
                                            </Text>
                                            <Button
                                                size="xs"
                                                colorScheme={scenario.color}
                                                variant="outline"
                                                rightIcon={<ArrowRight className="h-3 w-3" />}
                                                w="full"
                                            >
                                                Start
                                            </Button>
                                        </VStack>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>

                        {/* Guided Tour */}
                        <Box bg="blue.50" p={4} borderRadius="lg">
                            <VStack spacing={4} align="stretch">
                                <HStack spacing={2}>
                                    <Icon as={Info} color="blue.500" />
                                    <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                                        Guided Tour Available
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="blue.600">
                                    New to offline payments? Take our guided tour to learn the basics step by step.
                                </Text>
                                <List spacing={2}>
                                    {guidedTourSteps.map((step, index) => (
                                        <ListItem key={index}>
                                            <HStack spacing={2}>
                                                <ListIcon as={CheckCircle} color="blue.500" />
                                                <Text fontSize="xs" color="blue.700">
                                                    {step.title}
                                                </Text>
                                            </HStack>
                                        </ListItem>
                                    ))}
                                </List>
                                <Link href="/offline-payment/interactive-workflow?tour=true">
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        variant="solid"
                                        leftIcon={<Play className="h-4 w-4" />}
                                        w="full"
                                    >
                                        Start Guided Tour
                                    </Button>
                                </Link>
                            </VStack>
                        </Box>

                        {/* Quick Tips */}
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold">
                                    Pro Tips
                                </Text>
                                <Text fontSize="xs">
                                    • Each scenario demonstrates different use cases and amounts
                                    <br />
                                    • The demo uses real backend APIs for authentic experience
                                    <br />
                                    • You can modify amounts and user IDs in the interactive demo
                                </Text>
                            </Box>
                        </Alert>
                    </VStack>
                </CardBody>
            </Card>

            {/* Scenario Launch Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Launch Demo Scenario</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedScenario && (
                            <VStack spacing={4} align="stretch">
                                <Box p={4} bg={`${selectedScenario.color}.50`} borderRadius="lg">
                                    <HStack spacing={3}>
                                        <Box
                                            p={2}
                                            borderRadius="full"
                                            bg={`${selectedScenario.color}.100`}
                                            color={`${selectedScenario.color}.600`}
                                        >
                                            {selectedScenario.icon}
                                        </Box>
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                                {selectedScenario.title}
                                            </Text>
                                            <Text fontSize="sm" color="gray.600">
                                                {selectedScenario.description}
                                            </Text>
                                            <Badge colorScheme={selectedScenario.color} variant="solid">
                                                RM{selectedScenario.amount}
                                            </Badge>
                                        </VStack>
                                    </HStack>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                                        Demo Setup
                                    </Text>
                                    <SimpleGrid columns={2} spacing={3}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Payer Balance</Text>
                                            <Text fontSize="sm" fontWeight="semibold">
                                                RM{selectedScenario.setup.payerBalance}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">Payee Balance</Text>
                                            <Text fontSize="sm" fontWeight="semibold">
                                                RM{selectedScenario.setup.payeeBalance}
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                <VStack spacing={3}>
                                    <Button
                                        colorScheme={selectedScenario.color}
                                        variant="solid"
                                        leftIcon={<Play className="h-4 w-4" />}
                                        onClick={launchInteractiveDemo}
                                        w="full"
                                    >
                                        Launch Interactive Demo
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        w="full"
                                    >
                                        Cancel
                                    </Button>
                                </VStack>
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
} 