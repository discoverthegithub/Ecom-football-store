import api from './api';

const contactService = {
  submitContactMessage: async (formData) => {
    const response = await api.post('/contact', formData);
    return response.data;
  },

  getContactMessages: async (params = {}) => {
    const response = await api.get('/contact', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/contact/${id}/read`);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },
};

export default contactService;
