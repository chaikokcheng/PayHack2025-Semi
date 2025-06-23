const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PluginManager = require('../plugins/PluginManager');
const PaymentQueue = require('../queue/PaymentQueue');
const logger = require('../utils/logger');
const config = require('../utils/config');

class PaymentController {
  /**
   * Process payment request
   */
  static async processPayment(paymentData, context = {}) {
    try {
      logger.info('Processing payment request', { 
        amount: paymentData.amount,
        currency: paymentData.currency,
        type: paymentData.type 
      });

      // 1. Validate payment data
      const validationResult = this.validatePaymentData(paymentData);
      if (!validationResult.valid) {
        throw new Error(validationResult.error);
      }

      // 2. Find user
      let user = null;
      if (paymentData.userId) {
        user = await User.findById(paymentData.userId);
      } else if (paymentData.userEmail) {
        user = await User.findByEmail(paymentData.userEmail);
      } else if (paymentData.userPhone) {
        user = await User.findByPhone(paymentData.userPhone);
      }

      if (!user) {
        throw new Error('User not found');
      }

      // 3. Check user can transact
      if (!user.canTransact(paymentData.amount)) {
        throw new Error('User cannot perform this transaction - insufficient balance or limits exceeded');
      }

      // 4. Create transaction
      const transaction = await Transaction.create({
        userId: user.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        type: paymentData.type || 'payment',
        paymentMethod: paymentData.paymentMethod,
        merchantId: paymentData.merchantId,
        merchantName: paymentData.merchantName,
        description: paymentData.description,
        metadata: { 
          ...paymentData.metadata,
          requestSource: context.source || 'api',
          userAgent: context.userAgent,
          ipAddress: context.ipAddress
        }
      });

      // 5. Add to payment queue for async processing
      const jobId = PaymentQueue.addJob('processPayment', {
        transactionId: transaction.id,
        context: {
          ...context,
          paymentData,
          userId: user.id,
          synchronous: context.synchronous === true
        }
      }, paymentData.priority || 0);

      // 6. Return immediate response
      const response = {
        success: true,
        txnId: transaction.txnId,
        transactionId: transaction.id,
        status: transaction.status,
        jobId,
        message: 'Payment request received and queued for processing',
        transaction: transaction.getSummary()
      };

      // 7. If synchronous processing requested, wait for completion
      if (context.synchronous === true) {
        try {
          const result = await this.processTransactionAsync(transaction.id, context);
          response.processingResult = result;
          response.message = 'Payment processed successfully';
        } catch (error) {
          response.success = false;
          response.message = `Payment processing failed: ${error.message}`;
          response.error = error.message;
        }
      }

      return response;

    } catch (error) {
      logger.logError(error, { action: 'processPayment', paymentData });
      throw error;
    }
  }

  /**
   * Process offline payment request (simplified for demo)
   */
  static async processOfflinePayment(operation, paymentData, context = {}) {
    try {
      logger.info('Processing offline payment request', { 
        operation,
        amount: paymentData.amount,
        token: paymentData.token 
      });

      // Validate operation
      if (!['generateToken', 'redeemToken', 'validateToken'].includes(operation)) {
        throw new Error(`Invalid offline payment operation: ${operation}`);
      }

      // For demo purposes, we'll create a simple transaction record
      const transaction = await Transaction.create({
        amount: paymentData.amount || 0,
        currency: paymentData.currency || 'MYR',
        type: 'offline',
        description: `Offline ${operation}`,
        metadata: { 
          operation,
          token: paymentData.token,
          requestSource: context.source || 'api'
        }
      });

      // For demo, we'll simulate immediate processing
      await transaction.updateStatus('completed', {
        operation,
        processedAt: new Date().toISOString()
      });

      return {
        success: true,
        operation,
        txnId: transaction.txnId,
        transactionId: transaction.id,
        message: `Offline payment ${operation} processed successfully`,
        transaction: transaction.getSummary()
      };

    } catch (error) {
      logger.logError(error, { action: 'processOfflinePayment', operation, paymentData });
      throw error;
    }
  }

  /**
   * Process transaction asynchronously (called by queue)
   */
  static async processTransactionAsync(transactionId, context = {}) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      logger.logTransaction(transaction.txnId, 'processing_started');

