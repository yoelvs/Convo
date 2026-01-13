# 💬 Convo - Social Network App

Hey! This is my fullstack social network project.
Users can chat, post stuff, make friends, and all that. 
I built this for my fullstack course final project.

## What This Project Is

So this is a **full-stack** app, meaning it has two parts:
- **Frontend** - The React app that users see and click around in
- **Backend** - The Node.js server that does all the heavy lifting (database, API, real-time stuff)

Think of it like a restaurant - frontend is the dining room, backend is the kitchen.

## Features

- **User stuff**: Sign up (with terms acceptance), login, edit your profile
- **Feed**: Post things, like posts, comment on them
- **Friends**: Send friend requests, accept/decline them (with resend support after decline)
- **Chat**: Real-time messaging with Socket.IO (like WhatsApp)
  - Private chats and group chats
  - File attachments (images, documents)
  - Share friends and location
  - Unread message counters
  - Group chat managers (creator + promoted managers)
  - Message multiple users simultaneously
- **Navigation**: 
  - Brand link navigates to Chats
  - Unread message counters on Chat link
  - Incoming friend request counter on Friends link
  - Options menu (Settings, Chats Selection, Mark All as Read, Tips & Shortcuts)
- **Keyboard Shortcuts**: Quick navigation and actions (Ctrl/Cmd + G for Chat, etc.)
- **Cookie Consent**: First-time login requires cookie consent
- **Footer Links**: Terms, Privacy, Security, Contact, Docs, Manage Cookies
- **Dark mode**: Switch between light/dark themes
- **Mobile**: Works on phones too (kinda, I tried my best)

## What You Need

Before you can run this, you need:

