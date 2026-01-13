import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, MoreVertical, Users, Rss, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chatApi } from '../api/chatApi';
import { friendApi } from '../api/friendApi';
import '../styles/components/TopNavbar.css';

export const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadFriendsCount, setUnreadFriendsCount] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const optionsMenuRef = useRef(null);
  const tipsRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
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
  }, [user?.id]);

  // Fetch incoming friend requests count
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!user?.id) return;
      
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
  }, [user?.id]);

  // Close options menu and tips popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
      if (showTips && tipsRef.current && !tipsRef.current.contains(event.target)) {
        setShowTips(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu, showTips]);

  return (
    <>
      <nav className="top-bar">
        <div className="top-bar-left">
          <MessageCircle size={32} className="logo-icon" />
          <h1 className="logo-text">Convo</h1>
          {user && (
            <span className="welcome-text">Welcome, {user.username || user.email || 'User'}!</span>
          )}
        </div>
        <div className="top-bar-right">
          <div className="navbar-options-wrapper" ref={optionsMenuRef}>
            <button
              className="more-options"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
            {showOptionsMenu && (
              <div className="navbar-options-menu">
                <button
                  className="navbar-option-item"
                  onClick={() => {
                    navigate('/chats');
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
                  onClick={() => {
                    setShowOptionsMenu(false);
                  }}
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
                  }}
                >
                  ⚙️ Settings
                </button>
              </div>
            )}
          </div>
          <Link 
            to="/chats" 
            className={`nav-btn ${location.pathname === '/chats' || location.pathname === '/chat' ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            Chats
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
          <Link 
            to="/friends" 
            className={`nav-btn ${location.pathname === '/friends' ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <Users size={18} />
            Friends
            {unreadFriendsCount > 0 && (
              <span className="notification-badge">{unreadFriendsCount > 99 ? '99+' : unreadFriendsCount}</span>
            )}
          </Link>
          <Link 
            to="/feed" 
            className={`nav-btn ${location.pathname === '/feed' ? 'active' : ''}`}
          >
            <Rss size={18} />
            Feed
          </Link>
          <button onClick={handleLogout} className="nav-btn logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
      
      {/* Tips popup - rendered outside nav for proper overlay */}
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
    </>
  );
};
