import { useState } from 'react';
import api from '../services/api';

const NewsletterSubscribe = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Mock API request
      await new Promise(resolve => setTimeout(resolve, 800));
      // await api.post('/newsletter/subscribe', { email });
      
      setStatus({ type: 'success', message: 'Thanks for subscribing!' });
      setEmail('');
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to subscribe. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-textPrimary tracking-wider uppercase mb-4">
        Subscribe to our newsletter
      </h3>
      <p className="text-base text-textSecondary mb-4">
        The latest deals and news, sent to your inbox weekly.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 sm:flex sm:max-w-md">
        <label htmlFor="email-address" className="sr-only">Email address</label>
        <input
          type="email"
          name="email-address"
          id="email-address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="appearance-none min-w-0 w-full bg-white border border-borderLight rounded-md shadow-sm py-2 px-4 text-base text-textPrimary placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your email"
        />
        <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-2 px-4 flex items-center justify-center"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
      {status.message && (
        <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </p>
      )}
    </div>
  );
};

export default NewsletterSubscribe;
