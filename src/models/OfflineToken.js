const { supabase } = require('../db/supabase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class OfflineToken {
  constructor(data) {
    this.id = data.id;
    this.token = data.token;
    this.userId = data.user_id;
    this.amount = data.amount;
    this.currency = data.currency || 'MYR';
    this.status = data.status || 'active';
    this.merchantRestrictions = data.merchant_restrictions || {};
    this.expiresAt = data.expires_at;
    this.usedAt = data.used_at;
    this.createdAt = data.created_at;
  }

  /**
   * Create a new offline token
   */
  static async create(tokenData) {
    try {
      const token = tokenData.token || `OT-${Date.now()}-${uuidv4().substr(0, 8)}`;
      const expiresAt = tokenData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default

      const { data, error } = await supabase
        .from('offline_tokens')
        .insert([{
          token,
          user_id: tokenData.userId,
          amount: tokenData.amount,
          currency: tokenData.currency || 'MYR',
          status: tokenData.status || 'active',
          merchant_restrictions: tokenData.merchantRestrictions || {},
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      logger.info('Offline token created', { 
        token, 
        userId: tokenData.userId, 
        amount: tokenData.amount 
      });

      return new OfflineToken(data);
    } catch (error) {
      logger.logError(error, { action: 'createOfflineToken', ...tokenData });
      throw error;
    }
  }

  /**
   * Find token by token string
   */
  static async findByToken(token) {
    try {
      const { data, error } = await supabase
        .from('offline_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data ? new OfflineToken(data) : null;
    } catch (error) {
      logger.logError(error, { action: 'findOfflineTokenByToken', token });
      throw error;
    }
  }

  /**
   * Find tokens by user ID
   */
  static async findByUserId(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('offline_tokens')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        tokens: data.map(token => new OfflineToken(token)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.logError(error, { action: 'findOfflineTokensByUserId', userId });
      throw error;
    }
  }

  /**
   * Redeem (use) the token
   */
  async redeem(merchantId = null) {
    try {
      // Check if token is valid for redemption
      if (!this.canRedeem(merchantId)) {
        throw new Error('Token cannot be redeemed');
      }

      const { data, error } = await supabase
        .from('offline_tokens')
        .update({
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      this.status = 'used';
      this.usedAt = data.used_at;

      logger.info('Offline token redeemed', { 
        token: this.token, 
        amount: this.amount,
        merchantId 
      });

      return this;
    } catch (error) {
      logger.logError(error, { 
        action: 'redeemOfflineToken', 
        token: this.token,
        merchantId 
      });
      throw error;
    }
  }

  /**
   * Cancel the token
   */
  async cancel() {
    try {
      const { data, error } = await supabase
        .from('offline_tokens')
        .update({
          status: 'cancelled'
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      this.status = 'cancelled';

      logger.info('Offline token cancelled', { token: this.token });

      return this;
    } catch (error) {
      logger.logError(error, { action: 'cancelOfflineToken', token: this.token });
      throw error;
    }
  }

  /**
   * Check if token can be redeemed
   */
  canRedeem(merchantId = null) {
    const now = new Date();
    const expiresAt = new Date(this.expiresAt);

    // Check basic validity
    if (this.status !== 'active' || now > expiresAt) {
      return false;
    }

    // Check merchant restrictions
    if (merchantId && this.merchantRestrictions.allowedMerchants) {
      if (!this.merchantRestrictions.allowedMerchants.includes(merchantId)) {
        return false;
      }
    }

    if (merchantId && this.merchantRestrictions.blockedMerchants) {
      if (this.merchantRestrictions.blockedMerchants.includes(merchantId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if token is expired
   */
  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  /**
   * Get all tokens (for dashboard)
   */
  static async getAll(filters = {}, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('offline_tokens')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.currency) {
        query = query.eq('currency', filters.currency);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        tokens: data.map(token => new OfflineToken(token)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        filters
      };
    } catch (error) {
      logger.logError(error, { action: 'getAllOfflineTokens', filters, page, limit });
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpired() {
    try {
      const { data, error } = await supabase
        .from('offline_tokens')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', new Date().toISOString())
        .select('count');

      if (error) throw error;

      const count = data.length;
      logger.info('Expired tokens cleaned up', { count });

      return count;
    } catch (error) {
      logger.logError(error, { action: 'cleanupExpiredTokens' });
      throw error;
    }
  }

  /**
   * Get token statistics
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
        .from('offline_tokens')
        .select('status, amount, currency')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = {
        total: data.length,
        totalAmount: 0,
        byStatus: {},
        byCurrency: {},
        redemptionRate: 0
      };

      data.forEach(token => {
        stats.totalAmount += parseFloat(token.amount);
        stats.byStatus[token.status] = (stats.byStatus[token.status] || 0) + 1;
        stats.byCurrency[token.currency] = (stats.byCurrency[token.currency] || 0) + 1;
      });

      const usedTokens = stats.byStatus.used || 0;
      stats.redemptionRate = stats.total > 0 ? (usedTokens / stats.total * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      logger.logError(error, { action: 'getOfflineTokenStats', period });
      throw error;
    }
  }

  /**
   * Get token summary for API response
   */
  getSummary() {
    return {
      token: this.token,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      expiresAt: this.expiresAt,
      isExpired: this.isExpired(),
      merchantRestrictions: this.merchantRestrictions,
      createdAt: this.createdAt,
      usedAt: this.usedAt
    };
  }
}

module.exports = OfflineToken; 