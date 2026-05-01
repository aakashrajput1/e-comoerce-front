'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { Plus, X, Loader2, ChevronDown, ChevronRight, Pencil, Trash2, Tag, Layers } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const INPUT: React.CSSProperties = { width: '100%', padding: '9px 13px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13, outline: 'none' };
const BTN: React.CSSProperties = { background: '#cf3232', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
const BTN_GHOST: React.CSSProperties = { background: '#FAEFEF', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };

interface Category { _id: string; name: string; icon: string; description: string; isActive: boolean; subCategoryCount: number; }
interface SubCategory { _id: string; name: string; description: string; isActive: boolean; category: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subMap, setSubMap] = useState<Record<string, SubCategory[]>>({});
  const [subLoading, setSubLoading] = useState<string | null>(null);

  // Modals
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddSub, setShowAddSub] = useState<string | null>(null); // categoryId
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editSub, setEditSub] = useState<SubCategory | null>(null);

  // Forms
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '' });
  const [subForm, setSubForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const loadSubs = async (catId: string) => {
    if (subMap[catId]) return;
    setSubLoading(catId);
    try {
      const { data } = await api.get(`/categories/${catId}/subcategories`);
      setSubMap((prev) => ({ ...prev, [catId]: data.subCategories }));
    } finally { setSubLoading(null); }
  };

  const toggleExpand = (catId: string) => {
    if (expanded === catId) { setExpanded(null); return; }
    setExpanded(catId);
    loadSubs(catId);
  };

  const refreshSubs = async (catId: string) => {
    const { data } = await api.get(`/categories/${catId}/subcategories`);
    setSubMap((prev) => ({ ...prev, [catId]: data.subCategories }));
  };

  // ── Category CRUD ──────────────────────────────────────────────────────────
  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/categories', catForm);
      setShowAddCat(false); setCatForm({ name: '', description: '', icon: '' });
      fetchCategories();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEditCat = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editCat) return; setSaving(true); setError('');
    try {
      await api.patch(`/categories/${editCat._id}`, catForm);
      setEditCat(null); setCatForm({ name: '', description: '', icon: '' });
      fetchCategories();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteCat = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its subcategories?`)) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
    setSubMap((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const toggleCatStatus = async (cat: Category) => {
    await api.patch(`/categories/${cat._id}`, { isActive: !cat.isActive });
    fetchCategories();
  };

  // ── SubCategory CRUD ───────────────────────────────────────────────────────
  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault(); if (!showAddSub) return; setSaving(true); setError('');
    try {
      await api.post(`/categories/${showAddSub}/subcategories`, subForm);
      setShowAddSub(null); setSubForm({ name: '', description: '' });
      refreshSubs(showAddSub); fetchCategories();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEditSub = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editSub) return; setSaving(true); setError('');
    try {
      await api.patch(`/categories/subcategories/${editSub._id}`, subForm);
      setEditSub(null); setSubForm({ name: '', description: '' });
      refreshSubs(editSub.category);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeleteSub = async (sub: SubCategory) => {
    if (!confirm(`Delete subcategory "${sub.name}"?`)) return;
    await api.delete(`/categories/subcategories/${sub._id}`);
    refreshSubs(sub.category); fetchCategories();
  };

  const toggleSubStatus = async (sub: SubCategory) => {
    await api.patch(`/categories/subcategories/${sub._id}`, { isActive: !sub.isActive });
    refreshSubs(sub.category);
  };

  // ── Modal ──────────────────────────────────────────────────────────────────
  const Modal = ({ title, subtitle, onClose, onSubmit, children }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl" style={{ border: '1px solid #e5e7eb' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <p className="font-bold text-gray-900">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="rounded-lg px-4 py-3 text-sm font-medium" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
          {children}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} style={BTN_GHOST} className="flex-1">Cancel</button>
            <button type="submit" disabled={saving} style={{ ...BTN, flex: 1, justifyContent: 'center' }}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories · {categories.reduce((s, c) => s + c.subCategoryCount, 0)} subcategories</p>
        </div>
        <button onClick={() => { setShowAddCat(true); setError(''); setCatForm({ name: '', description: '', icon: '' }); }} style={BTN}>
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse bg-white" style={{ border: '1px solid #e5e7eb' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat._id} style={CARD}>
              {/* Category row */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <button onClick={() => toggleExpand(cat._id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {expanded === cat._id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <span className="text-xl w-7 text-center">{cat.icon || '📦'}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                    {!cat.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </div>
                  {cat.description && <p className="text-xs text-gray-400 truncate">{cat.description}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-[#FAEFEF] px-2.5 py-1 rounded-full" style={{ border: '1px solid #e5e7eb' }}>
                    <Layers className="w-3 h-3" /> {cat.subCategoryCount} subs
                  </span>

                  <button
                    onClick={() => { setShowAddSub(cat._id); setError(''); setSubForm({ name: '', description: '' }); if (!subMap[cat._id]) loadSubs(cat._id); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                    title="Add subcategory">
                    <Plus className="w-3 h-3" /> Add Sub
                  </button>

                  <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, description: cat.description, icon: cat.icon }); setError(''); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Edit category">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button onClick={() => toggleCatStatus(cat)}
                    className="px-2 py-1 rounded-lg text-xs font-bold transition-colors"
                    style={{ background: cat.isActive ? '#d1fae5' : '#f3f4f6', color: cat.isActive ? '#065f46' : '#6b7280' }}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </button>

                  <button onClick={() => handleDeleteCat(cat._id, cat.name)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expanded === cat._id && (
                <div style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                  {subLoading === cat._id ? (
                    <div className="px-6 py-4 text-sm text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
                    </div>
                  ) : (subMap[cat._id] || []).length === 0 ? (
                    <div className="px-6 py-4 text-sm text-gray-400">No subcategories yet.</div>
                  ) : (
                    <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(subMap[cat._id] || []).map((sub) => (
                        <div key={sub._id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white"
                          style={{ border: '1px solid #e5e7eb' }}>
                          <Tag className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          <span className={`flex-1 text-sm font-medium truncate ${sub.isActive ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                            {sub.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditSub(sub); setSubForm({ name: sub.name, description: sub.description }); setError(''); }}
                              className="p-1 rounded hover:bg-gray-100 text-gray-400" title="Edit">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => toggleSubStatus(sub)}
                              className="px-1.5 py-0.5 rounded text-xs font-bold"
                              style={{ background: sub.isActive ? '#d1fae5' : '#f3f4f6', color: sub.isActive ? '#065f46' : '#9ca3af' }}>
                              {sub.isActive ? 'ON' : 'OFF'}
                            </button>
                            <button onClick={() => handleDeleteSub(sub)}
                              className="p-1 rounded hover:bg-red-50 text-red-400" title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCat && (
        <Modal title="Add Category" subtitle="Create a new product category" onClose={() => setShowAddCat(false)} onSubmit={handleAddCat}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category Name *</label>
            <input style={INPUT} placeholder="e.g. Electronics" value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Icon (emoji)</label>
            <input style={INPUT} placeholder="e.g. 💻" value={catForm.icon}
              onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea style={{ ...INPUT, resize: 'none' }} rows={2} placeholder="Short description..."
              value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </Modal>
      )}

      {/* Edit Category Modal */}
      {editCat && (
        <Modal title="Edit Category" onClose={() => setEditCat(null)} onSubmit={handleEditCat}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category Name *</label>
            <input style={INPUT} value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Icon (emoji)</label>
            <input style={INPUT} value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea style={{ ...INPUT, resize: 'none' }} rows={2} value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </Modal>
      )}

      {/* Add SubCategory Modal */}
      {showAddSub && (
        <Modal title="Add Subcategory"
          subtitle={`Under: ${categories.find(c => c._id === showAddSub)?.name}`}
          onClose={() => setShowAddSub(null)} onSubmit={handleAddSub}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subcategory Name *</label>
            <input style={INPUT} placeholder="e.g. Smartphones" value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} required
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <input style={INPUT} placeholder="Optional description" value={subForm.description}
              onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </Modal>
      )}

      {/* Edit SubCategory Modal */}
      {editSub && (
        <Modal title="Edit Subcategory" onClose={() => setEditSub(null)} onSubmit={handleEditSub}>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subcategory Name *</label>
            <input style={INPUT} value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} required
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <input style={INPUT} value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
          </div>
        </Modal>
      )}
    </div>
  );
}
