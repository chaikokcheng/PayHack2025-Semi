#!/usr/bin/env python3
"""
API Test Script for PinkPay Payment Switch
Demonstrates the main functionality of the payment switch
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def test_health_check():
    """Test health check endpoint"""
    print("🩺 Testing Health Check...")
    
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("✅ Health check passed")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Service: {data.get('service')}")
    else:
        print("❌ Health check failed")
    print()

def test_payment_flow():
    """Test complete payment flow"""
    print("💳 Testing Payment Flow...")
    
    # Step 1: Create payment
    payment_data = {
        "amount": 25.50,
        "currency": "MYR",
        "payment_method": "qr",
        "payment_rail": "duitnow",
        "merchant_id": "TEST_MERCHANT_001",
        "merchant_name": "Test Coffee Shop",
        "user_id": "test_user_123",
        "metadata": {
            "description": "Coffee and pastry",
            "location": "Kuala Lumpur"
        }
    }
    
    print("   Creating payment...")
    response = requests.post(f"{API_BASE}/pay", json=payment_data)
    
    if response.status_code == 202:
        payment_result = response.json()
        txn_id = payment_result.get('txn_id')
        print(f"✅ Payment created: {txn_id}")
        
        # Step 2: Check status
        print("   Checking payment status...")
        time.sleep(2)  # Wait for processing
        
        status_response = requests.get(f"{API_BASE}/status/{txn_id}")
        if status_response.status_code == 200:
            status_data = status_response.json()
            transaction = status_data.get('transaction', {})
            print(f"   Status: {transaction.get('status')}")
            print(f"   Amount: {transaction.get('amount')} {transaction.get('currency')}")
            print(f"   Plugin logs: {len(status_data.get('plugin_logs', []))}")
        
        return txn_id
    else:
        print("❌ Payment creation failed")
        print(f"   Error: {response.text}")
    
    print()
    return None

def test_qr_workflow():
    """Test QR workflow (TNG to Boost demo)"""
    print("🔄 Testing QR Workflow (TNG → Boost)...")
    
    demo_data = {
        "merchant_id": "DEMO_MERCHANT_001",
        "amount": 15.75,
        "customer_user_id": "demo_boost_user"
    }
    
    response = requests.post(f"{API_BASE}/qr/demo/tng-boost", json=demo_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ QR workflow demo completed")
        steps = result.get('steps', {})
        
        if '1_tng_qr_generated' in steps:
            qr_data = steps['1_tng_qr_generated']
            print(f"   TNG QR: {qr_data.get('qr_code_id')}")
        
        if '3_payment_routed' in steps:
            routing = steps['3_payment_routed']
            print(f"   Transaction: {routing.get('txn_id')}")
            print(f"   Amount: {routing.get('amount')} {routing.get('currency')}")
        
        print(f"   Workflow: {result.get('demo_workflow')}")
    else:
        print("❌ QR workflow failed")
        print(f"   Error: {response.text}")
    
    print()

def test_offline_token():
    """Test offline token functionality"""
    print("🎫 Testing Offline Token...")
    
    # Create token
    token_data = {
        "token_operation": "create",
        "user_id": "test_user_123",
        "amount": 50.00,
        "currency": "MYR",
        "expiry_hours": 24
    }
    
    print("   Creating offline token...")
    response = requests.post(f"{API_BASE}/payoffline", json=token_data)
    
    if response.status_code == 201:
        token_result = response.json()
        token_info = token_result.get('token', {})
        token_id = token_info.get('token_id')
        
        print(f"✅ Token created: {token_id}")
        print(f"   Amount: {token_info.get('amount')} {token_info.get('currency')}")
        print(f"   Expires: {token_info.get('expires_at')}")
        
        # Test token redemption
        print("   Redeeming token...")
        redeem_data = {"token_id": token_id}
        
        redeem_response = requests.post(f"{API_BASE}/payoffline", json=redeem_data)
        if redeem_response.status_code == 200:
            redeem_result = redeem_response.json()
            print(f"✅ Token redeemed: {redeem_result.get('txn_id')}")
        else:
            print("❌ Token redemption failed")
    
    else:
        print("❌ Token creation failed")
        print(f"   Error: {response.text}")
    
    print()

def test_dashboard_overview():
    """Test dashboard overview"""
    print("📊 Testing Dashboard Overview...")
    
    response = requests.get(f"{API_BASE}/dashboard/overview")
    
    if response.status_code == 200:
        data = response.json()
        summary = data.get('summary', {})
        
        print("✅ Dashboard data retrieved")
        print(f"   Total transactions: {summary.get('total_transactions')}")
        print(f"   Total volume: RM {summary.get('total_volume_myr')}")
        print(f"   Success rate: {summary.get('success_rate_percent')}%")
        print(f"   Active tokens: {summary.get('active_tokens')}")
        print(f"   Active QR codes: {summary.get('active_qr_codes')}")
    else:
        print("❌ Dashboard overview failed")
        print(f"   Error: {response.text}")
    
    print()

def test_plugin_management():
    """Test plugin management"""
    print("🔌 Testing Plugin Management...")
    
    response = requests.get(f"{API_BASE}/dashboard/plugins")
    
    if response.status_code == 200:
        data = response.json()
        plugins = data.get('plugins', {})
        
        print("✅ Plugin status retrieved")
        for name, info in plugins.items():
            status = "enabled" if info.get('enabled') else "disabled"
            print(f"   {info.get('name')}: {status} (v{info.get('version')})")
    else:
        print("❌ Plugin status failed")
        print(f"   Error: {response.text}")
    
    print()

def test_refund():
    """Test refund functionality"""
    print("💰 Testing Refund...")
    
    # First create a payment to refund
    txn_id = test_payment_flow()
    
    if txn_id:
        # Wait for payment to complete
        time.sleep(3)
        
        refund_data = {
            "txn_id": txn_id,
            "refund_amount": 25.50,
            "reason": "Customer request - API test"
        }
        
        print("   Processing refund...")
        response = requests.post(f"{API_BASE}/refund", json=refund_data)
        
        if response.status_code == 200:
            refund_result = response.json()
            print(f"✅ Refund processed: {refund_result.get('refund_txn_id')}")
            print(f"   Amount: RM {refund_result.get('refund_amount')}")
            print(f"   Status: {refund_result.get('status')}")
        else:
            print("❌ Refund failed")
            print(f"   Error: {response.text}")
    
    print()

def main():
    """Run all tests"""
    print("🚀 PinkPay Payment Switch API Test Suite")
    print("=" * 50)
    print()
    
    try:
        # Test individual components
        test_health_check()
        test_payment_flow()
        test_qr_workflow()
        test_offline_token()
        test_dashboard_overview()
        test_plugin_management()
        test_refund()
        
        print("🎉 All tests completed!")
        print("\n📋 Test Summary:")
        print("   ✅ Health Check")
        print("   ✅ Payment Flow")
        print("   ✅ QR Workflow (TNG → Boost)")
        print("   ✅ Offline Token")
        print("   ✅ Dashboard Overview")
        print("   ✅ Plugin Management")
        print("   ✅ Refund Processing")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the server!")
        print(f"   Make sure the server is running on {BASE_URL}")
        print("   Run: python run_server.py")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    main() 
"""
API Test Script for PinkPay Payment Switch
Demonstrates the main functionality of the payment switch
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def test_health_check():
    """Test health check endpoint"""
    print("🩺 Testing Health Check...")
    
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("✅ Health check passed")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Service: {data.get('service')}")
    else:
        print("❌ Health check failed")
    print()

