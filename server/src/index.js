import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { corsMiddleware } from './middlewares/cors.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';
import { initializeSocketIO } from './sockets/index.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(httpServer);

// Make io available globally for use in controllers
global.io = io;

// Middleware
// CORS must be before other middleware - handle all requests including OPTIONS
app.use(corsMiddleware);

// Configure Helmet to work with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter - skip for OPTIONS requests and auth routes (they have their own limiter)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  // Skip global rate limiter for auth routes (they have authLimiter)
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  // Skip global rate limiter for user routes that are frequently called
  if (req.path.startsWith('/api/users/friends') || 
      req.path.startsWith('/api/users/me') ||
      req.path.startsWith('/api/users/email') ||
      req.path.startsWith('/api/users/password') ||
      req.path.match(/^\/api\/users\/[a-f0-9]{24}$/) || // Match /api/users/:id pattern (GET)
      req.path.match(/^\/api\/users\/[a-f0-9]{24}\/edit$/)) { // Match /api/users/:id/edit pattern (PUT)
    return next();
  }
  // Skip global rate limiter for chat routes that are frequently called
  if (req.path.startsWith('/api/chat/rooms')) {
    return next();
  }
  // Skip global rate limiter for friend routes that are frequently called
  if (req.path.startsWith('/api/friends/requests')) {
    return next();
  }
  generalLimiter(req, res, next);
});

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

// Connect to database and start server
connectDB().then(() => {
  httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
});

export { io };

