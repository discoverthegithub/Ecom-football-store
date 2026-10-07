import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        if (response.success && response.data) {
          setOrders(response.data.orders || response.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Order History</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Check the status of recent orders, manage returns, and download invoices.
        </p>
      </div>

      <div className="card-premium overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-textSecondary">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg font-medium text-textPrimary mb-2">No orders found</h3>
            <p className="text-sm text-textSecondary mb-6">Looks like you haven't made any purchases yet.</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="divide-y divide-borderLight">
            {/* Map orders here when real data is available */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
