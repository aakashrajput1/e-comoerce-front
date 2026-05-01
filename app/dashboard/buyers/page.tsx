'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import Pagination from '@/components/Pagination';
import { formatDate } from '@/lib/utils';
import { Search, CheckCircle, PauseCircle, RefreshCw, Plus, X, Loader2, Eye, EyeOff } from 'lucide-react';

const INPUT: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', background: '#FAEFEF',
  color: '#111827', fontSize: 13, fontWeight: 500, outline: 'none',
};

const BTN_PRIMARY: React.CSSProperties = {
  background: '#cf3232', color: '#fff', border: 'none',
  borderRadius: 10, padding: '10px 20px', fontSize: 13,
  fontWeight: 700, cursor: 'pointer',
};

const BTN_GHOST: React.CSSProperties = {
  background: '#FAEFEF', color: '#6b7280', border: '1.5px solid #e5e7eb',
  borderRadius: 10, padding: '10px 20px', fontSize: 13,
  fontWeight: 700, cursor: 'pointer',
};

export default function BuyersPage() {
  const router = useRouter();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Add buyer modal
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/buyers', { params: { search, status, page, limit: 15 } });
      setBuyers(data.buyers);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBuyers(); }, [search, status, page]);

  const updateStatus = async (id: string, newStatus: string) => {
    await api.patch(`/admin/buyers/${id}/status`, { status: newStatus });
    fetchBuyers();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/admin/buyers/create', form);
      setShowAdd(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', phone: '' });
      fetchBuyers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create buyer');
    } finally { setSaving(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Buyer', render: (r: any) => (
        <button className="flex items-center gap-3 text-left" onClick={() => router.push(`/dashboard/buyers/${r._id}`)}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white flex-shrink-0"
            style={{ background: '#cf3232' }}>
            {r.firstName?.[0]}{r.lastName?.[0]}
          </div>
          <div>
            <p className="font-bold text-sm hover:underline" style={{ color: '#cf3232' }}>{r.firstName} {r.lastName}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>{r.email}</p>
          </div>
        </button>
      ),
    },
    { key: 'phone', label: 'Phone', render: (r: any) => <span className="text-xs font-medium" style={{ color: '#6b3a52' }}>{r.phone || '—'}</span> },
    {
      key: 'isEmailVerified', label: 'Verified', render: (r: any) => (
        <span className="text-xs font-bold" style={{ color: r.isEmailVerified ? '#059669' : '#9ca3af' }}>
          {r.isEmailVerified ? '✓ Yes' : 'No'}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (r: any) => <Badge status={r.status} /> },
    { key: 'createdAt', label: 'Joined', render: (r: any) => <span className="text-xs" style={{ color: '#9ca3af' }}>{formatDate(r.createdAt)}</span> },
    {
      key: 'actions', label: 'Actions', render: (r: any) => (
        <div className="flex items-center gap-1">
          {r.status !== 'active' && (
            <button onClick={(e) => { e.stopPropagation(); updateStatus(r._id, 'active'); }}
              className="p-1.5 rounded-lg" style={{ color: '#059669', background: '#d1fae5' }} title="Activate">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {r.status !== 'suspended' && (
            <button onClick={(e) => { e.stopPropagation(); updateStatus(r._id, 'suspended'); }}
              className="p-1.5 rounded-lg" style={{ color: '#cf3232', background: '#f3f4f6' }} title="Suspend">
              <PauseCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#111827' }}>Buyers</h1>
          <p className="text-sm font-medium mt-0.5" style={{ color: '#6b7280' }}>{pagination.total} registered buyers</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#cf3232', boxShadow: '0 4px 14px rgba(159,18,57,0.3)' }}>
          <Plus className="w-4 h-4" /> Add Buyer
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#c084a0' }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search buyers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
            style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#111827' }} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium outline-none"
          style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#111827' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button onClick={fetchBuyers} className="p-2.5 rounded-xl" style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}>
          <RefreshCw className="w-4 h-4" style={{ color: '#cf3232' }} />
        </button>
      </div>

      <DataTable columns={columns} data={buyers} loading={loading} emptyMessage="No buyers found" />
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} />

      {/* Add Buyer Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,10,18,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: '#fff', border: '1.5px solid #e5e7eb' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1.5px solid #e5e7eb' }}>
              <div>
                <p className="font-black text-base" style={{ color: '#111827' }}>Add New Buyer</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: '#9ca3af' }}>Account will be active immediately</p>
              </div>
              <button onClick={() => { setShowAdd(false); setError(''); }}
                className="p-2 rounded-xl" style={{ background: '#FAEFEF', color: '#6b7280' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdd} className="px-6 py-5 space-y-4">
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{ background: '#fee2e2', color: '#991b1b', border: '1.5px solid #fca5a5' }}>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'First Name', key: 'firstName', placeholder: 'John' },
                  { label: 'Last Name', key: 'lastName', placeholder: 'Doe' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>{label}</label>
                    <input type="text" placeholder={placeholder} value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required style={INPUT}
                      onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
                      onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                ))}
              </div>

              {[
                { label: 'Email', key: 'email', type: 'email', placeholder: 'buyer@example.com' },
                { label: 'Phone', key: 'phone', type: 'text', placeholder: '+1 234 567 8900 (optional)' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key !== 'phone'}
                    style={INPUT}
                    onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#374151' }}>Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required style={{ ...INPUT, paddingRight: 40 }}
                    onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
                    onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#c084a0' }}>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAdd(false); setError(''); }} style={BTN_GHOST} className="flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...BTN_PRIMARY, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Creating...' : 'Create Buyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
