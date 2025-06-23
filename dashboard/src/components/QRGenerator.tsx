import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  QrCode,
  Download,
} from '@mui/icons-material';
import { qrAPI, PaymentMethod, QRData } from '../services/api';

const QRGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [generatedQR, setGeneratedQR] = useState<QRData | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  const [formData, setFormData] = useState({
    amount: '10.00',
    currency: 'MYR',
    merchantId: 'DEMO_MERCHANT_001',
    merchantName: 'Demo Merchant',
    description: 'Demo Payment',
    preferredMethod: 'DUITNOW',
  });

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await qrAPI.getPaymentMethods();
        setPaymentMethods(response.data.data.methods);
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      }
    };
    loadPaymentMethods();
  }, []);

  const generateDuitNowQR = async () => {
    try {
      setLoading(true);
      setError(null);

      const paymentData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        merchantId: formData.merchantId,
        merchantName: formData.merchantName,
        description: formData.description,
        preferredMethod: formData.preferredMethod,
      };

      const response = await qrAPI.generateDuitNowQR(paymentData);
      setGeneratedQR(response.data.data);
      setPreviewDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.href = generatedQR.qrImage;
    link.download = `qr-${generatedQR.qrId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Smart QR Generator
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Generate DuitNow QR codes with smart routing to different payment apps like TouchNGo, GrabPay, etc.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Amount (MYR)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
                fullWidth
              />
              
              <TextField
                label="Merchant Name"
                value={formData.merchantName}
                onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                required
                fullWidth
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                multiline
                rows={2}
                fullWidth
              />

              <Typography variant="body2" color="text.secondary">
                This will generate a smart QR code that can route users to their preferred payment app:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {paymentMethods.map((method) => (
                  <Chip 
                    key={method.code}
                    label={method.name} 
                    size="small" 
                    sx={{ 
                      backgroundColor: `${method.color}15`, 
                      color: method.color,
                      border: `1px solid ${method.color}30`,
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={generateDuitNowQR}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <QrCode />}
                sx={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E04848 0%, #35A3A1 100%)',
                  },
                }}
              >
                Generate Smart QR Code
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ width: 350 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              QR Preview
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #D1D5DB',
                borderRadius: 2,
                mb: 2,
                backgroundColor: '#F9FAFB',
              }}
            >
              {generatedQR ? (
                <img 
                  src={generatedQR.qrImage} 
                  alt="Generated QR Code" 
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <QrCode sx={{ fontSize: 64, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                    Your smart QR code will appear here
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports TouchNGo, GrabPay, DuitNow & more
                  </Typography>
                </Box>
              )}
            </Box>

            {generatedQR && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={downloadQR}
                  startIcon={<Download />}
                  sx={{ flex: 1 }}
                >
                  Download
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPreviewDialog(true)}
                  sx={{ flex: 1 }}
                >
                  View Details
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode color="primary" />
            Smart QR Code Generated
          </Box>
        </DialogTitle>
        <DialogContent>
          {generatedQR && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={generatedQR.qrImage} 
                  alt="QR Code" 
                  style={{ width: 300, height: 300, borderRadius: 8 }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                  QR ID: {generatedQR.qrId}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>Payment Details</Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="h4" color="primary">
                    {generatedQR.currency} {generatedQR.amount}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Merchant</Typography>
                  <Typography variant="h6">{generatedQR.merchantName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {generatedQR.merchantId}
                  </Typography>
                </Box>

                {generatedQR.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{generatedQR.description}</Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Expires</Typography>
                  <Typography variant="body1">
                    {new Date(generatedQR.expiresAt).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🎯 Smart Routing Enabled For:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {paymentMethods.map((method) => (
                      <Chip 
                        key={method.code}
                        label={method.name} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${method.color}15`, 
                          color: method.color,
                          border: `1px solid ${method.color}30`,
                          fontWeight: 600 
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    When users scan this QR, they'll be automatically routed to their preferred payment app!
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button variant="contained" onClick={downloadQR} startIcon={<Download />}>
            Download QR Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRGenerator; 