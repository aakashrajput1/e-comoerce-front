'use client';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

// ─── Color palette ────────────────────────────────────────────────────────────
const PIE_COLORS = ['#cf3232', '#cf3232', '#e11d6a', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'];

// ─── Shared styles ────────────────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};
const GRID = '#f3f4f6';
const TICK = { fontSize: 11, fill: '#9ca3af' };

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      {label && <p style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name?.toLowerCase().includes('revenue') || p.name?.toLowerCase().includes('fee')
            ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Filter pill component ────────────────────────────────────────────────────
const PERIODS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '60D', value: 60 },
  { label: '90D', value: 90 },
];

function PeriodFilter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#FAEFEF', borderRadius: 8, padding: 3, border: '1px solid #e5e7eb' }}>
      {PERIODS.map((p) => (
        <button key={p.value} onClick={() => onChange(p.value)}
          style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: value === p.value ? '#cf3232' : 'transparent',
            color: value === p.value ? '#fff' : '#6b7280',
          }}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Chart header ─────────────────────────────────────────────────────────────
function ChartHeader({ title, subtitle, period, onPeriod }: { title: string; subtitle: string; period: number; onPeriod: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
      <PeriodFilter value={period} onChange={onPeriod} />
    </div>
  );
}

// ─── Filter data by days ──────────────────────────────────────────────────────
function filterByDays(data: any[], days: number) {
  if (!data?.length) return [];
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return data.filter((d) => new Date(d._id) >= cutoff);
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  revenueByDay: any[];
  ordersByStatus: any[];
  vendorPieData: any[];
}

export default function DashboardCharts({ revenueByDay, ordersByStatus, vendorPieData }: Props) {
  const [revPeriod, setRevPeriod] = useState(7);
  const [ordersPeriod, setOrdersPeriod] = useState(7);
  const [linePeriod, setLinePeriod] = useState(7);
  const [feesPeriod, setFeesPeriod] = useState(7);

  const pieData = ordersByStatus.map((s: any) => ({
    name: s._id?.replace(/_/g, ' ') || 'unknown',
    value: s.count,
  }));

  const revData = filterByDays(revenueByDay, revPeriod);
  const ordersData = filterByDays(revenueByDay, ordersPeriod);
  const lineData = filterByDays(revenueByDay, linePeriod);
  const feesData = filterByDays(revenueByDay, feesPeriod);

  const empty = (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
      No data for this period
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Row 1 — Area + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Area */}
        <div className="lg:col-span-2" style={CARD}>
          <ChartHeader title="Revenue Overview" subtitle="Revenue & orders over time" period={revPeriod} onPeriod={setRevPeriod} />
          {revData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cf3232" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#cf3232" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cf3232" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#cf3232" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#6b3a52' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#cf3232" strokeWidth={2.5} fill="url(#g1)" dot={{ r: 4, fill: '#cf3232', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="orders" name="Orders" stroke="#cf3232" strokeWidth={2} fill="url(#g2)" dot={{ r: 3, fill: '#cf3232' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie — no period filter, shows all time */}
        <div style={CARD}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Order Status</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>All time distribution</p>
          </div>
          {pieData.length === 0 ? empty : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                {pieData.slice(0, 5).map((d: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: '#374151', fontWeight: 600, textTransform: 'capitalize' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2 — Bar + Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Daily Orders Bar */}
        <div style={CARD}>
          <ChartHeader title="Daily Orders" subtitle="Order count per day" period={ordersPeriod} onPeriod={setOrdersPeriod} />
          {ordersData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="orders" name="Orders" fill="#cf3232" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue Line */}
        <div style={CARD}>
          <ChartHeader title="Revenue Trend" subtitle="Daily revenue line" period={linePeriod} onPeriod={setLinePeriod} />
          {lineData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#cf3232" strokeWidth={3}
                  dot={{ r: 5, fill: '#cf3232', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3 — Vendor Pie + Fees Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Vendor Status Pie */}
        <div style={CARD}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>Vendor Status</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>Approved vs Pending</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={vendorPieData} cx="50%" cy="50%" outerRadius={62} paddingAngle={4} dataKey="value">
                <Cell fill="#cf3232" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            {vendorPieData.map((d: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#374151' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#cf3232' : '#f59e0b' }} />
                {d.name}: <strong style={{ color: '#111827' }}>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Fees Bar */}
        <div className="lg:col-span-2" style={CARD}>
          <ChartHeader title="Platform Fees" subtitle="Daily fees collected" period={feesPeriod} onPeriod={setFeesPeriod} />
          {feesData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={feesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="_id" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="revenue" name="Revenue ($)" fill="#cf3232" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
