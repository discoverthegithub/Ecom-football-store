import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import SEO from '../components/SEO';

const ProfileLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = [
    { name: 'Dashboard', path: '/profile' },
    { name: 'Order History', path: '/profile/orders' },
    { name: 'Wishlist', path: '/profile/wishlist' },
    { name: 'Addresses', path: '/profile/addresses' },
    { name: 'Settings', path: '/profile/settings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-3 mb-8 lg:mb-0">
          <div className="card-premium overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-borderLight flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-bold text-textPrimary">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-textSecondary">{user?.email}</p>
              </div>
            </div>
            
            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
