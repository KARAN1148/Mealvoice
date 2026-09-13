import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PhoneCall, Sparkles, Globe, Shield, Users, Bike, Store, DollarSign, Award, HeartHandshake } from 'lucide-react';
import { apiRequest } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await apiRequest<any>('/admin/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading || !data) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500 font-bold">Loading operations dashboard...</div>;
  }

  const { kpi, accessibilityImpact, recentOrders, topRestaurants, topRiders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">FOUNDER & OPERATIONS CONTROL</span>
          </div>
          <h1 className="text-3xl font-black mt-1">MealVoice Executive Dashboard</h1>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Independent Food Delivery Network Analytics & Market Accessibility Insights
          </p>
        </div>

        <div className="bg-slate-800 px-4 py-3 rounded-2xl border border-slate-700 text-center">
          <span className="text-xs text-slate-400 font-bold uppercase block">Platform Total Revenue</span>
          <span className="text-2xl font-black text-amber-400">₹{kpi.totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Top Operations KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Total Orders</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{kpi.totalOrders}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Online Orders</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{accessibilityImpact.onlineCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Phone Orders</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{accessibilityImpact.phoneCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Easy Orders</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{accessibilityImpact.easyOrderCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Active Riders</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{kpi.activeRiders}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Active Kitchens</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{kpi.activeRestaurants}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Avg Delivery</div>
          <div className="text-2xl font-black text-teal-600 mt-1">{kpi.avgDeliveryTimeMinutes}m</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-[10px] font-extrabold text-gray-500 uppercase">Cancel Rate</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{kpi.cancellationRate}</div>
        </div>
      </div>

      {/* CORE STARTUP DIFFERENTIATOR — ORDER SOURCE ANALYTICS & ACCESSIBILITY IMPACT */}
      <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-black">Startup Core Differentiator: Accessibility Impact</h2>
            </div>
            <p className="text-xs font-medium text-slate-300 mt-1">
              Demonstrating market penetration across Phone Call, Easy Mode, and Online Order channels
            </p>
          </div>

          <div className="bg-amber-400 text-amber-950 px-4 py-2 rounded-2xl font-black text-sm shadow">
            {accessibilityImpact.accessibilityPercentage}% Orders via Accessibility Channels!
          </div>
        </div>

        {/* Prominent Insight Highlight Card */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-xl border border-amber-500/40">
            📊
          </div>
          <div>
            <h4 className="font-extrabold text-base text-amber-300">Accessibility Market Insight</h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Over <strong>{accessibilityImpact.accessibilityPercentage}%</strong> of all MealVoice orders originate from customers who either cannot use standard smartphone food apps or prefer human phone order agents. This proves our key competitive advantage over Swiggy & Zomato!
            </p>
          </div>
        </div>

        {/* Visual Progress Bar Chart Breakdown */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Channel Breakdown (From Order Database):</div>

          <div className="space-y-3">
            {/* ONLINE Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Globe className="w-4 h-4" /> ONLINE APP / WEBSITE
                </span>
                <span>{accessibilityImpact.onlineCount} orders ({accessibilityImpact.onlinePercentage}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${accessibilityImpact.onlinePercentage}%` }} />
              </div>
            </div>

            {/* PHONE CALL Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <PhoneCall className="w-4 h-4" /> PHONE CALL ORDERS (Group 1 & 3)
                </span>
                <span>{accessibilityImpact.phoneCount} orders ({Math.round((accessibilityImpact.phoneCount / kpi.totalOrders) * 100)}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((accessibilityImpact.phoneCount / kpi.totalOrders) * 100)}%` }} />
              </div>
            </div>

            {/* EASY ORDER Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" /> EASY ORDER MODE (Group 2)
                </span>
                <span>{accessibilityImpact.easyOrderCount} orders ({Math.round((accessibilityImpact.easyOrderCount / kpi.totalOrders) * 100)}%)</span>
              </div>
              <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.round((accessibilityImpact.easyOrderCount / kpi.totalOrders) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Kitchens */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            <span>Top Performing Kitchens</span>
            <Store className="w-5 h-5 text-gray-400" />
          </h3>
          <div className="space-y-3">
            {topRestaurants.map((r: any) => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between text-xs font-bold">
                <div>
                  <div className="text-gray-900 text-sm font-black">{r.name}</div>
                  <div className="text-gray-500">{r.cuisine}</div>
                </div>
                <div className="text-right">
                  <div className="text-amber-500">⭐ {r.rating}</div>
                  <div className="text-gray-400">{r.reviewCount} reviews</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Riders */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            <span>Top Delivery Riders</span>
            <Bike className="w-5 h-5 text-gray-400" />
          </h3>
          <div className="space-y-3">
            {topRiders.map((r: any) => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-gray-50 flex items-center justify-between text-xs font-bold">
                <div>
                  <div className="text-gray-900 text-sm font-black">{r.user?.name}</div>
                  <div className="text-gray-500">{r.vehicleType} ({r.vehicleNumber})</div>
                </div>
                <div className="text-right text-emerald-600 font-extrabold">
                  ₹{r.totalEarnings} Earned
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
