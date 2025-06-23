const config = require('../utils/config');
const logger = require('../utils/logger');
const User = require('../models/User');

class RiskCheckerPlugin {
  constructor() {
    this.name = 'risk-checker';
    this.version = '1.0.0';
    this.description = 'Risk assessment and fraud detection for transactions';
    
    // Risk thresholds and rules
    this.riskThresholds = {
      highValue: config.plugins.riskThresholdAmount || 10000,
      velocityLimit: 5, // Max transactions per hour
      velocityAmount: 20000, // Max amount per hour
      suspiciousCountries: ['XX', 'YY'], // Mock suspicious country codes
      offHours: { start: 23, end: 6 }, // 11 PM to 6 AM
      maxDailyAmount: 50000
    };

    // Risk scoring weights
    this.riskWeights = {
      amount: 0.3,
      velocity: 0.25,
      time: 0.15,
      location: 0.15,
      merchant: 0.1,
      user: 0.05
    };
  }

  /**
   * Check if plugin should be enabled for this transaction
   */
  isEnabled(transaction, context) {
    // Risk checking is enabled for all transactions except test transactions
    return context.skipRiskCheck !== true;
  }

  /**
   * Process risk assessment
   */
  async process(transaction, context) {
    const startTime = Date.now();
    
    try {
      logger.info(`Risk Checker processing transaction ${transaction.txnId}`, {
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type
      });

      // Perform various risk checks
      const riskAssessment = await this.performRiskAssessment(transaction, context);
      
      // Determine action based on risk score
      const action = this.determineAction(riskAssessment);
      
      // Update transaction status if blocked
      if (action.block) {
        await transaction.updateStatus('blocked', {
          riskScore: riskAssessment.totalScore,
          blockReason: action.reason,
          riskFactors: riskAssessment.factors
        });
      } else if (action.flag) {
        await transaction.updateStatus('flagged', {
          riskScore: riskAssessment.totalScore,
          flagReason: action.reason,
          riskFactors: riskAssessment.factors
        });
      }

      const result = {
        success: true,
        action: action.block ? 'blocked' : (action.flag ? 'flagged' : 'approved'),
        riskScore: riskAssessment.totalScore,
        riskLevel: this.getRiskLevel(riskAssessment.totalScore),
        factors: riskAssessment.factors,
        recommendation: action.reason,
        processingTime: Date.now() - startTime,
        requiresManualReview: action.flag || riskAssessment.totalScore > 70,
        transaction: action.block ? { status: 'blocked' } : null
      };

      logger.info(`Risk assessment completed for transaction ${transaction.txnId}`, {
        riskScore: riskAssessment.totalScore,
        action: result.action,
        factors: riskAssessment.factors.length
      });

      return result;

    } catch (error) {
      logger.logError(error, { 
        action: 'riskAssessment', 
        txnId: transaction.txnId 
      });

      return {
        success: false,
        action: 'failed',
        error: error.message,
        riskScore: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Perform comprehensive risk assessment
   */
  async performRiskAssessment(transaction, context) {
    const factors = [];
    let totalScore = 0;

    // 1. Amount-based risk
    const amountRisk = this.assessAmountRisk(transaction);
    if (amountRisk.score > 0) {
      factors.push(amountRisk);
      totalScore += amountRisk.score * this.riskWeights.amount;
    }

    // 2. Velocity risk (transaction frequency)
    const velocityRisk = await this.assessVelocityRisk(transaction);
    if (velocityRisk.score > 0) {
      factors.push(velocityRisk);
      totalScore += velocityRisk.score * this.riskWeights.velocity;
    }

    // 3. Time-based risk (off-hours transactions)
    const timeRisk = this.assessTimeRisk(transaction);
    if (timeRisk.score > 0) {
      factors.push(timeRisk);
      totalScore += timeRisk.score * this.riskWeights.time;
    }

    // 4. Location/Merchant risk
    const merchantRisk = this.assessMerchantRisk(transaction, context);
    if (merchantRisk.score > 0) {
      factors.push(merchantRisk);
      totalScore += merchantRisk.score * this.riskWeights.merchant;
    }

    // 5. User profile risk
    const userRisk = await this.assessUserRisk(transaction);
    if (userRisk.score > 0) {
      factors.push(userRisk);
      totalScore += userRisk.score * this.riskWeights.user;
    }

    return {
      totalScore: Math.min(Math.round(totalScore), 100), // Cap at 100
      factors,
      assessmentTime: new Date().toISOString()
    };
  }

  /**
   * Assess risk based on transaction amount
   */
  assessAmountRisk(transaction) {
    const amount = parseFloat(transaction.convertedAmount || transaction.amount);
    let score = 0;
    let reason = '';

    if (amount > this.riskThresholds.highValue) {
      score = Math.min(50 + (amount - this.riskThresholds.highValue) / 1000, 100);
      reason = `High value transaction: ${transaction.currency} ${amount}`;
    } else if (amount > this.riskThresholds.highValue * 0.5) {
      score = 25;
      reason = `Medium value transaction: ${transaction.currency} ${amount}`;
    }

    return score > 0 ? {
      type: 'amount',
      score: Math.round(score),
      reason,
      details: { amount, currency: transaction.currency, threshold: this.riskThresholds.highValue }
    } : { score: 0 };
  }

  /**
   * Assess velocity risk (transaction frequency)
   */
  async assessVelocityRisk(transaction) {
    try {
      // Get user's recent transactions (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // In a real implementation, you'd query the database for recent transactions
      // For demo purposes, we'll simulate this
      const recentTransactions = await this.getRecentTransactions(transaction.userId, oneHourAgo);
      
      let score = 0;
      let reason = '';

      if (recentTransactions.count > this.riskThresholds.velocityLimit) {
        score = Math.min(40 + (recentTransactions.count - this.riskThresholds.velocityLimit) * 10, 100);
        reason = `High transaction velocity: ${recentTransactions.count} transactions in last hour`;
      }

      if (recentTransactions.totalAmount > this.riskThresholds.velocityAmount) {
        const velocityScore = Math.min(30 + (recentTransactions.totalAmount - this.riskThresholds.velocityAmount) / 1000, 100);
        if (velocityScore > score) {
          score = velocityScore;
          reason = `High velocity amount: ${recentTransactions.totalAmount} in last hour`;
        }
      }

      return score > 0 ? {
        type: 'velocity',
        score: Math.round(score),
        reason,
        details: { 
          transactionCount: recentTransactions.count, 
          totalAmount: recentTransactions.totalAmount,
          timeWindow: '1 hour'
        }
      } : { score: 0 };

    } catch (error) {
      logger.logError(error, { action: 'assessVelocityRisk', userId: transaction.userId });
      return { score: 0 };
    }
  }

  /**
   * Assess time-based risk
   */
  assessTimeRisk(transaction) {
    const now = new Date();
    const hour = now.getHours();
    
    let score = 0;
    let reason = '';

    // Check if transaction is during off-hours
    if (hour >= this.riskThresholds.offHours.start || hour <= this.riskThresholds.offHours.end) {
      score = 20;
      reason = `Off-hours transaction at ${hour}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    // Weekend transactions (additional risk)
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      score += 10;
      reason += (reason ? '; ' : '') + 'Weekend transaction';
    }

    return score > 0 ? {
      type: 'time',
      score,
      reason,
      details: { hour, dayOfWeek, timestamp: now.toISOString() }
    } : { score: 0 };
  }

  /**
   * Assess merchant/location risk
   */
  assessMerchantRisk(transaction, context) {
    let score = 0;
    let reason = '';

    // Check for suspicious merchant patterns
    if (transaction.merchantId) {
      // Mock merchant risk assessment
      if (transaction.merchantId.includes('suspicious') || transaction.merchantId.includes('test')) {
        score = 30;
        reason = 'Potentially suspicious merchant';
      }
    }

    // Check for suspicious location (from context)
    if (context.userLocation && this.riskThresholds.suspiciousCountries.includes(context.userLocation.country)) {
      score = Math.max(score, 40);
      reason = `Transaction from high-risk location: ${context.userLocation.country}`;
    }

    return score > 0 ? {
      type: 'merchant',
      score,
      reason,
      details: { 
        merchantId: transaction.merchantId, 
        merchantName: transaction.merchantName,
        location: context.userLocation 
      }
    } : { score: 0 };
  }

  /**
   * Assess user profile risk
   */
  async assessUserRisk(transaction) {
    try {
      const user = await User.findById(transaction.userId);
      if (!user) {
        return {
          type: 'user',
          score: 50,
          reason: 'User not found',
          details: { userId: transaction.userId }
        };
      }

      let score = 0;
      let reason = '';

      // New user risk
      const userAge = Date.now() - new Date(user.createdAt).getTime();
      const daysSinceCreation = userAge / (1000 * 60 * 60 * 24);
      
      if (daysSinceCreation < 7) {
        score = 25;
        reason = `New user account (${Math.round(daysSinceCreation)} days old)`;
      }

      // Account status risk
      if (user.status !== 'active') {
        score = Math.max(score, 60);
        reason = `User account status: ${user.status}`;
      }

      return score > 0 ? {
        type: 'user',
        score,
        reason,
        details: { 
          userId: user.id, 
          accountAge: Math.round(daysSinceCreation),
          status: user.status 
        }
      } : { score: 0 };

    } catch (error) {
      logger.logError(error, { action: 'assessUserRisk', userId: transaction.userId });
      return {
        type: 'user',
        score: 30,
        reason: 'Unable to assess user risk',
        details: { error: error.message }
      };
    }
  }

  /**
   * Determine action based on risk assessment
   */
  determineAction(riskAssessment) {
    const score = riskAssessment.totalScore;

    if (score >= 80) {
      return {
        block: true,
        flag: false,
        reason: 'High risk transaction - automatically blocked'
      };
    } else if (score >= 60) {
      return {
        block: false,
        flag: true,
        reason: 'Medium-high risk transaction - flagged for manual review'
      };
    } else if (score >= 40) {
      return {
        block: false,
        flag: true,
        reason: 'Medium risk transaction - flagged for monitoring'
      };
    } else {
      return {
        block: false,
        flag: false,
        reason: 'Low risk transaction - approved'
      };
    }
  }

  /**
   * Get risk level description
   */
  getRiskLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score >= 20) return 'LOW';
    return 'MINIMAL';
  }

  /**
   * Mock function to get recent transactions (would query database in production)
   */
  async getRecentTransactions(userId, since) {
    // Mock data - in production this would query the database
    return {
      count: Math.floor(Math.random() * 3), // 0-2 recent transactions
      totalAmount: Math.floor(Math.random() * 5000) // Random amount
    };
  }

  /**
   * Update risk thresholds (for admin configuration)
   */
  updateRiskThresholds(newThresholds) {
    this.riskThresholds = { ...this.riskThresholds, ...newThresholds };
    logger.info('Risk thresholds updated', newThresholds);
  }

  /**
   * Get current risk configuration
   */
  getRiskConfiguration() {
    return {
      thresholds: this.riskThresholds,
      weights: this.riskWeights,
      version: this.version
    };
  }

  /**
   * Check if this plugin is critical
   */
  isCritical(transaction, context) {
    // Risk checking is critical for high-value transactions
    return parseFloat(transaction.amount) > this.riskThresholds.highValue;
  }
}

module.exports = RiskCheckerPlugin; 