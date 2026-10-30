import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Star, PhoneCall, Sparkles, Utensils, SlidersHorizontal, X, ChevronRight } from 'lucide-react';
import { Restaurant } from '../types';
import { apiRequest } from '../api/client';

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      <div className="flex justify-between mt-4">
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
      </div>
      <div className="h-10 bg-gray-100 rounded-2xl mt-2" />
    </div>
  </div>
);

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── Cuisine emoji map ─────────────────────────────────────────────────────────
const cuisineEmojis: Record<string, string> = {
  'All': '🍽️',
  'South Indian': '🥘',
  'Biryani': '🍛',
  'North Indian': '🫕',
  'Kerala': '🥥',
  'Indo-Chinese': '🥡',
  'Sweets & Desserts': '🧁',
  'Snacks': '🍟',
  'Pizza': '🍕',
  'Burgers': '🍔'
};

const cuisines = ['All', 'South Indian', 'Biryani', 'North Indian', 'Kerala', 'Indo-Chinese', 'Sweets & Desserts'];
const sortOptions = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Fastest Delivery', value: 'deliveryTime' },
  { label: 'Low Minimum Order', value: 'minOrder' }
];

export const RestaurantListPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 380);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      let query = `/restaurants?sortBy=${sortBy}&limit=18&search=${encodeURIComponent(debouncedSearch)}`;
      if (selectedCuisine !== 'All') query += `&cuisine=${encodeURIComponent(selectedCuisine)}`;
      if (isVegOnly) query += `&isVegOnly=true`;

      const data = await apiRequest<any>(query);
      // Handle both paginated response {restaurants:[]} and legacy array response
      if (Array.isArray(data)) {
        setRestaurants(data);
        setTotal(data.length);
      } else {
        setRestaurants(data.restaurants || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load restaurants', err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCuisine, isVegOnly, sortBy]);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  const hasActiveFilters = selectedCuisine !== 'All' || isVegOnly || sortBy !== 'rating';

  const clearFilters = () => {
    setSelectedCuisine('All');
    setIsVegOnly(false);
    setSortBy('rating');
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">MEALVOICE KITCHENS</span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Explore Local Restaurants</h1>
          <p className="text-slate-300 font-medium text-sm mt-1.5">
            Order online or call <strong className="text-emerald-400">1800-MEALVOICE</strong> — any phone, any time!
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/easy-order"
            className="px-4 py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-extrabold text-sm hover:bg-amber-300 transition flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Easy Order
          </Link>
          <a
            href="tel:18004726326"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-500 transition flex items-center gap-2 shadow-lg"
          >
            <PhoneCall className="w-4 h-4" />
            Call Now
          </a>
        </div>
      </div>

      {/* ── Search & Filter Bar ───────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-md border border-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-300 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-sm focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Veg toggle */}
          <button
            onClick={() => setIsVegOnly(v => !v)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 ${
              isVegOnly ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <span className="w-3 h-3 rounded-full border-2 border-current" style={{ backgroundColor: isVegOnly ? 'white' : '#16a34a' }} />
            Pure Veg
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Cuisine pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCuisine === c
                  ? 'bg-brand-600 text-white shadow-sm scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <span>{cuisineEmojis[c] || '🍴'}</span>
              {c}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="text-xs font-semibold text-gray-500">
            {total > 0 ? (
              <span>Showing <strong className="text-gray-900">{restaurants.length}</strong> of <strong className="text-gray-900">{total}</strong> restaurants</span>
            ) : (
              <span>No restaurants found</span>
            )}
            {debouncedSearch && <span> for "<em>{debouncedSearch}</em>"</span>}
          </div>
        )}
      </div>

      {/* ── Restaurant Grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
          <Utensils className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900">No restaurants match your search</h3>
          <p className="text-sm text-gray-500 mt-1.5">Try different filters or search for another cuisine.</p>
          <button
            onClick={clearFilters}
            className="mt-5 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image */}
              <div className="h-48 relative overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=500&q=80';
                  }}
                />
                {/* Overlays */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black text-gray-900 shadow flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {restaurant.rating}
                </div>
                {restaurant.isVegOnly && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                    🌱 Pure Veg
                  </div>
                )}
                {!restaurant.isOpen && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-black text-sm">Currently Closed</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-brand-600 transition-colors leading-tight">
                  {restaurant.name}
                </h3>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">{restaurant.cuisine}</p>

                <div className="flex items-center justify-between mt-3 text-xs font-bold text-gray-600 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    {restaurant.deliveryTime}
                  </span>
                  <span>Min ₹{restaurant.minOrder}</span>
                  <span>{restaurant.deliveryFee === 0 ? '🎉 Free Del.' : `₹${restaurant.deliveryFee} del.`}</span>
                </div>

                <Link
                  to={`/restaurant/${restaurant.id}`}
                  className="mt-4 w-full py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm text-center flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  View Menu
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantListPage;
