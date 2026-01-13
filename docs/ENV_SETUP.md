# Environment Variables Setup

This guide explains how to set up the `.env` files. These files store configuration settings that the app needs to run.

## What Are Environment Variables?

Environment variables are like settings for your app. They're stored in `.env` files (the dot makes them hidden). They contain stuff like database passwords and API keys, so **don't share them!**

## Quick Checklist

Before you start:
- [ ] MongoDB account (Atlas or local)
- [ ] Text editor ready
- [ ] Terminal open

## Backend Setup (`server/.env`)

### Step 1: Create the File

1. Go to `server` folder
2. Find `.env.example`
3. Copy it to `.env`
   - Mac/Linux: `cp .env.example .env`
   - Windows: Copy manually

### Step 2: Fill It In

Open `.env` and it should look like this:

```
PORT=3000
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=http://localhost:5173
```

#### PORT
```
PORT=3000
```
Leave this as 3000 unless something else is using it.

#### MONGODB_URI

**If using MongoDB Atlas:**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/login
3. Click "Build a Database" → Choose FREE tier
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose password auth
   - Enter username and password (write it down!)
   - Click "Add User"
5. Whitelist IP:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Add Current IP Address" (or use `0.0.0.0/0` for dev)
6. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the string
   - Replace `<username>` and `<password>` with your actual credentials
   - Add database name: `...mongodb.net/social-network?retryWrites=true&w=majority`

Example:
```
MONGODB_URI=mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/social-network?retryWrites=true&w=majority
```

**If using local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/social-network
```

#### JWT_SECRET

Generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it:
```
JWT_SECRET=paste-generated-string-here
```

#### JWT_REFRESH_SECRET

Run the same command again (to get a different value):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste it:
```
JWT_REFRESH_SECRET=paste-second-generated-string-here
```

#### FRONTEND_URL
```
FRONTEND_URL=http://localhost:5173
```
Leave this for local development.

### Final `.env` Should Look Like:

```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/social-network?retryWrites=true&w=majority
JWT_SECRET=your-long-random-string-here
JWT_REFRESH_SECRET=your-second-long-random-string-here
FRONTEND_URL=http://localhost:5173
```

## Frontend Setup (`client/.env`)

### Step 1: Create the File

1. Go to `client` folder
2. Copy `.env.example` to `.env`

### Step 2: Fill It In

Open `client/.env` and make sure it has:

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

These should already be correct for local dev. If you changed the backend port, update these too.

## Testing

1. Start backend:
```bash
cd server
npm run dev
```
Look for "MongoDB Connected" and "Server running on port 3000"

2. Start frontend (new terminal):
```bash
cd client
npm run dev
```

3. Try signing up - if it works, you're good!

## Common Mistakes

**Extra spaces:**
❌ `JWT_SECRET = abc123`
✅ `JWT_SECRET=abc123`

**Wrong filename:**
❌ `.env.example`, `env`, `.env.txt`
✅ `.env` (exactly this)

**Special characters in password:**
If your MongoDB password has `@`, `#`, `%`, encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

Example: Password `my@pass#123` becomes `my%40pass%23123` in the connection string.

## Security Tips

1. **Never commit `.env` files** - They're in `.gitignore` already
2. **Use different secrets for production** - Don't use dev secrets in prod
3. **Keep secrets secret** - Don't share them or post online
4. **Rotate if compromised** - Generate new ones if someone gets them

## Production Setup

When deploying:

**Backend env vars** (set in hosting platform):
```
PORT=3000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend env vars** (update before building):
```
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

Then rebuild:
```bash
cd client
npm run build
```

## Quick Reference

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Check if .env exists:**
```bash
# Mac/Linux
ls -la server/.env

# Windows
dir server\.env
```

## Still Having Issues?

1. Check file name is exactly `.env`
2. Check file is in the right folder (`server/` or `client/`)
3. Check for typos
4. Restart servers after changing `.env`
5. Check terminal for specific errors

---

That's it! If you're still stuck, check the main README or look at error messages in the terminal.
