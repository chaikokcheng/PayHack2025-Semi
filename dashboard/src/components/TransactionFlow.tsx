'use client'

import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Grid,
  GridItem,
  Progress,
  Divider,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiArrowRight, FiCheckCircle, FiClock, FiZap } from 'react-icons/fi'

interface FlowStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'processing' | 'pending' | 'failed'
  duration?: string
  timestamp?: string
}

const initialFlowSteps: FlowStep[] = [
  {
    id: 'qr_scan',
    title: 'QR Code Scanned',
    description: 'Customer scans TNG merchant QR code',
    status: 'completed',
    duration: '0.1s',
    timestamp: '14:23:45'
  },
  {
    id: 'gateway_selection',
    title: 'Gateway Selection',
    description: 'SatuPay evaluates and selects the optimal path based on success rates and fees',
    status: 'completed',
    duration: '0.2s',
    timestamp: '14:23:45'
  },
  {
    id: 'routing',
    title: 'Cross-Wallet Routing',
    description: 'SatuPay routes to customer\'s Boost wallet',
    status: 'completed',
    duration: '0.3s',
    timestamp: '14:23:45'
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Customer authorizes payment in Boost app',
    status: 'processing',
    duration: '2.1s',
    timestamp: '14:23:47'
  },
  {
    id: 'settlement',
    title: 'Settlement',
    description: 'Funds transfer between wallets',
    status: 'pending',
    duration: '-',
    timestamp: '-'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Payment confirmation to merchant & customer',
    status: 'pending',
    duration: '-',
    timestamp: '-'
  }
]

export function TransactionFlow() {
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>(initialFlowSteps)
  const [currentStep, setCurrentStep] = useState(2)
  const [mounted, setMounted] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Simulate flow progression for demo
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < initialFlowSteps.length - 1) {
          const newSteps = [...initialFlowSteps]
          if (prev > 0) {
            newSteps[prev - 1].status = 'completed'
          }
          newSteps[prev].status = 'processing'
          setFlowSteps(newSteps)
          return prev + 1
        } else {
          // Complete the flow
          const newSteps = [...initialFlowSteps]
          newSteps[prev - 1].status = 'completed'
          newSteps[prev].status = 'completed'
          newSteps[prev].duration = '0.8s'
          newSteps[prev].timestamp = new Date().toLocaleTimeString()
          setFlowSteps(newSteps)
          return prev
        }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [mounted])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'processing':
        return 'blue'
      case 'pending':
        return 'gray'
      case 'failed':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return FiCheckCircle
      case 'processing':
        return FiZap
      case 'pending':
        return FiClock
      default:
        return FiClock
    }
  }

  if (!mounted) {
    return (
      <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
        <Text>Loading transaction flow...</Text>
      </Box>
    )
  }

  const completedSteps = flowSteps.filter(step => step.status === 'completed').length
  const progressPercentage = (completedSteps / flowSteps.length) * 100

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              🔄 Live Transaction Flow: TNG → Boost Demo
            </Text>
            <Text fontSize="sm" color="gray.600">
              Real-time cross-wallet payment orchestration
            </Text>
          </VStack>
          <VStack align="end" spacing={1}>
            <Badge colorScheme={progressPercentage === 100 ? 'green' : 'blue'} variant="solid">
              {progressPercentage === 100 ? 'COMPLETED' : 'PROCESSING'}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              Step {Math.min(currentStep + 1, flowSteps.length)} of {flowSteps.length}
            </Text>
          </VStack>
        </Flex>

        {/* Progress Bar */}
        <VStack spacing={2}>
          <Progress 
            value={progressPercentage} 
            colorScheme="SatuPay" 
            size="lg" 
            borderRadius="full"
            w="100%"
          />
          <Text fontSize="xs" color="gray.500">
            {progressPercentage.toFixed(0)}% Complete
          </Text>
        </VStack>

        <Divider />

        {/* Flow Steps */}
        <Grid templateColumns="repeat(6, 1fr)" gap={4}>
          {flowSteps.map((step, index) => (
            <GridItem key={step.id}>
              <VStack spacing={3} align="stretch">
                {/* Step Indicator */}
                <VStack spacing={2}>
                  <Box
                    w={12}
                    h={12}
                    borderRadius="full"
                    bg={`${getStatusColor(step.status)}.100`}
                    border="2px solid"
                    borderColor={`${getStatusColor(step.status)}.500`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    position="relative"
                  >
                    <Icon 
                      as={getStatusIcon(step.status)} 
                      color={`${getStatusColor(step.status)}.500`}
                      size="20px"
                    />
                    {step.status === 'processing' && (
                      <Box
                        position="absolute"
                        w="100%"
                        h="100%"
                        borderRadius="full"
                        border="2px solid"
                        borderColor={`${getStatusColor(step.status)}.300`}
                        animation="pulse 2s infinite"
                      />
                    )}
                  </Box>
                  
                  <Badge 
                    colorScheme={getStatusColor(step.status)} 
                    variant="subtle"
                    fontSize="xs"
                  >
                    {step.status.toUpperCase()}
                  </Badge>
                </VStack>

                {/* Step Content */}
                <VStack spacing={1} align="center" textAlign="center">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                    {step.title}
                  </Text>
                  <Text fontSize="xs" color="gray.600" lineHeight="1.3">
                    {step.description}
                  </Text>
                  
                  {step.duration && step.duration !== '-' && (
                    <HStack spacing={1}>
                      <Icon as={FiClock} size="10px" color="gray.400" />
                      <Text fontSize="xs" color="gray.500">
                        {step.duration}
                      </Text>
                    </HStack>
                  )}
                  
                  {step.timestamp && step.timestamp !== '-' && (
                    <Text fontSize="xs" color="gray.400">
                      {step.timestamp}
                    </Text>
                  )}
                </VStack>

                {/* Arrow to next step */}
                {index < flowSteps.length - 1 && (
                  <Box
                    position="absolute"
                    right="-20px"
                    top="24px"
                    zIndex={1}
                  >
                    <Icon 
                      as={FiArrowRight} 
                      color="gray.400" 
                      size="16px"
                    />
                  </Box>
                )}
              </VStack>
            </GridItem>
          ))}
        </Grid>

        <Divider />

        {/* Summary Stats */}
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <GridItem>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="SatuPay.500">
                2.4s
              </Text>
              <Text fontSize="xs" color="gray.600">
                Total Processing Time
              </Text>
            </VStack>
          </GridItem>
          
          <GridItem>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                99.2%
              </Text>
              <Text fontSize="xs" color="gray.600">
                Success Rate
              </Text>
            </VStack>
          </GridItem>
          
          <GridItem>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color="blue.500">
                MYR 75.50
              </Text>
              <Text fontSize="xs" color="gray.600">
                Transaction Value
              </Text>
            </VStack>
          </GridItem>
        </Grid>

        {/* Demo Controls */}
        <VStack spacing={2}>
          <Divider />
          <Text fontSize="xs" color="gray.500" textAlign="center">
            🎬 Demo automatically simulates payment flow progression
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
} 