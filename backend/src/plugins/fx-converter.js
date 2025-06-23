const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');

class FXConverterPlugin {
  constructor() {
    this.name = 'fx-converter';
    this.version = '1.0.0';
    this.description = 'Foreign exchange currency converter for international payments';
    
    // Mock exchange rates (in production, this would come from a real FX API)
    this.exchangeRates = {
      'MYR': {
        'SGD': 0.32,
        'USD': 0.24,
        'EUR': 0.22,
        'THB': 7.8,
        'IDR': 3500,
        'VND': 5600,
        'PHP': 12.5
      },
      'SGD': {
        'MYR': 3.12,
        'USD': 0.75,
        'EUR': 0.68
      },
      'USD': {
        'MYR': 4.16,
        'SGD': 1.33,
        'EUR': 0.91
      },
      'EUR': {
        'MYR': 4.57,
        'SGD': 1.47,
        'USD': 1.10
      }
    };
  }

  /**
   * Check if plugin should be enabled for this transaction
   */
  isEnabled(transaction, context) {
    // Enable if:
    // 1. Transaction currency is not MYR (base currency)
    // 2. Or if specifically requested in context
    return transaction.currency !== config.currency.base || 
           context.forceConversion === true;
  }

  /**
   * Process currency conversion
   */
  async process(transaction, context) {
    const startTime = Date.now();
    
    try {
      logger.info(`FX Converter processing transaction ${transaction.txnId}`, {
        fromCurrency: transaction.currency,
        toCurrency: config.currency.base,
        amount: transaction.amount
      });

      // If already in base currency and no forced conversion, skip
      if (transaction.currency === config.currency.base && !context.forceConversion) {
        return {
          success: true,
          action: 'skipped',
          reason: 'Already in base currency',
          originalAmount: transaction.amount,
          originalCurrency: transaction.currency,
          convertedAmount: transaction.amount,
          convertedCurrency: transaction.currency,
          exchangeRate: 1.0,
          provider: 'none'
        };
      }

      // Get exchange rate
      const exchangeRate = await this.getExchangeRate(
        transaction.currency, 
        context.targetCurrency || config.currency.base
      );

      if (!exchangeRate) {
        throw new Error(`Exchange rate not available for ${transaction.currency} to ${context.targetCurrency || config.currency.base}`);
      }

      // Calculate converted amount
      const convertedAmount = parseFloat((transaction.amount * exchangeRate).toFixed(2));
      const convertedCurrency = context.targetCurrency || config.currency.base;

      // Update transaction with conversion details
      await transaction.updateConversion(convertedAmount, convertedCurrency);

      const result = {
        success: true,
        action: 'converted',
        originalAmount: transaction.amount,
        originalCurrency: transaction.currency,
        convertedAmount,
        convertedCurrency,
        exchangeRate,
        provider: 'mock-fx-provider',
        processingTime: Date.now() - startTime,
        fees: this.calculateFees(transaction.amount, exchangeRate),
        transaction: {
          convertedAmount,
          convertedCurrency
        }
      };

      logger.info(`FX conversion completed for transaction ${transaction.txnId}`, {
        originalAmount: transaction.amount,
        originalCurrency: transaction.currency,
        convertedAmount,
        convertedCurrency,
        exchangeRate
      });

      return result;

    } catch (error) {
      logger.logError(error, { 
        action: 'fxConversion', 
        txnId: transaction.txnId,
        currency: transaction.currency 
      });

      return {
        success: false,
        action: 'failed',
        error: error.message,
        originalAmount: transaction.amount,
        originalCurrency: transaction.currency,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      // In production, this would call a real FX API
      // For demo, using mock rates
      
      if (fromCurrency === toCurrency) {
        return 1.0;
      }

      // Check if we have the rate directly
      if (this.exchangeRates[fromCurrency] && this.exchangeRates[fromCurrency][toCurrency]) {
        return this.exchangeRates[fromCurrency][toCurrency];
      }

      // Try reverse conversion
      if (this.exchangeRates[toCurrency] && this.exchangeRates[toCurrency][fromCurrency]) {
        return 1 / this.exchangeRates[toCurrency][fromCurrency];
      }

      // Try conversion through USD (cross-rate)
      if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
        const fromToUSD = this.exchangeRates[fromCurrency]?.['USD'];
        const usdToTarget = this.exchangeRates['USD']?.[toCurrency];
        
        if (fromToUSD && usdToTarget) {
          return fromToUSD * usdToTarget;
        }
      }

      // Rate not found
      return null;

    } catch (error) {
      logger.logError(error, { action: 'getExchangeRate', fromCurrency, toCurrency });
      return null;
    }
  }

  /**
   * Calculate FX conversion fees
   */
  calculateFees(amount, exchangeRate) {
    // Simple fee structure: 0.5% of transaction amount
    const feePercentage = 0.005; // 0.5%
    const baseFee = amount * feePercentage;
    
    return {
      percentage: feePercentage * 100,
      amount: parseFloat(baseFee.toFixed(2)),
      currency: 'MYR' // Fees always in base currency
    };
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies() {
    const currencies = new Set(['MYR']); // Base currency always supported
    
    // Add all currencies we have rates for
    Object.keys(this.exchangeRates).forEach(from => {
      currencies.add(from);
      Object.keys(this.exchangeRates[from]).forEach(to => {
        currencies.add(to);
      });
    });

    return Array.from(currencies).sort();
  }

  /**
   * Check if currency pair is supported
   */
  isCurrencyPairSupported(fromCurrency, toCurrency) {
    return this.getExchangeRate(fromCurrency, toCurrency) !== null;
  }

  /**
   * Update exchange rates (for production use)
   */
  async updateExchangeRates() {
    try {
      // In production, this would fetch latest rates from FX provider
      logger.info('Exchange rates updated (mock)');
      return true;
    } catch (error) {
      logger.logError(error, { action: 'updateExchangeRates' });
      return false;
    }
  }

  /**
   * Get current exchange rates
   */
  getCurrentRates() {
    return {
      provider: 'mock-fx-provider',
      lastUpdated: new Date().toISOString(),
      baseCurrency: config.currency.base,
      rates: this.exchangeRates
    };
  }

  /**
   * Check if this plugin is critical (should stop processing if it fails)
   */
  isCritical(transaction, context) {
    // Critical only if transaction is in foreign currency and no fallback
    return transaction.currency !== config.currency.base && !context.allowFXFailure;
  }
}

module.exports = FXConverterPlugin; 