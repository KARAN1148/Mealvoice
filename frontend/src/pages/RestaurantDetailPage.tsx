import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, PhoneCall, Plus, Minus, ShoppingBag, Sparkles, Check } from 'lucide-react';
import { Restaurant, MenuItem } from '../types';
import { apiRequest } from '../api/client';
import { useCart } from '../context/CartContext';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart, cart, updateQuantity } = useCart();

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      try {
        const data = await apiRequest<Restaurant>(`/restaurants/${id}`);
        setRestaurant(data);
      } catch (err) {
        console.error('Failed to load restaurant details', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 font-bold">
        Loading restaurant menu...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-900 font-bold">
        Restaurant not found.
      </div>
    );
  }

  const getItemQuantity = (itemId: string) => {
    const item = cart.find((i) => i.menuItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const categories = restaurant.categories || [];
  const filteredCategories =
    selectedCategory === 'all'
      ? categories
      : categories.filter((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{restaurant.name}</h1>
              {restaurant.isVegOnly && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  Pure Veg
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-500 mt-1">{restaurant.cuisine}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold text-gray-700 mt-4">
              <span className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {restaurant.rating} ({restaurant.reviewCount} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-brand-600" />
                {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400" />
                {restaurant.address}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Call Action */}
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center w-full md:w-auto shrink-0">
          <span className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider">PREFER CALLING?</span>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5 mb-3">Order these items directly via phone agent</p>
          <a
            href="tel:1800-472-6326"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 1800-MEAL</span>
          </a>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All Items ({categories.reduce((acc, cat) => acc + cat.items.length, 0)})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.name} ({cat.items.length})
          </button>
        ))}
      </div>

      {/* Food Items Catalog */}
      <div className="space-y-10">
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 border-b-2 border-brand-500 pb-2 inline-block">
              {category.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((item) => {
                const qty = getItemQuantity(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex justify-between gap-4 items-center"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg Icon Indicator */}
                        <span
                          className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-red-600'
                          }`}
                          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                        </span>
                        <h3 className="font-extrabold text-lg text-gray-900">{item.name}</h3>
                      </div>

                      <p className="text-xs text-gray-500 font-medium line-clamp-2">{item.description}</p>
                      <div className="text-lg font-black text-gray-900 pt-1">₹{item.price}</div>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-cover border border-gray-200"
                      />

                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-brand-600 text-white px-3 py-1.5 rounded-xl font-extrabold shadow">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="hover:scale-125 transition-transform"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm">{qty}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="hover:scale-125 transition-transform"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item, restaurant.id, restaurant.name)}
                          className="px-6 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-black text-xs border border-brand-300 shadow-sm flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
