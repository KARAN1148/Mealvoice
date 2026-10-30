import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, PhoneCall, Sparkles, Globe, Users, Bike,
  Store, HeartHandshake, RefreshCw, Download, Clock, CheckCircle,
  XCircle, AlertCircle, Activity
} from 'lucide-react';
import { apiRequest } from '../api/client';
import StatusBadge from '../components/common/StatusBadge';

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KPICardProps { label: string; value: string | number; sub?: string; color?: string; icon?: React.ReactNode }
const KPICard: React.FC<KPICardProps> = ({ label, value, sub, color = 'gray', icon }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-2">
      <div className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wide leading-tight">{label}</div>
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
    <div className={`text-2xl font-black mt-1.5 text-${color}-600`}>{value}</div>
    {sub && <div className="text-[10px] font-semibold text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

// ── Progress Bar ──────────────────────────────────────────────────────────────
interface BarProps { label: string; count: number; pct: number; color: string; icon?: React.ReactNode }
const ProgressBar: React.FC<BarProps> = ({ label, count, pct, color, icon }) => (
  <div>
    <div className="flex justify-between text-xs font-bold mb-1.5">
      <span className={`flex items-center gap-1.5 text-${color}-400`}>{icon}{label}</span>
      <span className="text-slate-300">{count} orders · {pct}%</span>
    </div>
    <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full bg-${color}-500 rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  </div>
);

// ── CSV Export helper ─────────────────────────────────────────────────────────
function exportCSV(orders: any[]) {
  const header = ['Order #', 'Customer', 'Restaurant', 'Status', 'Source', 'Amount (₹)', 'Date'].join(',');
  const rows = orders.map(o => [
    o.orderNumber,
    o.customer?.user?.name || '-',
    o.restaurant?.name || '-',
    o.status,
    o.source,
    o.totalAmount,
    new Date(o.createdAt).toLocaleDateString('en-IN')
  ].join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mealvoice-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await apiRequest<any>('/admin/dashboard');
      setData(res);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Admin data load failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => load(true), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Activity className="w-10 h-10 text-brand-600 mx-auto mb-3 animate-pulse" />
        <div className="font-black text-gray-700 text-lg">Loading Operations Dashboard...</div>
        <div className="text-xs text-gray-400 mt-1">Fetching live data from backend</div>
      </div>
    );
  }

  const { kpi, accessibilityImpact, recentOrders, topRestaurants, topRiders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Live · Operations Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">MealVoice Executive Dashboard</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Food Delivery Network Analytics · Accessibility Impact Report
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Revenue badge */}
          <div className="bg-slate-800 px-5 py-3 rounded-2xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Platform Revenue</div>
            <div className="text-2xl font-black text-amber-400">₹{kpi.totalRevenue.toLocaleString('en-IN')}</div>
          </div>

          {/* Refresh */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-4 h-4 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {lastRefresh && (
              <span className="text-[9px] text-slate-500 font-medium">
                {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* Export */}
          <button
            onClick={() => exportCSV(recentOrders)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-amber-950 font-extrabold text-xs hover:bg-amber-400 transition shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPICard label="Total Orders" value={kpi.totalOrders} icon={<BarChart3 className="w-4 h-4" />} />
        <KPICard label="Online Orders" value={accessibilityImpact.onlineCount} color="blue" icon={<Globe className="w-4 h-4" />} />
        <KPICard label="Phone Orders" value={accessibilityImpact.phoneCount} color="emerald" icon={<PhoneCall className="w-4 h-4" />} />
        <KPICard label="Easy Orders" value={accessibilityImpact.easyOrderCount} color="amber" icon={<Sparkles className="w-4 h-4" />} />
        <KPICard label="Active Riders" value={kpi.activeRiders} color="purple" icon={<Bike className="w-4 h-4" />} />
        <KPICard label="Open Kitchens" value={kpi.activeRestaurants} color="indigo" icon={<Store className="w-4 h-4" />} />
        <KPICard label="Avg Delivery" value={`${kpi.avgDeliveryTimeMinutes}m`} color="teal" icon={<Clock className="w-4 h-4" />} />
        <KPICard label="Cancel Rate" value={kpi.cancellationRate} color="rose" icon={<XCircle className="w-4 h-4" />} />
      </div>

      {/* ── Accessibility Impact ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-7 h-7 text-amber-400" />
            <div>
              <h2 className="text-xl font-black">Accessibility Impact — Core Differentiator</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Orders placed via Phone / Easy-Order accessibility channels
              </p>
            </div>
          </div>
          <div className="bg-amber-400 text-amber-950 px-4 py-2 rounded-2xl font-black text-sm shadow shrink-0">
            {accessibilityImpact.accessibilityPercentage}% Accessibility Orders
          </div>
        </div>

        {/* Insight card */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-black text-xl border border-amber-500/40 mt-0.5">
            📊
          </div>
          <div>
            <h4 className="font-extrabold text-amber-300 text-sm">Market Insight</h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
              <strong>{accessibilityImpact.accessibilityPercentage}%</strong> of MealVoice orders come from customers who prefer human phone agents or simplified accessibility interfaces — proving our key advantage over Swiggy & Zomato which serve only smartphone-native users.
            </p>
          </div>
        </div>

        {/* Bars */}
        <div className="space-y-4">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Channel Breakdown (Live DB):</div>
          <ProgressBar
            label="Online App / Website"
            count={accessibilityImpact.onlineCount}
            pct={accessibilityImpact.onlinePercentage}
            color="blue"
            icon={<Globe className="w-3.5 h-3.5" />}
          />
          <ProgressBar
            label="Phone Call Orders (Group 1 & 3)"
            count={accessibilityImpact.phoneCount}
            pct={kpi.totalOrders > 0 ? Math.round((accessibilityImpact.phoneCount / kpi.totalOrders) * 100) : 0}
            color="emerald"
            icon={<PhoneCall className="w-3.5 h-3.5" />}
          />
          <ProgressBar
            label="Easy Order Mode (Group 2)"
            count={accessibilityImpact.easyOrderCount}
            pct={kpi.totalOrders > 0 ? Math.round((accessibilityImpact.easyOrderCount / kpi.totalOrders) * 100) : 0}
            color="amber"
            icon={<Sparkles className="w-3.5 h-3.5" />}
          />
          {accessibilityImpact.agentCount > 0 && (
            <ProgressBar
              label="Agent-Assisted Orders"
              count={accessibilityImpact.agentCount}
              pct={kpi.totalOrders > 0 ? Math.round((accessibilityImpact.agentCount / kpi.totalOrders) * 100) : 0}
              color="purple"
              icon={<Users className="w-3.5 h-3.5" />}
            />
          )}
        </div>
      </div>

      {/* ── Recent Orders ────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            Recent Orders
          </h3>
          <span className="text-xs font-bold text-gray-400">Last 10 orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-[10px] font-extrabold text-gray-500 uppercase border-b border-gray-100">
                <th className="pb-2 text-left">Order #</th>
                <th className="pb-2 text-left">Customer</th>
                <th className="pb-2 text-left">Restaurant</th>
                <th className="pb-2 text-left">Source</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="text-xs hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 font-black text-gray-900">{o.orderNumber}</td>
                  <td className="py-2.5 font-semibold text-gray-700">{o.customer?.user?.name || '—'}</td>
                  <td className="py-2.5 font-semibold text-gray-700">{o.restaurant?.name || '—'}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                      o.source === 'ONLINE' ? 'bg-blue-100 text-blue-800' :
                      o.source === 'PHONE_CALL' ? 'bg-emerald-100 text-emerald-800' :
                      o.source === 'EASY_ORDER' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>{o.source?.replace('_', ' ')}</span>
                  </td>
                  <td className="py-2.5 text-right font-black text-gray-900">₹{o.totalAmount}</td>
                  <td className="py-2.5 text-right"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top Performance Tables ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Kitchens */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Store className="w-5 h-5 text-gray-400" /> Top Kitchens</span>
          </h3>
          <div className="space-y-2">
            {topRestaurants.map((r: any, idx: number) => (
              <div key={r.id} className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between text-xs font-bold hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-gray-900 font-black text-sm">{r.name}</div>
                    <div className="text-gray-500 font-semibold">{r.cuisine}</div>
                  </div>
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
          <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><Bike className="w-5 h-5 text-gray-400" /> Top Riders</span>
          </h3>
          <div className="space-y-2">
            {topRiders.map((r: any, idx: number) => (
              <div key={r.id} className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between text-xs font-bold hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-gray-900 font-black text-sm">{r.user?.name}</div>
                    <div className="text-gray-500 font-semibold">{r.vehicleType} · {r.vehicleNumber}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-extrabold text-sm">₹{r.totalEarnings.toLocaleString('en-IN')}</div>
                  <div className="text-gray-400">{r.deliveries?.length || 0} deliveries</div>
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
