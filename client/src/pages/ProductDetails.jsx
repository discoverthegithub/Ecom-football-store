import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug, clearCurrentProduct } from '../features/products/productSlice';
import { addToCart, addLocalItem } from '../features/cart/cartSlice';
import SEO from '../components/SEO';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, isLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Extract unique colors and sizes
  const uniqueColors = Array.from(
    new Map(
      (product?.variants || [])
        .filter(v => v.color && v.color.name)
        .map(v => [v.color.name, v.color])
    ).values()
  );
  
  const availableSizes = (product?.stock_sizes && product.stock_sizes.length > 0)
    ? product.stock_sizes
    : (product?.variants?.length > 0 
        ? Array.from(new Set(product.variants.filter(v => v.size).map(v => v.size)))
        : ['S', 'M', 'L', 'XL', 'XXL']);

  // Find exact variant if variants exist
  const selectedVariant = product?.variants?.find(
    (v) => 
      (selectedColor ? v.color?.name === selectedColor.name : true) && 
      (selectedSize ? v.size === selectedSize : true)
  ) || (product?.variants?.[0] || null);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  // Set default selections
  useEffect(() => {
    if (product) {
      if (uniqueColors.length > 0 && !selectedColor) setSelectedColor(uniqueColors[0]);
      if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
    }
  }, [product, uniqueColors, availableSizes, selectedColor, selectedSize]);

  const handleAddToCart = () => {
    if (!product) return;

    const variantId = selectedVariant?._id || null;

    if (isAuthenticated) {
      dispatch(addToCart({ 
        productId: product._id, 
        variantId, 
        quantity 
      }));
    } else {
      dispatch(addLocalItem({
        product: product,
        variantId,
        quantity,
        price: selectedVariant?.price || product.price || 120.00
      }));
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4 font-display uppercase text-red-400">Kit Not Found</h1>
        <p className="text-slate-400 mb-8">{error || "We couldn't find the kit you're looking for."}</p>
        <Link to="/shop" className="btn-primary text-xs px-6 py-3">Return to Armory</Link>
      </div>
    );
  }

  // Combine images array + kitImages (front, back, detail)
  const images = [];
  if (product.kitImages?.front) images.push({ url: product.kitImages.front });
  if (product.kitImages?.back) images.push({ url: product.kitImages.back });
  if (product.kitImages?.detail) images.push({ url: product.kitImages.detail });
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      if (!images.some(existing => existing.url === img.url)) {
        images.push(img);
      }
    });
  }
  if (images.length === 0) {
    images.push({ url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800' });
  }

  const primaryImageUrl = getFullImageUrl(images[activeImageIndex] || images[0]);
  const displayPrice = selectedVariant?.price || product.price || 120.00;
  const comparePrice = selectedVariant?.comparePrice || product.comparePrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={`${product.name} | False Nine`} 
        description={product.shortDescription || product.description?.substring(0, 160)} 
        image={primaryImageUrl} 
      />

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0 pb-2 lg:pb-0 hide-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-24 w-24 lg:w-full flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border-2 ${activeImageIndex === idx ? 'border-blue-600 shadow-md scale-105' : 'border-slate-200 hover:border-blue-300'} transition-all`}
                >
                  <img 
                    src={getFullImageUrl(img)} 
                    alt={`Thumbnail ${idx}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Main Image Container */}
          <div className="w-full bg-white rounded-2xl overflow-hidden aspect-[4/5] shadow-sm border border-slate-200 relative group">
            {product.isVintage && (
              <span className="absolute top-4 left-4 z-20 bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-md shadow-md">
                VINTAGE VAULT GRAIL
              </span>
            )}
            <img 
              src={primaryImageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
              }}
            />
          </div>
        </div>

        {/* Product Details & Purchase Area */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0 space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              <span>{product.team || product.league || 'Authentic Kit'}</span>
              <span>•</span>
              <span>{product.season || 'Matchday Edition'}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold uppercase text-slate-900 tracking-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-blue-600">${Number(displayPrice).toFixed(2)}</span>
            {comparePrice > displayPrice && (
              <span className="text-base text-slate-400 line-through font-medium">${Number(comparePrice).toFixed(2)}</span>
            )}
          </div>

          <div className="prose text-xs text-slate-600 leading-relaxed border-t border-b border-slate-200 py-4">
            <p>{product.description}</p>
          </div>

          {/* Size Options Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">SELECT FIT SIZE</span>
              <span className="text-[11px] text-blue-600 font-semibold">True to Matchday Fit</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[3.5rem] py-2.5 px-4 rounded-xl text-xs font-bold uppercase border text-center transition-all ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Bag Area */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {/* Quantity Controls */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-white w-full sm:w-36 justify-between px-3 shadow-sm">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="py-3 text-slate-500 hover:text-blue-600 text-lg font-bold transition-colors px-2"
              >-</button>
              <span className="text-sm font-bold text-slate-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="py-3 text-slate-500 hover:text-blue-600 text-lg font-bold transition-colors px-2"
              >+</button>
            </div>
            
            {/* Add to Bag Button */}
            <button 
              onClick={handleAddToCart}
              className="btn-primary flex-1 py-4 text-xs font-extrabold uppercase tracking-widest flex justify-center items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span>ADD TO BAG (${(displayPrice * quantity).toFixed(2)})</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>100% Authentic Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Free Global Express Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
