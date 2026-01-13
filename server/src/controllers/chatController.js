import { ChatRoom } from '../models/ChatRoom.js';
import {
  getChatRooms,
  getRoomMessages,
  markMessagesAsRead,
} from '../services/chatService.js';
import {
  createGroupRoom,
  addMembersToGroup,
  leaveGroupChat,
  deleteChatRoom,
  acceptGroupInvitation,
  declineGroupInvitation,
  getGroupInvitations,
  updateGroupName,
  makeManager,
  removeManager,
} from '../services/groupChatService.js';
import { uploadFileToCloudinary, imageToDataUrl, upload } from '../utils/upload.js';

export const getRooms = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log('Getting rooms for user:', userId);
    const rooms = await getChatRooms(userId);
    console.log('Found rooms:', rooms.length);
    res.json(rooms);
  } catch (error) {
    console.error('Error getting rooms:', error);
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getRoomMessages(roomId, userId, cursor, limit);
    
    // Mark all messages in this room as read when user views them (only on initial load, not pagination)
    if (result.messages && result.messages.length > 0 && !cursor) {
      const messageIds = result.messages
        .filter(msg => {
          // Only mark messages as read if user is not the sender
          const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
          return senderId !== userId.toString();
        })
        .map(msg => msg._id);
      
      if (messageIds.length > 0) {
        await markMessagesAsRead(messageIds, roomId, userId);
      }
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const { messageIds } = req.body;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ error: 'messageIds array is required' });
    }

    await markMessagesAsRead(messageIds, roomId, userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, memberIds } = req.body;

    if (!name || !memberIds || !Array.isArray(memberIds) || memberIds.length < 1) {
      return res.status(400).json({ error: 'Group name and at least one member required' });
    }

    const room = await createGroupRoom(userId, name, memberIds);
    
    // Emit socket events to notify newly added members
    try {
      const io = global.io || (await import('../index.js')).io;
      if (io) {
        // Get the room with populated data
        const populatedRoom = await ChatRoom.findById(room._id)
          .populate('members', 'username avatarUrl isOnline lastSeen')
          .populate('admin', 'username avatarUrl')
          .populate('managers', 'username avatarUrl');
        
        // Filter out creator from memberIds
        const newMemberIds = memberIds.filter(id => id.toString() !== userId.toString());
        
        // Make newly added members join the room socket room and notify them
        newMemberIds.forEach(memberId => {
          const memberIdStr = memberId.toString();
          
          // Find all sockets for this user and make them join the room
          io.sockets.sockets.forEach(socket => {
            if (socket.user && socket.user._id.toString() === memberIdStr) {
              socket.join(room._id.toString());
            }
          });
          
          // Notify the newly added member
          io.to(memberIdStr).emit('added-to-group', {
            roomId: room._id.toString(),
            room: populatedRoom.toJSON(),
          });
        });
        
        // Notify creator about the new group
        io.to(userId.toString()).emit('room-created', {
          roomId: room._id.toString(),
          room: populatedRoom.toJSON(),
        });
      }
    } catch (error) {
      console.error('Error emitting socket events for group creation:', error);
      // Don't fail the request if socket emission fails
    }
    
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const addMembers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'memberIds array required' });
    }

    // Get existing room to check current members before adding
    const existingRoom = await ChatRoom.findById(roomId);
    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const existingMemberIds = existingRoom.members.map(m => m.toString());
    
    const room = await addMembersToGroup(roomId, userId, memberIds);
    
    // Emit socket event to notify newly added members
    // Access io from global or try dynamic import
    try {
      const io = global.io || (await import('../index.js')).io;
      if (io) {
        // Get the room with populated data
        const populatedRoom = await ChatRoom.findById(roomId)
          .populate('members', 'username avatarUrl isOnline lastSeen')
          .populate('admin', 'username avatarUrl')
          .populate('managers', 'username avatarUrl');
        
        // Find newly added member IDs
        const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id.toString()));
        
        console.log('Newly added member IDs:', newMemberIds);
        console.log('Room ID:', roomId.toString());
        
        // Make newly added members join the room socket room and notify them
        newMemberIds.forEach(memberId => {
          const memberIdStr = memberId.toString();
          
          // Find all sockets for this user and make them join the room
          let foundSockets = 0;
          io.sockets.sockets.forEach(socket => {
            if (socket.user && socket.user._id.toString() === memberIdStr) {
              socket.join(roomId.toString());
              foundSockets++;
            }
          });
          
          console.log(`Found ${foundSockets} socket(s) for user ${memberIdStr}`);
          
          // Notify the newly added member via their user ID room (they join this on connection)
          io.to(memberIdStr).emit('added-to-group', {
            roomId: roomId.toString(),
            room: populatedRoom.toJSON(),
          });
          
          console.log(`Emitted 'added-to-group' to user ${memberIdStr}`);
        });
        
        // Notify all existing members about the update
        io.to(roomId.toString()).emit('room-updated', {
          roomId: roomId.toString(),
          room: populatedRoom.toJSON(),
        });
        
        console.log(`Emitted 'room-updated' to room ${roomId.toString()}`);
      } else {
        console.warn('Socket.IO instance not available');
      }
    } catch (error) {
      console.error('Error emitting socket events:', error);
      // Don't fail the request if socket emission fails
    }
    
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId, memberId } = req.params;

    const room = await removeMemberFromGroup(roomId, userId, memberId);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    const room = await leaveGroupChat(roomId, userId);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    const result = await deleteChatRoom(roomId, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getInvitations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const invitations = await getGroupInvitations(userId);
    res.json({ invitations });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { invitationId } = req.body;

    const room = await acceptGroupInvitation(invitationId, userId);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const declineInvitation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { invitationId } = req.body;

    const invitation = await declineGroupInvitation(invitationId, userId);
    res.json(invitation);
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    let fileUrl;

    try {
      // Try to upload to Cloudinary
      fileUrl = await uploadFileToCloudinary(file.buffer, file.mimetype, 'messages');
    } catch (uploadError) {
      // Fallback to base64 if Cloudinary fails or not configured
      if (process.env.NODE_ENV === 'development') {
        fileUrl = imageToDataUrl(file.buffer, file.mimetype);
      } else {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file' });
      }
    }

    res.json({
      url: fileUrl,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const room = await updateGroupName(roomId, userId, name);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const promoteToManager = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId, memberId } = req.params;

    const room = await makeManager(roomId, userId, memberId);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const demoteManager = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId, managerId } = req.params;

    const room = await removeManager(roomId, userId, managerId);
    res.json(room);
  } catch (error) {
    next(error);
  }
};
