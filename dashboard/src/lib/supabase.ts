import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpoyrthyyxwawmkwemkt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Flask Backend API Configuration
const FLASK_API_BASE = 'http://localhost:8000'

// Database type definitions
export interface User {
  id: string
  phone_number: string
  email?: string
  full_name: string
  primary_wallet: string
  linked_wallets: any[]
  kyc_status: 'pending' | 'verified' | 'rejected'
  risk_score: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  txn_id: string
  user_id?: string
  amount: number
  currency: string
  original_amount?: number
  original_currency?: string
  merchant_id?: string
  merchant_name?: string
  payment_method: string
  payment_rail: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  qr_code_id?: string
  transaction_metadata: any
  processed_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface QRCode {
  id: string
  qr_code_id: string
  qr_type: string
  merchant_id?: string
  amount?: number
  currency: string
  payload: any
  qr_image_url?: string
  status: 'active' | 'scanned' | 'expired' | 'cancelled'
  scanned_at?: string
  expires_at: string
  created_at: string
}

export interface PluginLog {
  id: string
  transaction_id: string
  plugin_name: string
  plugin_version: string
  status: 'success' | 'error' | 'warning' | 'skipped'
  input_data?: any
  output_data?: any
  error_message?: string
  execution_time_ms?: number
  created_at: string
}

export interface DashboardStats {
  total_transactions: number
  total_volume: number
  success_rate: number
  avg_processing_time: number
  active_merchants: number
  qr_codes_generated: number
  offline_tokens: number
  failed_transactions: number
}

// Flask API Helper Functions
export async function flaskApiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${FLASK_API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Flask API call failed for ${endpoint}:`, error)
    throw error
  }
}

// Helper functions for dashboard data using Flask backend
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Try to get data from Flask backend first
    const response = await flaskApiCall('/api/dashboard/overview')
    
    if (response.success) {
      return {
        total_transactions: response.summary?.total_transactions || 0,
        total_volume: response.summary?.total_volume_myr || 0,
        success_rate: response.summary?.success_rate_percent || 0,
        avg_processing_time: 0.8, // Mock for now
        active_merchants: response.summary?.active_tokens || 0,
        qr_codes_generated: response.summary?.active_qr_codes || 0,
        offline_tokens: response.summary?.active_tokens || 0,
        failed_transactions: response.statistics?.transactions?.failed || 0
      }
    }
    
    // Fallback to mock data if Flask backend is not available
    return {
      total_transactions: 156,
      total_volume: 42350.75,
      success_rate: 98.7,
      avg_processing_time: 0.8,
      active_merchants: 23,
      qr_codes_generated: 89,
      offline_tokens: 12,
      failed_transactions: 2
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return mock data as fallback
    return {
      total_transactions: 156,
      total_volume: 42350.75,
      success_rate: 98.7,
      avg_processing_time: 0.8,
      active_merchants: 23,
      qr_codes_generated: 89,
      offline_tokens: 12,
      failed_transactions: 2
    }
  }
}

export async function getRecentTransactions(limit = 10) {
  try {
    // Try Flask backend first
    const response = await flaskApiCall('/api/dashboard/transactions?limit=' + limit)
    
    if (response.success && response.transactions) {
      return response.transactions
    }

    // Fallback to Supabase
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        users(full_name, phone_number)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    // Return mock data as fallback
    return []
  }
}

export async function getActiveQRCodes(limit = 10) {
  try {
    // Try Flask backend first
    const response = await flaskApiCall('/api/qr/generate', {
      method: 'POST',
      body: JSON.stringify({
        qr_type: 'tng',
        merchant_id: 'DEMO_MERCHANT',
        amount: 25.50
      })
    })

    if (response.success) {
      return [response.qr_code] // Return array format expected by dashboard
    }

    // Fallback to Supabase
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return []
  }
}

// Additional Flask API functions for dashboard functionality
export async function createPayment(paymentData: any) {
  return await flaskApiCall('/api/pay', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  })
}

export async function generateQRCode(qrData: any) {
  return await flaskApiCall('/api/qr/generate', {
    method: 'POST',
    body: JSON.stringify(qrData)
  })
}

export async function scanQRCode(scanData: any) {
  return await flaskApiCall('/api/qr/scan', {
    method: 'POST',
    body: JSON.stringify(scanData)
  })
}

export async function getSystemHealth() {
  return await flaskApiCall('/')
}

export async function runTNGBoostDemo(demoData: any) {
  return await flaskApiCall('/api/qr/demo/tng-to-boost', {
    method: 'POST',
    body: JSON.stringify(demoData)
  })
} 