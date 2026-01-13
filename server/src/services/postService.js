import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

export const createPost = async (authorId, text, mediaUrls = []) => {
  // Check for duplicate post (same text and media) by the same author
  // Only check recent posts (within last 24 hours) to allow editing and reposting
  const trimmedText = text.trim();
  const sortedMediaUrls = [...mediaUrls].sort();
  
  if (trimmedText || sortedMediaUrls.length > 0) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find posts with same text and media URLs
    const recentPosts = await Post.find({
      author: authorId,
      createdAt: { $gte: oneDayAgo },
    }).select('text mediaUrls');

    const duplicatePost = recentPosts.find(post => {
      const postText = post.text?.trim() || '';
      const postMediaUrls = [...(post.mediaUrls || [])].sort();
      
      // Check if text matches (if both have text) or both are empty
      const textMatches = (!trimmedText && !postText) || (trimmedText === postText);
      
      // Check if media URLs match
      const mediaMatches = sortedMediaUrls.length === postMediaUrls.length &&
        sortedMediaUrls.every((url, index) => url === postMediaUrls[index]);
      
      return textMatches && mediaMatches;
    });

    if (duplicatePost) {
      throw new Error('You have already posted this content recently. Please edit your existing post or wait before reposting.');
    }
  }

  const post = new Post({
    author: authorId,
    text,
    mediaUrls,
  });

  await post.save();
  return await Post.findById(post._id)
    .populate('author', 'username avatarUrl')
    .populate('likes', 'username avatarUrl')
    .populate('comments.userId', 'username avatarUrl');
};

export const getFeed = async (userId, cursor = null, limit = 20) => {
  const user = await User.findById(userId);
  // Show posts from friends AND user's own posts
  const friendIds = user.friends || [];
  // Include user's own ID so they can see their own posts
  const authorIds = [...friendIds, userId];

  const query = { author: { $in: authorIds } };
  
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const posts = await Post.find(query)
    .populate('author', 'username avatarUrl')
    .populate('likes', 'username avatarUrl')
    .populate('comments.userId', 'username avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;

  return {
    posts,
    nextCursor,
    hasMore,
  };
};

export const toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // Prevent users from liking their own posts
  if (post.author.toString() === userId.toString()) {
    throw new Error('You cannot like your own post');
  }

  const likeIndex = post.likes.findIndex(
    likeId => likeId.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push(userId);
  }

  await post.save();
  return await Post.findById(postId)
    .populate('author', 'username avatarUrl')
    .populate('likes', 'username avatarUrl')
    .populate('comments.userId', 'username avatarUrl');
};

export const addComment = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.comments.push({
    userId,
    text,
  });

  await post.save();
  return await Post.findById(postId)
    .populate('author', 'username avatarUrl')
    .populate('likes', 'username avatarUrl')
    .populate('comments.userId', 'username avatarUrl');
};

export const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  // Only the author can delete their own post
  if (post.author.toString() !== userId.toString()) {
    throw new Error('Unauthorized: You can only delete your own posts');
  }

  await Post.findByIdAndDelete(postId);
  return { success: true };
};

export const editComment = async (postId, commentId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Only the comment author can edit their own comment
  if (comment.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized: You can only edit your own comments');
  }

  comment.text = text;
  await post.save();

  return await Post.findById(postId)
    .populate('author', 'username avatarUrl')
    .populate('likes', 'username avatarUrl')
    .populate('comments.userId', 'username avatarUrl');
};

export const deleteComment = async (postId, commentId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Only the comment author can delete their own comment
  if (comment.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized: You can only delete your own comments');
  }

  post.comments.pull(commentId);
  await post.save();

  return await Post.findById(postId)
    .populate('author', 'username avatarUrl')
    .populate('likes', 'username avatarUrl')
    .populate('comments.userId', 'username avatarUrl');
};
