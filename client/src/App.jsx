import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProfile } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import VerifyEmail from './pages/VerifyEmail';

// Profile Pages
import ProfileLayout from './layouts/ProfileLayout';
import UserProfile from './pages/profile/UserProfile';
import OrderHistory from './pages/profile/OrderHistory';
import Wishlist from './pages/profile/Wishlist';

// Admin Pages
import DashboardOverview from './pages/admin/DashboardOverview';
import ProductList from './pages/admin/products/ProductList';
import ProductForm from './pages/admin/products/ProductForm';
import OrderList from './pages/admin/orders/OrderList';
import UserList from './pages/admin/users/UserList';
import CategoryList from './pages/admin/categories/CategoryList';
import CategoryForm from './pages/admin/categories/CategoryForm';
import InventoryList from './pages/admin/inventory/InventoryList';
import CouponList from './pages/admin/marketing/CouponList';
import CouponForm from './pages/admin/marketing/CouponForm';
import NewsletterList from './pages/admin/marketing/NewsletterList';
import ReviewsList from './pages/admin/support/ReviewsList';
import ContactSubmissions from './pages/admin/support/ContactSubmissions';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder Pages
const NotFound = () => <div className="p-8"><h1 className="text-2xl">404 - Not Found</h1></div>;

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt to fetch user profile & cart if token exists
    if (localStorage.getItem('token')) {
      dispatch(fetchProfile());
      dispatch(fetchCart());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected Customer Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<UserProfile />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="addresses" element={<div className="p-6"><h2 className="text-xl font-bold">Addresses</h2><p>Address management coming soon.</p></div>} />
            <Route path="settings" element={<div className="p-6"><h2 className="text-xl font-bold">Settings</h2><p>Account settings coming soon.</p></div>} />
          </Route>
        </Route>
        
        {/* Protected Admin Routes (RBAC) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={['admin', 'super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<DashboardOverview />} />
          
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />
          
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          
          <Route path="inventory" element={<InventoryList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="users" element={<UserList />} />

          {/* Marketing & Support */}
          <Route path="marketing/coupons" element={<CouponList />} />
          <Route path="marketing/coupons/new" element={<CouponForm />} />
          <Route path="marketing/coupons/edit/:id" element={<CouponForm />} />
          <Route path="marketing/newsletter" element={<NewsletterList />} />
          
          <Route path="support/reviews" element={<ReviewsList />} />
          <Route path="support/messages" element={<ContactSubmissions />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
