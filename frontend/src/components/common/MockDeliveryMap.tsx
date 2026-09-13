import React, { useState, useEffect } from 'react';
import { Bike, Store, Home, MapPin, Navigation } from 'lucide-react';

interface MockDeliveryMapProps {
  restaurantName?: string;
  customerAddress?: string;
  riderName?: string;
  status?: string;
}

export const MockDeliveryMap: React.FC<MockDeliveryMapProps> = ({
  restaurantName = 'MealVoice Kitchen',
  customerAddress = 'Indiranagar 4th Cross, Bengaluru',
  riderName = 'Vikram Singh (Rider)',
  status = 'OUT_FOR_DELIVERY'
}) => {
  const [progress, setProgress] = useState(0.4); // 0 to 1

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 0.95 ? 0.2 : prev + 0.05));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Map path coordinates
  const startX = 60;
  const startY = 180;
  const endX = 340;
  const endY = 60;

  // Interpolated rider position along bezier curve
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 40;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden shadow-2xl relative border border-slate-800">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            Live Delivery Tracking (GPS Simulated)
          </span>
        </div>
        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-brand-400 animate-spin" />
          <span>{riderName}</span>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 240" fill="none">
          {/* Simulated Map Grid / Roads */}
          <path d="M0 120 H400 M120 0 V240 M280 0 V240" stroke="#1e293b" strokeWidth="16" strokeDasharray="4 4" />

          {/* Curved Delivery Route */}
          <path
            d="M60 180 Q 200 80, 340 60"
            stroke="#f97316"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-pulse"
          />

          {/* Restaurant Location Pin */}
          <g transform={`translate(${startX}, ${startY})`}>
            <circle r="18" fill="#0284c7" fillOpacity="0.3" />
            <circle r="12" fill="#0284c7" />
          </g>

          {/* Customer Location Pin */}
          <g transform={`translate(${endX}, ${endY})`}>
            <circle r="18" fill="#10b981" fillOpacity="0.3" />
            <circle r="12" fill="#10b981" />
          </g>

          {/* Rider Moving Icon */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle r="20" fill="#f97316" fillOpacity="0.4" className="animate-ping" />
            <circle r="14" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>

        {/* Overlay Labels */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-700 text-xs">
          <div className="text-slate-400 flex items-center gap-1 font-semibold">
            <Store className="w-3.5 h-3.5 text-sky-400" />
            <span>Pickup: {restaurantName}</span>
          </div>
          <div className="text-emerald-400 flex items-center gap-1 font-bold mt-1">
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivery: {customerAddress}</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-brand-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-lg">
          ETA: {Math.max(5, Math.round((1 - progress) * 25))} Mins
        </div>
      </div>
    </div>
  );
};

export default MockDeliveryMap;
