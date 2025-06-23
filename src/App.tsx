import React, { useState } from 'react';
import Analytics from './components/Analytics';
import PaymentTester from './components/PaymentTester';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('analytics');

  const renderNavButton = (tab: string, label: string, emoji: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:transform hover:scale-105 shadow-md'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-xl shadow-lg">
                <span className="text-2xl font-bold">💳</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PinkPay Payment Switch</h1>
                <p className="text-gray-600">Modern Payment Orchestration Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">PayHack2025 Demo</div>
                <div className="flex items-center text-green-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  System Operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            {renderNavButton('analytics', 'Real-time Analytics', '📊')}
            {renderNavButton('tester', 'API Testing', '🧪')}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to PinkPay Dashboard</h2>
              <p className="text-blue-100 text-lg">
                Monitor and test your payment switch infrastructure in real-time
              </p>
              <div className="mt-4 flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Cross-wallet Routing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span>Real-time Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Advanced Analytics</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-6xl opacity-50">🚀</div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'analytics' && (
            <div className="animate-fadeIn">
              <Analytics />
            </div>
          )}
          
          {activeTab === 'tester' && (
            <div className="animate-fadeIn">
              <PaymentTester />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-lg">
                <span className="text-lg font-bold">💳</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">PinkPay Payment Switch</div>
                <div className="text-sm text-gray-600">Built for PayHack2025</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>🌐</span>
                <span>Backend: http://127.0.0.1:8000</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Dashboard: http://localhost:3000</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 
import Analytics from './components/Analytics';
import PaymentTester from './components/PaymentTester';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('analytics');

  const renderNavButton = (tab: string, label: string, emoji: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:transform hover:scale-105 shadow-md'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-xl shadow-lg">
                <span className="text-2xl font-bold">💳</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PinkPay Payment Switch</h1>
                <p className="text-gray-600">Modern Payment Orchestration Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">PayHack2025 Demo</div>
                <div className="flex items-center text-green-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  System Operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            {renderNavButton('analytics', 'Real-time Analytics', '📊')}
            {renderNavButton('tester', 'API Testing', '🧪')}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to PinkPay Dashboard</h2>
              <p className="text-blue-100 text-lg">
                Monitor and test your payment switch infrastructure in real-time
              </p>
              <div className="mt-4 flex space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Cross-wallet Routing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span>Real-time Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span>Advanced Analytics</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-6xl opacity-50">🚀</div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'analytics' && (
            <div className="animate-fadeIn">
              <Analytics />
            </div>
          )}
          
          {activeTab === 'tester' && (
            <div className="animate-fadeIn">
              <PaymentTester />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-lg">
                <span className="text-lg font-bold">💳</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">PinkPay Payment Switch</div>
                <div className="text-sm text-gray-600">Built for PayHack2025</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>🌐</span>
                <span>Backend: http://127.0.0.1:8000</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⚡</span>
                <span>Dashboard: http://localhost:3000</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; 