import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo';

let SecureStore, Device, Application;
if (!isExpoGo) {
    SecureStore = require('expo-secure-store');
    Device = require('expo-device');
    Application = require('expo-application');
}

/**
 * Get a unique device identifier
 * @returns {Promise<string>} - Unique device identifier
 */
export const getDeviceId = async () => {
    try {
        let deviceId;
        if (isExpoGo) {
            deviceId = await AsyncStorage.getItem('DEVICE_ID');
        } else {
            deviceId = await SecureStore.getItemAsync('DEVICE_ID');
        }
        if (!deviceId) {
            deviceId = await generateDeviceId();
            if (isExpoGo) {
                await AsyncStorage.setItem('DEVICE_ID', deviceId);
            } else {
                await SecureStore.setItemAsync('DEVICE_ID', deviceId);
            }
        }
        return deviceId;
    } catch (error) {
        console.error('Error getting device ID:', error);
        return generateTemporaryDeviceId();
    }
};

/**
 * Generate a device fingerprint for additional security
 * @returns {Promise<string>} - Device fingerprint
 */
export const getDeviceFingerprint = async () => {
    try {
        let deviceName, deviceType, osName, osVersion;
        if (isExpoGo) {
            deviceName = 'mock-device';
            deviceType = 0;
            osName = Platform.OS;
            osVersion = Platform.Version.toString();
        } else {
            deviceName = await Device.getDeviceNameAsync() || 'unknown';
            deviceType = Device.deviceType || 0;
            osName = Device.osName || Platform.OS;
            osVersion = Device.osVersion || Platform.Version.toString();
        }
        const fingerprintData = `${deviceName}:${deviceType}:${osName}:${osVersion}`;
        return CryptoJS.SHA256(fingerprintData).toString();
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        return '';
    }
};

/**
 * Generate a device ID based on device-specific information
 * @returns {Promise<string>} - Generated device ID
 * @private
 */
const generateDeviceId = async () => {
    let idSource = '';
    if (!isExpoGo) {
        if (Platform.OS === 'ios') {
            idSource = await Application.getIosIdForVendorAsync() || '';
        } else if (Platform.OS === 'android') {
            idSource = Application.androidId || '';
        }
    }
    if (!idSource) {
        let deviceName, deviceModel;
        if (isExpoGo) {
            deviceName = 'mock-device';
            deviceModel = 'mock-model';
        } else {
            deviceName = await Device.getDeviceNameAsync() || '';
            deviceModel = Device.modelName || '';
        }
        idSource = `${deviceName}:${deviceModel}:${Date.now()}`;
    }
    return CryptoJS.SHA256(idSource).toString();
};

/**
 * Generate a temporary device ID when proper ID generation fails
 * @returns {string} - Temporary device ID
 * @private
 */
const generateTemporaryDeviceId = () => {
    const randomPart = Math.random().toString(36).substring(2, 15);
    const timestampPart = Date.now().toString(36);
    return `temp-${randomPart}-${timestampPart}`;
}; 