      // Process through plugins
      const pluginResult = await PluginManager.processTransaction(transaction, context);

      if (!pluginResult.success) {
        await transaction.updateStatus('failed', { 
          reason: 'Plugin processing failed',
          errors: pluginResult.errors 
        });
        throw new Error('Transaction failed during plugin processing');
      }

      // If transaction was blocked, don't proceed
      if (transaction.status === 'blocked') {
        logger.logTransaction(transaction.txnId, 'blocked_by_risk_check');
        return {
          success: false,
          status: 'blocked',
          reason: 'Transaction blocked by risk assessment',
          pluginResults: pluginResult.pluginResults
        };
      }

      // Mock payment rail processing (simplified for demo)
      const paymentRailResult = await this.mockPaymentRail(transaction);

      if (paymentRailResult.success) {
        await transaction.updateStatus('completed', {
          paymentRail: paymentRailResult.rail,
          externalTxnId: paymentRailResult.externalTxnId,
          completedAt: new Date().toISOString()
        });

        logger.logTransaction(transaction.txnId, 'completed');
      } else {
        await transaction.updateStatus('failed', {
          reason: paymentRailResult.error,
          paymentRail: paymentRailResult.rail
        });

        logger.logTransaction(transaction.txnId, 'failed', { error: paymentRailResult.error });
      }

