'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Search, RefreshCw, RotateCcw, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [refunding, setRefunding] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders', { params: { status, page, limit: 15 } });
      setOrders(data.orders);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [status, page]);

  const refundOrder = async (id: string) => {
    if (!confirm('Process refund for this order?')) return;
    setRefunding(id);
    try {
      await api.post(`/admin/orders/${id}/refund`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Refund failed');
    } finally { setRefunding(null); }
  };

  const columns = [
    { key: '_id', label: 'Order ID', render: (r: any) => (
      <button onClick={() => router.push(`/dashboard/orders/${r._id}`)}
        className="font-mono text-xs font-bold hover:underline" style={{ color: '#cf3232' }}>
        #{r._id?.slice(-8)}
      </button>
    )},
    { key: 'buyer', label: 'Buyer', render: (r: any) => (
      <span className="text-slate-700">{r.buyer?.firstName} {r.buyer?.lastName}</span>
    )},
    { key: 'vendor', label: 'Vendor', render: (r: any) => (
      <span className="text-slate-700">{r.vendor?.businessName}</span>
    )},
    { key: 'total', label: 'Total', render: (r: any) => <span className="font-semibold text-slate-800">{formatCurrency(r.total)}</span> },
    { key: 'platformFee', label: 'Fee', render: (r: any) => <span className="text-green-600 text-xs font-medium">{formatCurrency(r.platformFee)}</span> },
    { key: 'status', label: 'Status', render: (r: any) => <Badge status={r.status} /> },
    { key: 'createdAt', label: 'Date', render: (r: any) => <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span> },
    { key: 'actions', label: 'Actions', render: (r: any) => (
      <div className="flex items-center gap-1">
        {['paid', 'processing', 'shipped', 'delivered', 'return_requested'].includes(r.status) ? (
          <button onClick={(e) => { e.stopPropagation(); refundOrder(r._id); }}
            disabled={refunding === r._id}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50">
            <RotateCcw className="w-3 h-3" />
            Refund
          </button>
        ) : <span className="text-slate-300 text-xs">—</span>}
        <button onClick={() => router.push(`/dashboard/orders/${r._id}`)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total orders</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700">
          <option value="">All Status</option>
          {['pending_payment','paid','processing','shipped','delivered','return_requested','refunded','completed','cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button onClick={fetchOrders} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No orders found" />
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
    </div>
  );
}
