'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Search, RefreshCw, Trash2, Star, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'active' | 'rejected' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actioning, setActioning] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products', { params: { search, status: status || undefined, page, limit: 15 } });
      setProducts(data.products);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [search, status, page]);

  const updateStatus = async (id: string, newStatus: string, note?: string) => {
    setActioning(true);
    try {
      await api.patch(`/admin/products/${id}/status`, { status: newStatus, adminNote: note || undefined });
      fetchProducts();
    } finally { setActioning(false); setNoteModal(null); setAdminNote(''); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  const pendingCount = status === 'pending_review' ? pagination.total : null;

  const columns = [
    { key: 'product', label: 'Product', render: (r: any) => (
      <button className="flex items-center gap-3 text-left" onClick={() => router.push(`/dashboard/products/${r._id}`)}>
        {r.images?.[0]
          ? <img src={r.images[0]} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #e5e7eb' }} />
          : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">IMG</div>}
        <div>
          <p className="font-semibold text-sm hover:underline max-w-[180px] truncate" style={{ color: '#cf3232' }}>{r.name}</p>
          <p className="text-xs text-gray-400">{r.category?.name || r.category || 'Uncategorized'}</p>
        </div>
      </button>
    )},
    { key: 'vendor', label: 'Vendor', render: (r: any) => <span className="text-slate-600 text-sm">{r.vendor?.businessName}</span> },
    { key: 'price', label: 'Price', render: (r: any) => <span className="font-semibold text-slate-800">{formatCurrency(r.price)}</span> },
    { key: 'inventory', label: 'Stock', render: (r: any) => (
      <span className={`font-medium text-sm ${r.inventory === 0 ? 'text-red-500' : r.inventory < 5 ? 'text-orange-500' : 'text-slate-700'}`}>
        {r.inventory}
      </span>
    )},
    { key: 'averageRating', label: 'Rating', render: (r: any) => (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-sm text-slate-700">{r.averageRating?.toFixed(1) || '—'}</span>
        <span className="text-xs text-slate-400">({r.reviewCount})</span>
      </div>
    )},
    { key: 'status', label: 'Status', render: (r: any) => (
      <span className="px-2 py-1 rounded-full text-xs font-bold capitalize"
        style={{
          background: r.status === 'active' ? '#d1fae5' : r.status === 'pending_review' ? '#fef9c3' : r.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
          color: r.status === 'active' ? '#065f46' : r.status === 'pending_review' ? '#854d0e' : r.status === 'rejected' ? '#991b1b' : '#4b5563',
        }}>
        {r.status === 'pending_review' ? '⏳ Pending Review' : r.status}
      </span>
    )},
    { key: 'submitted', label: 'Submitted', render: (r: any) => <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span> },
    { key: 'actions', label: 'Actions', render: (r: any) => (
      <div className="flex items-center gap-1 flex-wrap">
        {r.status === 'pending_review' && (
          <>
            <button onClick={() => setNoteModal({ id: r._id, action: 'active' })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
              style={{ background: '#d1fae5', color: '#065f46' }}>
              <CheckCircle className="w-3.5 h-3.5" /> Approve
            </button>
            <button onClick={() => setNoteModal({ id: r._id, action: 'rejected' })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
              style={{ background: '#fee2e2', color: '#991b1b' }}>
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
          </>
        )}
        {r.status !== 'pending_review' && (
          <select value={r.status} onChange={(e) => { e.stopPropagation(); updateStatus(r._id, e.target.value); }}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none bg-white">
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
        <button onClick={(e) => { e.stopPropagation(); deleteProduct(r._id); }}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <p className="text-slate-500 text-sm mt-0.5">{pagination.total} products</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700">
          <option value="">All Products</option>
          <option value="pending_review">⏳ Pending Review</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={fetchProducts} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {status === 'pending_review' && pendingCount !== null && pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
          <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-yellow-800">{pendingCount} product{pendingCount > 1 ? 's' : ''} waiting for your review</p>
        </div>
      )}

      <DataTable columns={columns} data={products} loading={loading} emptyMessage="No products found" />
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} />

      {/* Approve / Reject modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ border: '1px solid #e5e7eb' }}>
            <h3 className="font-black text-gray-900 text-lg mb-1">
              {noteModal.action === 'active' ? '✅ Approve Product' : '❌ Reject Product'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {noteModal.action === 'active' ? 'Product will go live on the marketplace.' : 'Vendor will be notified with your reason.'}
            </p>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder={noteModal.action === 'active' ? 'Optional note to vendor...' : 'Reason for rejection (required)'}
              rows={3}
              className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ borderColor: '#e5e7eb' }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => updateStatus(noteModal.id, noteModal.action, adminNote)}
                disabled={actioning || (noteModal.action === 'rejected' && !adminNote.trim())}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                style={{ background: noteModal.action === 'active' ? '#059669' : '#dc2626' }}>
                {actioning ? 'Processing...' : noteModal.action === 'active' ? 'Approve' : 'Reject'}
              </button>
              <button onClick={() => { setNoteModal(null); setAdminNote(''); }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: '#f3f4f6', color: '#374151' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



