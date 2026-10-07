import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import SEO from '../components/SEO';
import Logo from '../components/Logo';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Categories', path: '/admin/categories' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users' },
  ];

  const marketingItems = [
    { name: 'Coupons', path: '/admin/marketing/coupons' },
    { name: 'Newsletter', path: '/admin/marketing/newsletter' },
  ];

  const supportItems = [
    { name: 'Reviews', path: '/admin/support/reviews' },
    { name: 'Messages', path: '/admin/support/messages' },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-slate-200 justify-between">
          <Logo className="h-10 sm:h-12" />
          <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ml-1">Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-6">
          <div>
            <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Store</div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div>
            <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Marketing</div>
            {marketingItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div>
            <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Support</div>
            {supportItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center mb-4">
            <div className="h-9 w-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-sm shadow-sm">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="ml-3">
              <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] font-medium text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full btn-secondary text-xs py-2 font-bold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
          <span className="text-base font-extrabold text-blue-600">Admin Control</span>
          <button onClick={handleLogout} className="text-xs font-bold text-slate-600">Logout</button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
