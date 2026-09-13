import React from 'react';
import { OrderStatus } from '../../types';
import { CheckCircle2, Clock, Utensils, Bike, PackageCheck, Home } from 'lucide-react';

interface TimelineProps {
  currentStatus: OrderStatus;
}

const steps: { key: OrderStatus[]; label: string; icon: any }[] = [
  { key: ['PENDING', 'CONFIRMED'], label: 'Order Placed', icon: Clock },
  { key: ['PREPARING'], label: 'Preparing Food', icon: Utensils },
  { key: ['READY_FOR_PICKUP', 'ASSIGNED', 'RIDER_ACCEPTED', 'AT_RESTAURANT'], label: 'Ready for Pickup', icon: PackageCheck },
  { key: ['PICKED_UP', 'OUT_FOR_DELIVERY'], label: 'Out for Delivery', icon: Bike },
  { key: ['DELIVERED'], label: 'Delivered', icon: Home }
];

export const OrderStatusTimeline: React.FC<TimelineProps> = ({ currentStatus }) => {
  const getStepStatus = (stepIndex: number) => {
    if (currentStatus === 'CANCELLED') return 'cancelled';

    const statusOrder: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'ASSIGNED',
      'RIDER_ACCEPTED',
      'AT_RESTAURANT',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    const currentIdx = statusOrder.indexOf(currentStatus);

    let stepMaxIdx = 0;
    if (stepIndex === 0) stepMaxIdx = 1;
    else if (stepIndex === 1) stepMaxIdx = 2;
    else if (stepIndex === 2) stepMaxIdx = 6;
    else if (stepIndex === 3) stepMaxIdx = 8;
    else if (stepIndex === 4) stepMaxIdx = 9;

    if (currentIdx > stepMaxIdx) return 'completed';
    if (steps[stepIndex].key.includes(currentStatus)) return 'active';
    return 'upcoming';
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const state = getStepStatus(idx);
          const Icon = step.icon;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-bold transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-600 border-emerald-200 text-white shadow-md'
                    : state === 'active'
                    ? 'bg-brand-600 border-brand-200 text-white animate-bounce shadow-lg'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {state === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-bold text-center max-w-[80px] ${
                  state === 'active'
                    ? 'text-brand-600 font-extrabold scale-105'
                    : state === 'completed'
                    ? 'text-emerald-700 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
