'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { vendorApi } from '@/lib/vendorAuth';
import { useVendorAuth } from '@/lib/vendorAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingCart, Package, TrendingUp, AlertCircle,
  CheckCircle, ExternalLink, ArrowRight, RefreshCw,
  AlertTriangle, DollarSign,
} from 'lucide-react';
import PeriodFilter from '@/components/vendor/PeriodFilter';

const VendorCharts = dynamic(() => import('@/components/vendor/VendorCharts'), { ssr: false });

const CARD: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #e5e7eb',
  borderRadius: '1rem', padding: '1.25rem',
  boxShadow: '0 2px 8px rgba(159,18,57,0.04)',
};

function StatCard({ label, value, sub, icon: Icon, color, href }: any) {
  const inner = (
    <div style={CARD} className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function VendorDashboardPage() {
  const { vendor } = useVendorAuth();
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = (d: number) => {
    setLoading(true);
    Promise.all([
      vendorApi.get(`/vendor/analytics?days=${d}`),
      vendorApi.get('/vendor/orders?limit=8').catch(() => ({ data: { orders: [] } })),
    ]).then(([aRes, oRes]) => {
      setData(aRes.data);
      setOrders(oRes.data.orders || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(days); }, [days]);

  const stripeOnboard = async () => {
    const { data } = await vendorApi.post('/vendor/auth/stripe/onboard', {});
    window.location.href = data.url;
  };

  const s = data?.summary || {};
  const revenueByDay = data?.revenueByDay || [];
  const topProducts = data?.topProducts || [];
  const salesByCity = data?.salesByCity || [];
  const salesByCategory = data?.salesByCategory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {vendor?.ownerName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilter days={days} onChange={setDays} onRefresh={() => fetchData(days)} extra={
            <Link href={`/store/${vendor?.slug}`} target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Storefront
            </Link>
          } />
        </div>
      </div>

      {/* Alerts */}
      {vendor?.status === 'pending' && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Account Pending Approval</p>
            <p className="text-xs text-yellow-700 mt-0.5">Your account is under review. You'll be notified once approved.</p>
          </div>
        </div>
      )}
      {vendor?.status === 'approved' && !vendor?.stripeOnboardingComplete && (
        <div className="flex items-start justify-between gap-3 px-4 py-4 rounded-xl" style={{ background: '#dbeafe', border: '1px solid #bfdbfe' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Complete Stripe Onboarding</p>
              <p className="text-xs text-blue-700 mt-0.5">Connect your bank account to receive payments.</p>
            </div>
          </div>
          <button onClick={stripeOnboard} className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: '#2563eb' }}>
            Connect →
          </button>
        </div>
      )}
      {s.lowStock > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-orange-800">{s.lowStock} product{s.lowStock > 1 ? 's' : ''} low on stock</p>
          <Link href="/vendor/products" className="ml-auto text-xs font-bold text-orange-700 hover:underline">Manage →</Link>
        </div>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatCurrency(s.totalRevenue || 0)} sub={`Last ${days} days`} icon={DollarSign} color="#059669" />
        <StatCard label="Orders" value={s.totalOrders || 0} sub={`${s.cancelledOrders || 0} cancelled`} icon={ShoppingCart} color="#2563eb" href="/vendor/orders" />
        <StatCard label="Avg Order Value" value={formatCurrency(s.avgOrderValue || 0)} sub={`Last ${days} days`} icon={TrendingUp} color="#7c3aed" />
        <StatCard label="Active Products" value={s.activeProducts || 0} sub={`${s.outOfStock || 0} out of stock`} icon={Package} color="#cf3232" href="/vendor/products" />
      </div>

      {/* Wallet row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Balance', value: formatCurrency((s.availableBalance || 0) / 100), color: '#059669' },
          { label: 'Pending Balance', value: formatCurrency((s.pendingBalance || 0) / 100), color: '#d97706' },
          { label: 'Total Earned', value: formatCurrency((s.totalEarned || 0) / 100), color: '#cf3232' },
          { label: 'All-time Revenue', value: formatCurrency(s.allTimeRevenue || 0), color: '#2563eb' },
        ].map(({ label, value, color }) => (
          <div key={label} style={CARD}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-black mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <VendorCharts revenueByDay={revenueByDay} ordersByStatus={data?.ordersByStatus || []} loading={loading} days={days} />

      {/* Top products + Sales by city */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top products */}
        <div style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-black text-sm text-gray-900">Top Products</p>
            <Link href="/vendor/analytics" className="text-xs font-semibold hover:underline" style={{ color: '#cf3232' }}>Full Report →</Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No sales data yet</p>
          ) : topProducts.slice(0, 5).map((p: any, i: number) => (
            <div key={p.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
              <span className="text-xs font-black w-5 text-center" style={{ color: '#9ca3af' }}>{i + 1}</span>
              {p.image ? <img src={p.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #e5e7eb' }} /> : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.unitsSold} units sold</p>
              </div>
              <p className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(p.revenue)}</p>
            </div>
          ))}
        </div>

        {/* Sales by city */}
        <div style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-black text-sm text-gray-900">Sales by City</p>
            <Link href="/vendor/analytics" className="text-xs font-semibold hover:underline" style={{ color: '#cf3232' }}>Full Report →</Link>
          </div>
          {salesByCity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No location data yet</p>
          ) : salesByCity.slice(0, 6).map((c: any, i: number) => {
            const max = salesByCity[0]?.revenue || 1;
            const pct = Math.round((c.revenue / max) * 100);
            return (
              <div key={c.city} className="py-2" style={{ borderBottom: i < 5 ? '1px solid #f3f4f6' : 'none' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-700">{c.city}</p>
                  <p className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(c.revenue)}</p>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: '#cf3232' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent orders */}
      <div style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-black text-sm text-gray-900">Recent Orders</p>
          <Link href="/vendor/orders" className="text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: '#cf3232' }}>
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Order ID', 'Buyer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f9fafb' }} className="hover:bg-[#FAEFEF] transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs font-bold" style={{ color: '#cf3232' }}>#{o._id?.slice(-8)}</td>
                    <td className="py-3 pr-4 text-gray-700 font-medium">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td className="py-3 pr-4 font-black text-gray-800">{formatCurrency(o.total)}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={{ background: o.status === 'completed' ? '#d1fae5' : o.status === 'cancelled' ? '#fee2e2' : '#fef9c3', color: o.status === 'completed' ? '#065f46' : o.status === 'cancelled' ? '#991b1b' : '#854d0e' }}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
