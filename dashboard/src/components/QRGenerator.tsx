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
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Code,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { FiSquare, FiDownload, FiRefreshCw, FiCamera, FiActivity, FiCheckCircle, FiX } from 'react-icons/fi'

interface QRCodeData {
  qr_code: any
  qr_image_base64: string
  qr_id: string
  merchant_id: string
  amount: number
  currency: string
  expiry: string
  message: string
}

export function QRGenerator() {
  const [loading, setLoading] = useState(false)
  const [qrData, setQRData] = useState<QRCodeData | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    merchant_id: 'PAYHACK_DEMO_001',
    amount: '25.00',
    currency: 'MYR',
    description: 'Demo Payment',
    qr_type: 'merchant'
  })
  
  // Mobile Scanner Monitoring
  const [mobileUpdates, setMobileUpdates] = useState<any[]>([])
  const [latestMobileUpdate, setLatestMobileUpdate] = useState<any>(null)
  const [mobileActivity, setMobileActivity] = useState(false)
  const [liveMobileUpdate, setLiveMobileUpdate] = useState<any>(null)
  const [relatedScans, setRelatedScans] = useState<any[]>([])
  
  const qrImageRef = useRef<HTMLImageElement>(null)
  const mobilePollingRef = useRef<NodeJS.Timeout | null>(null)
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
    
    // Start polling for mobile updates
    startMobilePolling()
    
    return () => {
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
            
            // Check if this update is related to our generated QR
            const isRelatedScan = qrData && data.latest_update.qr_data && 
              (data.latest_update.qr_data.merchant_id === qrData.merchant_id ||
               data.latest_update.qr_data.qr_code_id === qrData.qr_id)
            
            if (isRelatedScan) {
              setRelatedScans(prev => [...prev, data.latest_update])
            }
            
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

  const generateQR = async () => {
    setLoading(true)
    try {
      // Try client-side generation first as it's more reliable
      await generateClientSideQR()
    } catch (error) {
      console.error('QR generation failed:', error)
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate QR code',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const generateClientSideQR = async () => {
    try {
      // Generate QR using qrcode.js library
      const QRCode = (await import('qrcode')).default
      
      const qrPayload = {
        merchant_id: formData.merchant_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        qr_type: formData.qr_type,
        qr_code_id: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        routing_info: {
          cross_wallet_compatible: true,
          supported_wallets: ['tng', 'boost', 'grabpay'],
          routing_enabled: true
        }
      }

      const qrImageDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      const clientQR = {
        qr_code: qrPayload,
        qr_image_base64: qrImageDataUrl,
        qr_id: qrPayload.qr_code_id,
        merchant_id: formData.merchant_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        expiry: qrPayload.expires_at,
        message: 'QR Code generated successfully'
      }
      
      setQRData(clientQR)
      
      toast({
        title: 'QR Code Generated',
        description: `${formData.qr_type.toUpperCase()} QR Code created successfully`,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Client-side QR generation failed:', error)
      throw error
    }
  }

  const downloadQR = () => {
    if (qrData?.qr_image_base64) {
      const link = document.createElement('a')
      link.href = qrData.qr_image_base64
      link.download = `pinkpay-qr-${qrData.qr_id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'QR Code Downloaded',
        description: `QR code saved as pinkpay-qr-${qrData.qr_id}.png`,
        status: 'success',
        duration: 2000,
      })
    }
  }

  const copyQRData = () => {
    if (qrData?.qr_code) {
      const qrText = JSON.stringify(qrData.qr_code, null, 2)
      navigator.clipboard.writeText(qrText).then(() => {
        toast({
          title: 'QR Data Copied',
          description: 'QR code data copied to clipboard',
          status: 'success',
          duration: 2000,
        })
      })
    }
  }

  const shareQR = async () => {
    if (qrData?.qr_image_base64 && navigator.share) {
      try {
        // Convert base64 to blob
        const response = await fetch(qrData.qr_image_base64)
        const blob = await response.blob()
        const file = new File([blob], `pinkpay-qr-${qrData.qr_id}.png`, { type: 'image/png' })
        
        await navigator.share({
          title: 'PinkPay QR Code',
          text: `Payment QR Code: ${qrData.currency} ${qrData.amount.toFixed(2)}`,
          files: [file]
        })
      } catch (error) {
        // Fallback to copy link
        copyQRData()
      }
    } else {
      copyQRData()
    }
  }

  if (!mounted) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text>Loading QR Generator...</Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="lg">📱</Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              QR Code Generator
            </Text>
          </HStack>
          <Badge colorScheme="purple" variant="outline">
            Live
          </Badge>
        </HStack>

        <Divider />

        {/* Form */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm">QR Type</FormLabel>
            <Select
              value={formData.qr_type}
              onChange={(e) => setFormData({ ...formData, qr_type: e.target.value })}
              size="sm"
            >
              <option value="merchant">Merchant QR</option>
              <option value="tng">TNG Wallet QR</option>
              <option value="boost">Boost Wallet QR</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Merchant ID</FormLabel>
            <Input
              value={formData.merchant_id}
              onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
              placeholder="Enter merchant ID"
              size="sm"
            />
          </FormControl>

          <HStack spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Amount</FormLabel>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Currency</FormLabel>
              <Select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                size="sm"
              >
                <option value="MYR">MYR</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
                <option value="EUR">EUR</option>
              </Select>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel fontSize="sm">Description</FormLabel>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Payment description"
              size="sm"
            />
          </FormControl>

          <Button
            colorScheme="pinkpay"
            onClick={generateQR}
            isLoading={loading}
            loadingText="Generating..."
            leftIcon={<FiSquare />}
            size="sm"
          >
            Generate QR Code
          </Button>
        </VStack>

        {/* QR Code Display */}
        {qrData && (
          <VStack spacing={4}>
            <Divider />
            
            <VStack spacing={3}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Generated QR Code
              </Text>
              
              <Center
                w="280px"
                h="280px"
                bg="white"
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                shadow="md"
              >
                {qrData.qr_image_base64 ? (
                  <Image
                    ref={qrImageRef}
                    src={qrData.qr_image_base64}
                    alt="PinkPay QR Code"
                    maxW="260px"
                    maxH="260px"
                    borderRadius="md"
                  />
                ) : (
                  <VStack spacing={2}>
                    <Text fontSize="4xl">📱</Text>
                    <Text fontSize="xs" color="gray.500">
                      Generating QR Code...
                    </Text>
                  </VStack>
                )}
              </Center>

              <VStack spacing={1} align="center">
                <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                  ID: {qrData.qr_id}
                </Text>
                <Text fontSize="sm" color="gray.800" fontWeight="bold">
                  {qrData.currency} {qrData.amount.toFixed(2)}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Type: {formData.qr_type.toUpperCase()}
                </Text>
                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                  Valid for 15 minutes
                </Badge>
              </VStack>

              <HStack spacing={2} flexWrap="wrap" justify="center">
                <Button
                  size="xs"
                  colorScheme="blue"
                  leftIcon={<FiDownload />}
                  onClick={downloadQR}
                >
                  Download PNG
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<FiRefreshCw />}
                  onClick={generateQR}
                >
                  Regenerate
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="green"
                  onClick={shareQR}
                >
                  Share
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="gray"
                  onClick={copyQRData}
                >
                  Copy Data
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}

        {/* Mobile Activity Monitoring */}
        {qrData && (mobileActivity || relatedScans.length > 0) && (
          <VStack spacing={4} align="stretch">
            <Divider />
            
            <HStack justify="space-between" align="center">
              <HStack spacing={2}>
                <Text fontSize="lg">📱</Text>
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  QR Scan Activity
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
                animation="pulse 2s infinite"
              >
                <HStack justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiActivity} color="green.500" />
                    <Text fontSize="sm" fontWeight="semibold" color="green.700">
                      {liveMobileUpdate.status === 'scan_started' && '🎯 Your QR Code Scanned!'}
                      {liveMobileUpdate.status === 'processing' && '⚡ Processing Payment...'}
                      {liveMobileUpdate.status === 'payment_success' && '✅ Payment Successful!'}
                      {liveMobileUpdate.status === 'payment_failed' && '❌ Payment Failed'}
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
                    <Flex justify="space-between" align="center">
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
                    </Flex>
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

            {relatedScans.length > 0 && !liveMobileUpdate && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Recent Scans of Your QR Code
                </Text>
                <VStack align="stretch" spacing={2}>
                  {relatedScans.slice(-3).reverse().map((scan, index) => (
                    <HStack key={index} justify="space-between" align="center" p={2} bg="blue.50" borderRadius="md">
                      <HStack spacing={2}>
                        <Icon 
                          as={scan.status === 'payment_success' ? FiCheckCircle : 
                             scan.status === 'payment_failed' ? FiX : FiActivity} 
                          color={scan.status === 'payment_success' ? 'green.500' : 
                                 scan.status === 'payment_failed' ? 'red.500' : 'blue.500'} 
                        />
                        <Text fontSize="xs" color="gray.600">
                          Mobile scan - {scan.merchant || scan.qr_data?.merchant_id}
                        </Text>
                        {scan.amount && (
                          <Text fontSize="xs" color="gray.600">
                            - MYR {scan.amount}
                          </Text>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {mobileActivity && (
              <Alert status="success" borderRadius="lg" size="sm">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">QR Code Active!</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Your generated QR code is being scanned and processed on mobile devices.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        )}

        {/* Quick Actions */}
        <VStack spacing={2}>
          <Divider />
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Quick Demo Templates
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Button
              size="xs"
              variant="outline"
              colorScheme="blue"
              onClick={() => {
                setFormData({
                  merchant_id: 'TNG_MERCHANT_001',
                  amount: '75.50',
                  currency: 'MYR',
                  description: 'TNG → Boost Demo Payment',
                  qr_type: 'tng'
                })
              }}
            >
              TNG Demo
            </Button>
            <Button
              size="xs"
              variant="outline"
              colorScheme="green"
              onClick={() => {
                setFormData({
                  merchant_id: 'BOOST_MERCHANT_001',
                  amount: '45.00',
                  currency: 'MYR',
                  description: 'Boost QR Payment',
                  qr_type: 'boost'
                })
              }}
            >
              Boost Demo
            </Button>
            <Button
              size="xs"
              variant="outline"
              colorScheme="purple"
              onClick={() => {
                setFormData({
                  merchant_id: 'MERCHANT_001',
                  amount: '125.00',
                  currency: 'MYR',
                  description: 'Universal Merchant Payment',
                  qr_type: 'merchant'
                })
              }}
            >
              Merchant Demo
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  )
}