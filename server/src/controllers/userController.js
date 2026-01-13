import { getUserProfile, updateUserProfile, searchUsers, getAllUsers as getAllUsersService, getFriends, updateEmail, updatePassword } from '../services/userService.js';
import { uploadToCloudinary, imageToDataUrl } from '../utils/upload.js';

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?._id;

    const profile = await getUserProfile(id, viewerId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updates = { ...req.body };

    // Convert FormData string values to proper types
    if (updates.theme !== undefined) {
      updates.theme = String(updates.theme); // Ensure it's a string
    }
    if (updates.showOnlineStatus !== undefined) {
      // FormData sends booleans as strings, convert them
      updates.showOnlineStatus = updates.showOnlineStatus === 'true' || updates.showOnlineStatus === true;
    }

    // If avatar file was uploaded, process it
    if (req.file) {
      try {
        updates.avatarUrl = await uploadToCloudinary(req.file.buffer, 'avatars');
      } catch (uploadError) {
        // Fallback to base64 if Cloudinary fails or not configured
        if (process.env.NODE_ENV === 'development') {
          updates.avatarUrl = imageToDataUrl(req.file.buffer, req.file.mimetype);
        } else {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ error: 'Failed to upload avatar' });
        }
      }
    }

    const user = await updateUserProfile(userId, updates);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await getAllUsersService(req.user._id, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getFriendsList = async (req, res, next) => {
  try {
    const friends = await getFriends(req.user._id);
    res.json({ friends });
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const result = await searchUsers(query, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      theme: user.theme || 'light',
      showOnlineStatus: user.showOnlineStatus !== undefined ? user.showOnlineStatus : true,
    });
  } catch (error) {
    next(error);
  }
};

export const changeEmail = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await updateEmail(userId, email);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    await updatePassword(userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

