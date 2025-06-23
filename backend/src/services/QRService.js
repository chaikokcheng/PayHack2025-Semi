const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const config = require('../utils/config');
const logger = require('../utils/logger');

class QRService {
  static PAYMENT_METHODS = {
    TNG: {
      name: 'TouchNGo',
      scheme: 'tngd://',
      color: '#1E3A8A',
      logo: 'tng-logo.png'
    },
    GRABPAY: {
      name: 'GrabPay',
      scheme: 'grab://',
      color: '#00AA13',
      logo: 'grab-logo.png'
    },
    BOOST: {
      name: 'Boost',
      scheme: 'boost://',
      color: '#FF6B35',
      logo: 'boost-logo.png'
    },
    SHOPEEPAY: {
      name: 'ShopeePay',
      scheme: 'shopeepay://',
      color: '#EE4D2D',
      logo: 'shopee-logo.png'
    },
    MAYBANK: {
      name: 'Maybank QRPay',
      scheme: 'maybankqr://',
      color: '#FFD320',
      logo: 'maybank-logo.png'
    },
    CIMB: {
      name: 'CIMB Pay',
      scheme: 'cimbpay://',
      color: '#D32F2F',
      logo: 'cimb-logo.png'
    },
    DUITNOW: {
      name: 'DuitNow QR',
      scheme: 'duitnow://',
      color: '#2E7D32',
      logo: 'duitnow-logo.png'
    }
  };

  /**
   * Generate a DuitNow QR code that can route to specific payment apps
   * @param {Object} paymentData - Payment information
   * @param {Object} options - QR generation options
   * @returns {Object} QR code data and metadata
   */
  static async generateDuitNowQR(paymentData, options = {}) {
    try {
      const qrId = uuidv4();
      const timestamp = new Date().toISOString();

      // Build DuitNow QR payload according to Malaysian standard
      const qrPayload = this.buildDuitNowPayload({
        qrId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'MYR',
        merchantId: paymentData.merchantId,
        merchantName: paymentData.merchantName,
        description: paymentData.description,
        preferredMethod: paymentData.preferredMethod,
        timestamp
      });

      // Generate QR code image
      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: options.color || '#000000',
          light: '#FFFFFF'
        },
        width: options.size || 300
      };

      const qrImage = await QRCode.toDataURL(qrPayload, qrOptions);

      // Create smart routing URLs for different apps
      const routingUrls = this.generateSmartRouting(qrPayload, paymentData);

      const qrData = {
        qrId,
        qrImage,
        payload: qrPayload,
        amount: paymentData.amount,
        currency: paymentData.currency || 'MYR',
        merchantId: paymentData.merchantId,
        merchantName: paymentData.merchantName,
        description: paymentData.description,
        routingUrls,
        preferredMethod: paymentData.preferredMethod,
        expiresAt: new Date(Date.now() + (options.expiryMinutes || 30) * 60000).toISOString(),
        createdAt: timestamp,
        status: 'active',
        scanCount: 0
      };

      // Store QR data for tracking (this would go to database in real implementation)
      await this.storeQRData(qrData);

      logger.info('DuitNow QR generated', { qrId, merchantId: paymentData.merchantId });

