import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '../../../services/categoryService';

const CategoryForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories to populate the Parent Category dropdown
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response.success && response.data) {
          // Filter out the current category from the parent options if editing
          const options = isEditMode 
            ? response.data.filter(c => c._id !== id) 
            : response.data;
          setParentCategories(options);
        }
      } catch (err) {
        console.error('Failed to load parent categories:', err);
      }
    };

    fetchCategories();

    if (isEditMode) {
      const fetchCategoryDetails = async () => {
        try {
          const response = await categoryService.getCategoryById(id);
          if (response.success && response.data) {
            const cat = response.data;
            reset({
              name: cat.name,
              description: cat.description,
              parent: cat.parent?._id || '',
              isActive: cat.isActive
            });
          }
        } catch (err) {
          setError('Failed to load category details');
        }
      };
      fetchCategoryDetails();
    }
  }, [id, isEditMode, reset]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app with FormData for the image:
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.parent) formData.append('parent', data.parent);
      formData.append('isActive', data.isActive);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditMode) {
        await categoryService.updateCategory(id, formData);
        alert('Category updated successfully');
      } else {
        await categoryService.createCategory(formData);
        alert('Category created successfully');
      }
      
      navigate('/admin/categories');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textPrimary">
          {isEditMode ? 'Edit Category' : 'Add New Category'}
        </h1>
        <p className="text-textSecondary">
          {isEditMode ? 'Update existing category details.' : 'Create a new product category.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card-premium p-6 space-y-6">
          <h2 className="text-lg font-bold text-textPrimary border-b border-borderLight pb-4">Basic Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">Category Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows="3"
              className="input-field"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">Parent Category</label>
            <select
              {...register('parent')}
              className="input-field"
            >
              <option value="">None (Top Level Category)</option>
              {parentCategories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} (Level {cat.level})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-textSecondary">Leave empty if this is a top-level category.</p>
          </div>
        </div>

        <div className="card-premium p-6 space-y-6">
          <h2 className="text-lg font-bold text-textPrimary border-b border-borderLight pb-4">Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1.5">Category Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none px-1">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 2MB</p>
              </div>
            </div>
            {imageFile && (
              <p className="mt-2 text-sm text-green-600">Selected file: {imageFile.name}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              defaultChecked={true}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-textPrimary">
              Active (visible on storefront)
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/admin/categories')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary min-w-[120px]"
          >
            {isLoading ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