      return {
        success: paymentRailResult.success,
        transaction: transaction.getSummary(),
        pluginResults: pluginResult.pluginResults,
        paymentRailResult,
        status: transaction.status
      };

    } catch (error) {
      logger.logError(error, { action: 'processTransactionAsync', transactionId });
      throw error;
    }
  }

  /**
   * Mock payment rail (for demo purposes)
   */
  static async mockPaymentRail(transaction) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Determine payment rail based on amount and currency
    let rail = 'duitnow';
    if (transaction.currency !== 'MYR') {
      rail = 'international';
    } else if (parseFloat(transaction.amount) > 1000) {
      rail = 'duitnow-corporate';
    }

    // 95% success rate for demo
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        rail,
        externalTxnId: `EXT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      };
    } else {
      return {
        success: false,
        rail,
        error: 'Payment processing failed at payment rail'
      };
    }
  }

  /**
   * Mock refund payment rail (for demo purposes)
   */
  static async mockRefundPaymentRail(transaction) {
    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Determine payment rail
    let rail = 'duitnow-refund';
    if (transaction.currency !== 'MYR') {
      rail = 'international-refund';
    }

    // 98% success rate for refunds (higher than payments)
    const success = Math.random() > 0.02;

    if (success) {
      return {
        success: true,
        rail,
        externalRefundId: `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      };
    } else {
      return {
        success: false,
        rail,
        error: 'Refund processing failed at payment rail'
      };
    }
  }

  /**
   * Process offline payment asynchronously (called by queue)
   */
  static async processOfflinePaymentAsync(operation, transactionId, context = {}) {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      logger.logTransaction(transaction.txnId, `offline_${operation}_started`);

      // Process through token handler plugin
      const pluginResult = await PluginManager.processPlugin('token-handler', transaction, context);

      if (!pluginResult.success) {
        await transaction.updateStatus('failed', { 
          reason: `Token ${operation} failed`,
          error: pluginResult.error 
        });
        throw new Error(`Token ${operation} failed: ${pluginResult.error}`);
      }

      logger.logTransaction(transaction.txnId, `offline_${operation}_completed`);

      return {
        success: true,
        operation,
        transaction: transaction.getSummary(),
        result: pluginResult
      };

    } catch (error) {
      logger.logError(error, { action: 'processOfflinePaymentAsync', operation, transactionId });
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  static async getTransactionStatus(txnId) {
    try {
      const transaction = await Transaction.findByTxnId(txnId);
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }

      // Get plugin logs for this transaction
      const PluginLog = require('../models/PluginLog');
      const pluginLogs = await PluginLog.findByTransactionId(transaction.id);

      return {
        success: true,
        transaction: transaction.getSummary(),
        status: transaction.status,
        pluginLogs: pluginLogs.map(log => ({
          plugin: log.pluginName,
          status: log.status,
          executionTime: log.executionTimeMs,
          createdAt: log.createdAt
        }))
      };

    } catch (error) {
      logger.logError(error, { action: 'getTransactionStatus', txnId });
      throw error;
    }
  }

  /**
   * Validate payment data
   */
  static validatePaymentData(paymentData) {
    if (!paymentData.amount || paymentData.amount <= 0) {
      return { valid: false, error: 'Invalid amount' };
    }

    if (paymentData.amount < config.limits.minAmount) {
      return { valid: false, error: `Amount below minimum: ${config.limits.minAmount}` };
    }

    if (paymentData.amount > config.limits.maxAmount) {
      return { valid: false, error: `Amount above maximum: ${config.limits.maxAmount}` };
    }

    if (!paymentData.currency) {
      return { valid: false, error: 'Currency is required' };
    }

    if (!config.currency.supported.includes(paymentData.currency)) {
      return { valid: false, error: `Unsupported currency: ${paymentData.currency}` };
    }

    if (!paymentData.userId && !paymentData.userEmail && !paymentData.userPhone) {
      return { valid: false, error: 'User identification required (userId, userEmail, or userPhone)' };
    }

    return { valid: true };
  }

  /**
   * Process refund
   */
  static async processRefund(txnId, refundAmount, reason, context = {}) {
    try {
      const originalTransaction = await Transaction.findByTxnId(txnId);
      if (!originalTransaction) {
        throw new Error('Original transaction not found');
      }

      if (originalTransaction.status !== 'completed') {
        throw new Error('Can only refund completed transactions');
      }

      // Create refund transaction
      const refundTransaction = await Transaction.create({
        userId: originalTransaction.userId,
        amount: refundAmount || originalTransaction.amount,
        currency: originalTransaction.currency,
        type: 'refund',
        description: `Refund for ${originalTransaction.txnId}: ${reason}`,
        metadata: {
          originalTxnId: originalTransaction.txnId,
          refundReason: reason,
          requestSource: context.source || 'api'
        }
      });

      // Add to queue for processing
      const jobId = PaymentQueue.addJob('refundPayment', {
        transactionId: refundTransaction.id,
        originalTxnId: originalTransaction.txnId,
        refundAmount,
        reason
      }, 2); // Higher priority for refunds

      return {
        success: true,
        refundTxnId: refundTransaction.txnId,
        originalTxnId: originalTransaction.txnId,
        refundAmount: refundAmount || originalTransaction.amount,
        jobId,
        message: 'Refund request received and queued for processing'
      };

    } catch (error) {
      logger.logError(error, { action: 'processRefund', txnId, refundAmount, reason });
      throw error;
    }
  }

  /**
   * Process refund asynchronously (called by queue)
   */
  static async processRefundAsync(transactionId, refundAmount, reason) {
    try {
      const refundTransaction = await Transaction.findById(transactionId);
      if (!refundTransaction) {
        throw new Error(`Refund transaction ${transactionId} not found`);
      }

      // Process refund through payment rails (mock for demo)
      const paymentRailResult = await this.mockRefundPaymentRail(refundTransaction);

      if (paymentRailResult.success) {
        await refundTransaction.updateStatus('completed', {
          paymentRail: paymentRailResult.rail,
          externalRefundId: paymentRailResult.externalRefundId,
          completedAt: new Date().toISOString()
        });

        // Credit user balance
        const user = await User.findById(refundTransaction.userId);
        if (user) {
          await user.updateBalance(refundTransaction.amount, 'add');
        }

        logger.logTransaction(refundTransaction.txnId, 'refund_completed');
      } else {
        await refundTransaction.updateStatus('failed', {
          reason: paymentRailResult.error,
          paymentRail: paymentRailResult.rail
        });

        logger.logTransaction(refundTransaction.txnId, 'refund_failed', { error: paymentRailResult.error });
      }

      return {
        success: paymentRailResult.success,
        transaction: refundTransaction.getSummary(),
        paymentRailResult
      };

    } catch (error) {
      logger.logError(error, { action: 'processRefundAsync', transactionId });
      throw error;
    }
  }
}

module.exports = PaymentController; 