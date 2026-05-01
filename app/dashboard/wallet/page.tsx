'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, TrendingUp, Clock, RefreshCw, Users, Store,
  ShoppingCart, ArrowDownRight, BarChart3, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CARD: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb',
  borderRadius: '0.75rem', padding: '1.25rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const DAYS_OPTIONS = [7, 14, 30, 90, 365];

function StatCard({ label, value, sub, icon: Icon, color, badge }: any) {
  return (
    <div style={CARD}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-gray-900 mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      {badge && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: badge.color + '18', color: badge.color }}>
          {badge.icon} {badge.text}
        </div>
      )}
    </div>
  );
}

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetch = async (d: number) => {
    setLoading(true);
    try {
      const { data: r } = await api.get(`/admin/revenue?days=${d}`);
      setData(r);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(days); }, [days]);

  const s = data?.summary || {};
  const byDay: any[] = data?.revenueByDay || [];
  const topVendors: any[] = data?.topVendors || [];
  const byStatus: any[] = data?.ordersByStatus || [];

  const STATUS_LABEL: Record<string, string> = {
    completed: 'Completed', paid: 'Paid', processing: 'Processing',
    shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
    refunded: 'Refunded', pending_payment: 'Pending Payment',
    return_requested: 'Return Requested',
  };
  const STATUS_COLOR: Record<string, string> = {
    completed: '#059669', paid: '#2563eb', processing: '#7c3aed',
    shipped: '#d97706', delivered: '#0891b2', cancelled: '#dc2626',
    refunded: '#ef4444', pending_payment: '#9ca3af', return_requested: '#f97316',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Revenue & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform earnings, vendor payouts, and order insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={() => setDays(d)}
                className="px-3 py-2 text-xs font-bold transition-all"
                style={{ background: days === d ? '#cf3232' : '#fff', color: days === d ? '#fff' : '#6b7280' }}>
                {d === 365 ? '1Y' : `${d}D`}
              </button>
            ))}
          </div>
          <button onClick={() => fetch(days)} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-xl animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <>
          {/* ── Top stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="All-Time Revenue"
              value={formatCurrency(s.allTimeRevenue || 0)}
              sub={`${s.completedOrders || 0} completed orders`}
              icon={DollarSign} color="#059669"
            />
            <StatCard
              label={`Platform Fees (${days}D)`}
              value={formatCurrency(s.periodPlatformFee || 0)}
              sub={`All-time: ${formatCurrency(s.allTimePlatformFee || 0)}`}
              icon={TrendingUp} color="#cf3232"
              badge={{ color: '#cf3232', icon: '💰', text: 'Your earnings' }}
            />
            <StatCard
              label="In Escrow (Pending)"
              value={formatCurrency(s.pendingRevenue || 0)}
              sub={`${s.pendingOrders || 0} orders in return window`}
              icon={Clock} color="#d97706"
              badge={{ color: '#d97706', icon: '⏳', text: 'Releasing soon' }}
            />
            <StatCard
              label={`Orders (${days}D)`}
              value={s.periodOrders || 0}
              sub={`Revenue: ${formatCurrency(s.periodRevenue || 0)}`}
              icon={ShoppingCart} color="#2563eb"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Vendor Payouts (All-time)"
              value={formatCurrency(s.allTimeVendorAmount || 0)}
              sub="Transferred to vendors"
              icon={Store} color="#7c3aed"
            />
            <StatCard
              label="Pending Platform Fee"
              value={formatCurrency(s.pendingPlatformFee || 0)}
              sub="Will transfer after return window"
              icon={Clock} color="#f59e0b"
            />
            <StatCard
              label="Total Refunded"
              value={formatCurrency(s.refundedAmount || 0)}
              sub={`${s.refundedOrders || 0} refund orders`}
              icon={ArrowDownRight} color="#dc2626"
            />
            <StatCard
              label="Active Vendors / Buyers"
              value={`${s.totalVendors || 0} / ${s.totalBuyers || 0}`}
              sub="Approved vendors · Active buyers"
              icon={Users} color="#0891b2"
            />
          </div>

          {/* ── Revenue chart ── */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900 text-sm">Revenue vs Platform Fee — Last {days} Days</p>
            </div>
            {byDay.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-gray-300 text-sm">No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={byDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gFee" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cf3232" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#cf3232" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`]} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#2563eb" strokeWidth={2} fill="url(#gRev)" dot={false} />
                  <Area type="monotone" dataKey="platformFee" name="Platform Fee" stroke="#cf3232" strokeWidth={2} fill="url(#gFee)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Top vendors + Order status ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Top vendors */}
            <div style={CARD}>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4" style={{ color: '#cf3232' }} />
                <p className="font-black text-gray-900 text-sm">Top Vendors by Revenue ({days}D)</p>
              </div>
              {topVendors.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data</p>
              ) : topVendors.map((v, i) => {
                const maxRev = topVendors[0]?.revenue || 1;
                const pct = Math.round((v.revenue / maxRev) * 100);
                return (
                  <div key={v._id} className="py-3" style={{ borderBottom: i < topVendors.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black w-5 text-center text-gray-400">{i + 1}</span>
                        <p className="text-sm font-bold text-gray-800">{v.businessName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(v.revenue)}</p>
                        <p className="text-xs text-gray-400">Fee: {formatCurrency(v.platformFee)} · {v.orders} orders</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: '#cf3232' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Orders by status */}
            <div style={CARD}>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-4 h-4" style={{ color: '#cf3232' }} />
                <p className="font-black text-gray-900 text-sm">All Orders by Status</p>
              </div>
              {byStatus.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No data</p>
              ) : byStatus.map((s, i) => (
                <div key={s._id} className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: i < byStatus.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: STATUS_COLOR[s._id] || '#9ca3af' }} />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {STATUS_LABEL[s._id] || s._id?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">{formatCurrency(s.revenue || 0)}</span>
                    <span className="text-sm font-black text-gray-800 w-10 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
