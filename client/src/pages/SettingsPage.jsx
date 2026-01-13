import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavbar } from '../components/TopNavbar';
import { userApi } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/pages/SettingsPage.css';

export const SettingsPage = () => {
  const { user: currentUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile(currentUser.id);
      setProfile(data);
      setEditForm({ username: data.username, bio: data.bio || '' });
      setAvatarPreview(data.avatarUrl);
      // Load showOnlineStatus from profile
      if (data.showOnlineStatus !== undefined) {
        setShowOnlineStatus(data.showOnlineStatus);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ username: profile.username, bio: profile.bio || '' });
    setAvatarFile(null);
    setAvatarPreview(profile.avatarUrl);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) {
      handleAvatarChange(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        username: editForm.username,
        bio: editForm.bio,
      };
      const updated = await userApi.updateProfile(currentUser.id, updates, avatarFile);
      setProfile(updated);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-page">Loading...</div>;
  }

  if (error) {
    return <div className="settings-page">Error: {error}</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Settings</h1>

        {/* Profile Section */}
        <div className="settings-section">
          <h2>Profile</h2>
          <div className="profile-header">
            <div 
              className="avatar-section"
              onDragOver={isEditing ? handleDragOver : undefined}
              onDragEnter={isEditing ? handleDragEnter : undefined}
              onDrop={isEditing ? handleDrop : undefined}
              style={isEditing ? { cursor: 'pointer' } : {}}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={profile.username}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {isEditing && (
                <label className="avatar-edit-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <span>Change or Drag & Drop</span>
                </label>
              )}
            </div>
            <div className="profile-info">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="edit-input"
                  />
                  <p className="profile-email">{profile.email}</p>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Bio (optional)"
                    className="edit-bio"
                    maxLength={500}
                  />
                  <div className="edit-actions">
                    <button onClick={handleSave} disabled={saving} className="save-btn">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handleCancel} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{profile.username}</h3>
                  <p className="profile-email">{profile.email}</p>
                  {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                  <button onClick={handleEdit} className="edit-profile-btn">
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Dark Mode</label>
              <p className="setting-description">Switch between light and dark theme</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Enable Notifications</label>
              <p className="setting-description">Receive browser notifications</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Email Notifications</label>
              <p className="setting-description">Receive email notifications for important updates</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <h2>Privacy</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Show Online Status</label>
              <p className="setting-description">Let others see when you're online</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  setShowOnlineStatus(newValue);
                  // Save to database
                  try {
                    await userApi.updateProfile(currentUser.id, { showOnlineStatus: newValue });
                  } catch (error) {
                    console.error('Failed to save online status preference:', error);
                    // Revert on error
                    setShowOnlineStatus(!newValue);
                  }
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <h2>Account</h2>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Email</label>
              {editingEmail ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder={profile.email}
                    className="edit-input"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  />
                  {emailError && <p style={{ color: '#f44336', fontSize: '0.875rem', margin: '0.25rem 0' }}>{emailError}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="secondary-btn"
                      onClick={async () => {
                        if (!newEmail.trim()) {
                          setEmailError('Email is required');
                          return;
                        }
                        try {
                          const updated = await userApi.updateEmail(newEmail.trim());
                          setProfile(updated);
                          setEditingEmail(false);
                          setNewEmail('');
                          setEmailError('');
                        } catch (err) {
                          setEmailError(err.response?.data?.error || 'Failed to update email');
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setEditingEmail(false);
                        setNewEmail('');
                        setEmailError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="setting-description">{profile.email}</p>
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setEditingEmail(true);
                      setNewEmail(profile.email);
                    }}
                  >
                    Change Email
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">Password</label>
              {editingPassword ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      setPasswordError('');
                    }}
                    placeholder="Current Password"
                    className="edit-input"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      setPasswordError('');
                    }}
                    placeholder="New Password"
                    className="edit-input"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                      setPasswordError('');
                    }}
                    placeholder="Confirm New Password"
                    className="edit-input"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  />
                  {passwordError && <p style={{ color: '#f44336', fontSize: '0.875rem', margin: '0.25rem 0' }}>{passwordError}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="secondary-btn"
                      onClick={async () => {
                        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                          setPasswordError('All fields are required');
                          return;
                        }
                        if (passwordData.newPassword !== passwordData.confirmPassword) {
                          setPasswordError('New passwords do not match');
                          return;
                        }
                        if (passwordData.newPassword.length < 6) {
                          setPasswordError('Password must be at least 6 characters long');
                          return;
                        }
                        try {
                          await userApi.updatePassword(passwordData.currentPassword, passwordData.newPassword);
                          setEditingPassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordError('');
                          alert('Password updated successfully');
                        } catch (err) {
                          setPasswordError(err.response?.data?.error || 'Failed to update password');
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        setEditingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="setting-description">Change your password</p>
                  <button
                    className="secondary-btn"
                    onClick={() => setEditingPassword(true)}
                  >
                    Change Password
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

