import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
  
  toggleWishlistItem: async (productId) => {
    const response = await api.post('/wishlist/toggle', { product: productId });
    return response.data;
  },
  
  clearWishlist: async () => {
    const response = await api.delete('/wishlist');
    return response.data;
  }
};

export default wishlistService;
