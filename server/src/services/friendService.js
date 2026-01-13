import { FriendRequest } from '../models/FriendRequest.js';
import { User } from '../models/User.js';

export const sendFriendRequest = async (fromUserId, toUserId) => {
  // Check if users are already friends
  const fromUser = await User.findById(fromUserId);
  if (fromUser.friends.some(friendId => friendId.toString() === toUserId.toString())) {
    throw new Error('Users are already friends');
  }

  // Check if request already exists
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { fromUser: fromUserId, toUser: toUserId },
      { fromUser: toUserId, toUser: fromUserId },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      throw new Error('Friend request already pending');
    }
    if (existingRequest.status === 'accepted') {
      throw new Error('Users are already friends');
    }
    // If request was declined, update it to pending and reuse it
    if (existingRequest.status === 'declined') {
      existingRequest.status = 'pending';
      existingRequest.fromUser = fromUserId;
      existingRequest.toUser = toUserId;
      await existingRequest.save();
      return await FriendRequest.findById(existingRequest._id)
        .populate('fromUser', 'username avatarUrl')
        .populate('toUser', 'username avatarUrl');
    }
  }

  const friendRequest = new FriendRequest({
    fromUser: fromUserId,
    toUser: toUserId,
    status: 'pending',
  });

  await friendRequest.save();
  return await FriendRequest.findById(friendRequest._id)
    .populate('fromUser', 'username avatarUrl')
    .populate('toUser', 'username avatarUrl');
};

export const acceptFriendRequest = async (requestId, userId) => {
  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error('Friend request not found');
  }

  if (request.toUser.toString() !== userId.toString()) {
    throw new Error('Unauthorized to accept this request');
  }

  if (request.status !== 'pending') {
    throw new Error('Friend request is not pending');
  }

  request.status = 'accepted';
  await request.save();

  // Add to friends list
  await User.findByIdAndUpdate(request.fromUser, {
    $addToSet: { friends: request.toUser },
  });
  await User.findByIdAndUpdate(request.toUser, {
    $addToSet: { friends: request.fromUser },
  });

  return await FriendRequest.findById(requestId)
    .populate('fromUser', 'username avatarUrl')
    .populate('toUser', 'username avatarUrl');
};

export const declineFriendRequest = async (requestId, userId) => {
  const request = await FriendRequest.findById(requestId);
  if (!request) {
    throw new Error('Friend request not found');
  }

  if (request.toUser.toString() !== userId.toString()) {
    throw new Error('Unauthorized to decline this request');
  }

  request.status = 'declined';
  await request.save();

  return request;
};

export const getFriendRequests = async (userId) => {
  const incoming = await FriendRequest.find({
    toUser: userId,
    status: 'pending',
  })
    .populate('fromUser', 'username avatarUrl email')
    .sort({ createdAt: -1 });

  const outgoing = await FriendRequest.find({
    fromUser: userId,
    status: 'pending',
  })
    .populate('toUser', 'username avatarUrl email')
    .sort({ createdAt: -1 });

  return { incoming, outgoing };
};

export const removeFriend = async (userId, friendIdToRemove) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if they are friends
  const isFriend = user.friends.some(friendId => friendId.toString() === friendIdToRemove.toString());
  if (!isFriend) {
    throw new Error('Users are not friends');
  }

  // Remove from both users' friends lists
  await User.findByIdAndUpdate(userId, {
    $pull: { friends: friendIdToRemove },
  });
  
  await User.findByIdAndUpdate(friendIdToRemove, {
    $pull: { friends: userId },
  });

  return { success: true };
};

