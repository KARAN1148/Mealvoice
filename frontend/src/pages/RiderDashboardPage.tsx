import React, { useState, useEffect } from 'react';
import { Bike, Navigation, MapPin, CheckCircle2, DollarSign, Package, PhoneCall } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Delivery, Order, OrderStatus } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import MockDeliveryMap from '../components/common/MockDeliveryMap';
import { useDemoMode } from '../context/DemoModeContext';

export const RiderDashboardPage: React.FC = () => {
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [riderInfo, setRiderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { showNotification } = useDemoMode();

  const fetchRiderData = async () => {
    try {
      const data = await apiRequest<any>('/rider/deliveries');
      setActiveDeliveries(data.activeDeliveries || []);
      setCompletedDeliveries(data.completedDeliveries || []);
      setAvailableOrders(data.availableOrders || []);
      setRiderInfo(data.rider);
    } catch (err) {
      console.error('Failed to load rider deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderData();
    const timer = setInterval(fetchRiderData, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleAcceptDelivery = async (orderId: string) => {
    try {
      await apiRequest(`/rider/deliveries/${orderId}/accept`, { method: 'POST' });
      showNotification(`Accepted delivery for order ${orderId}`);
      fetchRiderData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await apiRequest(`/rider/deliveries/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      showNotification(`Status updated to ${status.replace(/_/g, ' ')}`);
      fetchRiderData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Rider Header */}
      <div className="bg-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-700 flex items-center justify-center text-white font-bold shrink-0">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">MealVoice Rider App</h1>
            <p className="text-sm font-semibold text-purple-200 mt-1">
              Rider: {riderInfo?.user?.name || 'Vikram Singh'} | Vehicle: {riderInfo?.vehicleNumber || 'KA-01-MV-2026'} (EV)
            </p>
          </div>
        </div>

        <div className="bg-purple-900/80 px-5 py-3 rounded-2xl border border-purple-700 text-center">
          <span className="text-xs text-purple-300 font-bold uppercase block">Today's Earnings</span>
          <span className="text-2xl font-black text-emerald-400">₹{riderInfo?.totalEarnings || 3450}</span>
        </div>
      </div>

      {/* Interactive Mock GPS Map */}
      <MockDeliveryMap
        restaurantName={activeDeliveries[0]?.order?.restaurant?.name}
        customerAddress={activeDeliveries[0]?.order?.deliveryAddress}
        riderName={riderInfo?.user?.name || 'Vikram Singh'}
      />

      {/* ACTIVE DELIVERY Lifecycle Card */}
      {activeDeliveries.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-500 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-600 animate-ping" />
              <h2 className="text-2xl font-black text-gray-900">Active Delivery Task</h2>
            </div>
            <StatusBadge status={activeDeliveries[0].order?.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup Info */}
            <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200">
              <span className="text-xs font-black uppercase text-sky-800 tracking-wider">PICKUP RESTAURANT</span>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                {activeDeliveries[0].order?.restaurant?.name}
              </h3>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {activeDeliveries[0].order?.restaurant?.address}
              </p>
            </div>

            {/* Dropoff Info */}
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">DELIVERY CUSTOMER</span>
              <h3 className="text-xl font-black text-gray-900 mt-1">
                {activeDeliveries[0].order?.customer?.user?.name || 'Phone Customer'}
              </h3>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {activeDeliveries[0].order?.deliveryAddress}
              </p>
              <div className="text-xs font-extrabold text-emerald-800 mt-2">
                Payment: {activeDeliveries[0].order?.paymentMethod} (Collect ₹{activeDeliveries[0].order?.totalAmount})
              </div>
            </div>
          </div>

          {/* Delivery Progression Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {(activeDeliveries[0].order?.status === 'ASSIGNED' ||
              activeDeliveries[0].order?.status === 'PENDING' ||
              activeDeliveries[0].order?.status === 'CONFIRMED' ||
              activeDeliveries[0].order?.status === 'PREPARING') && (
              <button
                onClick={() => handleUpdateStatus(activeDeliveries[0].order.id, 'RIDER_ACCEPTED')}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow transition-all"
              >
                [Accept & Assign Delivery]
              </button>
            )}

            {(activeDeliveries[0].order?.status === 'RIDER_ACCEPTED' ||
              activeDeliveries[0].order?.status === 'READY_FOR_PICKUP') && (
              <button
                onClick={() => handleUpdateStatus(activeDeliveries[0].order.id, 'AT_RESTAURANT')}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow transition-all"
              >
                [Arrived at Restaurant]
              </button>
            )}

            {activeDeliveries[0].order?.status === 'AT_RESTAURANT' && (
              <button
                onClick={() => handleUpdateStatus(activeDeliveries[0].order.id, 'PICKED_UP')}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow transition-all"
              >
                [Picked Up Food]
              </button>
            )}

            {activeDeliveries[0].order?.status === 'PICKED_UP' && (
              <button
                onClick={() => handleUpdateStatus(activeDeliveries[0].order.id, 'OUT_FOR_DELIVERY')}
                className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow transition-all"
              >
                [Start Delivery Drive]
              </button>
            )}

            {activeDeliveries[0].order?.status === 'OUT_FOR_DELIVERY' && (
              <button
                onClick={() => handleUpdateStatus(activeDeliveries[0].order.id, 'DELIVERED')}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-xl animate-pulse-glow transition-all"
              >
                [Mark Delivered & Collect Payment]
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Orders for Pickup */}
      {availableOrders.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="font-extrabold text-xl text-gray-900">Available Deliveries Needing Rider</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOrders.map((ord) => (
              <div key={ord.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                <div>
                  <div className="font-black text-gray-900">{ord.orderNumber}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{ord.restaurant?.name}</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">Earnings: ₹40</div>
                </div>
                <button
                  onClick={() => handleAcceptDelivery(ord.id)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow"
                >
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderDashboardPage;
