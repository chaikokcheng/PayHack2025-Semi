'use client'

import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsData {
  total_transactions: number
  total_volume: number
  success_rate: number
  avg_processing_time: number
  active_merchants: number
  qr_codes_generated: number
  offline_tokens: number
  failed_transactions: number
}

const transactionData = [
  { time: '00:00', transactions: 12, volume: 1500 },
  { time: '04:00', transactions: 8, volume: 950 },
  { time: '08:00', transactions: 25, volume: 3200 },
  { time: '12:00', transactions: 45, volume: 5800 },
  { time: '16:00', transactions: 38, volume: 4900 },
  { time: '20:00', transactions: 22, volume: 2800 },
]

const paymentMethodData = [
  { name: 'QR Code', value: 45, color: '#ec4899' },
  { name: 'NFC', value: 25, color: '#0088cc' },
  { name: 'Online', value: 20, color: '#10b981' },
  { name: 'Card', value: 10, color: '#f59e0b' },
]

const fallbackData: AnalyticsData = {
  total_transactions: 1247,
  total_volume: 89420.50,
  success_rate: 98.2,
  avg_processing_time: 0.8,
  active_merchants: 156,
  qr_codes_generated: 234,
  offline_tokens: 12,
  failed_transactions: 23
}

export function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/overview')
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        // Fallback data for demo
        setAnalyticsData(fallbackData)
      }
    } catch (error) {
      console.error('Analytics fetch failed:', error)
      // Fallback data for demo
      setAnalyticsData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchAnalytics()
      const interval = setInterval(fetchAnalytics, 30000)
      return () => clearInterval(interval)
    }
  }, [mounted])

  if (!mounted || loading) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text>Loading analytics...</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            📊 Real-time Analytics Dashboard
          </Text>
          <Badge colorScheme="green" variant="outline">
            Live Data
          </Badge>
        </HStack>
      </Box>

      {/* Key Metrics */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={4}>
          Key Performance Indicators
        </Text>
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <GridItem>
            <Stat>
              <StatLabel>Total Transactions</StatLabel>
              <StatNumber>{analyticsData?.total_transactions.toLocaleString()}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12.5% from yesterday
              </StatHelpText>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat>
              <StatLabel>Total Volume</StatLabel>
              <StatNumber>MYR {analyticsData?.total_volume.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                8.2% from yesterday
              </StatHelpText>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat>
              <StatLabel>Success Rate</StatLabel>
              <StatNumber>{analyticsData?.success_rate}%</StatNumber>
              <StatHelpText>
                <Progress value={analyticsData?.success_rate} colorScheme="green" size="sm" />
              </StatHelpText>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat>
              <StatLabel>Avg Processing</StatLabel>
              <StatNumber>{analyticsData?.avg_processing_time}s</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                15ms faster
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>
      </Box>

      {/* Charts */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {/* Transaction Volume Chart */}
        <GridItem>
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={4}>
              Transaction Volume (24h)
            </Text>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#ec4899" 
                  fill="#ec4899" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </GridItem>

        {/* Payment Methods Distribution */}
        <GridItem>
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={4}>
              Payment Methods Distribution
            </Text>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={4}>
              {paymentMethodData.map((method, index) => (
                <HStack key={index} spacing={2}>
                  <Box w={3} h={3} bg={method.color} borderRadius="full" />
                  <Text fontSize="sm" color="gray.600">
                    {method.name} ({method.value}%)
                  </Text>
                </HStack>
              ))}
            </Grid>
          </Box>
        </GridItem>
      </Grid>

      {/* Additional Metrics */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={4}>
          System Metrics
        </Text>
        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <GridItem>
            <Stat>
              <StatLabel>Active Merchants</StatLabel>
              <StatNumber>{analyticsData?.active_merchants}</StatNumber>
              <StatHelpText>Connected to network</StatHelpText>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat>
              <StatLabel>QR Codes Generated</StatLabel>
              <StatNumber>{analyticsData?.qr_codes_generated}</StatNumber>
              <StatHelpText>Last 24 hours</StatHelpText>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat>
              <StatLabel>Offline Tokens</StatLabel>
              <StatNumber>{analyticsData?.offline_tokens}</StatNumber>
              <StatHelpText>Active tokens</StatHelpText>
            </Stat>
          </GridItem>
          
          <GridItem>
            <Stat>
              <StatLabel>Failed Transactions</StatLabel>
              <StatNumber color="red.500">{analyticsData?.failed_transactions}</StatNumber>
              <StatHelpText>Need attention</StatHelpText>
            </Stat>
          </GridItem>
        </Grid>
      </Box>
    </VStack>
  )
} 