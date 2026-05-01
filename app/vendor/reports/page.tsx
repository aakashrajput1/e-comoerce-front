'use client';
import { useState } from 'react';
import { vendorApi } from '@/lib/vendorAuth';
import { FileDown, FileText, Loader2, CheckCircle, Table } from 'lucide-react';

const PERIODS = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 60 Days', value: 60 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'Last 180 Days', value: 180 },
  { label: 'Last Year', value: 365 },
];

const CARD: React.CSSProperties = {
  background: '#fff', border: '1.5px solid #e5e7eb',
  borderRadius: '1rem', padding: '1.5rem',
};

function downloadCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String(r[h] ?? '').replace(/"/g, '""');
        return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function VendorReportsPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const exportOrders = async (format: 'csv' | 'json') => {
    setLoading(format);
    try {
      const { data } = await vendorApi.get(`/vendor/analytics/export?days=${days}`);
      const filename = `orders-${days}d-${new Date().toISOString().slice(0, 10)}`;
      if (format === 'csv') {
        downloadCSV(data.rows, `${filename}.csv`);
      } else {
        downloadJSON(data.rows, `${filename}.json`);
      }
      setLastExport(`${data.total} rows exported as ${format.toUpperCase()}`);
    } catch (e) {
      alert('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const exportAnalytics = async (format: 'csv' | 'json') => {
    setLoading(`analytics-${format}`);
    try {
      const { data } = await vendorApi.get(`/vendor/analytics?days=${days}`);
      const filename = `analytics-${days}d-${new Date().toISOString().slice(0, 10)}`;

      if (format === 'json') {
        downloadJSON(data, `${filename}.json`);
      } else {
        // Flatten analytics into multiple CSV sections
        const sections: string[] = [];

        // Summary
        sections.push('=== SUMMARY ===');
        sections.push(Object.entries(data.summary).map(([k, v]) => `${k},${v}`).join('\n'));

        // Revenue by day
        sections.push('\n=== REVENUE BY DAY ===');
        sections.push(downloadCSVString(data.revenueByDay));

        // Top products
        sections.push('\n=== TOP PRODUCTS ===');
        sections.push(downloadCSVString(data.topProducts.map(({ id, ...r }: any) => r)));

        // Sales by city
        sections.push('\n=== SALES BY CITY ===');
        sections.push(downloadCSVString(data.salesByCity));

        // Sales by category
        sections.push('\n=== SALES BY CATEGORY ===');
        sections.push(downloadCSVString(data.salesByCategory));

        const blob = new Blob([sections.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}.csv`; a.click();
        URL.revokeObjectURL(url);
      }
      setLastExport(`Analytics report exported as ${format.toUpperCase()}`);
    } catch (e) {
      alert('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reports & Export</h1>
        <p className="text-sm text-gray-500 mt-0.5">Download your store data in CSV or JSON format</p>
      </div>

      {/* Period selector */}
      <div style={CARD}>
        <p className="text-sm font-black text-gray-800 mb-3">Select Report Period</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setDays(p.value)}
              className="py-2.5 px-3 rounded-xl text-xs font-bold transition text-center"
              style={{
                background: days === p.value ? '#cf3232' : '#f9fafb',
                color: days === p.value ? '#fff' : '#6b7280',
                border: '1.5px solid', borderColor: days === p.value ? '#cf3232' : '#e5e7eb',
              }}>
              {p.label}
            </button>
          ))}
        </div>
        {lastExport && (
          <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg" style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-green-800">{lastExport}</p>
          </div>
        )}
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orders export */}
        <div style={CARD}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FAEFEF' }}>
              <Table className="w-5 h-5" style={{ color: '#cf3232' }} />
            </div>
            <div>
              <p className="font-black text-sm text-gray-900">Orders Report</p>
              <p className="text-xs text-gray-500 mt-0.5">All order line items with buyer info, product, city, revenue, fees</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-500 mb-5">
            <p>Includes: Order ID, Date, Buyer Name, Buyer Email, Product, Category, Qty, Unit Price, Item Total, Order Total, Vendor Amount, Platform Fee, Status, City, State, Country</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportOrders('csv')} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
              style={{ background: '#cf3232' }}>
              {loading === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              CSV
            </button>
            <button onClick={() => exportOrders('json')} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition"
              style={{ background: '#FAEFEF', color: '#374151', border: '1.5px solid #e5e7eb' }}>
              {loading === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              JSON
            </button>
          </div>
        </div>

        {/* Full analytics export */}
        <div style={CARD}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff' }}>
              <FileDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-black text-sm text-gray-900">Full Analytics Report</p>
              <p className="text-xs text-gray-500 mt-0.5">Summary, revenue by day, top products, sales by city & category</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-500 mb-5">
            <p>Includes: Summary stats, daily revenue trend, top 10 products, geographic breakdown, category performance</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportAnalytics('csv')} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition"
              style={{ background: '#2563eb' }}>
              {loading === 'analytics-csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              CSV
            </button>
            <button onClick={() => exportAnalytics('json')} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition"
              style={{ background: '#FAEFEF', color: '#374151', border: '1.5px solid #e5e7eb' }}>
              {loading === 'analytics-json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div style={CARD}>
        <p className="font-black text-sm text-gray-900 mb-3">What's Included in Reports</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: 'Payment & Revenue', items: ['Gross revenue', 'Vendor earnings', 'Platform fees', 'Refund deductions'] },
            { title: 'Order Details', items: ['Order ID & date', 'Buyer info', 'Product & quantity', 'Shipping address'] },
            { title: 'Product Performance', items: ['Units sold per product', 'Revenue per product', 'Category breakdown', 'Avg selling price'] },
            { title: 'Geographic Data', items: ['Sales by city', 'Sales by state', 'Sales by country', 'Top markets'] },
            { title: 'Order Status', items: ['Completed orders', 'Cancelled orders', 'Refunded orders', 'Pending orders'] },
            { title: 'Time Series', items: ['Daily revenue', 'Daily order count', 'Period comparison', 'Trend data'] },
          ].map(({ title, items }) => (
            <div key={title} className="p-3 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
              <p className="text-xs font-black text-gray-700 mb-2">{title}</p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#cf3232' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function downloadCSVString(rows: any[]): string {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String(r[h] ?? '').replace(/"/g, '""');
        return val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');
}
