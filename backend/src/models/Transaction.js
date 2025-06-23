const { supabase } = require('../db/supabase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor(data) {
    this.id = data.id;
    this.txnId = data.txn_id;
    this.userId = data.user_id;
    this.amount = data.amount;
    this.currency = data.currency || 'MYR';
    this.convertedAmount = data.converted_amount;
    this.convertedCurrency = data.converted_currency;
    this.status = data.status || 'pending';
    this.type = data.type;
    this.paymentMethod = data.payment_method;
    this.merchantId = data.merchant_id;
    this.merchantName = data.merchant_name;
    this.description = data.description;
    this.metadata = data.metadata || {};
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Create a new transaction
   */
  static async create(transactionData) {
    try {
      const txnId = transactionData.txnId || `TXN-${Date.now()}-${uuidv4().substr(0, 8)}`;
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          txn_id: txnId,
          user_id: transactionData.userId,
          amount: transactionData.amount,
          currency: transactionData.currency || 'MYR',
          converted_amount: transactionData.convertedAmount,
          converted_currency: transactionData.convertedCurrency,
          status: transactionData.status || 'pending',
          type: transactionData.type,
          payment_method: transactionData.paymentMethod,
          merchant_id: transactionData.merchantId,
          merchant_name: transactionData.merchantName,
          description: transactionData.description,
          metadata: transactionData.metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;

      logger.logTransaction(txnId, 'created', {
        amount: transactionData.amount,
        currency: transactionData.currency,
        type: transactionData.type
      });

      return new Transaction(data);
    } catch (error) {
      logger.logError(error, { action: 'createTransaction', ...transactionData });
      throw error;
    }
  }

  /**
   * Find transaction by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data ? new Transaction(data) : null;
    } catch (error) {
      logger.logError(error, { action: 'findTransactionById', transactionId: id });
      throw error;
    }
  }

  /**
   * Find transaction by transaction ID
   */
  static async findByTxnId(txnId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('txn_id', txnId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data ? new Transaction(data) : null;
    } catch (error) {
      logger.logError(error, { action: 'findTransactionByTxnId', txnId });
      throw error;
    }
  }

  /**
   * Get transactions by user ID
   */
  static async findByUserId(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        transactions: data.map(txn => new Transaction(txn)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.logError(error, { action: 'findTransactionsByUserId', userId });
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateStatus(status, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status,
          metadata: { ...this.metadata, ...metadata },
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      this.status = status;
      this.metadata = { ...this.metadata, ...metadata };
      this.updatedAt = data.updated_at;

      logger.logTransaction(this.txnId, 'status_updated', { 
        oldStatus: this.status, 
        newStatus: status 
      });

      return this;
    } catch (error) {
      logger.logError(error, { 
        action: 'updateTransactionStatus', 
        txnId: this.txnId, 
        status 
      });
      throw error;
    }
  }

  /**
   * Update transaction with conversion details
   */
  async updateConversion(convertedAmount, convertedCurrency) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          converted_amount: convertedAmount,
          converted_currency: convertedCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      this.convertedAmount = convertedAmount;
      this.convertedCurrency = convertedCurrency;
      this.updatedAt = data.updated_at;

      logger.logTransaction(this.txnId, 'conversion_updated', {
        originalAmount: this.amount,
        originalCurrency: this.currency,
        convertedAmount,
        convertedCurrency
      });

      return this;
    } catch (error) {
      logger.logError(error, { 
        action: 'updateTransactionConversion', 
        txnId: this.txnId 
      });
      throw error;
    }
  }

  /**
   * Get all transactions (for dashboard)
   */
  static async getAll(filters = {}, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        transactions: data.map(txn => new Transaction(txn)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        filters
      };
    } catch (error) {
      logger.logError(error, { action: 'getAllTransactions', filters, page, limit });
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  static async getStats(period = '24h') {
    try {
      let startDate;
      const now = new Date();
      
      switch (period) {
        case '1h':
          startDate = new Date(now - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now - 24 * 60 * 60 * 1000);
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('status, type, amount, currency')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        total: data.length,
        totalAmount: 0,
        byStatus: {},
        byType: {},
        byCurrency: {},
        successRate: 0
      };

      data.forEach(txn => {
        stats.totalAmount += parseFloat(txn.amount);
        
        stats.byStatus[txn.status] = (stats.byStatus[txn.status] || 0) + 1;
        stats.byType[txn.type] = (stats.byType[txn.type] || 0) + 1;
        stats.byCurrency[txn.currency] = (stats.byCurrency[txn.currency] || 0) + 1;
      });

      const successfulTxns = stats.byStatus.completed || 0;
      stats.successRate = stats.total > 0 ? (successfulTxns / stats.total * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      logger.logError(error, { action: 'getTransactionStats', period });
      throw error;
    }
  }

  /**
   * Get recent transactions for dashboard
   */
  static async getRecent(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(txn => new Transaction(txn));
    } catch (error) {
      logger.logError(error, { action: 'getRecentTransactions', limit });
      throw error;
    }
  }

  /**
   * Check if transaction is valid for processing
   */
  canProcess() {
    return this.status === 'pending' && 
           this.amount > 0 && 
           this.userId && 
           this.type;
  }

  /**
   * Get transaction summary for API response
   */
  getSummary() {
    return {
      txnId: this.txnId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      type: this.type,
      merchantName: this.merchantName,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Transaction; 