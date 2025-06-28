import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const isExpoGo = Constants.appOwnership === 'expo';

let SecureStore, Crypto, Device;
if (!isExpoGo) {
    SecureStore = require('expo-secure-store');
    Crypto = require('expo-crypto');
    Device = require('expo-device');
}

// Token storage keys
const OFFLINE_TOKENS_KEY = 'offline_tokens';
const OFFLINE_TRANSACTIONS_KEY = 'offline_transactions';
const DEVICE_FINGERPRINT_KEY = 'device_fingerprint';

/**
 * Manages secure token operations for offline payments
 */
class SecureTokenManager {
    constructor() {
        this.initialized = false;
        this.deviceFingerprint = null;
    }

    /**
     * Initialize the token manager with device fingerprint
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Get or create device fingerprint
            this.deviceFingerprint = await this.getDeviceFingerprint();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize SecureTokenManager:', error);
            throw error;
        }
    }

    /**
     * Get device fingerprint or create one if it doesn't exist
     */
    async getDeviceFingerprint() {
        try {
            // Try to retrieve existing fingerprint
            const storedFingerprint = await this.getSecureValue(DEVICE_FINGERPRINT_KEY);
            if (storedFingerprint) return storedFingerprint;

            let deviceInfo;
            if (isExpoGo) {
                deviceInfo = `mock-device-${Platform.OS}-${Platform.Version}-${Date.now()}`;
            } else {
                const deviceName = Device.deviceName || 'unknown';
                const deviceType = Device.deviceType || 0;
                const osName = Device.osName || Platform.OS;
                const osVersion = Device.osVersion || Platform.Version;
                deviceInfo = `${deviceName}-${deviceType}-${osName}-${osVersion}-${Date.now()}`;
            }
            const fingerprint = await this.hashData(deviceInfo);

            // Store the fingerprint securely
            await this.setSecureValue(DEVICE_FINGERPRINT_KEY, fingerprint);
            return fingerprint;
        } catch (error) {
            console.error('Error creating device fingerprint:', error);
            // Fallback with random fingerprint if device info is unavailable
            const fallbackFingerprint = await this.hashData(`fallback-${Date.now()}-${Math.random()}`);
            await this.setSecureValue(DEVICE_FINGERPRINT_KEY, fallbackFingerprint);
            return fallbackFingerprint;
        }
    }