def test_payment_flow():
    """Test complete payment flow"""
    print("💳 Testing Payment Flow...")
    
    # Step 1: Create payment
    payment_data = {
        "amount": 25.50,
        "currency": "MYR",
        "payment_method": "qr",
        "payment_rail": "duitnow",
        "merchant_id": "TEST_MERCHANT_001",
        "merchant_name": "Test Coffee Shop",
        "user_id": "test_user_123",
        "metadata": {
            "description": "Coffee and pastry",
            "location": "Kuala Lumpur"
        }
    }
    
    print("   Creating payment...")
    response = requests.post(f"{API_BASE}/pay", json=payment_data)
    
    if response.status_code == 202:
        payment_result = response.json()
        txn_id = payment_result.get('txn_id')
        print(f"✅ Payment created: {txn_id}")
        
        # Step 2: Check status
        print("   Checking payment status...")
        time.sleep(2)  # Wait for processing
        
        status_response = requests.get(f"{API_BASE}/status/{txn_id}")
        if status_response.status_code == 200:
            status_data = status_response.json()
            transaction = status_data.get('transaction', {})
            print(f"   Status: {transaction.get('status')}")
            print(f"   Amount: {transaction.get('amount')} {transaction.get('currency')}")
            print(f"   Plugin logs: {len(status_data.get('plugin_logs', []))}")
        
        return txn_id
    else:
        print("❌ Payment creation failed")
        print(f"   Error: {response.text}")
    
    print()
    return None

