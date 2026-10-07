import api from './api';

export const paymentService = {
  createPaymentIntent: async (orderId) => {
    // Expected to return { data: { clientSecret: '...' } }
    const response = await api.post(`/payments/intent/${orderId}`);
    return response.data;
  }
};

export default paymentService;
