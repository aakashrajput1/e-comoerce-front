'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, TrendingUp, Users, Store, Package, Star,
  ShoppingCart, RefreshCw, Download, BarChart3, Zap, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const DAYS = [7, 14, 30, 90, 365];
const PIE_COLORS = ['#cf3232','#2563eb','#059669','#d97706','#7c3aed','#0891b2','#dc2626','#f97316'];

const STATUS_LABEL: Record<string, string> = {
  completed:'Completed', paid:'Paid', processing:'Processing', shipped:'Shipped',
  delivered:'Delivered', cancelled:'Cancelled', refunded:'Refunded',
  pending_payment:'Pending Payment', return_requested:'Return Requested',
};

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div style={CARD}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-gray-900 mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, color = '#cf3232' }: any) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4" style={{ color }} />
      <h2 className="font-black text-gray-900 text-sm">{title}</h2>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [exporting, setExporting] = useState('');

  const fetch = async (d: number) => {
    setLoading(true);
    try {
      const { data: r } = await api.get(`/admin/analytics?days=${d}`);
      setData(r);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(days); }, [days]);

  const exportCSV = async (type: string) => {
    setExporting(type);
    try {
      const res = await api.get(`/admin/analytics/export?type=${type}&days=${days}&format=csv`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { }
    finally { setExporting(''); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse bg-gray-100" />)}
      </div>
    </div>
  );

  const o = data?.orders || {};
  const v = data?.vendors || {};
  const b = data?.buyers || {};
  const p = data?.products || {};
  const f = data?.featured || {};
  const r = data?.reviews || {};
  const w = data?.withdrawals || {};

  const ExportBtn = ({ type, label }: { type: string; label: string }) => (
    <button onClick={() => exportCSV(type)} disabled={exporting === type}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition hover:opacity-80 disabled:opacity-50"
      style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>
      <Download className="w-3 h-3" />
      {exporting === type ? 'Exporting...' : `Export ${label}`}
    </button>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full platform insights with CSV export</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            {DAYS.map(d => (
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

      {/* ── REVENUE ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={DollarSign} title="Revenue Overview" />
          <ExportBtn type="revenue" label="Revenue CSV" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard label={`Revenue (${days}D)`} value={formatCurrency(o.period?.revenue || 0)} sub={`${o.period?.count || 0} orders`} icon={DollarSign} color="#059669" />
          <StatCard label={`Platform Fee (${days}D)`} value={formatCurrency(o.period?.platformFee || 0)} sub={`All-time: ${formatCurrency(o.allTime?.platformFee || 0)}`} icon={TrendingUp} color="#cf3232" />
          <StatCard label="In Escrow" value={formatCurrency(o.pending?.revenue || 0)} sub={`${o.pending?.count || 0} orders pending`} icon={ShoppingCart} color="#d97706" />
          <StatCard label="Avg Order Value" value={formatCurrency(o.period?.avgOrder || 0)} sub={`Refunded: ${formatCurrency(o.refunded?.total || 0)}`} icon={BarChart3} color="#2563eb" />
        </div>

        {/* Revenue + Fee chart */}
        <div style={CARD}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Daily Revenue vs Platform Fee</p>
          {o.byDay?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={o.byDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cf3232" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#cf3232" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`]} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={2} fill="url(#gR)" dot={false} />
                <Area type="monotone" dataKey="platformFee" name="Platform Fee" stroke="#cf3232" strokeWidth={2} fill="url(#gF)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-10">No data for this period</p>}
        </div>
      </section>

      {/* ── ORDERS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={ShoppingCart} title="Orders" />
          <ExportBtn type="orders" label="Orders CSV" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Orders by day */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Orders per Day</p>
            {o.byDay?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={o.byDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="orders" name="Orders" fill="#cf3232" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-10">No data</p>}
          </div>

          {/* Orders by status pie */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Orders by Status</p>
            {o.byStatus?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={o.byStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={75}
                    label={({ _id, percent }: any) => `${STATUS_LABEL[_id] || _id} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {o.byStatus.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [v, STATUS_LABEL[n] || n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-10">No data</p>}
          </div>
        </div>
      </section>

      {/* ── VENDORS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Store} title="Vendors" color="#7c3aed" />
          <ExportBtn type="vendors" label="Vendors CSV" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Vendors" value={v.total || 0} sub={`${v.approved || 0} approved`} icon={Store} color="#7c3aed" />
          <StatCard label="Pending Approval" value={v.pending || 0} sub="Awaiting review" icon={ShoppingCart} color="#d97706" />
          <StatCard label="Verified" value={v.verified || 0} sub="KYB verified" icon={Award} color="#059669" />
          <StatCard label={`New (${days}D)`} value={v.newPeriod || 0} sub="Registered this period" icon={TrendingUp} color="#cf3232" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* New vendors by day */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">New Vendor Registrations</p>
            {v.byDay?.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={v.byDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="New Vendors" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* Top vendors table */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Top Vendors by Revenue ({days}D)</p>
            <div className="space-y-2">
              {v.top?.slice(0, 6).map((vd: any, i: number) => (
                <div key={vd._id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400 w-4">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{vd.businessName}</p>
                      <p className="text-xs text-gray-400">{vd.orders} orders · Fee: {formatCurrency(vd.platformFee)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(vd.revenue)}</span>
                </div>
              ))}
              {!v.top?.length && <p className="text-sm text-gray-400 text-center py-6">No data</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── BUYERS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Users} title="Buyers" color="#0891b2" />
          <ExportBtn type="buyers" label="Buyers CSV" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <StatCard label="Total Buyers" value={b.total || 0} sub={`${b.active || 0} active`} icon={Users} color="#0891b2" />
          <StatCard label={`New (${days}D)`} value={b.newPeriod || 0} sub="Registered this period" icon={TrendingUp} color="#059669" />
          <StatCard label="Withdrawals Paid" value={formatCurrency(w.completedAmount || 0)} sub={`${w.completedCount || 0} completed`} icon={DollarSign} color="#d97706" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* New buyers by day */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">New Buyer Registrations</p>
            {b.byDay?.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={b.byDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="New Buyers" stroke="#0891b2" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
          </div>

          {/* Top buyers */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Top Buyers by Spend ({days}D)</p>
            <div className="space-y-2">
              {b.top?.slice(0, 6).map((buyer: any, i: number) => (
                <div key={buyer._id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-400 w-4">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{buyer.firstName} {buyer.lastName}</p>
                      <p className="text-xs text-gray-400">{buyer.orders} orders</p>
                    </div>
                  </div>
                  <span className="text-sm font-black" style={{ color: '#0891b2' }}>{formatCurrency(buyer.spent)}</span>
                </div>
              ))}
              {!b.top?.length && <p className="text-sm text-gray-400 text-center py-6">No data</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle icon={Package} title="Products" color="#059669" />
          <ExportBtn type="products" label="Products CSV" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Products" value={p.total || 0} sub={`${p.active || 0} active`} icon={Package} color="#059669" />
          <StatCard label="Pending Review" value={p.pending || 0} sub="Awaiting approval" icon={ShoppingCart} color="#d97706" />
          <StatCard label="Out of Stock" value={p.outOfStock || 0} sub="Active but 0 inventory" icon={Package} color="#dc2626" />
          <StatCard label="Avg Rating" value={r.avgRating ? r.avgRating.toFixed(1) + ' ★' : '—'} sub={`${r.total || 0} total reviews`} icon={Star} color="#f59e0b" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top products */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Top Products by Revenue ({days}D)</p>
            <div className="space-y-2">
              {p.top?.slice(0, 6).map((prod: any, i: number) => (
                <div key={prod._id} className="flex items-center gap-3 py-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
                  <span className="text-xs font-black text-gray-400 w-4">{i + 1}</span>
                  {prod.image && <img src={prod.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #e5e7eb' }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{prod.name}</p>
                    <p className="text-xs text-gray-400">{prod.unitsSold} units · {prod.orders} orders</p>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{ color: '#059669' }}>{formatCurrency(prod.revenue)}</span>
                </div>
              ))}
              {!p.top?.length && <p className="text-sm text-gray-400 text-center py-6">No data</p>}
            </div>
          </div>

          {/* Rating distribution */}
          <div style={CARD}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Review Rating Distribution</p>
            {r.distribution?.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[...r.distribution].sort((a: any, b: any) => b._id - a._id)} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v} ★`} width={30} />
                  <Tooltip formatter={(v: any) => [v, 'Reviews']} />
                  <Bar dataKey="count" name="Reviews" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-8">No reviews yet</p>}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section>
        <SectionTitle icon={Zap} title="Featured Products Revenue" color="#d97706" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard label="All-Time Featured Revenue" value={formatCurrency(f.allTimeRevenue || 0)} sub={`${f.allTimeCount || 0} paid applications`} icon={Zap} color="#d97706" />
          <StatCard label={`Featured Revenue (${days}D)`} value={formatCurrency(f.periodRevenue || 0)} sub={`${f.periodCount || 0} applications`} icon={TrendingUp} color="#cf3232" />
          {f.byStatus?.map((s: any) => (
            <StatCard key={s._id} label={`Featured: ${s._id}`} value={s.count} sub="applications" icon={Zap} color="#7c3aed" />
          ))}
        </div>
      </section>

      {/* ── EXPORT ALL ── */}
      <section>
        <div style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-4 h-4" style={{ color: '#cf3232' }} />
            <p className="font-black text-gray-900 text-sm">Export Reports (CSV)</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">Download data for the selected period ({days} days). All exports include full details.</p>
          <div className="flex flex-wrap gap-3">
            {[
              { type: 'orders',   label: 'Orders',   desc: 'All orders with buyer, vendor, amounts, status' },
              { type: 'revenue',  label: 'Revenue',  desc: 'Daily revenue & platform fee breakdown' },
              { type: 'vendors',  label: 'Vendors',  desc: 'All vendors with verification & Stripe status' },
              { type: 'buyers',   label: 'Buyers',   desc: 'All buyers with spend & order count' },
              { type: 'products', label: 'Products', desc: 'All products with inventory, ratings, sales' },
            ].map(({ type, label, desc }) => (
              <button key={type} onClick={() => exportCSV(type)} disabled={exporting === type}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition hover:shadow-md disabled:opacity-50"
                style={{ border: '1.5px solid #e5e7eb', background: '#fafafa', minWidth: 180 }}>
                <Download className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#cf3232' }} />
                <div>
                  <p className="text-sm font-black text-gray-800">{exporting === type ? 'Exporting...' : label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
