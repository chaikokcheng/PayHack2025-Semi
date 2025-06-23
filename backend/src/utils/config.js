require('dotenv').config();

const config = {
  // Application Configuration
  app: {
    name: 'PinkPay Payment Switch',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://fpoyrthyyxwawmkwemkt.supabase.co',
    key: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb3lydGh5eXh3YXdta3dlbWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NTA3MzgsImV4cCI6MjA2NjIyNjczOH0.4Wa8CrK1UWBCD9E6-o41f-lDPoGgoCSAmpy2Mg-Siww'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-pinkpay-2025',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Redis Configuration (optional)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || ''
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // External Payment Rails (Mock URLs)
  paymentRails: {
    duitnow: process.env.DUITNOW_API_URL || 'https://mock-duitnow.api.dev',
    paynow: process.env.PAYNOW_API_URL || 'https://mock-paynow.api.dev',
    paypal: process.env.PAYPAL_API_URL || 'https://mock-paypal.api.dev',
    touchngo: process.env.TOUCHNGO_API_URL || 'https://mock-touchngo.api.dev',
    grabpay: process.env.GRABPAY_API_URL || 'https://mock-grabpay.api.dev'
  },

  // Plugin Configuration
  plugins: {
    enabled: (process.env.PLUGINS_ENABLED || 'fx-converter,risk-checker,token-handler').split(','),
    fxApiKey: process.env.FX_API_KEY || 'demo-fx-api-key',
    riskThresholdAmount: parseFloat(process.env.RISK_THRESHOLD_AMOUNT) || 10000
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/pinkpay.log'
  },

  // Currency Configuration
  currency: {
    base: 'MYR',
    supported: ['MYR', 'SGD', 'USD', 'EUR', 'THB', 'IDR', 'VND', 'PHP']
  },

  // Transaction Limits
  limits: {
    minAmount: 0.01,
    maxAmount: 50000,
    dailyLimit: 100000
  }
};

module.exports = config; 