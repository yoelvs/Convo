import { Server } from 'socket.io';
import { jwtHandshakeMiddleware } from './jwtHandshakeMiddleware.js';
import { handleConnection, handleDisconnection } from './presenceHandlers.js';
import {
  handleJoinRoom,
  handlePrivateMessage,
  handleGroupMessage,
  handleTyping,
  handleMessageRead,
} from './chatHandlers.js';

export const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // JWT authentication middleware for Socket.IO
  io.use(jwtHandshakeMiddleware);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);

    // Handle presence
    handleConnection(socket, io);

    // Chat events
    socket.on('join-room', (data) => {
      handleJoinRoom(socket, data.roomId);
    });

    socket.on('private-message', (data) => {
      handlePrivateMessage(socket, io, data);
    });

    socket.on('group-message', (data) => {
      handleGroupMessage(socket, io, data);
    });

    socket.on('typing', (data) => {
      handleTyping(socket, io, data);
    });

    socket.on('message-read', (data) => {
      handleMessageRead(socket, io, data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      handleDisconnection(socket, io);
    });
  });

  return io;
};

