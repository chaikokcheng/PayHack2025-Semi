'use client'

import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Badge,
  Divider,
  Grid,
  GridItem,
  Textarea,
  Code,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiPlay, FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface TestResult {
  success: boolean
  data?: any
  error?: string
  timestamp: string
  duration?: number
}

export function PaymentTester() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [mounted, setMounted] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Form states
  const [healthForm, setHealthForm] = useState({})
  const [tngBoostForm, setTngBoostForm] = useState({
    merchant_id: 'PAYHACK_DEMO_001',
    amount: '75.50'
  })
  const [paymentForm, setPaymentForm] = useState({
    amount: '50.00',
    currency: 'MYR',
    payment_method: 'qr',
    merchant_id: 'MERCHANT_001',
    user_id: 'user123'
  })

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 results
  }

  const testHealthCheck = async () => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      const response = await fetch('http://127.0.0.1:8000/health')
      const data = await response.json()
      const duration = Date.now() - startTime
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      })

      toast({
        title: response.ok ? 'Health Check Passed' : 'Health Check Failed',
        description: response.ok ? 'System is healthy' : 'System is experiencing issues',
        status: response.ok ? 'success' : 'error',
        duration: 3000,
      })
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      })

      toast({
        title: 'Health Check Failed',
        description: 'Cannot connect to backend',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const testTngBoostDemo = async () => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/qr/demo/tng-boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tngBoostForm)
      })
      
      const data = await response.json()
      const duration = Date.now() - startTime
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      })

      toast({
        title: response.ok ? 'TNG→Boost Demo Success' : 'Demo Failed',
        description: response.ok ? 'Cross-wallet routing completed' : 'Demo execution failed',
        status: response.ok ? 'success' : 'error',
        duration: 3000,
      })
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      })

      toast({
        title: 'Demo Failed',
        description: 'Cannot execute TNG→Boost demo',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const testPayment = async () => {
    setLoading(true)
    const startTime = Date.now()
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentForm)
      })
      
      const data = await response.json()
      const duration = Date.now() - startTime
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      })

      toast({
        title: response.ok ? 'Payment Processed' : 'Payment Failed',
        description: response.ok ? 'Payment completed successfully' : 'Payment processing failed',
        status: response.ok ? 'success' : 'error',
        duration: 3000,
      })
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      })

      toast({
        title: 'Payment Failed',
        description: 'Cannot process payment',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text>Loading API tester...</Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              🧪 PinkPay API Testing Console
            </Text>
            <Text fontSize="sm" color="gray.600">
              Interactive testing interface for all payment endpoints
            </Text>
          </VStack>
          <Badge colorScheme="blue" variant="outline">
            Live Testing
          </Badge>
        </HStack>

        <Divider />

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} colorScheme="pinkpay">
          <TabList>
            <Tab>🩺 Health Check</Tab>
            <Tab>🔄 TNG→Boost Demo</Tab>
            <Tab>💳 Payment API</Tab>
          </TabList>

          <TabPanels>
            {/* Health Check Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>System Health Check</AlertTitle>
                    <AlertDescription>
                      Verify backend connectivity and system status
                    </AlertDescription>
                  </Box>
                </Alert>

                <Button
                  colorScheme="green"
                  onClick={testHealthCheck}
                  isLoading={loading}
                  loadingText="Checking..."
                  leftIcon={<FiPlay />}
                  size="lg"
                >
                  Run Health Check
                </Button>
              </VStack>
            </TabPanel>

            {/* TNG->Boost Demo Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Cross-Wallet Demo</AlertTitle>
                    <AlertDescription>
                      Demonstrate TNG QR → Boost wallet payment routing
                    </AlertDescription>
                  </Box>
                </Alert>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Merchant ID</FormLabel>
                      <Input
                        value={tngBoostForm.merchant_id}
                        onChange={(e) => setTngBoostForm({...tngBoostForm, merchant_id: e.target.value})}
                        placeholder="PAYHACK_DEMO_001"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Amount (MYR)</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={tngBoostForm.amount}
                        onChange={(e) => setTngBoostForm({...tngBoostForm, amount: e.target.value})}
                        placeholder="75.50"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <Button
                  bgGradient="linear(to-r, pinkpay.500, blue.500)"
                  color="white"
                  onClick={testTngBoostDemo}
                  isLoading={loading}
                  loadingText="Processing Demo..."
                  leftIcon={<FiRefreshCw />}
                  size="lg"
                  _hover={{
                    bgGradient: "linear(to-r, pinkpay.600, blue.600)",
                  }}
                >
                  Execute TNG→Boost Demo
                </Button>
              </VStack>
            </TabPanel>

            {/* Payment API Tab */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                <Alert status="warning" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Payment Processing</AlertTitle>
                    <AlertDescription>
                      Test core payment functionality with custom parameters
                    </AlertDescription>
                  </Box>
                </Alert>

                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Amount</FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        value={paymentForm.currency}
                        onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                      >
                        <option value="MYR">MYR</option>
                        <option value="USD">USD</option>
                        <option value="SGD">SGD</option>
                        <option value="EUR">EUR</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        value={paymentForm.payment_method}
                        onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                      >
                        <option value="qr">QR Code</option>
                        <option value="nfc">NFC</option>
                        <option value="online">Online</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Merchant ID</FormLabel>
                      <Input
                        value={paymentForm.merchant_id}
                        onChange={(e) => setPaymentForm({...paymentForm, merchant_id: e.target.value})}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>User ID</FormLabel>
                      <Input
                        value={paymentForm.user_id}
                        onChange={(e) => setPaymentForm({...paymentForm, user_id: e.target.value})}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <Button
                  colorScheme="blue"
                  onClick={testPayment}
                  isLoading={loading}
                  loadingText="Processing..."
                  leftIcon={<FiPlay />}
                  size="lg"
                >
                  Process Payment
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Results Section */}
        {results.length > 0 && (
          <>
            <Divider />
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="md" fontWeight="semibold" color="gray.800">
                  📋 Test Results
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResults([])}
                >
                  Clear
                </Button>
              </HStack>

              <VStack spacing={3} maxH="400px" overflowY="auto">
                {results.map((result, index) => (
                  <Box
                    key={index}
                    p={4}
                    border="1px"
                    borderColor={result.success ? 'green.200' : 'red.200'}
                    borderRadius="lg"
                    bg={result.success ? 'green.50' : 'red.50'}
                    w="100%"
                  >
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          {result.success ? (
                            <FiCheckCircle color="green" />
                          ) : (
                            <FiXCircle color="red" />
                          )}
                          <Text fontWeight="semibold" color={result.success ? 'green.700' : 'red.700'}>
                            {result.success ? 'Success' : 'Error'}
                          </Text>
                        </HStack>
                        <HStack spacing={4}>
                          <Text fontSize="sm" color="gray.600">
                            {result.timestamp}
                          </Text>
                          {result.duration && (
                            <Badge colorScheme="blue" variant="subtle">
                              {result.duration}ms
                            </Badge>
                          )}
                        </HStack>
                      </HStack>

                      {result.error && (
                        <Text fontSize="sm" color="red.600">
                          {result.error}
                        </Text>
                      )}

                      {result.data && (
                        <Box bg="gray.100" p={3} borderRadius="md" maxH="200px" overflowY="auto">
                          <Code fontSize="xs" whiteSpace="pre-wrap" bg="transparent">
                            {JSON.stringify(result.data, null, 2)}
                          </Code>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  )
} 
                        </Box>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  )
} 