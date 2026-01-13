import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { chatApi } from '../api/chatApi';
import { friendApi } from '../api/friendApi';
import { MessageCircle, Sun, Moon, MoreVertical, Users, Rss, LogOut } from 'lucide-react';
import '../styles/components/Navbar.css';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadFriendsCount, setUnreadFriendsCount] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const tipsRef = useRef(null);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const rooms = await chatApi.getRooms();
      let totalMarked = 0;

      for (const room of rooms) {
        try {
          const messages = await chatApi.getMessages(room._id);
          const unreadMessageIds = messages.messages
            ?.filter(msg => {
              const senderId = msg.senderId?._id?.toString() || msg.senderId?.toString();
              const isOwnMessage = senderId === user?.id?.toString();
              if (isOwnMessage) return false;
              
              const hasRead = msg.readBy && msg.readBy.some(
                read => {
                  const readUserId = read.userId?._id?.toString() || read.userId?.toString();
                  return readUserId === user?.id?.toString();
                }
              );
              return !hasRead;
            })
            .map(msg => msg._id) || [];

          if (unreadMessageIds.length > 0) {
            await chatApi.markMessagesAsRead(room._id, unreadMessageIds);
            totalMarked += unreadMessageIds.length;
          }
        } catch (error) {
          console.error(`Failed to mark messages as read in room ${room._id}:`, error);
        }
      }

      alert(`Marked ${totalMarked} messages as read`);
      setShowOptionsMenu(false);
      // Refresh the page to update unread counts
      window.location.reload();
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
      alert('Failed to mark all messages as read');
    }
  };

  // Fetch and update unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        const rooms = await chatApi.getRooms();
        let totalUnread = 0;
        
        rooms.forEach(room => {
          if (room.unreadCount && room.unreadCount > 0) {
            totalUnread += room.unreadCount;
          }
        });
        
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Listen for new messages and read updates
    if (socket) {
      const handleNewMessage = () => {
        fetchUnreadCount();
      };

      const handleMessagesRead = () => {
        fetchUnreadCount();
      };

      socket.on('new-message', handleNewMessage);
      socket.on('messages-read', handleMessagesRead);

      return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('messages-read', handleMessagesRead);
      };
    }
  }, [isAuthenticated, user?.id, socket]);

  // Fetch incoming friend requests count
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        const data = await friendApi.getRequests();
        const incomingCount = (data.incoming || []).length;
        setUnreadFriendsCount(incomingCount);
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
      }
    };

    fetchFriendRequests();
    
    // Refresh friend requests every 5 seconds
    const interval = setInterval(fetchFriendRequests, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      if (
        showOptionsMenu &&
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target)
      ) {
        setShowOptionsMenu(false);
      }

      if (
        showTips &&
        tipsRef.current &&
        !tipsRef.current.contains(event.target)
      ) {
        setShowTips(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, showOptionsMenu, showTips]);

  if (!isAuthenticated) {
    return null;
  }

  // Don't render navbar on chat page - it will be rendered as top-bar in ChatPage
  if (location.pathname === '/chats') {
    return null;
  }

  return (
    <nav>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/chats" className="navbar-brand" onClick={handleLinkClick}>
            💬 Convo
          </Link>
          {user && (
            <div className="navbar-welcome">
              Welcome, {user.username || user.email || 'User'}!
            </div>
          )}
        </div>
        <div className="navbar-right">
          <div className="navbar-options-wrapper" ref={optionsMenuRef}>
            <button
              className="navbar-options-btn"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              aria-label="More options"
            >
              ⋯
            </button>
            {showOptionsMenu && (
              <div className="navbar-options-menu">
                <button
                  className="navbar-option-item"
                  onClick={() => {
                    // Navigate to chats page first
                    navigate('/chats');
                    // Dispatch event to show user selection in ChatSidebar
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('showUserSelection'));
                    }, 100);
                    setShowOptionsMenu(false);
                  }}
                >
                  💬 Chats Selection
                </button>
                <button
                  className="navbar-option-item"
                  onClick={handleMarkAllAsRead}
                >
                  ✓ Mark All as Read
                </button>
                <button
                  className="navbar-option-item"
                  onClick={() => {
                    setShowTips(true);
                    setShowOptionsMenu(false);
                  }}
                >
                  💡 Tips & Shortcuts
                </button>
                <button
                  className="navbar-option-item"
                  onClick={() => {
                    navigate('/settings');
                    setShowOptionsMenu(false);
                    setIsMenuOpen(false);
                  }}
                >
                  ⚙️ Settings
                </button>
              </div>
            )}
          </div>
          <button
            ref={hamburgerRef}
            className="hamburger-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div ref={menuRef} className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/chats" className={location.pathname === '/chats' ? 'active' : ''} onClick={handleLinkClick}>
              Chats
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </Link>
            <Link to="/friends" className={location.pathname === '/friends' ? 'active' : ''} onClick={handleLinkClick}>
              Friends
              {unreadFriendsCount > 0 && (
                <span className="unread-badge">{unreadFriendsCount > 99 ? '99+' : unreadFriendsCount}</span>
              )}
            </Link>
            <Link to="/feed" className={location.pathname === '/feed' ? 'active' : ''} onClick={handleLinkClick}>Feed</Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Tips popup - rendered outside navbar-links for proper positioning */}
      {showTips && (
        <div className="navbar-tips-overlay" onClick={() => setShowTips(false)}>
          <div className="navbar-tips-popup" ref={tipsRef} onClick={(e) => e.stopPropagation()}>
            <div className="tips-header">
              <h3>💡 Quick Chat Tips & Shortcuts</h3>
              <button
                className="tips-close-btn"
                onClick={() => setShowTips(false)}
                aria-label="Close tips"
              >
                ×
              </button>
            </div>
            <div className="tips-content">
              <div className="tip-item">
                <strong>🚀 Quick Start:</strong> Use "💬 Chats Selection" to message multiple friends at once!
              </div>
              <div className="tip-item">
                <strong>⭐ Star Important:</strong> Click the star icon to mark favorite chats for quick access.
              </div>
              <div className="tip-item">
                <strong>🔍 Filter Chats:</strong> Use filters (All, Unread, Starred, Groups) to organize your conversations.
              </div>
              <div className="tip-item">
                <strong>📎 Share Files:</strong> Click the attach button to share files, friends, or your location.
              </div>
              <div className="tip-item">
                <strong>😊 Emojis:</strong> Use the emoji button to quickly add emojis to your messages.
              </div>
              <div className="tip-item">
                <strong>⌨️ Keyboard Shortcuts:</strong>
                <ul className="shortcuts-list">
                  <li><kbd>Enter</kbd> - Send message</li>
                  <li><kbd>Ctrl/Cmd + G</kbd> - Go to Chat</li>
                  <li><kbd>Ctrl/Cmd + F</kbd> - Go to Friends</li>
                  <li><kbd>Ctrl/Cmd + C</kbd> - Go to Chats</li>
                  <li><kbd>Ctrl/Cmd + S</kbd> - Go to Settings</li>
                  <li><kbd>/</kbd> - Focus search</li>
                  <li><kbd>Esc</kbd> - Close modals/menus</li>
                </ul>
              </div>
              <div className="tip-item">
                <strong>👥 Group Chats:</strong> Create groups to chat with multiple friends simultaneously.
              </div>
              <div className="tip-item">
                <strong>✓ Mark as Read:</strong> Use "Mark All as Read" to clear all unread notifications.
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

