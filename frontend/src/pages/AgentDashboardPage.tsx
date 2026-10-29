import React, { useState, useEffect } from 'react';
import { PhoneCall, UserCheck, Plus, History, CheckCircle2, RotateCcw, Search, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Restaurant, MenuItem, Order } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import { useDemoMode } from '../context/DemoModeContext';
import IncomingCallModal from '../components/callCenter/IncomingCallModal';

export const AgentDashboardPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [callOrders, setCallOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for New Phone Order
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('Ramesh Kumar');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState('42, 4th Cross, Indiranagar, Bengaluru');
  const [landmark, setLandmark] = useState('Near BDA Complex');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOCK_UPI' | 'MOCK_CARD'>('COD');
  const [orderSource, setOrderSource] = useState<'PHONE_CALL' | 'AGENT'>('PHONE_CALL');
  const [callNotes, setCallNotes] = useState('Customer called via 1800 number. Verified Indiranagar address.');

  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { triggerIncomingCall, showNotification } = useDemoMode();

  useEffect(() => {
    async function loadData() {
      try {
        const rests = await apiRequest<Restaurant[]>('/restaurants');
        setRestaurants(rests);
        if (rests.length > 0) {
          setSelectedRestaurantId(rests[0].id);
          setSelectedRestaurant(rests[0]);
          if (rests[0].categories && rests[0].categories[0]?.items[0]) {
            setSelectedItemId(rests[0].categories[0].items[0].id);
          }
        }

        const callData = await apiRequest<{ orders: Order[] }>('/call-orders');
        setCallOrders(callData.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRestaurantChange = (restId: string) => {
    setSelectedRestaurantId(restId);
    const rest = restaurants.find((r) => r.id === restId) || null;
    setSelectedRestaurant(rest);
    if (rest?.categories && rest.categories[0]?.items[0]) {
      setSelectedItemId(rest.categories[0].items[0].id);
    }
  };

  const handleCreatePhoneOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantId || !selectedItemId) {
      alert('Please select a restaurant and food item.');
      return;
    }

    setIsSubmitting(true);
    setCreatedOrderNumber(null);

    try {
      // First find or create customer profile by phone
      const custRes = await apiRequest<{ customer: any }>('/call-orders/customer', {
        method: 'POST',
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          street: deliveryAddress,
          landmark
        })
      });

      const customerId = custRes.customer.id;

      // Submit Call Order to central Order Engine
      const orderRes = await apiRequest<{ success: boolean; message: string; order: Order }>('/call-orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          restaurantId: selectedRestaurantId,
          items: [{ menuItemId: selectedItemId, quantity }],
          deliveryAddress,
          landmark,
          specialInstructions,
          paymentMethod,
          source: orderSource,
          callNotes,
          callDurationSeconds: 120
        })
      });

      setCreatedOrderNumber(orderRes.order.orderNumber);
      showNotification(`Phone Order ${orderRes.order.orderNumber} successfully created!`);
      setCallOrders((prev) => [orderRes.order, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Call order creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Call Center Header & Controls */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Call Center Agent Dashboard</h1>
              <p className="text-sm font-semibold text-slate-300">
                Agent: Priya Sharma (ID: AGT-808) | Status: <span className="text-emerald-400 font-extrabold">READY FOR CALLS</span>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => triggerIncomingCall()}
          className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl flex items-center gap-2"
        >
          <PhoneCall className="w-5 h-5 text-emerald-200" />
          <span>Receive Inbound Call</span>
        </button>
      </div>

      {/* Today's Call Center Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Today's Phone Orders</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{callOrders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Active Calls</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">1 Live</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Avg Call Duration</div>
          <div className="text-3xl font-black text-blue-600 mt-1">1m 45s</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Customer Satisfaction</div>
          <div className="text-3xl font-black text-amber-500 mt-1">98.4%</div>
        </div>
      </div>

      {/* Main Grid: Form + Live Phone Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* NEW PHONE ORDER FORM */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
          <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Plus className="w-6 h-6 text-brand-600" />
              <span>Create New Phone Order</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              UNIFIED ENGINE
            </span>
          </div>

          {createdOrderNumber && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 text-base font-black">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Order successfully created!</span>
              </div>
              <p className="text-sm font-extrabold">Generated Order ID: {createdOrderNumber}</p>
              <p className="text-xs font-semibold text-emerald-700">
                Order immediately dispatched to Restaurant Kitchen, Admin, and Rider dashboards. SMS confirmation sent!
              </p>
            </div>
          )}

          <form onSubmit={handleCreatePhoneOrder} className="space-y-4">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Delivery Address & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Restaurant & Food Items Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Select Restaurant</label>
                <select
                  value={selectedRestaurantId}
                  onChange={(e) => handleRestaurantChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-brand-500"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Select Food Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold focus:ring-2 focus:ring-brand-500"
                >
                  {selectedRestaurant?.categories?.flatMap((c) => c.items).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ₹{item.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-black focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Order Source</label>
                <select
                  value={orderSource}
                  onChange={(e) => setOrderSource(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-xs"
                >
                  <option value="PHONE_CALL">PHONE_CALL (Inbound)</option>
                  <option value="AGENT">AGENT (Outbound / Help)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-xs"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="UPI">Direct UPI Payment Link</option>
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase mb-1">Call Notes / Instructions</label>
              <input
                type="text"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{isSubmitting ? 'Submitting Call Order...' : 'Submit Phone Order & Dispatch'}</span>
            </button>
          </form>
        </div>

        {/* RECENT PHONE ORDERS TABLE */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            <span>Recent Phone Orders</span>
            <span className="text-xs font-bold text-gray-500">Live Stream</span>
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {callOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-brand-500 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-900">{ord.orderNumber}</span>
                  <StatusBadge source={ord.source} />
                </div>

                <div className="text-xs font-bold text-gray-700">
                  Customer: {ord.customer?.user?.name || 'Phone Caller'} ({ord.customer?.user?.phone})
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {ord.restaurant?.name} • ₹{ord.totalAmount}
                </div>

                <div className="flex items-center justify-between pt-2 text-xs border-t border-gray-200">
                  <StatusBadge status={ord.status} />
                  <span className="text-gray-400 font-semibold">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Incoming Call Overlay Modal */}
      <IncomingCallModal
        onSelectCustomerForOrder={(cust) => {
          setCustomerName(cust.name);
          setCustomerPhone(cust.phone);
          if (cust.addresses?.[0]) {
            setDeliveryAddress(cust.addresses[0].street);
          }
        }}
      />
    </div>
  );
};

export default AgentDashboardPage;
