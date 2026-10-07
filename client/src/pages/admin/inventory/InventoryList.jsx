import { useState, useEffect } from 'react';
import productService from '../../../services/productService';

const InventoryList = () => {
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProducts({ limit: 100 });
      if (response.success && response.data) {
        const products = response.data.products || response.data;
        let allVariants = [];
        products.forEach(p => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach(v => {
              allVariants.push({
                ...v,
                product: {
                  _id: p._id,
                  name: p.name,
                  images: p.images,
                  price: p.price
                }
              });
            });
          }
        });
        setVariants(allVariants);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenUpdateModal = (variant) => {
    setSelectedVariant(variant);
    setNewStock(variant.stock);
  };

  const handleSaveStock = async () => {
    if (!selectedVariant) return;
    try {
      setIsUpdating(true);
      await productService.updateVariant(selectedVariant._id, { stock: Number(newStock) });
      setVariants(prev => prev.map(v => v._id === selectedVariant._id ? { ...v, stock: Number(newStock) } : v));
      setSelectedVariant(null);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Failed to update stock level. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredVariants = variants.filter(v => 
    v.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.size?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItemsCount = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const lowStockCount = variants.filter(v => v.stock > 0 && v.stock <= 10).length;
  const outOfStockCount = variants.filter(v => v.stock === 0).length;

  return (
    <div className="bg-[#F8FAFC]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Track and manage piece counts for all football kits in your store database.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Inventory Pieces</h3>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{totalItemsCount} <span className="text-xs font-normal text-slate-500">units</span></p>
        </div>
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Low Stock Items (&le;10)</h3>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{lowStockCount}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">Out of Stock Variants</h3>
          <p className="text-3xl font-extrabold text-red-600 mt-2">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter inventory by kit name, SKU, or size..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-md text-xs font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product Kit</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Size / Edition</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Stock Pieces</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                    Loading inventory records...
                  </td>
                </tr>
              ) : filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">
                    No inventory records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((variant) => (
                  <tr key={variant._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {variant.product.images && variant.product.images.length > 0 && (
                          <img 
                            src={variant.product.images[0].url} 
                            alt={variant.product.name} 
                            className="w-10 h-12 object-cover rounded-lg border border-slate-200"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800'; }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900">{variant.product.name}</div>
                          <div className="text-[11px] font-medium text-slate-500">${variant.product.price}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-blue-600">
                      {variant.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                      <span className="font-bold text-slate-900">Size {variant.size}</span>
                      {variant.color?.name && <span className="block text-[10px] text-slate-500">{variant.color.name}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          variant.stock > 15 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                          variant.stock > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {variant.stock} pieces in stock
                        </span>
                        {variant.stock <= 10 && variant.stock > 0 && (
                          <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wider animate-pulse">Low Stock</span>
                        )}
                        {variant.stock === 0 && (
                          <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenUpdateModal(variant)} 
                        className="btn-primary text-xs px-3.5 py-1.5"
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Update Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
                Update Stock Quantity
              </h3>
              <button onClick={() => setSelectedVariant(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 rounded-lg">✕</button>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold text-blue-600">{selectedVariant.product?.name}</p>
              <p className="text-xs text-slate-600">
                Size: <strong className="text-slate-900">{selectedVariant.size}</strong> | SKU: <code className="text-blue-600 font-mono font-bold">{selectedVariant.sku}</code>
              </p>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Total Pieces
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="input-field text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedVariant(null)} 
                className="btn-secondary text-xs px-4 py-2 font-bold"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStock} 
                className="btn-primary text-xs px-6 py-2 font-extrabold"
                disabled={isUpdating}
              >
                {isUpdating ? 'SAVING...' : 'SAVE STOCK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
