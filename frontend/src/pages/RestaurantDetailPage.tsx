import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Clock, MapPin, PhoneCall, Plus, Minus, ShoppingBag,
  Sparkles, ChevronRight, Info, Leaf, AlertCircle
} from 'lucide-react';
import { Restaurant } from '../types';
import { apiRequest } from '../api/client';
import { useCart } from '../context/CartContext';

// ── Skeleton loader ───────────────────────────────────────────────────────────
const DetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
    <div className="bg-white rounded-3xl p-8 shadow border border-gray-200 flex gap-6">
      <div className="w-36 h-36 rounded-2xl bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-200 rounded-full w-2/3" />
        <div className="h-4 bg-gray-100 rounded-full w-1/3" />
        <div className="h-4 bg-gray-100 rounded-full w-1/2 mt-4" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(n => (
        <div key={n} className="bg-white h-28 rounded-2xl border border-gray-200 shadow-sm" />
      ))}
    </div>
  </div>
);

// ── Item card ─────────────────────────────────────────────────────────────────
interface ItemCardProps {
  item: any;
  restaurantId: string;
  restaurantName: string;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, qty, onAdd, onInc, onDec }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex justify-between gap-4 items-center group">
    <div className="flex-1 min-w-0 space-y-1">
      {/* Veg / Non-veg dot indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}
          title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        >
          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
        </span>
        <h3 className="font-extrabold text-base text-gray-900 truncate">{item.name}</h3>
        {item.isBestseller && (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-300 shrink-0">
            🏆 Bestseller
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
      <div className="text-base font-black text-gray-900">₹{item.price}</div>
    </div>

    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
          }}
        />
      </div>

      {qty > 0 ? (
        <div className="flex items-center gap-2 bg-brand-600 text-white px-3 py-1.5 rounded-xl font-extrabold shadow text-sm">
          <button onClick={onDec} className="hover:scale-125 transition-transform" aria-label="Decrease quantity">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-5 text-center">{qty}</span>
          <button onClick={onInc} className="hover:scale-125 transition-transform" aria-label="Increase quantity">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="px-5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-black text-xs border border-brand-300 shadow-sm flex items-center gap-1 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          ADD
        </button>
      )}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart, cart, updateQuantity, itemCount, total } = useCart();
  const navigate = useNavigate();
  const categoryTabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await apiRequest<Restaurant>(`/restaurants/${id}`);
        setRestaurant(data);
      } catch (err) {
        console.error('Failed to load restaurant', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!restaurant) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-gray-900">Restaurant not found</h2>
      <Link to="/restaurants" className="mt-4 inline-block text-brand-600 font-bold hover:underline">← Browse all restaurants</Link>
    </div>
  );

  const getItemQty = (itemId: string) => cart.find(i => i.menuItem.id === itemId)?.quantity || 0;
  const categories = restaurant.categories || [];
  const filteredCategories = selectedCategory === 'all' ? categories : categories.filter(c => c.id === selectedCategory);
  const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-32">

      {/* ── Restaurant Header ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-md shrink-0 border border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=300&q=80';
            }}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{restaurant.name}</h1>
              {restaurant.isVegOnly && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" /> Pure Veg
                </span>
              )}
              {!restaurant.isOpen && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-300">
                  Closed
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-500 mt-0.5">{restaurant.cuisine}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold text-gray-700 mt-3">
              <span className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {restaurant.rating} ({restaurant.reviewCount} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1 text-gray-500 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {restaurant.address}
              </span>
            </div>

            {/* FSSAI badge */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              FSSAI Licensed · GST Compliant
            </div>
          </div>
        </div>

        {/* Call-to-order panel */}
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center shrink-0 w-full md:w-auto">
          <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">PREFER CALLING?</span>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5 mb-3">Order from this menu by phone</p>
          <a
            href="tel:18004726326"
            className="w-full py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Call 1800-MEAL
          </a>
        </div>
      </div>

      {/* ── Category Tabs ──────────────────────────────────────────────────── */}
      <div ref={categoryTabsRef} className="sticky top-20 z-30 bg-white/95 backdrop-blur border-b border-gray-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-7xl mx-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            All ({totalItems})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {cat.name} ({cat.items.length})
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu Items ─────────────────────────────────────────────────────── */}
      <div className="space-y-10">
        {filteredCategories.map((category) => (
          <div key={category.id} id={`cat-${category.id}`} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-gray-900">{category.name}</h2>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400">{category.items.length} items</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item: any) => {
                const qty = getItemQty(item.id);
                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    qty={qty}
                    onAdd={() => addToCart(item, restaurant.id, restaurant.name)}
                    onInc={() => updateQuantity(item.id, 1)}
                    onDec={() => updateQuantity(item.id, -1)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sticky Add-to-Cart Footer ──────────────────────────────────────── */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:pb-6">
          <div className="max-w-2xl mx-auto bg-brand-600 text-white rounded-2xl shadow-2xl flex items-center justify-between px-5 py-4 border border-brand-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-sm">
                {itemCount}
              </div>
              <div>
                <div className="text-xs font-bold opacity-80">{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</div>
                <div className="text-lg font-black leading-tight">₹{total}</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 bg-white text-brand-600 font-extrabold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              View Cart
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
