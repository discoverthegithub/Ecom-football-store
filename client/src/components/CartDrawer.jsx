import { useSelector, useDispatch } from 'react-redux';
import { closeDrawer, removeLocalItem, updateLocalItem, removeCartItem, updateCartItem } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { items, subtotal, isDrawerOpen } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isDrawerOpen) return null;

  const handleClose = () => dispatch(closeDrawer());

  const handleRemove = (itemId) => {
    if (isAuthenticated) {
      dispatch(removeCartItem(itemId));
    } else {
      dispatch(removeLocalItem(itemId));
    }
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    if (isAuthenticated) {
      dispatch(updateCartItem({ itemId, quantity }));
    } else {
      dispatch(updateLocalItem({ itemId, quantity }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-lg font-medium text-slate-900">Your cart is empty</p>
              <button onClick={handleClose} className="mt-4 text-blue-600 font-semibold hover:text-blue-700">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => {
                const productId = item.product?._id;
                const itemId = isAuthenticated ? item._id : productId;
                const name = item.product?.name;
                const price = item.product?.price || item.price;
                const image = item.product?.images?.[0]?.url || 'https://via.placeholder.com/150';

                return (
                  <li key={itemId} className="flex py-2">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img src={image} alt={name} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-sm font-semibold text-slate-900">
                          <h3 className="line-clamp-1">{name}</h3>
                          <p className="ml-4 text-blue-600 font-bold">${(price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">${price.toFixed(2)} each</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm mt-3">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)} className="px-2.5 py-1 text-slate-600 hover:text-blue-600 font-bold">-</button>
                          <span className="px-2.5 text-xs font-semibold text-slate-900">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)} className="px-2.5 py-1 text-slate-600 hover:text-blue-600 font-bold">+</button>
                        </div>
                        <button type="button" onClick={() => handleRemove(itemId)} className="font-semibold text-xs text-red-500 hover:text-red-600">
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 p-6 bg-slate-50/50">
            {!isAuthenticated && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2.5">
                <span className="text-base">🔒</span>
                <span>Items added to your bag! Please <Link to="/login" state={{ from: '/checkout' }} onClick={handleClose} className="underline font-bold text-blue-600 hover:text-blue-800">sign in</Link> to buy.</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-slate-900 mb-2">
              <p>Subtotal</p>
              <p className="text-blue-600 font-extrabold">${subtotal?.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 mb-6">Shipping and taxes calculated at checkout.</p>
            <div className="space-y-3">
              <Link 
                to={isAuthenticated ? "/checkout" : "/login"} 
                state={!isAuthenticated ? { from: '/checkout' } : undefined}
                onClick={handleClose}
                className="w-full btn-primary block text-center py-3 text-xs font-bold"
              >
                {isAuthenticated ? "Checkout" : "Sign In to Checkout"}
              </Link>
              <Link 
                to="/cart" 
                onClick={handleClose}
                className="w-full btn-secondary block text-center py-3 text-xs font-bold"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
