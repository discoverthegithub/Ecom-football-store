import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  // Try to get token from URL params (e.g., /reset-password/:token) or search params (?token=...)
  // Since we'll define it as /reset-password/:token in App.jsx, useParams is primary, but we'll check search as fallback
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const searchToken = searchParams.get('token');
  
  const token = paramToken || searchToken;

  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing password reset token.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password/${token}`, {
        password: data.password
      });
      
      setStatus('success');
      setMessage(response.data.message || 'Your password has been successfully reset!');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card-premium w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Set New Password</h1>
          <p className="text-textSecondary">Please enter your new password below</p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 flex flex-col items-center">
              <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {message}
            </div>
            <Link to="/login" className="btn-primary w-full flex justify-center py-3 mt-4">
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {status === 'error' && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={!token || status === 'error'}
                className={`input-field ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={!token || status === 'error'}
                className={`input-field ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !token || status === 'error'}
              className="btn-primary w-full mt-4 flex justify-center py-3"
            >
              {status === 'loading' ? 'Resetting Password...' : 'Reset Password'}
            </button>
            
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="font-medium text-textSecondary hover:text-primary-600 transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
