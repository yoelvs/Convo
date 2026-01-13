import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../utils/storage';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
      const token = getAccessToken();

      const newSocket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Update socket auth token when access token changes
  useEffect(() => {
    if (socket && socketRef.current) {
      const token = getAccessToken();
      socketRef.current.auth.token = token;
      // Reconnect with new token
      if (socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current.connect();
      }
    }
  }, [socket]);

  const value = {
    socket,
    connected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

