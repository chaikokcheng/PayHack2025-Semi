import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpoyrthyyxwawmkwemkt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// Helper functions for dashboard data
export async function getDashboardStats() {
  try {
    // Get transaction stats
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('amount, status, created_at')

    if (txnError) throw txnError

    const totalTransactions = transactions?.length || 0
    const completedTransactions = transactions?.filter(t => t.status === 'completed').length || 0
    const totalVolume = transactions
      ?.filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0

    // Get QR codes count
    const { count: qrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })

    // Get users count  
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get failed transactions
    const failedTransactions = transactions?.filter(t => t.status === 'failed').length || 0

    return {
      total_transactions: totalTransactions,
      total_volume: totalVolume,
      success_rate: Math.round(successRate * 100) / 100,
      avg_processing_time: 0.8, // Simulated for now
      active_merchants: userCount || 0,
      qr_codes_generated: qrCount || 0,
      offline_tokens: 12, // Simulated for now
      failed_transactions: failedTransactions
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export async function getRecentTransactions(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        users(full_name, phone_number)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    throw error
  }
}

export async function getActiveQRCodes(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    throw error
  }
} 

const supabaseUrl = 'https://fpoyrthyyxwawmkwemkt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// Helper functions for dashboard data
export async function getDashboardStats() {
  try {
    // Get transaction stats
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('amount, status, created_at')

    if (txnError) throw txnError

    const totalTransactions = transactions?.length || 0
    const completedTransactions = transactions?.filter(t => t.status === 'completed').length || 0
    const totalVolume = transactions
      ?.filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const successRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0

    // Get QR codes count
    const { count: qrCount } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })

    // Get users count  
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get failed transactions
    const failedTransactions = transactions?.filter(t => t.status === 'failed').length || 0

    return {
      total_transactions: totalTransactions,
      total_volume: totalVolume,
      success_rate: Math.round(successRate * 100) / 100,
      avg_processing_time: 0.8, // Simulated for now
      active_merchants: userCount || 0,
      qr_codes_generated: qrCount || 0,
      offline_tokens: 12, // Simulated for now
      failed_transactions: failedTransactions
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export async function getRecentTransactions(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        users(full_name, phone_number)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    throw error
  }
}

export async function getActiveQRCodes(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    throw error
  }
} 