import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addLocalItem } from '../features/cart/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const getFullImageUrl = (img) => {
    if (!img) return null;
    let url = typeof img === 'string' ? img : img.url;
    if (!url) return null;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  // Prioritize primary image
  const primaryImgObj = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const secondaryImgObj = product.images?.find(img => img.url !== primaryImgObj?.url) || product.images?.[1] || primaryImgObj;

  const frontImage = getFullImageUrl(primaryImgObj) || getFullImageUrl(product.kitImages?.front) || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
  const backImage = getFullImageUrl(secondaryImgObj) || getFullImageUrl(product.kitImages?.back) || frontImage;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variantId = product.variants && product.variants.length > 0 
      ? product.variants[0]._id 
      : null;

    if (isAuthenticated) {
      dispatch(addToCart({ productId: product._id, variantId, quantity: 1 }));
    } else {
      dispatch(addLocalItem({
        product: product,
        variantId,
        quantity: 1,
        price: product.price
      }));
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const rating = product.rating || 4.8;

  return (
    <Link to={`/product/${product.slug}`} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full relative">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-100 mb-4 group/image">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          {product.isVintage && (
            <span className="bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              VINTAGE VAULT
            </span>
          )}
          {product.season && (
            <span className="bg-white/90 text-blue-700 border border-blue-200 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
              {product.season}
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-colors ${
            isWishlisted 
              ? 'bg-red-50 text-red-500 border border-red-200' 
              : 'bg-white/80 text-slate-400 hover:text-red-500 border border-slate-200'
          }`}
          aria-label="Wishlist item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Front Product Image */}
        <img
          src={frontImage}
          alt={`${product.name} Front`}
          className="h-full w-full object-cover object-center transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
          }}
        />

        {/* Back Product Image (Revealed on Hover) */}
        <img
          src={backImage}
          alt={`${product.name} Back`}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800';
          }}
        />
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          <span>{product.team || product.league || 'Authentic Kit'}</span>
          <span className="text-blue-600 font-bold">{product.league_or_type}</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5 font-sans">
          {product.name}
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.064 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
              </svg>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">{rating}</span>
        </div>

        {/* Sizes Tag */}
        <div className="flex gap-1 mb-4">
          {(product.stock_sizes || ['S', 'M', 'L', 'XL']).slice(0, 4).map((size) => (
            <span key={size} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono font-medium">
              {size}
            </span>
          ))}
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-extrabold text-blue-600">${product.price.toFixed(2)}</span>
            {product.comparePrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-medium">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all"
            aria-label="Add kit to bag"
          >
            <span>Add to Cart</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