      return {
        success: true,
        data: qrData
      };

    } catch (error) {
      logger.logError(error, { action: 'generateDuitNowQR', paymentData });
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Build DuitNow QR payload according to Malaysian QR standard
   */
  static buildDuitNowPayload(data) {
    // Simplified DuitNow QR format based on EMVCo standard
    const payload = {
      version: '01',
      pointOfInitiation: '11', // Dynamic QR
      merchantAccount: this.formatMerchantAccount(data.merchantId),
      merchantCategory: '0000',
      transactionCurrency: this.getCurrencyCode(data.currency),
      transactionAmount: data.amount.toFixed(2),
      countryCode: 'MY',
      merchantName: data.merchantName.substring(0, 25),
      merchantCity: 'Kuala Lumpur',
      additionalData: {
        billNumber: data.qrId.substring(0, 25),
        mobileNumber: '',
        storeLabel: data.description?.substring(0, 25) || '',
        loyaltyNumber: '',
        referenceLabel: data.qrId,
        customerLabel: '',
        terminalLabel: '',
        purposeOfTransaction: data.description?.substring(0, 25) || '',
        additionalConsumerDataRequest: ''
      },
      preferredMethod: data.preferredMethod || 'DUITNOW'
    };

    // Convert to QR string format
    return this.encodeQRPayload(payload);
  }

  /**
   * Generate smart routing URLs for different payment apps
   */
  static generateSmartRouting(qrPayload, paymentData) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const routingUrls = {};

    Object.entries(this.PAYMENT_METHODS).forEach(([key, method]) => {
      const encodedPayload = encodeURIComponent(qrPayload);
      
      // Generate deep link for each payment method
      routingUrls[key] = {
        name: method.name,
        deepLink: `${method.scheme}pay?qr=${encodedPayload}&amount=${paymentData.amount}&currency=${paymentData.currency}`,
        webFallback: `${baseUrl}/payment/redirect?method=${key}&qr=${encodedPayload}`,
        color: method.color,
        logo: method.logo
      };
    });

    return routingUrls;
  }

  /**
   * Generate QR for specific payment method
   */
  static async generateMethodSpecificQR(paymentMethod, paymentData, options = {}) {
    try {
      const method = this.PAYMENT_METHODS[paymentMethod.toUpperCase()];
      if (!method) {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      const qrId = uuidv4();
      const deepLink = `${method.scheme}pay?` + new URLSearchParams({
        amount: paymentData.amount,
        currency: paymentData.currency || 'MYR',
        merchant: paymentData.merchantId,
        ref: qrId,
        desc: paymentData.description || ''
      }).toString();

      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: method.color,
          light: '#FFFFFF'
        },
        width: options.size || 300
      };

      const qrImage = await QRCode.toDataURL(deepLink, qrOptions);

      const qrData = {
        qrId,
        qrImage,
        payload: deepLink,
        paymentMethod: method.name,
        amount: paymentData.amount,
        currency: paymentData.currency || 'MYR',
        merchantId: paymentData.merchantId,
        merchantName: paymentData.merchantName,
        description: paymentData.description,
        expiresAt: new Date(Date.now() + (options.expiryMinutes || 30) * 60000).toISOString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        scanCount: 0,
        color: method.color
      };

      await this.storeQRData(qrData);

      logger.info('Method-specific QR generated', { qrId, paymentMethod, merchantId: paymentData.merchantId });

      return {
        success: true,
        data: qrData
      };

    } catch (error) {
      logger.logError(error, { action: 'generateMethodSpecificQR', paymentMethod, paymentData });
      throw new Error(`Failed to generate ${paymentMethod} QR code: ${error.message}`);
    }
  }

  /**
   * Handle QR code scan and redirect logic
   */
  static async handleQRScan(qrId, userAgent, ipAddress) {
    try {
      const qrData = await this.getQRData(qrId);
      
      if (!qrData || qrData.status !== 'active') {
        throw new Error('QR code not found or expired');
      }

      // Check if QR has expired
      if (new Date() > new Date(qrData.expiresAt)) {
        await this.updateQRStatus(qrId, 'expired');
        throw new Error('QR code has expired');
      }

      // Increment scan count
      await this.incrementScanCount(qrId);

      // Detect preferred payment method from user agent or device
      const detectedMethod = this.detectPaymentMethod(userAgent);
      
      // Get the appropriate routing URL
      const routingUrl = qrData.routingUrls?.[detectedMethod] || qrData.routingUrls?.DUITNOW;

      logger.info('QR scanned', { 
        qrId, 
        detectedMethod, 
        ipAddress,
        userAgent: userAgent.substring(0, 100)
      });

      return {
        success: true,
        data: {
          qrId,
          routingUrl,
          detectedMethod,
          paymentData: {
            amount: qrData.amount,
            currency: qrData.currency,
            merchantName: qrData.merchantName,
            description: qrData.description
          }
        }
      };

    } catch (error) {
      logger.logError(error, { action: 'handleQRScan', qrId });
      throw new Error(`QR scan failed: ${error.message}`);
    }
  }

  /**
   * Detect payment method from user agent
   */
  static detectPaymentMethod(userAgent) {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('tng') || ua.includes('touchngo')) return 'TNG';
    if (ua.includes('grab')) return 'GRABPAY';
    if (ua.includes('boost')) return 'BOOST';
    if (ua.includes('shopee')) return 'SHOPEEPAY';
    if (ua.includes('maybank')) return 'MAYBANK';
    if (ua.includes('cimb')) return 'CIMB';
    
    // Default to DuitNow for unknown clients
    return 'DUITNOW';
  }

  /**
   * Helper methods for QR payload encoding
   */
  static formatMerchantAccount(merchantId) {
    return `MY${merchantId.padStart(14, '0')}`;
  }

  static getCurrencyCode(currency) {
    const codes = { 'MYR': '458', 'USD': '840', 'SGD': '702', 'EUR': '978' };
    return codes[currency] || '458';
  }

  static encodeQRPayload(payload) {
    // Simplified encoding - in real implementation this would follow EMVCo standard
    let qrString = '';
    qrString += `00${payload.version}`;
    qrString += `01${payload.pointOfInitiation}`;
    qrString += `04${payload.transactionAmount}`;
    qrString += `53${payload.transactionCurrency}`;
    qrString += `54${payload.transactionAmount}`;
    qrString += `58MY`;
    qrString += `59${payload.merchantName}`;
    qrString += `60${payload.merchantCity}`;
    qrString += `62${payload.additionalData.referenceLabel}`;
    
    return qrString;
  }

  /**
   * Database operations (simplified - would use actual database)
   */
  static async storeQRData(qrData) {
    // In real implementation, this would store to database
    // For demo, we can store in memory or file
    logger.info('QR data stored', { qrId: qrData.qrId });
    return true;
  }

  static async getQRData(qrId) {
    // In real implementation, this would query database
    // For demo, return mock data
    return {
      qrId,
      status: 'active',
      amount: 10.00,
      currency: 'MYR',
      merchantName: 'Demo Merchant',
      description: 'Demo Payment',
      expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
      scanCount: 0,
      routingUrls: this.generateSmartRouting('demo-payload', {
        amount: 10.00,
        currency: 'MYR'
      })
    };
  }

  static async updateQRStatus(qrId, status) {
    logger.info('QR status updated', { qrId, status });
    return true;
  }

  static async incrementScanCount(qrId) {
    logger.info('QR scan count incremented', { qrId });
    return true;
  }

  /**
   * Get QR statistics
   */
  static async getQRStats(period = '24h') {
    // In real implementation, this would query database for actual stats
    return {
      totalGenerated: 150,
      totalScanned: 120,
      scanRate: 80,
      topMethods: {
        TNG: 45,
        GRABPAY: 30,
        DUITNOW: 25,
        BOOST: 15,
        SHOPEEPAY: 5
      },
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        generated: Math.floor(Math.random() * 20),
        scanned: Math.floor(Math.random() * 15)
      }))
    };
  }
}

module.exports = QRService; 