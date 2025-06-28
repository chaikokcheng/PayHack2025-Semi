'use client'

import NoSSR from '@/components/NoSSR'
import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Badge,
    useColorModeValue,
    Grid,
    GridItem,
    Button,
    Divider,
} from '@chakra-ui/react'
import { FiArrowLeft, FiBarChart, FiActivity, FiTrendingUp } from 'react-icons/fi'
import Link from 'next/link'
import { Analytics } from '@/components/Analytics'
import { TransactionFlow } from '@/components/TransactionFlow'
import { Logo } from '@/components/Logo'

function AnalyticsPageContent() {
    const bgColor = useColorModeValue('gray.50', 'gray.900')
    const cardBg = useColorModeValue('white', 'gray.800')

    return (
        <Box minH="100vh" bg={bgColor}>
            {/* Header */}
            <Box bg={cardBg} shadow="sm" borderBottom="1px" borderColor="gray.200">
                <Container maxW="7xl" py={4}>
                    <Flex justify="space-between" align="center">
                        <HStack spacing={4}>
                            <Logo />
                            <VStack align="start" spacing={0}>
                                <HStack spacing={2}>
                                    <Text fontSize="2xl">📊</Text>
                                    <Heading size="lg" color="gray.800">
                                        Analytics Dashboard
                                    </Heading>
                                </HStack>
                                <Text color="gray.600" fontSize="sm">
                                    Real-time payment switch monitoring and insights
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack spacing={2}>
                            <Badge colorScheme="green" variant="solid">
                                LIVE DATA
                            </Badge>
                            <Badge colorScheme="blue" variant="outline">
                                v2.0.0
                            </Badge>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Navigation Back */}
            <Box bg={cardBg} borderBottom="1px" borderColor="gray.200">
                <Container maxW="7xl" py={4}>
                    <HStack justify="space-between" align="center">
                        <Link href="/">
                            <Button
                                leftIcon={<FiArrowLeft />}
                                colorScheme="gray"
                                variant="outline"
                                size="sm"
                            >
                                Back to Dashboard
                            </Button>
                        </Link>

                        <HStack spacing={4}>
                            <HStack spacing={2}>
                                <FiActivity size={16} />
                                <Text fontSize="sm" color="gray.600">Real-time Monitoring</Text>
                            </HStack>
                            <HStack spacing={2}>
                                <FiTrendingUp size={16} />
                                <Text fontSize="sm" color="gray.600">Performance Analytics</Text>
                            </HStack>
                            <HStack spacing={2}>
                                <FiBarChart size={16} />
                                <Text fontSize="sm" color="gray.600">Transaction Insights</Text>
                            </HStack>
                        </HStack>
                    </HStack>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxW="7xl" py={8}>
                <VStack spacing={8} align="stretch">
                    {/* Analytics Overview */}
                    <Box>
                        <Heading size="md" color="gray.800" mb={2}>
                            📈 Payment Switch Analytics
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                            Monitor transaction volumes, success rates, and system performance in real-time.
                        </Text>
                    </Box>

                    <Divider />

                    {/* Analytics Component */}
                    <Analytics />

                    <Divider />

                    {/* Transaction Flow Visualization */}
                    <Box>
                        <Heading size="md" color="gray.800" mb={4}>
                            🔄 Transaction Flow Visualization
                        </Heading>
                        <Text color="gray.600" fontSize="sm" mb={6}>
                            Visual representation of payment routing and processing flow.
                        </Text>
                        <TransactionFlow />
                    </Box>

                    {/* Quick Navigation */}
                    <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                                🚀 Quick Navigation
                            </Text>

                            <HStack spacing={4} justify="center" flexWrap="wrap">
                                <Link href="/">
                                    <Button leftIcon={<FiArrowLeft />} variant="outline" size="sm">
                                        Dashboard Home
                                    </Button>
                                </Link>

                                <Link href="/test-flow">
                                    <Button leftIcon={<FiBarChart />} variant="outline" size="sm">
                                        QR Test Flow
                                    </Button>
                                </Link>

                                <Link href="/offline-payment/interactive-workflow">
                                    <Button leftIcon={<FiActivity />} variant="outline" size="sm">
                                        Offline Payment Workflow
                                    </Button>
                                </Link>

                                <Link href="/qr-generator">
                                    <Button leftIcon={<FiTrendingUp />} variant="outline" size="sm">
                                        QR Generator
                                    </Button>
                                </Link>
                            </HStack>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    )
}

export default function AnalyticsPage() {
    return (
        <NoSSR>
            <AnalyticsPageContent />
        </NoSSR>
    )
} 