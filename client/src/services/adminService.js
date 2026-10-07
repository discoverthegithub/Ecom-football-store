import api from './api';

export const adminService = {
  // Users Management
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  updateUserStatus: async (id, statusData) => {
    const response = await api.patch(`/users/${id}/status`, statusData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Dashboard Metrics
  getDashboardMetrics: async () => {
    const response = await api.get('/admin/metrics');
    return response.data;
  }
};

export default adminService;
