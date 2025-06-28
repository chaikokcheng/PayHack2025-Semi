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
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'
import { PaymentTester } from '@/components/PaymentTester'
import { QRGenerator } from '@/components/QRGenerator'
import { Logo } from '@/components/Logo'

function OldPageContent() {
    const bgGradient = useColorModeValue(
        'linear(to-br, SatuPay.50, brand.50, purple.50)',
        'linear(to-br, gray.900, gray.800, purple.900)'
    )
    const cardBg = useColorModeValue('white', 'gray.800')

    return (
        <Box minH="100vh" bgGradient={bgGradient}>
            {/* Header */}
            <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
                <Container maxW="7xl" py={4}>
                    <Flex justify="space-between" align="center">
                        <HStack spacing={4}>
                            <Logo />
                            <VStack align="start" spacing={0}>
                                <Heading size="lg" color="gray.800">
                                    SatuPay Payment Switch
                                </Heading>
                                <Text color="gray.600" fontSize="sm">
                                    PayHack2025 • Legacy Components (Temporary)
                                </Text>
                            </VStack>
                        </HStack>
                        <HStack spacing={2}>
                            <Badge colorScheme="yellow" variant="solid">
                                OLD PAGE
                            </Badge>
                            <Badge colorScheme="blue" variant="outline">
                                v1.0.0
                            </Badge>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Navigation Back */}
            <Box bg={cardBg} borderBottom="1px" borderColor="gray.200">
                <Container maxW="7xl" py={4}>
                    <Link href="/">
                        <Button
                            leftIcon={<FiArrowLeft />}
                            colorScheme="gray"
                            variant="outline"
                            size="sm"
                        >
                            Back to Main Dashboard
                        </Button>
                    </Link>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxW="7xl" py={8}>
                <VStack spacing={6} align="stretch">
                    <Box>
                        <Heading size="md" color="gray.800" mb={2}>
                            🛠️ Legacy Testing Components
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                            Payment testing and QR generation components. Analytics have been moved to dedicated <Link href="/analytics" style={{ color: '#3182ce', textDecoration: 'underline' }}>/analytics</Link> page.
                        </Text>
                    </Box>

                    <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                        {/* QR Generator - Left Side */}
                        <GridItem colSpan={{ base: 12, lg: 6 }}>
                            <QRGenerator />
                        </GridItem>

                        {/* Payment Tester - Right Side */}
                        <GridItem colSpan={{ base: 12, lg: 6 }}>
                            <PaymentTester />
                        </GridItem>
                    </Grid>
                </VStack>
            </Container>
        </Box>
    )
}

export default function OldPage() {
    return (
        <NoSSR>
            <OldPageContent />
        </NoSSR>
    )
} 