'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/lib/vendorAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RefreshCw, Truck, CheckCircle, ChevronRight } from 'lucide-react';

const statusColors: Record<string, { bg: string; color: string }> = {
  paid: { bg: '#dbeafe', color: '#1e40af' }, processing: { bg: '#ede9fe', color: '#5b21b6' },
  shipped: { bg: '#fef9c3', color: '#854d0e' }, delivered: { bg: '#d1fae5', color: '#065f46' },
  completed: { bg: '#d1fae5', color: '#065f46' }, cancelled: { bg: '#fee2e2', color: '#991b1b' },
  refunded: { bg: '#fee2e2', color: '#991b1b' }, return_requested: { bg: '#ffedd5', color: '#9a3412' },
  pending_payment: { bg: '#f3f4f6', color: '#4b5563' },
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await vendorApi.get('/vendor/orders', { params: { limit: 50, status: filter || undefined } });
      setOrders(data.orders || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await vendorApi.patch(`/vendor/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch { alert('Failed to update status'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} orders</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>
            <option value="">All Status</option>
            {['paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'return_requested'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button onClick={fetchOrders} className="p-2.5 rounded-xl" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-bold text-gray-700">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#FAEFEF' }}>
                  {['Order ID', 'Buyer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const sc = statusColors[o.status] || { bg: '#f3f4f6', color: '#4b5563' };
                  return (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      className="hover:bg-[#FAEFEF] transition-colors cursor-pointer"
                      onClick={() => router.push(`/vendor/orders/${o._id}`)}>
                      <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: '#cf3232' }}>#{o._id?.slice(-8)}</td>
                      <td className="px-5 py-3.5 text-gray-700">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                      <td className="px-5 py-3.5 text-gray-500">{o.items?.length || 1} item(s)</td>
                      <td className="px-5 py-3.5 font-bold text-gray-800">{formatCurrency(o.total)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={sc}>
                          {o.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {o.status === 'paid' && (
                            <button onClick={e => { e.stopPropagation(); updateStatus(o._id, 'processing'); }} disabled={updating === o._id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: '#ede9fe', color: '#5b21b6' }}>
                              <CheckCircle className="w-3 h-3" /> Process
                            </button>
                          )}
                          {o.status === 'processing' && (
                            <button onClick={e => { e.stopPropagation(); updateStatus(o._id, 'shipped'); }} disabled={updating === o._id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: '#fef9c3', color: '#854d0e' }}>
                              <Truck className="w-3 h-3" /> Ship
                            </button>
                          )}
                          {o.status === 'return_requested' && (
                            <button onClick={e => { e.stopPropagation(); router.push(`/vendor/orders/${o._id}`); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                              style={{ background: '#ffedd5', color: '#9a3412' }}>
                              Review Return
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); router.push(`/vendor/orders/${o._id}`); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
