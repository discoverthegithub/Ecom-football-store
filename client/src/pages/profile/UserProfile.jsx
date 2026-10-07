import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Dashboard</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Welcome back, {user?.firstName}! Here's an overview of your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-textPrimary">Profile Details</h2>
            <Link to="/profile/settings" className="text-sm font-medium text-primary-600 hover:text-primary-500">Edit</Link>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex flex-col">
              <span className="text-textSecondary">Full Name</span>
              <span className="font-medium text-textPrimary">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-textSecondary">Email Address</span>
              <span className="font-medium text-textPrimary">{user?.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-textSecondary">Phone Number</span>
              <span className="font-medium text-textPrimary">{user?.phone || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-textPrimary">Default Address</h2>
            <Link to="/profile/addresses" className="text-sm font-medium text-primary-600 hover:text-primary-500">Manage</Link>
          </div>
          <div className="text-sm text-textSecondary bg-gray-50 p-4 rounded-lg border border-borderLight h-[116px] flex items-center justify-center">
            <p>You haven't saved any addresses yet.</p>
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-textPrimary">Recent Orders</h2>
          <Link to="/profile/orders" className="text-sm font-medium text-primary-600 hover:text-primary-500">View All</Link>
        </div>
        
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-sm text-textSecondary">You haven't placed any orders yet.</p>
          <div className="mt-4">
            <Link to="/shop" className="btn-secondary text-sm px-4 py-2">Start Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
