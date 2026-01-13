import mongoose from 'mongoose';
import { ChatRoom } from '../models/ChatRoom.js';
import { Message } from '../models/Message.js';

export const getOrCreatePrivateRoom = async (user1Id, user2Id) => {
  // Verify users are friends before creating/accessing private room
  const { User } = await import('../models/User.js');
  const user1 = await User.findById(user1Id);
  if (!user1) {
    throw new Error('User not found');
  }

  const isFriend = user1.friends.some(
    friendId => friendId.toString() === user2Id.toString()
  );
  if (!isFriend) {
    throw new Error('You can only message friends');
  }

  // Check if private room already exists
  let room = await ChatRoom.findOne({
    type: 'private',
    members: { $all: [user1Id, user2Id], $size: 2 },
  });

  if (!room) {
    room = new ChatRoom({
      type: 'private',
      members: [user1Id, user2Id],
    });
    await room.save();
  }

  return await ChatRoom.findById(room._id)
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('managers', 'username avatarUrl');
};

export const getChatRooms = async (userId) => {
  const rooms = await ChatRoom.find({
    members: userId,
  })
    .populate('members', 'username avatarUrl isOnline lastSeen')
    .populate('admin', 'username avatarUrl')
    .populate('managers', 'username avatarUrl')
    .sort({ lastMessageAt: -1 })
    .lean(); // Use lean() for better performance

  // Get unread counts for each room
  const roomIds = rooms.map(room => room._id);
  const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  
  // Get all messages in these rooms that the user hasn't read
  // Find messages where the user is not the sender AND user's ID is not in readBy array
  const allMessages = await Message.find({
    roomId: { $in: roomIds },
    senderId: { $ne: userIdObj }, // Don't count messages sent by the user
  }).select('roomId readBy').lean();
  
  // Filter messages where user hasn't read them
  const unreadMessages = allMessages.filter(msg => {
    const hasRead = msg.readBy && msg.readBy.some(
      read => read.userId && read.userId.toString() === userIdObj.toString()
    );
    return !hasRead;
  });
  
  // Count unread messages per room
  const unreadMap = {};
  unreadMessages.forEach(msg => {
    const roomIdStr = msg.roomId.toString();
    unreadMap[roomIdStr] = (unreadMap[roomIdStr] || 0) + 1;
  });

  // Convert to plain objects and ensure lastMessageAt exists, add unread count
  return rooms.map(room => ({
    ...room,
    lastMessageAt: room.lastMessageAt || room.createdAt || new Date(),
    unreadCount: unreadMap[room._id.toString()] || 0,
  }));
};

export const getRoomMessages = async (roomId, userId, cursor = null, limit = 50) => {
  // Verify user is member of room
  const room = await ChatRoom.findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const isMember = room.members.some(
    memberId => memberId.toString() === userId.toString()
  );
  if (!isMember) {
    throw new Error('Unauthorized to access this room');
  }

  const query = { roomId };
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(query)
    .populate('senderId', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt : null;

  // Reverse to get chronological order
  messages.reverse();

  return {
    messages,
    nextCursor,
    hasMore,
  };
};

export const createMessage = async (roomId, senderId, content, attachments = []) => {
  const message = new Message({
    roomId,
    senderId,
    content,
    attachments,
    readBy: [{ userId: senderId }], // Mark as read by sender
  });

  await message.save();

  // Update room's lastMessageAt
  await ChatRoom.findByIdAndUpdate(roomId, {
    lastMessageAt: new Date(),
  });

  return await Message.findById(message._id)
    .populate('senderId', 'username avatarUrl');
};

export const markMessagesAsRead = async (messageIds, roomId, userId) => {
  await Message.updateMany(
    {
      _id: { $in: messageIds },
      roomId,
      'readBy.userId': { $ne: userId },
    },
    {
      $push: {
        readBy: {
          userId,
          readAt: new Date(),
        },
      },
    }
  );
};

