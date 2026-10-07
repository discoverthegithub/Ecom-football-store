import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../../features/products/productSlice';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const getFullImageUrl = (product) => {
    const primaryImgObj = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const url = product.kitImages?.front || primaryImgObj?.url;
    if (!url) return 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="bg-[#F8FAFC]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">Products & Kits</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">Manage False Nine inventory, kit photos, and prices.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-xs px-6 py-2.5">
          + Add New Kit
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kit Details</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category / Team</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium text-xs">
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium text-xs">
                    No products found. Add your first kit!
                  </td>
                </tr>
              ) : (
                items.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img 
                            className="h-full w-full object-cover" 
                            src={getFullImageUrl(product)} 
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500 font-mono font-medium">{product.season || product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-medium">
                      {product.team || product.category?.name || 'Club Kit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-extrabold">
                      ${product.price ? product.price.toFixed(2) : '120.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold tracking-wider uppercase rounded-full border ${
                        product.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {product.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-3">
                      <Link to={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-700 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