### 1. Node.js
Go to [nodejs.org](https://nodejs.org/) and download the LTS version. Install it, then check if it worked:
```bash
node --version
```
Should show something like `v18.17.0` or higher.

### 2. MongoDB
You have two options:

**Option A: MongoDB Atlas (Cloud - easier)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a free cluster
4. Create a database user (remember the password!)
5. Whitelist your IP (or use 0.0.0.0/0 for dev)
6. Get the connection string

**Option B: Local MongoDB**
Download from [mongodb.com/download](https://www.mongodb.com/try/download/community) and install it locally.

### 3. Git
If you want to clone the repo. Most people already have it installed.

## Getting Started

### Backend Setup

1. Go to the server folder:
```bash
cd server
```

2. Install stuff:
```bash
npm install
```
(This takes a minute or two)

3. Create `.env` file:
- Copy `.env.example` to `.env`
- On Mac/Linux: `cp .env.example .env`
- On Windows: just copy the file manually

4. Fill in `.env`:
```
PORT=3000
MONGODB_URI=your-connection-string-here
JWT_SECRET=generate-this-below
JWT_REFRESH_SECRET=generate-this-too
FRONTEND_URL=http://localhost:5173
```

5. Generate secrets (run this twice in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy each result into JWT_SECRET and JWT_REFRESH_SECRET.

6. Start the server:
```bash
npm run dev
```

You should see "MongoDB Connected" and "Server running on port 3000". Keep this terminal open!

### Frontend Setup

1. Open a NEW terminal (keep backend running!)

2. Go to client folder:
```bash
cd client
```

3. Install dependencies:
```bash
npm install
```

4. Create `.env`:
- Copy `.env.example` to `.env`

5. Make sure `.env` has:
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

6. Start frontend:
```bash
npm run dev
```

Should open automatically at `http://localhost:5173`. If not, just go there manually.

## Testing It Out

1. Sign up with a new account (you'll need to accept terms)
2. Accept cookie consent on first login
3. Create a post
4. Try the chat feature:
   - Send messages to individual friends
   - Create group chats
   - Send files and attachments
   - Message multiple users at once
5. Send a friend request (you can resend if declined)
6. Try keyboard shortcuts (Ctrl/Cmd + G for Chat, etc.)
7. Check unread message counters
8. Toggle dark mode in settings
9. Explore footer links (Terms, Privacy, Docs, etc.)

## Project Structure
```
Social-Network/
├── client/                    # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── ChatPage/
│   │   │   │   ├── ChatPage.jsx
│   │   │   │   └── ChatPage.css
│   │   │   ├── FeedPage/
│   │   │   ├── FriendsPage/
│   │   │   └── ProfilePage/
│   │   ├── components/       # Reusable components
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ChatItem.jsx
│   │   │   │   └── Sidebar.css
│   │   │   ├── TopBar/
│   │   │   │   ├── TopBar.jsx
│   │   │   │   └── TopBar.css
│   │   │   ├── shared/       # Shared UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── Modal.jsx
│   │   │   └── EmptyState/
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useChats.js
│   │   │   └── useTheme.js
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── api/              # API calls
│   │   │   ├── axios.js      # Axios configuration
│   │   │   ├── chatApi.js
│   │   │   ├── userApi.js
│   │   │   └── authApi.js
│   │   ├── utils/            # Utility functions
│   │   │   ├── formatDate.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── styles/           # Global styles
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── themes.css
│   │   ├── assets/           # Images, fonts, etc.
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.jsx
│   ├── .env                  # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── index.js     # Main router
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── post.routes.js
│   │   ├── controllers/     # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── post.controller.js
│   │   ├── models/          # Database models
│   │   │   ├── User.model.js
│   │   │   ├── Chat.model.js
│   │   │   ├── Message.model.js
│   │   │   └── Post.model.js
│   │   ├── services/        # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── chat.service.js
│   │   │   ├── user.service.js
│   │   │   └── notification.service.js
│   │   ├── middleware/      # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── config/          # Configuration files
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── cloudinary.js
│   │   ├── utils/           # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── socket/          # Socket.IO logic
│   │   │   └── chatSocket.js
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── SETUP.md            # Setup instructions
│   ├── ARCHITECTURE.md     # Architecture overview
│   └── CONTRIBUTING.md     # Contribution guidelines
│
├── .gitignore              # Root gitignore
├── README.md               # Main project README
└── package.json            # Root package.json (optional, for scripts)
```

## Tech Stack

**Frontend:**
- React 18 with Vite
- React Router
- Context API for state management
- Axios for API calls
- Socket.IO client for real-time features
- CSS3 with CSS Variables for theming

**Backend:**
- Node.js + Express
- Socket.IO for real-time communication
- MongoDB + Mongoose
- JWT for authentication (access + refresh tokens)
- Bcrypt for password hashing
- Joi for input validation

## Common Issues

**"npm is not recognized"**
- Node.js isn't installed or not in PATH. Reinstall it.

**"Port 3000 already in use"**
- Something else is using port 3000. Close it or change PORT in `.env`.

**"MongoDB connection failed"**
- Check your connection string in `.env`
- Make sure MongoDB is running (if local)
- Check IP whitelist in Atlas

**"Cannot find module"**
- Run `npm install` in the folder that's erroring

**Frontend can't connect**
- Make sure backend is running
- Check the URLs in `client/.env`

**Blank page**
- Open browser console (F12) and check for errors
- Make sure both servers are running

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id/edit` - Update profile
- `GET /api/users/search` - Search users

### Friends
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/decline` - Decline friend request
- `GET /api/friends/requests` - Get pending requests

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/comments` - Add comment
- `DELETE /api/posts/:postId` - Delete post

### Chat
- `GET /api/chat/rooms` - Get all chat rooms
- `GET /api/chat/rooms/:roomId/messages` - Get messages (with cursor pagination)
- `POST /api/chat/upload` - Upload file attachment
- `POST /api/chat/groups/:roomId/managers/:memberId` - Promote to manager
- `DELETE /api/chat/groups/:roomId/managers/:managerId` - Demote manager

## Socket.IO Events

### Client → Server
- `join-room` - Join a chat room
- `private-message` - Send private message (supports attachments)
- `group-message` - Send group message (supports attachments)
- `typing` - Emit typing indicator
- `message-read` - Mark messages as read

### Server → Client
- `new-message` - Receive new message
- `typing` - User is typing notification
- `messages-read` - Messages marked as read
- `presence` - User online/offline status
- `joined-room` - Successfully joined room

## Keyboard Shortcuts

- `Ctrl/Cmd + G` - Navigate to Chat
- `Ctrl/Cmd + F` - Navigate to Friends
- `Ctrl/Cmd + C` - Navigate to Chats
- `Ctrl/Cmd + S` - Navigate to Settings
- `/` - Focus search input
- `Esc` - Close modals/menus
- `Enter` - Send message (in chat input)

## Key Concepts

### What is Cursor?

Cursor is a timestamp (date/time) that marks the position in the message history. It points to the oldest message from the last batch fetched.

**Why use cursor instead of offset?**
- More efficient: avoids skipping rows
- Consistent: handles new messages during pagination
- Better performance: uses indexed timestamp queries

In short, cursor is a timestamp bookmark for loading older messages in chunks.

### Component Architecture

This project follows a **component-based architecture** where:
- Each feature has its own folder with related components
- Shared components are reusable across the app
- Custom hooks encapsulate reusable logic
- Context provides global state management

**Example: Chat Feature Structure**
```
ChatPage/
├── ChatPage.jsx       # Main page component
├── Sidebar.jsx        # Chat list sidebar
├── MessageList.jsx    # Message display
├── MessageInput.jsx   # Send message input
└── ChatPage.css       # Page styles
```

## Security Features

- **JWT Authentication**: Access tokens (15min) + refresh tokens (7 days)
- **Password Security**: Bcrypt hashing with salt rounds
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Joi schemas for all inputs
- **Rate Limiting**: Prevents API abuse
- **Cookie Consent**: GDPR-compliant cookie management
- **Terms Acceptance**: Required during signup

## Deployment

When you're ready to deploy:

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```
Deploy the `dist` folder.

### Backend (Render/Railway/Heroku)
1. Set environment variables in hosting platform
2. Ensure MongoDB Atlas connection string is configured
3. Update FRONTEND_URL to production URL
4. Deploy from GitHub or manually

### Environment Variables

**Production Frontend (.env):**
```
VITE_API_URL=https://your-api.com/api
VITE_SOCKET_URL=https://your-api.com
```

**Production Backend (.env):**
```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend.com
NODE_ENV=production
```

See `docs/ENV_SETUP.md` for more details.

## Development Scripts

**Root package.json (optional):**
```json
{
  "scripts": {
    "client": "cd client && npm start",
    "server": "cd server && npm run dev",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "install-all": "npm install && cd client && npm install && cd ../server && npm install"
  }
}
```

Run both servers at once:
```bash
npm run dev
```

## Best Practices Used

1. **Separation of Concerns**: Routes → Controllers → Services → Models
2. **Component Reusability**: Shared components in `/components/shared`
3. **Custom Hooks**: Reusable logic extracted into hooks
4. **Environment Variables**: Sensitive data kept in `.env` files
5. **Error Handling**: Centralized error middleware
6. **Code Organization**: Feature-based folder structure
7. **Naming Conventions**: 
   - PascalCase for components (`ChatItem.jsx`)
   - camelCase for functions and variables
   - UPPERCASE for constants

## Notes

- This was built for learning purposes
- Some features might have bugs (I'm still learning!)
- Feel free to improve it or use it as a reference
- Check the `docs/` folder for more detailed guides
- Contributions are welcome! See `docs/CONTRIBUTING.md`

## License

ISC

## Author

Yoel Vorka  
Fullstack Course 2025-2026

---

## Quick Start (TL;DR)
```bash
# Clone the repo
git clone <your-repo-url>

# Install all dependencies
npm run install-all

# Setup environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Generate JWT secrets and add to server/.env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Start both servers
npm run dev
```

Then open `http://localhost:5173` in your browser!

---

Hope this helps! If you have questions, check the docs folder or look at the code comments. Happy coding! 🚀
