import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      price: 120.00,
      stock: 100,
      status: 'active',
      league_or_type: 'Club',
      isVintage: false,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [primaryImagePublicId, setPrimaryImagePublicId] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      try {
        setIsFetchingData(true);
        // Fetch categories first
        const catRes = await categoryService.getAllCategories();
        let loadedCats = [];
        if (catRes.success && catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
          loadedCats = catRes.data;
        }

        // If in Edit Mode, fetch existing product details and pre-populate the form
        if (isEditMode) {
          const productRes = await productService.getProductById(id);
          const p = productRes.data || productRes;
          if (p) {
            setValue('name', p.name || '');
            setValue('description', p.description || '');
            setValue('price', p.price || 120.00);
            setValue('team', p.team || '');
            setValue('season', p.season || '');
            setValue('league', p.league || '');
            setValue('league_or_type', p.league_or_type || 'Club');
            setValue('isVintage', p.isVintage || false);
            setValue('status', p.status || 'active');
            
            if (p.variants && p.variants.length > 0) {
              const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
              setValue('stock', totalStock);
            }
            
            if (p.category) {
              const catId = typeof p.category === 'object' ? p.category._id : p.category;
              setValue('category', catId);
            }

            if (p.images && p.images.length > 0) {
              setExistingImages(p.images);
              const primary = p.images.find(img => img.isPrimary);
              if (primary) {
                setPrimaryImagePublicId(primary.public_id);
              }
            }
          }
        } else if (loadedCats.length > 0) {
          setValue('category', loadedCats[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories or product data', err);
        setError('Failed to load product details.');
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchCategoriesAndProduct();
  }, [id, isEditMode, setValue]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleDeleteExistingImage = (publicId) => {
    setExistingImages(prev => prev.filter(img => img.public_id !== publicId));
    setImagesToDelete(prev => [...prev, publicId]);
  };

  const handleSetPrimaryImage = (publicId) => {
    setPrimaryImagePublicId(publicId);
    setExistingImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.public_id === publicId
    })));
  };

  const getFullImageUrl = (imgObj) => {
    if (!imgObj) return 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
    let url = typeof imgObj === 'string' ? imgObj : (imgObj.url || '');
    if (!url) return 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
    if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price || 99.99);
      formData.append('stock', data.stock !== undefined ? data.stock : 100);
      formData.append('team', data.team || '');
      formData.append('league', data.league || '');
      formData.append('league_or_type', data.league_or_type || 'Club');
      formData.append('season', data.season || '');
      formData.append('isVintage', data.isVintage ? 'true' : 'false');
      formData.append('gender', 'unisex');
      formData.append('status', data.status || 'active');
      
      const selectedCategory = data.category || (categories[0]?._id) || 'Clubs';
      formData.append('category', selectedCategory);

      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      if (primaryImagePublicId) {
        formData.append('primaryImagePublicId', primaryImagePublicId);
      }

      // Append new files if uploaded
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (isEditMode) {
        await productService.updateProduct(id, formData);
        alert('Football Kit updated successfully!');
      } else {
        await productService.createProduct(formData);
        alert('Football Kit created successfully!');
      }
      
      navigate('/admin/products');
    } catch (err) {
      console.error('Product save error:', err.response?.data);
      const detailedErrors = err.response?.data?.errors;
      if (Array.isArray(detailedErrors) && detailedErrors.length > 0) {
        setError(detailedErrors.join(' | '));
      } else {
        setError(err.response?.data?.message || 'Validation failed. Please check all fields.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-[#F8FAFC]">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">
          {isEditMode ? 'Edit Football Kit' : 'Add New Football Kit / Product'}
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          {isEditMode 
            ? 'Modify existing details, remove old photos, set primary image, or upload replacement photos.'
            : 'List a new authentic or vintage shirt in False Nine.'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold shadow-sm">
          🚨 {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Kit Details Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Kit Details</h2>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Kit Name / Title *</label>
            <input
              type="text"
              {...register('name', { required: 'Kit name is required' })}
              className={`input-field text-sm font-medium ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g. Manchester City Home Shirt"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Description *</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows="4"
              className={`input-field text-sm font-medium ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Describe the kit fabric, sponsor emblems, player print details..."
            ></textarea>
            {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { required: 'Price is required' })}
                className="input-field text-sm font-medium"
                placeholder="120.00"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">Total Pieces / Stock *</label>
              <input
                type="number"
                min="0"
                {...register('stock', { required: 'Stock count is required', min: 0 })}
                className="input-field text-sm font-semibold"
                placeholder="100"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Total available pieces</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Team Name</label>
              <input
                type="text"
                {...register('team')}
                className="input-field text-sm font-medium"
                placeholder="e.g. Manchester City"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Season</label>
              <input
                type="text"
                {...register('season')}
                className="input-field text-sm font-medium"
                placeholder="e.g. 23/24 or 1998 Vintage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Category *</label>
              <select
                {...register('category')}
                className="input-field text-sm font-medium"
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Clubs">Clubs</option>
                    <option value="Nations">Nations</option>
                    <option value="Vintage Vault">Vintage Vault</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Type</label>
              <select {...register('league_or_type')} className="input-field text-sm font-medium">
                <option value="Club">Club</option>
                <option value="Nation">National Team</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">League</label>
              <select {...register('league')} className="input-field text-sm font-medium">
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Serie A">Serie A</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
            <input
              type="checkbox"
              id="isVintage"
              {...register('isVintage')}
              className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
            />
            <label htmlFor="isVintage" className="text-xs font-bold uppercase tracking-wider text-emerald-800 cursor-pointer">
              Mark as Rare Vintage Vault Grail
            </label>
          </div>
        </div>

        {/* Media & Status Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Kit Photos & Status</h2>

          {/* Display Current Images if in Edit Mode */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                Current Kit Photos (Click Delete to Remove, or Set Primary)
              </label>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((img, idx) => (
                  <div key={img.public_id || idx} className={`relative w-32 h-40 rounded-xl overflow-hidden border-2 bg-slate-50 group transition-all ${img.isPrimary || primaryImagePublicId === img.public_id ? 'border-blue-600 shadow-md' : 'border-slate-200'}`}>
                    <img 
                      src={getFullImageUrl(img)} 
                      alt={`Kit Photo ${idx}`} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
                      }}
                    />

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(img.public_id)}
                          className="bg-red-600/90 text-white rounded-full p-1 hover:bg-red-600 text-xs font-bold"
                          title="Delete Photo"
                        >
                          ✕
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(img.public_id)}
                        className={`text-[10px] font-bold py-1 px-2 rounded-md ${img.isPrimary || primaryImagePublicId === img.public_id ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 hover:bg-blue-600 hover:text-white'}`}
                      >
                        {img.isPrimary || primaryImagePublicId === img.public_id ? '★ PRIMARY' : 'SET PRIMARY'}
                      </button>
                    </div>

                    {(img.isPrimary || primaryImagePublicId === img.public_id) && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold tracking-wider">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {isEditMode ? 'Upload New Kit Photos (Replaces / Adds Photos)' : 'Upload Kit Photos (Front & Back)'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-200 border-dashed rounded-xl bg-blue-50/30 hover:bg-blue-50 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-xs text-slate-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-blue-600 hover:text-blue-700 px-1">
                    <span>{isEditMode ? 'Select New Photos to Upload' : 'Upload Kit Photos'}</span>
                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Newly uploaded photo becomes the Primary Kit Photo automatically!</p>
              </div>
            </div>
            {imageFiles.length > 0 && (
              <p className="mt-2 text-xs font-bold text-blue-600">✨ {imageFiles.length} new kit photo(s) selected.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Status</label>
            <select {...register('status')} className="input-field text-sm font-medium">
              <option value="active">Active (Visible in Store)</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/products')}
            className="btn-secondary text-xs px-6 py-3 font-bold"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary text-xs px-8 py-3 font-extrabold"
          >
            {isLoading 
              ? (isEditMode ? 'UPDATING KIT...' : 'SAVING KIT...') 
              : (isEditMode ? 'UPDATE FOOTBALL KIT' : 'SAVE FOOTBALL KIT')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