def test_qr_workflow():
    """Test QR workflow (TNG to Boost demo)"""
    print("🔄 Testing QR Workflow (TNG → Boost)...")
    
    demo_data = {
        "merchant_id": "DEMO_MERCHANT_001",
        "amount": 15.75,
        "customer_user_id": "demo_boost_user"
    }
    
    response = requests.post(f"{API_BASE}/qr/demo/tng-boost", json=demo_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ QR workflow demo completed")
        steps = result.get('steps', {})
        
        if '1_tng_qr_generated' in steps:
            qr_data = steps['1_tng_qr_generated']
            print(f"   TNG QR: {qr_data.get('qr_code_id')}")
        
        if '3_payment_routed' in steps:
            routing = steps['3_payment_routed']
            print(f"   Transaction: {routing.get('txn_id')}")
            print(f"   Amount: {routing.get('amount')} {routing.get('currency')}")
        
        print(f"   Workflow: {result.get('demo_workflow')}")
    else:
        print("❌ QR workflow failed")
        print(f"   Error: {response.text}")
    
    print()

def test_offline_token():
    """Test offline token functionality"""
    print("🎫 Testing Offline Token...")
    
    # Create token
    token_data = {
        "token_operation": "create",
        "user_id": "test_user_123",
        "amount": 50.00,
        "currency": "MYR",
        "expiry_hours": 24
    }
    
    print("   Creating offline token...")
    response = requests.post(f"{API_BASE}/payoffline", json=token_data)
    
    if response.status_code == 201:
        token_result = response.json()
        token_info = token_result.get('token', {})
        token_id = token_info.get('token_id')
        
        print(f"✅ Token created: {token_id}")
        print(f"   Amount: {token_info.get('amount')} {token_info.get('currency')}")
        print(f"   Expires: {token_info.get('expires_at')}")
        
        # Test token redemption
        print("   Redeeming token...")
        redeem_data = {"token_id": token_id}
        
        redeem_response = requests.post(f"{API_BASE}/payoffline", json=redeem_data)
        if redeem_response.status_code == 200:
            redeem_result = redeem_response.json()
            print(f"✅ Token redeemed: {redeem_result.get('txn_id')}")
        else:
            print("❌ Token redemption failed")
    
    else:
        print("❌ Token creation failed")
        print(f"   Error: {response.text}")
    
    print()

def test_dashboard_overview():
    """Test dashboard overview"""
    print("📊 Testing Dashboard Overview...")
    
    response = requests.get(f"{API_BASE}/dashboard/overview")
    
    if response.status_code == 200:
        data = response.json()
        summary = data.get('summary', {})
        
        print("✅ Dashboard data retrieved")
        print(f"   Total transactions: {summary.get('total_transactions')}")
        print(f"   Total volume: RM {summary.get('total_volume_myr')}")
        print(f"   Success rate: {summary.get('success_rate_percent')}%")
        print(f"   Active tokens: {summary.get('active_tokens')}")
        print(f"   Active QR codes: {summary.get('active_qr_codes')}")
    else:
        print("❌ Dashboard overview failed")
        print(f"   Error: {response.text}")
    
    print()

def test_plugin_management():
    """Test plugin management"""
    print("🔌 Testing Plugin Management...")
    
    response = requests.get(f"{API_BASE}/dashboard/plugins")
    
    if response.status_code == 200:
        data = response.json()
        plugins = data.get('plugins', {})
        
        print("✅ Plugin status retrieved")
        for name, info in plugins.items():
            status = "enabled" if info.get('enabled') else "disabled"
            print(f"   {info.get('name')}: {status} (v{info.get('version')})")
    else:
        print("❌ Plugin status failed")
        print(f"   Error: {response.text}")
    
    print()

def test_refund():
    """Test refund functionality"""
    print("💰 Testing Refund...")
    
    # First create a payment to refund
    txn_id = test_payment_flow()
    
    if txn_id:
        # Wait for payment to complete
        time.sleep(3)
        
        refund_data = {
            "txn_id": txn_id,
            "refund_amount": 25.50,
            "reason": "Customer request - API test"
        }
        
        print("   Processing refund...")
        response = requests.post(f"{API_BASE}/refund", json=refund_data)
        
        if response.status_code == 200:
            refund_result = response.json()
            print(f"✅ Refund processed: {refund_result.get('refund_txn_id')}")
            print(f"   Amount: RM {refund_result.get('refund_amount')}")
            print(f"   Status: {refund_result.get('status')}")
        else:
            print("❌ Refund failed")
            print(f"   Error: {response.text}")
    
    print()

def main():
    """Run all tests"""
    print("🚀 PinkPay Payment Switch API Test Suite")
    print("=" * 50)
    print()
    
    try:
        # Test individual components
        test_health_check()
        test_payment_flow()
        test_qr_workflow()
        test_offline_token()
        test_dashboard_overview()
        test_plugin_management()
        test_refund()
        
        print("🎉 All tests completed!")
        print("\n📋 Test Summary:")
        print("   ✅ Health Check")
        print("   ✅ Payment Flow")
        print("   ✅ QR Workflow (TNG → Boost)")
        print("   ✅ Offline Token")
        print("   ✅ Dashboard Overview")
        print("   ✅ Plugin Management")
        print("   ✅ Refund Processing")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the server!")
        print(f"   Make sure the server is running on {BASE_URL}")
        print("   Run: python run_server.py")
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")

if __name__ == "__main__":
    main() 