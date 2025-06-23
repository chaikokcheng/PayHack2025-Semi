#!/bin/bash
echo "🧪 Testing PinkPay Payment System..."
echo "===================================="

echo "1️⃣ Testing QR Generation..."
curl -s -X POST http://localhost:8000/api/qr/generate/duitnow \
  -H "Content-Type: application/json" \
  -d '{"amount": 25, "merchantId": "CAFE_001", "merchantName": "Coffee Shop", "description": "Latte"}' \
  | jq -r '.success, .data.qrId'

echo -e "\n2️⃣ Testing Payment Processing..."
curl -s -X POST http://localhost:8000/api/payments/pay \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "currency": "MYR", "paymentMethod": "TNG", "merchantId": "DEMO_001", "description": "Test Payment"}' \
  | jq -r '.success, .data.transactionId, .data.status'

echo -e "\n3️⃣ Testing Available Payment Methods..."
curl -s http://localhost:8000/api/qr/methods | jq -r '.data.count'

echo -e "\n✅ All tests completed!" 