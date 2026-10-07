import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

const ForgotPassword = () => {
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setStatus('loading');
    setMessage('');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, data);
      
      setStatus('success');
      setMessage(response.data.message || 'If an account exists with that email, a password reset link has been sent.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="card-premium w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">Forgot Password</h1>
          <p className="text-textSecondary">Enter your email to receive a reset link</p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-100">
              {message}
            </div>
            <Link to="/login" className="btn-primary w-full flex justify-center py-3 mt-4">
              Return to Login
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
              <label className="block text-sm font-medium text-textPrimary mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full mt-4 flex justify-center py-3"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="font-medium text-textSecondary hover:text-primary-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
