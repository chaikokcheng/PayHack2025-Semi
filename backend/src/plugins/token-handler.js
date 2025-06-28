const config = require('../utils/config');
const logger = require('../utils/logger');
const OfflineToken = require('../models/OfflineToken');
const { v4: uuidv4 } = require('uuid');

class TokenHandlerPlugin {
  constructor() {
    this.name = 'token-handler';
    this.version = '1.0.0';
    this.description = 'Offline payment token generation and management';

    // Token configuration
    this.tokenConfig = {
      defaultExpiryHours: 24, // 24 hours default
      maxExpiryHours: 168, // 1 week maximum
      minAmount: 1.0,
      maxAmount: 1000.0,
      allowedMerchantTypes: ['retail', 'restaurant', 'grocery', 'transport'],
      restrictedMerchants: ['gambling', 'adult', 'crypto']
    };
  }

  /**
   * Check if plugin should be enabled for this transaction
   */
  isEnabled(transaction, context) {
    // Enable for offline token generation/redemption requests
    return transaction.type === 'offline' ||
      context.operation === 'generateToken' ||
      context.operation === 'redeemToken';
  }

  /**
   * Process token operations
   */
  async process(transaction, context) {
    const startTime = Date.now();

    try {
      logger.info(`Token Handler processing transaction ${transaction.txnId}`, {
        operation: context.operation,
        type: transaction.type,
        amount: transaction.amount
      });

      let result;

      switch (context.operation) {
        case 'generateToken':
          result = await this.generateOfflineToken(transaction, context);
          break;
        case 'redeemToken':
          result = await this.redeemOfflineToken(transaction, context);
          break;
        case 'validateToken':
          result = await this.validateOfflineToken(transaction, context);
          break;
        default:
          throw new Error(`Unknown token operation: ${context.operation}`);
      }

      result.processingTime = Date.now() - startTime;

      logger.info(`Token operation completed for transaction ${transaction.txnId}`, {
        operation: context.operation,
        success: result.success,
        tokenId: result.token?.id || context.token
      });

      return result;

    } catch (error) {
      logger.logError(error, {
        action: 'tokenOperation',
        txnId: transaction.txnId,
        operation: context.operation
      });

      return {
        success: false,
        action: 'failed',
        operation: context.operation,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generate offline payment token
   */
  async generateOfflineToken(transaction, context) {
    try {
      // Validate token generation request
      const validation = this.validateTokenGeneration(transaction, context);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      // Calculate expiry time
      const expiryHours = context.expiryHours || this.tokenConfig.defaultExpiryHours;
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      // Generate unique token
      const tokenString = this.generateUniqueToken();

      // Prepare merchant restrictions
      const merchantRestrictions = this.prepareMerchantRestrictions(context);

      // Create offline token
      const offlineToken = await OfflineToken.create({
        token: tokenString,
        userId: transaction.userId,
        amount: transaction.amount,
        currency: transaction.currency,
        expiresAt,
        merchantRestrictions
      });

      // Update transaction with token information
      await transaction.updateStatus('completed', {
        offlineToken: offlineToken.token,
        tokenId: offlineToken.id,
        expiresAt: offlineToken.expiresAt
      });

      return {
        success: true,
        action: 'generated',
        operation: 'generateToken',
        token: {
          id: offlineToken.id,
          token: offlineToken.token,
          amount: offlineToken.amount,
          currency: offlineToken.currency,
          expiresAt: offlineToken.expiresAt,
          merchantRestrictions: offlineToken.merchantRestrictions
        },
        transaction: {
          status: 'completed',
          metadata: {
            offlineToken: offlineToken.token,
            tokenId: offlineToken.id
          }
        }
      };

    } catch (error) {
      logger.logError(error, {
        action: 'generateOfflineToken',
        txnId: transaction.txnId
      });
      throw error;
    }
  }

  /**
   * Redeem offline payment token
   */
  async redeemOfflineToken(transaction, context) {
    try {
      if (!context.token) {
        throw new Error('Token is required for redemption');
      }

      // Find the offline token
      const offlineToken = await OfflineToken.findByToken(context.token);
      if (!offlineToken) {
        throw new Error('Invalid token');
      }

      // Validate token can be redeemed
      if (!offlineToken.canRedeem(context.merchantId)) {
        throw new Error('Token cannot be redeemed - expired, used, or merchant restrictions');
      }

      // Validate redemption amount
      if (transaction.amount && parseFloat(transaction.amount) !== parseFloat(offlineToken.amount)) {
        throw new Error(`Amount mismatch: expected ${offlineToken.amount}, got ${transaction.amount}`);
      }

      // Redeem the token
      await offlineToken.redeem(context.merchantId);

      // Update transaction with redemption details
      await transaction.updateStatus('completed', {
        redeemedToken: offlineToken.token,
        originalAmount: offlineToken.amount,
        redemptionMerchant: context.merchantId,
        redemptionTime: new Date().toISOString()
      });

      return {
        success: true,
        action: 'redeemed',
        operation: 'redeemToken',
        token: {
          id: offlineToken.id,
          token: offlineToken.token,
          amount: offlineToken.amount,
          currency: offlineToken.currency,
          status: 'used',
          redemptionTime: offlineToken.usedAt
        },
        redemption: {
          merchantId: context.merchantId,
          amount: offlineToken.amount,
          currency: offlineToken.currency
        },
        transaction: {
          status: 'completed',
          amount: offlineToken.amount,
          currency: offlineToken.currency
        }
      };

    } catch (error) {
      logger.logError(error, {
        action: 'redeemOfflineToken',
        txnId: transaction.txnId,
        token: context.token
      });
      throw error;
    }
  }

  /**
   * Validate offline payment token
   */
  async validateOfflineToken(transaction, context) {
    try {
      if (!context.token) {
        throw new Error('Token is required for validation');
      }

      // Find the offline token
      const offlineToken = await OfflineToken.findByToken(context.token);
      if (!offlineToken) {
        return {
          success: false,
          action: 'invalid',
          operation: 'validateToken',
          reason: 'Token not found'
        };
      }

      // Check token validity
      const isValid = offlineToken.canRedeem(context.merchantId);
      const validationDetails = {
        exists: true,
        expired: offlineToken.isExpired(),
        used: offlineToken.status === 'used',
        cancelled: offlineToken.status === 'cancelled',
        merchantAllowed: !context.merchantId || !offlineToken.merchantRestrictions.allowedMerchants ||
          offlineToken.merchantRestrictions.allowedMerchants.includes(context.merchantId),
        merchantBlocked: context.merchantId && offlineToken.merchantRestrictions.blockedMerchants &&
          offlineToken.merchantRestrictions.blockedMerchants.includes(context.merchantId)
      };

      return {
        success: true,
        action: isValid ? 'valid' : 'invalid',
        operation: 'validateToken',
        token: {
          id: offlineToken.id,
          amount: offlineToken.amount,
          currency: offlineToken.currency,
          status: offlineToken.status,
          expiresAt: offlineToken.expiresAt,
          isExpired: offlineToken.isExpired()
        },
        validation: {
          isValid,
          details: validationDetails
        }
      };

    } catch (error) {
      logger.logError(error, {
        action: 'validateOfflineToken',
        token: context.token
      });
      throw error;
    }
  }

  /**
   * Validate token generation request
   */
  validateTokenGeneration(transaction, context) {
    // Check amount limits
    if (transaction.amount < this.tokenConfig.minAmount) {
      return {
        valid: false,
        reason: `Amount too low: minimum ${this.tokenConfig.minAmount}`
      };
    }

    if (transaction.amount > this.tokenConfig.maxAmount) {
      return {
        valid: false,
        reason: `Amount too high: maximum ${this.tokenConfig.maxAmount}`
      };
    }

    // Check expiry limits
    const expiryHours = context.expiryHours || this.tokenConfig.defaultExpiryHours;
    if (expiryHours > this.tokenConfig.maxExpiryHours) {
      return {
        valid: false,
        reason: `Expiry too long: maximum ${this.tokenConfig.maxExpiryHours} hours`
      };
    }

    // Check merchant restrictions
    if (context.merchantType && this.tokenConfig.restrictedMerchants.includes(context.merchantType)) {
      return {
        valid: false,
        reason: `Restricted merchant type: ${context.merchantType}`
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique token string
   */
  generateUniqueToken() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const uuid = uuidv4().substring(0, 8);

    return `OT-${timestamp}-${random}-${uuid}`.toUpperCase();
  }

  /**
   * Prepare merchant restrictions from context
   */
  prepareMerchantRestrictions(context) {
    const restrictions = {};

    if (context.allowedMerchants && Array.isArray(context.allowedMerchants)) {
      restrictions.allowedMerchants = context.allowedMerchants;
    }

    if (context.blockedMerchants && Array.isArray(context.blockedMerchants)) {
      restrictions.blockedMerchants = context.blockedMerchants;
    }

    if (context.merchantType && this.tokenConfig.allowedMerchantTypes.includes(context.merchantType)) {
      restrictions.allowedTypes = [context.merchantType];
    }

    if (context.locationRestrictions) {
      restrictions.location = context.locationRestrictions;
    }

    return restrictions;
  }

  /**
   * Get token statistics
   */
  async getTokenStats(period = '24h') {
    try {
      return await OfflineToken.getStats(period);
    } catch (error) {
      logger.logError(error, { action: 'getTokenStats', period });
      throw error;
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens() {
    try {
      const count = await OfflineToken.cleanupExpired();
      logger.info(`Cleaned up ${count} expired tokens`);

      return {
        success: true,
        action: 'cleanup',
        expiredTokensRemoved: count
      };
    } catch (error) {
      logger.logError(error, { action: 'cleanupExpiredTokens' });
      throw error;
    }
  }

  /**
   * Get token configuration
   */
  getTokenConfiguration() {
    return {
      config: this.tokenConfig,
      version: this.version,
      supportedOperations: ['generateToken', 'redeemToken', 'validateToken']
    };
  }

  /**
   * Update token configuration
   */
  updateTokenConfiguration(newConfig) {
    this.tokenConfig = { ...this.tokenConfig, ...newConfig };
    logger.info('Token configuration updated', newConfig);
  }

  /**
   * Check if this plugin is critical
   */
  isCritical(transaction, context) {
    // Token operations are critical for offline payments
    return transaction.type === 'offline' || context.operation?.includes('Token');
  }
}

module.exports = TokenHandlerPlugin; 