import api from './api';

export const orderService = {
  // Customer Routes
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Admin Routes
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  updateOrderStatus: async (id, statusData) => {
    const response = await api.patch(`/orders/${id}/status`, statusData);
    return response.data;
  }
};

export default orderService;
