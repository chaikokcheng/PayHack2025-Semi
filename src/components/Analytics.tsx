import React, { useState, useEffect } from 'react';

interface TransactionStats {
  total_transactions: number;
  completed: number;
  pending: number;
  failed: number;
  success_rate: number;
  total_volume: number;
}

interface QRStats {
  total_qr_codes: number;
  active: number;
  scanned: number;
  expired: number;
  scan_rate: number;
  type_breakdown: Record<string, number>;
}

interface TokenStats {
  total_tokens: number;
  active: number;
  redeemed: number;
  expired: number;
  cancelled: number;
  active_value: number;
  redemption_rate: number;
}

interface DashboardOverview {
  system_status: string;
  transaction_stats: TransactionStats;
  qr_stats: QRStats;
  token_stats: TokenStats;
  uptime: string;
  processing_rate: string;
  timestamp: string;
}

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      if (data.success) {
        setOverview(data.overview);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎯 PinkPay Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time payment switch monitoring</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${getStatusColor(overview.system_status)}`}>
              ● {overview.system_status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500">Last updated: {lastUpdate}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">System Uptime</p>
              <p className="text-3xl font-bold">{overview.uptime}</p>
            </div>
            <div className="text-4xl opacity-80">🚀</div>
          </div>
        </div>

        {/* Processing Rate Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Processing Rate</p>
              <p className="text-3xl font-bold">{overview.processing_rate}</p>
            </div>
            <div className="text-4xl opacity-80">⚡</div>
          </div>
        </div>

        {/* Total Volume Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Volume</p>
              <p className="text-3xl font-bold">MYR {overview.transaction_stats.total_volume.toFixed(2)}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Success Rate</p>
              <p className="text-3xl font-bold">{overview.transaction_stats.success_rate}%</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Transaction Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold">{overview.transaction_stats.total_transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{overview.transaction_stats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{overview.transaction_stats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-semibold text-red-600">{overview.transaction_stats.failed}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Volume</span>
                <span className="font-semibold">MYR {overview.transaction_stats.total_volume.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 QR Code Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total QR Codes</span>
              <span className="font-semibold">{overview.qr_stats.total_qr_codes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{overview.qr_stats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Scanned</span>
              <span className="font-semibold text-blue-600">{overview.qr_stats.scanned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-gray-600">{overview.qr_stats.expired}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Scan Rate</span>
                <span className="font-semibold">{overview.qr_stats.scan_rate}%</span>
              </div>
            </div>
            {/* QR Type Breakdown */}
            {Object.keys(overview.qr_stats.type_breakdown).length > 0 && (
              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-600 mb-2">Type Breakdown:</p>
                {Object.entries(overview.qr_stats.type_breakdown).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Token Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎫 Token Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tokens</span>
              <span className="font-semibold">{overview.token_stats.total_tokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{overview.token_stats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Redeemed</span>
              <span className="font-semibold text-blue-600">{overview.token_stats.redeemed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-gray-600">{overview.token_stats.expired}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Value</span>
                <span className="font-semibold">MYR {overview.token_stats.active_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Redemption Rate</span>
                <span className="font-semibold">{overview.token_stats.redemption_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default Analytics; 

interface TransactionStats {
  total_transactions: number;
  completed: number;
  pending: number;
  failed: number;
  success_rate: number;
  total_volume: number;
}

interface QRStats {
  total_qr_codes: number;
  active: number;
  scanned: number;
  expired: number;
  scan_rate: number;
  type_breakdown: Record<string, number>;
}

interface TokenStats {
  total_tokens: number;
  active: number;
  redeemed: number;
  expired: number;
  cancelled: number;
  active_value: number;
  redemption_rate: number;
}

interface DashboardOverview {
  system_status: string;
  transaction_stats: TransactionStats;
  qr_stats: QRStats;
  token_stats: TokenStats;
  uptime: string;
  processing_rate: string;
  timestamp: string;
}

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      if (data.success) {
        setOverview(data.overview);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎯 PinkPay Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time payment switch monitoring</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${getStatusColor(overview.system_status)}`}>
              ● {overview.system_status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500">Last updated: {lastUpdate}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">System Uptime</p>
              <p className="text-3xl font-bold">{overview.uptime}</p>
            </div>
            <div className="text-4xl opacity-80">🚀</div>
          </div>
        </div>

        {/* Processing Rate Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Processing Rate</p>
              <p className="text-3xl font-bold">{overview.processing_rate}</p>
            </div>
            <div className="text-4xl opacity-80">⚡</div>
          </div>
        </div>

        {/* Total Volume Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Volume</p>
              <p className="text-3xl font-bold">MYR {overview.transaction_stats.total_volume.toFixed(2)}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Success Rate</p>
              <p className="text-3xl font-bold">{overview.transaction_stats.success_rate}%</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Transaction Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold">{overview.transaction_stats.total_transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{overview.transaction_stats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{overview.transaction_stats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-semibold text-red-600">{overview.transaction_stats.failed}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Volume</span>
                <span className="font-semibold">MYR {overview.transaction_stats.total_volume.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 QR Code Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total QR Codes</span>
              <span className="font-semibold">{overview.qr_stats.total_qr_codes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{overview.qr_stats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Scanned</span>
              <span className="font-semibold text-blue-600">{overview.qr_stats.scanned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-gray-600">{overview.qr_stats.expired}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Scan Rate</span>
                <span className="font-semibold">{overview.qr_stats.scan_rate}%</span>
              </div>
            </div>
            {/* QR Type Breakdown */}
            {Object.keys(overview.qr_stats.type_breakdown).length > 0 && (
              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-600 mb-2">Type Breakdown:</p>
                {Object.entries(overview.qr_stats.type_breakdown).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Token Statistics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎫 Token Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Tokens</span>
              <span className="font-semibold">{overview.token_stats.total_tokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{overview.token_stats.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Redeemed</span>
              <span className="font-semibold text-blue-600">{overview.token_stats.redeemed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-gray-600">{overview.token_stats.expired}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Value</span>
                <span className="font-semibold">MYR {overview.token_stats.active_value.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Redemption Rate</span>
                <span className="font-semibold">{overview.token_stats.redemption_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default Analytics; 