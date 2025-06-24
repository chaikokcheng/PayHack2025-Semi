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
  SimpleGrid,
} from '@chakra-ui/react'
import { FiZap, FiCamera, FiGrid, FiBarChart, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import { Analytics } from '@/components/Analytics'
import { PaymentTester } from '@/components/PaymentTester'
import { SystemStatus } from '@/components/SystemStatus'
import { QRGenerator } from '@/components/QRGenerator'
import { TransactionFlow } from '@/components/TransactionFlow'
import { Logo } from '@/components/Logo'

function DashboardContent() {
  const bgGradient = useColorModeValue(
    'linear(to-br, pinkpay.50, brand.50, purple.50)',
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
                  PinkPay Payment Switch
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  PayHack2025 • Real-time Payment Orchestration Platform
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="solid">
                LIVE
              </Badge>
              <Badge colorScheme="blue" variant="outline">
                v1.0.0
              </Badge>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Quick Navigation */}
      <Box bg={cardBg} borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <VStack spacing={4}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              🚀 Quick Actions
            </Text>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
              <Link href="/test-flow">
                <Button
                  leftIcon={<FiZap />}
                  colorScheme="pinkpay"
                  variant="solid"
                  size="sm"
                  w="full"
                >
                  Test Complete Flow
                </Button>
              </Link>
              
              <Link href="/qr-generator">
                <Button
                  leftIcon={<FiGrid />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  w="full"
                >
                  QR Generator
                </Button>
              </Link>
              
              <Link href="/scanner">
                <Button
                  leftIcon={<FiCamera />}
                  colorScheme="green"
                  variant="outline"
                  size="sm"
                  w="full"
                >
                  QR Scanner
                </Button>
              </Link>
              
              <Link href="/analytics">
                <Button
                  leftIcon={<FiBarChart />}
                  colorScheme="purple"
                  variant="outline"
                  size="sm"
                  w="full"
                >
                  Analytics
                </Button>
              </Link>
            </SimpleGrid>

            <Box bg="blue.50" p={3} borderRadius="lg" border="1px solid" borderColor="blue.200" w="full">
              <HStack spacing={2} justify="center">
                <Text fontSize="xs" color="blue.700">
                  💡 <strong>New:</strong> Try the complete QR payment flow with cross-wallet routing!
                </Text>
                <Link href="/test-flow">
                  <Button size="xs" colorScheme="blue" variant="solid" rightIcon={<FiArrowRight />}>
                    Test Now
                  </Button>
                </Link>
              </HStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* System Status - Full Width */}
          <GridItem colSpan={12}>
            <SystemStatus />
          </GridItem>

          {/* Analytics - Left Side */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <Analytics />
          </GridItem>

          {/* QR Generator - Right Side */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <QRGenerator />
          </GridItem>

          {/* Transaction Flow Visualization - Full Width */}
          <GridItem colSpan={12}>
            <TransactionFlow />
          </GridItem>

          {/* Payment Tester - Full Width */}
          <GridItem colSpan={12}>
            <PaymentTester />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default function Dashboard() {
  return (
    <NoSSR>
      <DashboardContent />
    </NoSSR>
  )
}
