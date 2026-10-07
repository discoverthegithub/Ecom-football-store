import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toggleDrawer } from '../features/cart/cartSlice';
import CartDrawer from '../components/CartDrawer';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import Logo from '../components/Logo';

const MainLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const totalCartItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Announcement Bar */}
      <div className="bg-blue-600 text-white text-xs py-2 text-center font-semibold uppercase tracking-widest shadow-sm">
        ⚡ FREE EXPRESS SHIPPING ON ALL MATCHDAY & VINTAGE KITS OVER $150 ⚡
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
            
            <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide uppercase">
              <Link to="/" className="text-slate-800 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/shop?league_or_type=Club" className="text-slate-600 hover:text-blue-600 transition-colors">Clubs</Link>
              <Link to="/shop?league_or_type=Nation" className="text-slate-600 hover:text-blue-600 transition-colors">Nations</Link>
              <Link to="/shop?isVintage=true" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <span>Vintage</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300/60 px-1.5 py-0.5 rounded-md font-bold">RARE</span>
              </Link>
              <Link to="/shop" className="text-slate-600 hover:text-blue-600 transition-colors">Shop All</Link>
              <Link to="/contact" className="text-slate-600 hover:text-blue-600 transition-colors">The Dugout</Link>
            </nav>

            <div className="flex items-center space-x-4">
              
              {/* Cart Icon */}
              <button 
                onClick={() => dispatch(toggleDrawer())} 
                className="text-slate-700 hover:text-blue-600 transition-colors relative p-2.5 rounded-xl bg-slate-100 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50"
                aria-label="Open cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[11px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-slate-700 hidden sm:block">
                    {user?.firstName || 'Pitchside'}
                  </span>
                  {user?.role === 'admin' || user?.role === 'super_admin' ? (
                    <Link to="/admin" className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl transition-all">
                      Dashboard
                    </Link>
                  ) : (
                    <Link to="/profile" className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl transition-all">
                      Account
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-2">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors px-2 py-2">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary text-xs px-4 py-2.5 hidden sm:block">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main Content */}
      <main className="flex-grow relative z-0">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1 space-y-4">
              <Logo textClassName="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Authentic, vintage, and modern football kits curated for kit purists and football fans worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Navigation</h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-300">
                <li><Link to="/shop?league_or_type=Club" className="hover:text-blue-400 transition-colors">Club Kits</Link></li>
                <li><Link to="/shop?league_or_type=Nation" className="hover:text-blue-400 transition-colors">National Teams</Link></li>
                <li><Link to="/shop?isVintage=true" className="hover:text-blue-400 transition-colors">Vintage Vault</Link></li>
                <li><Link to="/shop" className="hover:text-blue-400 transition-colors">Full Collection</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Leagues</h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-300">
                <li><Link to="/shop?league=Premier+League" className="hover:text-blue-400 transition-colors">Premier League</Link></li>
                <li><Link to="/shop?league=La+Liga" className="hover:text-blue-400 transition-colors">La Liga</Link></li>
                <li><Link to="/shop?league=Serie+A" className="hover:text-blue-400 transition-colors">Serie A</Link></li>
                <li><Link to="/shop?league=International" className="hover:text-blue-400 transition-colors">FIFA International</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Matchday Newsletter</h4>
              <p className="text-xs text-slate-400 mb-4">Subscribe for instant alerts on vintage drops and rare matchday restocks.</p>
              <NewsletterSubscribe />
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} FALSE NINE APPAREL CO. ALL RIGHTS RESERVED.
            </p>
            <div className="flex space-x-6 text-xs text-slate-400">
              <Link to="/contact" className="hover:text-blue-400">The Dugout Support</Link>
              <span className="text-slate-600">•</span>
              <span>Authenticity Guarantee</span>
              <span className="text-slate-600">•</span>
              <span>Worldwide Shipping</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
