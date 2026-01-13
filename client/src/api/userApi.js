import axiosClient from './axiosClient';

export const userApi = {
  getProfile: async (userId) => {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, updates, avatarFile = null) => {
    const formData = new FormData();
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== null && updates[key] !== undefined) {
        formData.append(key, updates[key]);
      }
    });

    const response = await axiosClient.put(`/users/${userId}/edit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  searchUsers: async (query, page = 1, limit = 20) => {
    const response = await axiosClient.get('/users/search', {
      params: { query, page, limit },
    });
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 50) => {
    const response = await axiosClient.get('/users/all', {
      params: { page, limit },
    });
    return response.data;
  },

  getFriends: async () => {
    const response = await axiosClient.get('/users/friends');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/users/me');
    return response.data;
  },

  updateEmail: async (email) => {
    const response = await axiosClient.put('/users/email', { email });
    return response.data;
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await axiosClient.put('/users/password', { currentPassword, newPassword });
    return response.data;
  },
};

