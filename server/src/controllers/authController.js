import { createUser, findUserByEmail, issueTokens, requestPasswordReset } from '../services/authService.js';
import { comparePassword } from '../utils/password.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { uploadToCloudinary, imageToDataUrl } from '../utils/upload.js';

export const signup = async (req, res, next) => {
  try {
    const { username, email, password, avatarUrl } = req.body;
    let finalAvatarUrl = avatarUrl || null;

    // If avatar file was uploaded, process it
    if (req.file) {
      try {
        finalAvatarUrl = await uploadToCloudinary(req.file.buffer, 'avatars');
      } catch (uploadError) {
        // Fallback to base64 if Cloudinary fails or not configured
        if (process.env.NODE_ENV === 'development') {
          finalAvatarUrl = imageToDataUrl(req.file.buffer, req.file.mimetype);
        } else {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ error: 'Failed to upload avatar' });
        }
      }
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await createUser(username, email, password, finalAvatarUrl);
    const { accessToken, refreshToken } = issueTokens(user._id.toString());

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = issueTokens(user._id.toString());

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = issueTokens(user._id.toString());

    // Update refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

