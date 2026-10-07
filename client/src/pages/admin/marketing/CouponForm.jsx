import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import couponService from '../../../services/couponService';

const CouponForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: '0',
    usageLimit: '',
    expiresAt: '',
    isActive: true
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await couponService.createCoupon({
        ...formData,
        value: Number(formData.value),
        minPurchase: Number(formData.minPurchase),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
      });
      alert('Coupon created successfully!');
      navigate('/admin/marketing/coupons');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create coupon');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textPrimary">Create Coupon</h1>
        <p className="text-textSecondary">Generate a new discount code for your customers.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card-premium p-6 space-y-6">
          <h2 className="text-lg font-bold text-textPrimary border-b border-borderLight pb-4">Coupon Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">Coupon Code *</label>
            <input
              type="text"
              name="code"
              required
              value={formData.code}
              onChange={handleChange}
              className="input-field uppercase"
              placeholder="e.g. SUMMER20"
            />
            <p className="mt-1 text-xs text-textSecondary">Customers will enter this code at checkout.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Discount Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">
                Discount Value *
              </label>
              <div className="relative">
                {formData.type === 'flat' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                )}
                <input
                  type="number"
                  name="value"
                  required
                  min="1"
                  value={formData.value}
                  onChange={handleChange}
                  className={`input-field ${formData.type === 'flat' ? 'pl-7' : ''} ${formData.type === 'percentage' ? 'pr-7' : ''}`}
                  placeholder="20"
                />
                {formData.type === 'percentage' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium p-6 space-y-6">
          <h2 className="text-lg font-bold text-textPrimary border-b border-borderLight pb-4">Usage Restrictions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Minimum Purchase Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="minPurchase"
                  min="0"
                  value={formData.minPurchase}
                  onChange={handleChange}
                  className="input-field pl-7"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1.5">Usage Limit</label>
              <input
                type="number"
                name="usageLimit"
                min="1"
                value={formData.usageLimit}
                onChange={handleChange}
                className="input-field"
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">Expiration Date *</label>
            <input
              type="date"
              name="expiresAt"
              required
              value={formData.expiresAt}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-textPrimary">
              Active (ready to use immediately)
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/marketing/coupons')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary min-w-[120px]"
          >
            {isLoading ? 'Saving...' : 'Save Coupon'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;
