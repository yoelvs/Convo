import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { postApi } from '../api/postApi';
import { formatDate } from '../utils/formatDate';
import '../styles/components/PostCard.css';

export const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  // Check if this is the user's own post by comparing author ID with current user ID
  const authorId = post.author?._id?.toString() || post.author?._id || post.author?.toString();
  const userId = user?.id?.toString() || user?._id?.toString();
  const isOwnPost = authorId === userId;
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((like) => {
      const likeId = like._id?.toString() || like.toString();
      return likeId === user?.id?.toString();
    }) || false
  );

  const handleLike = async () => {
    if (isOwnPost) return; // Prevent liking own posts
    
    try {
      const updatedPost = await postApi.likePost(post._id);
      setIsLiked(!isLiked);
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const updatedPost = await postApi.addComment(post._id, commentText);
      setCommentText('');
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postApi.deletePost(post._id);
      if (onUpdate) {
        onUpdate(null); // Signal that post was deleted
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert(error.response?.data?.error || 'Failed to delete post');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentText.trim()) return;

    try {
      const updatedPost = await postApi.editComment(post._id, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert(error.response?.data?.error || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const updatedPost = await postApi.deleteComment(post._id, commentId);
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert(error.response?.data?.error || 'Failed to delete comment');
    }
  };

  const isOwnComment = (comment) => {
    const commentUserId = comment.userId?._id?.toString() || comment.userId?.toString();
    return commentUserId === userId;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={post.author?.avatarUrl || '/default-avatar.png'}
          alt={post.author?.username}
          className="post-avatar"
        />
        <div className="post-header-info">
          <div className="post-author">{post.author?.username}</div>
          <div className="post-date">{formatDate(post.createdAt)}</div>
        </div>
        {isOwnPost && (
          <button
            onClick={handleDelete}
            className="delete-post-btn"
            title="Delete post"
            aria-label="Delete post"
          >
            🗑️
          </button>
        )}
      </div>
      <div className="post-content">
        <p>{post.text}</p>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="post-media">
            {post.mediaUrls.map((url, index) => (
              <img key={index} src={url} alt={`Media ${index + 1}`} />
            ))}
          </div>
        )}
      </div>
      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          disabled={isOwnPost}
          title={isOwnPost ? "You can't like your own post" : "Like this post"}
        >
          ❤️ {post.likes?.length || 0}
        </button>
      </div>
      <div className="post-comments">
        <div className="comments-list">
          {post.comments?.map((comment, index) => {
            const isEditing = editingCommentId === comment._id;
            const isCommentOwner = isOwnComment(comment);
            
            return (
              <div key={comment._id || index} className="comment">
                {isEditing ? (
                  <div className="comment-edit-form">
                    <input
                      type="text"
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="comment-edit-input"
                      autoFocus
                    />
                    <div className="comment-edit-actions">
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="comment-save-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="comment-cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-content">
                      <strong>{comment.userId?.username}:</strong> {comment.text}
                    </div>
                    {isCommentOwner && (
                      <div className="comment-actions">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="comment-edit-btn"
                          title="Edit comment"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="comment-delete-btn"
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <form onSubmit={handleComment} className="comment-form">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
};

