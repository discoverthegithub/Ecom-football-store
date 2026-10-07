import { useSelector, useDispatch } from 'react-redux';
import { removeLocalItem, updateLocalItem, removeCartItem, updateCartItem } from '../features/cart/cartSlice';
import { Link } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, subtotal } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

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

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-3xl font-bold text-textPrimary tracking-tight mb-4">Your Cart</h1>
        <div className="bg-surface border border-borderLight p-12 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-xl text-textSecondary mb-8">Your cart is currently empty.</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-textPrimary tracking-tight mb-8">Your Cart</h1>

      {!isAuthenticated && (
        <div className="mb-8 p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-sm flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-bold">Sign in required to complete purchase</p>
            <p className="text-xs text-slate-300">Items are saved in your bag! Please <Link to="/login" state={{ from: '/checkout' }} className="underline font-bold text-gold-400 hover:text-white">sign in to your customer account</Link> to buy your items.</p>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <ul className="border-t border-b border-borderLight divide-y divide-borderLight">
            {items.map((item) => {
              const productId = item.product?._id;
              const itemId = isAuthenticated ? item._id : productId;
              const name = item.product?.name;
              const price = item.product?.price || item.price;
              const image = item.product?.images?.[0]?.url || 'https://via.placeholder.com/150';

              return (
                <li key={itemId} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <img
                      src={image}
                      alt={name}
                      className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32 border border-borderLight"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-textPrimary">
                            <Link to={`/product/${item.product?.slug}`}>{name}</Link>
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-textSecondary">${price.toFixed(2)}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9 flex items-center justify-between">
                        <div className="flex items-center border border-borderLight rounded-md">
                          <button onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)} className="px-3 py-1 text-textSecondary hover:bg-gray-100">-</button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)} className="px-3 py-1 text-textSecondary hover:bg-gray-100">+</button>
                        </div>
                        <div className="absolute top-0 right-0">
                          <button type="button" onClick={() => handleRemove(itemId)} className="-m-2 p-2 inline-flex text-gray-400 hover:text-red-500 transition-colors">
                            <span className="sr-only">Remove</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order summary */}
        <section className="mt-16 bg-surface border border-borderLight rounded-xl px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-4">
          <h2 className="text-lg font-bold text-textPrimary">Order summary</h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-textSecondary">Subtotal</dt>
              <dd className="text-sm font-medium text-textPrimary">${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-borderLight pt-4">
              <dt className="flex items-center text-sm text-textSecondary">
                <span>Shipping estimate</span>
              </dt>
              <dd className="text-sm font-medium text-textPrimary">${shipping.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-borderLight pt-4">
              <dt className="flex text-sm text-textSecondary">
                <span>Tax estimate</span>
              </dt>
              <dd className="text-sm font-medium text-textPrimary">${tax.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-borderLight pt-4">
              <dt className="text-base font-bold text-textPrimary">Order total</dt>
              <dd className="text-base font-bold text-textPrimary">${total.toFixed(2)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <Link 
              to={isAuthenticated ? "/checkout" : "/login"} 
              state={!isAuthenticated ? { from: '/checkout' } : undefined}
              className="w-full btn-primary block text-center py-3 text-base"
            >
              {isAuthenticated ? "Checkout" : "Sign In to Checkout"}
            </Link>
          </div>
          
          <div className="mt-6 text-center text-sm text-textSecondary">
            <p>
              or{' '}
              <Link to="/shop" className="text-primary-600 font-medium hover:text-primary-500">
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Cart;
