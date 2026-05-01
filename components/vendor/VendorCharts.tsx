'use client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CARD: React.CSSProperties = { background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem' };
const TICK = { fontSize: 11, fill: '#9ca3af' };
const COLORS = ['#cf3232','#2563eb','#059669','#d97706','#7c3aed','#0891b2'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      {label && <p style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' ? `$${(p.value / 100).toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

interface Props {
  revenueByDay?: { date: string; revenue: number; orders: number }[];
  ordersByStatus?: { status: string; count: number }[];
  loading?: boolean;
  days?: number;
}

export default function VendorCharts({ revenueByDay = [], ordersByStatus = [], loading, days = 30 }: Props) {
  const chartData = revenueByDay.map((d) => ({
    ...d,
    label: d.date.slice(5), // MM-DD
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} style={{ ...CARD, height: 260 }} className="animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue trend */}
      <div style={CARD}>
        <p className="font-black text-sm text-gray-900 mb-0.5">Revenue Trend</p>
        <p className="text-xs text-gray-400 mb-4">Daily earnings — last {days} days</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="vg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cf3232" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#cf3232" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/100).toFixed(0)}`} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#cf3232" strokeWidth={2.5} fill="url(#vg1)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders per day */}
      <div style={CARD}>
        <p className="font-black text-sm text-gray-900 mb-0.5">Daily Orders</p>
        <p className="text-xs text-gray-400 mb-4">Order count — last {days} days</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={TICK} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="orders" name="Orders" fill="#cf3232" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Order status pie */}
      {ordersByStatus.length > 0 && (
        <div style={CARD}>
          <p className="font-black text-sm text-gray-900 mb-0.5">Order Status</p>
          <p className="text-xs text-gray-400 mb-4">Breakdown by status</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ status, percent }: any) => `${status} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
