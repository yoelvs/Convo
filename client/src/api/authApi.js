import axiosClient from './axiosClient';

export const authApi = {
  signup: async (username, email, password, avatarFile = null) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await axiosClient.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  refresh: async () => {
    const response = await axiosClient.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },
};

