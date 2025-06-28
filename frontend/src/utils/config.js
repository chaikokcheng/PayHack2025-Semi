import { Platform } from 'react-native';

// Environment configuration
const ENV = {
    development: {
        // Android Emulator - 10.0.2.2 maps to host machine's localhost
        android: 'http://10.0.2.2:8000',
        // iOS Simulator - uses localhost
        ios: 'http://127.0.0.1:8000',
        // Physical device - replace with your computer's actual IP address
        physical: 'http://192.168.1.100:8000', // Change this to your IP
    },
    production: {
        // Production API URL
        api: 'https://your-production-api.com',
    }
};

// Get the appropriate API URL based on environment and platform
export const getApiUrl = () => {
    if (__DEV__) {
        // For development
        if (Platform.OS === 'android') {
            return ENV.development.android;
        } else if (Platform.OS === 'ios') {
            return ENV.development.ios;
        }
        // Fallback for physical devices
        return ENV.development.physical;
    } else {
        // For production
        return ENV.production.api;
    }
};

// API endpoints
export const API_ENDPOINTS = {
    // Offline payment endpoints
    CREATE_OFFLINE_TOKEN: '/api/offline-demo/create-offline-token',
    VERIFY_RECEIVED_TOKEN: '/api/offline-demo/verify-received-token',
    ACCEPT_RECEIVED_PAYMENT: '/api/offline-demo/accept-received-payment',
    SYNC_RECEIVED_PAYMENTS: '/api/offline-demo/sync-received-payments',

    // User endpoints
    GET_USER: '/api/offline-demo/user',
    SET_USER_BALANCE: '/api/offline-demo/user',

    // Token endpoints
    CREATE_TOKEN: '/api/offline-demo/tokens',
    VERIFY_TOKEN: '/api/offline-demo/verify-token',

    // Transaction endpoints
    CREATE_OFFLINE_TRANSACTION: '/api/offline-demo/offline-transactions',
    SYNC_OFFLINE_TRANSACTION: '/api/offline-demo/sync-offline-transaction',
};

// Configuration object
export const CONFIG = {
    API_BASE_URL: getApiUrl(),
    API_ENDPOINTS,
    USER_ID: 'bd33f1d8-a7c1-48d3-9d24-c2a925e7e3f9',
    DEMO_DEVICE_ID: 'demo_device_secure_001',
    DEFAULT_CURRENCY: 'MYR',
    TOKEN_EXPIRY_HOURS: 72,
    DEFAULT_BALANCE: 300.00,
};

// Debug information
export const getDebugInfo = () => ({
    platform: Platform.OS,
    isDevelopment: __DEV__,
    apiUrl: CONFIG.API_BASE_URL,
    endpoints: API_ENDPOINTS,
});

export default CONFIG; 