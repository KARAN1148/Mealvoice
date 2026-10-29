import React, { useState, useEffect } from 'react';
import { Bike, Store, Home, MapPin, Navigation, Phone, ShieldCheck, BatteryCharging, Compass, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface DeliveryMapProps {
  restaurantName?: string;
  customerAddress?: string;
  riderName?: string;
  status?: string;
  orderNumber?: string;
}

export const MockDeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantName = 'MealVoice Kitchen (Indiranagar)',
  customerAddress = '42, 4th Cross, 10th Main, Bengaluru',
  riderName = 'Vikram Singh',
  status = 'OUT_FOR_DELIVERY',
  orderNumber = 'MV-2026-101'
}) => {
  const [progress, setProgress] = useState(0.55); // 0.0 to 1.0
  const [zoomLevel, setZoomLevel] = useState(1);
  const [telemetrySpeed, setTelemetrySpeed] = useState(26); // km/h
  const [distanceRemaining, setDistanceRemaining] = useState(1.4); // km

  useEffect(() => {
    // Realistic GPS telemetry simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) return 0.2; // loop for continuous demonstration
        return Number((prev + 0.02).toFixed(3));
      });

      // Realistic speed fluctuation
      setTelemetrySpeed(Math.floor(22 + Math.random() * 8));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDistanceRemaining(Number((Math.max(0.2, (1 - progress) * 3.2)).toFixed(1)));
  }, [progress]);

  // Waypoints along realistic urban route (Bangalore street layout)
  const waypoints = [
    { x: 50, y: 190 },  // Restaurant (Indiranagar 100ft Rd)
    { x: 110, y: 175 }, // 12th Main junction
    { x: 170, y: 120 }, // CMH Road turn
    { x: 240, y: 130 }, // Metro Pillar 84
    { x: 300, y: 90 },  // 4th Cross
    { x: 350, y: 55 }   // Customer Residence
  ];

  // Calculate rider position along piecewise linear segments
  const totalSegments = waypoints.length - 1;
  const scaledProgress = progress * totalSegments;
  const currentSegmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
  const segmentFraction = scaledProgress - currentSegmentIndex;

  const p1 = waypoints[currentSegmentIndex];
  const p2 = waypoints[currentSegmentIndex + 1];

  const currentX = p1.x + (p2.x - p1.x) * segmentFraction;
  const currentY = p1.y + (p2.y - p1.y) * segmentFraction;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const angleDegrees = (Math.atan2(dy, dx) * 180) / Math.PI;

  const etaMinutes = Math.max(3, Math.round((1 - progress) * 22));

  return (
    <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white overflow-hidden shadow-2xl relative border border-slate-800 space-y-4">
      {/* Map Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 relative border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 relative" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>Live GPS Satellite Telemetry</span>
              <span className="text-[10px] text-slate-400 font-mono">(5G Lock • ±2m)</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Heading towards destination via 100ft Ring Road
            </div>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>{telemetrySpeed} km/h</span>
          </div>

          <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>{distanceRemaining} km away</span>
          </div>

          <div className="bg-brand-600 px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-lg animate-pulse">
            ETA: {etaMinutes} Mins
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Map Grid and Vector Street Layer */}
        <svg
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
          viewBox="0 0 400 240"
          fill="none"
        >
          {/* Subtle Landuse / City Blocks */}
          <rect x="10" y="10" width="80" height="90" fill="#0f172a" rx="8" />
          <rect x="110" y="10" width="120" height="70" fill="#0f172a" rx="8" />
          <rect x="250" y="20" width="130" height="80" fill="#0f172a" rx="8" />
          <rect x="20" y="120" width="90" height="100" fill="#0f172a" rx="8" />
          <rect x="130" y="150" width="100" height="70" fill="#0f172a" rx="8" />
          <rect x="250" y="130" width="130" height="90" fill="#0f172a" rx="8" />

          {/* Secondary Roads */}
          <path d="M 0 60 H 400 M 0 140 H 400 M 100 0 V 240 M 240 0 V 240 M 340 0 V 240" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          
          {/* Main Avenue Arteries */}
          <path d="M 0 100 H 400 M 180 0 V 240" stroke="#334155" strokeWidth="14" strokeLinecap="round" />

          {/* Urban Street Name Labels */}
          <text x="12" y="94" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="monospace">100 FT ROAD</text>
          <text x="190" y="230" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="monospace">CMH MAIN</text>
          <text x="255" y="124" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="monospace">INDIRANAGAR 4TH CROSS</text>

          {/* Active Navigation Polyline */}
          <path
            d="M 50 190 L 110 175 L 170 120 L 240 130 L 300 90 L 350 55"
            stroke="#f97316"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 6"
            className="animate-pulse"
          />

          {/* Completed Segment Glow (Behind rider) */}
          <circle cx={50} cy={190} r="16" fill="#0284c7" fillOpacity="0.25" />
          <circle cx={50} cy={190} r="10" fill="#0284c7" />

          {/* Customer Destination Marker */}
          <circle cx={350} cy={55} r="16" fill="#10b981" fillOpacity="0.25" />
          <circle cx={350} cy={55} r="10" fill="#10b981" />

          {/* Dynamic Rider Marker with Heading Direction */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle r="18" fill="#f97316" fillOpacity="0.3" className="animate-ping" />
            <circle r="12" fill="#ea580c" stroke="#ffffff" strokeWidth="2.5" />
            {/* Direction Pointer Needle */}
            <polygon
              points="0,-8 5,6 0,3 -5,6"
              fill="#ffffff"
              transform={`rotate(${angleDegrees})`}
            />
          </g>
        </svg>

        {/* Map UI Control Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 text-sm font-bold shadow"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 text-sm font-bold shadow"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 text-xs font-bold shadow"
            title="Reset View"
          >
            1x
          </button>
        </div>

        {/* Waypoint Overlay Cards */}
        <div className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-800 text-xs max-w-xs shadow-xl">
          <div className="text-slate-300 flex items-center gap-1.5 font-semibold">
            <Store className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{restaurantName}</span>
          </div>
          <div className="text-emerald-400 flex items-center gap-1.5 font-bold mt-1.5">
            <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{customerAddress}</span>
          </div>
        </div>
      </div>

      {/* RIDER INFORMATION & CONTACT BAR */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {/* Rider Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-lg">
              VS
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[8px]">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">{riderName}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30">
                ★ 4.9 • 1,420 Deliveries
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
              <span>Vehicle: KA 03 HB 2941 (Hero Electric)</span>
              <span>•</span>
              <span className="text-emerald-400">Vaccinated & Verified</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href="tel:+919876543210"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Delivery Partner</span>
          </a>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Number Masked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockDeliveryMap;
