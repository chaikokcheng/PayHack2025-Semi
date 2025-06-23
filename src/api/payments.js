const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { body, param, query, validationResult } = require('express-validator');
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
 * @route POST /pay
 * @desc Process payment request
 */
router.post('/pay',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('type').optional().isIn(['payment', 'transfer']).withMessage('Invalid payment type'),
    body('userId').optional().isUUID().withMessage('Invalid user ID format'),
    body('userEmail').optional().isEmail().withMessage('Invalid email format'),
    body('userPhone').optional().isMobilePhone().withMessage('Invalid phone format'),
    body('paymentMethod').optional().isString().withMessage('Payment method must be string'),
    body('merchantId').optional().isString().withMessage('Merchant ID must be string'),
    body('merchantName').optional().isString().withMessage('Merchant name must be string'),
    body('description').optional().isString().withMessage('Description must be string'),
    body('synchronous').optional().isBoolean().withMessage('Synchronous must be boolean')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const paymentData = {
        amount: parseFloat(req.body.amount),
        currency: req.body.currency,
        type: req.body.type || 'payment',
        userId: req.body.userId,
        userEmail: req.body.userEmail,
        userPhone: req.body.userPhone,
        paymentMethod: req.body.paymentMethod,
        merchantId: req.body.merchantId,
        merchantName: req.body.merchantName,
        description: req.body.description,
        metadata: req.body.metadata || {},
        priority: req.body.priority || 0
      };

      const context = {
        source: 'api',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        synchronous: req.body.synchronous === true,
        requestId: req.headers['x-request-id'] || `req_${Date.now()}`
      };

      const result = await PaymentController.processPayment(paymentData, context);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: context.requestId
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'paymentAPI', 
        body: req.body,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * @route POST /payoffline
 * @desc Process offline payment operations
 */
router.post('/payoffline',
  [
    body('operation').isIn(['generateToken', 'redeemToken', 'validateToken']).withMessage('Invalid operation'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('userId').optional().isUUID().withMessage('Invalid user ID format'),
    body('userEmail').optional().isEmail().withMessage('Invalid email format'),
    body('token').optional().isString().withMessage('Token must be string'),
    body('merchantId').optional().isString().withMessage('Merchant ID must be string'),
    body('expiryHours').optional().isInt({ min: 1, max: 168 }).withMessage('Expiry hours must be 1-168')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { operation } = req.body;

      // Validate required fields based on operation
      if (operation === 'generateToken') {
        if (!req.body.amount || (!req.body.userId && !req.body.userEmail)) {
          return res.status(400).json({
            success: false,
            error: 'Amount and user identification required for token generation'
          });
        }
      } else if (operation === 'redeemToken' || operation === 'validateToken') {
        if (!req.body.token) {
          return res.status(400).json({
            success: false,
            error: 'Token required for redemption/validation'
          });
        }
      }

      const paymentData = {
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        currency: req.body.currency || 'MYR',
        userId: req.body.userId,
        userEmail: req.body.userEmail,
        token: req.body.token,
        merchantId: req.body.merchantId,
        merchantName: req.body.merchantName,
        expiryHours: req.body.expiryHours,
        merchantRestrictions: req.body.merchantRestrictions || {}
      };

      const context = {
        source: 'api',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        synchronous: req.body.synchronous === true,
        requestId: req.headers['x-request-id'] || `req_${Date.now()}`
      };

      const result = await PaymentController.processOfflinePayment(operation, paymentData, context);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: context.requestId
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'offlinePaymentAPI', 
        operation: req.body.operation,
        body: req.body,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * @route GET /status/:txnId
 * @desc Get transaction status
 */
router.get('/status/:txnId',
  [
    param('txnId').isString().isLength({ min: 1 }).withMessage('Transaction ID is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { txnId } = req.params;
      const result = await PaymentController.getTransactionStatus(txnId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'statusAPI', 
        txnId: req.params.txnId,
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
 * @route POST /refund
 * @desc Process refund request
 */
router.post('/refund',
  [
    body('txnId').isString().withMessage('Transaction ID is required'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Refund amount must be positive'),
    body('reason').isString().isLength({ min: 1 }).withMessage('Refund reason is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { txnId, amount, reason } = req.body;
      
      const context = {
        source: 'api',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        requestId: req.headers['x-request-id'] || `req_${Date.now()}`
      };

      const result = await PaymentController.processRefund(txnId, amount, reason, context);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: context.requestId
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'refundAPI', 
        body: req.body,
        ip: req.ip 
      });

      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });
    }
  }
);

/**
 * @route GET /health
 * @desc Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'PinkPay Payment Switch',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router; 