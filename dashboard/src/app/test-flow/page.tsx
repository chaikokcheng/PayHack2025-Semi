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
  Step,
  StepDescription,
  StepIndicator,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react'
import { FiArrowRight, FiHome, FiGrid, FiCamera, FiCheckCircle } from 'react-icons/fi'
import Link from 'next/link'
import { QRGenerator } from '../../components/QRGenerator'
import QRScanner from '../../components/QRScanner'

const steps = [
  { title: 'Generate QR', description: 'Create a payment QR code' },
  { title: 'Scan QR', description: 'Scan with camera or upload' },
  { title: 'Confirm Payment', description: 'Review and confirm' },
  { title: 'Complete', description: 'Payment processed' },
]

export default function TestFlowPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const { activeStep } = useSteps({
    index: 0,
    count: steps.length,
  })

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="center">
            <HStack spacing={2}>
              <Text fontSize="4xl">🔄</Text>
              <Heading size="xl" color="pinkpay.500">
                PinkPay QR Test Flow
              </Heading>
            </HStack>
            
            <Text color="gray.600" textAlign="center" maxW="3xl">
              Test the complete QR code payment flow: Generate → Scan → Pay. 
              Demonstrates cross-wallet routing and real-time payment processing.
            </Text>

            <HStack spacing={4}>
              <Badge colorScheme="green" variant="outline" p={2}>
                🎯 End-to-End Testing
              </Badge>
              <Badge colorScheme="blue" variant="outline" p={2}>
                🔄 Cross-Wallet Routing
              </Badge>
              <Badge colorScheme="purple" variant="outline" p={2}>
                ⚡ Real-Time Processing
              </Badge>
            </HStack>
          </VStack>

          <Divider />

          {/* Process Steps */}
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={6}>
              <Text fontSize="lg" fontWeight="semibold">
                Payment Flow Steps
              </Text>
              
              <Stepper index={activeStep} colorScheme="blue" size="lg">
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus
                        complete={<FiCheckCircle />}
                        incomplete={index + 1}
                        active={index + 1}
                      />
                    </StepIndicator>

                    <Box flexShrink='0'>
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>

                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </VStack>
          </Box>

          {/* Demo Instructions */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>How to Test Complete Flow:</AlertTitle>
              <AlertDescription>
                <VStack align="start" spacing={1} mt={2}>
                  <Text>1. <strong>Generate QR:</strong> Use the QR Generator below to create a payment QR code</Text>
                  <Text>2. <strong>Download Image:</strong> Click "Download PNG" to save the QR code image</Text>
                  <Text>3. <strong>Scan QR:</strong> Use the QR Scanner to upload and scan the saved image</Text>
                  <Text>4. <strong>Process Payment:</strong> Follow the payment confirmation flow</Text>
                  <Text>5. <strong>See Results:</strong> View transaction details and routing information</Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>

          {/* Main Content - Side by Side */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
            {/* QR Generator Side */}
            <GridItem>
              <VStack spacing={4} align="stretch">
                <Box bg={cardBg} p={4} borderRadius="lg" shadow="sm">
                  <HStack spacing={2} mb={4}>
                    <Text fontSize="xl">📱</Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      Step 1: Generate QR Code
                    </Text>
                    <Badge colorScheme="blue" variant="outline">
                      Generator
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Create a payment QR code with different wallet types and amounts.
                  </Text>
                </Box>
                
                <QRGenerator />

                <Alert status="success" borderRadius="lg" size="sm">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Tip:</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Try generating a "TNG Wallet QR" and then scanning it with "Boost Wallet" 
                      to test cross-wallet routing!
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </GridItem>

            {/* QR Scanner Side */}
            <GridItem>
              <VStack spacing={4} align="stretch">
                <Box bg={cardBg} p={4} borderRadius="lg" shadow="sm">
                  <HStack spacing={2} mb={4}>
                    <Text fontSize="xl">📷</Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      Step 2: Scan & Pay
                    </Text>
                    <Badge colorScheme="green" variant="outline">
                      Scanner
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    Scan the generated QR code and process payment through your preferred wallet.
                  </Text>
                </Box>
                
                <QRScanner />

                <Alert status="warning" borderRadius="lg" size="sm">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Cross-Wallet Demo:</AlertTitle>
                    <AlertDescription fontSize="xs">
                      When scanning a TNG QR with Boost wallet, you'll see the cross-wallet 
                      routing flow with a small routing fee.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </GridItem>
          </Grid>

          {/* Features Highlight */}
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                🎯 Test Features
              </Text>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                <VStack spacing={2} align="center" p={4} bg="blue.50" borderRadius="lg">
                  <Text fontSize="2xl">🔄</Text>
                  <Text fontSize="sm" fontWeight="semibold">Cross-Wallet Routing</Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    TNG QR → Boost Payment routing through PinkPay switch
                  </Text>
                </VStack>
                
                <VStack spacing={2} align="center" p={4} bg="green.50" borderRadius="lg">
                  <Text fontSize="2xl">⚡</Text>
                  <Text fontSize="sm" fontWeight="semibold">Real-Time Processing</Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    Instant payment processing with progress indicators
                  </Text>
                </VStack>
                
                <VStack spacing={2} align="center" p={4} bg="purple.50" borderRadius="lg">
                  <Text fontSize="2xl">🛡️</Text>
                  <Text fontSize="sm" fontWeight="semibold">Secure Validation</Text>
                  <Text fontSize="xs" color="gray.600" textAlign="center">
                    QR validation, payment confirmation, and transaction tracking
                  </Text>
                </VStack>
              </Grid>
            </VStack>
          </Box>

          {/* Quick Navigation */}
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold" textAlign="center">
                🚀 Quick Navigation
              </Text>
              
              <HStack spacing={4} justify="center" flexWrap="wrap">
                <Link href="/">
                  <Button leftIcon={<FiHome />} variant="outline" size="sm">
                    Dashboard Home
                  </Button>
                </Link>
                
                <Link href="/qr-generator">
                  <Button leftIcon={<FiGrid />} variant="outline" size="sm">
                    QR Generator Only
                  </Button>
                </Link>
                
                <Link href="/scanner">
                  <Button leftIcon={<FiCamera />} variant="outline" size="sm">
                    QR Scanner Only
                  </Button>
                </Link>
                
                <Link href="/analytics">
                  <Button leftIcon={<FiArrowRight />} variant="outline" size="sm">
                    View Analytics
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </Box>

          {/* Footer */}
          <Box textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.500">
              PinkPay Test Environment • Generate → Scan → Pay → Complete
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 