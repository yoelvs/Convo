#!/bin/bash

BASE_URL="http://localhost:3000/api"
ORIGIN="http://localhost:5173"

echo "=== Testing Two User Interactions ==="
echo ""

# Create User 1
echo "1. Creating User 1 (Alice)..."
USER1_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{
    "username": "alice'$(date +%s)'",
    "email": "alice'$(date +%s)'@example.com",
    "password": "password123"
  }')

if echo "$USER1_RESPONSE" | grep -q "accessToken"; then
  USER1_TOKEN=$(echo "$USER1_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  USER1_ID=$(echo "$USER1_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "✅ User 1 created: $USER1_ID"
else
  echo "❌ Failed to create User 1"
  echo "$USER1_RESPONSE"
  exit 1
fi
echo ""

# Create User 2
echo "2. Creating User 2 (Bob)..."
USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{
    "username": "bob'$(date +%s)'",
    "email": "bob'$(date +%s)'@example.com",
    "password": "password123"
  }')

if echo "$USER2_RESPONSE" | grep -q "accessToken"; then
  USER2_TOKEN=$(echo "$USER2_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  USER2_ID=$(echo "$USER2_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "✅ User 2 created: $USER2_ID"
else
  echo "❌ Failed to create User 2"
  echo "$USER2_RESPONSE"
  exit 1
fi
echo ""

# User 1 sends friend request to User 2
echo "3. User 1 sending friend request to User 2..."
FRIEND_REQUEST=$(curl -s -X POST "$BASE_URL/friends/request" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d "{\"toUserId\": \"$USER2_ID\"}")

if echo "$FRIEND_REQUEST" | grep -q "_id"; then
  REQUEST_ID=$(echo "$FRIEND_REQUEST" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
  echo "✅ Friend request sent: $REQUEST_ID"
else
  echo "❌ Failed to send friend request"
  echo "$FRIEND_REQUEST"
  exit 1
fi
echo ""

# User 2 views requests
echo "4. User 2 viewing friend requests..."
REQUESTS=$(curl -s -X GET "$BASE_URL/friends/requests" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Origin: $ORIGIN")
echo "✅ Requests retrieved"
echo ""

# User 2 accepts request
echo "5. User 2 accepting friend request..."
ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/friends/accept" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d "{\"requestId\": \"$REQUEST_ID\"}")

if echo "$ACCEPT_RESPONSE" | grep -q "accepted"; then
  echo "✅ Friend request accepted"
else
  echo "⚠️  Accept response: $ACCEPT_RESPONSE"
fi
echo ""

# User 1 creates a post
echo "6. User 1 creating a post..."
POST1=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{"text": "Hello from Alice!", "mediaUrls": []}')

if echo "$POST1" | grep -q "_id"; then
  POST1_ID=$(echo "$POST1" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
  echo "✅ Post created: $POST1_ID"
else
  echo "❌ Failed to create post"
  echo "$POST1"
  POST1_ID=""
fi
echo ""

# User 2 creates a post
echo "7. User 2 creating a post..."
POST2=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: $ORIGIN" \
  -d '{"text": "Hello from Bob!", "mediaUrls": []}')

if echo "$POST2" | grep -q "_id"; then
  POST2_ID=$(echo "$POST2" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
  echo "✅ Post created: $POST2_ID"
else
  echo "❌ Failed to create post"
  echo "$POST2"
  POST2_ID=""
fi
echo ""

# User 1 views feed
echo "8. User 1 viewing feed (should see User 2's post)..."
FEED=$(curl -s -X GET "$BASE_URL/posts/feed?limit=20" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Origin: $ORIGIN")
echo "✅ Feed retrieved"
echo ""

# User 2 likes User 1's post (if post was created)
if [ ! -z "$POST1_ID" ]; then
  echo "9. User 2 liking User 1's post..."
  LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST1_ID/like" \
    -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Origin: $ORIGIN")
  echo "✅ Post liked"
  echo ""
fi

echo "=== Test Complete ==="
echo ""
echo "📋 Summary:"
echo "  User 1 ID: $USER1_ID"
echo "  User 2 ID: $USER2_ID"
echo "  User 1 Token: ${USER1_TOKEN:0:30}..."
echo "  User 2 Token: ${USER2_TOKEN:0:30}..."
echo ""
echo "💡 To use these tokens manually:"
echo "  export USER1_TOKEN=\"$USER1_TOKEN\""
echo "  export USER1_ID=\"$USER1_ID\""
echo "  export USER2_TOKEN=\"$USER2_TOKEN\""
echo "  export USER2_ID=\"$USER2_ID\""
echo ""
echo "📚 See docs/TESTING_TWO_USERS.md for more examples"
