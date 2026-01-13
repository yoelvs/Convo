import { createMessage, getOrCreatePrivateRoom, markMessagesAsRead } from '../services/chatService.js';
import { ChatRoom } from '../models/ChatRoom.js';

export const handleJoinRoom = (socket, roomId) => {
  socket.join(roomId);
  socket.emit('joined-room', { roomId });
};

export const handlePrivateMessage = async (socket, io, data) => {
  try {
    const { toUserId, content, roomId, attachments = [] } = data;
    const senderId = socket.user._id;

    let room;

    // If roomId is provided, use existing room
    if (roomId) {
      room = await ChatRoom.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Verify user is member of room
      const isMember = room.members.some(
        memberId => memberId.toString() === senderId.toString()
      );
      if (!isMember) {
        throw new Error('Unauthorized to send message to this room');
      }
    } else if (toUserId) {
      // Get or create private room
      room = await getOrCreatePrivateRoom(senderId, toUserId);
    } else {
      throw new Error('Either roomId or toUserId must be provided');
    }

    // Create and save message
    const message = await createMessage(room._id, senderId, content, attachments);

    // Make sure sender is in the socket room
    socket.join(room._id.toString());
    
    // Make sure all room members are in the socket room
    const roomIdStr = room._id.toString();
    io.sockets.sockets.forEach(s => {
      if (s.user && room.members.some(memberId => 
        memberId.toString() === s.user._id.toString()
      )) {
        s.join(roomIdStr);
      }
    });

    // Emit to all users in the room (including sender)
    io.to(roomIdStr).emit('new-message', {
      roomId: roomIdStr,
      message: message.toJSON(),
    });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

export const handleGroupMessage = async (socket, io, data) => {
  try {
    const { roomId, content, attachments = [] } = data;
    const senderId = socket.user._id;

    // Verify user is member of room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const isMember = room.members.some(
      memberId => memberId.toString() === senderId.toString()
    );
    if (!isMember) {
      throw new Error('Unauthorized to send message to this room');
    }

    // Create and save message
    const message = await createMessage(roomId, senderId, content, attachments);

    // Emit to all members in the room
    io.to(roomId).emit('new-message', {
      roomId,
      message: message.toJSON(),
    });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

export const handleTyping = (socket, io, data) => {
  const { roomId, isTyping } = data;
  
  if (!roomId) {
    return; // Can't send typing without a room
  }
  
  // Ensure user is in the room before broadcasting
  socket.join(roomId);
  
  // Broadcast typing status to other members in the room (excluding sender)
  socket.to(roomId).emit('typing', {
    userId: socket.user._id.toString(),
    username: socket.user.username,
    roomId: roomId.toString(),
    isTyping,
  });
};

export const handleMessageRead = async (socket, io, data) => {
  try {
    const { messageIds, roomId } = data;
    const userId = socket.user._id;

    // Mark messages as read
    await markMessagesAsRead(messageIds, roomId, userId);

    // Notify all members in the room (including sender) that messages were read
    io.to(roomId).emit('messages-read', {
      messageIds,
      roomId,
      userId,
    });
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
};

