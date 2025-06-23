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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiSquare, FiDownload, FiRefreshCw } from 'react-icons/fi'

interface QRCodeData {
  qr_code: string
  qr_id: string
  merchant_id: string
  amount: number
  currency: string
  expiry: string
}

export function QRGenerator() {
  const [loading, setLoading] = useState(false)
  const [qrData, setQRData] = useState<QRCodeData | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    merchant_id: 'PAYHACK_DEMO_001',
    amount: '25.00',
    currency: 'MYR',
    description: 'Demo Payment'
  })
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const generateQR = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchant_id: formData.merchant_id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQRData(data)
        toast({
          title: 'QR Code Generated',
          description: `QR Code ${data.qr_id} created successfully`,
          status: 'success',
          duration: 3000,
        })
      } else {
        // Generate a demo QR code for presentation
        const demoQR = {
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          qr_id: `QR_${Date.now()}`,
          merchant_id: formData.merchant_id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
        setQRData(demoQR)
        toast({
          title: 'Demo QR Generated',
          description: 'Demo QR code for presentation',
          status: 'info',
          duration: 3000,
        })
      }
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

  const downloadQR = () => {
    if (qrData?.qr_code) {
      const link = document.createElement('a')
      link.href = qrData.qr_code
      link.download = `qr-${qrData.qr_id}.png`
      link.click()
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
                w="200px"
                h="200px"
                bg="gray.50"
                borderRadius="lg"
                border="2px dashed"
                borderColor="gray.300"
              >
                {qrData.qr_code ? (
                  <Image
                    src={qrData.qr_code}
                    alt="QR Code"
                    maxW="180px"
                    maxH="180px"
                  />
                ) : (
                  <VStack spacing={2}>
                    <Text fontSize="4xl">📱</Text>
                    <Text fontSize="xs" color="gray.500">
                      Demo QR Code
                    </Text>
                  </VStack>
                )}
              </Center>

              <VStack spacing={1} align="center">
                <Text fontSize="xs" color="gray.600">
                  ID: {qrData.qr_id}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {qrData.currency} {qrData.amount.toFixed(2)}
                </Text>
                <Badge colorScheme="green" variant="subtle" fontSize="xs">
                  Valid for 15 minutes
                </Badge>
              </VStack>

              <HStack spacing={2}>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<FiDownload />}
                  onClick={downloadQR}
                >
                  Download
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<FiRefreshCw />}
                  onClick={generateQR}
                >
                  Regenerate
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}

        {/* Quick Actions */}
        <VStack spacing={2}>
          <Divider />
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Quick Demo
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              setFormData({
                merchant_id: 'TNG_MERCHANT_001',
                amount: '75.50',
                currency: 'MYR',
                description: 'TNG → Boost Demo Payment'
              })
            }}
          >
            Load TNG Demo
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
} 
                amount: '75.50',
                currency: 'MYR',
                description: 'TNG → Boost Demo Payment'
              })
            }}
          >
            Load TNG Demo
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
} 