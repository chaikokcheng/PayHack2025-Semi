import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureTokenManager from '../utils/SecureTokenManager';
import CONFIG, { getDebugInfo } from '../utils/config';
import { Platform } from 'react-native';

// API Configuration for different environments
const getApiUrl = () => {
    // Check if we're in development mode
    if (__DEV__) {
        // For Android Emulator
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8000';
        }
        // For iOS Simulator
        else if (Platform.OS === 'ios') {
            return 'http://127.0.0.1:8000';
        }
    }

    // For physical devices or production, use your computer's IP address
    // You can change this to your actual IP address
    return 'http://192.168.1.100:8000'; // Replace with your computer's IP
};

// Base URL for API calls - automatically configured for environment
const API_URL = getApiUrl();

// Mock user ID - replace with real authenticated user ID in production
const USER_ID = CONFIG.USER_ID;

class OfflineTokenService {
    constructor() {
        this.balance = 0;
        this.initialized = false;
        this.API_BASE_URL = CONFIG.API_BASE_URL;

        // Log the API URL being used for debugging
        console.log(`🔗 OfflineTokenService initialized with API URL: ${this.API_BASE_URL}`);
        console.log(`📱 Debug Info:`, getDebugInfo());
    }

    /**
     * Initialize the service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load user balance
            await this.loadBalance();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize OfflineTokenService:', error);
            throw error;
        }
    }

    /**
     * Load user balance from storage
     */
    async loadBalance() {
        try {
            const balanceStr = await AsyncStorage.getItem('userBalance');
            this.balance = balanceStr ? parseFloat(balanceStr) : 300.00; // Default 300 MYR
        } catch (error) {
            console.error('Error loading balance:', error);
            this.balance = 300.00; // Default if error
        }
    }

    /**
     * Save user balance to storage
     */
    async saveBalance(newBalance) {
        try {
            this.balance = newBalance;
            await AsyncStorage.setItem('userBalance', newBalance.toString());
        } catch (error) {
            console.error('Error saving balance:', error);
            throw error;
        }
    }

    /**
     * Get current balance
     */
    getBalance() {
        return this.balance;
    }

    /**
     * Create offline authorization token (not fund allocation)
     */
    async createOfflineToken(amount, currency = 'MYR', expiryHours = 72) {
        try {
            // Check if we have enough balance (for authorization limit, not fund allocation)
            if (amount > this.balance) {
                throw new Error('Insufficient balance for authorization limit');
            }

            // In real app, call server API to create authorization token
            const isOnline = await this.checkConnectivity();

            if (!isOnline) {
                throw new Error('Internet connection required to create authorization token');
            }

            // Call server API to create token
            const response = await fetch(`${this.API_BASE_URL}${CONFIG.API_ENDPOINTS.CREATE_OFFLINE_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: USER_ID,
                    amount: amount,
                    currency: currency,
                    device_id: await this.getDeviceFingerprint()
                })
            });

            const result = await response.json();

            if (result.success) {
                // Save authorization token to secure storage
                await SecureTokenManager.saveOfflineToken(result.token);

                // Note: We DON'T reduce balance here - this is just authorization permission
                // Actual funds will be deducted when payee goes online and settles with server

                return result.token;
            } else {
                throw new Error(result.message || 'Failed to create token');
            }
        } catch (error) {
            console.error('Error creating offline authorization token:', error);
            throw error;
        }
    }

    /**
     * Get all offline tokens
     */
    async getOfflineTokens() {
        try {
            return await SecureTokenManager.getOfflineTokens();
        } catch (error) {
            console.error('Error retrieving offline tokens:', error);
            return [];
        }
    }

    /**
     * Get active offline tokens (not expired or used)
     */
    async getActiveOfflineTokens() {
        try {
            const tokens = await SecureTokenManager.getOfflineTokens();
            const now = new Date();

            return tokens.filter(token =>
                token.status === 'active' &&
                new Date(token.expires_at) > now &&
                parseFloat(token.remaining_balance || token.amount) > 0
            );
        } catch (error) {
            console.error('Error retrieving active offline tokens:', error);
            return [];
        }
    }

    /**
     * Check if device is online
     */
    async checkConnectivity() {
        // In real app, check actual network connectivity
        // For demo, simulate connectivity check
        return Math.random() > 0.1; // 90% chance of being online
    }

    /**
     * Get offline transactions
     */
    async getOfflineTransactions() {
        try {
            return await SecureTokenManager.getOfflineTransactions();
        } catch (error) {
            console.error('Error retrieving offline transactions:', error);
            return [];
        }
    }

    /**
     * Get pending transactions (not yet synced)
     */
    async getPendingTransactions() {
        try {
            const transactions = await SecureTokenManager.getOfflineTransactions();
            return transactions.filter(tx => tx.syncStatus === 'pending');
        } catch (error) {
            console.error('Error retrieving pending transactions:', error);
            return [];
        }
    }

    /**
     * Sync offline transactions with server (settlement)
     */
    async syncTransactions() {
        try {
            const isOnline = await this.checkConnectivity();

            if (!isOnline) {
                throw new Error('No internet connection');
            }

            // Get pending transactions
            const pendingTransactions = await this.getPendingTransactions();

            if (pendingTransactions.length === 0) {
                return {
                    success: true,
                    message: 'No pending transactions to sync',
                    count: 0
                };
            }

            let syncedCount = 0;
            let failedCount = 0;

            // Process each pending transaction
            for (const transaction of pendingTransactions) {
                try {
                    // Call server API to settle the transaction
                    const response = await fetch(`${this.API_BASE_URL}${CONFIG.API_ENDPOINTS.SYNC_OFFLINE_TRANSACTION}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            offline_tx_id: transaction.id,
                            token_id: transaction.token_id,
                            sender_id: transaction.sender_id,
                            recipient_id: transaction.recipient_id,
                            amount: transaction.amount,
                            device_id: transaction.device_id
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Update transaction status to synced
                        await SecureTokenManager.updateTransactionStatus(transaction.id, 'synced');

                        // Update local balance if this is an outgoing transaction
                        if (transaction.type === 'outgoing') {
                            const newBalance = this.balance - parseFloat(transaction.amount);
                            await this.saveBalance(newBalance);
                        }

                        // Update token remaining balance
                        if (result.sync_result?.balance_updates) {
                            await SecureTokenManager.updateTokenRemainingBalance(
                                transaction.token_id,
                                result.sync_result.balance_updates.sender_balance
                            );
                        }

                        syncedCount++;
                    } else {
                        console.error('Failed to sync transaction:', result.message);
                        failedCount++;
                    }
                } catch (error) {
                    console.error('Error syncing transaction:', error);
                    failedCount++;
                }
            }

