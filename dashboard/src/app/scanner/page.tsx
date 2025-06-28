'use client'

import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Divider,
  Grid,
  GridItem,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { FiArrowLeft, FiHome, FiGrid, FiBarChart } from 'react-icons/fi'
import Link from 'next/link'
import QRScanner from '../../components/QRScanner'

export default function QRScannerPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="center">
            <HStack spacing={2}>
              <Text fontSize="4xl">📱</Text>
              <Heading size="xl" color="SatuPay.500">
                SatuPay QR Scanner
              </Heading>
            </HStack>
            
            <Text color="gray.600" textAlign="center" maxW="2xl">
              Scan any QR code to process cross-wallet payments instantly. 
              Our payment switch routes between TNG, Boost, GrabPay and more.
            </Text>

            <HStack spacing={4}>
              <Badge colorScheme="green" variant="outline" p={2}>
                Cross-Wallet Compatible
              </Badge>
              <Badge colorScheme="blue" variant="outline" p={2}>
                Real-Time Processing
              </Badge>
              <Badge colorScheme="purple" variant="outline" p={2}>
                Secure Routing
              </Badge>
            </HStack>
          </VStack>

          <Divider />

          {/* Demo Instructions */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>How to Test:</AlertTitle>
              <AlertDescription>
                1. Generate a QR code using our QR Generator<br/>
                2. Use camera to scan or upload the QR image<br/>
                3. Select your wallet type and process payment<br/>
                4. Watch cross-wallet routing in action!
              </AlertDescription>
            </Box>
          </Alert>

          {/* Main Content */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={8}>
            <GridItem>
              <QRScanner />
            </GridItem>

            {/* Side Panel */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Quick Actions */}
                <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" fontWeight="semibold">
                      Quick Actions
                    </Text>
                    
                    <VStack spacing={3}>
                      <Link href="/qr-generator" style={{ width: '100%' }}>
                        <Button
                          leftIcon={<FiGrid />}
                          variant="outline"
                          size="sm"
                          w="full"
                        >
                          Generate QR Code
                        </Button>
                      </Link>
                      
                      <Link href="/" style={{ width: '100%' }}>
                        <Button
                          leftIcon={<FiHome />}
                          variant="outline"
                          size="sm"
                          w="full"
                        >
                          Dashboard Home
                        </Button>
                      </Link>
                      
                      <Link href="/analytics" style={{ width: '100%' }}>
                        <Button
                          leftIcon={<FiBarChart />}
                          variant="outline"
                          size="sm"
                          w="full"
                        >
                          View Analytics
                        </Button>
                      </Link>
                    </VStack>
                  </VStack>
                </Box>

                {/* Supported Wallets */}
                <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" fontWeight="semibold">
                      Supported Wallets
                    </Text>
                    
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">💙 TNG eWallet</Text>
                        <Badge colorScheme="green" variant="subtle" size="sm">
                          Live
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">🚀 Boost</Text>
                        <Badge colorScheme="green" variant="subtle" size="sm">
                          Live
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">🟢 GrabPay</Text>
                        <Badge colorScheme="yellow" variant="subtle" size="sm">
                          Beta
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">🛍️ ShopeePay</Text>
                        <Badge colorScheme="yellow" variant="subtle" size="sm">
                          Beta
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>

                {/* Payment Stats */}
                <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" fontWeight="semibold">
                      Today's Stats
                    </Text>
                    
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">QR Scans:</Text>
                        <Text fontSize="sm" fontWeight="bold">47</Text>
                      </HStack>
                      
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Cross-Wallet:</Text>
                        <Text fontSize="sm" fontWeight="bold">23</Text>
                      </HStack>
                      
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Success Rate:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.500">98.3%</Text>
                      </HStack>
                      
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" color="gray.600">Avg. Time:</Text>
                        <Text fontSize="sm" fontWeight="bold">2.1s</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              </VStack>
            </GridItem>
          </Grid>

          {/* Footer */}
          <Box textAlign="center" pt={8}>
            <Text fontSize="sm" color="gray.500">
              Powered by SatuPay Payment Switch • Secure • Fast • Universal
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
