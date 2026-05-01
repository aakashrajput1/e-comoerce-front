'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { adminApi as api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import { Store, Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl animate-pulse" style={{ height: 300, background: '#f3f4f6', border: '1.5px solid #e5e7eb' }} />
      ))}
    </div>
  ),
});

const CARD: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #e5e7eb',
  borderRadius: '1rem', padding: '1.25rem',
  boxShadow: '0 2px 8px rgba(159,18,57,0.06)',
};

const PERIODS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 },
  { label: '90 Days', value: 90 },
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchData = useCallback((d: number) => {
    setLoading(true);
    api.get(`/admin/dashboard?days=${d}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  const { stats, ordersByStatus = [], revenueByDay = [], recentOrders = [] } = data || {};

  const s = {
    totalVendors: stats?.totalVendors || 0,
    pendingVendors: stats?.pendingVendors || 0,
    totalBuyers: stats?.totalBuyers || 0,
    totalProducts: stats?.totalProducts || 0,
    totalOrders: stats?.totalOrders || 0,
    totalRevenue: stats?.totalRevenue || 0,
    totalPlatformFees: stats?.totalPlatformFees || 0,
    newVendors: stats?.newVendors || 0,
    newBuyers: stats?.newBuyers || 0,
    newOrders: stats?.newOrders || 0,
  };

  const vendorPieData = [
    { name: 'Approved', value: s.totalVendors - s.pendingVendors },
    { name: 'Pending', value: s.pendingVendors },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#111827' }}>Dashboard</h1>
          <p className="text-sm font-medium mt-0.5" style={{ color: '#6b7280' }}>Platform overview & analytics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && <span className="text-xs font-semibold animate-pulse" style={{ color: '#c084a0' }}>Refreshing...</span>}
          <div style={{ display: 'flex', gap: 4, background: '#FAEFEF', borderRadius: 12, padding: 4, border: '1.5px solid #e5e7eb' }}>
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setDays(p.value)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: days === p.value ? '#cf3232' : 'transparent',
                  color: days === p.value ? '#fff' : '#6b7280',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Vendors" value={s.totalVendors} icon={Store} color="pink" subtitle={`+${s.newVendors} in ${days}d`} />
        <StatCard title="Total Buyers" value={s.totalBuyers} icon={Users} color="purple" subtitle={`+${s.newBuyers} in ${days}d`} />
        <StatCard title="Active Products" value={s.totalProducts} icon={Package} color="blue" />
        <StatCard title="Total Orders" value={s.totalOrders} icon={ShoppingCart} color="orange" subtitle={`+${s.newOrders} in ${days}d`} />
        <StatCard title="Total Revenue" value={formatCurrency(s.totalRevenue)} icon={DollarSign} color="green" />
        <StatCard title="Platform Fees" value={formatCurrency(s.totalPlatformFees)} icon={TrendingUp} color="cyan" />
        <StatCard title="Pending Vendors" value={s.pendingVendors} icon={Clock} color="yellow" />
        <StatCard title="Pending Approvals" value={s.pendingVendors} icon={AlertCircle} color="red" />
      </div>

      {/* Charts */}
      <DashboardCharts
        revenueByDay={revenueByDay}
        ordersByStatus={ordersByStatus}
        vendorPieData={vendorPieData}
      />

      {/* Recent Orders */}
      <div style={CARD}>
        <p className="font-black text-base mb-5" style={{ color: '#111827' }}>Recent Orders</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                {['Order ID', 'Buyer', 'Vendor', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-black uppercase tracking-widest" style={{ color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm font-medium" style={{ color: '#c084a0' }}>
                    {loading ? 'Loading...' : 'No recent orders'}
                  </td>
                </tr>
              ) : recentOrders.map((order: any) => (
                <tr key={order._id}
                  style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td className="py-3.5 font-mono text-xs font-bold" style={{ color: '#cf3232' }}>#{order._id?.slice(-8)}</td>
                  <td className="py-3.5 font-semibold" style={{ color: '#111827' }}>{order.buyer?.firstName} {order.buyer?.lastName}</td>
                  <td className="py-3.5 font-semibold" style={{ color: '#374151' }}>{order.vendor?.businessName}</td>
                  <td className="py-3.5 font-black" style={{ color: '#111827' }}>{formatCurrency(order.total)}</td>
                  <td className="py-3.5"><Badge status={order.status} /></td>
                  <td className="py-3.5 text-xs font-medium" style={{ color: '#9ca3af' }}>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