            return {
                success: true,
                message: `Synced ${syncedCount} transactions${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
                count: syncedCount,
                failed: failedCount
            };

        } catch (error) {
            console.error('Error syncing transactions:', error);
            throw error;
        }
    }

    /**
     * Delete an offline authorization token
     */
    async deleteOfflineToken(tokenId) {
        try {
            // Get the token to check if it's active
            const tokens = await SecureTokenManager.getOfflineTokens();
            const token = tokens.find(t => t.token_id === tokenId);

            if (!token) {
                throw new Error('Token not found');
            }

            if (token.status !== 'active') {
                throw new Error('Can only delete active tokens');
            }

            // Check if token is expired
            const now = new Date();
            if (new Date(token.expires_at) <= now) {
                throw new Error('Cannot delete expired tokens');
            }

            // Delete token from secure storage
            await SecureTokenManager.deleteOfflineToken(tokenId);

            // Note: No balance refund needed since authorization tokens don't allocate funds
            // The token was just permission to transfer, not actual fund allocation

            return { success: true, message: 'Authorization token deleted successfully' };
        } catch (error) {
            console.error('Error deleting offline authorization token:', error);
            throw error;
        }
    }

    /**
     * Create an offline transaction (authorization-based, not fund allocation)
     */
    async createOfflineTransaction(amount, recipientDeviceId, type = 'outgoing') {
        try {
            // Check if we have enough authorization balance
            const balanceCheck = await this.checkAuthorizationBalance(amount);

            if (!balanceCheck.hasEnough) {
                throw new Error(`Insufficient authorization balance. Available: RM ${balanceCheck.availableBalance.toFixed(2)}, Required: RM ${balanceCheck.requiredAmount.toFixed(2)}`);
            }

            // Create the transaction record (this is just a pending transaction, not fund transfer)
            const transaction = {
                id: `offline_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                amount: amount,
                currency: 'MYR',
                type: type, // 'outgoing' or 'incoming'
                recipientDeviceId: recipientDeviceId,
                senderDeviceId: await this.getDeviceFingerprint(),
                status: 'pending_settlement', // Pending until payee goes online
                syncStatus: 'pending',
                timestamp: new Date().toISOString(),
                description: type === 'outgoing' ? 'Offline payment sent (pending settlement)' : 'Offline payment received (pending settlement)',
                settlementRequired: true // Flag that this needs online settlement
            };

            // Save transaction to local storage (this is just a record, not fund transfer)
            await SecureTokenManager.saveOfflineTransaction(transaction);

            // Update authorization token balances IMMEDIATELY (reduce available authorization)
            if (type === 'outgoing') {
                await this.updateAuthorizationBalances(amount);
                // Also update main balance immediately to show user the deduction
                await this.saveBalance(this.balance - amount);
            }

