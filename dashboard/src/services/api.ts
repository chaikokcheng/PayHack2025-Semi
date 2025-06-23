import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Functions

// Dashboard APIs
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getTransactions: (params?: any) => api.get('/dashboard/transactions', { params }),
  getTransactionStats: (period = '24h') => api.get(`/dashboard/transactions/stats?period=${period}`),
  getRecentTransactions: (limit = 10) => api.get(`/dashboard/transactions/recent?limit=${limit}`),
  getLogs: (params?: any) => api.get('/dashboard/logs', { params }),
  getLogStats: (period = '24h', pluginName?: string) => 
    api.get(`/dashboard/logs/stats?period=${period}${pluginName ? `&pluginName=${pluginName}` : ''}`),
  getQueueStatus: () => api.get('/dashboard/queue'),
  getPlugins: () => api.get('/dashboard/plugins'),
  getTokens: (params?: any) => api.get('/dashboard/tokens', { params }),
  getTokenStats: (period = '24h') => api.get(`/dashboard/tokens/stats?period=${period}`),
  getUsers: (params?: any) => api.get('/dashboard/users', { params }),
};

// Payment APIs
export const paymentAPI = {
  processPayment: (paymentData: any) => api.post('/pay', paymentData),
  processOfflinePayment: (operation: string, paymentData: any) => 
    api.post('/payoffline', { operation, ...paymentData }),
  getTransactionStatus: (txnId: string) => api.get(`/status/${txnId}`),
  processRefund: (txnId: string, amount?: number, reason?: string) => 
    api.post('/refund', { txnId, amount, reason }),
  healthCheck: () => api.get('/health'),
};

// QR APIs
export const qrAPI = {
  generateDuitNowQR: (paymentData: any, options?: any) => 
    api.post('/qr/generate/duitnow', { ...paymentData, ...options }),
  generateMethodQR: (method: string, paymentData: any, options?: any) => 
    api.post(`/qr/generate/${method}`, { ...paymentData, ...options }),
  handleQRScan: (qrId: string) => api.get(`/qr/scan/${qrId}`),
  getQRRedirect: (method: string, qr: string) => 
    api.get(`/qr/redirect?method=${method}&qr=${encodeURIComponent(qr)}`),
  getPaymentMethods: () => api.get('/qr/methods'),
  getQRStats: (period = '24h') => api.get(`/qr/stats?period=${period}`),
  qrHealthCheck: () => api.get('/qr/health'),
};

// Types for better TypeScript support
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'blocked' | 'flagged';
  type: 'payment' | 'transfer' | 'offline' | 'refund';
  merchantId?: string;
  merchantName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewStats {
  summary: {
    totalTransactions: number;
    successRate: string;
    totalAmount: number;
    activeTokens: number;
    queueLength: number;
    pluginSuccessRate: string;
  };
  transactions: {
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byCurrency: Record<string, number>;
  };
  plugins: {
    byStatus: Record<string, number>;
    byPlugin: Record<string, number>;
  };
}

export interface PaymentMethod {
  code: string;
  name: string;
  color: string;
  logo: string;
}

export interface QRData {
  qrId: string;
  qrImage: string;
  payload: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  description?: string;
  routingUrls?: Record<string, any>;
  expiresAt: string;
  createdAt: string;
  status: string;
  scanCount: number;
}

export default api; 