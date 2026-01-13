#!/bin/bash

# API Testing Script
BASE_URL="http://localhost:3000/api"
ORIGIN="http://localhost:5173"

echo "=== Testing Social Network API ==="
echo ""

# 1. Signup
echo "1. Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "test123456"
  }')

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
  echo "✅ Signup successful"
  TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
  echo "   User ID: $USER_ID"
else
  echo "❌ Signup failed"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

echo ""

# 2. Health Check
echo "2. Testing Health Check..."
HEALTH=$(curl -s -X GET "http://localhost:3000/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Server is healthy"
else
  echo "❌ Health check failed"
fi

echo ""

# 3. Get User Profile (if we have token)
if [ ! -z "$TOKEN" ]; then
  echo "3. Testing Get User Profile..."
  PROFILE=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Origin: $ORIGIN")
  
  if echo "$PROFILE" | grep -q "username"; then
    echo "✅ Profile retrieved"
  else
    echo "❌ Profile request failed"
    echo "$PROFILE"
  fi
fi

echo ""
echo "=== Test Complete ==="
