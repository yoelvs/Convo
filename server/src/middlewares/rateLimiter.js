import rateLimit from 'express-rate-limit';

// Use memory store for development (can be cleared on restart)
// In production, consider using Redis store
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window (increased for development/testing)
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Skip rate limiting for OPTIONS requests
  keyGenerator: (req) => {
    // Use IP address for rate limiting
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Use standard memory store (clears on server restart)
  store: undefined, // Default in-memory store
});

export const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 posts per window
  message: 'Too many posts, please try again later',
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  skip: (req) => req.method === 'OPTIONS', // Skip rate limiting for OPTIONS requests
});

