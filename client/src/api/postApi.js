import axiosClient from './axiosClient';

export const postApi = {
  createPost: async (text, mediaUrls = []) => {
    const response = await axiosClient.post('/posts', {
      text,
      mediaUrls,
    });
    return response.data;
  },

  getFeed: async (cursor = null, limit = 20) => {
    const response = await axiosClient.get('/posts/feed', {
      params: { cursor, limit },
    });
    return response.data;
  },

  likePost: async (postId) => {
    const response = await axiosClient.post(`/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, text) => {
    const response = await axiosClient.post(`/posts/${postId}/comments`, {
      text,
    });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await axiosClient.delete(`/posts/${postId}`);
    return response.data;
  },

  editComment: async (postId, commentId, text) => {
    const response = await axiosClient.put(`/posts/${postId}/comments/${commentId}`, {
      text,
    });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await axiosClient.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};

