'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Mail, Download, Trash2, RefreshCw, Search, CheckCircle, XCircle } from 'lucide-react';
import Pagination from '@/components/Pagination';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [activeCount, setActiveCount] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/newsletter', {
        params: { page, limit: 20, status: statusFilter || undefined, search: search || undefined },
      });
      setSubscribers(data.subscribers || []);
      setPagination(data.pagination);
      setActiveCount(data.activeCount || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subscriber?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/newsletter/${id}`);
      fetchData();
    } finally { setDeleting(null); }
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'unsubscribed' : 'active';
    await api.patch(`/admin/newsletter/${id}/status`, { status: newStatus });
    fetchData();
  };

  const exportCSV = () => {
    const url = `https://e-commorce-back.onrender.com/admin/newsletter/export${statusFilter ? `?status=${statusFilter}` : ''}`;
    const token = localStorage.getItem('admin_token');
    // Create a temporary link with auth header workaround via fetch
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `newsletter-subscribers-${Date.now()}.csv`;
        a.click();
      });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-6 h-6" style={{ color: '#cf3232' }} /> Newsletter
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeCount} active subscriber{activeCount !== 1 ? 's' : ''} · {pagination.total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#cf3232' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: pagination.total, color: '#cf3232' },
          { label: 'Active', value: activeCount, color: '#059669' },
          { label: 'Unsubscribed', value: pagination.total - activeCount, color: '#6b7280' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 bg-white" />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#cf3232' }}>
            Search
          </button>
        </form>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-white outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-bold text-slate-500">No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#FAEFEF' }}>
                  {['Email', 'Name', 'Status', 'Source', 'Subscribed', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid #f3f4f6' }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{sub.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{sub.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit"
                        style={{
                          background: sub.status === 'active' ? '#d1fae5' : '#f3f4f6',
                          color: sub.status === 'active' ? '#065f46' : '#6b7280',
                        }}>
                        {sub.status === 'active'
                          ? <><CheckCircle className="w-3 h-3" /> Active</>
                          : <><XCircle className="w-3 h-3" /> Unsubscribed</>}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs capitalize">{sub.source}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{formatDate(sub.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(sub._id, sub.status)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                          style={{
                            background: sub.status === 'active' ? '#fef2f2' : '#f0fdf4',
                            color: sub.status === 'active' ? '#991b1b' : '#065f46',
                          }}>
                          {sub.status === 'active' ? 'Unsubscribe' : 'Reactivate'}
                        </button>
                        <button onClick={() => handleDelete(sub._id)} disabled={deleting === sub._id}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <Pagination page={page} pages={pagination.pages} onChange={setPage} />
      )}
    </div>
  );
}
