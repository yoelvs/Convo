import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChatRoom } from '../hooks/useChatRoom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import { userApi } from '../api/userApi';
import { formatDate } from '../utils/formatDate';
import axiosClient from '../api/axiosClient';
import { MessageCircle } from 'lucide-react';
import '../styles/components/ChatWindow.css';

export const ChatWindow = ({ roomId, toUserId, toUserIds, toRoomIds, roomType, selectedRoom, onRoomDeleted, onOpenAddMember, showAddMember: externalShowAddMember, onCloseAddMember, onMessageSent }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { messages, sendMessage, sendTyping, typingUsers } = useChatRoom(roomId);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberResults, setAddMemberResults] = useState([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [availableUsersToAdd, setAvailableUsersToAdd] = useState([]);
  const [loadingUsersToAdd, setLoadingUsersToAdd] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [availableFriends, setAvailableFriends] = useState([]);
  const [selectedUsersData, setSelectedUsersData] = useState([]);
  const [selectedRoomsData, setSelectedRoomsData] = useState([]);
  const fileInputRef = useRef(null);
  const attachMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const multiUserMessageTimeoutRef = useRef(null);
  const multiUserMessageHandlerRef = useRef(null);
  const toUserIdsRef = useRef(null);
  const toRoomIdsRef = useRef(null);

  // Load selected users data when toUserIds changes
  useEffect(() => {
    if (toUserIds && toUserIds.length > 0) {
      const loadSelectedUsersData = async () => {
        try {
          const friendsData = await userApi.getFriends();
          const friends = friendsData.friends || [];
          const usersData = toUserIds.map(userId => {
            return friends.find(f => {
              const friendId = f._id?.toString() || f._id;
              return friendId === userId?.toString();
            });
          }).filter(Boolean);
          setSelectedUsersData(usersData);
        } catch (error) {
          console.error('Failed to load selected users data:', error);
          setSelectedUsersData([]);
        }
      };
      loadSelectedUsersData();
    } else {
      setSelectedUsersData([]);
    }
  }, [toUserIds]);

  // Load selected rooms data when toRoomIds changes
  useEffect(() => {
    if (toRoomIds && toRoomIds.length > 0) {
      const loadSelectedRoomsData = async () => {
        try {
          const roomsData = await chatApi.getRooms();
          const rooms = Array.isArray(roomsData) ? roomsData : (roomsData.rooms || []);
          const selectedRooms = toRoomIds.map(roomId => {
            return rooms.find(r => {
              const rId = r._id?.toString() || r._id;
              return rId === roomId?.toString();
            });
          }).filter(Boolean);
          setSelectedRoomsData(selectedRooms);
        } catch (error) {
          console.error('Failed to load selected rooms data:', error);
          setSelectedRoomsData([]);
        }
      };
      loadSelectedRoomsData();
    } else {
      setSelectedRoomsData([]);
    }
  }, [toRoomIds]);

  // Cleanup multi-user message handler on unmount
  useEffect(() => {
    return () => {
      if (multiUserMessageHandlerRef.current && socket) {
        socket.off('new-message', multiUserMessageHandlerRef.current);
        multiUserMessageHandlerRef.current = null;
      }
      if (multiUserMessageTimeoutRef.current) {
        clearTimeout(multiUserMessageTimeoutRef.current);
        multiUserMessageTimeoutRef.current = null;
      }
    };
  }, [socket]);

  // Sync external showAddMember state
  useEffect(() => {
    if (externalShowAddMember !== undefined) {
      setShowAddMember(externalShowAddMember);
      // Load available users when opening add member panel
      if (externalShowAddMember && roomId) {
        loadAvailableUsersToAdd();
      }
    }
  }, [externalShowAddMember, roomId]);

  // Load available users to add to group
  const loadAvailableUsersToAdd = async () => {
    if (!roomId) return;
    
    setLoadingUsersToAdd(true);
    try {
      // Get all friends
      const friendsData = await userApi.getFriends();
      const friends = friendsData.friends || [];
      
      // Get current room members
      const currentRoom = roomDetails || selectedRoom;
      const existingMemberIds = currentRoom?.members?.map(m => {
        const memberId = m._id?.toString() || m.toString();
        return memberId;
      }) || [];
      
      // Filter out current user and existing members
      const available = friends.filter(friend => {
        const friendId = friend._id?.toString() || friend.toString();
        return friendId !== user?.id?.toString() && !existingMemberIds.includes(friendId);
      });
      
      setAvailableUsersToAdd(available);
    } catch (error) {
      console.error('Failed to load available users:', error);
      setAvailableUsersToAdd([]);
    } finally {
      setLoadingUsersToAdd(false);
    }
  };
  
  // Mark messages as read when room is viewed (debounced to avoid too many calls)
  useEffect(() => {
    if (!roomId || !messages.length || !user?.id) return;
    
    const timeoutId = setTimeout(() => {
      // Get message IDs that haven't been read by the current user
      const unreadMessageIds = messages
        .filter(msg => {
          const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
          const isOwnMessage = senderId === user.id?.toString();
          if (isOwnMessage) return false; // Don't mark own messages
          
          // Check if user has read this message
          const hasRead = msg.readBy && msg.readBy.some(
            read => {
              const readUserId = read.userId?._id?.toString() || read.userId?.toString();
              return readUserId === user.id?.toString();
            }
          );
          return !hasRead;
        })
        .map(msg => msg._id);
      
      // Mark messages as read via socket or API
      if (unreadMessageIds.length > 0 && socket) {
        socket.emit('message-read', {
          roomId,
          messageIds: unreadMessageIds,
        });
      } else if (unreadMessageIds.length > 0) {
        chatApi.markMessagesAsRead(roomId, unreadMessageIds).catch(err => {
          console.error('Failed to mark messages as read:', err);
        });
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timeoutId);
  }, [roomId, messages.length, user?.id, socket]);

  // Combine real messages with optimistic messages, removing duplicates
  const allMessages = useMemo(() => {
    const messageMap = new Map();
    
    // Add real messages first
    messages.forEach(msg => {
      const msgId = msg._id?.toString() || msg._id;
      if (msgId) {
        messageMap.set(msgId, msg);
      }
    });
    
    // Add optimistic messages (they will override real messages if they have the same ID)
    optimisticMessages.forEach(msg => {
      const msgId = msg._id?.toString() || msg._id;
      if (msgId) {
        messageMap.set(msgId, msg);
      }
    });
    
    // Convert back to array and sort by createdAt
    return Array.from(messageMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [messages, optimisticMessages]);

  // Fetch room details when roomId changes to ensure we have all members
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) {
        setRoomDetails(null);
        return;
      }

      try {
        const rooms = await chatApi.getRooms();
        const room = rooms.find(r => r._id?.toString() === roomId?.toString() || r._id === roomId);
        if (room) {
          setRoomDetails(room);
        } else {
          setRoomDetails(selectedRoom);
        }
      } catch (error) {
        console.error('Failed to fetch room details:', error);
        setRoomDetails(selectedRoom);
      }
    };

    fetchRoomDetails();
  }, [roomId, selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    if (isTyping) {
      sendTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(false);
      }, 1000);
    } else {
      sendTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping, sendTyping]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('.emoji-button')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && attachments.length === 0) return;

    const messageContent = messageText.trim();
    const tempId = `temp-${Date.now()}`;
    
    const messageAttachments = [...attachments];
    
    // Create optimistic message (appears immediately) - include attachments
    const optimisticMessage = {
      _id: tempId,
      content: messageContent,
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
      senderId: {
        _id: user?.id,
        username: user?.username,
        avatarUrl: user?.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    setMessageText('');
    setAttachments([]);
    setAttachmentPreviews([]);
    setIsTyping(false);

    // If multiple users or groups selected (temporary group), send to each individually
    // Make sure we have valid arrays and store them in refs to prevent state updates from clearing them
    const validUserIds = Array.isArray(toUserIds) ? toUserIds : (toUserIds ? [toUserIds] : []);
    const validRoomIds = Array.isArray(toRoomIds) ? toRoomIds : (toRoomIds ? [toRoomIds] : []);
    
    // Store in refs to preserve during async operations
    toUserIdsRef.current = validUserIds;
    toRoomIdsRef.current = validRoomIds;
    
    const hasMultipleUsers = validUserIds.length > 0;
    const hasMultipleRooms = validRoomIds.length > 0;
    
    console.log('=== MESSAGE SENDING CHECK ===');
    console.log('hasMultipleUsers:', hasMultipleUsers);
    console.log('hasMultipleRooms:', hasMultipleRooms);
    console.log('validUserIds:', validUserIds, 'Length:', validUserIds.length);
    console.log('validRoomIds:', validRoomIds, 'Length:', validRoomIds.length);
    console.log('toUserIds prop:', toUserIds);
    console.log('toRoomIds prop:', toRoomIds);
    console.log('roomId:', roomId);
    console.log('socket exists:', !!socket);
    console.log('===========================');
    
    if ((hasMultipleUsers || hasMultipleRooms) && !roomId && socket) {
      let receivedCount = 0;
      const totalItems = validUserIds.length + validRoomIds.length;
      const sentTimestamp = Date.now();
      
      // Clean up any previous handler
      if (multiUserMessageHandlerRef.current) {
        socket.off('new-message', multiUserMessageHandlerRef.current);
      }
      if (multiUserMessageTimeoutRef.current) {
        clearTimeout(multiUserMessageTimeoutRef.current);
      }
      
      // Track which users/rooms we've received confirmations from to avoid double counting
      const receivedFrom = new Set();
      
      // Set up listener for new messages
      const handleNewMessage = (data) => {
        // Only count messages that arrive shortly after we sent (within 5 seconds)
        // and check if the message content matches (to avoid counting unrelated messages)
        const timeDiff = Date.now() - sentTimestamp;
        if (timeDiff < 5000 && data.message) {
          const msgContent = data.message.content || '';
          const msgSenderId = data.message.senderId?._id?.toString() || data.message.senderId?.toString();
          const isOwnMessage = msgSenderId === user?.id?.toString();
          
          // Check if this is our own message (sent back from server) and content matches
          // Also check attachments match if we sent attachments
          const hasAttachments = messageAttachments && messageAttachments.length > 0;
          const msgHasAttachments = data.message.attachments && data.message.attachments.length > 0;
          const attachmentsMatch = !hasAttachments || (hasAttachments && msgHasAttachments);
          
          if (isOwnMessage && attachmentsMatch && (msgContent === messageContent || messageContent.includes(msgContent) || msgContent.includes(messageContent))) {
            // Track which room/user this message came from to avoid double counting
            const roomId = data.roomId?.toString() || data.roomId;
            if (roomId && !receivedFrom.has(roomId)) {
              receivedFrom.add(roomId);
              receivedCount++;
              
              console.log(`Received confirmation ${receivedCount}/${totalItems} from room:`, roomId, 'with attachments:', msgHasAttachments);
              
              // Remove optimistic message when we receive all confirmations
              if (receivedCount >= totalItems) {
                console.log('All messages confirmed, cleaning up...');
                setOptimisticMessages((prev) => prev.filter(msg => msg._id !== tempId));
                socket.off('new-message', handleNewMessage);
                multiUserMessageHandlerRef.current = null;
                
                if (multiUserMessageTimeoutRef.current) {
                  clearTimeout(multiUserMessageTimeoutRef.current);
                  multiUserMessageTimeoutRef.current = null;
                }
                
                // Notify parent that all messages were sent - close user selection panel immediately
                if (onMessageSent) {
                  // Call immediately to close the panel
                  onMessageSent();
                }
              }
            }
          }
        }
      };
      
      multiUserMessageHandlerRef.current = handleNewMessage;
      socket.on('new-message', handleNewMessage);
      
      // Send message to each user individually - use refs to ensure we have the correct arrays
      // Use the refs first, then fall back to valid arrays, ensuring we have a fresh copy
      const userIdsToSend = (toUserIdsRef.current && toUserIdsRef.current.length > 0) 
        ? [...toUserIdsRef.current]  // Create a copy to ensure we have all items
        : ((validUserIds && validUserIds.length > 0) ? [...validUserIds] : []);
      
      console.log('=== SENDING TO USERS ===');
      console.log('User IDs array:', userIdsToSend);
      console.log('User IDs count:', userIdsToSend.length);
      console.log('User IDs type:', typeof userIdsToSend, Array.isArray(userIdsToSend));
      console.log('toUserIdsRef.current:', toUserIdsRef.current);
      console.log('validUserIds:', validUserIds);
      console.log('toUserIds prop:', toUserIds);
      
      if (userIdsToSend && userIdsToSend.length > 0) {
        // Send to each user sequentially with a delay to ensure each emit is processed
        // Socket.IO processes emits asynchronously, so we need to space them out
        for (let index = 0; index < userIdsToSend.length; index++) {
          const userId = userIdsToSend[index];
          const userIdStr = userId?.toString() || userId;
          console.log(`[${index + 1}/${userIdsToSend.length}] Sending private message to user ID:`, userIdStr);
          
          // Add delay between emits to ensure socket processes each one
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between emits
          }
          
          try {
            // Emit each message individually
            socket.emit('private-message', {
              toUserId: userIdStr,
              content: messageContent,
              attachments: messageAttachments.length > 0 ? messageAttachments : undefined, // Ensure attachments are included
            });
            console.log(`[${index + 1}/${userIdsToSend.length}] ✓ Emitted private-message for user:`, userIdStr, 'with attachments:', messageAttachments.length);
          } catch (error) {
            console.error(`[${index + 1}/${userIdsToSend.length}] ✗ Error emitting to user ${userIdStr}:`, error);
          }
        }
        console.log(`=== FINISHED SENDING TO ${userIdsToSend.length} USERS ===`);
      } else {
        console.log('=== NO USERS TO SEND TO ===');
        console.log('toUserIdsRef.current:', toUserIdsRef.current);
        console.log('validUserIds:', validUserIds);
        console.log('toUserIds prop:', toUserIds);
      }
      
      // Send message to each group individually - use refs to ensure we have the correct arrays
      const roomIdsToSend = (toRoomIdsRef.current && toRoomIdsRef.current.length > 0)
        ? [...toRoomIdsRef.current]  // Create a copy
        : ((validRoomIds && validRoomIds.length > 0) ? [...validRoomIds] : []);
      
      if (roomIdsToSend && roomIdsToSend.length > 0) {
        console.log('=== SENDING TO GROUPS ===');
        console.log('Room IDs array:', roomIdsToSend);
        console.log('Room IDs count:', roomIdsToSend.length);
        console.log('Room IDs type:', typeof roomIdsToSend, Array.isArray(roomIdsToSend));
        
        // Send to each group sequentially with a delay
        for (let index = 0; index < roomIdsToSend.length; index++) {
          const roomId = roomIdsToSend[index];
          const roomIdStr = roomId?.toString() || roomId;
          console.log(`[${index + 1}/${roomIdsToSend.length}] Sending group message to room ID:`, roomIdStr);
          
          // Add delay between emits to ensure socket processes each one
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between emits
          }
          
          try {
            socket.emit('group-message', {
              roomId: roomIdStr,
              content: messageContent,
              attachments: messageAttachments.length > 0 ? messageAttachments : undefined, // Ensure attachments are included
            });
            console.log(`[${index + 1}/${roomIdsToSend.length}] ✓ Emitted group-message for room:`, roomIdStr, 'with attachments:', messageAttachments.length);
          } catch (error) {
            console.error(`[${index + 1}/${roomIdsToSend.length}] ✗ Error emitting to room ${roomIdStr}:`, error);
          }
        }
        console.log(`=== FINISHED SENDING TO ${roomIdsToSend.length} GROUPS ===`);
      }
      
      // Set a timeout to clean up if we don't receive all messages
      multiUserMessageTimeoutRef.current = setTimeout(() => {
        socket.off('new-message', handleNewMessage);
        multiUserMessageHandlerRef.current = null;
        // Remove optimistic message after timeout
        setOptimisticMessages((prev) => prev.filter(msg => msg._id !== tempId));
        // Notify parent even if we didn't get all confirmations (messages were still sent)
        // Close user selection panel immediately
        if (onMessageSent) {
          onMessageSent();
        }
        multiUserMessageTimeoutRef.current = null;
      }, 5000); // 5 second timeout to allow all messages to be sent and received
      
      return;
    }

    // If starting new chat (toUserId but no roomId), send via socket with toUserId
    if (toUserId && !roomId && socket) {
      socket.emit('private-message', {
        toUserId: toUserId,
        content: messageContent,
        attachments: messageAttachments.length > 0 ? messageAttachments : undefined, // Ensure attachments are included
      });
      // Remove optimistic message when real message arrives
      socket.once('new-message', () => {
        setOptimisticMessages((prev) => prev.filter(msg => msg._id !== tempId));
      });
      return;
    }

    // Existing room - determine if group or private
    if (roomId && socket) {
      // Use group-message for group chats, private-message with roomId for private chats
      const eventName = roomType === 'group' ? 'group-message' : 'private-message';
      socket.emit(eventName, {
        roomId: roomId,
        content: messageContent,
        attachments: messageAttachments.length > 0 ? messageAttachments : undefined, // Ensure attachments are included
      });
      // Remove optimistic message when real message arrives
      socket.once('new-message', (data) => {
        if (data.roomId?.toString() === roomId?.toString()) {
          setOptimisticMessages((prev) => prev.filter(msg => msg._id !== tempId));
        }
      });
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newAttachments = [];
    const newPreviews = [];

    for (const file of files) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreviews(prev => [...prev, { file, preview: reader.result }]);
        };
        reader.readAsDataURL(file);
      }

      // Upload file
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosClient.post('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const attachment = {
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: response.data.url,
          filename: file.name,
          size: file.size,
        };
        newAttachments.push(attachment);
      } catch (error) {
        console.error('Failed to upload file:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveFilePreview = (index) => {
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    // Remove corresponding file attachment
    setAttachments(prev => {
      const fileAttachments = prev.filter(a => a.type === 'image' || a.type === 'document' || a.type === 'file');
      const nonFileAttachments = prev.filter(a => a.type !== 'image' && a.type !== 'document' && a.type !== 'file');
      const updatedFileAttachments = fileAttachments.filter((_, i) => i !== index);
      return [...nonFileAttachments, ...updatedFileAttachments];
    });
  };

  const handleRemoveAttachment = (index) => {
    // Remove non-file attachment (friend/location)
    setAttachments(prev => {
      const nonFileAttachments = prev.filter(a => a.type === 'friend' || a.type === 'location');
      const fileAttachments = prev.filter(a => a.type !== 'friend' && a.type !== 'location');
      const updatedNonFileAttachments = nonFileAttachments.filter((_, i) => i !== index);
      return [...fileAttachments, ...updatedNonFileAttachments];
    });
  };

  // Load friends for sharing
  useEffect(() => {
    const loadFriends = async () => {
      if (showFriendSelector) {
        try {
          const data = await userApi.getFriends();
          setAvailableFriends(data.friends || []);
        } catch (error) {
          console.error('Failed to load friends:', error);
        }
      }
    };
    loadFriends();
  }, [showFriendSelector]);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAttachMenu &&
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target) &&
        !event.target.closest('.attach-button')
      ) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachMenu]);

  const handleShareFriend = (friend) => {
    const attachment = {
      type: 'friend',
      friendId: friend._id,
      friendUsername: friend.username,
    };
    setAttachments(prev => [...prev, attachment]);
    setShowFriendSelector(false);
    setShowAttachMenu(false);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get address from coordinates (using a geocoding service)
        let address = `${latitude}, ${longitude}`;
        try {
          // Using OpenStreetMap Nominatim API (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            address = data.display_name;
          }
        } catch (error) {
          console.error('Failed to get address:', error);
        }

        const attachment = {
          type: 'location',
          location: {
            latitude,
            longitude,
            address,
          },
        };
        setAttachments(prev => [...prev, attachment]);
        setShowAttachMenu(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Failed to get your location. Please check your browser permissions.');
      }
    );
  };

  const handleDeleteRoom = async () => {
    if (!roomId) return;
    
    if (!window.confirm(`Are you sure you want to delete this ${roomType === 'group' ? 'group' : 'chat'}? This action cannot be undone.`)) {
      return;
    }

    try {
      await chatApi.deleteRoom(roomId);
      if (onRoomDeleted) {
        onRoomDeleted();
      }
      navigate('/chat');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete chat');
    }
  };

  const handleLeaveGroup = async (deleteForMeOnly = false) => {
    if (!roomId || roomType !== 'group') return;
    
    if (deleteForMeOnly) {
      // For now, "delete for me only" means just leaving the group
      // In the future, this could hide the group from user's view
      try {
        await chatApi.leaveGroup(roomId);
        if (onRoomDeleted) {
          onRoomDeleted();
        }
        navigate('/chat');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to leave group');
      }
    } else {
      // Just leave the group
      try {
        await chatApi.leaveGroup(roomId);
        if (onRoomDeleted) {
          onRoomDeleted();
        }
        navigate('/chat');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to leave group');
      }
    }
  };

  const handleLeaveGroupWithChoice = () => {
    if (!roomId || roomType !== 'group') return;
    
    const choice = window.confirm(
      'Do you want to leave and hide this group from your view?\n\n' +
      'Click OK to leave and hide (group stays active for others)\n' +
      'Click Cancel to just leave the group'
    );
    
    handleLeaveGroup(choice); // choice is true if OK (hide), false if Cancel (just leave)
  };

  const handleSearchMembers = async (e) => {
    e.preventDefault();
    if (!addMemberSearch.trim()) {
      // If search is empty, show all available users
      return;
    }

    setSearchingMembers(true);
    try {
      const data = await userApi.searchUsers(addMemberSearch, 1, 10);
      // Filter out current user and existing members
      const currentRoom = roomDetails || selectedRoom;
      const existingMemberIds = currentRoom?.members?.map(m => {
        const memberId = m._id?.toString() || m.toString();
        return memberId;
      }) || [];
      
      setAddMemberResults(
        data.users.filter(u => {
          const userId = u._id?.toString() || u.toString();
          return userId !== user?.id?.toString() && !existingMemberIds.includes(userId);
        })
      );
    } catch (error) {
      console.error('Failed to search users:', error);
      alert('Failed to search users');
    } finally {
      setSearchingMembers(false);
    }
  };

  const handleAddMember = async (userId) => {
    if (!roomId) return;

    try {
      await chatApi.addMembersToGroup(roomId, [userId]);
      
      // Remove the user from available users list immediately
      setAvailableUsersToAdd(prev => prev.filter(u => {
        const uId = u._id?.toString() || u.toString();
        return uId !== userId?.toString();
      }));
      
      // Remove the user from search results if they're there
      setAddMemberResults(prev => prev.filter(u => {
        const uId = u._id?.toString() || u.toString();
        return uId !== userId?.toString();
      }));
      
      // Clear search input and results after adding
      setAddMemberSearch('');
      setAddMemberResults([]);
      
      // Reload room data by fetching room details again
      if (roomId) {
        try {
          const rooms = await chatApi.getRooms();
          const updatedRoom = rooms.find(r => r._id?.toString() === roomId?.toString() || r._id === roomId);
          if (updatedRoom) {
            setRoomDetails(updatedRoom);
          }
        } catch (error) {
          console.error('Failed to reload room:', error);
        }
      }
      
      // Reload available users list to ensure consistency
      await loadAvailableUsersToAdd();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleSaveGroupName = async () => {
    if (!roomId || !groupNameInput.trim()) return;
    
    try {
      const updatedRoom = await chatApi.updateGroupName(roomId, groupNameInput.trim());
      setRoomDetails(updatedRoom);
      setEditingGroupName(false);
      // Emit socket event to update other clients
      if (socket) {
        socket.emit('room-updated', { roomId, room: updatedRoom });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update group name');
    }
  };

  const handleRemoveMember = async (memberIdToRemove) => {
    if (!roomId) return;

    const currentRoom = roomDetails || selectedRoom;
    const isRemovingSelf = memberIdToRemove?.toString() === user?.id?.toString();
    const memberToRemove = currentRoom?.members?.find(m => {
      const mId = m._id?.toString() || m.toString();
      return mId === memberIdToRemove?.toString();
    });
    const memberName = memberToRemove?.username || 'this member';

    const confirmMessage = isRemovingSelf 
      ? 'Are you sure you want to leave this group?'
      : `Are you sure you want to remove ${memberName} from this group?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await chatApi.removeMemberFromGroup(roomId, memberIdToRemove);
      
      // If user removed themselves, navigate away
      if (isRemovingSelf) {
        if (onRoomDeleted) {
          onRoomDeleted();
        }
        navigate('/chat');
        return;
      }
      
      // Reload room data by fetching room details again
      if (roomId) {
        try {
          const rooms = await chatApi.getRooms();
          const updatedRoom = rooms.find(r => r._id?.toString() === roomId?.toString() || r._id === roomId);
          if (updatedRoom) {
            setRoomDetails(updatedRoom);
          }
        } catch (error) {
          console.error('Failed to reload room:', error);
        }
      }
      
      // Reload available users list to add them back
      await loadAvailableUsersToAdd();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove member');
    }
  };

  if (!roomId && !toUserId && (!toUserIds || toUserIds.length === 0)) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-icon-wrapper">
              <div className="empty-icon">
                <MessageCircle size={60} />
              </div>
            </div>
            <h2 className="empty-title">Start a conversation</h2>
            <p className="empty-description">Select a user from the left to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state for new chat (room will be created on first message)
  if ((toUserId || (toUserIds && toUserIds.length > 0) || (toRoomIds && toRoomIds.length > 0)) && !roomId) {
    return (
      <div className="chat-window">
        {/* Show header for multiple selected users/groups */}
        {((toUserIds && toUserIds.length > 0) || (toRoomIds && toRoomIds.length > 0)) && (
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>Send to {(toUserIds?.length || 0) + (toRoomIds?.length || 0)} item{((toUserIds?.length || 0) + (toRoomIds?.length || 0)) !== 1 ? 's' : ''}</h3>
              <div className="chat-header-members">
                {selectedUsersData.map((userData, index) => {
                  const userId = userData._id?.toString() || userData._id;
                  return (
                    <div key={`user-${userId || index}`} className="chat-header-member">
                      {userData.avatarUrl ? (
                        <img
                          src={userData.avatarUrl}
                          alt={userData.username || 'User'}
                          className="chat-header-member-avatar"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('.chat-header-member-avatar-placeholder');
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="chat-header-member-avatar-placeholder"
                        style={{ display: userData.avatarUrl ? 'none' : 'flex' }}
                      >
                        {userData.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="chat-header-member-name">
                        {userData.username || 'Unknown'}
                      </span>
                      {userData.isOnline && <span className="chat-header-online-badge">●</span>}
                    </div>
                  );
                })}
                {selectedRoomsData.map((roomData, index) => {
                  const roomId = roomData._id?.toString() || roomData._id;
                  return (
                    <div key={`room-${roomId || index}`} className="chat-header-member">
                      <div 
                        className="chat-header-member-avatar-placeholder"
                        style={{ display: 'flex', backgroundColor: '#1976d2' }}
                      >
                        G
                      </div>
                      <span className="chat-header-member-name">
                        {roomData.name || 'Group Chat'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="messages-container">
          <div className="empty-state">
            <div className="empty-state-content">
              <div className="empty-icon-wrapper">
                <div className="empty-icon">
                  <MessageCircle size={60} />
                </div>
              </div>
              <h2 className="empty-title">Start a conversation</h2>
              <p className="empty-description">
                {toUserIds && toUserIds.length > 0 
                  ? `Send message to ${toUserIds.length} user${toUserIds.length !== 1 ? 's' : ''}`
                  : 'Select a user from the left to start messaging'}
              </p>
            </div>
          </div>
        </div>
        {/* Show attachment previews for new chat */}
        {attachmentPreviews.length > 0 && (
          <div className="attachment-previews">
            {attachmentPreviews.map((item, index) => (
              <div key={index} className="attachment-preview">
                {item.file.type.startsWith('image/') ? (
                  <img src={item.preview} alt={item.file.name} />
                ) : (
                  <div className="file-preview">
                    <span>📄</span>
                    <span className="file-name">{item.file.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFilePreview(index)}
                  className="remove-attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {attachments.filter(a => a.type === 'friend' || a.type === 'location').length > 0 && (
          <div className="attachment-previews">
            {attachments
              .filter(a => a.type === 'friend' || a.type === 'location')
              .map((attachment, index) => {
                // Find the correct index in the filtered array
                const allNonFileAttachments = attachments.filter(a => a.type === 'friend' || a.type === 'location');
                const originalIndex = attachments.findIndex(a => a === attachment);
                return (
                  <div key={index} className="attachment-preview">
                    {attachment.type === 'friend' ? (
                      <div className="friend-preview">
                        <span>👤</span>
                        <span className="file-name">{attachment.friendUsername}</span>
                      </div>
                    ) : attachment.type === 'location' ? (
                      <div className="location-preview">
                        <span>📍</span>
                        <span className="file-name">{attachment.location.address}</span>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(originalIndex)}
                      className="remove-attachment"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
          </div>
        )}
        {showFriendSelector && (
          <div className="friend-selector-overlay">
            <div className="friend-selector">
              <div className="friend-selector-header">
                <h3>Select a friend to share</h3>
                <button
                  type="button"
                  onClick={() => setShowFriendSelector(false)}
                  className="close-friend-selector"
                >
                  ×
                </button>
              </div>
              <div className="friend-selector-list">
                {availableFriends.map((friend) => {
                  const friendId = friend._id?.toString() || friend._id;
                  return (
                    <div
                      key={friendId}
                      className="friend-selector-item"
                      onClick={() => {
                        handleShareFriend(friend);
                        setShowFriendSelector(false);
                      }}
                    >
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} alt={friend.username} />
                      ) : (
                        <div className="friend-avatar-placeholder">
                          {friend.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span>{friend.username}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="message-input-form">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div className="message-input-wrapper">
            <div className="attach-button-wrapper" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="attach-button"
                title="Attach or share"
              >
                📎
              </button>
              {showAttachMenu && (
                <div className="attach-menu">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="attach-menu-item"
                  >
                    📄 Files
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFriendSelector(true);
                    }}
                    className="attach-menu-item"
                  >
                    👤 Share Friend
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLocation}
                    className="attach-menu-item"
                  >
                    📍 Share Location
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Type a message to start the conversation..."
              value={messageText}
              onChange={handleInputChange}
              className="message-input"
            />
            <div className="emoji-button-wrapper" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="emoji-button"
                title="Add emoji"
              >
                😊
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-grid">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="emoji-item"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="send-button" disabled={!messageText.trim() && attachments.length === 0}>
            Send
          </button>
        </form>
      </div>
    );
  }

  const isGroupAdmin = selectedRoom?.admin && (selectedRoom.admin._id?.toString() === user?.id?.toString() || selectedRoom.admin.toString() === user?.id?.toString());
  const isManager = selectedRoom?.managers && selectedRoom.managers.some(
    manager => {
      const managerId = manager._id?.toString() || manager.toString();
      return managerId === user?.id?.toString();
    }
  );
  const isAdminOrManager = isGroupAdmin || isManager;

  return (
    <div className="chat-window">
      {/* Show header for multiple selected users (temporary group) */}
      {toUserIds && toUserIds.length > 0 && !roomId && (
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>Send to {toUserIds.length} user{toUserIds.length !== 1 ? 's' : ''}</h3>
            <div className="chat-header-members">
              {selectedUsersData.map((userData, index) => {
                const userId = userData._id?.toString() || userData._id;
                return (
                  <div key={userId || index} className="chat-header-member">
                    {userData.avatarUrl ? (
                      <img
                        src={userData.avatarUrl}
                        alt={userData.username || 'User'}
                        className="chat-header-member-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.chat-header-member-avatar-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="chat-header-member-avatar-placeholder"
                      style={{ display: userData.avatarUrl ? 'none' : 'flex' }}
                    >
                      {userData.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="chat-header-member-name">
                      {userData.username || 'Unknown'}
                    </span>
                    {userData.isOnline && <span className="chat-header-online-badge">●</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {roomId && (
        <div className="chat-header">
          <div className="chat-header-info">
            {roomType === 'group' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingGroupName ? (
                    <>
                      <input
                        type="text"
                        value={groupNameInput}
                        onChange={(e) => setGroupNameInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveGroupName();
                          } else if (e.key === 'Escape') {
                            setEditingGroupName(false);
                            setGroupNameInput((roomDetails || selectedRoom)?.name || 'Group Chat');
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '1.2rem',
                          fontWeight: 600,
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveGroupName}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingGroupName(false);
                          setGroupNameInput((roomDetails || selectedRoom)?.name || 'Group Chat');
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>{(roomDetails || selectedRoom)?.name || 'Group Chat'}</h3>
                      {(() => {
                        const currentRoom = roomDetails || selectedRoom;
                        const isAdmin = currentRoom?.admin?._id?.toString() === user?.id?.toString() || 
                                       currentRoom?.admin?.toString() === user?.id?.toString();
                        return isAdmin ? (
                          <button
                            onClick={() => {
                              setEditingGroupName(true);
                              setGroupNameInput((roomDetails || selectedRoom)?.name || 'Group Chat');
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'transparent',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                            }}
                            title="Edit group name"
                          >
                            ✏️
                          </button>
                        ) : null;
                      })()}
                    </>
                  )}
                </div>
                <div className="chat-header-members">
                  {(() => {
                    const currentRoom = roomDetails || selectedRoom;
                    const members = currentRoom?.members || [];
                    console.log('Room members:', members); // Debug log
                    
                    if (members.length > 0) {
                      return members.map((member) => {
                        // Handle both populated and non-populated member objects
                        const memberData = member._id && typeof member._id === 'object' ? member._id : member;
                        const memberId = memberData._id?.toString() || memberData.toString() || member._id?.toString() || member.toString();
                        const isCurrentUser = memberId === user?.id?.toString();
                        const memberUsername = memberData.username || member.username || 'Unknown';
                        const memberAvatar = memberData.avatarUrl || member.avatarUrl;
                        const isOnline = memberData.isOnline || member.isOnline;
                        
                        // Check if member is admin
                        const currentRoom = roomDetails || selectedRoom;
                        const isMemberAdmin = currentRoom?.admin && (
                          currentRoom.admin._id?.toString() === memberId || 
                          currentRoom.admin.toString() === memberId
                        );
                        
                        // Check if member is a manager
                        const isMemberManager = currentRoom?.managers && currentRoom.managers.some(
                          manager => {
                            const managerId = manager._id?.toString() || manager.toString();
                            return managerId === memberId;
                          }
                        );
                        
                        return (
                          <div key={memberId} className="chat-header-member">
                            {memberAvatar ? (
                              <img
                                src={memberAvatar}
                                alt={memberUsername}
                                className="chat-header-member-avatar"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.parentElement.querySelector('.chat-header-member-avatar-placeholder');
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="chat-header-member-avatar-placeholder"
                              style={{ display: memberAvatar ? 'none' : 'flex' }}
                            >
                              {memberUsername.charAt(0).toUpperCase()}
                            </div>
                            <span className="chat-header-member-name">
                              {memberUsername}
                              {isCurrentUser && ' (You)'}
                              {isMemberAdmin && ' 👑'}
                              {isMemberManager && !isMemberAdmin && ' ⭐'}
                            </span>
                            {isOnline && <span className="chat-header-online-badge">●</span>}
                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              {/* Admin can promote/demote managers */}
                              {isGroupAdmin && !isCurrentUser && !isMemberAdmin && (
                                <>
                                  {!isMemberManager ? (
                                    <button
                                      className="promote-manager-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePromoteToManager(memberId);
                                      }}
                                      title="Make manager"
                                      style={{
                                        padding: '0.2rem 0.4rem',
                                        fontSize: '0.7rem',
                                        background: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      ⭐ Make Manager
                                    </button>
                                  ) : (
                                    <button
                                      className="demote-manager-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDemoteManager(memberId);
                                      }}
                                      title="Remove manager"
                                      style={{
                                        padding: '0.2rem 0.4rem',
                                        fontSize: '0.7rem',
                                        background: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Remove Manager
                                    </button>
                                  )}
                                </>
                              )}
                              {/* Admin/Manager can remove members */}
                              {(isAdminOrManager && !isCurrentUser && !isMemberAdmin) || (isCurrentUser && !isGroupAdmin) ? (
                                <button
                                  className="remove-member-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMember(memberId);
                                  }}
                                  title={isCurrentUser ? "Leave group" : "Remove member"}
                                >
                                  {isCurrentUser ? 'Leave' : '×'}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      });
                    } else {
                      return <span className="chat-header-no-members">No members found</span>;
                    }
                  })()}
                </div>
              </>
            ) : selectedRoom?.type === 'private' ? (() => {
                const otherMember = selectedRoom?.members?.find(m => {
                  const memberId = m._id?.toString() || m.toString();
                  return memberId !== user?.id?.toString();
                });
                return (
                  <>
                    <h3>{otherMember?.username || 'Chat'}</h3>
                    <div className="chat-header-members">
                      <div className="chat-header-member">
                        {otherMember?.avatarUrl ? (
                          <img
                            src={otherMember.avatarUrl}
                            alt={otherMember.username || 'User'}
                            className="chat-header-member-avatar"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('.chat-header-member-avatar-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="chat-header-member-avatar-placeholder"
                          style={{ display: otherMember?.avatarUrl ? 'none' : 'flex' }}
                        >
                          {otherMember?.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="chat-header-member-name">
                          {otherMember?.username || 'Unknown'}
                        </span>
                        {otherMember?.isOnline && <span className="chat-header-online-badge">●</span>}
                      </div>
                    </div>
                  </>
                );
              })()
            : (
              <h3>Chat</h3>
            )}
          </div>
        </div>
      )}
      {showAddMember && (
        <div className="add-member-panel">
          <div className="add-member-header">
            <h4>Add Member to Group</h4>
            <button 
              className="close-add-member"
              onClick={() => {
                setShowAddMember(false);
                setAddMemberSearch('');
                setAddMemberResults([]);
                if (onCloseAddMember) {
                  onCloseAddMember();
                }
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSearchMembers} className="search-member-form">
            <input
              type="text"
              placeholder="Search users to add..."
              value={addMemberSearch}
              onChange={(e) => setAddMemberSearch(e.target.value)}
              className="search-member-input"
            />
            <button type="submit" disabled={searchingMembers}>
              {searchingMembers ? '...' : 'Search'}
            </button>
          </form>
          {loadingUsersToAdd ? (
            <p className="loading-users">Loading users...</p>
          ) : addMemberSearch ? (
            // Show search results when searching
            <>
              {addMemberResults.length > 0 ? (
                <div className="add-member-results">
                  {addMemberResults.map((user) => (
                    <div
                      key={user._id}
                      className="add-member-item"
                      onClick={() => handleAddMember(user._id)}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="member-result-avatar"
                        />
                      ) : (
                        <div className="member-result-avatar-placeholder">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="member-result-info">
                        <div className="member-result-username">{user.username}</div>
                        <div className="member-result-email">{user.email}</div>
                      </div>
                      <button 
                        className="add-member-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMember(user._id);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-member-results">No users found</p>
              )}
            </>
          ) : (
            // Show all available users when not searching
            <>
              {availableUsersToAdd.length > 0 ? (
                <div className="add-member-results">
                  {availableUsersToAdd.map((user) => (
                    <div
                      key={user._id}
                      className="add-member-item"
                      onClick={() => handleAddMember(user._id)}
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="member-result-avatar"
                        />
                      ) : (
                        <div className="member-result-avatar-placeholder">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="member-result-info">
                        <div className="member-result-username">{user.username}</div>
                        <div className="member-result-email">{user.email}</div>
                      </div>
                      <button 
                        className="add-member-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMember(user._id);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-member-results">No users available to add</p>
              )}
            </>
          )}
        </div>
      )}
      <div className="messages-container">
        {allMessages.map((message) => {
          const senderId = message.senderId?._id?.toString() || message.senderId?.toString();
          const currentUserId = user?.id?.toString();
          const isOwnMessage = senderId === currentUserId;
          const avatarUrl = message.senderId?.avatarUrl;
          
          return (
            <div
              key={message._id}
              className={`message ${isOwnMessage ? 'own' : 'other'}`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={message.senderId?.username || 'User'}
                  className="message-avatar"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMGUwZTAiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTk5Ij4KPHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPgo8L3N2Zz4KPC9zdmc+';
                  }}
                />
              ) : (
                <div className="message-avatar-placeholder">
                  {message.senderId?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{message.senderId?.username || 'Unknown'}</span>
                  <span className="message-time">{formatDate(message.createdAt)}</span>
                </div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map((attachment, idx) => (
                      <div key={idx} className="message-attachment">
                        {attachment.type === 'image' ? (
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <img src={attachment.url} alt={attachment.filename || 'Image'} />
                          </a>
                        ) : attachment.type === 'friend' ? (
                          <div className="shared-friend">
                            <span className="friend-icon">👤</span>
                            <div className="friend-info">
                              <div className="friend-name">{attachment.friendUsername || 'Friend'}</div>
                              <button
                                onClick={() => {
                                  const friendId = attachment.friendId?.toString() || attachment.friendId;
                                  window.dispatchEvent(new CustomEvent('startChatWithUser', { detail: { userId: friendId } }));
                                }}
                                className="view-friend-btn"
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        ) : attachment.type === 'location' ? (
                          <div className="shared-location">
                            <span className="location-icon">📍</span>
                            <div className="location-info">
                              <div className="location-address">{attachment.location?.address || 'Location'}</div>
                              {attachment.location?.latitude && attachment.location?.longitude && (
                                <a
                                  href={`https://www.google.com/maps?q=${attachment.location.latitude},${attachment.location.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="view-location-btn"
                                >
                                  Open in Maps
                                </a>
                              )}
                            </div>
                          </div>
                        ) : attachment.url ? (
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="file-attachment">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{attachment.filename || 'File'}</span>
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          );
        })}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map((user, index) => {
              const userId = user.userId?.toString() || user.toString();
              const username = user.username || 'Someone';
              return (
                <span key={userId}>
                  {username} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {attachmentPreviews.length > 0 && (
        <div className="attachment-previews">
          {attachmentPreviews.map((item, index) => (
            <div key={index} className="attachment-preview">
              {item.file.type.startsWith('image/') ? (
                <img src={item.preview} alt={item.file.name} />
              ) : (
                <div className="file-preview">
                  <span>📄</span>
                  <span className="file-name">{item.file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveFilePreview(index)}
                className="remove-attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {attachments.filter(a => a.type === 'friend' || a.type === 'location').length > 0 && (
        <div className="attachment-previews">
          {attachments
            .filter(a => a.type === 'friend' || a.type === 'location')
            .map((attachment, index) => (
              <div key={index} className="attachment-preview">
                {attachment.type === 'friend' ? (
                  <div className="friend-preview">
                    <span>👤</span>
                    <span className="file-name">{attachment.friendUsername}</span>
                  </div>
                ) : attachment.type === 'location' ? (
                  <div className="location-preview">
                    <span>📍</span>
                    <span className="file-name">{attachment.location.address}</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="remove-attachment"
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      )}
      {showFriendSelector && (
        <div className="friend-selector-panel">
          <div className="friend-selector-header">
            <h4>Select Friend to Share</h4>
            <button
              type="button"
              onClick={() => {
                setShowFriendSelector(false);
                setShowAttachMenu(false);
              }}
              className="close-friend-selector"
            >
              ×
            </button>
          </div>
          <div className="friend-selector-list">
            {availableFriends.length > 0 ? (
              availableFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="friend-selector-item"
                  onClick={() => handleShareFriend(friend)}
                >
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} alt={friend.username} className="friend-selector-avatar" />
                  ) : (
                    <div className="friend-selector-avatar-placeholder">
                      {friend.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="friend-selector-info">
                    <div className="friend-selector-username">{friend.username}</div>
                    <div className="friend-selector-email">{friend.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-friends-message">No friends available</p>
            )}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="message-input-wrapper">
          <div className="attach-button-wrapper" ref={attachMenuRef}>
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="attach-button"
              title="Attach or share"
            >
              📎
            </button>
            {showAttachMenu && (
              <div className="attach-menu">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="attach-menu-item"
                >
                  📄 Files
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFriendSelector(true);
                  }}
                  className="attach-menu-item"
                >
                  👤 Share Friend
                </button>
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="attach-menu-item"
                >
                  📍 Share Location
                </button>
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={handleInputChange}
            className="message-input"
          />
          <div className="emoji-button-wrapper" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="emoji-button"
              title="Add emoji"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker">
                <div className="emoji-grid">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="emoji-item"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <button type="submit" className="send-button" disabled={!messageText.trim() && attachments.length === 0}>
          Send
        </button>
      </form>
    </div>
  );
};

