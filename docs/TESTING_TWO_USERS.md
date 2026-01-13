# Testing with Two Users

This guide shows how to test the app with two different users. Useful for testing friend requests, messages, posts, etc.

## Easy Method: Two Browser Windows

This is the simplest way - no coding needed.

### Setup

1. Make sure backend and frontend are running
2. Open browser to `http://localhost:5173`

### Create First User

1. Click "Sign Up"
2. Fill in:
   - Username: `alice` (or whatever)
   - Email: `alice@example.com`
   - Password: `password123`
3. Click "Sign Up"

### Create Second User

**Option A: Different Browser**
- Open Firefox if you used Chrome (or vice versa)

**Option B: Incognito Mode**
- Chrome: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Edge: `Ctrl+Shift+N`

1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Fill in:
   - Username: `bob`
   - Email: `bob@example.com`
   - Password: `password123`
4. Click "Sign Up"

### Test Interactions

**Test 1: Friend Request**

As Alice:
1. Go to "Friends"
2. Click "Browse All Users"
3. Find "bob"
4. Click "Send Request"

As Bob:
1. Go to "Friends"
2. See friend request from Alice
3. Click "Accept"

Now they're friends!

**Test 2: Posts**

As Alice:
1. Go to "Feed"
2. Type "Hello from Alice!"
3. Click "Post"

As Bob:
1. Go to "Feed"
2. Should see Alice's post (since they're friends)
3. Try liking it (❤️)
4. Try commenting

**Test 3: Chat**

As Alice:
1. Go to "Chat"
2. Click search icon (🔍)
3. Search for "bob"
4. Click on Bob
5. Type "Hello Bob!" and send

As Bob:
1. Go to "Chat"
2. Should see Alice's chat
3. Click it
4. See "Hello Bob!" message
5. Reply "Hi Alice!"

Both should see messages in real-time!

## Advanced Method: Terminal/API

If you're comfortable with terminal commands, you can test using `curl`.

### Create User 1

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` and `id` from the response:
```bash
USER1_TOKEN="paste-token-here"
USER1_ID="paste-id-here"
```

### Create User 2

Same command, different details:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "username": "bob",
    "email": "bob@example.com",
    "password": "password123"
  }'
```

Save Bob's token and ID:
```bash
USER2_TOKEN="paste-token-here"
USER2_ID="paste-id-here"
```

### Send Friend Request

```bash
curl -X POST http://localhost:3000/api/friends/request \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d "{
    \"toUserId\": \"$USER2_ID\"
  }"
```

### View Requests (as Bob)

```bash
curl -X GET http://localhost:3000/api/friends/requests \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Origin: http://localhost:5173"
```

### Accept Request

Get the request ID from above, then:
```bash
REQUEST_ID="paste-request-id-here"

curl -X POST http://localhost:3000/api/friends/accept \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d "{
    \"requestId\": \"$REQUEST_ID\"
  }"
```

### Create Posts

Alice:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "text": "Hello from Alice!",
    "mediaUrls": []
  }'
```

Bob:
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{
    "text": "Hello from Bob!",
    "mediaUrls": []
  }'
```

### View Feed

```bash
curl -X GET "http://localhost:3000/api/posts/feed?limit=20" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Origin: http://localhost:5173"
```

Should show Bob's post since they're friends.

## Testing Checklist

- [ ] Both users can sign up
- [ ] User 1 can send friend request
- [ ] User 2 sees the request
- [ ] User 2 can accept
- [ ] Both appear in each other's friends list
- [ ] User 1 can create post
- [ ] User 2 can create post
- [ ] User 1's feed shows User 2's posts
- [ ] User 1 can start chat with User 2
- [ ] Messages appear in real-time
- [ ] Chat history is saved

## Common Issues

**Can't see other user's posts**
- Make sure they're friends
- Refresh the feed

**Messages not appearing**
- Check backend is running
- Refresh both windows
- Make sure you sent a message (room created on first message)

**Friend request not showing**
- Check browser console (F12) for errors
- Refresh Friends page
- Verify request was sent

**Can't find user**
- Make sure both users are created
- Check spelling in search

## Tips

- Use different browsers (Chrome + Firefox)
- Use incognito mode for easy second session
- Check browser console (F12) for errors
- Test from both users' perspectives
- Clear browser data if things get messy

## Expected Results

After testing:
- ✅ Two users can sign up/login
- ✅ Users can send/accept friend requests
- ✅ Friends see each other's posts
- ✅ Users can like/comment on posts
- ✅ Users can send messages
- ✅ Messages appear real-time
- ✅ Chat history is saved

## Next Steps

- Try with 3+ users
- Test group chats
- Test edge cases (duplicate requests, etc.)
- Test on mobile

---

That's it! Testing with multiple users helps find bugs and make sure everything works correctly.