            return transaction;
        } catch (error) {
            console.error('Error creating offline transaction:', error);
            throw error;
        }
    }

    /**
     * Get device fingerprint for security
     */
    async getDeviceFingerprint() {
        try {
            // In real app, generate unique device fingerprint
            // For demo, use a consistent device ID
            return 'demo_device_secure_001';
        } catch (error) {
            console.error('Error getting device fingerprint:', error);
            return 'unknown_device';
        }
    }

    /**
     * Process incoming offline transaction
     */
    async processIncomingTransaction(transaction) {
        try {
            // Verify the transaction signature
            const isValid = await SecureTokenManager.verifySignature(transaction);
            if (!isValid) {
                throw new Error('Invalid transaction signature');
            }

            // Save the incoming transaction
            const savedTransaction = await SecureTokenManager.saveOfflineTransaction({
                ...transaction,
                type: 'incoming',
                status: 'pending_settlement',
                syncStatus: 'pending',
                settlementRequired: true
            });

            // Note: No balance update here - settlement happens when online
            return savedTransaction;
        } catch (error) {
            console.error('Error processing incoming transaction:', error);
            throw error;
        }
    }

    /**
     * Get unsynced transactions count
     */
    async getUnsyncedTransactionsCount() {
        try {
            const transactions = await this.getPendingTransactions();
            return transactions.length;
        } catch (error) {
            console.error('Error getting unsynced transactions count:', error);
            return 0;
        }
    }

    /**
     * Check if user has enough authorization balance for transaction
     */
    async checkAuthorizationBalance(amount) {
        try {
            const activeTokens = await this.getActiveOfflineTokens();
            const totalRemainingBalance = activeTokens.reduce((sum, token) => {
                return sum + parseFloat(token.remaining_balance || token.amount);
            }, 0);

            return {
                hasEnough: totalRemainingBalance >= amount,
                availableBalance: totalRemainingBalance,
                requiredAmount: amount
            };
        } catch (error) {
            console.error('Error checking authorization balance:', error);
            return { hasEnough: false, availableBalance: 0, requiredAmount: amount };
        }
    }

    /**
     * Update authorization token balances after offline transaction
     */
    async updateAuthorizationBalances(amount) {
        try {
            const activeTokens = await this.getActiveOfflineTokens();
            let remainingAmount = amount;

            // Sort tokens by remaining balance (use smallest first)
            const sortedTokens = activeTokens.sort((a, b) => {
                const aBalance = parseFloat(a.remaining_balance || a.amount);
                const bBalance = parseFloat(b.remaining_balance || b.amount);
                return aBalance - bBalance;
            });

            for (const token of sortedTokens) {
                if (remainingAmount <= 0) break;

                const currentBalance = parseFloat(token.remaining_balance || token.amount);
                const usedAmount = Math.min(currentBalance, remainingAmount);

                // Update token's remaining balance
                token.remaining_balance = (currentBalance - usedAmount).toFixed(2);
                remainingAmount -= usedAmount;

                // If token is fully consumed, mark as used
                if (parseFloat(token.remaining_balance) <= 0) {
                    token.status = 'used';
                    token.used_at = new Date().toISOString();
                }

                // Save updated token
                await SecureTokenManager.saveOfflineToken(token);
            }

            if (remainingAmount > 0) {
                throw new Error('Insufficient authorization balance');
            }

            return true;
        } catch (error) {
            console.error('Error updating authorization balances:', error);
            throw error;
        }
    }

    /**
     * Verify received token with server (for payee)
     */
    async verifyReceivedToken(tokenId, amount, senderDeviceId) {
        try {
            // Check if we have internet connection
            const isOnline = await this.checkConnectivity();
            if (!isOnline) {
                throw new Error('Internet connection required to verify token');
            }

            // Call server API to verify token
            const response = await fetch(`${this.API_BASE_URL}${CONFIG.API_ENDPOINTS.VERIFY_RECEIVED_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token_id: tokenId,
                    amount: amount,
                    sender_device_id: senderDeviceId
                })
            });

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    verification: result.verification_result,
                    security_info: result.security_info,
                    can_accept: result.verification_result.can_proceed
                };
            } else {
                return {
                    success: false,
                    error: result.message,
                    can_accept: false
                };
            }
        } catch (error) {
            console.error('Error verifying received token:', error);
            return {
                success: false,
                error: error.message,
                can_accept: false
            };
        }
    }

    /**
     * Accept received payment and create offline transaction
     */
    async acceptReceivedPayment(paymentData, verificationResult) {
        try {
            // Check connectivity for settlement
            const isOnline = await this.checkConnectivity();

            // Create offline transaction record
            const transaction = {
                id: `OFFLINE_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                token_id: paymentData.token_id,
                sender_id: paymentData.sender_id,
                recipient_id: USER_ID,
                amount: paymentData.amount,
                type: 'incoming',
                device_id: paymentData.device_id,
                timestamp: new Date().toISOString(),
                syncStatus: isOnline ? 'pending' : 'offline',
                verification_result: verificationResult
            };

            // Save transaction locally
            await SecureTokenManager.saveOfflineTransaction(transaction);

            // If online, attempt immediate settlement
            if (isOnline) {
                try {
                    const settlementResult = await this.settleTransactionWithServer(transaction);

                    if (settlementResult.success) {
                        // Update transaction status
                        await SecureTokenManager.updateTransactionStatus(transaction.id, 'synced');

                        // Update local balance for incoming payment
                        const newBalance = this.balance + parseFloat(transaction.amount);
                        await this.saveBalance(newBalance);

                        return {
                            success: true,
                            message: 'Payment accepted and settled immediately',
                            transaction: transaction,
                            settled: true
                        };
                    } else {
                        // Settlement failed, keep as pending
                        return {
                            success: true,
                            message: 'Payment accepted, will sync when connection improves',
                            transaction: transaction,
                            settled: false
                        };
                    }
                } catch (settlementError) {
                    console.error('Settlement failed:', settlementError);
                    // Keep transaction as pending for later sync
                    return {
                        success: true,
                        message: 'Payment accepted, will sync when connection improves',
                        transaction: transaction,
                        settled: false
                    };
                }
            } else {
                // Offline mode - save for later sync
                return {
                    success: true,
                    message: 'Payment accepted offline, will sync when online',
                    transaction: transaction,
                    settled: false
                };
            }

        } catch (error) {
            console.error('Error accepting received payment:', error);
            throw error;
        }
    }

    /**
     * Settle transaction with server
     */
    async settleTransactionWithServer(transaction) {
        try {
            const response = await fetch(`${this.API_BASE_URL}${CONFIG.API_ENDPOINTS.SYNC_OFFLINE_TRANSACTION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    offline_tx_id: transaction.id,
                    token_id: transaction.token_id,
                    sender_id: transaction.sender_id,
                    recipient_id: transaction.recipient_id,
                    amount: transaction.amount,
                    device_id: transaction.device_id
                })
            });

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Error settling transaction with server:', error);
            throw error;
        }
    }

    /**
     * Reject received payment
     */
    async rejectReceivedPayment(paymentData, reason) {
        try {
            // Create rejection record
            const rejection = {
                transaction_id: paymentData.transaction_id,
                token_id: paymentData.token_id,
                sender_id: paymentData.sender_id,
                recipient_id: paymentData.recipient_id,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: 'rejected',
                rejected_at: new Date().toISOString(),
                rejection_reason: reason,
                sender_device: paymentData.device_id
            };

            // Store rejection record
            await SecureTokenManager.saveOfflineTransaction(rejection);

            return {
                success: true,
                message: 'Payment rejected',
                rejection_reason: reason
            };
        } catch (error) {
            console.error('Error rejecting payment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync received payments with server
     */
    async syncReceivedPayments() {
        try {
            const isOnline = await this.checkConnectivity();
            if (!isOnline) {
                throw new Error('Internet connection required to sync payments');
            }

            // Get pending received transactions
            const pendingTransactions = await SecureTokenManager.getOfflineTransactions();
            const receivedTransactions = pendingTransactions.filter(tx =>
                tx.status === 'pending' && tx.needs_sync && tx.recipient_id === USER_ID
            );

            if (receivedTransactions.length === 0) {
                return {
                    success: true,
                    message: 'No received payments to sync',
                    count: 0
                };
            }

            let syncedCount = 0;
            const errors = [];

            for (const transaction of receivedTransactions) {
                try {
                    // Call server to sync transaction
                    const response = await fetch(`${this.API_BASE_URL}${CONFIG.API_ENDPOINTS.SYNC_RECEIVED_PAYMENTS}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            offline_tx_id: transaction.transaction_id,
                            token_id: transaction.token_id,
                            sender_id: transaction.sender_id,
                            recipient_id: transaction.recipient_id,
                            amount: transaction.amount,
                            verification_result: transaction.verification_result
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        // Update transaction status
                        await SecureTokenManager.updateTransactionStatus(
                            transaction.transaction_id,
                            'completed'
                        );
                        syncedCount++;
                    } else {
                        errors.push({
                            transaction_id: transaction.transaction_id,
                            error: result.message
                        });
                    }
                } catch (error) {
                    errors.push({
                        transaction_id: transaction.transaction_id,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                message: `Successfully synced ${syncedCount} payments`,
                count: syncedCount,
                errors: errors
            };
        } catch (error) {
            console.error('Error syncing received payments:', error);
            return {
                success: false,
                message: `Sync failed: ${error.message}`,
                count: 0
            };
        }
    }
}

export default new OfflineTokenService(); 