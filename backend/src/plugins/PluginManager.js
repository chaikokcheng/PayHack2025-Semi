const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const config = require('../utils/config');
const PluginLog = require('../models/PluginLog');

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.pluginOrder = ['fx-converter', 'risk-checker', 'token-handler'];
    this.loadPlugins();
  }

  /**
   * Load all enabled plugins
   */
  loadPlugins() {
    try {
      const pluginsDir = __dirname;
      const pluginFiles = fs.readdirSync(pluginsDir)
        .filter(file => file.endsWith('.js') && file !== 'PluginManager.js');

      pluginFiles.forEach(file => {
        try {
          const pluginName = path.basename(file, '.js');
          
          // Check if plugin is enabled
          if (!config.plugins.enabled.includes(pluginName)) {
            logger.info(`Plugin ${pluginName} is disabled, skipping...`);
            return;
          }

          const PluginClass = require(path.join(pluginsDir, file));
          const plugin = new PluginClass();

          // Validate plugin interface
          if (!this.validatePlugin(plugin)) {
            logger.error(`Plugin ${pluginName} does not implement required interface`);
            return;
          }

          this.plugins.set(pluginName, plugin);
          logger.info(`Loaded plugin: ${pluginName}`);
        } catch (error) {
          logger.logError(error, { action: 'loadPlugin', file });
        }
      });

      logger.info(`Plugin Manager initialized with ${this.plugins.size} plugins`);
    } catch (error) {
      logger.logError(error, { action: 'loadPlugins' });
    }
  }

  /**
   * Validate plugin implements required interface
   */
  validatePlugin(plugin) {
    return (
      typeof plugin.name === 'string' &&
      typeof plugin.version === 'string' &&
      typeof plugin.description === 'string' &&
      typeof plugin.process === 'function' &&
      typeof plugin.isEnabled === 'function'
    );
  }

  /**
   * Process transaction through all enabled plugins
   */
  async processTransaction(transaction, context = {}) {
    const results = {
      success: true,
      transaction,
      context,
      pluginResults: {},
      errors: []
    };

    logger.info(`Starting plugin processing for transaction: ${transaction.txnId}`);

    // Process plugins in order
    for (const pluginName of this.pluginOrder) {
      if (!this.plugins.has(pluginName)) {
        continue;
      }

      const plugin = this.plugins.get(pluginName);
      
      // Check if plugin is enabled for this transaction
      if (!plugin.isEnabled(transaction, context)) {
        logger.info(`Plugin ${pluginName} skipped for transaction ${transaction.txnId}`);
        
        await this.logPluginExecution(
          transaction.id,
          pluginName,
          'skipped',
          { transaction: transaction.getSummary(), context },
          { reason: 'Plugin disabled for this transaction' },
          null,
          0
        );
        
        continue;
      }

      try {
        const startTime = Date.now();
        
        logger.info(`Processing transaction ${transaction.txnId} through plugin: ${pluginName}`);
        
        const result = await plugin.process(transaction, context);
        
        const executionTime = Date.now() - startTime;
        
        // Log successful execution
        await this.logPluginExecution(
          transaction.id,
          pluginName,
          'success',
          { transaction: transaction.getSummary(), context },
          result,
          null,
          executionTime
        );

        // Update context with plugin result
        results.pluginResults[pluginName] = result;
        
        // Update transaction and context based on plugin result
        if (result.transaction) {
          Object.assign(transaction, result.transaction);
        }
        if (result.context) {
          Object.assign(context, result.context);
        }

        logger.logPlugin(pluginName, transaction.txnId, 'success', { 
          executionTime: `${executionTime}ms` 
        });

      } catch (error) {
        const executionTime = Date.now() - Date.now();
        
        logger.logError(error, { 
          action: 'processPlugin', 
          plugin: pluginName, 
          txnId: transaction.txnId 
        });

        // Log failed execution
        await this.logPluginExecution(
          transaction.id,
          pluginName,
          'failed',
          { transaction: transaction.getSummary(), context },
          null,
          error.message,
          executionTime
        );

        results.errors.push({
          plugin: pluginName,
          error: error.message
        });

        // Check if this is a critical plugin failure
        if (plugin.isCritical && plugin.isCritical(transaction, context)) {
          results.success = false;
          logger.error(`Critical plugin ${pluginName} failed for transaction ${transaction.txnId}`);
          break;
        }
      }
    }

    results.context = context;
    results.transaction = transaction;

    logger.info(`Plugin processing completed for transaction: ${transaction.txnId}`, {
      success: results.success,
      processedPlugins: Object.keys(results.pluginResults).length,
      errors: results.errors.length
    });

    return results;
  }

  /**
   * Log plugin execution to database
   */
  async logPluginExecution(transactionId, pluginName, status, inputData, outputData, errorMessage, executionTimeMs) {
    try {
      await PluginLog.create({
        transactionId,
        pluginName,
        status,
        inputData,
        outputData,
        errorMessage,
        executionTimeMs
      });
    } catch (error) {
      logger.logError(error, { 
        action: 'logPluginExecution', 
        transactionId, 
        pluginName 
      });
    }
  }

  /**
   * Get plugin information
   */
  getPluginInfo(pluginName) {
    if (!this.plugins.has(pluginName)) {
      return null;
    }

    const plugin = this.plugins.get(pluginName);
    return {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      enabled: config.plugins.enabled.includes(pluginName)
    };
  }

  /**
   * Get all plugins information
   */
  getAllPluginsInfo() {
    const pluginsInfo = {};
    
    for (const [name, plugin] of this.plugins) {
      pluginsInfo[name] = {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        enabled: config.plugins.enabled.includes(name)
      };
    }

    return pluginsInfo;
  }

  /**
   * Enable/disable plugin
   */
  setPluginEnabled(pluginName, enabled) {
    if (enabled) {
      if (!config.plugins.enabled.includes(pluginName)) {
        config.plugins.enabled.push(pluginName);
      }
    } else {
      const index = config.plugins.enabled.indexOf(pluginName);
      if (index > -1) {
        config.plugins.enabled.splice(index, 1);
      }
    }

    logger.info(`Plugin ${pluginName} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reload plugins
   */
  reloadPlugins() {
    this.plugins.clear();
    this.loadPlugins();
    logger.info('Plugins reloaded');
  }

  /**
   * Get plugin execution statistics
   */
  async getPluginStats(period = '24h') {
    try {
      return await PluginLog.getStats(null, period);
    } catch (error) {
      logger.logError(error, { action: 'getPluginStats', period });
      throw error;
    }
  }

  /**
   * Process single plugin for testing
   */
  async processPlugin(pluginName, transaction, context = {}) {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    const plugin = this.plugins.get(pluginName);
    
    if (!plugin.isEnabled(transaction, context)) {
      throw new Error(`Plugin ${pluginName} is not enabled for this transaction`);
    }

    const startTime = Date.now();
    const result = await plugin.process(transaction, context);
    const executionTime = Date.now() - startTime;

    await this.logPluginExecution(
      transaction.id,
      pluginName,
      'success',
      { transaction: transaction.getSummary(), context },
      result,
      null,
      executionTime
    );

    return result;
  }
}

// Export singleton instance
module.exports = new PluginManager(); 