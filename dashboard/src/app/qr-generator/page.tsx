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
  useColorModeValue,
} from '@chakra-ui/react'
import { FiArrowLeft, FiHome, FiCamera } from 'react-icons/fi'
import Link from 'next/link'
import { QRGenerator } from '../../components/QRGenerator'

export default function QRGeneratorPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="4xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="center">
            <HStack spacing={2}>
              <Text fontSize="4xl">📱</Text>
              <Heading size="xl" color="SatuPay.500">
                SatuPay QR Generator
              </Heading>
            </HStack>
            
            <Text color="gray.600" textAlign="center" maxW="2xl">
              Generate payment QR codes for different wallet types. 
              Support for merchant, TNG, and Boost QR codes with cross-wallet compatibility.
            </Text>

            <HStack spacing={4}>
              <Badge colorScheme="blue" variant="outline" p={2}>
                Multiple Wallet Types
              </Badge>
              <Badge colorScheme="green" variant="outline" p={2}>
                Instant Generation
              </Badge>
              <Badge colorScheme="purple" variant="outline" p={2}>
                Download & Share
              </Badge>
            </HStack>
          </VStack>

          <Divider />

          {/* Navigation */}
          <HStack spacing={4} justify="center">
            <Link href="/">
              <Button leftIcon={<FiHome />} variant="outline" size="sm">
                Dashboard Home
              </Button>
            </Link>
            <Link href="/scanner">
              <Button leftIcon={<FiCamera />} colorScheme="green" variant="outline" size="sm">
                Go to QR Scanner
              </Button>
            </Link>
            <Link href="/test-flow">
              <Button leftIcon={<FiArrowLeft />} colorScheme="blue" size="sm">
                Test Complete Flow
              </Button>
            </Link>
          </HStack>

          {/* Main Component */}
          <QRGenerator />

          {/* Footer */}
          <Box textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.500">
              Generated QR codes are compatible with SatuPay payment switch routing
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
} 