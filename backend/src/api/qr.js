const express = require('express');
const router = express.Router();
const QRService = require('../services/QRService');
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
 * @route POST /qr/generate/duitnow
 * @desc Generate a DuitNow QR code with smart routing
 */
router.post('/generate/duitnow',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('merchantId').isString().isLength({ min: 1 }).withMessage('Merchant ID is required'),
    body('merchantName').isString().isLength({ min: 1 }).withMessage('Merchant name is required'),
    body('description').optional().isString().withMessage('Description must be string'),
    body('preferredMethod').optional().isIn(['TNG', 'GRABPAY', 'BOOST', 'SHOPEEPAY', 'MAYBANK', 'CIMB', 'DUITNOW']).withMessage('Invalid preferred method'),
    body('expiryMinutes').optional().isInt({ min: 1, max: 1440 }).withMessage('Expiry must be 1-1440 minutes'),
    body('size').optional().isInt({ min: 100, max: 1000 }).withMessage('Size must be 100-1000 pixels'),
    body('color').optional().isHexColor().withMessage('Color must be valid hex color')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const paymentData = {
        amount: parseFloat(req.body.amount),
        currency: req.body.currency || 'MYR',
        merchantId: req.body.merchantId,
        merchantName: req.body.merchantName,
        description: req.body.description,
        preferredMethod: req.body.preferredMethod
      };

      const options = {
        expiryMinutes: req.body.expiryMinutes || 30,
        size: req.body.size || 300,
        color: req.body.color
      };

      const result = await QRService.generateDuitNowQR(paymentData, options);

      res.status(200).json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || `qr_${Date.now()}`
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'generateDuitNowQR', 
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
 * @route POST /qr/generate/:method
 * @desc Generate QR code for specific payment method
 */
router.post('/generate/:method',
  [
    param('method').isIn(['TNG', 'GRABPAY', 'BOOST', 'SHOPEEPAY', 'MAYBANK', 'CIMB']).withMessage('Invalid payment method'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('merchantId').isString().isLength({ min: 1 }).withMessage('Merchant ID is required'),
    body('merchantName').isString().isLength({ min: 1 }).withMessage('Merchant name is required'),
    body('description').optional().isString().withMessage('Description must be string'),
    body('expiryMinutes').optional().isInt({ min: 1, max: 1440 }).withMessage('Expiry must be 1-1440 minutes'),
    body('size').optional().isInt({ min: 100, max: 1000 }).withMessage('Size must be 100-1000 pixels')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { method } = req.params;
      
      const paymentData = {
        amount: parseFloat(req.body.amount),
        currency: req.body.currency || 'MYR',
        merchantId: req.body.merchantId,
        merchantName: req.body.merchantName,
        description: req.body.description
      };

      const options = {
        expiryMinutes: req.body.expiryMinutes || 30,
        size: req.body.size || 300
      };

      const result = await QRService.generateMethodSpecificQR(method, paymentData, options);

      res.status(200).json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || `qr_${Date.now()}`
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'generateMethodSpecificQR', 
        method: req.params.method,
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
 * @route GET /qr/scan/:qrId
 * @desc Handle QR code scan and smart routing
 */
router.get('/scan/:qrId',
  [
    param('qrId').isUUID().withMessage('Invalid QR ID format')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { qrId } = req.params;
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip;

      const result = await QRService.handleQRScan(qrId, userAgent, ipAddress);

      res.status(200).json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'handleQRScan', 
        qrId: req.params.qrId,
        userAgent: req.get('User-Agent'),
        ip: req.ip 
      });

      res.status(404).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route GET /qr/redirect
 * @desc Handle web redirect for QR payments
 */
router.get('/redirect',
  [
    query('method').isIn(['TNG', 'GRABPAY', 'BOOST', 'SHOPEEPAY', 'MAYBANK', 'CIMB', 'DUITNOW']).withMessage('Invalid payment method'),
    query('qr').isString().withMessage('QR payload is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { method, qr } = req.query;
      const decodedPayload = decodeURIComponent(qr);

      // For web browsers, redirect to payment method's web interface or show instructions
      const paymentMethods = QRService.PAYMENT_METHODS;
      const selectedMethod = paymentMethods[method];

      if (!selectedMethod) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment method'
        });
      }

      // For demo purposes, return JSON with redirect instructions
      // In real implementation, this might redirect to actual payment URLs
      res.status(200).json({
        success: true,
        data: {
          method: selectedMethod.name,
          instructions: `Please open your ${selectedMethod.name} app and scan the QR code`,
          deepLink: `${selectedMethod.scheme}pay?qr=${encodeURIComponent(decodedPayload)}`,
          color: selectedMethod.color,
          logo: selectedMethod.logo
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.logError(error, { 
        action: 'qrRedirect', 
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
 * @route GET /qr/methods
 * @desc Get available payment methods
 */
router.get('/methods', (req, res) => {
  try {
    const methods = Object.entries(QRService.PAYMENT_METHODS).map(([key, method]) => ({
      code: key,
      name: method.name,
      color: method.color,
      logo: method.logo
    }));

    res.status(200).json({
      success: true,
      data: {
        methods,
        count: methods.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.logError(error, { 
      action: 'getPaymentMethods',
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
 * @route GET /qr/stats
 * @desc Get QR code statistics
 */
router.get('/stats',
  [
    query('period').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid period')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { period = '24h' } = req.query;
      const stats = await QRService.getQRStats(period);

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
        action: 'getQRStats', 
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
 * @route GET /qr/health
 * @desc QR service health check
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'QR Code Service',
    status: 'healthy',
    supportedMethods: Object.keys(QRService.PAYMENT_METHODS),
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 