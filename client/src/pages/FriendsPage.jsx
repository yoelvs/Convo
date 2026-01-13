import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendRequestList } from '../components/FriendRequestList';
import { TopNavbar } from '../components/TopNavbar';
import { userApi } from '../api/userApi';
import { friendApi } from '../api/friendApi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import '../styles/pages/FriendsPage.css';

export const FriendsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [showFriends, setShowFriends] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [friendIds, setFriendIds] = useState(new Set());

  useEffect(() => {
    if (currentUser) {
      loadFriends();
      loadFriendRequests();
    }
  }, [currentUser]);

  // Listen for presence events to update online status
  useEffect(() => {
    if (!socket) return;

    const handlePresence = (data) => {
      // Update online status for the user in friends list
      setFriends(prevFriends => 
        prevFriends.map(friend => {
          const friendId = friend._id?.toString() || friend.toString();
          if (friendId === data.userId?.toString()) {
            return { ...friend, isOnline: data.isOnline };
          }
          return friend;
        })
      );
      
      // Also update in allUsers and searchResults if they're displayed
      setAllUsers(prevUsers =>
        prevUsers.map(user => {
          const userId = user._id?.toString() || user.toString();
          if (userId === data.userId?.toString()) {
            return { ...user, isOnline: data.isOnline };
          }
          return user;
        })
      );
      
      setSearchResults(prevResults =>
        prevResults.map(user => {
          const userId = user._id?.toString() || user.toString();
          if (userId === data.userId?.toString()) {
            return { ...user, isOnline: data.isOnline };
          }
          return user;
        })
      );
    };

    socket.on('presence', handlePresence);

    return () => {
      socket.off('presence', handlePresence);
    };
  }, [socket]);

  const loadFriends = async () => {
    if (!currentUser) return;
    
    try {
      const data = await userApi.getFriends();
      // Filter out current user from friends list
      const currentUserId = currentUser._id?.toString();
      const filteredFriends = (data.friends || []).filter(
        friend => {
          const friendId = friend._id?.toString() || friend.toString();
          return friendId !== currentUserId;
        }
      );
      setFriends(filteredFriends);
      
      // Create a Set of friend IDs for quick lookup
      const friendIdsSet = new Set(
        filteredFriends.map(friend => friend._id?.toString() || friend.toString())
      );
      setFriendIds(friendIdsSet);
    } catch (error) {
      console.error('Failed to load friends:', error);
      setFriends([]);
      setFriendIds(new Set());
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const data = await friendApi.getRequests();
      // Track sent request IDs
      const sentIds = new Set(data.outgoing.map(req => req.toUser._id?.toString() || req.toUser.toString()));
      setSentRequests(sentIds);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowFriends(false);
    setShowAllUsers(false);
    try {
      const data = await userApi.searchUsers(searchQuery);
      // Filter out current user from search results
      const currentUserId = currentUser?._id?.toString();
      const filteredResults = (data.users || []).filter(
        user => {
          const userId = user._id?.toString() || user.toString();
          return userId !== currentUserId;
        }
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseAllUsers = async () => {
    setLoadingAllUsers(true);
    setShowFriends(false);
    setShowAllUsers(true);
    setSearchQuery('');
    setSearchResults([]);
    try {
      const data = await userApi.getAllUsers();
      // Filter out current user from all users list
      const currentUserId = currentUser?._id?.toString();
      const filteredUsers = (data.users || []).filter(
        user => {
          const userId = user._id?.toString() || user.toString();
          return userId !== currentUserId;
        }
      );
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load all users:', error);
      setAllUsers([]);
    } finally {
      setLoadingAllUsers(false);
    }
  };

  const handleSendRequest = async (toUserId, e) => {
    e.stopPropagation();
    try {
      await friendApi.sendRequest(toUserId);
      // Add to sent requests immediately
      const userIdStr = toUserId?.toString() || toUserId;
      setSentRequests(prev => new Set([...prev, userIdStr]));
      // Clear search input
      setSearchQuery('');
      setSearchResults([]);
      setShowFriends(true);
      setShowAllUsers(false);
      // Reload friend requests to update the list
      await loadFriendRequests();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/chat`);
    // The chat page will need to handle starting a chat with this user
    // For now, we'll use a custom event or state management
    window.dispatchEvent(new CustomEvent('startChatWithUser', { detail: { userId } }));
  };

  const displayUsers = showFriends ? friends : showAllUsers ? allUsers : searchResults;

  return (
    <div className="friends-page">
      <TopNavbar />
      <div className="friends-container">
        <h1>Friends</h1>
        
        <div className="search-section">
          <h2>Search Users</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <button 
            onClick={handleBrowseAllUsers} 
            className="browse-all-btn"
            disabled={loadingAllUsers}
            style={{ marginTop: '10px', padding: '8px 16px', cursor: loadingAllUsers ? 'not-allowed' : 'pointer' }}
          >
            {loadingAllUsers ? 'Loading...' : 'Browse All Users'}
          </button>
        </div>

        <div className="users-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0 }}>
              {showFriends ? 'My Friends' : showAllUsers ? 'All Users' : 'Search Results'}
            </h2>
            {!showFriends && (
              <button
                onClick={() => {
                  setShowFriends(true);
                  setShowAllUsers(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Back to Friends
              </button>
            )}
          </div>
          {showFriends && loadingFriends ? (
            <p>Loading friends...</p>
          ) : showAllUsers && loadingAllUsers ? (
            <p>Loading users...</p>
          ) : displayUsers.length === 0 ? (
            <div className="no-friends">
              <p>
                {showFriends 
                  ? 'No friends yet. Accept friend requests or search for users to add!' 
                  : showAllUsers 
                    ? 'No users found' 
                    : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="users-list">
              {displayUsers.map((user) => (
                <div
                  key={user._id}
                  className="user-item"
                  onClick={() => handleUserClick(user._id)}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="user-info">
                    <div className="user-username">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                    {user.isOnline && <span className="online-indicator">● Online</span>}
                  </div>
                  {showFriends ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user._id);
                        }}
                        className="chat-btn"
                      >
                        Chat
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to remove ${user.username} from your friends?`)) {
                            try {
                              await friendApi.removeFriend(user._id);
                              loadFriends();
                            } catch (error) {
                              alert(error.response?.data?.error || 'Failed to remove friend');
                            }
                          }
                        }}
                        className="remove-friend-btn"
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                        }}
                        title="Remove friend"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (() => {
                    const userId = user._id?.toString() || user.toString();
                    const isFriend = friendIds.has(userId);
                    const hasSentRequest = sentRequests.has(userId);
                    
                    if (isFriend) {
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user._id);
                          }}
                          className="chat-btn"
                        >
                          Chat
                        </button>
                      );
                    } else {
                      return (
                        <button
                          onClick={(e) => handleSendRequest(user._id, e)}
                          className={`send-request-btn ${hasSentRequest ? 'sent' : ''}`}
                          disabled={hasSentRequest}
                        >
                          {hasSentRequest ? 'Sent' : 'Send Request'}
                        </button>
                      );
                    }
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="requests-section">
          <FriendRequestList />
        </div>
      </div>
    </div>
  );
};

