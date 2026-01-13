import { User } from '../models/User.js';

// Map to track online users: userId -> socketId[]
const onlineUsers = new Map();

export const handleConnection = async (socket, io) => {
  const userId = socket.user._id.toString();
  
  // Join user to their own room so we can send them presence updates
  socket.join(userId);
  
  // Add user to online users
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, []);
  }
  onlineUsers.get(userId).push(socket.id);

  // Update user's online status in database
  await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

  // Fetch user with populated friends to notify them
  const user = await User.findById(userId).populate('friends', '_id');
  if (user && user.friends) {
    // Notify all friends about online status
    user.friends.forEach(friend => {
      const friendId = friend._id?.toString() || friend.toString();
      // Emit to the friend's room (they joined it when they connected)
      io.to(friendId).emit('presence', {
        userId,
        isOnline: true,
      });
    });
  }
};

export const handleDisconnection = async (socket, io) => {
  const userId = socket.user._id.toString();
  
  // Remove socket from online users
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    const index = sockets.indexOf(socket.id);
    if (index > -1) {
      sockets.splice(index, 1);
    }
    
    // If no more sockets, user is offline
    if (sockets.length === 0) {
      onlineUsers.delete(userId);
      
      // Update user's online status in database
      await User.findByIdAndUpdate(userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      });

      // Fetch user with populated friends to notify them
      const user = await User.findById(userId).populate('friends', '_id');
      if (user && user.friends) {
        // Notify all friends about offline status
        user.friends.forEach(friend => {
          const friendId = friend._id?.toString() || friend.toString();
          io.to(friendId).emit('presence', {
            userId,
            isOnline: false,
          });
        });
      }
    }
  }
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

