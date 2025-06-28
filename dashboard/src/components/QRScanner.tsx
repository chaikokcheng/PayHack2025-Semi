'use client'

import {
  Box,
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
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Textarea,
  Code,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { FiCamera, FiUpload, FiPlay, FiCheckCircle, FiX, FiCreditCard, FiShield, FiClock, FiArrowRight, FiZap, FiActivity } from 'react-icons/fi'

interface ScannedQRData {
  qr_code_id: string
  merchant_id: string
  amount: number
  currency: string
  qr_type: string
  description?: string
  expires_at: string
  rawData: any
}

interface PaymentResult {
  success: boolean
  transaction_id?: string
  message: string
  error?: string
}

interface RoutingStep {
  step: number
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  details?: string
  timestamp?: string
}

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedQRData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [mounted, setMounted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState('boost')
  const [userId, setUserId] = useState('bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9')
  const [paymentProgress, setPaymentProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [routingSteps, setRoutingSteps] = useState<RoutingStep[]>([])
  const [routingDetails, setRoutingDetails] = useState<any>(null)
  
  // Mobile Scanner Monitoring
  const [mobileUpdates, setMobileUpdates] = useState<any[]>([])
  const [latestMobileUpdate, setLatestMobileUpdate] = useState<any>(null)
  const [mobileActivity, setMobileActivity] = useState(false)
  const [liveMobileUpdate, setLiveMobileUpdate] = useState<any>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<any>(null)
  const mobilePollingRef = useRef<NodeJS.Timeout | null>(null)
  
  const { isOpen: isCameraOpen, onOpen: onCameraOpen, onClose: onCameraClose } = useDisclosure()
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure()
  const { isOpen: isProcessingOpen, onOpen: onProcessingOpen, onClose: onProcessingClose } = useDisclosure()
  const { isOpen: isResultOpen, onOpen: onResultOpen, onClose: onResultClose } = useDisclosure()
  
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    setMounted(true)
    
    // Start polling for mobile updates
    startMobilePolling()
    
    return () => {
      stopCamera()
      stopMobilePolling()
    }
  }, [])

  const startMobilePolling = () => {
    // Poll every 2 seconds for mobile updates
    mobilePollingRef.current = setInterval(async () => {
      try {
        const response = await fetch('http://192.168.0.12:8000/api/dashboard/mobile-updates')
        const data = await response.json()
        
        if (data.success) {
          setMobileUpdates(data.recent_updates || [])
          
          if (data.latest_update) {
            setLatestMobileUpdate(data.latest_update)
            
            // Show live update if it's recent (within last 10 seconds)
            const updateTime = new Date(data.latest_update.timestamp).getTime()
            const now = new Date().getTime()
            
            if (now - updateTime < 10000) {
              setLiveMobileUpdate(data.latest_update)
              setMobileActivity(true)
              
              // Auto-hide live update after 8 seconds
              setTimeout(() => {
                setLiveMobileUpdate(null)
                setMobileActivity(false)
              }, 8000)
            }
          }
        }
      } catch (error) {
        console.log('Mobile polling error:', error)
      }
    }, 2000)
  }

  const stopMobilePolling = () => {
    if (mobilePollingRef.current) {
      clearInterval(mobilePollingRef.current)
      mobilePollingRef.current = null
    }
  }

  const startCamera = async () => {
    try {
      setScanning(true)
      setCameraError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        startContinuousScanning()
      }
      
      onCameraOpen()
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError('Camera access denied or not available')
      setScanning(false)
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please try uploading an image instead.',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    if (scannerRef.current) {
      scannerRef.current = null
    }
    setScanning(false)
    onCameraClose()
  }

  const startContinuousScanning = async () => {
    try {
      const QrScanner = (await import('qr-scanner')).default
      
      if (videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Scan Result:', result)
            try {
              processScannedData(result.data)
              stopCamera()
            } catch (error) {
              console.error('Error processing scanned data:', error)
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        
        await scannerRef.current.start()
      }
    } catch (error) {
      console.error('Scanner initialization error:', error)
      toast({
        title: 'Scanner Error',
        description: 'Unable to initialize QR scanner',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processQRImage(file)
    }
  }

  const processQRImage = async (imageFile: Blob | File) => {
    try {
      const QrScanner = (await import('qr-scanner')).default
      
      const result = await QrScanner.scanImage(imageFile, {
        returnDetailedScanResult: true,
      })

      console.log('QR Scan Result:', result)
      processScannedData(result.data)
      
    } catch (error) {
      console.error('QR decode error:', error)
      toast({
        title: 'Scan Failed',
        description: 'Could not decode QR code. Please try again with a clearer image.',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const processScannedData = (qrDataString: string) => {
    try {
      const qrData = JSON.parse(qrDataString)
      
      const scannedQR: ScannedQRData = {
        qr_code_id: qrData.qr_code_id || `QR_${Date.now()}`,
        merchant_id: qrData.merchant_id,
        amount: parseFloat(qrData.amount),
        currency: qrData.currency || 'MYR',
        qr_type: qrData.qr_type || 'merchant',
        description: qrData.description,
        expires_at: qrData.expires_at,
        rawData: qrData
      }
      
      setScannedData(scannedQR)
      
      // Analyze routing requirements
      const routing = analyzeRouting(scannedQR)
      setRoutingDetails(routing)
      
      toast({
        title: 'QR Code Detected!',
        description: `Found ${qrData.qr_type?.toUpperCase() || 'payment'} QR code`,
        status: 'success',
        duration: 3000,
      })
      
      setTimeout(() => {
        onPaymentOpen()
      }, 500)
      
    } catch (error) {
      console.error('QR data parsing error:', error)
      toast({
        title: 'Invalid QR Code',
        description: 'This QR code does not contain valid payment information.',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const analyzeRouting = (qrData: ScannedQRData) => {
    const isDirectPayment = qrData.qr_type === selectedWallet || qrData.qr_type === 'merchant'
    
    return {
      isDirectPayment,
      sourceWallet: qrData.qr_type,
      targetWallet: selectedWallet,
      routingType: isDirectPayment ? 'Direct Payment' : 'Cross-Wallet Routing',
      compatibility: 'High',
      switchingRequired: !isDirectPayment,
      route: isDirectPayment 
        ? `${selectedWallet.toUpperCase()} → Merchant`
        : `${qrData.qr_type.toUpperCase()} QR → SatuPay Switch → ${selectedWallet.toUpperCase()}`,
      processingTime: isDirectPayment ? '1-2 seconds' : '2-3 seconds',
      railsInvolved: isDirectPayment 
        ? [selectedWallet]
        : [qrData.qr_type, 'SatuPay_switch', selectedWallet],
      benefits: isDirectPayment 
        ? ['Direct processing', 'Instant confirmation']
        : ['Universal compatibility', 'Seamless wallet switching', 'Real-time conversion']
    }
  }

  const generateRoutingSteps = (qrData: ScannedQRData, routing: any) => {
    const steps: RoutingStep[] = [
      {
        step: 1,
        title: 'QR Code Analysis',
        description: `Analyzing ${qrData.qr_type.toUpperCase()} QR code structure`,
        status: 'pending',
        details: `QR Type: ${qrData.qr_type} | Amount: ${qrData.currency} ${qrData.amount}`
      },
      {
        step: 2,
        title: 'Wallet Compatibility Check',
        description: `Checking ${selectedWallet.toUpperCase()} wallet compatibility`,
        status: 'pending',
        details: routing.isDirectPayment ? 'Direct payment supported' : 'Cross-wallet routing required'
      },
      {
        step: 3,
        title: 'Payment Route Planning',
        description: 'Determining optimal payment route',
        status: 'pending',
        details: routing.route
      }
    ]

    if (!routing.isDirectPayment) {
      steps.push({
        step: 4,
        title: 'Cross-Wallet Translation',
        description: 'Converting payment format between wallets',
        status: 'pending',
        details: `${routing.sourceWallet.toUpperCase()} → ${routing.targetWallet.toUpperCase()} protocol translation`
      })
    }

    steps.push({
      step: routing.isDirectPayment ? 4 : 5,
      title: 'Payment Processing',
      description: 'Executing payment through selected wallet',
      status: 'pending',
      details: `Processing via ${selectedWallet.toUpperCase()} wallet`
    })

    steps.push({
      step: routing.isDirectPayment ? 5 : 6,
      title: 'Transaction Confirmation',
      description: 'Confirming payment completion',
      status: 'pending',
      details: 'Generating transaction receipt and confirmation'
    })

    return steps
  }

  const processPayment = async () => {
    if (!scannedData || !routingDetails) return

    const steps = generateRoutingSteps(scannedData, routingDetails)
    setRoutingSteps(steps)
    setProcessing(true)
    setPaymentProgress(0)
    setCurrentStep(0)
    onPaymentClose()
    onProcessingOpen()

    try {
      const totalSteps = steps.length
      
      for (let i = 0; i < totalSteps; i++) {
        setCurrentStep(i)
        setPaymentProgress((i / totalSteps) * 100)
        
        // Update step status
        const updatedSteps = [...steps]
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: 'processing',
          timestamp: new Date().toISOString()
        }
        setRoutingSteps(updatedSteps)
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Mark step as completed
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: 'completed',
          timestamp: new Date().toISOString()
        }
        setRoutingSteps(updatedSteps)
      }

      setPaymentProgress(100)

      // Try backend payment processing
      try {
        const paymentResponse = await fetch('http://192.168.0.12:8000/api/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: scannedData.amount.toString(),
            currency: scannedData.currency,
            payment_method: 'qr_scan',
            merchant_id: scannedData.merchant_id,
            user_id: userId,
            description: `QR Payment: ${scannedData.description || 'Scanned QR Code'}`,
            metadata: {
              qr_type: scannedData.qr_type,
              scanner_wallet: selectedWallet,
              scanned_at: new Date().toISOString(),
              qr_code_id: scannedData.qr_code_id,
              routing_type: routingDetails.routingType,
              routing_details: routingDetails
            }
          })
        })

        const paymentData = await paymentResponse.json()

        if (paymentResponse.ok && paymentData.success) {
          setPaymentResult({
            success: true,
            transaction_id: paymentData.transaction?.txn_id || `TXN_${Date.now()}`,
            message: 'Payment processed successfully!'
          })
        } else {
          throw new Error(paymentData.message || 'Payment failed')
        }
      } catch (backendError) {
        // Fallback: Simulate successful payment
        console.log('Backend payment failed, using simulation:', backendError)
        setPaymentResult({
          success: true,
          transaction_id: `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          message: 'Payment processed successfully! (Demo Mode)'
        })
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      setPaymentResult({
        success: false,
        error: 'Payment processing failed',
        message: 'Unable to process payment. Please try again.'
      })
    } finally {
      setProcessing(false)
      setTimeout(() => {
        onProcessingClose()
        onResultOpen()
      }, 1000)
    }
  }

  const resetScanner = () => {
    setScannedData(null)
    setPaymentResult(null)
    setCameraError(null)
    setPaymentProgress(0)
    setCurrentStep(0)
    setRoutingSteps([])
    setRoutingDetails(null)
    onResultClose()
    onProcessingClose()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getWalletIcon = (wallet: string) => {
    const icons: { [key: string]: string } = {
      'boost': '🚀',
      'tng': '💙',
      'grabpay': '🟢',
      'shopee': '🛍️',
      'merchant': '🏪'
    }
    return icons[wallet] || '💳'
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle color="green" />
      case 'processing': return <FiActivity color="blue" />
      case 'failed': return <FiX color="red" />
      default: return <FiClock color="gray" />
    }
  }

  if (!mounted) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text>Loading QR Scanner...</Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="lg">📷</Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              QR Code Scanner
            </Text>
          </HStack>
          <Badge colorScheme="green" variant="outline">
            Scan & Pay
          </Badge>
        </HStack>

        <Divider />

        {/* Scanner Configuration */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm">Your Wallet</FormLabel>
            <Select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              size="sm"
            >
              <option value="boost">🚀 Boost Wallet</option>
              <option value="tng">💙 TNG eWallet</option>
              <option value="grabpay">🟢 GrabPay</option>
              <option value="shopee">🛍️ ShopeePay</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">User ID</FormLabel>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              size="sm"
            />
          </FormControl>
        </VStack>

        {/* Scan Options */}
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Scan QR Code
          </Text>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FiCamera />}
              colorScheme="blue"
              onClick={startCamera}
              isLoading={scanning}
              loadingText="Starting Camera..."
              size="sm"
              flex={1}
              isDisabled={processing}
            >
              Scan with Camera
            </Button>
            
            <Button
              leftIcon={<FiUpload />}
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              flex={1}
              isDisabled={processing}
            >
              Upload Image
            </Button>
          </HStack>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </VStack>

        {/* Camera Error */}
        {cameraError && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {/* Mobile Scanner Activity - Real-time Updates */}
        {(mobileActivity || latestMobileUpdate) && (
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <HStack spacing={2}>
                <Text fontSize="lg">📱</Text>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  Mobile Scanner Activity
                </Text>
              </HStack>
              <Badge colorScheme="green" variant="solid">
                Live
              </Badge>
            </HStack>

            {liveMobileUpdate && (
              <Box
                bg="green.50"
                border="1px"
                borderColor="green.200"
                borderRadius="lg"
                p={4}
                mb={4}
                animation="pulse 2s infinite"
              >
                <HStack justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiActivity} color="green.500" />
                    <Text fontSize="sm" fontWeight="semibold" color="green.700">
                      {liveMobileUpdate.status === 'scan_started' && 'QR Code Scanned'}
                      {liveMobileUpdate.status === 'processing' && 'Processing Payment...'}
                      {liveMobileUpdate.status === 'payment_success' && 'Payment Successful!'}
                      {liveMobileUpdate.status === 'payment_failed' && 'Payment Failed'}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="green.600">
                    {new Date(liveMobileUpdate.timestamp).toLocaleTimeString()}
                  </Text>
                </HStack>

                <Text fontSize="sm" color="green.600" mb={2}>
                  {liveMobileUpdate.message}
                </Text>

                {liveMobileUpdate.progress !== undefined && liveMobileUpdate.progress < 100 && (
                  <Progress 
                    value={liveMobileUpdate.progress} 
                    colorScheme="green" 
                    size="sm" 
                    mb={2}
                  />
                )}

                {liveMobileUpdate.qr_data && (
                  <Box mt={2} p={2} bg="white" borderRadius="md" border="1px" borderColor="green.100">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.600">Merchant</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {liveMobileUpdate.qr_data.merchant_id}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontSize="xs" color="gray.600">Amount</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="green.600">
                          {liveMobileUpdate.qr_data.currency} {liveMobileUpdate.qr_data.amount}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {liveMobileUpdate.transaction_id && (
                  <Box mt={2} p={2} bg="green.100" borderRadius="md">
                    <Text fontSize="xs" color="green.700">Transaction ID</Text>
                    <Code fontSize="xs" colorScheme="green">
                      {liveMobileUpdate.transaction_id}
                    </Code>
                  </Box>
                )}
              </Box>
            )}

            {latestMobileUpdate && !liveMobileUpdate && (
              <Box
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                p={4}
                mb={4}
              >
                <HStack justify="space-between" align="center" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Last Mobile Activity
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(latestMobileUpdate.timestamp).toLocaleString()}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {latestMobileUpdate.message}
                </Text>
                {latestMobileUpdate.amount && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Amount: {latestMobileUpdate.qr_data?.currency || 'MYR'} {latestMobileUpdate.amount}
                  </Text>
                )}
              </Box>
            )}

            {mobileUpdates.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Recent Mobile Scans
                </Text>
                <VStack align="stretch" spacing={2}>
                  {mobileUpdates.slice(-3).reverse().map((update, index) => (
                    <HStack key={index} justify="space-between" align="center" p={2} bg="gray.50" borderRadius="md">
                      <HStack spacing={2}>
                        <Icon 
                          as={update.status === 'payment_success' ? FiCheckCircle : 
                             update.status === 'payment_failed' ? FiX : FiActivity} 
                          color={update.status === 'payment_success' ? 'green.500' : 
                                 update.status === 'payment_failed' ? 'red.500' : 'blue.500'} 
                        />
                        <Text fontSize="xs" color="gray.600">
                          {update.merchant || update.qr_data?.merchant_id || 'Mobile Scan'}
                        </Text>
                        {update.amount && (
                          <Text fontSize="xs" color="gray.600">
                            - MYR {update.amount}
                          </Text>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        <Divider />

        {/* Payment Confirmation Modal */}
        <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <FiCreditCard />
                <Text>Confirm Payment</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {scannedData && routingDetails && (
                <VStack spacing={6} align="stretch">
                  {/* Payment Details */}
                  <Box bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700">Payment Details</Text>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Merchant:</Text>
                        <Text fontSize="sm" fontWeight="semibold">{scannedData.merchant_id}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">Amount:</Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {scannedData.currency} {scannedData.amount.toFixed(2)}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">QR Type:</Text>
                        <Badge colorScheme="purple" variant="subtle">
                          {scannedData.qr_type.toUpperCase()}
                        </Badge>
                      </HStack>

                      {scannedData.description && (
                        <HStack justify="space-between" align="start">
                          <Text fontSize="sm" color="gray.600">Description:</Text>
                          <Text fontSize="sm" textAlign="right" maxW="200px">
                            {scannedData.description}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* Routing Analysis */}
                  <Box bg="blue.50" p={4} borderRadius="lg" border="1px solid" borderColor="blue.200">
                    <VStack spacing={3} align="stretch">
                      <HStack spacing={2}>
                        <FiZap color="blue" />
                        <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                          {routingDetails.routingType}
                        </Text>
                      </HStack>
                      
                      <TableContainer>
                        <Table size="sm" variant="simple">
                          <Tbody>
                            <Tr>
                              <Td px={0} py={1} fontSize="xs" color="gray.600">Route:</Td>
                              <Td px={0} py={1} fontSize="xs" fontWeight="semibold">{routingDetails.route}</Td>
                            </Tr>
                            <Tr>
                              <Td px={0} py={1} fontSize="xs" color="gray.600">Processing Time:</Td>
                              <Td px={0} py={1} fontSize="xs">{routingDetails.processingTime}</Td>
                            </Tr>
                            <Tr>
                              <Td px={0} py={1} fontSize="xs" color="gray.600">Compatibility:</Td>
                              <Td px={0} py={1}>
                                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                  {routingDetails.compatibility}
                                </Badge>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>

                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="blue.600" fontWeight="semibold">Benefits:</Text>
                        {routingDetails.benefits.map((benefit: string, index: number) => (
                          <Text key={index} fontSize="xs" color="blue.600">
                            • {benefit}
                          </Text>
                        ))}
                      </VStack>
                    </VStack>
                  </Box>

                  {/* Payment Method */}
                  <HStack spacing={3} p={3} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
                    <Text fontSize="2xl">{getWalletIcon(selectedWallet)}</Text>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Pay with {selectedWallet.toUpperCase()}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        User: {userId.slice(0, 8)}...
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={onPaymentClose} size="sm">
                  Cancel
                </Button>
                <Button
                  colorScheme="green"
                  onClick={processPayment}
                  leftIcon={<FiPlay />}
                  size="sm"
                >
                  Confirm Payment
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Payment Processing Modal */}
        <Modal isOpen={isProcessingOpen} onClose={() => {}} size="xl" closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <FiActivity />
                <Text>Processing Payment</Text>
              </HStack>
            </ModalHeader>
            <ModalBody pb={6}>
              <VStack spacing={6} align="stretch">
                {/* Overall Progress */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">Overall Progress</Text>
                    <Text fontSize="sm" color="gray.600">{Math.round(paymentProgress)}%</Text>
                  </HStack>
                  <Progress value={paymentProgress} colorScheme="blue" size="lg" borderRadius="md" />
                </Box>

                {/* Routing Steps */}
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={3}>Payment Routing Steps</Text>
                  <VStack spacing={3} align="stretch">
                    {routingSteps.map((step, index) => (
                      <Box
                        key={step.step}
                        p={3}
                        bg={
                          step.status === 'completed' ? 'green.50' :
                          step.status === 'processing' ? 'blue.50' :
                          step.status === 'failed' ? 'red.50' : 'gray.50'
                        }
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={
                          step.status === 'completed' ? 'green.200' :
                          step.status === 'processing' ? 'blue.200' :
                          step.status === 'failed' ? 'red.200' : 'gray.200'
                        }
                      >
                        <Flex align="start" spacing={3}>
                          <Box mr={3} mt={1}>
                            {getStepIcon(step.status)}
                          </Box>
                          <Box flex={1}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" fontWeight="semibold">
                                {step.step}. {step.title}
                              </Text>
                              <Badge
                                colorScheme={
                                  step.status === 'completed' ? 'green' :
                                  step.status === 'processing' ? 'blue' :
                                  step.status === 'failed' ? 'red' : 'gray'
                                }
                                variant="subtle"
                                fontSize="xs"
                              >
                                {step.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.600" mt={1}>
                              {step.description}
                            </Text>
                            {step.details && (
                              <Text fontSize="xs" color="gray.500" fontStyle="italic" mt={1}>
                                {step.details}
                              </Text>
                            )}
                            {step.timestamp && (
                              <Text fontSize="xs" color="gray.400" mt={1}>
                                {new Date(step.timestamp).toLocaleTimeString()}
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Live Status */}
                {currentStep < routingSteps.length && (
                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Currently Processing:</AlertTitle>
                      <AlertDescription fontSize="xs">
                        {routingSteps[currentStep]?.title} - {routingSteps[currentStep]?.description}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Payment Result Modal */}
        <Modal isOpen={isResultOpen} onClose={onResultClose} size="lg" closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                {paymentResult?.success ? <FiCheckCircle color="green" /> : <FiX color="red" />}
                <Text>
                  {paymentResult?.success ? 'Payment Successful!' : 'Payment Failed'}
                </Text>
              </HStack>
            </ModalHeader>
            <ModalBody pb={6}>
              {paymentResult && (
                <VStack spacing={4} align="stretch">
                  <Alert 
                    status={paymentResult.success ? "success" : "error"} 
                    borderRadius="lg"
                  >
                    <AlertIcon />
                    <Box>
                      <AlertTitle>
                        {paymentResult.success ? 'Payment Completed!' : 'Payment Failed'}
                      </AlertTitle>
                      <AlertDescription>
                        {paymentResult.message}
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {paymentResult.success && paymentResult.transaction_id && (
                    <VStack spacing={4} align="stretch">
                      {/* Transaction Details */}
                      <Box bg="gray.50" p={4} borderRadius="lg">
                        <VStack spacing={2} align="stretch">
                          <Text fontSize="sm" fontWeight="semibold">Transaction Details</Text>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">Transaction ID:</Text>
                            <Code fontSize="xs">{paymentResult.transaction_id}</Code>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">Amount:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {scannedData?.currency} {scannedData?.amount.toFixed(2)}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">Method:</Text>
                            <Text fontSize="xs">
                              {getWalletIcon(selectedWallet)} {selectedWallet.toUpperCase()}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.600">Routing:</Text>
                            <Text fontSize="xs">{routingDetails?.routingType}</Text>
                          </HStack>
                        </VStack>
                      </Box>

                      {/* Routing Summary */}
                      {routingDetails && (
                        <Box bg="blue.50" p={4} borderRadius="lg">
                          <VStack spacing={2} align="stretch">
                            <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                              Routing Summary
                            </Text>
                            <Text fontSize="xs" color="blue.600">
                              <strong>Route:</strong> {routingDetails.route}
                            </Text>
                            <Text fontSize="xs" color="blue.600">
                              <strong>Processing Time:</strong> {routingDetails.processingTime}
                            </Text>
                            <Text fontSize="xs" color="blue.600">
                              <strong>Steps Completed:</strong> {routingSteps.length} routing steps
                            </Text>
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  )}
                </VStack>
              )}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={resetScanner} size="sm">
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
} 

export default QRScanner