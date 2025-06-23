const { supabase } = require('../db/supabase');
const logger = require('../utils/logger');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.phone = data.phone;
    this.name = data.name;
    this.status = data.status || 'active';
    this.walletBalance = data.wallet_balance || 0.00;
    this.dailyLimit = data.daily_limit || 10000.00;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          phone: userData.phone,
          name: userData.name,
          status: userData.status || 'active',
          wallet_balance: userData.walletBalance || 0.00,
          daily_limit: userData.dailyLimit || 10000.00
        }])
        .select()
        .single();

      if (error) throw error;

      logger.info('User created', { userId: data.id, email: userData.email });
      return new User(data);
    } catch (error) {
      logger.logError(error, { action: 'createUser', email: userData.email });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? new User(data) : null;
    } catch (error) {
      logger.logError(error, { action: 'findUserById', userId: id });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? new User(data) : null;
    } catch (error) {
      logger.logError(error, { action: 'findUserByEmail', email });
      throw error;
    }
  }

  /**
   * Find user by phone
   */
  static async findByPhone(phone) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? new User(data) : null;
    } catch (error) {
      logger.logError(error, { action: 'findUserByPhone', phone });
      throw error;
    }
  }

  /**
   * Update user wallet balance
   */
  async updateBalance(amount, operation = 'set') {
    try {
      let newBalance;
      
      if (operation === 'add') {
        newBalance = parseFloat(this.walletBalance) + parseFloat(amount);
      } else if (operation === 'subtract') {
        newBalance = parseFloat(this.walletBalance) - parseFloat(amount);
      } else {
        newBalance = parseFloat(amount);
      }

      // Ensure balance doesn't go negative
      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const { data, error } = await supabase
        .from('users')
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      this.walletBalance = newBalance;
      this.updatedAt = data.updated_at;

      logger.info('User balance updated', { 
        userId: this.id, 
        operation, 
        amount, 
        newBalance 
      });

      return this;
    } catch (error) {
      logger.logError(error, { 
        action: 'updateUserBalance', 
        userId: this.id, 
        operation, 
        amount 
      });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async update(updateData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;

      // Update instance properties
      Object.assign(this, new User(data));

      logger.info('User updated', { userId: this.id });
      return this;
    } catch (error) {
      logger.logError(error, { action: 'updateUser', userId: this.id });
      throw error;
    }
  }

  /**
   * Check if user can perform transaction
   */
  canTransact(amount) {
    return this.status === 'active' && 
           parseFloat(amount) <= parseFloat(this.dailyLimit) &&
           parseFloat(amount) <= parseFloat(this.walletBalance);
  }

  /**
   * Get user's safe data (without sensitive information)
   */
  getSafeData() {
    return {
      id: this.id,
      email: this.email,
      phone: this.phone,
      name: this.name,
      status: this.status,
      walletBalance: this.walletBalance,
      dailyLimit: this.dailyLimit,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Get all users (for admin/dashboard)
   */
  static async getAll(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        users: data.map(user => new User(user)),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.logError(error, { action: 'getAllUsers', page, limit });
      throw error;
    }
  }
}

module.exports = User; 