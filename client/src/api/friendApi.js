import axiosClient from './axiosClient';

export const friendApi = {
  sendRequest: async (toUserId) => {
    const response = await axiosClient.post('/friends/request', {
      toUserId,
    });
    return response.data;
  },

  acceptRequest: async (requestId) => {
    const response = await axiosClient.post('/friends/accept', {
      requestId,
    });
    return response.data;
  },

  declineRequest: async (requestId) => {
    const response = await axiosClient.post('/friends/decline', {
      requestId,
    });
    return response.data;
  },

  getRequests: async () => {
    const response = await axiosClient.get('/friends/requests');
    return response.data;
  },

  removeFriend: async (friendId) => {
    const response = await axiosClient.post('/friends/remove', {
      friendId,
    });
    return response.data;
  },
};

