import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle2, Clock, ChefHat, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Order, OrderStatus } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import { useDemoMode } from '../context/DemoModeContext';

export const RestaurantDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useDemoMode();

  const fetchOrders = async () => {
    try {
      const data = await apiRequest<Order[]>('/restaurants/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load restaurant orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await apiRequest<Order>(`/restaurants/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      showNotification(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const newOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY_FOR_PICKUP' || o.status === 'ASSIGNED');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center text-emerald-200 font-bold shrink-0">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Kitchen Order Management</h1>
            <p className="text-sm font-semibold text-emerald-200 mt-1">
              MealVoice Kitchen • Real-time order stream across App, Call Center & Easy Mode
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Live Orders</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">New Orders</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{newOrders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Preparing</div>
          <div className="text-3xl font-black text-brand-600 mt-1">{preparingOrders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Ready for Pickup</div>
          <div className="text-3xl font-black text-indigo-600 mt-1">{readyOrders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase">Completed</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{completedOrders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs font-bold text-gray-500 uppercase">Today's Revenue</div>
          <div className="text-3xl font-black text-gray-900 mt-1">₹{totalRevenue}</div>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-black text-xl text-gray-900">Live Orders Stream</h3>
          <span className="text-xs font-bold text-gray-500">Auto-updating every 4s</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 font-bold">Loading live kitchen stream...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-extrabold uppercase text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Order Source</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Food Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-semibold">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-black text-gray-900">{ord.orderNumber}</td>
                    <td className="p-4">
                      <StatusBadge source={ord.source} />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{ord.customer?.user?.name || 'Customer'}</div>
                      <div className="text-xs text-gray-500">{ord.customer?.user?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-1">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="font-bold text-gray-800">
                            {item.quantity}× {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-black text-gray-900">₹{ord.totalAmount}</td>
                    <td className="p-4">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {ord.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow transition-all"
                          >
                            Accept Order
                          </button>
                        )}

                        {(ord.status === 'CONFIRMED' || ord.status === 'PENDING') && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs shadow transition-all"
                          >
                            Start Preparing
                          </button>
                        )}

                        {(ord.status === 'PREPARING' || ord.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, 'READY_FOR_PICKUP')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition-all"
                          >
                            Mark Ready
                          </button>
                        )}

                        {(ord.status === 'READY_FOR_PICKUP' || ord.status === 'ASSIGNED' || ord.status === 'RIDER_ACCEPTED' || ord.status === 'AT_RESTAURANT') && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Rider Assigned / In Progress
                          </span>
                        )}

                        {ord.status === 'DELIVERED' && (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
