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
} from '@chakra-ui/react'
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
