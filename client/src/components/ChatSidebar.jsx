import React, { useState, useEffect, useCallback, useRef } from 'react';
import { chatApi } from '../api/chatApi';
import { userApi } from '../api/userApi';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Star, MoreVertical } from 'lucide-react';
import '../styles/components/ChatSidebar.css';

export const ChatSidebar = ({ onRoomSelect, onUserSelect, selectedRoomId, onRoomDeleted, onOpenAddMember, onFilterChange }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [roomMenus, setRoomMenus] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'prefered', 'groups'
  const prevFilterRef = useRef('all');
  const [preferredRooms, setPreferredRooms] = useState(() => {
    // Load prefered rooms from localStorage
    const saved = localStorage.getItem('preferredRooms');
    return saved ? JSON.parse(saved) : [];
  });
  const [preferredFriends, setPreferredFriends] = useState(() => {
    // Load prefered friends from localStorage
    const saved = localStorage.getItem('preferredFriends');
    return saved ? JSON.parse(saved) : [];
  });
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [selectedUsersForChat, setSelectedUsersForChat] = useState([]);
  const [selectedRoomsForChat, setSelectedRoomsForChat] = useState([]);
  const [userSelectionSearch, setUserSelectionSearch] = useState('');
  const [allUsersFromRooms, setAllUsersFromRooms] = useState([]);
  const menuRefs = useRef({});
  const userSelectionRef = useRef(null);

  const loadFriends = useCallback(async () => {
    try {
      const data = await userApi.getFriends();
      setFriends(data.friends || []);
    } catch (error) {
      // Only log non-network errors (network errors usually mean backend is down)
      if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
        console.error('Failed to load friends:', error);
      }
      setFriends([]);
    }
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatApi.getRooms();
      console.log('Loaded rooms:', data); // Debug log
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRooms(data);
      } else if (data && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      } else {
        console.warn('Unexpected data format:', data);
        setRooms([]);
      }
    } catch (error) {
      // Only log non-network errors (network errors usually mean backend is down)
      if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
        console.error('Failed to load rooms:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        // Only show alert for non-401 errors (401 means auth issue, will redirect)
        if (error.response?.status !== 401) {
          console.error('Failed to load chat rooms. Check console for details.');
        }
      }
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract users from private rooms
  useEffect(() => {
    if (rooms && rooms.length > 0 && user) {
      const usersFromRooms = new Map();
      const currentUserId = user.id?.toString();
      
      rooms.forEach(room => {
        if (room.type === 'private' && room.members) {
          room.members.forEach(member => {
            const memberData = member._id && typeof member._id === 'object' ? member._id : member;
            const memberId = memberData._id?.toString() || memberData.toString() || member._id?.toString() || member.toString();
            
            // Skip current user
            if (memberId === currentUserId) return;
            
            // Add user if not already in map
            if (!usersFromRooms.has(memberId)) {
              usersFromRooms.set(memberId, {
                _id: memberId,
                username: memberData.username || member.username || 'Unknown',
                email: memberData.email || member.email || '',
                avatarUrl: memberData.avatarUrl || member.avatarUrl,
                isOnline: memberData.isOnline || member.isOnline,
              });
            }
          });
        }
      });
      
      setAllUsersFromRooms(Array.from(usersFromRooms.values()));
    } else {
      setAllUsersFromRooms([]);
    }
  }, [rooms, user]);

  useEffect(() => {
    if (user) {
      loadRooms();
      loadFriends();
    }
  }, [user, loadRooms, loadFriends]);

  // Listen for user selection mode trigger
  useEffect(() => {
    const handleShowUserSelection = () => {
      setShowUserSelection(true);
      setSelectedUsersForChat([]);
      setSelectedRoomsForChat([]);
      setUserSelectionSearch('');
    };

    const handleCloseUserSelection = () => {
      console.log('Closing user selection, clearing selections');
      setShowUserSelection(false);
      setSelectedUsersForChat([]);
      setSelectedRoomsForChat([]);
      setUserSelectionSearch('');
    };

    window.addEventListener('showUserSelection', handleShowUserSelection);
    window.addEventListener('closeUserSelection', handleCloseUserSelection);
    return () => {
      window.removeEventListener('showUserSelection', handleShowUserSelection);
      window.removeEventListener('closeUserSelection', handleCloseUserSelection);
    };
  }, []);

  // Close user selection panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUserSelection &&
        userSelectionRef.current &&
        !userSelectionRef.current.contains(event.target)
      ) {
        setShowUserSelection(false);
        setSelectedUsersForChat([]);
        setSelectedRoomsForChat([]);
        setUserSelectionSearch('');
      }
    };

    if (showUserSelection) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserSelection]);

  // Listen for new messages and room updates to refresh room list
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      // Refresh rooms when a new message is received (might be a new room)
      loadRooms();
    };

    const handleRoomUpdate = () => {
      // Refresh rooms when room is updated (member added/removed, etc.)
      loadRooms();
    };

    const handleAddedToGroup = (data) => {
      // User was added to a group - refresh rooms to show it
      console.log('=== ADDED TO GROUP EVENT RECEIVED ===', data);
      loadRooms();
      // Show a notification
      if (data && data.room) {
        const roomName = data.room.name || 'Group Chat';
        alert(`You've been added to the group "${roomName}"`);
      } else {
        console.warn('Added to group event received but no room data:', data);
      }
    };

    const handlePresence = (data) => {
      // Update online status when presence events are received
      // Refresh rooms and friends to update online status
      loadRooms();
      loadFriends();
    };

    socket.on('new-message', handleNewMessage);
    socket.on('room-updated', handleRoomUpdate);
    socket.on('room-created', handleRoomUpdate);
    socket.on('added-to-group', handleAddedToGroup);
    socket.on('presence', handlePresence);
    socket.on('messages-read', () => {
      // Refresh rooms when messages are marked as read to update unread counts
      loadRooms();
    });

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('room-updated', handleRoomUpdate);
      socket.off('room-created', handleRoomUpdate);
      socket.off('added-to-group', handleAddedToGroup);
      socket.off('presence', handlePresence);
    };
  }, [socket, loadRooms, loadFriends]);

  // Load available users when group chat panel is shown (only friends)
  useEffect(() => {
    if (showGroupChat) {
      // Only show friends for group chat
      setAvailableUsers(friends);
    }
  }, [showGroupChat, friends]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(roomMenus).forEach(roomId => {
        if (roomMenus[roomId]) {
          const menuElement = menuRefs.current[roomId];
          const buttonElement = event.target.closest(`[data-room-id="${roomId}"]`);
          if (menuElement && !menuElement.contains(event.target) && !buttonElement) {
            setRoomMenus(prev => ({ ...prev, [roomId]: false }));
          }
        }
      });
    };

    if (Object.values(roomMenus).some(open => open)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [roomMenus]);

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const data = await userApi.searchUsers(searchQuery, 1, 10);
      // Filter out current user and users already in chat rooms
      const existingRoomUserIds = rooms
        .filter(r => r.type === 'private')
        .flatMap(r => r.members.map(m => m._id?.toString() || m.toString()));
      
      setSearchResults(
        data.users.filter(u => {
          const userId = u._id?.toString() || u.toString();
          return userId !== user?.id?.toString() && !existingRoomUserIds.includes(userId);
        })
      );
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (targetUserId) => {
    // Find if room already exists
    const existingRoom = rooms.find(room => {
      if (room.type !== 'private') return false;
      return room.members.some(m => {
        const memberId = m._id?.toString() || m.toString();
        return memberId === targetUserId;
      });
    });

    if (existingRoom) {
      onRoomSelect(existingRoom);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    // Start new chat with this user (room will be created when first message is sent)
    if (onUserSelect) {
      onUserSelect(targetUserId);
    }
    setShowNewChat(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="chat-sidebar">
        <div className="loading-message">
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  const getOtherMember = (room) => {
    if (room.type !== 'private' || !user) return null;
    return room.members.find((m) => {
      const memberId = m._id?.toString() || m.toString();
      const userId = user?.id?.toString();
      return memberId !== userId;
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 1) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    try {
      const room = await chatApi.createGroup(groupName, selectedMembers);
      setShowGroupChat(false);
      setGroupName('');
      setSelectedMembers([]);
      loadRooms();
      onRoomSelect(room);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create group');
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => {
      const userIdStr = userId?.toString() || userId;
      const isSelected = prev.some(id => {
        const idStr = id?.toString() || id;
        return idStr === userIdStr;
      });
      
      if (isSelected) {
        return prev.filter(id => {
          const idStr = id?.toString() || id;
          return idStr !== userIdStr;
        });
      } else {
        return [...prev, userId];
      }
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="header-top">
          <h2 className="sidebar-title">Chats</h2>
          <div className="header-actions">
            <button 
              className="action-btn add"
              onClick={() => {
                setShowNewChat(!showNewChat);
                setShowGroupChat(false);
              }}
              title="Search users"
            >
              <Plus size={18} />
            </button>
            <button 
              className="action-btn search"
              onClick={() => {
                setShowGroupChat(!showGroupChat);
                setShowNewChat(false);
              }}
              title="Create group chat"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
        <div className="tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => {
              const prevFilter = prevFilterRef.current;
              setFilter('all');
              prevFilterRef.current = 'all';
              if (prevFilter === 'unread' && onFilterChange) {
                onFilterChange('all', prevFilter);
              }
            }}
          >
            All
          </button>
          <button
            className={`tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => {
              const prevFilter = prevFilterRef.current;
              setFilter('unread');
              prevFilterRef.current = 'unread';
              if (onFilterChange) {
                onFilterChange('unread', prevFilter);
              }
            }}
          >
            Unread
          </button>
          <button
            className={`tab ${filter === 'preferred' ? 'active' : ''}`}
            onClick={() => {
              const prevFilter = prevFilterRef.current;
              setFilter('preferred');
              prevFilterRef.current = 'preferred';
              if (onFilterChange) {
                onFilterChange('preferred', prevFilter);
              }
            }}
          >
            <Star size={14} />
            Starred
          </button>
          <button
            className={`tab ${filter === 'groups' ? 'active' : ''}`}
            onClick={() => {
              const prevFilter = prevFilterRef.current;
              setFilter('groups');
              prevFilterRef.current = 'groups';
              if (onFilterChange) {
                onFilterChange('groups', prevFilter);
              }
            }}
          >
            Groups
          </button>
        </div>
      </div>

      {showNewChat && (
        <div className="new-chat-panel-wrapper">
          <form onSubmit={handleSearchUsers} className="search-chat-form">
            <input
              type="text"
              placeholder="Search users to chat with..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-chat-input"
            />
            <button type="submit" disabled={searching} className="search-chat-btn">
              {searching ? '...' : 'Search'}
            </button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="search-results-list">
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  className="search-result-item"
                  onClick={() => handleStartChat(searchUser._id)}
                >
                  {searchUser.avatarUrl ? (
                    <img
                      src={searchUser.avatarUrl}
                      alt={searchUser.username}
                      className="result-avatar"
                    />
                  ) : (
                    <div className="result-avatar-placeholder">
                      {searchUser.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="result-info">
                    <div className="result-username">{searchUser.username}</div>
                    <div className="result-email">{searchUser.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <p className="no-results">No users found</p>
          )}
        </div>
      )}

      {showGroupChat && (
        <div className="group-chat-panel">
          <h3>Create Group Chat</h3>
          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-name-input"
          />
          <div className="members-selection">
            <h4>Select Members ({selectedMembers.length})</h4>
            <div className="available-users-list">
              {availableUsers.map((availableUser) => {
                const userId = availableUser._id?.toString() || availableUser._id;
                const isSelected = selectedMembers.some(id => (id?.toString() || id) === userId);
                return (
                  <div
                    key={availableUser._id}
                    className={`member-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      const userId = availableUser._id?.toString() || availableUser._id;
                      toggleMemberSelection(userId);
                    }}
                  >
                    {availableUser.avatarUrl ? (
                      <img
                        src={availableUser.avatarUrl}
                        alt={availableUser.username}
                        className="member-avatar"
                      />
                    ) : (
                      <div className="member-avatar-placeholder">
                        {availableUser.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="member-info">
                      <div className="member-username">{availableUser.username}</div>
                      <div className="member-email" style={{ fontSize: '0.8rem', color: '#666' }}>{availableUser.email}</div>
                    </div>
                    {isSelected && <span className="checkmark">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="group-actions">
            <button 
              onClick={handleCreateGroup} 
              className="create-group-btn" 
              disabled={!groupName.trim() || selectedMembers.length < 1}
            >
              Create Group
            </button>
            <button onClick={() => {
              setShowGroupChat(false);
              setGroupName('');
              setSelectedMembers([]);
            }} className="cancel-group-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="chat-list">
        {showUserSelection ? (
          <div className="user-selection-mode" ref={userSelectionRef}>
            <div className="user-selection-header">
              <h3>Select Users for Chats</h3>
              <button
                className="close-selection-btn"
                onClick={() => {
                  setShowUserSelection(false);
                  setSelectedUsersForChat([]);
                  setUserSelectionSearch('');
                }}
              >
                ×
              </button>
            </div>
            <div className="user-selection-search">
              <input
                type="text"
                placeholder="Search friends and groups..."
                value={userSelectionSearch}
                onChange={(e) => setUserSelectionSearch(e.target.value)}
              />
            </div>
            <div className="user-selection-list">
              {/* Combine friends and users from rooms, removing duplicates */}
              {(() => {
                const allUsersMap = new Map();
                const currentUserId = user?.id?.toString();
                
                // Add friends first
                friends.forEach(friend => {
                  const friendId = friend._id?.toString() || friend._id;
                  if (friendId !== currentUserId) {
                    allUsersMap.set(friendId, friend);
                  }
                });
                
                // Add users from rooms (will override if duplicate, keeping room data)
                allUsersFromRooms.forEach(userFromRoom => {
                  const userId = userFromRoom._id?.toString() || userFromRoom._id;
                  if (userId !== currentUserId) {
                    allUsersMap.set(userId, userFromRoom);
                  }
                });
                
                const allUsers = Array.from(allUsersMap.values());
                
                return allUsers.filter(userItem => {
                  const userId = userItem._id?.toString() || userItem._id;
                  if (userId === currentUserId) return false;
                  
                  if (!userSelectionSearch.trim()) return true;
                  const query = userSelectionSearch.toLowerCase();
                  return (
                    userItem.username?.toLowerCase().includes(query) ||
                    userItem.email?.toLowerCase().includes(query)
                  );
                }).map((userItem) => {
                  const userId = userItem._id?.toString() || userItem._id;
                  const isSelected = selectedUsersForChat.includes(userId);
                  return (
                    <div
                      key={`user-${userId}`}
                      className={`user-selection-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedUsersForChat(prev => {
                          if (prev.includes(userId)) {
                            return prev.filter(id => id !== userId);
                          } else {
                            return [...prev, userId];
                          }
                        });
                      }}
                    >
                      <div className="user-selection-avatar">
                        {userItem.avatarUrl ? (
                          <img src={userItem.avatarUrl} alt={userItem.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {userItem.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="user-selection-info">
                        <div className="user-selection-name">{userItem.username || 'Unknown'}</div>
                        <div className="user-selection-email">{userItem.email || ''}</div>
                      </div>
                      {isSelected && <span className="checkmark">✓</span>}
                    </div>
                  );
                });
              })()}
              
              {/* Groups */}
              {rooms.filter(room => {
                if (room.type !== 'group') return false;
                
                if (!userSelectionSearch.trim()) return true;
                const query = userSelectionSearch.toLowerCase();
                return room.name?.toLowerCase().includes(query);
              }).map((room) => {
                const roomId = room._id?.toString() || room._id;
                const isSelected = selectedRoomsForChat.includes(roomId);
                return (
                  <div
                    key={`room-${roomId}`}
                    className={`user-selection-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRoomsForChat(prev => {
                        if (prev.includes(roomId)) {
                          return prev.filter(id => id !== roomId);
                        } else {
                          return [...prev, roomId];
                        }
                      });
                    }}
                  >
                    <div className="user-selection-avatar">
                      <div className="avatar-placeholder" style={{ backgroundColor: '#1976d2' }}>
                        G
                      </div>
                    </div>
                    <div className="user-selection-info">
                      <div className="user-selection-name">{room.name || 'Group Chat'}</div>
                      <div className="user-selection-email">Group • {room.members?.length || 0} members</div>
                    </div>
                    {isSelected && <span className="checkmark">✓</span>}
                  </div>
                );
              })}
            </div>
            <div className="user-selection-footer">
              <div className="selected-count">
                {selectedUsersForChat.length + selectedRoomsForChat.length} item{selectedUsersForChat.length + selectedRoomsForChat.length !== 1 ? 's' : ''} selected
              </div>
              <div className="user-selection-actions">
                <button
                  className="cancel-selection-btn"
                  onClick={() => {
                    setShowUserSelection(false);
                    setSelectedUsersForChat([]);
                    setSelectedRoomsForChat([]);
                    setUserSelectionSearch('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="start-chats-btn"
                  onClick={() => {
                    if (selectedUsersForChat.length === 0 && selectedRoomsForChat.length === 0) {
                      alert('Please select at least one user or group');
                      return;
                    }
                    // Dispatch event to start chats with both users and groups
                    console.log('=== DISPATCHING START CHATS EVENT ===');
                    console.log('selectedUsersForChat:', selectedUsersForChat, 'Type:', typeof selectedUsersForChat, 'IsArray:', Array.isArray(selectedUsersForChat));
                    console.log('selectedRoomsForChat:', selectedRoomsForChat, 'Type:', typeof selectedRoomsForChat, 'IsArray:', Array.isArray(selectedRoomsForChat));
                    console.log('User IDs count:', selectedUsersForChat.length);
                    console.log('Room IDs count:', selectedRoomsForChat.length);
                    
                    window.dispatchEvent(new CustomEvent('startChatsWithUsers', {
                      detail: { 
                        userIds: [...selectedUsersForChat], // Ensure it's a new array
                        roomIds: [...selectedRoomsForChat]  // Ensure it's a new array
                      }
                    }));
                    console.log('Event dispatched with:', { 
                      userIds: [...selectedUsersForChat], 
                      roomIds: [...selectedRoomsForChat] 
                    });
                    setShowUserSelection(false);
                    setSelectedUsersForChat([]);
                    setSelectedRoomsForChat([]);
                    setUserSelectionSearch('');
                  }}
                  disabled={selectedUsersForChat.length === 0 && selectedRoomsForChat.length === 0}
                >
                  Start Chats
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <p className="loading-message">Loading chats...</p>
        ) : (() => {
          // Filter rooms based on selected filter
          let filteredRooms = rooms;
          if (filter === 'groups') {
            filteredRooms = rooms.filter(room => room.type === 'group');
          } else if (filter === 'unread') {
            // Filter rooms with unread messages
            filteredRooms = rooms.filter(room => {
              // Check if room has unread messages (unreadCount > 0)
              return room.unreadCount && room.unreadCount > 0;
            });
          } else if (filter === 'preferred') {
            // Filter preferred/starred rooms
            filteredRooms = rooms.filter(room => {
              const roomId = room._id?.toString() || room._id;
              return preferredRooms.includes(roomId);
            });
          }
          // 'all' filter shows all rooms
          
          // Combine friends and rooms, sorted by last message time
          const allItems = [];
          
          // Add filtered rooms with their lastMessageAt
          filteredRooms.forEach(room => {
            allItems.push({
              type: 'room',
              data: room,
              sortTime: room.lastMessageAt ? new Date(room.lastMessageAt) : new Date(0),
            });
          });
          
          // Add friends without rooms based on filter
          if (filter === 'all') {
            friends.forEach(friend => {
              const existingRoom = rooms.find(room => {
                if (room.type !== 'private') return false;
                return room.members.some(m => {
                  const memberId = m._id?.toString() || m.toString();
                  return memberId === friend._id?.toString();
                });
              });
              
              // Only add friends that don't have a room yet
              if (!existingRoom) {
                allItems.push({
                  type: 'friend',
                  data: friend,
                  sortTime: new Date(0), // Friends without chats go to the bottom
                });
              }
            });
          } else if (filter === 'preferred') {
            // Add preferred friends - show them even if they have rooms (as long as they're marked as preferred)
            friends.forEach(friend => {
              const friendId = friend._id?.toString() || friend._id;
              if (preferredFriends.includes(friendId)) {
                const existingRoom = rooms.find(room => {
                  if (room.type !== 'private') return false;
                  return room.members.some(m => {
                    const memberId = m._id?.toString() || m.toString();
                    return memberId === friendId;
                  });
                });
                
                // Only add friend if they don't have a room, or if they have a room but it's not preferred
                // (if the room is preferred, it will already be in filteredRooms)
                if (!existingRoom) {
                  allItems.push({
                    type: 'friend',
                    data: friend,
                    sortTime: new Date(0),
                  });
                } else {
                  // Friend has a room - check if the room is also preferred
                  const roomId = existingRoom._id?.toString() || existingRoom._id;
                  if (!preferredRooms.includes(roomId)) {
                    // Room is not preferred, so show the friend
                    allItems.push({
                      type: 'friend',
                      data: friend,
                      sortTime: new Date(0),
                    });
                  }
                  // If room is preferred, it's already in filteredRooms, so don't add friend separately
                }
              }
            });
          }
          
          // Sort by lastMessageAt (most recent first), then friends without chats
          allItems.sort((a, b) => {
            if (a.sortTime.getTime() === b.sortTime.getTime()) {
              // If same time, rooms come before friends
              return a.type === 'room' ? -1 : 1;
            }
            return b.sortTime.getTime() - a.sortTime.getTime();
          });
          
          if (allItems.length === 0) {
            return (
              <div className="no-chats">
                <p>No chats yet.</p>
                <p className="hint">Click the + button to start a new chat!</p>
              </div>
            );
          }
          
          return allItems.map((item) => {
            if (item.type === 'room') {
              const room = item.data;
              const otherMember = getOtherMember(room);
              const showRoomMenu = roomMenus[room._id] || false;
              return (
                <div
                  key={room._id}
                  className={`chat-item ${(selectedRoomId?.toString() === room._id?.toString() || selectedRoomId === room._id) ? 'active' : ''}`}
                  onClick={(e) => {
                    // Don't trigger room selection if clicking on menu button
                    if (e.target.closest('.room-menu-btn') || e.target.closest('.room-menu')) {
                      return;
                    }
                    onRoomSelect(room);
                  }}
                >
                  <div className="avatar">
                    {room.type === 'private' ? (
                      otherMember?.username?.charAt(0)?.toUpperCase() || '?'
                    ) : (
                      room.name?.charAt(0)?.toUpperCase() || 'G'
                    )}
                  </div>
                  <div className="chat-info">
                    <div className="chat-top">
                      <span className="chat-name">
                        {room.type === 'private'
                          ? otherMember?.username || 'Unknown'
                          : room.name || 'Group Chat'}
                      </span>
                      {room.unreadCount && room.unreadCount > 0 && (
                        <span className="unread-badge">{room.unreadCount > 99 ? '99+' : room.unreadCount}</span>
                      )}
                    </div>
                    <p className="last-message">
                      {room.lastMessage?.text || 'No messages yet'}
                    </p>
                    <p className="timestamp">{formatDate(room.lastMessageAt)}</p>
                  </div>
                  <div className="chat-actions">
                    {preferredRooms.includes(room._id?.toString() || room._id) && (
                      <Star 
                        size={16} 
                        className="star-icon" 
                        style={{ fill: 'currentColor' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const roomId = room._id?.toString() || room._id;
                          const updatedPreferred = preferredRooms.filter(id => id !== roomId);
                          setPreferredRooms(updatedPreferred);
                          localStorage.setItem('preferredRooms', JSON.stringify(updatedPreferred));
                        }}
                      />
                    )}
                    <MoreVertical 
                      size={16} 
                      className="more-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomMenus(prev => ({
                          ...prev,
                          [room._id]: !prev[room._id]
                        }));
                      }}
                    />
                    {showRoomMenu && (
                      <div 
                        className="room-menu"
                        ref={(el) => {
                          if (el) menuRefs.current[room._id] = el;
                        }}
                      >
                        {room.type === 'group' ? (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoomMenus(prev => ({ ...prev, [room._id]: false }));
                                // Select the room first, then open add member panel
                                onRoomSelect(room);
                                if (onOpenAddMember) {
                                  // Small delay to ensure room is selected first
                                  setTimeout(() => {
                                    onOpenAddMember();
                                  }, 100);
                                }
                              }}
                              className="add-member-btn"
                            >
                              Add Member
                            </button>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                setRoomMenus(prev => ({ ...prev, [room._id]: false }));
                                
                                const choice = window.confirm(
                                  'Do you want to leave and hide this group from your view?\n\n' +
                                  'Click OK to leave and hide (group stays active for others)\n' +
                                  'Click Cancel to just leave the group'
                                );
                                
                                try {
                                  await chatApi.leaveGroup(room._id);
                                  // Reload rooms to update the list
                                  loadRooms();
                                  // If this was the selected room, clear selection
                                  if (selectedRoomId === room._id && onRoomDeleted) {
                                    onRoomDeleted();
                                  }
                                } catch (error) {
                                  alert(error.response?.data?.error || 'Failed to leave group');
                                }
                              }}
                              className="leave-btn"
                            >
                              Leave Group
                            </button>
                            {room.admin && (room.admin._id?.toString() === user?.id?.toString() || room.admin.toString() === user?.id?.toString()) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoomMenus(prev => ({ ...prev, [room._id]: false }));
                                  // Select the room to show members in header
                                  onRoomSelect(room);
                                }}
                                className="remove-member-menu-btn"
                              >
                                Remove Member
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                setRoomMenus(prev => ({ ...prev, [room._id]: false }));
                                
                                if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                                  return;
                                }
                                
                                try {
                                  await chatApi.deleteRoom(room._id);
                                  loadRooms();
                                  if (selectedRoomId === room._id && onRoomDeleted) {
                                    onRoomDeleted();
                                  }
                                } catch (error) {
                                  alert(error.response?.data?.error || 'Failed to delete chat');
                                }
                              }}
                              className="delete-btn"
                            >
                              Delete Chat
                            </button>
                          </>
                        )}
                        {room.type === 'group' && (
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              setRoomMenus(prev => ({ ...prev, [room._id]: false }));
                              
                              if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                                return;
                              }
                              
                              try {
                                await chatApi.deleteRoom(room._id);
                                loadRooms();
                                if (selectedRoomId === room._id && onRoomDeleted) {
                                  onRoomDeleted();
                                }
                              } catch (error) {
                                alert(error.response?.data?.error || 'Failed to delete group');
                              }
                            }}
                            className="delete-btn"
                          >
                            Delete Group
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              const friend = item.data;
              return (
                <div
                  key={friend._id}
                  className={`room-item friend-item ${selectedRoomId === friend._id ? 'selected' : ''}`}
                  onClick={(e) => {
                    if (e.target.closest('.preferred-btn')) {
                      return;
                    }
                    onUserSelect(friend._id);
                  }}
                >
                  <div className="room-avatars">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.username || 'Avatar'}
                        className="room-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.room-avatar-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="room-avatar-placeholder"
                      style={{ display: friend.avatarUrl ? 'none' : 'flex', fontSize: '0.7rem', padding: '0 0.25rem' }}
                    >
                      {friend.username || '?'}
                    </div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-top">
                      <span className="chat-name">
                        {friend.username || 'Unknown'}
                        {friend.isOnline && <span className="online-badge">●</span>}
                      </span>
                    </div>
                    <p className="last-message">Click to start chatting</p>
                    <p className="timestamp"></p>
                  </div>
                  <div className="chat-actions">
                    {preferredFriends.includes(friend._id?.toString() || friend._id) && (
                      <Star 
                        size={16} 
                        className="star-icon" 
                        style={{ fill: 'currentColor' }}
                      />
                    )}
                    <MoreVertical size={16} className="more-icon" />
                  </div>
                </div>
              );
            }
          });
        })()}
      </div>
    </div>
  );
};

