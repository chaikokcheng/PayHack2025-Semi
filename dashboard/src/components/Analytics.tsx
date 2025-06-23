import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState('24h');

  // Mock analytics data
  const transactionVolume = [
    { time: '00:00', volume: 450, amount: 12000 },
    { time: '02:00', volume: 320, amount: 8500 },
    { time: '04:00', volume: 280, amount: 7200 },
    { time: '06:00', volume: 520, amount: 15000 },
    { time: '08:00', volume: 780, amount: 25000 },
    { time: '10:00', volume: 920, amount: 32000 },
    { time: '12:00', volume: 1250, amount: 42000 },
    { time: '14:00', volume: 1180, amount: 38000 },
    { time: '16:00', volume: 980, amount: 35000 },
    { time: '18:00', volume: 850, amount: 28000 },
    { time: '20:00', volume: 670, amount: 18000 },
    { time: '22:00', volume: 480, amount: 14000 },
  ];

  const paymentMethodStats = [
    { name: 'TouchNGo', value: 45, amount: 180000, color: '#1E3A8A' },
    { name: 'GrabPay', value: 30, amount: 120000, color: '#00AA13' },
    { name: 'DuitNow', value: 15, amount: 60000, color: '#2E7D32' },
    { name: 'Boost', value: 7, amount: 28000, color: '#FF6B35' },
    { name: 'Others', value: 3, amount: 12000, color: '#9E9E9E' },
  ];

  const successRateData = [
    { time: '00:00', success: 98.5, failed: 1.5 },
    { time: '04:00', success: 97.8, failed: 2.2 },
    { time: '08:00', success: 99.2, failed: 0.8 },
    { time: '12:00', success: 96.5, failed: 3.5 },
    { time: '16:00', success: 98.9, failed: 1.1 },
    { time: '20:00', success: 99.1, failed: 0.9 },
  ];

  const pluginPerformance = [
    { name: 'FX Converter', success: 99.8, avgTime: 45 },
    { name: 'Risk Checker', success: 98.2, avgTime: 120 },
    { name: 'Token Handler', success: 99.5, avgTime: 80 },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Deep insights into payment performance and trends
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            label="Period"
          >
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Transaction Volume */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Volume & Amount
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={transactionVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#B0B0B0" />
                <YAxis yAxisId="left" stroke="#B0B0B0" />
                <YAxis yAxisId="right" orientation="right" stroke="#B0B0B0" />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#FF6B6B" 
                  strokeWidth={3}
                  name="Transaction Volume"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4ECDC4" 
                  strokeWidth={3}
                  name="Transaction Amount (MYR)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Payment Methods */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {paymentMethodStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {paymentMethodStats.map((method, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: method.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{method.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      RM {method.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={successRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#B0B0B0" />
                  <YAxis stroke="#B0B0B0" domain={[95, 100]} />
                  <Bar dataKey="success" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  98.7%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Success Rate ({period})
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Plugin Performance */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Plugin Performance Analysis
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {pluginPerformance.map((plugin, index) => (
                <Box key={index} sx={{ flex: 1 }}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)' 
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {plugin.name}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                        <Typography variant="h4" color="primary">
                          {plugin.success}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Avg Processing Time</Typography>
                        <Typography variant="h5">
                          {plugin.avgTime}ms
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={plugin.success > 99 ? "Excellent" : plugin.success > 95 ? "Good" : "Needs Attention"}
                        color={plugin.success > 99 ? "success" : plugin.success > 95 ? "warning" : "error"}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Real-time Stats */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Real-time Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  2,847
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transactions Today
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="secondary" gutterBottom>
                  RM 485K
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Volume Today
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main" gutterBottom>
                  1.2s
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Processing Time
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="error.main" gutterBottom>
                  23
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed Transactions
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Analytics;
