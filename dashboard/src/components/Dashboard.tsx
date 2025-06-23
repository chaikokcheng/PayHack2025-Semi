import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Payment,
  AccountBalanceWallet,
  Speed,
  QueueMusic,
  Extension,
  Refresh,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { dashboardAPI, OverviewStats } from '../services/api';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactElement;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock data for charts
  const transactionTrend = [
    { time: '00:00', transactions: 45, amount: 12000 },
    { time: '04:00', transactions: 32, amount: 8500 },
    { time: '08:00', transactions: 78, amount: 25000 },
    { time: '12:00', transactions: 125, amount: 42000 },
    { time: '16:00', transactions: 98, amount: 35000 },
    { time: '20:00', transactions: 67, amount: 18000 },
  ];

  const statusData = [
    { name: 'Completed', value: 85, color: '#10B981' },
    { name: 'Processing', value: 10, color: '#F59E0B' },
    { name: 'Failed', value: 5, color: '#EF4444' },
  ];

  const methodData = [
    { name: 'TouchNGo', value: 45, color: '#1E3A8A' },
    { name: 'GrabPay', value: 30, color: '#10B981' },
    { name: 'DuitNow', value: 15, color: '#059669' },
    { name: 'Others', value: 10, color: '#6B7280' },
  ];

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getOverview();
      setOverview(response.data.data);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatCards = (): StatCard[] => {
    if (!overview) return [];

    return [
      {
        title: 'Total Transactions',
        value: overview.summary.totalTransactions.toLocaleString(),
        change: '+12%',
        icon: <Payment />,
        color: '#FF6B6B',
        trend: 'up',
      },
      {
        title: 'Success Rate',
        value: overview.summary.successRate,
        change: '+2.1%',
        icon: <CheckCircle />,
        color: '#10B981',
        trend: 'up',
      },
      {
        title: 'Total Amount',
        value: `RM ${overview.summary.totalAmount.toLocaleString()}`,
        change: '+18%',
        icon: <AccountBalanceWallet />,
        color: '#F59E0B',
        trend: 'up',
      },
      {
        title: 'Active Tokens',
        value: overview.summary.activeTokens.toLocaleString(),
        change: '+5.2%',
        icon: <Extension />,
        color: '#8B5CF6',
        trend: 'up',
      },
    ];
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />;
      case 'down':
        return <TrendingUp sx={{ fontSize: 16, color: '#EF4444', transform: 'rotate(180deg)' }} />;
      default:
        return null;
    }
  };

  if (loading && !overview) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Payment Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time monitoring and analytics for PinkPay Payment Switch
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchOverview} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {getStatCards().map((stat, index) => (
          <Card
            key={index}
            sx={{
              flex: '1 1 250px',
              minWidth: 250,
              background: `linear-gradient(135deg, ${stat.color}08 0%, ${stat.color}04 100%)`,
              border: `1px solid ${stat.color}20`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: `${stat.color}20`,
                    color: stat.color,
                    width: 48,
                    height: 48,
                  }}
                >
                  {stat.icon}
                </Avatar>
                {stat.change && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getTrendIcon(stat.trend)}
                    <Typography
                      variant="caption"
                      sx={{
                        color: stat.trend === 'up' ? '#10B981' : stat.trend === 'down' ? '#EF4444' : 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Transaction Trend */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Trend (24h)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#FF6B6B" 
                  strokeWidth={3}
                  dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4ECDC4" 
                  strokeWidth={3}
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Status */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {statusData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Bottom Charts */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Payment Methods */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Methods Usage
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={methodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Bar dataKey="value" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { name: 'Payment API', status: 'healthy', uptime: '99.9%' },
                { name: 'Database', status: 'healthy', uptime: '99.8%' },
                { name: 'Queue System', status: 'healthy', uptime: '100%' },
                { name: 'Plugin Manager', status: 'warning', uptime: '98.5%' },
              ].map((service, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {service.status === 'healthy' ? (
                      <CheckCircle sx={{ color: '#10B981', mr: 1 }} />
                    ) : service.status === 'warning' ? (
                      <Warning sx={{ color: '#F59E0B', mr: 1 }} />
                    ) : (
                      <Error sx={{ color: '#EF4444', mr: 1 }} />
                    )}
                    <Typography variant="body2">{service.name}</Typography>
                  </Box>
                  <Chip
                    label={service.uptime}
                    size="small"
                    sx={{
                      backgroundColor: service.status === 'healthy' ? '#10B98120' : '#F59E0B20',
                      color: service.status === 'healthy' ? '#10B981' : '#F59E0B',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard; 