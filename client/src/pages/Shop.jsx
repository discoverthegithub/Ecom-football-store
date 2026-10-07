import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, isLoading, error } = useSelector((state) => state.products);

  // Filters state
  const [selectedLeague, setSelectedLeague] = useState(searchParams.get('league') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('league_or_type') || '');
  const [selectedTeam, setSelectedTeam] = useState(searchParams.get('team') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [isVintageOnly, setIsVintageOnly] = useState(searchParams.get('isVintage') === 'true');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    // Sync state from URL params
    const league = searchParams.get('league') || '';
    const type = searchParams.get('league_or_type') || '';
    const team = searchParams.get('team') || '';
    const isVintage = searchParams.get('isVintage') === 'true';

    setSelectedLeague(league);
    setSelectedType(type);
    setSelectedTeam(team);
    setIsVintageOnly(isVintage);

    dispatch(fetchProducts({
      league,
      league_or_type: type,
      team,
      isVintage: isVintage ? 'true' : undefined,
      size: selectedSize || undefined,
      search: searchQuery || undefined,
    }));
  }, [dispatch, searchParams, selectedSize, searchQuery]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSelectedLeague('');
    setSelectedType('');
    setSelectedTeam('');
    setSelectedSize('');
    setIsVintageOnly(false);
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#F8FAFC]">
      <SEO title="Football Kit Collection | False Nine" />
      
      {/* Header Banner */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">THE ARMORY</span>
          <h1 className="text-4xl font-extrabold uppercase text-slate-900 mt-1">
            MATCHDAY & VINTAGE KITS
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Showing {items.length} authentic football kit grails
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search team, player, kit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2.5 text-xs font-medium"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-3 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filter Component */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6 sticky top-28">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">FILTER KITS</h3>
              {(selectedLeague || selectedType || selectedTeam || isVintageOnly || selectedSize || searchQuery) && (
                <button onClick={clearAllFilters} className="text-[11px] text-slate-500 hover:text-blue-600 font-bold uppercase transition-colors">
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Vintage Vault Toggle */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">VINTAGE VAULT</span>
                <span className="text-[10px] text-emerald-700 font-medium">Rare retro grails only</span>
              </div>
              <input 
                type="checkbox" 
                checked={isVintageOnly}
                onChange={(e) => {
                  setIsVintageOnly(e.target.checked);
                  handleFilterChange('isVintage', e.target.checked ? 'true' : '');
                }}
                className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* League Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">League / Competition</label>
              <select 
                value={selectedLeague}
                onChange={(e) => {
                  setSelectedLeague(e.target.value);
                  handleFilterChange('league', e.target.value);
                }}
                className="input-field text-xs py-2 font-medium"
              >
                <option value="">All Competitions</option>
                <option value="Premier League">Premier League</option>
                <option value="La Liga">La Liga</option>
                <option value="Serie A">Serie A</option>
                <option value="International">International (FIFA)</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const val = selectedType === 'Club' ? '' : 'Club';
                    setSelectedType(val);
                    handleFilterChange('league_or_type', val);
                  }}
                  className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all ${
                    selectedType === 'Club' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50/50 hover:border-blue-300'
                  }`}
                >
                  Clubs
                </button>
                <button
                  onClick={() => {
                    const val = selectedType === 'Nation' ? '' : 'Nation';
                    setSelectedType(val);
                    handleFilterChange('league_or_type', val);
                  }}
                  className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all ${
                    selectedType === 'Nation' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50/50 hover:border-blue-300'
                  }`}
                >
                  Nations
                </button>
              </div>
            </div>

            {/* Team Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">Featured Team</label>
              <select 
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  handleFilterChange('team', e.target.value);
                }}
                className="input-field text-xs py-2 font-medium"
              >
                <option value="">All Teams</option>
                <option value="Manchester City">Manchester City</option>
                <option value="Manchester United">Manchester United</option>
                <option value="Real Madrid">Real Madrid</option>
                <option value="FC Barcelona">FC Barcelona</option>
                <option value="Arsenal">Arsenal</option>
                <option value="Argentina">Argentina</option>
                <option value="Brazil">Brazil</option>
                <option value="France">France</option>
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">Stock Size</label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === size 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-600 shadow-sm">
              <p className="font-semibold">{error}</p>
              <button 
                onClick={() => dispatch(fetchProducts())}
                className="mt-4 btn-secondary text-xs px-4 py-2"
              >
                TRY AGAIN
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase mb-2">NO MATCHING KITS FOUND</h3>
              <p className="text-xs text-slate-500 mb-6">Try clearing your filters or searching for another club or player.</p>
              <button onClick={clearAllFilters} className="btn-primary text-xs px-6 py-2.5">
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
