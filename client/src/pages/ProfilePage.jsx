import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/pages/ProfilePage.css';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.id?.toString() === id?.toString();

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const data = await userApi.getProfile(id);
      setProfile(data);
      setEditForm({ username: data.username, bio: data.bio || '' });
      setAvatarPreview(data.avatarUrl);
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
    if (isOwnProfile && isEditing) {
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
      const updated = await userApi.updateProfile(id, updates, avatarFile);
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
    return <div className="profile-page">Loading...</div>;
  }

  if (error) {
    return <div className="profile-page">Error: {error}</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div 
            className="avatar-section"
            onDragOver={isOwnProfile && isEditing ? handleDragOver : undefined}
            onDragEnter={isOwnProfile && isEditing ? handleDragEnter : undefined}
            onDrop={isOwnProfile && isEditing ? handleDrop : undefined}
            style={isOwnProfile && isEditing ? { cursor: 'pointer' } : {}}
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
            {isOwnProfile && isEditing && (
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
                <h1>{profile.username}</h1>
                <p className="profile-email">{profile.email}</p>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                {profile.isFriend !== undefined && (
                  <div className="profile-relation">
                    {profile.isFriend ? 'Friend' : 'Not a friend'}
                  </div>
                )}
                {isOwnProfile && (
                  <button onClick={handleEdit} className="edit-profile-btn">
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

