import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const jwtHandshakeMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

