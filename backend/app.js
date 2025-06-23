const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import utilities and configuration
const config = require('./src/utils/config');
const logger = require('./src/utils/logger');
const { initializeDatabase, testConnection } = require('./src/db/supabase');

// Import API routes
const paymentsRouter = require('./src/api/payments');
const dashboardRouter = require('./src/api/dashboard');
const qrRouter = require('./src/api/qr');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with actual frontend domain
    : ['http://localhost:3000', 'http://localhost:19006'], // Local development (React on 3000, backend on 8000)
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// API Routes
app.use('/api', paymentsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/qr', qrRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PinkPay Payment Switch API',
    version: config.app.version,
    environment: config.app.env,
    timestamp: new Date().toISOString(),
    endpoints: {
      payments: {
        pay: 'POST /api/pay',
        payOffline: 'POST /api/payoffline',
        status: 'GET /api/status/:txnId',
        refund: 'POST /api/refund',
        health: 'GET /api/health'
      },
      qr: {
        generateDuitNow: 'POST /api/qr/generate/duitnow',
        generateMethod: 'POST /api/qr/generate/:method',
        scan: 'GET /api/qr/scan/:qrId',
        redirect: 'GET /api/qr/redirect',
        methods: 'GET /api/qr/methods',
        stats: 'GET /api/qr/stats',
        health: 'GET /api/qr/health'
      },
      dashboard: {
        overview: 'GET /api/dashboard/overview',
        transactions: 'GET /api/dashboard/transactions',
        transactionStats: 'GET /api/dashboard/transactions/stats',
        logs: 'GET /api/dashboard/logs',
        pluginStats: 'GET /api/dashboard/logs/stats',
        queue: 'GET /api/dashboard/queue',
        plugins: 'GET /api/dashboard/plugins',
        tokens: 'GET /api/dashboard/tokens',
        tokenStats: 'GET /api/dashboard/tokens/stats',
        users: 'GET /api/dashboard/users'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: config.app.name,
    version: config.app.version,
    environment: config.app.env,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected' // Will be updated after DB test
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.logError(error, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = config.app.env === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Initialize and start server
async function startServer() {
  try {
    logger.info('Starting PinkPay Payment Switch...');
    
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Database connection failed');
      process.exit(1);
    }
    
    // Initialize database (create tables if needed)
    await initializeDatabase();
    
    // Start HTTP server
    const server = app.listen(config.app.port, config.app.host, () => {
      logger.info(`🚀 PinkPay Payment Switch started successfully!`);
      logger.info(`📱 Service: ${config.app.name} v${config.app.version}`);
      logger.info(`🌍 Environment: ${config.app.env}`);
      logger.info(`🔗 Server: http://${config.app.host}:${config.app.port}`);
      logger.info(`💾 Database: Connected (Supabase)`);
      logger.info(`📊 Dashboard: http://${config.app.host}:${config.app.port}/api/dashboard/overview`);
      logger.info(`🩺 Health Check: http://${config.app.host}:${config.app.port}/health`);
      logger.info('');
      logger.info('Available Endpoints:');
      logger.info('  Payment APIs:');
      logger.info(`    POST   http://${config.app.host}:${config.app.port}/api/pay`);
      logger.info(`    POST   http://${config.app.host}:${config.app.port}/api/payoffline`);
      logger.info(`    GET    http://${config.app.host}:${config.app.port}/api/status/:txnId`);
      logger.info(`    POST   http://${config.app.host}:${config.app.port}/api/refund`);
      logger.info('  Dashboard APIs:');
      logger.info(`    GET    http://${config.app.host}:${config.app.port}/api/dashboard/overview`);
      logger.info(`    GET    http://${config.app.host}:${config.app.port}/api/dashboard/transactions`);
      logger.info(`    GET    http://${config.app.host}:${config.app.port}/api/dashboard/logs`);
      logger.info(`    GET    http://${config.app.host}:${config.app.port}/api/dashboard/queue`);
      logger.info('');
      logger.info('🔌 Plugins loaded:');
      
      // Log plugin status
      const PluginManager = require('./src/plugins/PluginManager');
      const plugins = PluginManager.getAllPluginsInfo();
      Object.entries(plugins).forEach(([name, info]) => {
        logger.info(`    ${info.enabled ? '✅' : '❌'} ${info.name} v${info.version}`);
      });
      
      logger.info('');
      logger.info('🎯 Ready to process payments!');
    });

    // Store server reference for graceful shutdown
    global.server = server;

    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app; 