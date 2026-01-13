import { User } from '../models/User.js';
import { hashPassword } from '../utils/password.js';

export const getUserProfile = async (userId, viewerId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new Error('User not found');
  }

  const profile = user.toJSON();
  
  // Add relationship info if viewer is provided
  if (viewerId && viewerId.toString() !== userId.toString()) {
    const viewer = await User.findById(viewerId);
    const isFriend = viewer.friends.some(
      friendId => friendId.toString() === userId.toString()
    );
    profile.isFriend = isFriend;
    profile.isPendingRequest = false; // Could check FriendRequest model here
  }

  return profile;
};

export const updateUserProfile = async (userId, updates) => {
  const allowedUpdates = ['username', 'bio', 'avatarUrl', 'theme', 'showOnlineStatus'];
  const updateData = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      updateData[key] = updates[key];
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updateEmail = async (userId, newEmail) => {
  // Check if email is already taken
  const existingUser = await User.findOne({ email: newEmail.toLowerCase().trim() });
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new Error('Email is already in use');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { email: newEmail.toLowerCase().trim() } },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await User.findByIdAndUpdate(
    userId,
    { $set: { passwordHash } },
    { new: true }
  );

  return { success: true };
};

export const searchUsers = async (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const searchRegex = new RegExp(query, 'i');
  const users = await User.find({
    $or: [
      { username: searchRegex },
      { email: searchRegex },
    ],
  })
    .select('-passwordHash')
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({
    $or: [
      { username: searchRegex },
      { email: searchRegex },
    ],
  });

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getAllUsers = async (currentUserId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  const users = await User.find({
    _id: { $ne: currentUserId }, // Exclude current user
  })
    .select('-passwordHash')
    .sort({ username: 1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({
    _id: { $ne: currentUserId },
  });

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getFriends = async (userId) => {
  const user = await User.findById(userId).populate('friends', 'username avatarUrl email isOnline lastSeen');
  if (!user) {
    throw new Error('User not found');
  }
  
  // Import online users map to sync real-time online status
  const { isUserOnline } = await import('../sockets/presenceHandlers.js');
  
  // Update friends' online status from real-time map
  const friends = (user.friends || []).map(friend => {
    const friendId = friend._id?.toString() || friend.toString();
    const isOnlineRealTime = isUserOnline(friendId);
    // Use real-time status if available, otherwise fall back to database
    return {
      ...friend.toObject(),
      isOnline: isOnlineRealTime !== undefined ? isOnlineRealTime : friend.isOnline
    };
  });
  
  return friends;
};

