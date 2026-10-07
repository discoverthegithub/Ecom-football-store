import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  
  addItem: async (itemData) => {
    const payload = {
      product: itemData.productId || itemData.product,
      variant: itemData.variantId || itemData.variant,
      quantity: itemData.quantity
    };
    const response = await api.post('/cart/items', payload);
    return response.data;
  },
  
  updateItemQuantity: async (itemId, quantity) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  
  removeItem: async (itemId) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },
  
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};

export default cartService;
