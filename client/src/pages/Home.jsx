import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const vintageKits = items.filter(item => item.isVintage);
  const featuredKits = items.filter(item => item.isFeatured);

  return (
    <div className="space-y-16 pb-20 bg-[#F8FAFC]">
      <SEO title="Authentic Football Kits & Vintage Vault" />

      {/* Modern Light Hero Section */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-[#F8FAFC] border-b border-slate-200/80">
        
        {/* Soft Background Accent */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 filter brightness-110 contrast-125 scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1920&auto=format&fit=crop')` 
          }}
        />

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 py-16">
          
          {/* Monogram Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-blue-200 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              OFFICIAL FOOTBALL MERCHANDISE & KITS
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
            CULTURE. PASSION. <br />
            <span className="text-blue-600">AUTHENTIC KITS.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-600 font-normal leading-relaxed">
            The ultimate destination for football fans. Discover authentic matchday shirts, rare retro vintage grails, and modern club armor.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="btn-primary text-sm px-8 py-4 w-full sm:w-auto shadow-md">
              EXPLORE ALL KITS
            </Link>
            <Link to="/shop?isVintage=true" className="btn-secondary text-sm px-8 py-4 w-full sm:w-auto">
              VINTAGE VAULT
            </Link>
          </div>

          {/* Feature Pillars */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center border-t border-slate-200">
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="text-blue-600 font-extrabold text-base">100% AUTHENTIC</div>
              <div className="text-xs text-slate-500 font-medium">Licensed Apparel</div>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="text-emerald-600 font-extrabold text-base">RARE GRAILS</div>
              <div className="text-xs text-slate-500 font-medium">Retro & Vintage Vault</div>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="text-blue-600 font-extrabold text-base">EXPRESS SHIP</div>
              <div className="text-xs text-slate-500 font-medium">Worldwide Dispatch</div>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 shadow-sm">
              <div className="text-emerald-600 font-extrabold text-base">FAN SERVICE</div>
              <div className="text-xs text-slate-500 font-medium">24/7 Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Category Vault Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">THE REPOSITORY</span>
            <h2 className="text-3xl font-extrabold uppercase text-slate-900 mt-1">CURATED COLLECTIONS</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1">
            VIEW ALL CATEGORIES &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Club Banners */}
          <Link to="/shop?league_or_type=Club" className="group relative h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <img 
              src="/images/club_shirts.png" 
              alt="Club Shirts - European Elite Jerseys" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-blue-600 px-3 py-1 rounded-md">EUROPEAN ELITE</span>
              <h3 className="text-2xl font-extrabold text-white uppercase mt-2">CLUB SHIRTS</h3>
              <p className="text-xs text-slate-200 mt-1 font-medium">Real Madrid, Man City, Barca, Arsenal & more.</p>
            </div>
          </Link>

          {/* Vintage Vault Banner */}
          <Link to="/shop?isVintage=true" className="group relative h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <img 
              src="/images/vintage_vault.png" 
              alt="Vintage Vault - Historic Football Stories & Grails" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500 text-white px-3 py-1 rounded-md">LIMITED GRAILS</span>
              <h3 className="text-2xl font-extrabold text-white uppercase mt-2">VINTAGE VAULT</h3>
              <p className="text-xs text-slate-200 mt-1 font-medium">Retro classics & historic football stories.</p>
            </div>
          </Link>

          {/* National Teams Banner */}
          <Link to="/shop?league_or_type=Nation" className="group relative h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-xl transition-all duration-300">
            <img 
              src="https://xclusivejerseys.com/cdn/shop/files/Screenshot_2025-04-12_at_21.28.50-1.png?v=1782922369&width=1078" 
              alt="National Teams & Messi All Teams Special Edition" 
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-blue-600 px-3 py-1 rounded-md">WORLD CUP & SPECIAL EDITION</span>
              <h3 className="text-2xl font-extrabold text-white uppercase mt-2">NATIONAL TEAMS</h3>
              <p className="text-xs text-slate-200 mt-1 font-medium">Argentina, Brazil, France, England & Messi Special Editions.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Matchday Kits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">MATCHDAY SELECTION</span>
            <h2 className="text-3xl font-extrabold uppercase text-slate-900 mt-1">FEATURED KITS</h2>
          </div>
          <Link to="/shop" className="btn-secondary text-xs px-4 py-2">
            EXPLORE ALL KITS
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(featuredKits.length > 0 ? featuredKits : items).slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-12">No kits available at the moment.</p>
        )}
      </section>
    </div>
  );
};

export default Home;
