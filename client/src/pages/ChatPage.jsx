import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { TopNavbar } from '../components/TopNavbar';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/ChatPage.css';

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); // For new chats
  const [selectedUserIds, setSelectedUserIds] = useState([]); // For multiple users (temporary group)
  const [selectedRoomIds, setSelectedRoomIds] = useState([]); // For multiple groups (temporary group)
  const [error, setError] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('ChatPage mounted', { user: user?.username, connected });
  }, [user, connected]);

  // Ensure no room is auto-selected when component mounts or when navigating to Chats tab
  useEffect(() => {
    // Explicitly clear any room selection on mount to prevent auto-selection
    setSelectedRoom(null);
    setSelectedUserId(null);
    setSelectedUserIds([]);
    setSelectedRoomIds([]);
  }, []); // Only run on mount

  const handleRoomSelect = (room) => {
    // If clicking on the same room that's already selected, deselect it
    if (selectedRoom && (selectedRoom._id?.toString() === room._id?.toString() || selectedRoom._id === room._id)) {
      setSelectedRoom(null);
      setSelectedUserId(null);
      setSelectedUserIds([]);
      setSelectedRoomIds([]);
    } else {
      setSelectedRoom(room);
      setSelectedUserId(null); // Clear user selection when selecting existing room
      setSelectedUserIds([]); // Clear multiple users selection
      setSelectedRoomIds([]); // Clear multiple rooms selection
    }
  };

  useEffect(() => {
    const handleStartChat = async (event) => {
      if (event.detail?.userId) {
        const userId = event.detail.userId;
        
        // Try to find existing room with this user first
        try {
          const rooms = await chatApi.getRooms();
          const existingRoom = rooms.find(room => {
            if (room.type !== 'private') return false;
            return room.members.some(m => {
              const memberId = m._id?.toString() || m.toString();
              return memberId === userId?.toString();
            });
          });
          
          if (existingRoom) {
            // Room exists - select it
            setSelectedRoom(existingRoom);
            setSelectedUserId(null);
            // Call handleRoomSelect to ensure sidebar updates
            handleRoomSelect(existingRoom);
          } else {
            // No room exists - set user ID to start new chat
            setSelectedUserId(userId);
            setSelectedRoom(null);
          }
        } catch (error) {
          console.error('Failed to load rooms:', error);
          // Fallback: set user ID to start new chat
          setSelectedUserId(userId);
          setSelectedRoom(null);
        }
      }
    };

    const handleStartChatsWithUsers = async (event) => {
      if ((event.detail?.userIds && event.detail.userIds.length > 0) || 
          (event.detail?.roomIds && event.detail.roomIds.length > 0)) {
        try {
          // Ensure arrays are actually arrays
          const userIds = Array.isArray(event.detail.userIds) ? event.detail.userIds : (event.detail.userIds ? [event.detail.userIds] : []);
          const roomIds = Array.isArray(event.detail.roomIds) ? event.detail.roomIds : (event.detail.roomIds ? [event.detail.roomIds] : []);
          
          console.log('Starting chats with:', { userIds, roomIds, userIdsLength: userIds.length, roomIdsLength: roomIds.length });
          
          // Store selected users and groups temporarily for grouped sending
          // Don't select a room or single user - keep all selected items
          setSelectedUserIds([...userIds]); // Create new array to ensure it's not a reference
          setSelectedRoomIds([...roomIds]); // Create new array to ensure it's not a reference
          setSelectedRoom(null);
          setSelectedUserId(null);
        } catch (error) {
          console.error('Failed to start chats:', error);
          alert(error.response?.data?.error || 'Failed to start chats');
        }
      }
    };

    window.addEventListener('startChatWithUser', handleStartChat);
    window.addEventListener('startChatsWithUsers', handleStartChatsWithUsers);
    return () => {
      window.removeEventListener('startChatWithUser', handleStartChat);
      window.removeEventListener('startChatsWithUsers', handleStartChatsWithUsers);
    };
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setSelectedRoom(null); // Clear room selection when starting new chat
    setSelectedUserIds([]); // Clear multiple users selection
    setSelectedRoomIds([]); // Clear multiple rooms selection
  };

  const handleRoomDeleted = () => {
    setSelectedRoom(null);
    setSelectedUserId(null);
    setSelectedUserIds([]);
    setSelectedRoomIds([]);
  };

  const handleOpenAddMember = () => {
    setShowAddMember(true);
  };

  const handleFilterChange = (newFilter, prevFilter) => {
    // Clear chat selection when switching between filters
    // Only clear if filter actually changed and we're switching from a filtered view
    if (prevFilter !== newFilter && prevFilter !== 'all') {
      setSelectedRoom(null);
      setSelectedUserId(null);
      setSelectedUserIds([]);
      setSelectedRoomIds([]);
    }
  };

  // When a new message creates a room, switch to room view
  useEffect(() => {
    if (!socket || !selectedUserId) return;

    const handleNewMessage = async (data) => {
      // If we're in a new chat state and a message was sent, load rooms to find the new room
      if (selectedUserId && !selectedRoom) {
        try {
          const rooms = await chatApi.getRooms();
          // Find the room with the selected user
          const newRoom = rooms.find(room => {
            if (room.type !== 'private') return false;
            return room.members.some(m => {
              const memberId = m._id?.toString() || m.toString();
              return memberId === selectedUserId;
            });
          });
          
          if (newRoom) {
            setSelectedRoom(newRoom);
            setSelectedUserId(null);
          }
        } catch (error) {
          console.error('Failed to load rooms after new message:', error);
        }
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, selectedUserId, selectedRoom]);

  if (error) {
    return (
      <div className="chat-page">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Error loading chat</h2>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Try Again</button>
        </div>
      </div>
    );
  }

  // Deselect room when clicking outside sidebar and chat window
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both sidebar and chat window
      const sidebar = event.target.closest('.chat-sidebar');
      const chatWindow = event.target.closest('.chat-window');
      const roomItem = event.target.closest('.room-item');
      
      // If clicking outside sidebar and chat window, and not on a room-item, deselect room
      if (!sidebar && !chatWindow && !roomItem && selectedRoom) {
        setSelectedRoom(null);
        setSelectedUserId(null);
        setSelectedUserIds([]);
        setSelectedRoomIds([]);
      }
    };

    // Add click listener to document
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedRoom]);

  return (
    <div className="chat-page">
      {!connected && (
        <div style={{ 
          padding: '0.5rem', 
          background: '#ffebee', 
          color: '#c62828',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          ⚠️ Not connected to server. Please check your connection.
        </div>
      )}
      <div className="app-container">
        <ChatSidebar
          onRoomSelect={handleRoomSelect}
          onUserSelect={handleUserSelect}
          selectedRoomId={selectedRoom?._id}
          onRoomDeleted={handleRoomDeleted}
          onOpenAddMember={handleOpenAddMember}
          onFilterChange={handleFilterChange}
        />
        <div className="main-content">
          <TopNavbar />
          <ChatWindow 
            roomId={selectedRoom?._id} 
            toUserId={selectedUserId}
            toUserIds={selectedUserIds}
            toRoomIds={selectedRoomIds}
            roomType={selectedRoom?.type}
            selectedRoom={selectedRoom}
            onRoomDeleted={handleRoomDeleted}
            onOpenAddMember={handleOpenAddMember}
            showAddMember={showAddMember}
            onCloseAddMember={() => setShowAddMember(false)}
            onMessageSent={() => {
              // Clear selected users and rooms after message is sent
              // Also dispatch event to close user selection panel immediately
              console.log('Clearing selections and closing user selection panel:', { 
                selectedUserIds, 
                selectedRoomIds,
                userIdsLength: selectedUserIds.length,
                roomIdsLength: selectedRoomIds.length
              });
              setSelectedUserIds([]);
              setSelectedRoomIds([]);
              // Dispatch event to close user selection panel immediately
              window.dispatchEvent(new CustomEvent('closeUserSelection'));
            }}
          />
        </div>
      </div>
    </div>
  );
};

