# Getting Started - Quick Setup Guide

This guide will get you running in about 10 minutes. Follow the steps and you should be good to go.

## What You Need

- Computer (any OS)
- Internet
- Text editor (VS Code is good)
- About 15 minutes

## Step 1: Install Node.js

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (big green button)
3. Install it (just follow the installer)
4. Check if it worked:
```bash
node --version
```
Should show `v18.17.0` or higher.

## Step 2: Get the Code

**Option A: Download ZIP**
1. Click "Code" → "Download ZIP"
2. Extract it somewhere

**Option B: Git**
```bash
git clone <repo-url>
cd Social-Network
```

## Step 3: Set Up MongoDB

**MongoDB Atlas (Easier):**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up free
3. Create a free cluster
4. Create database user (remember password!)
5. Whitelist IP (click "Add Current IP")
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the string
   - Replace `<username>` and `<password>`
   - Add `/social-network?retryWrites=true&w=majority` at the end

You'll need this connection string in the next step.

## Step 4: Backend Setup

1. Open terminal, go to server folder:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```
(Wait a couple minutes)

3. Create `.env`:
```bash
cp .env.example .env
```
(Windows: copy manually)

4. Edit `.env`:
```
PORT=3000
MONGODB_URI=paste-your-mongodb-connection-string-here
JWT_SECRET=generate-below
JWT_REFRESH_SECRET=generate-below
FRONTEND_URL=http://localhost:5173
```

5. Generate secrets (run twice):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy each result into JWT_SECRET and JWT_REFRESH_SECRET.

6. Start server:
```bash
npm run dev
```

Should see "MongoDB Connected" and "Server running on port 3000". Keep this terminal open!

## Step 5: Frontend Setup

1. Open NEW terminal

2. Go to client folder:
```bash
cd client
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env`:
```bash
cp .env.example .env
```

5. Make sure `.env` has:
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

6. Start frontend:
```bash
npm run dev
```

Should open browser automatically at `http://localhost:5173`.

## Step 6: Test It

1. Sign up with a new account
2. Create a post
3. Try chatting
4. Send a friend request

If all that works, you're done! 🎉

## Troubleshooting

**"npm is not recognized"**
- Node.js not installed. Reinstall it.

**"Port 3000 in use"**
- Close other programs or change PORT in `.env`

**"MongoDB connection failed"**
- Check connection string in `.env`
- Make sure Atlas cluster is running
- Check IP whitelist

**"Cannot find module"**
- Run `npm install` in the folder that's erroring

**Blank page**
- Press F12, check console for errors
- Make sure both servers are running

## Checklist

Before asking for help, check:
- [ ] Node.js installed (`node --version` works)
- [ ] MongoDB set up
- [ ] `server/.env` exists and filled in
- [ ] `client/.env` exists and filled in
- [ ] Backend running (Terminal 1)
- [ ] Frontend running (Terminal 2)
- [ ] Browser at `http://localhost:5173`

## Next Steps

- Read the main README for more info
- Check `docs/HOW_TO_CHAT.md` for chat features
- Try `docs/TESTING_TWO_USERS.md` to test with multiple users

---

That's it! If something's not working, check the error messages - they usually tell you what's wrong.
