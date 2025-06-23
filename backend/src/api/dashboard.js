const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PluginLog = require('../models/PluginLog');
const OfflineToken = require('../models/OfflineToken');
const PaymentQueue = require('../queue/PaymentQueue');
const PluginManager = require('../plugins/PluginManager');
const { query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * @route GET /dashboard/transactions
 * @desc Get all transactions with filtering and pagination
 */
router.get('/transactions',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'blocked', 'flagged']).withMessage('Invalid status'),
    query('type').optional().isIn(['payment', 'transfer', 'offline', 'refund']).withMessage('Invalid type'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('minAmount').optional().isFloat({ min: 0 }).withMessage('Invalid minimum amount'),
    query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Invalid maximum amount')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        startDate,
        endDate,
        minAmount,
        maxAmount
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (minAmount) filters.minAmount = parseFloat(minAmount);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount);

      const result = await Transaction.getAll(filters, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'dashboardTransactionsAPI', 
        query: req.query,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/transactions/stats
 * @desc Get transaction statistics
 */
router.get('/transactions/stats',
  [
    query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid period')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { period = '24h' } = req.query;
      const stats = await Transaction.getStats(period);

      res.status(200).json({
        success: true,
        data: {
          period,
          stats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'transactionStatsAPI', 
        period: req.query.period,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/transactions/recent
 * @desc Get recent transactions
 */
router.get('/transactions/recent',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const transactions = await Transaction.getRecent(parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          transactions: transactions.map(txn => txn.getSummary()),
          count: transactions.length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'recentTransactionsAPI', 
        limit: req.query.limit,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/logs
 * @desc Get plugin execution logs with filtering
 */
router.get('/logs',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('pluginName').optional().isString().withMessage('Plugin name must be string'),
    query('status').optional().isIn(['success', 'failed', 'skipped']).withMessage('Invalid status'),
    query('transactionId').optional().isUUID().withMessage('Invalid transaction ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        pluginName,
        status,
        transactionId,
        startDate,
        endDate
      } = req.query;

      const filters = {};
      if (pluginName) filters.pluginName = pluginName;
      if (status) filters.status = status;
      if (transactionId) filters.transactionId = transactionId;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const result = await PluginLog.getAll(filters, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'dashboardLogsAPI', 
        query: req.query,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/logs/stats
 * @desc Get plugin execution statistics
 */
router.get('/logs/stats',
  [
    query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid period'),
    query('pluginName').optional().isString().withMessage('Plugin name must be string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { period = '24h', pluginName } = req.query;
      const stats = await PluginLog.getStats(pluginName, period);

      res.status(200).json({
        success: true,
        data: {
          period,
          pluginName: pluginName || 'all',
          stats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'pluginStatsAPI', 
        period: req.query.period,
        pluginName: req.query.pluginName,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/queue
 * @desc Get payment queue status
 */
router.get('/queue', async (req, res) => {
  try {
    const queueStatus = PaymentQueue.getStatus();

    res.status(200).json({
      success: true,
      data: queueStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.logError(error, { 
      action: 'queueStatusAPI',
      ip: req.ip 
    });

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /dashboard/plugins
 * @desc Get plugin information and status
 */
router.get('/plugins', async (req, res) => {
  try {
    const pluginsInfo = PluginManager.getAllPluginsInfo();

    res.status(200).json({
      success: true,
      data: {
        plugins: pluginsInfo,
        count: Object.keys(pluginsInfo).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.logError(error, { 
      action: 'pluginsInfoAPI',
      ip: req.ip 
    });

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /dashboard/tokens
 * @desc Get offline tokens with filtering
 */
router.get('/tokens',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('status').optional().isIn(['active', 'used', 'expired', 'cancelled']).withMessage('Invalid status'),
    query('userId').optional().isUUID().withMessage('Invalid user ID'),
    query('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        userId,
        currency,
        startDate,
        endDate
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (userId) filters.userId = userId;
      if (currency) filters.currency = currency;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const result = await OfflineToken.getAll(filters, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'dashboardTokensAPI', 
        query: req.query,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/tokens/stats
 * @desc Get offline token statistics
 */
router.get('/tokens/stats',
  [
    query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid period')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { period = '24h' } = req.query;
      const stats = await OfflineToken.getStats(period);

      res.status(200).json({
        success: true,
        data: {
          period,
          stats
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'tokenStatsAPI', 
        period: req.query.period,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/users
 * @desc Get users with pagination
 */
router.get('/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await User.getAll(parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          users: result.users.map(user => user.getSafeData()),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'dashboardUsersAPI', 
        query: req.query,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /dashboard/overview
 * @desc Get dashboard overview with key metrics
 */
router.get('/overview', async (req, res) => {
  try {
    // Get various statistics in parallel
    const [
      transactionStats,
      pluginStats,
      tokenStats,
      queueStatus,
      recentTransactions
    ] = await Promise.all([
      Transaction.getStats('24h'),
      PluginLog.getStats(null, '24h'),
      OfflineToken.getStats('24h'),
      Promise.resolve(PaymentQueue.getStatus()),
      Transaction.getRecent(5)
    ]);

    const overview = {
      summary: {
        totalTransactions: transactionStats.total,
        successRate: `${transactionStats.successRate}%`,
        totalAmount: transactionStats.totalAmount,
        activeTokens: tokenStats.byStatus.active || 0,
        queueLength: queueStatus.queueLength,
        pluginSuccessRate: `${pluginStats.successRate}%`
      },
      transactions: {
        byStatus: transactionStats.byStatus,
        byType: transactionStats.byType,
        byCurrency: transactionStats.byCurrency
      },
      plugins: {
        byStatus: pluginStats.byStatus,
        byPlugin: pluginStats.byPlugin,
        avgExecutionTime: `${pluginStats.avgExecutionTime}ms`
      },
      tokens: {
        byStatus: tokenStats.byStatus,
        byCurrency: tokenStats.byCurrency,
        redemptionRate: `${tokenStats.redemptionRate}%`
      },
      queue: {
        processing: queueStatus.processing,
        queueLength: queueStatus.queueLength,
        activeJobs: queueStatus.activeJobs,
        totalProcessed: queueStatus.stats.totalJobsProcessed,
        totalFailed: queueStatus.stats.totalJobsFailed
      },
      recentActivity: recentTransactions.map(txn => txn.getSummary())
    };

    res.status(200).json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString(),
      period: '24h'
    });

  } catch (error) {
    logger.logError(error, { 
      action: 'dashboardOverviewAPI',
      ip: req.ip 
    });

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 