import React from 'react';
import { OrderSource, OrderStatus } from '../../types';
import { PhoneCall, Globe, Sparkles, UserCheck } from 'lucide-react';

interface StatusBadgeProps {
  status?: OrderStatus;
  source?: OrderSource;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, source }) => {
  if (source) {
    switch (source) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Globe className="w-3.5 h-3.5" />
            <span>ONLINE</span>
          </span>
        );
      case 'PHONE_CALL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 animate-pulse">
            <PhoneCall className="w-3.5 h-3.5 text-green-600" />
            <span>PHONE CALL</span>
          </span>
        );
      case 'EASY_ORDER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>EASY ORDER</span>
          </span>
        );
      case 'AGENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <UserCheck className="w-3.5 h-3.5" />
            <span>AGENT</span>
          </span>
        );
    }
  }

  if (status) {
    const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
      PENDING: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
      PREPARING: { label: 'Preparing', bg: 'bg-amber-100', text: 'text-amber-800' },
      READY_FOR_PICKUP: { label: 'Ready for Pickup', bg: 'bg-indigo-100', text: 'text-indigo-800' },
      ASSIGNED: { label: 'Rider Assigned', bg: 'bg-purple-100', text: 'text-purple-800' },
      RIDER_ACCEPTED: { label: 'Rider Accepted', bg: 'bg-purple-100', text: 'text-purple-800' },
      AT_RESTAURANT: { label: 'At Restaurant', bg: 'bg-indigo-100', text: 'text-indigo-800' },
      PICKED_UP: { label: 'Picked Up', bg: 'bg-teal-100', text: 'text-teal-800' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-orange-100', text: 'text-orange-800' },
      DELIVERED: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-800' },
      CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800' }
    };

    const conf = statusConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${conf.bg} ${conf.text}`}>
        {conf.label}
      </span>
    );
  }

  return null;
};

export default StatusBadge;
