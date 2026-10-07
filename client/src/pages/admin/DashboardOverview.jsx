import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    lowStockVariants: [],
    recentContactMessages: [],
    recentOrderRemarks: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await adminService.getDashboardMetrics();
        if (response.success && response.data) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const stats = [
    { title: 'Total Revenue', value: `$${(metrics.totalRevenue || 0).toFixed(2)}` },
    { title: 'Total Orders', value: metrics.totalOrders || 0 },
    { title: 'Total Users', value: metrics.totalUsers || 0 },
    { title: 'Customer Messages', value: (metrics.recentContactMessages?.length || 0) + (metrics.recentOrderRemarks?.length || 0) },
  ];

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Loading dashboard metrics...</div>;
  }

  return (
    <div className="space-y-8 bg-[#F8FAFC]">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Live metrics, inventory alerts, and customer messages.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-blue-600">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All &rarr;</Link>
          </div>
          
          <div className="flex-1 overflow-auto">
            {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {metrics.recentOrders.map(order => (
                  <li key={order._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Order #{order.orderNumber || order._id.substring(0, 8)}</p>
                      <p className="text-[11px] font-medium text-slate-500">{order.user?.email || order.shippingAddress?.fullName || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-blue-600">${(order.total || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{order.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-xs text-slate-400 font-medium">
                No recent orders found
              </div>
            )}
          </div>
        </div>
        
        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">Low Stock Inventory Alerts</h3>
            <Link to="/admin/inventory" className="text-xs font-bold text-blue-600 hover:text-blue-700">Manage Stock &rarr;</Link>
          </div>
          
          <div className="flex-1 overflow-auto">
            {metrics.lowStockVariants && metrics.lowStockVariants.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {metrics.lowStockVariants.map(variant => (
                  <li key={variant._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{variant.product?.name || 'Kit Item'}</p>
                      <p className="text-[11px] font-medium text-slate-500">SKU: {variant.sku} | Size: {variant.size}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        variant.stock > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {variant.stock} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-xs text-slate-400 font-medium">
                All inventory items are well stocked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Messages & Order Remarks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Contact Inquiries */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
              📨 Customer Support Messages
            </h3>
            <Link to="/admin/support/submissions" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All &rarr;</Link>
          </div>

          <div className="flex-1 overflow-auto">
            {metrics.recentContactMessages && metrics.recentContactMessages.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {metrics.recentContactMessages.map(msg => (
                  <li key={msg._id} className="py-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-blue-600">{msg.name} <span className="font-normal text-slate-500">({msg.email})</span></p>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{msg.subject || 'General Inquiry'}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                      "{msg.message}"
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-xs text-slate-400 font-medium">
                No customer support messages yet.
              </div>
            )}
          </div>
        </div>

        {/* Customer Order Remarks & Notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
              📝 Customer Order Remarks & Notes
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700">View Orders &rarr;</Link>
          </div>

          <div className="flex-1 overflow-auto">
            {metrics.recentOrderRemarks && metrics.recentOrderRemarks.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {metrics.recentOrderRemarks.map(order => (
                  <li key={order._id} className="py-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-blue-600">
                        Order #{order.orderNumber || order._id.substring(0, 8)}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">Customer: {order.user?.email || order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      "{order.customerNote}"
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-xs text-slate-400 font-medium">
                No customer order remarks submitted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
