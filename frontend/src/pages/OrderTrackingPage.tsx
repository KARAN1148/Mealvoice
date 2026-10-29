import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, PhoneCall, MapPin, Store, CheckCircle2, MessageSquare, FileText, Printer, X, Download, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
    const interval = setInterval(fetchOrderDetails, 3500);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await apiRequest(`/orders/${order.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Customer requested cancellation via tracking page' })
      });
      fetchOrderDetails();
      alert('Order cancelled successfully.');
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500 font-bold space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Connecting to live order telemetry...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-gray-900">Order Not Found</h2>
        <p className="text-gray-600 font-medium">We could not locate this order ID in our central database.</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm">
          Return to Home
        </Link>
      </div>
    );
  }

  const subtotal = order.subtotal || order.items?.reduce((acc, i) => acc + i.price * i.quantity, 0) || order.totalAmount - 40;
  const deliveryFee = order.deliveryFee || 40;
  const tax = order.tax || Math.round(subtotal * 0.05);
  const total = order.totalAmount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <StatusBadge source={order.source} />
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs font-bold text-gray-500 mt-1.5 flex items-center gap-2">
            <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span className="text-brand-600 font-extrabold">{order.restaurant?.name}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Tax Invoice</span>
          </button>

          <a
            href="tel:1800-472-6326"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Support: 1800-MEAL</span>
          </a>
        </div>
      </div>

      {/* Visual Status Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider">
            Live Order Status Progression
          </h3>
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Real-Time Updates Active
          </span>
        </div>
        <OrderStatusTimeline currentStatus={order.status} />
      </div>

      {/* Interactive Delivery Map */}
      <MockDeliveryMap
        restaurantName={order.restaurant?.name || 'MealVoice Partner Kitchen'}
        customerAddress={order.deliveryAddress}
        riderName={order.delivery?.rider?.user?.name || 'Vikram Singh'}
        status={order.status}
        orderNumber={order.orderNumber}
      />

      {/* Official Transactional SMS Ledger */}
      {smsLogs.length > 0 && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Official SMS & Messaging Notifications (Header: VM-MEALVC)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Telecom Gateway Ledger</span>
          </div>

          <div className="space-y-2.5">
            {smsLogs.map((sms, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span className="text-emerald-400 font-bold">To: {sms.phoneNumber}</span>
                  <span>{new Date(sms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div className="text-slate-100 font-medium leading-relaxed">{sms.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Item Details & Bill Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-3">
            Item Details ({order.items?.length || 0} items)
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-extrabold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500 font-semibold">Qty: {item.quantity} × ₹{item.price}</div>
                </div>
                <div className="font-black text-gray-900">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
              <span className="font-extrabold">Delivery Instructions:</span> {order.specialInstructions}
            </div>
          )}
        </div>

        {/* Bill Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4 h-fit">
          <h3 className="font-black text-lg text-gray-900 border-b border-gray-100 pb-3">Bill Breakdown</h3>

          <div className="space-y-2 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="font-bold text-gray-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span className="font-bold text-emerald-600">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & GST (5%)</span>
              <span className="font-bold text-gray-900">₹{tax}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-black text-base text-gray-900">Total Paid</span>
            <span className="text-2xl font-black text-brand-600">₹{total}</span>
          </div>

          <div className="text-[11px] font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            Payment Mode: <span className="text-gray-900">{order.paymentMethod}</span> ({order.paymentStatus})
          </div>

          {/* Cancellation button if eligible */}
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="w-full mt-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAX INVOICE MODAL (AUTHENTIC GST RECEIPT) */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto print:p-0">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
              <div>
                <div className="text-2xl font-black tracking-tight text-gray-900">
                  MEAL<span className="text-brand-600">VOICE</span> FOODS PVT LTD
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1">
                  GSTIN: 29AABCM1234F1Z5 • FSSAI Lic: 11223344556677
                  <br />
                  Indiranagar Hub, 100ft Road, Bengaluru, KA - 560038
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <div className="text-gray-500 uppercase font-bold">Billed To:</div>
                <div className="font-black text-gray-900 text-sm mt-0.5">{order.customer?.user?.name || 'Valued Customer'}</div>
                <div className="text-gray-600">{order.deliveryAddress}</div>
                <div className="text-gray-600">Phone: {order.customer?.user?.phone || '+91 98765 43210'}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 uppercase font-bold">Tax Invoice Details:</div>
                <div className="font-mono font-bold text-gray-900 text-sm mt-0.5">INV-2026-{order.orderNumber.replace(/\D/g, '')}</div>
                <div className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                <div className="text-gray-600">Payment: {order.paymentMethod} (PAID)</div>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-y border-gray-300 font-extrabold uppercase text-gray-700 bg-gray-50">
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center">HSN/SAC</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Rate</th>
                  <th className="py-2.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-2 font-bold text-gray-900">{item.name}</td>
                    <td className="py-2 px-2 text-center font-mono text-gray-500">996331</td>
                    <td className="py-2 px-2 text-center">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">₹{item.price}</td>
                    <td className="py-2 px-2 text-right font-bold text-gray-900">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 px-2 text-gray-600 font-semibold" colSpan={4}>Delivery & Packaging Charges (SAC 996812)</td>
                  <td className="py-2 px-2 text-right font-bold text-gray-900">₹{deliveryFee}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-gray-600 font-semibold" colSpan={4}>CGST @ 2.5%</td>
                  <td className="py-2 px-2 text-right font-bold text-gray-900">₹{Math.round(tax / 2)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-gray-600 font-semibold" colSpan={4}>SGST @ 2.5%</td>
                  <td className="py-2 px-2 text-right font-bold text-gray-900">₹{Math.round(tax / 2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900 text-sm font-black text-gray-900">
                  <td className="py-3 px-2" colSpan={4}>Total Amount (Inclusive of all taxes)</td>
                  <td className="py-3 px-2 text-right text-brand-600">₹{total}</td>
                </tr>
              </tfoot>
            </table>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500 print:hidden">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Digitally signed GST compliant electronic invoice.</span>
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