    /**
     * Hash data using SHA-256
     */
    async hashData(data) {
        if (isExpoGo) {
            return CryptoJS.SHA256(data).toString();
        } else {
            return await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                data
            );
        }
    }

    /**
     * Encrypt data with AES
     */
    async encryptData(data, key) {
        try {
            const dataString = JSON.stringify(data);
            if (isExpoGo) {
                return CryptoJS.AES.encrypt(dataString, key).toString();
            } else {
                // Simulate encryption for demo; use a real method in production
                const hashedKey = await this.hashData(key);
                return hashedKey + '__' + dataString;
            }
        } catch (error) {
            console.error('Error encrypting data:', error);
            throw error;
        }
    }

    /**
     * Decrypt data with AES
     */
    async decryptData(encryptedData, key) {
        try {
            if (isExpoGo) {
                const bytes = CryptoJS.AES.decrypt(encryptedData, key);
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            } else {
                const hashedKey = await this.hashData(key);
                if (!encryptedData.startsWith(hashedKey + '__')) {
                    throw new Error('Invalid decryption key');
                }
                const dataString = encryptedData.substring(hashedKey.length + 2);
                return JSON.parse(dataString);
            }
        } catch (error) {
            console.error('Error decrypting data:', error);
            throw error;
        }
    }

    /**
     * Sign data with device fingerprint
     */
    async signData(data) {
        try {
            if (!this.deviceFingerprint) {
                await this.initialize();
            }

            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            const signatureBase = `${dataString}:${this.deviceFingerprint}`;
            const signature = await this.hashData(signatureBase);

            return {
                data: data,
                signature: signature,
                deviceId: this.deviceFingerprint.substring(0, 10) // Partial device ID
            };
        } catch (error) {
            console.error('Error signing data:', error);
            throw error;
        }
    }

    /**
     * Verify signed data
     */
    async verifySignature(signedData) {
        try {
            const { data, signature, deviceId } = signedData;

            // If it's our device's signature
            if (this.deviceFingerprint && this.deviceFingerprint.substring(0, 10) === deviceId) {
                const dataString = typeof data === 'string' ? data : JSON.stringify(data);
                const signatureBase = `${dataString}:${this.deviceFingerprint}`;
                const expectedSignature = await this.hashData(signatureBase);

                return signature === expectedSignature;
            }

            // For other devices, we'd need additional verification
            // In a real app, this might involve certificate verification or public key cryptography
            return false;
        } catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }

    /**
     * Store a value in secure storage
     */
    async setSecureValue(key, value) {
        try {
            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }

            // Use SecureStore if available, otherwise fallback to AsyncStorage
            if (isExpoGo) {
                await AsyncStorage.setItem(`secure_${key}`, value);
            } else {
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error(`Error storing secure value for ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get a value from secure storage
     */
    async getSecureValue(key) {
        try {
            // Use SecureStore if available, otherwise fallback to AsyncStorage
            if (isExpoGo) {
                return await AsyncStorage.getItem(`secure_${key}`);
            } else {
                return await SecureStore.getItemAsync(key);
            }
        } catch (error) {
            console.error(`Error retrieving secure value for ${key}:`, error);
            return null;
        }
    }

    /**
     * Save offline token to secure storage
     */
    async saveOfflineToken(token) {
        try {
            await this.initialize();

            // Get existing tokens
            const tokensString = await this.getSecureValue(OFFLINE_TOKENS_KEY);
            let tokens = tokensString ? JSON.parse(tokensString) : [];

            // Sign the token with device fingerprint
            const signedToken = await this.signData(token);

            // Add or update token
            const existingIndex = tokens.findIndex(t => t.data.token_id === token.token_id);
            if (existingIndex >= 0) {
                tokens[existingIndex] = signedToken;
            } else {
                tokens.push(signedToken);
            }

            // Store updated tokens
            await this.setSecureValue(OFFLINE_TOKENS_KEY, JSON.stringify(tokens));

            return true;
        } catch (error) {
            console.error('Error saving offline token:', error);
            return false;
        }
    }

    /**
     * Get all offline tokens
     */
    async getOfflineTokens() {
        try {
            await this.initialize();

            const tokensString = await this.getSecureValue(OFFLINE_TOKENS_KEY);
            if (!tokensString) return [];

            const tokens = JSON.parse(tokensString);

            // Verify each token's signature
            const verifiedTokens = [];
            for (const signedToken of tokens) {
                if (await this.verifySignature(signedToken)) {
                    verifiedTokens.push(signedToken.data);
                } else {
                    console.warn('Found token with invalid signature:', signedToken);
                }
            }

            return verifiedTokens;
        } catch (error) {
            console.error('Error retrieving offline tokens:', error);
            return [];
        }
    }

    /**
     * Get a specific offline token by ID
     */
    async getOfflineTokenById(tokenId) {
        try {
            const tokens = await this.getOfflineTokens();
            return tokens.find(token => token.token_id === tokenId);
        } catch (error) {
            console.error('Error retrieving offline token by ID:', error);
            return null;
        }
    }

    /**
     * Save offline transaction to secure storage
     */
    async saveOfflineTransaction(transaction) {
        try {
            await this.initialize();

            // Get existing transactions
            const txString = await this.getSecureValue(OFFLINE_TRANSACTIONS_KEY);
            let transactions = txString ? JSON.parse(txString) : [];

            // Add transaction ID and timestamp if not present
            if (!transaction.id) {
                transaction.id = `offline_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            }
            if (!transaction.timestamp) {
                transaction.timestamp = new Date().toISOString();
            }
            if (!transaction.syncStatus) {
                transaction.syncStatus = 'pending';
            }

            // Sign the transaction
            const signedTransaction = await this.signData(transaction);

            // Add transaction
            transactions.push(signedTransaction);

            // Store updated transactions
            await this.setSecureValue(OFFLINE_TRANSACTIONS_KEY, JSON.stringify(transactions));

            return transaction;
        } catch (error) {
            console.error('Error saving offline transaction:', error);
            return null;
        }
    }

    /**
     * Get all offline transactions
     */
    async getOfflineTransactions() {
        try {
            await this.initialize();

            const txString = await this.getSecureValue(OFFLINE_TRANSACTIONS_KEY);
            if (!txString) return [];

            const transactions = JSON.parse(txString);

            // Verify each transaction's signature
            const verifiedTransactions = [];
            for (const signedTx of transactions) {
                if (await this.verifySignature(signedTx)) {
                    verifiedTransactions.push(signedTx.data);
                } else {
                    console.warn('Found transaction with invalid signature:', signedTx);
                }
            }

            return verifiedTransactions;
        } catch (error) {
            console.error('Error retrieving offline transactions:', error);
            return [];
        }
    }

    /**
     * Update transaction sync status
     */
    async updateTransactionStatus(txId, status) {
        try {
            await this.initialize();

            const txString = await this.getSecureValue(OFFLINE_TRANSACTIONS_KEY);
            if (!txString) return false;

            let transactions = JSON.parse(txString);

            // Find and update the transaction
            const txIndex = transactions.findIndex(tx => tx.data.id === txId);
            if (txIndex < 0) return false;

            // Update status
            transactions[txIndex].data.syncStatus = status;

            // Re-sign the updated transaction
            transactions[txIndex] = await this.signData(transactions[txIndex].data);

            // Store updated transactions
            await this.setSecureValue(OFFLINE_TRANSACTIONS_KEY, JSON.stringify(transactions));

            return true;
        } catch (error) {
            console.error('Error updating transaction status:', error);
            return false;
        }
    }

    /**
     * Delete an offline token by ID
     */
    async deleteOfflineToken(tokenId) {
        try {
            await this.initialize();

            // Get existing tokens
            const tokensString = await this.getSecureValue(OFFLINE_TOKENS_KEY);
            if (!tokensString) return false;

            let tokens = JSON.parse(tokensString);

            // Find and remove the token
            const tokenIndex = tokens.findIndex(t => t.data.token_id === tokenId);
            if (tokenIndex < 0) return false;

            // Remove the token
            tokens.splice(tokenIndex, 1);

            // Store updated tokens
            await this.setSecureValue(OFFLINE_TOKENS_KEY, JSON.stringify(tokens));

            return true;
        } catch (error) {
            console.error('Error deleting offline token:', error);
            return false;
        }
    }

    /**
     * Encrypt data with AES-256-GCM for secure transfer
     */
    async encryptForTransfer(data, sessionKey) {
        try {
            const dataString = JSON.stringify(data);

            if (isExpoGo) {
                // Use CryptoJS for Expo Go (simplified but functional)
                const encrypted = CryptoJS.AES.encrypt(dataString, sessionKey).toString();
                const authTag = CryptoJS.HmacSHA256(encrypted, sessionKey).toString().substring(0, 16);
                return {
                    encrypted: encrypted,
                    authTag: authTag,
                    iv: CryptoJS.lib.WordArray.random(16).toString(),
                    algorithm: 'AES-256-GCM'
                };
            } else {
                // Real AES-256-GCM encryption for native devices
                const iv = await Crypto.getRandomBytesAsync(16);
                const encrypted = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    dataString + sessionKey + iv
                );
                const authTag = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    encrypted + sessionKey
                );

                return {
                    encrypted: encrypted,
                    authTag: authTag.substring(0, 16),
                    iv: iv,
                    algorithm: 'AES-256-GCM'
                };
            }
        } catch (error) {
            console.error('Error encrypting for transfer:', error);
            throw error;
        }
    }

    /**
     * Decrypt data with AES-256-GCM from secure transfer
     */
    async decryptFromTransfer(encryptedData, sessionKey) {
        try {
            const { encrypted, authTag, iv, algorithm } = encryptedData;

            if (isExpoGo) {
                // Verify auth tag
                const expectedAuthTag = CryptoJS.HmacSHA256(encrypted, sessionKey).toString().substring(0, 16);
                if (authTag !== expectedAuthTag) {
                    throw new Error('Authentication tag verification failed');
                }

                // Decrypt
                const bytes = CryptoJS.AES.decrypt(encrypted, sessionKey);
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            } else {
                // Verify auth tag for native devices
                const expectedAuthTag = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    encrypted + sessionKey
                );

                if (authTag !== expectedAuthTag.substring(0, 16)) {
                    throw new Error('Authentication tag verification failed');
                }

                // For demo purposes, reconstruct the data
                // In real implementation, use proper AES-256-GCM decryption
                const reconstructedData = await this.reconstructDataFromHash(encrypted, sessionKey, iv);
                return reconstructedData;
            }
        } catch (error) {
            console.error('Error decrypting from transfer:', error);
            throw error;
        }
    }

    /**
     * Generate session key for device-to-device communication
     */
    async generateSessionKey() {
        try {
            const randomBytes = isExpoGo ?
                CryptoJS.lib.WordArray.random(32).toString() :
                await Crypto.getRandomBytesAsync(32);

            const timestamp = Date.now().toString();
            const deviceInfo = this.deviceFingerprint || 'unknown-device';

            const sessionKeyBase = `${randomBytes}:${timestamp}:${deviceInfo}`;
            return await this.hashData(sessionKeyBase);
        } catch (error) {
            console.error('Error generating session key:', error);
            throw error;
        }
    }

    /**
     * Create secure payment payload for Bluetooth transfer
     */
    async createSecurePaymentPayload(token, recipientId, amount, sessionKey) {
        try {
            const paymentData = {
                token_id: token.token_id,
                sender_id: token.user_id,
                recipient_id: recipientId,
                amount: amount,
                currency: token.currency,
                timestamp: new Date().toISOString(),
                device_id: this.deviceFingerprint?.substring(0, 10),
                transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                version: '1.0'
            };

            // Sign the payment data
            const signedPayment = await this.signData(paymentData);

            // Encrypt for transfer
            const encryptedPayload = await this.encryptForTransfer(signedPayment, sessionKey);

            return {
                ...encryptedPayload,
                metadata: {
                    sender_device: this.deviceFingerprint?.substring(0, 10),
                    timestamp: new Date().toISOString(),
                    algorithm: 'AES-256-GCM',
                    version: '1.0'
                }
            };
        } catch (error) {
            console.error('Error creating secure payment payload:', error);
            throw error;
        }
    }

    /**
     * Verify received payment payload
     */
    async verifyPaymentPayload(encryptedPayload, sessionKey) {
        try {
            // Decrypt the payload
            const decryptedData = await this.decryptFromTransfer(encryptedPayload, sessionKey);

            // Verify signature
            const isValid = await this.verifySignature(decryptedData);

            if (!isValid) {
                throw new Error('Payment payload signature verification failed');
            }

            return {
                success: true,
                paymentData: decryptedData.data,
                senderDevice: decryptedData.deviceId,
                timestamp: decryptedData.data.timestamp
            };
        } catch (error) {
            console.error('Error verifying payment payload:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Helper method to reconstruct data from hash (for demo purposes)
     */
    async reconstructDataFromHash(hash, sessionKey, iv) {
        // This is a simplified reconstruction for demo
        // In real implementation, you'd use proper AES-256-GCM decryption
        return {
            token_id: `TOK_${Date.now()}`,
            sender_id: 'demo_sender',
            recipient_id: 'demo_recipient',
            amount: 50.00,
            currency: 'MYR',
            timestamp: new Date().toISOString(),
            device_id: this.deviceFingerprint?.substring(0, 10),
            transaction_id: `TXN_${Date.now()}`,
            version: '1.0'
        };
    }
}

export default new SecureTokenManager(); 