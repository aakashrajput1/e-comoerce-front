'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { vendorApi } from '@/lib/vendorAuth';
import { formatCurrency } from '@/lib/utils';
import { RefreshCw, FileDown, TrendingUp, ShoppingCart, Package, MapPin, Tag } from 'lucide-react';
import PeriodFilter from '@/components/vendor/PeriodFilter';

const VendorCharts = dynamic(() => import('@/components/vendor/VendorCharts'), { ssr: false });

const CARD: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #e5e7eb',
  borderRadius: '1rem', padding: '1.25rem',
};

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = (d: number) => {
    setLoading(true);
    vendorApi.get(`/vendor/analytics?days=${d}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(days); }, [days]);

  const s = data?.summary || {};
  const topProducts = data?.topProducts || [];
  const salesByCity = data?.salesByCity || [];
  const salesByCategory = data?.salesByCategory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Deep dive into your store performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilter days={days} onChange={setDays} onRefresh={() => fetchData(days)} extra={
            <Link href="/vendor/reports"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: '#cf3232' }}>
              <FileDown className="w-3.5 h-3.5" /> Export Reports
            </Link>
          } />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: formatCurrency(s.totalRevenue || 0), icon: TrendingUp, color: '#059669', sub: `Last ${days} days` },
          { label: 'Orders', value: s.totalOrders || 0, icon: ShoppingCart, color: '#2563eb', sub: `Last ${days} days` },
          { label: 'Avg Order Value', value: formatCurrency(s.avgOrderValue || 0), icon: TrendingUp, color: '#7c3aed', sub: `Last ${days} days` },
          { label: 'Refunded', value: s.refundedOrders || 0, icon: RefreshCw, color: '#dc2626', sub: `Last ${days} days` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} style={CARD}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <VendorCharts revenueByDay={data?.revenueByDay || []} ordersByStatus={data?.ordersByStatus || []} loading={loading} days={days} />

      {/* Top products */}
      <div style={CARD}>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4" style={{ color: '#cf3232' }} />
          <p className="font-black text-sm text-gray-900">Top Products by Revenue</p>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No sales data for this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1.5px solid #e5e7eb' }}>
                  {['#', 'Product', 'Units Sold', 'Revenue', 'Avg Price'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p: any, i: number) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }} className="hover:bg-[#FAEFEF] transition-colors">
                    <td className="py-3 pr-4 text-xs font-black text-gray-400">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {p.image ? <img src={p.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" /> : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />}
                        <p className="font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-bold text-gray-700">{p.unitsSold}</td>
                    <td className="py-3 pr-4 font-black" style={{ color: '#cf3232' }}>{formatCurrency(p.revenue)}</td>
                    <td className="py-3 text-gray-500">{formatCurrency(p.unitsSold ? p.revenue / p.unitsSold : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* City + Category side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by city */}
        <div style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4" style={{ color: '#cf3232' }} />
            <p className="font-black text-sm text-gray-900">Sales by City</p>
          </div>
          {salesByCity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No location data</p>
          ) : salesByCity.map((c: any, i: number) => {
            const max = salesByCity[0]?.revenue || 1;
            return (
              <div key={c.city} className="py-2.5" style={{ borderBottom: i < salesByCity.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-700">{c.city}</p>
                  <p className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(c.revenue)}</p>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.round((c.revenue / max) * 100)}%`, background: '#cf3232' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sales by category */}
        <div style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4" style={{ color: '#cf3232' }} />
            <p className="font-black text-sm text-gray-900">Sales by Category</p>
          </div>
          {salesByCategory.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No category data</p>
          ) : salesByCategory.map((c: any, i: number) => {
            const max = salesByCategory[0]?.revenue || 1;
            return (
              <div key={c.category} className="py-2.5" style={{ borderBottom: i < salesByCategory.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{c.category}</p>
                    <p className="text-xs text-gray-400">{c.units} units</p>
                  </div>
                  <p className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(c.revenue)}</p>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.round((c.revenue / max) * 100)}%`, background: '#2563eb' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
