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
  useDisclosure,
  Textarea,
  Code,
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { FiCamera, FiUpload, FiPlay, FiCheckCircle, FiX } from 'react-icons/fi'

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

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedQRData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [mounted, setMounted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState('boost')
  const [userId, setUserId] = useState('bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9') // Using existing user from transactions
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const startCamera = async () => {
    try {
      setScanning(true)
      setCameraError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      onOpen()
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
    setScanning(false)
    onClose()
  }

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Convert canvas to blob and process
    canvas.toBlob(async (blob) => {
      if (blob) {
        await processQRImage(blob)
      }
    }, 'image/png')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processQRImage(file)
    }
  }

  const processQRImage = async (imageFile: Blob | File) => {
    try {
      // Use QR scanner library to decode
      const QrScanner = (await import('qr-scanner')).default
      
      const result = await QrScanner.scanImage(imageFile, {
        returnDetailedScanResult: true,
      })

      console.log('QR Scan Result:', result)
      
      // Parse the QR data
      const qrData = JSON.parse(result.data)
      
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
      stopCamera()
      
      toast({
        title: 'QR Code Scanned',
        description: `Found ${qrData.qr_type?.toUpperCase() || 'payment'} QR code`,
        status: 'success',
        duration: 3000,
      })
      
    } catch (error) {
      console.error('QR decode error:', error)
      toast({
        title: 'Scan Failed',
        description: 'Could not decode QR code. Please try again.',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const processPayment = async () => {
    if (!scannedData) return

    setProcessing(true)
    try {
      // Step 1: Scan QR code via backend
      const scanResponse = await fetch('http://127.0.0.1:8000/api/qr/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qr_code_id: scannedData.qr_code_id,
          scanner_wallet: selectedWallet,
          user_id: userId
        })
      })

      if (!scanResponse.ok) {
        // If scan endpoint doesn't exist, try payment routing directly
        const routeResponse = await fetch('http://127.0.0.1:8000/api/qr/route-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            qr_code_id: scannedData.qr_code_id,
            scanner_wallet: selectedWallet,
            user_id: userId,
            amount: scannedData.amount,
            currency: scannedData.currency
          })
        })

        if (routeResponse.ok) {
          const routeData = await routeResponse.json()
          setPaymentResult({
            success: true,
            transaction_id: routeData.transaction?.txn_id,
            message: routeData.message || 'Payment processed successfully'
          })
        } else {
          // Fallback: Direct payment processing
          await processDirectPayment()
        }
      } else {
        const scanData = await scanResponse.json()
        
        // Step 2: Route the payment
        const routeResponse = await fetch('http://127.0.0.1:8000/api/qr/route-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            qr_code_id: scannedData.qr_code_id,
            scanner_wallet: selectedWallet,
            user_id: userId
          })
        })

        if (routeResponse.ok) {
          const routeData = await routeResponse.json()
          setPaymentResult({
            success: true,
            transaction_id: routeData.transaction?.txn_id,
            message: routeData.message || 'Cross-wallet payment completed'
          })
        } else {
          await processDirectPayment()
        }
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      await processDirectPayment()
    } finally {
      setProcessing(false)
    }
  }

  const processDirectPayment = async () => {
    try {
      // Direct payment via /api/pay endpoint
      const paymentResponse = await fetch('http://127.0.0.1:8000/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: scannedData!.amount.toString(),
          currency: scannedData!.currency,
          payment_method: 'qr_scan',
          merchant_id: scannedData!.merchant_id,
          user_id: userId,
          description: `QR Payment: ${scannedData!.description || 'Scanned QR Code'}`,
          metadata: {
            qr_type: scannedData!.qr_type,
            scanner_wallet: selectedWallet,
            scanned_at: new Date().toISOString()
          }
        })
      })

      const paymentData = await paymentResponse.json()

      if (paymentResponse.ok && paymentData.success) {
        setPaymentResult({
          success: true,
          transaction_id: paymentData.transaction?.txn_id,
          message: 'Payment processed successfully'
        })
      } else {
        setPaymentResult({
          success: false,
          error: paymentData.message || 'Payment failed',
          message: 'Payment could not be processed'
        })
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to payment system'
      })
    }
  }

  const resetScanner = () => {
    setScannedData(null)
    setPaymentResult(null)
    setCameraError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
              <option value="boost">Boost Wallet</option>
              <option value="tng">TNG eWallet</option>
              <option value="grabpay">GrabPay</option>
              <option value="shopee">ShopeePay</option>
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
            >
              Scan with Camera
            </Button>
            
            <Button
              leftIcon={<FiUpload />}
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              flex={1}
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

        {/* Scanned QR Data */}
        {scannedData && (
          <VStack spacing={4} align="stretch">
            <Divider />
            
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>QR Code Detected!</AlertTitle>
                <AlertDescription>
                  {scannedData.qr_type.toUpperCase()} QR • {scannedData.currency} {scannedData.amount.toFixed(2)}
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={3} align="stretch" bg="gray.50" p={4} borderRadius="lg">
              <Text fontSize="sm" fontWeight="semibold">Payment Details</Text>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">Merchant:</Text>
                <Text fontSize="xs" fontWeight="semibold">{scannedData.merchant_id}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">Amount:</Text>
                <Text fontSize="sm" fontWeight="bold" color="green.600">
                  {scannedData.currency} {scannedData.amount.toFixed(2)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.600">QR Type:</Text>
                <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                  {scannedData.qr_type.toUpperCase()}
                </Badge>
              </HStack>
              {scannedData.description && (
                <HStack justify="space-between" align="start">
                  <Text fontSize="xs" color="gray.600">Description:</Text>
                  <Text fontSize="xs" textAlign="right" maxW="150px">
                    {scannedData.description}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Payment Action */}
            <Button
              leftIcon={<FiPlay />}
              colorScheme="green"
              onClick={processPayment}
              isLoading={processing}
              loadingText="Processing Payment..."
              size="lg"
            >
              Pay with {selectedWallet.toUpperCase()}
            </Button>
          </VStack>
        )}

        {/* Payment Result */}
        {paymentResult && (
          <VStack spacing={4} align="stretch">
            <Divider />
            
            <Alert status={paymentResult.success ? "success" : "error"} borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                </AlertTitle>
                <AlertDescription>
                  {paymentResult.message}
                  {paymentResult.transaction_id && (
                    <Text fontSize="xs" mt={2}>
                      Transaction ID: {paymentResult.transaction_id}
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>

            <Button
              leftIcon={<FiX />}
              variant="outline"
              onClick={resetScanner}
              size="sm"
            >
              Scan Another QR
            </Button>
          </VStack>
        )}

        {/* Camera Error */}
        {cameraError && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}
      </VStack>

      {/* Camera Modal */}
      <Modal isOpen={isOpen} onClose={stopCamera} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan QR Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box position="relative" w="100%" maxW="400px">
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    backgroundColor: '#000'
                  }}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
              
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Position the QR code within the camera frame
              </Text>
              
              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={captureFrame}
                  leftIcon={<FiCamera />}
                >
                  Capture & Scan
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
} 

export default QRScanner