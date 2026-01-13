import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../api/chatApi';
import { useSocket } from './useSocket';

export const useChatRoom = (roomId) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]); // Array of { userId, username }
  const loadingRef = useRef(false);
  const currentRoomIdRef = useRef(null);
  const abortControllerRef = useRef(null);

  const loadMessages = useCallback(async (pageCursor = null) => {
    if (!roomId) return;
    
    // Don't load if already loading - only check ref
    if (loadingRef.current) return;
    
    // Determine which cursor to use
    const cursorToUse = pageCursor !== null ? pageCursor : cursor;
    
    // Don't load more if we've reached the end (unless it's a fresh load with cursorToUse === null)
    if (!hasMore && cursorToUse !== null) return;

    loadingRef.current = true;
    setLoading(true);
    
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const data = await chatApi.getMessages(roomId, cursorToUse);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) return;
      
      setMessages((prev) => {
        // If cursorToUse is null, this is a fresh load - replace messages
        if (cursorToUse === null) {
          return data.messages || [];
        }
        // Otherwise, prepend new messages for pagination
        return [...data.messages, ...prev];
      });
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      // Don't log aborted requests
      if (error.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [roomId, cursor, hasMore]); // Removed 'loading' from dependencies to prevent infinite loops
  
  useEffect(() => {
    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Only reload if roomId actually changed
    const roomIdStr = roomId?.toString();
    const currentRoomIdStr = currentRoomIdRef.current?.toString();
    
    if (roomId && roomIdStr !== currentRoomIdStr) {
      currentRoomIdRef.current = roomId;
      loadingRef.current = false;
      
      // Reset state when room changes
      setMessages([]);
      setCursor(null);
      setHasMore(true);
      setLoading(false);
      
      // Load messages for the new room after state is reset
      // Call API directly to avoid dependency issues with loadMessages callback
      const loadMessagesForRoom = async () => {
        // Double-check we're still on the same room before loading
        const currentRoomIdStrCheck = currentRoomIdRef.current?.toString();
        if (loadingRef.current || currentRoomIdStrCheck !== roomIdStr) {
          return;
        }
        
        loadingRef.current = true;
        setLoading(true);
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        try {
          const data = await chatApi.getMessages(roomId, null);
          
          // Check if request was aborted or room changed
          const finalRoomIdStr = currentRoomIdRef.current?.toString();
          if (abortControllerRef.current?.signal.aborted || finalRoomIdStr !== roomIdStr) {
            return;
          }
          
          // Only update if we're still on the same room
          setMessages(data.messages || []);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        } catch (error) {
          // Don't log aborted requests or network errors from aborted requests
          if (error.name !== 'AbortError' && 
              !abortControllerRef.current?.signal.aborted &&
              error.code !== 'ERR_INSUFFICIENT_RESOURCES') {
            console.error('Failed to load messages:', error);
            const finalRoomIdStr = currentRoomIdRef.current?.toString();
            if (finalRoomIdStr === roomIdStr) {
              setMessages([]);
            }
          }
        } finally {
          const finalRoomIdStr = currentRoomIdRef.current?.toString();
          if (finalRoomIdStr === roomIdStr) {
            setLoading(false);
          }
          loadingRef.current = false;
        }
      };
      
      // Small delay to ensure state reset completes
      const timer = setTimeout(loadMessagesForRoom, 100);
      
      return () => {
        clearTimeout(timer);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    } else if (!roomId) {
      // Clear messages when no room is selected
      currentRoomIdRef.current = null;
      setMessages([]);
      setCursor(null);
      setHasMore(true);
      setLoading(false);
      loadingRef.current = false;
    }
  }, [roomId]); // Only depend on roomId to trigger reload when switching rooms

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('join-room', { roomId });

    const handleNewMessage = (data) => {
      const messageRoomId = data.roomId?.toString();
      const currentRoomId = roomId?.toString();
      
      if (messageRoomId === currentRoomId) {
        // Check if message already exists to avoid duplicates
        setMessages((prev) => {
          const exists = prev.some(msg => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    };

    const handleTyping = (data) => {
      const currentRoomId = roomId?.toString();
      const dataRoomId = data.roomId?.toString();
      
      if (dataRoomId === currentRoomId) {
        if (data.isTyping) {
          setTypingUsers((prev) => {
            // Check if user is already in the list
            const exists = prev.some(u => 
              (u.userId?.toString() || u.toString()) === (data.userId?.toString() || data.userId)
            );
            if (!exists) {
              return [...prev, { userId: data.userId, username: data.username }];
            }
            return prev;
          });
        } else {
          setTypingUsers((prev) => 
            prev.filter(u => {
              const uId = u.userId?.toString() || u.toString();
              const dataId = data.userId?.toString() || data.userId;
              return uId !== dataId;
            })
          );
        }
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, roomId]);

  const sendMessage = useCallback(
    (content) => {
      if (!socket || !roomId) return;

      socket.emit('private-message', {
        toUserId: null, // Will be determined by server for private rooms
        content,
        roomId,
      });
    },
    [socket, roomId]
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (!socket || !roomId) return;

      socket.emit('typing', {
        roomId,
        isTyping,
      });
    },
    [socket, roomId]
  );

  return {
    messages,
    loading,
    hasMore,
    loadMore: loadMessages,
    sendMessage,
    sendTyping,
    typingUsers,
  };
};

