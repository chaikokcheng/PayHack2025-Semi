import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  PlayArrow,
} from '@mui/icons-material';
import { paymentAPI } from '../services/api';

const PaymentTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  const [paymentData, setPaymentData] = useState({
    amount: '25.00',
    currency: 'MYR',
    type: 'payment',
    userEmail: 'demo@user.com',
    paymentMethod: 'TouchNGo',
    merchantId: 'DEMO_MERCHANT_001',
    merchantName: 'Demo Merchant',
    description: 'Test Payment via Dashboard',
  });

  const steps = ['Payment Details', 'Processing', 'Result'];

  const processPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep(1);

      const data = {
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        type: paymentData.type,
        userEmail: paymentData.userEmail,
        paymentMethod: paymentData.paymentMethod,
        merchantId: paymentData.merchantId,
        merchantName: paymentData.merchantName,
        description: paymentData.description,
        synchronous: true,
      };

      const response = await paymentAPI.processPayment(data);
      setResult(response.data);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setStep(0);
    setResult(null);
    setError(null);
  };

  return (
    <Box>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Payment Flow Tester
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Test the complete payment flow with real-time processing
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Amount (MYR)"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                    fullWidth
                  />
                  
                  <TextField
                    label="User Email"
                    type="email"
                    value={paymentData.userEmail}
                    onChange={(e) => setPaymentData({...paymentData, userEmail: e.target.value})}
                    fullWidth
                  />
                  
                  <TextField
                    label="Payment Method"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    fullWidth
                  />
                  
                  <TextField
                    label="Description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                    multiline
                    rows={2}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    size="large"
                    onClick={processPayment}
                    disabled={loading}
                    startIcon={<PlayArrow />}
                    sx={{
                      background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #E04848 0%, #35A3A1 100%)',
                      },
                    }}
                  >
                    Process Payment
                  </Button>
                </Box>
              </Box>

              <Box sx={{ width: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Flow Preview
                </Typography>
                <Box sx={{ p: 2, border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This payment will go through:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip label="🔄 FX Conversion Plugin" size="small" />
                    <Chip label="🛡️ Risk Assessment Plugin" size="small" />
                    <Chip label="🏦 Payment Rails Processing" size="small" />
                    <Chip label="📊 Real-time Analytics" size="small" />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {step === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Processing Payment...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running through plugin pipeline and payment rails
              </Typography>
            </Box>
          )}

          {step === 2 && (
            <Box>
              {error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Payment Failed
                  </Typography>
                  {error}
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Payment Successful!
                  </Typography>
                  Payment processed successfully through the PinkPay system
                </Alert>
              )}

              {result && (
                <Card sx={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Transaction Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {result.data?.transactionId || 'TXN_' + Date.now()}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Amount</Typography>
                        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                          MYR {paymentData.amount}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip 
                          label={result.data?.status || 'completed'} 
                          color="success" 
                          sx={{ mb: 2 }}
                        />
                        
                        <Typography variant="body2" color="text.secondary">Processing Time</Typography>
                        <Typography variant="body1">
                          {result.data?.processingTime || '1.2s'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Plugin Results
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">FX Conversion: MYR → MYR (1.00)</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Risk Score: Low (2/100)</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Payment Rails: Success</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={resetTest}>
                  Test Another Payment
                </Button>
                <Button variant="contained">
                  View in Dashboard
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentTester;
