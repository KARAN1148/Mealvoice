import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, MapPin, CheckCircle2, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { useDemoMode } from '../context/DemoModeContext';

export const CheckoutPage: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useDemoMode();
  const navigate = useNavigate();

  const [address, setAddress] = useState('42, 4th Cross, Indiranagar, Bengaluru');
  const [landmark, setLandmark] = useState('Near BDA Complex');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOCK_UPI' | 'MOCK_CARD'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let customerId = user?.roleProfileId;
      if (!customerId) {
        // Fallback or demo user customer ID lookup
        const profile = await apiRequest<any>('/customers/profile');
        customerId = profile.id;
      }

      const orderData = {
        customerId,
        restaurantId: cart[0].restaurantId,
        items: cart.map((i) => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
        deliveryAddress: address,
        landmark,
        specialInstructions,
        paymentMethod,
        source: 'ONLINE'
      };

      const res = await apiRequest<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      clearCart();
      showNotification(`Order ${res.orderNumber} confirmed! SMS notification sent.`);
      navigate(`/orders/${res.id}`);
    } catch (err: any) {
      alert(err.message || 'Order creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-black text-gray-900">Checkout & Payment</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Delivery Address</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Street Address</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Landmark / Gate Info</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cooking / Delivery Instructions</label>
              <input
                type="text"
                placeholder="e.g. Less spicy, leave at door"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900">Select Payment Method</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                { id: 'MOCK_UPI', label: 'Mock UPI / QR', icon: Smartphone },
                { id: 'MOCK_CARD', label: 'Mock Card', icon: CreditCard }
              ].map((m) => {
                const Icon = m.icon;
                const selected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-4 rounded-2xl border-2 font-extrabold text-xs flex flex-col items-center gap-2 transition-all ${
                      selected
                        ? 'border-brand-600 bg-brand-50 text-brand-900 shadow'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${selected ? 'text-brand-600' : 'text-gray-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total & Submit */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4 h-fit">
          <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-3">Final Total</h3>

          <div className="text-3xl font-black text-brand-600">₹{total}</div>
          <p className="text-xs font-semibold text-gray-500">Includes all taxes and delivery charges.</p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
          </button>

          <a
            href="tel:1800-472-6326"
            className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 block text-center"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 inline" />
            <span>[Call Instead]</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
