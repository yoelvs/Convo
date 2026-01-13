import React, { useState } from 'react';
import { postApi } from '../api/postApi';
import '../styles/components/PostComposer.css';

export const PostComposer = ({ onPostCreated }) => {
  const [text, setText] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && mediaUrls.length === 0) return;

    setLoading(true);
    try {
      const post = await postApi.createPost(text, mediaUrls);
      setText('');
      setMediaUrls([]);
      if (onPostCreated) {
        onPostCreated(post);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaAdd = (url) => {
    if (url.trim()) {
      setMediaUrls([...mediaUrls, url.trim()]);
    }
  };

  const handleMediaRemove = (index) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="post-composer">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={5000}
        />
        {mediaUrls.length > 0 && (
          <div className="media-preview">
            {mediaUrls.map((url, index) => (
              <div key={index} className="media-item">
                <img src={url} alt={`Media ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => handleMediaRemove(index)}
                  className="remove-media"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="composer-actions">
          <input
            type="text"
            placeholder="Add image URL (optional)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleMediaAdd(e.target.value);
                e.target.value = '';
              }
            }}
            className="media-url-input"
          />
          <button 
            type="submit" 
            disabled={loading || (!text.trim() && mediaUrls.length === 0)}
            style={{
              opacity: (!text.trim() && mediaUrls.length === 0) ? 0.5 : 1,
              cursor: (!text.trim() && mediaUrls.length === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

