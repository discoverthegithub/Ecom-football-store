import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wishlistService from '../../services/wishlistService';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await wishlistService.getWishlist();
        if (response.success && response.data) {
          setWishlistItems(response.data.items || response.data);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Your Wishlist</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Keep track of items you love and want to buy later.
        </p>
      </div>

      <div className="card-premium overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-textSecondary">Loading wishlist...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-pink-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-textPrimary mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-textSecondary mb-6">Save items you like here while you shop.</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Wishlist items will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
