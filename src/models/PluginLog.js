const { supabase } = require('../db/supabase');
const logger = require('../utils/logger');

class PluginLog {
  constructor(data) {
    this.id = data.id;
    this.transactionId = data.transaction_id;
    this.pluginName = data.plugin_name;
    this.status = data.status;
    this.inputData = data.input_data || {};
    this.outputData = data.output_data || {};
    this.errorMessage = data.error_message;
    this.executionTimeMs = data.execution_time_ms;
    this.createdAt = data.created_at;
  }

  /**
   * Create a new plugin log entry
   */
  static async create(logData) {
    try {
      const { data, error } = await supabase
        .from('plugin_logs')
        .insert([{
          transaction_id: logData.transactionId,
          plugin_name: logData.pluginName,
          status: logData.status,
          input_data: logData.inputData || {},
          output_data: logData.outputData || {},
          error_message: logData.errorMessage,
          execution_time_ms: logData.executionTimeMs
        }])
        .select()
        .single();

      if (error) throw error;

      logger.logPlugin(logData.pluginName, logData.transactionId, logData.status, {
        executionTime: logData.executionTimeMs
      });

      return new PluginLog(data);
    } catch (error) {
      logger.logError(error, { action: 'createPluginLog', ...logData });
      throw error;
    }
  }

  /**
   * Get plugin logs for a transaction
   */
  static async findByTransactionId(transactionId) {
    try {
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(log => new PluginLog(log));
    } catch (error) {
      logger.logError(error, { action: 'findPluginLogsByTransactionId', transactionId });
      throw error;
    }
  }

  /**
   * Get all plugin logs with filters
   */
  static async getAll(filters = {}, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('plugin_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.pluginName) {
        query = query.eq('plugin_name', filters.pluginName);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.transactionId) {
        query = query.eq('transaction_id', filters.transactionId);
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
        logs: data.map(log => new PluginLog(log)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        filters
      };
    } catch (error) {
      logger.logError(error, { action: 'getAllPluginLogs', filters, page, limit });
      throw error;
    }
  }

  /**
   * Get plugin performance statistics
   */
  static async getStats(pluginName = null, period = '24h') {
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

      let query = supabase
        .from('plugin_logs')
        .select('plugin_name, status, execution_time_ms')
        .gte('created_at', startDate.toISOString());

      if (pluginName) {
        query = query.eq('plugin_name', pluginName);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        byStatus: {},
        byPlugin: {},
        avgExecutionTime: 0,
        successRate: 0
      };

      let totalExecutionTime = 0;
      data.forEach(log => {
        stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
        stats.byPlugin[log.plugin_name] = (stats.byPlugin[log.plugin_name] || 0) + 1;
        
        if (log.execution_time_ms) {
          totalExecutionTime += log.execution_time_ms;
        }
      });

      stats.avgExecutionTime = stats.total > 0 ? Math.round(totalExecutionTime / stats.total) : 0;
      
      const successfulLogs = stats.byStatus.success || 0;
      stats.successRate = stats.total > 0 ? (successfulLogs / stats.total * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      logger.logError(error, { action: 'getPluginStats', pluginName, period });
      throw error;
    }
  }

  /**
   * Get recent plugin logs
   */
  static async getRecent(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('plugin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(log => new PluginLog(log));
    } catch (error) {
      logger.logError(error, { action: 'getRecentPluginLogs', limit });
      throw error;
    }
  }
}

module.exports = PluginLog; 