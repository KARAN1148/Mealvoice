import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, PhoneCall, MapPin, Store, CheckCircle2, MessageSquare } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Order } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import MockDeliveryMap from '../components/common/MockDeliveryMap';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      const data = await apiRequest<Order>(`/orders/${id}`);
      setOrder(data);

      const logs = await apiRequest<any[]>('/support/sms-logs');
      setSmsLogs(logs.filter((l) => l.orderNumber === data.orderNumber));
    } catch (err) {
      console.error('Failed to load order tracking info', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    const interval = setInterval(fetchOrderDetails, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500 font-bold">Loading live order tracking...</div>;
  }

  if (!order) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-900 font-bold">Order not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Order #{order.orderNumber}</h1>
            <StatusBadge source={order.source} />
          </div>
          <p className="text-xs font-bold text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <a
            href="tel:1800-472-6326"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Track via Call</span>
          </a>
        </div>
      </div>

      {/* Visual Status Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-md">
        <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2">Live Order Status Timeline</h3>
        <OrderStatusTimeline currentStatus={order.status} />
      </div>

      {/* Mock GPS Delivery Map */}
      <MockDeliveryMap
        restaurantName={order.restaurant?.name}
        customerAddress={order.deliveryAddress}
        riderName={order.delivery?.rider?.user?.name}
      />

      {/* Simulated Order Notification SMS Log Preview */}
      {smsLogs.length > 0 && (
        <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Simulated SMS Notification Log</span>
          </div>

          {smsLogs.map((sms, idx) => (
            <div key={idx} className="bg-emerald-900/80 p-3.5 rounded-xl border border-emerald-700 text-xs font-mono">
              <div className="text-emerald-300 font-bold">To: {sms.phoneNumber}</div>
              <div className="text-white mt-1">{sms.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Order Item Details */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
        <h3 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3">Ordered Items</h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm font-bold text-gray-800">
              <div>
                <span>{item.quantity}× {item.name}</span>
              </div>
              <div>₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-base font-black text-gray-900">
          <span>Total Amount ({order.paymentMethod})</span>
          <span className="text-brand-600">₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
