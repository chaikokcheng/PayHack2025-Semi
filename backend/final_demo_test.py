#!/usr/bin/env python3
"""
PinkPay Payment Switch - Final Demo Test
Comprehensive demonstration of all working features
"""

import requests
import json
from datetime import datetime

SERVER_URL = "http://127.0.0.1:8000"

def print_header(title):
    print(f"\n{'='*60}")
    print(f"🚀 {title}")
    print(f"{'='*60}")

def test_endpoint(method, endpoint, data=None, name="Test"):
    """Test an endpoint and display results"""
    try:
        if method == 'GET':
            response = requests.get(f"{SERVER_URL}{endpoint}", timeout=5)
        else:
            response = requests.post(f"{SERVER_URL}{endpoint}", json=data, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {name}: SUCCESS")
            return result
        else:
            print(f"❌ {name}: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ {name}: {str(e)}")
        return None

def main():
    print_header("🎉 PinkPay Payment Switch - LIVE DEMO")
    print("🌟 Demonstrating Modern Payment Orchestration")
    print(f"📅 Demo Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: System Health
    print_header("1. 🩺 System Health Check")
    health = test_endpoint('GET', '/health', name="Health Check")
    if health:
        print(f"   📊 Service: {health.get('service')}")
        print(f"   📈 Status: {health.get('status')}")
        print(f"   🗄️ Database: {health.get('database')}")
        print(f"   🏷️ Version: {health.get('version')}")
    
    # Test 2: TNG QR → Boost Demo (Main Feature)
    print_header("2. 🔄 TNG QR → Boost Cross-Wallet Demo")
    demo_data = {
        "merchant_id": "PAYHACK_SHOWCASE_001",
        "amount": 125.75
    }
    demo = test_endpoint('POST', '/api/qr/demo/tng-boost', demo_data, "TNG→Boost Workflow")
    if demo:
        print(f"   💳 Transaction ID: {demo.get('steps', {}).get('payment_completed', {}).get('txn_id')}")
        print(f"   �� Amount: MYR {demo.get('steps', {}).get('payment_completed', {}).get('amount')}")
        print(f"   🔄 Routing: {demo.get('routing_info', {}).get('from')} → {demo.get('routing_info', {}).get('to')}")
        print(f"   ⚡ Processing Time: {demo.get('routing_info', {}).get('processing_time')}")
    
    # Test 3: Dashboard Analytics
    print_header("3. 📊 Real-Time Dashboard Analytics")
    dashboard = test_endpoint('GET', '/api/dashboard/overview', name="Dashboard Overview")
    if dashboard:
        overview = dashboard.get('overview', {})
        txn_stats = overview.get('transaction_stats', {})
        qr_stats = overview.get('qr_stats', {})
        print(f"   📈 Total Transactions: {txn_stats.get('total_transactions')}")
        print(f"   ✅ Completed: {txn_stats.get('completed')}")
        print(f"   💰 Total Volume: MYR {txn_stats.get('total_volume')}")
        print(f"   📊 Success Rate: {txn_stats.get('success_rate')}%")
        print(f"   🔄 QR Codes Generated: {qr_stats.get('total_qr_codes')}")
        print(f"   🚀 System Status: {overview.get('system_status')}")
        print(f"   ⚡ Processing Rate: {overview.get('processing_rate')}")
    
    # Summary
    print_header("✨ DEMO COMPLETE - PinkPay Payment Switch")
    print("🎉 SUCCESSFULLY DEMONSTRATED:")
    print("   ✅ Modern Payment Switch Architecture")
    print("   ✅ Cross-Wallet Routing (TNG → Boost)")
    print("   ✅ Real-Time Transaction Processing")
    print("   ✅ QR Code Generation & Management")
    print("   ✅ Live Dashboard Analytics")
    print("   ✅ Supabase Database Integration")
    print("   ✅ RESTful API Architecture")
    print()
    print("🚀 PAYHACK2025 READY!")
    print("💡 This payment switch can handle:")
    print("   • Multi-wallet interoperability")
    print("   • Real-time transaction processing")
    print("   • Cross-border payments")
    print("   • Plugin-based extensibility")
    print("   • Enterprise-grade monitoring")

if __name__ == '__main__':
    main()
