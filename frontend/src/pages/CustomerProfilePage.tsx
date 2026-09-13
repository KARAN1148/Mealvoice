import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Phone, MapPin, History, RotateCcw, Plus, Heart } from 'lucide-react';
import { apiRequest } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import { useCart } from '../context/CartContext';

export const CustomerProfilePage: React.FC = () => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiRequest<any>('/customers/profile');
        setCustomer(data);
      } catch (err) {
        console.error('Failed to load customer profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleReorder = (order: any) => {
    clearCart();
    order.items?.forEach((item: any) => {
      addToCart(
        {
          id: item.menuItemId,
          restaurantId: order.restaurantId,
          categoryId: 'reorder',
          name: item.name,
          description: '',
          price: item.price,
          isVeg: true,
          isAvailable: true,
          imageUrl: order.restaurant?.imageUrl || ''
        },
        order.restaurantId,
        order.restaurant?.name || 'MealVoice Kitchen'
      );
    });
    navigate('/cart');
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 font-bold">Loading profile...</div>;
  }

  if (!customer) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-900 font-bold">Customer profile not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Customer Bio Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-600 text-white font-black text-3xl flex items-center justify-center shrink-0">
          {customer.user?.name ? customer.user.name[0] : 'C'}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{customer.user?.name}</h1>
          <p className="text-sm font-semibold text-gray-500 mt-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>{customer.user?.phone}</span> • <span>{customer.user?.email}</span>
          </p>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />
            <span>Saved Delivery Addresses</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customer.addresses?.map((addr: any) => (
            <div key={addr.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-xs font-black uppercase text-brand-600 px-2 py-0.5 rounded bg-brand-50 border border-brand-200 inline-block">
                {addr.label}
              </span>
              <p className="text-sm font-extrabold text-gray-900 mt-1">{addr.street}</p>
              {addr.landmark && <p className="text-xs text-gray-500 font-medium">Landmark: {addr.landmark}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
        <h3 className="font-extrabold text-xl text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <History className="w-6 h-6 text-brand-600" />
          <span>Past Order History</span>
        </h3>

        <div className="space-y-4">
          {customer.orders?.map((ord: any) => (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900">{ord.orderNumber}</span>
                  <StatusBadge source={ord.source} />
                  <StatusBadge status={ord.status} />
                </div>
                <div className="text-sm font-bold text-gray-800 mt-1">{ord.restaurant?.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {ord.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="font-black text-gray-900">₹{ord.totalAmount}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleReorder(ord)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center gap-1 shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>[Order Again]</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
