import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { clearLocalCart } from '../features/cart/cartSlice';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';
import api from '../services/api';
import SEO from '../components/SEO';

// Initialize Stripe outside component to avoid recreating it
// In production, this should be an env variable: import.meta.env.VITE_STRIPE_PUBLIC_KEY
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ clientSecret, onSuccessfulPayment, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // If mock demo secret is returned because Stripe API key is not configured locally
    if (clientSecret && clientSecret.startsWith('mock_client_secret')) {
      setTimeout(() => {
        setIsProcessing(false);
        onSuccessfulPayment();
      }, 600);
      return;
    }

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'Customer',
        },
      }
    });

    if (result.error) {
      setError(result.error.message);
      setIsProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccessfulPayment();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-textPrimary mb-6">Payment Details</h2>
      <div className="space-y-6">
        <div className="p-4 border border-borderLight rounded-md bg-white">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="btn-secondary" disabled={isProcessing}>Back</button>
        <button type="submit" className="btn-primary min-w-[150px]" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
};

const Checkout = () => {
  const [step, setStep] = useState(1);
  const { items, subtotal } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', zip: '' });
  const [clientSecret, setClientSecret] = useState('');

  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setStep(2);
    
    try {
      // Create Address first
      const addressRes = await api.post('/users/addresses', {
        type: 'shipping',
        fullName: 'Matchday Customer',
        phone: '1234567890',
        street: shippingAddress.address || 'Matchday Street 1',
        city: shippingAddress.city || 'London',
        state: 'NY',
        zipCode: shippingAddress.zip || '10001',
        country: 'US'
      });
      
      const addressId = addressRes.data?.data?._id || addressRes.data?._id;

      // Create order
      const orderData = {
        shippingAddress: addressId,
        billingAddress: addressId,
        paymentMethod: 'stripe',
        orderNotes: 'Created from frontend checkout'
      };

      const orderRes = await orderService.createOrder(orderData);
      const orderId = orderRes.data?._id || orderRes._id || orderRes.data?.data?._id;

      // Create payment intent using the orderId
      const res = await paymentService.createPaymentIntent(orderId);
      setClientSecret(res.data?.clientSecret || res.clientSecret);
    } catch (err) {
      console.error('Failed to init payment', err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      alert('Failed to initialize checkout. ' + msg);
      setStep(1);
    }
  };

  const handleSuccessfulPayment = () => {
    setStep(3);
  };

  const handlePlaceOrder = () => {
    alert('Order placed successfully! Thank you for shopping with us.');
    dispatch(clearLocalCart());
    navigate('/');
  };

  if (items.length === 0 && step === 1) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/shop" className="text-primary-600 hover:text-primary-500 font-medium">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#F8FAFC]">
      <SEO title="Checkout" />
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          {/* Progress Steps */}
          <nav aria-label="Progress" className="mb-8">
            <ol role="list" className="flex items-center space-x-4">
              <li className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all ${step >= 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>1. Shipping</li>
              <li className="text-slate-300">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" /></svg>
              </li>
              <li className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all ${step >= 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>2. Payment</li>
              <li className="text-slate-300">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" /></svg>
              </li>
              <li className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all ${step >= 3 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>3. Complete</li>
            </ol>
          </nav>

          {/* Form Area */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {step === 1 && (
              <form onSubmit={handleShippingSubmit}>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                    <input type="text" id="address" required value={shippingAddress.address} onChange={e => setShippingAddress({...shippingAddress, address: e.target.value})} className="input-field" placeholder="123 Main St" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                    <input type="text" id="city" required value={shippingAddress.city} onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} className="input-field" placeholder="New York" />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm font-semibold text-slate-700 mb-1.5">ZIP / Postal code</label>
                    <input type="text" id="zip" required value={shippingAddress.zip} onChange={e => setShippingAddress({...shippingAddress, zip: e.target.value})} className="input-field" placeholder="10001" />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button type="submit" className="btn-primary">Continue to Payment</button>
                </div>
              </form>
            )}

            {step === 2 && clientSecret && (
              clientSecret.startsWith('mock_client_secret') ? (
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  onSuccessfulPayment={handleSuccessfulPayment} 
                  onBack={() => setStep(1)} 
                />
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    onSuccessfulPayment={handleSuccessfulPayment} 
                    onBack={() => setStep(1)} 
                  />
                </Elements>
              )
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-slate-600 mb-8 font-medium">Your order has been confirmed and is now being processed.</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-left">
                  <h3 className="font-semibold text-slate-900">Shipping To</h3>
                  <p className="text-sm text-slate-600 mt-1">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.zip}</p>
                </div>
                <button onClick={handlePlaceOrder} className="btn-primary w-full sm:w-auto">
                  Complete Order
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-10 lg:mt-0 lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-6 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Order summary</h2>
            
            <ul className="divide-y divide-slate-100 mb-6 border-b border-slate-200 pb-6">
              {items.map((item) => {
                const productId = item.product?._id;
                const itemId = item._id || productId;
                const name = item.product?.name;
                const price = item.product?.price || item.price;

                return (
                  <li key={itemId} className="py-3.5 flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{name}</h4>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-blue-600">${(price * item.quantity).toFixed(2)}</p>
                  </li>
                );
              })}
            </ul>

            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-slate-600">Subtotal</dt>
                <dd className="text-sm font-bold text-slate-900">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-slate-600">Shipping</dt>
                <dd className="text-sm font-bold text-slate-900">${shipping.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-slate-600">Taxes</dt>
                <dd className="text-sm font-bold text-slate-900">${tax.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <dt className="text-base font-extrabold text-slate-900">Total</dt>
                <dd className="text-xl font-extrabold text-blue-600">${total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
