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
import { FiSquare, FiDownload, FiRefreshCw, FiCamera, FiActivity, FiCheckCircle, FiX, FiPlus, FiCopy } from 'react-icons/fi'

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
  const qrImageRef = useRef<HTMLImageElement>(null)
  const toast = useToast()

  useEffect(() => { setMounted(true) }, [])

  const generateQR = async () => {
    setLoading(true)
    try {
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
        color: { dark: '#000000', light: '#FFFFFF' }
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
              </VStack>
              <HStack spacing={2}>
                <Button size="xs" leftIcon={<FiDownload />} onClick={() => {
                  const link = document.createElement('a')
                  link.href = qrData.qr_image_base64
                  link.download = `pinkpay-qr-${qrData.qr_id}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}>
                  Download PNG
                </Button>
                <Button size="xs" leftIcon={<FiCopy />} onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(qrData.qr_code, null, 2))
                }}>
                  Copy Data
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}