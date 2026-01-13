import axiosClient from './axiosClient';

export const chatApi = {
  getRooms: async () => {
    const response = await axiosClient.get('/chat/rooms');
    return response.data;
  },

  getMessages: async (roomId, cursor = null, limit = 50) => {
    const response = await axiosClient.get(`/chat/rooms/${roomId}/messages`, {
      params: { cursor, limit },
    });
    return response.data;
  },

  createGroup: async (name, memberIds) => {
    const response = await axiosClient.post('/chat/groups', {
      name,
      memberIds,
    });
    return response.data;
  },

  addMembersToGroup: async (roomId, memberIds) => {
    const response = await axiosClient.post(`/chat/groups/${roomId}/members`, {
      memberIds,
    });
    return response.data;
  },

  removeMemberFromGroup: async (roomId, memberId) => {
    const response = await axiosClient.delete(`/chat/groups/${roomId}/members/${memberId}`);
    return response.data;
  },

  leaveGroup: async (roomId) => {
    const response = await axiosClient.post(`/chat/groups/${roomId}/leave`);
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await axiosClient.delete(`/chat/rooms/${roomId}`);
    return response.data;
  },

  getInvitations: async () => {
    const response = await axiosClient.get('/chat/invitations');
    return response.data;
  },

  acceptInvitation: async (invitationId) => {
    const response = await axiosClient.post('/chat/invitations/accept', {
      invitationId,
    });
    return response.data;
  },

  declineInvitation: async (invitationId) => {
    const response = await axiosClient.post('/chat/invitations/decline', {
      invitationId,
    });
    return response.data;
  },

  updateGroupName: async (roomId, name) => {
    const response = await axiosClient.put(`/chat/groups/${roomId}`, {
      name,
    });
    return response.data;
  },

  markMessagesAsRead: async (roomId, messageIds) => {
    const response = await axiosClient.post(`/chat/rooms/${roomId}/read`, {
      messageIds,
    });
    return response.data;
  },

  promoteToManager: async (roomId, memberId) => {
    const response = await axiosClient.post(`/chat/groups/${roomId}/managers/${memberId}`);
    return response.data;
  },

  demoteManager: async (roomId, managerId) => {
    const response = await axiosClient.delete(`/chat/groups/${roomId}/managers/${managerId}`);
    return response.data;
  },
};

