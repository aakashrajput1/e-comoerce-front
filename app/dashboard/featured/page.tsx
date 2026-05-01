'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Star, RefreshCw, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#fef9c3', color: '#854d0e' },
  approved: { bg: '#dbeafe', color: '#1e40af' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  active:   { bg: '#d1fae5', color: '#065f46' },
  expired:  { bg: '#f3f4f6', color: '#6b7280' },
};

export default function AdminFeaturedPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionModal, setActionModal] = useState<any>(null);
  const [form, setForm] = useState({ feeCents: '', feeNote: '', rejectionReason: '', durationDays: '30' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/featured', { params: { status: statusFilter || undefined, page, limit: 20 } });
      setApplications(data.applications || []);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter, page]);

  const handleAction = async (action: string) => {
    if (!actionModal) return;
    setSaving(true);
    try {
      await api.patch(`/admin/featured/${actionModal._id}`, {
        action,
        feeCents: form.feeCents ? Math.round(parseFloat(form.feeCents) * 100) : 0,
        feeNote: form.feeNote,
        rejectionReason: form.rejectionReason,
        durationDays: parseInt(form.durationDays) || 30,
      });
      setActionModal(null);
      setForm({ feeCents: '', feeNote: '', rejectionReason: '', durationDays: '30' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="w-6 h-6" style={{ color: '#cf3232' }} /> Featured Products
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} applications</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-white outline-none">
            <option value="">All Status</option>
            {['pending','approved','rejected','active','expired'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-10 h-10 mx-auto mb-2 text-slate-200" />
            <p className="font-bold text-slate-500">No applications found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
            {applications.map(app => {
              const st = STATUS_STYLE[app.status] || STATUS_STYLE.pending;
              return (
                <div key={app._id} className="p-5 flex items-start gap-4 flex-wrap">
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                    {app.product?.images?.[0]
                      ? <img src={app.product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800">{app.product?.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{app.vendor?.businessName} · {app.vendor?.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#374151' }}>
                        📍 {app.position?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                        🗓 {app.durationDays || 30} days
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize" style={st}>{app.status}</span>
                      {app.feeCents > 0 && <span className="text-xs font-bold text-green-700">Fee: {formatCurrency(app.feeCents / 100)}</span>}
                      {app.paid && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>}
                      {app.expiresAt && <span className="text-xs text-slate-400">Expires {formatDate(app.expiresAt)}</span>}
                    </div>
                    {app.vendorNote && <p className="text-xs text-slate-500 mt-1 italic">"{app.vendorNote}"</p>}
                    <p className="text-xs text-slate-400 mt-1">Applied {formatDate(app.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => setActionModal(app)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                          style={{ background: '#059669' }}>
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => { setActionModal({ ...app, _action: 'reject' }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: '#fee2e2', color: '#991b1b' }}>
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    {app.status === 'approved' && !app.paid && (
                      <button onClick={() => setActionModal({ ...app, _action: 'activate' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style={{ background: '#cf3232' }}>
                        <Zap className="w-3.5 h-3.5" /> Activate Free
                      </button>
                    )}
                    {app.status === 'active' && (
                      <button onClick={() => handleAction('expire')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: '#f3f4f6', color: '#6b7280' }}>
                        Expire
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pagination.pages > 1 && <Pagination page={page} pages={pagination.pages} onChange={setPage} />}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: '1px solid #e5e7eb' }}>
            <div className="p-5 border-b" style={{ borderColor: '#f3f4f6' }}>
              <p className="font-black text-gray-900">
                {actionModal._action === 'reject' ? 'Reject Application' :
                 actionModal._action === 'activate' ? 'Activate for Free' : 'Approve Application'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{actionModal.product?.name}</p>
            </div>
            <div className="p-5 space-y-4">
              {(!actionModal._action || actionModal._action === 'approve') && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Featuring Fee ($)</label>
                    <input type="number" min="0" step="0.01" value={form.feeCents}
                      onChange={e => setForm(p => ({ ...p, feeCents: e.target.value }))}
                      placeholder="e.g. 29.99 (0 for free)"
                      className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb' }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Note to Vendor (optional)</label>
                    <textarea value={form.feeNote} onChange={e => setForm(p => ({ ...p, feeNote: e.target.value }))}
                      placeholder="Any instructions or notes for the vendor..."
                      rows={2} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                      style={{ borderColor: '#e5e7eb' }} />
                  </div>
                </>
              )}
              {actionModal._action === 'activate' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration (days)</label>
                  <input type="number" min="1" value={form.durationDays}
                    onChange={e => setForm(p => ({ ...p, durationDays: e.target.value }))}
                    className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
              )}
              {actionModal._action === 'reject' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Rejection Reason</label>
                  <textarea value={form.rejectionReason} onChange={e => setForm(p => ({ ...p, rejectionReason: e.target.value }))}
                    placeholder="Tell the vendor why..."
                    rows={2} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
              )}
            </div>
            <div className="p-5 border-t flex gap-3" style={{ borderColor: '#f3f4f6' }}>
              <button onClick={() => handleAction(actionModal._action || 'approve')} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: actionModal._action === 'reject' ? '#dc2626' : '#059669' }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionModal._action === 'reject' ? 'Confirm Reject' : actionModal._action === 'activate' ? 'Activate Now' : 'Approve & Notify'}
              </button>
              <button onClick={() => { setActionModal(null); setForm({ feeCents: '', feeNote: '', rejectionReason: '', durationDays: '30' }); }}
                className="px-4 py-2.5 rounded-xl text-sm font-bold"
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
