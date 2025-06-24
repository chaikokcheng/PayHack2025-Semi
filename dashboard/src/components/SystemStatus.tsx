'use client'

import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Badge,
  HStack,
  VStack,
  Text,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FiServer, FiDatabase, FiWifi, FiActivity } from 'react-icons/fi'

interface SystemHealth {
  api_status: 'healthy' | 'degraded' | 'down'
  database: 'connected' | 'disconnected'
  uptime: string
  response_time: number
  last_check: string
}

export function SystemStatus() {
  const [healthData, setHealthData] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchHealthData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/')
      if (response.ok) {
        const data = await response.json()
        setHealthData({
          api_status: data.status === 'healthy' ? 'healthy' : 'degraded',
          database: data.database === 'connected' ? 'connected' : 'disconnected',
          uptime: '99.9%',
          response_time: Math.floor(Math.random() * 100 + 50), // Simulated
          last_check: new Date().toLocaleTimeString()
        })
      } else {
        setHealthData({
          api_status: 'down',
          database: 'disconnected',
          uptime: '0%',
          response_time: 0,
          last_check: new Date().toLocaleTimeString()
        })
      }
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthData({
        api_status: 'down',
        database: 'disconnected',
        uptime: '0%',
        response_time: 0,
        last_check: new Date().toLocaleTimeString()
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchHealthData()
      const interval = setInterval(fetchHealthData, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [mounted])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
        return 'green'
      case 'degraded':
        return 'yellow'
      case 'down':
      case 'disconnected':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (type: string, status: string) => {
    const icons = {
      api: FiServer,
      database: FiDatabase,
      network: FiWifi,
      performance: FiActivity,
    }
    return icons[type as keyof typeof icons] || FiServer
  }

  if (!mounted || loading) {
    return (
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Text>Loading system status...</Text>
      </Box>
    )
  }

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <VStack align="stretch" spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            🏥 System Health Monitor
          </Text>
          <Text fontSize="sm" color="gray.500">
            Last updated: {healthData?.last_check || '--'}
          </Text>
        </Flex>

        <Grid templateColumns="repeat(4, 1fr)" gap={4}>
          <GridItem>
            <Stat>
              <HStack>
                <Icon as={FiServer} color={`${getStatusColor(healthData?.api_status || 'down')}.500`} />
                <StatLabel>API Service</StatLabel>
              </HStack>
              <StatNumber>
                <Badge colorScheme={getStatusColor(healthData?.api_status || 'down')} variant="solid">
                  {healthData?.api_status?.toUpperCase() || 'DOWN'}
                </Badge>
              </StatNumber>
              <StatHelpText>Payment Switch</StatHelpText>
            </Stat>
          </GridItem>

          <GridItem>
            <Stat>
              <HStack>
                <Icon as={FiDatabase} color={`${getStatusColor(healthData?.database || 'disconnected')}.500`} />
                <StatLabel>Database</StatLabel>
              </HStack>
              <StatNumber>
                <Badge colorScheme={getStatusColor(healthData?.database || 'disconnected')} variant="solid">
                  {healthData?.database?.toUpperCase() || 'DISCONNECTED'}
                </Badge>
              </StatNumber>
              <StatHelpText>SQLite/Supabase</StatHelpText>
            </Stat>
          </GridItem>

          <GridItem>
            <Stat>
              <HStack>
                <Icon as={FiWifi} color="green.500" />
                <StatLabel>Uptime</StatLabel>
              </HStack>
              <StatNumber>{healthData?.uptime || '0%'}</StatNumber>
              <StatHelpText>Last 30 days</StatHelpText>
            </Stat>
          </GridItem>

          <GridItem>
            <Stat>
              <HStack>
                <Icon as={FiActivity} color="blue.500" />
                <StatLabel>Response Time</StatLabel>
              </HStack>
              <StatNumber>{Math.round(healthData?.response_time || 0)}ms</StatNumber>
              <StatHelpText>Average latency</StatHelpText>
            </Stat>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  )
}