import React, { useState } from 'react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  duration?: number;
}

interface TngBoostDemoResult {
  success: boolean;
  demo_workflow: string;
  steps: {
    tng_qr_generated: any;
    customer_info: any;
    payment_completed: any;
  };
  routing_info: {
    from: string;
    to: string;
    via: string;
    processing_time: string;
  };
  message: string;
}

const PaymentTester = () => {
  const [activeTab, setActiveTab] = useState('qr-demo');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '50.00',
    currency: 'MYR',
    payment_method: 'qr',
    merchant_id: 'MERCHANT_001',
    user_id: 'user123'
  });

  // QR Demo form state
  const [qrDemoForm, setQrDemoForm] = useState({
    merchant_id: 'PAYHACK_DEMO_001',
    amount: '75.50'
  });

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testHealthCheck = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/health');
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      });
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentForm)
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      });
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testTngBoostDemo = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/qr/demo/tng-boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(qrDemoForm)
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      });
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (tab: string, label: string, emoji: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">🧪 PinkPay API Tester</h2>
        <p className="text-gray-600 mt-1">Test and validate payment switch functionality</p>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-2 mb-6">
          {renderTabButton('health', 'Health Check', '🩺')}
          {renderTabButton('qr-demo', 'TNG→Boost Demo', '🔄')}
          {renderTabButton('payment', 'Payment API', '💳')}
        </div>

        {/* Health Check Tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">System Health Check</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test the basic health and connectivity of the PinkPay Payment Switch backend.
              </p>
              <button
                onClick={testHealthCheck}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Test Health Check</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TNG->Boost Demo Tab */}
        {activeTab === 'qr-demo' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🌟 TNG QR → Boost Payment Demo</h3>
              <p className="text-gray-600 text-sm mb-4">
                Demonstrate cross-wallet payment routing: customer scans TNG merchant QR and pays with Boost wallet.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={qrDemoForm.merchant_id}
                    onChange={(e) => setQrDemoForm({...qrDemoForm, merchant_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PAYHACK_DEMO_001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (MYR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qrDemoForm.amount}
                    onChange={(e) => setQrDemoForm({...qrDemoForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75.50"
                  />
                </div>
              </div>

              <button
                onClick={testTngBoostDemo}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Demo...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Run TNG→Boost Demo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Payment API Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Processing API</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test the core payment processing functionality with custom parameters.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={paymentForm.currency}
                    onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MYR">MYR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="qr">QR</option>
                    <option value="nfc">NFC</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={paymentForm.merchant_id}
                    onChange={(e) => setPaymentForm({...paymentForm, merchant_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    value={paymentForm.user_id}
                    onChange={(e) => setPaymentForm({...paymentForm, user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={testPayment}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Test Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📋 Test Results</h3>
            <button
              onClick={() => setResults([])}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Results
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">
                      {result.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.timestamp} {result.duration && `(${result.duration}ms)`}
                  </div>
                </div>
                
                {result.error && (
                  <div className="text-red-600 text-sm mb-2">
                    Error: {result.error}
                  </div>
                )}
                
                {result.data && (
                  <div className="bg-gray-100 rounded p-3">
                    <pre className="text-xs text-gray-800 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTester; 

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  duration?: number;
}

interface TngBoostDemoResult {
  success: boolean;
  demo_workflow: string;
  steps: {
    tng_qr_generated: any;
    customer_info: any;
    payment_completed: any;
  };
  routing_info: {
    from: string;
    to: string;
    via: string;
    processing_time: string;
  };
  message: string;
}

const PaymentTester = () => {
  const [activeTab, setActiveTab] = useState('qr-demo');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '50.00',
    currency: 'MYR',
    payment_method: 'qr',
    merchant_id: 'MERCHANT_001',
    user_id: 'user123'
  });

  // QR Demo form state
  const [qrDemoForm, setQrDemoForm] = useState({
    merchant_id: 'PAYHACK_DEMO_001',
    amount: '75.50'
  });

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testHealthCheck = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/health');
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      });
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentForm)
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      });
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const testTngBoostDemo = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/qr/demo/tng-boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(qrDemoForm)
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      addResult({
        success: response.ok,
        data,
        timestamp: new Date().toLocaleTimeString(),
        duration
      });
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        duration: Date.now() - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTabButton = (tab: string, label: string, emoji: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">🧪 PinkPay API Tester</h2>
        <p className="text-gray-600 mt-1">Test and validate payment switch functionality</p>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-2 mb-6">
          {renderTabButton('health', 'Health Check', '🩺')}
          {renderTabButton('qr-demo', 'TNG→Boost Demo', '🔄')}
          {renderTabButton('payment', 'Payment API', '💳')}
        </div>

        {/* Health Check Tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">System Health Check</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test the basic health and connectivity of the PinkPay Payment Switch backend.
              </p>
              <button
                onClick={testHealthCheck}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Test Health Check</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TNG->Boost Demo Tab */}
        {activeTab === 'qr-demo' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🌟 TNG QR → Boost Payment Demo</h3>
              <p className="text-gray-600 text-sm mb-4">
                Demonstrate cross-wallet payment routing: customer scans TNG merchant QR and pays with Boost wallet.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={qrDemoForm.merchant_id}
                    onChange={(e) => setQrDemoForm({...qrDemoForm, merchant_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PAYHACK_DEMO_001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (MYR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={qrDemoForm.amount}
                    onChange={(e) => setQrDemoForm({...qrDemoForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="75.50"
                  />
                </div>
              </div>

              <button
                onClick={testTngBoostDemo}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Demo...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Run TNG→Boost Demo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Payment API Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Processing API</h3>
              <p className="text-gray-600 text-sm mb-4">
                Test the core payment processing functionality with custom parameters.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={paymentForm.currency}
                    onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MYR">MYR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="qr">QR</option>
                    <option value="nfc">NFC</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={paymentForm.merchant_id}
                    onChange={(e) => setPaymentForm({...paymentForm, merchant_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    value={paymentForm.user_id}
                    onChange={(e) => setPaymentForm({...paymentForm, user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={testPayment}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Test Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📋 Test Results</h3>
            <button
              onClick={() => setResults([])}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Results
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  result.success
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">
                      {result.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.timestamp} {result.duration && `(${result.duration}ms)`}
                  </div>
                </div>
                
                {result.error && (
                  <div className="text-red-600 text-sm mb-2">
                    Error: {result.error}
                  </div>
                )}
                
                {result.data && (
                  <div className="bg-gray-100 rounded p-3">
                    <pre className="text-xs text-gray-800 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTester; 