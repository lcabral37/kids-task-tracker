#!/bin/bash

echo "Testing Kids Task Tracker Backend API..."
echo ""

# Test health check
echo "1️⃣ Testing health endpoint..."
curl -s http://localhost:3001/api/health | jq .
echo ""

# Create a test child
echo "2️⃣ Creating test child..."
CHILD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/children \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Child","age":10,"pin":"1234"}')
echo "$CHILD_RESPONSE" | jq .
CHILD_ID=$(echo "$CHILD_RESPONSE" | jq -r '.id')
echo "Child ID: $CHILD_ID"
echo ""

# List children
echo "3️⃣ Listing children..."
curl -s http://localhost:3001/api/children | jq .
echo ""

# Get specific child
echo "4️⃣ Getting specific child..."
curl -s http://localhost:3001/api/children/$CHILD_ID | jq .
echo ""

# Verify PIN
echo "5️⃣ Verifying PIN (correct)..."
curl -s -X POST http://localhost:3001/api/children/$CHILD_ID/verify-pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}' | jq .
echo ""

echo "✅ Backend API tests completed!"
