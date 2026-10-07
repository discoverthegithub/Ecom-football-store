import api from './api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },
  
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data;
  },
};

export const adminService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  updateUserStatus: async (id, statusData) => {
    const response = await api.patch(`/users/${id}/status`, statusData);
    return response.data;
  }
};

export default { userService, adminService };
