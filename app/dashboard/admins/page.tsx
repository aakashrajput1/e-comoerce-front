'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Badge from '@/components/Badge';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2, X, Check, Shield } from 'lucide-react';

const ALL_PERMISSIONS = [
  'vendors:read','vendors:write','vendors:delete','vendors:approve',
  'buyers:read','buyers:write','buyers:delete',
  'products:read','products:write','products:delete',
  'orders:read','orders:write','orders:refund',
  'reviews:read','reviews:delete',
  'wallet:read','wallet:write',
  'reports:read',
  'chat:read','chat:write',
];

const PERMISSION_GROUPS = [
  { label: 'Vendors', perms: ['vendors:read','vendors:write','vendors:delete','vendors:approve'] },
  { label: 'Buyers', perms: ['buyers:read','buyers:write','buyers:delete'] },
  { label: 'Products', perms: ['products:read','products:write','products:delete'] },
  { label: 'Orders', perms: ['orders:read','orders:write','orders:refund'] },
  { label: 'Reviews', perms: ['reviews:read','reviews:delete'] },
  { label: 'Wallet', perms: ['wallet:read','wallet:write'] },
  { label: 'Reports', perms: ['reports:read'] },
  { label: 'Chat', perms: ['chat:read','chat:write'] },
];

export default function AdminsPage() {
  const { admin: me } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPerms, setEditingPerms] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', name: '', permissions: [] as string[] });
  const [tempPerms, setTempPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/admins'); setAdmins(data.admins); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (me?.role === 'superadmin') fetchAdmins(); }, [me]);

  if (me?.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Shield className="w-12 h-12 mb-3 opacity-20" />
        <p className="font-medium">SuperAdmin access required</p>
      </div>
    );
  }

  const togglePerm = (perm: string, arr: string[], setArr: (p: string[]) => void) => {
    setArr(arr.includes(perm) ? arr.filter((p) => p !== perm) : [...arr, perm]);
  };

  const createAdmin = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/admin/admins', form);
      setShowCreate(false);
      setForm({ email: '', password: '', name: '', permissions: [] });
      fetchAdmins();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const savePerms = async (id: string) => {
    await api.patch(`/admin/admins/${id}/permissions`, { permissions: tempPerms });
    setEditingPerms(null);
    fetchAdmins();
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm('Delete this admin?')) return;
    await api.delete(`/admin/admins/${id}`);
    fetchAdmins();
  };

  const toggleStatus = async (id: string, current: string) => {
    await api.patch(`/admin/admins/${id}/status`, { status: current === 'active' ? 'suspended' : 'active' });
    fetchAdmins();
  };

  const PermissionGrid = ({ perms, selected, onToggle }: { perms: string[]; selected: string[]; onToggle: (p: string) => void }) => (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">{group.label}</p>
          <div className="flex flex-wrap gap-2">
            {group.perms.map((p) => (
              <button key={p} onClick={() => onToggle(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                  selected.includes(p) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}>
                {p.split(':')[1]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{admins.length} admins</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
          <Plus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800 text-lg">Create Admin</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <div className="space-y-4">
              {[['Name', 'name', 'text', 'Full name'], ['Email', 'email', 'email', 'admin@example.com'], ['Password', 'password', 'password', 'Min 8 chars']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input type={type} placeholder={ph} value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                <PermissionGrid perms={ALL_PERMISSIONS} selected={form.permissions}
                  onToggle={(p) => togglePerm(p, form.permissions, (perms) => setForm({ ...form, permissions: perms }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={createAdmin} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-24" />
          ))
        ) : admins.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {a.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Last login: {a.lastLogin ? formatDate(a.lastLogin) : 'Never'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={a.status} />
                <button onClick={() => { setEditingPerms(a.id); setTempPerms(a.permissions || []); }}
                  className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition" title="Edit permissions">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => toggleStatus(a.id, a.status)}
                  className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition" title="Toggle status">
                  {a.status === 'active' ? '⏸' : '▶'}
                </button>
                <button onClick={() => deleteAdmin(a.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Permissions display */}
            {editingPerms === a.id ? (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <PermissionGrid perms={ALL_PERMISSIONS} selected={tempPerms}
                  onToggle={(p) => togglePerm(p, tempPerms, setTempPerms)} />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditingPerms(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button onClick={() => savePerms(a.id)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">Save Permissions</button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(a.permissions || []).slice(0, 8).map((p: string) => (
                  <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">{p}</span>
                ))}
                {(a.permissions || []).length > 8 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-xs">+{a.permissions.length - 8} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
