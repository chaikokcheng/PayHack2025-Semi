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
import { FiZap, FiCamera, FiGrid, FiBarChart, FiArrowRight, FiWifiOff, FiArchive } from 'react-icons/fi'
import Link from 'next/link'
import { SystemStatus } from '@/components/SystemStatus'
import { Logo } from '@/components/Logo'
import { OfflinePaymentFlow } from '@/components/OfflinePaymentFlow'
import { QRPaymentDemo } from '@/components/QRPaymentDemo'

function DashboardContent() {
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
            <SimpleGrid columns={{ base: 2, md: 6 }} spacing={4} w="full">
              <Link href="/offline-payment/interactive-workflow">
                <Button
                  leftIcon={<FiWifiOff />}
                  colorScheme="orange"
                  variant="solid"
                  size="sm"
                  w="full"
                >
                  Offline Payment
                </Button>
              </Link>

              <Link href="/test-flow">
                <Button
                  leftIcon={<FiZap />}
                  colorScheme="SatuPay"
                  variant="solid"
                  size="sm"
                  w="full"
                >
                  QR Payment Flow
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
                  variant="solid"
                  size="sm"
                  w="full"
                >
                  Analytics
                </Button>
              </Link>

              <Link href="/old-page">
                <Button
                  leftIcon={<FiArchive />}
                  colorScheme="gray"
                  variant="outline"
                  size="sm"
                  w="full"
                >
                  Legacy Components
                </Button>
              </Link>
            </SimpleGrid>

            <Box bg="orange.50" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200" w="full">
              <HStack spacing={2} justify="center">
                <Text fontSize="xs" color="orange.700">
                  🔒 <strong>New:</strong> Secure offline payment workflow with device-bound tokens and end-to-end encryption!
                </Text>
                <Link href="/offline-payment/interactive-workflow">
                  <Button size="xs" colorScheme="orange" variant="solid" rightIcon={<FiArrowRight />}>
                    Try Offline Payment
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

          {/* Offline Payment Flow - Full Width */}
          <GridItem colSpan={12}>
            <OfflinePaymentFlow />
          </GridItem>

          {/* QR Payment Flow - Full Width */}
          <GridItem colSpan={12}>
            <QRPaymentDemo />
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
