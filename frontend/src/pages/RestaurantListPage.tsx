import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Star, PhoneCall, Sparkles, Utensils } from 'lucide-react';
import { Restaurant } from '../types';
import { apiRequest } from '../api/client';

export const RestaurantListPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [isVegOnly, setIsVegOnly] = useState(false);

  useEffect(() => {
    async function loadRestaurants() {
      setLoading(true);
      try {
        let query = `/restaurants?search=${encodeURIComponent(search)}`;
        if (selectedCuisine !== 'All') query += `&cuisine=${encodeURIComponent(selectedCuisine)}`;
        if (isVegOnly) query += `&isVegOnly=true`;

        const data = await apiRequest<Restaurant[]>(query);
        setRestaurants(data);
      } catch (err) {
        console.error('Failed to load restaurants', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestaurants();
  }, [search, selectedCuisine, isVegOnly]);

  const cuisines = ['All', 'South Indian', 'Biryani', 'North Indian', 'Kerala', 'Indo-Chinese', 'Sweets & Desserts'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">MEALVOICE KITCHENS</span>
          <h1 className="text-3xl sm:text-4xl font-black mt-1">Explore Local Restaurants</h1>
          <p className="text-slate-300 font-medium text-sm mt-2">
            Order online or simply call <strong className="text-emerald-400">1800-MEALVOICE</strong> to order any menu item directly!
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/easy-order"
            className="px-5 py-3 rounded-2xl bg-amber-400 text-amber-950 font-extrabold text-sm hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>Switch to Easy Order</span>
          </Link>
          <a
            href="tel:1800-472-6326"
            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-lg"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call to Order</span>
          </a>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by restaurant name or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`px-4 py-3 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shrink-0 ${
              isVegOnly
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <span className="w-3 h-3 rounded-full border-2 border-emerald-600 bg-emerald-600" />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Cuisine Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-extrabold text-gray-500 uppercase mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Cuisine:
          </span>
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCuisine === c
                  ? 'bg-brand-600 text-white shadow-sm scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-72 animate-pulse border border-gray-200 p-4" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
          <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900">No restaurants match your search</h3>
          <p className="text-sm text-gray-500 mt-1">Try clearing your filters or search for another dish.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-gray-900 shadow flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{restaurant.rating}</span>
                  </div>

                  {restaurant.isVegOnly && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                      Pure Veg
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-brand-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 mt-1">{restaurant.cuisine}</p>

                  <div className="flex items-center justify-between mt-4 text-xs font-bold text-gray-700 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {restaurant.deliveryTime}
                    </span>
                    <span>Min: ₹{restaurant.minOrder}</span>
                    <span>Fee: ₹{restaurant.deliveryFee}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  to={`/restaurant/${restaurant.id}`}
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm text-center block shadow-md transition-colors"
                >
                  View Menu & Items
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
