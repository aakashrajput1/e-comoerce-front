'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/lib/vendorAuth';
import { formatCurrency } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, X, Loader2, Star, Package,
  ChevronDown, ChevronUp, Tag, Layers, FileText, Zap, Eye,
} from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const INPUT: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13, outline: 'none' };
const BTN: React.CSSProperties = { background: '#cf3232', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };

interface VariantOption { name: string; values: string[] }
interface Variant { title: string; options: { name: string; value: string }[]; price: string; compareAtPrice: string; inventory: string; sku: string; isAvailable: boolean }
interface Spec { group: string; key: string; value: string }

const emptyForm = () => ({
  name: '', description: '', price: '', compareAtPrice: '', inventory: '',
  category: '', subCategory: '', sku: '', weight: '', returnPolicyDays: '7', status: 'draft',
  tags: '',
  highlights: [''],
  hasVariants: false,
  variantOptions: [] as VariantOption[],
  variants: [] as Variant[],
  specifications: [] as Spec[],
});

type FormType = ReturnType<typeof emptyForm>;

// ── Generate variant combinations ────────────────────────────────────────────
function generateVariants(options: VariantOption[]): Variant[] {
  if (!options.length) return [];
  const combine = (arrays: string[][]): string[][] => {
    if (!arrays.length) return [[]];
    const [first, ...rest] = arrays;
    return first.flatMap(v => combine(rest).map(c => [v, ...c]));
  };
  const combos = combine(options.map(o => o.values.filter(Boolean)));
  return combos.map(combo => ({
    title: combo.join(' / '),
    options: combo.map((v, i) => ({ name: options[i].name, value: v })),
    price: '', compareAtPrice: '', inventory: '0', sku: '', isAvailable: true,
  }));
}

// ── Variant Options Builder ───────────────────────────────────────────────────
function VariantOptionsBuilder({ options, onChange }: { options: VariantOption[]; onChange: (opts: VariantOption[]) => void }) {
  const addOption = () => onChange([...options, { name: '', values: [''] }]);
  const removeOption = (i: number) => onChange(options.filter((_, idx) => idx !== i));
  const updateName = (i: number, name: string) => onChange(options.map((o, idx) => idx === i ? { ...o, name } : o));
  const addValue = (i: number) => onChange(options.map((o, idx) => idx === i ? { ...o, values: [...o.values, ''] } : o));
  const removeValue = (i: number, vi: number) => onChange(options.map((o, idx) => idx === i ? { ...o, values: o.values.filter((_, vidx) => vidx !== vi) } : o));
  const updateValue = (i: number, vi: number, val: string) => onChange(options.map((o, idx) => idx === i ? { ...o, values: o.values.map((v, vidx) => vidx === vi ? val : v) } : o));

  const PRESETS: Record<string, string[]> = {
    'Color': ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray'],
    'Size': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    'Storage': ['64GB', '128GB', '256GB', '512GB', '1TB'],
    'RAM': ['4GB', '8GB', '16GB', '32GB'],
    'Material': ['Cotton', 'Polyester', 'Leather', 'Wool', 'Silk', 'Denim'],
  };

  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-2">
            <input value={opt.name} onChange={e => updateName(i, e.target.value)} placeholder="Option name (e.g. Color, Size)"
              style={{ ...INPUT, flex: 1 }} list={`preset-${i}`}
              onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
            <datalist id={`preset-${i}`}>{Object.keys(PRESETS).map(p => <option key={p} value={p} />)}</datalist>
            <button type="button" onClick={() => removeOption(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><X className="w-4 h-4" /></button>
          </div>

          {/* Quick preset buttons */}
          {opt.name && PRESETS[opt.name] && (
            <div className="flex flex-wrap gap-1">
              {PRESETS[opt.name].map(preset => (
                <button key={preset} type="button"
                  onClick={() => { if (!opt.values.includes(preset)) updateValue(i, opt.values.length, preset); else { const idx = opt.values.indexOf(preset); removeValue(i, idx); } }}
                  className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                  style={{ background: opt.values.includes(preset) ? '#cf3232' : '#f3f4f6', color: opt.values.includes(preset) ? '#fff' : '#374151', border: '1px solid ' + (opt.values.includes(preset) ? '#cf3232' : '#e5e7eb') }}>
                  {preset}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {opt.values.map((val, vi) => (
              <div key={vi} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                <input value={val} onChange={e => updateValue(i, vi, e.target.value)} placeholder="Value"
                  className="text-xs outline-none w-20" style={{ color: '#111827' }} />
                <button type="button" onClick={() => removeValue(i, vi)} className="text-gray-300 hover:text-red-400"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <button type="button" onClick={() => addValue(i)}
              className="px-2 py-1 rounded-lg text-xs font-medium" style={{ border: '1px dashed #d1d5db', color: '#6b7280' }}>
              + Add value
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addOption}
        className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cf3232' }}>
        <Plus className="w-4 h-4" /> Add option
      </button>
    </div>
  );
}

// ── Variants Table ────────────────────────────────────────────────────────────
function VariantsTable({ variants, onChange }: { variants: Variant[]; onChange: (v: Variant[]) => void }) {
  const update = (i: number, key: keyof Variant, val: any) =>
    onChange(variants.map((v, idx) => idx === i ? { ...v, [key]: val } : v));

  if (!variants.length) return <p className="text-xs text-gray-400 text-center py-4">Add options above to generate variants</p>;

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e5e7eb' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: '#FAEFEF', borderBottom: '1px solid #e5e7eb' }}>
            {['Variant', 'Price ($)', 'Compare ($)', 'Stock', 'SKU', 'Available'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((v, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td className="px-3 py-2 font-semibold text-gray-800">{v.title}</td>
              <td className="px-3 py-2">
                <input type="number" step="0.01" value={v.price} onChange={e => update(i, 'price', e.target.value)}
                  placeholder="Same as base" className="w-24 px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1px solid #e5e7eb' }} />
              </td>
              <td className="px-3 py-2">
                <input type="number" step="0.01" value={v.compareAtPrice} onChange={e => update(i, 'compareAtPrice', e.target.value)}
                  placeholder="—" className="w-20 px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1px solid #e5e7eb' }} />
              </td>
              <td className="px-3 py-2">
                <input type="number" value={v.inventory} onChange={e => update(i, 'inventory', e.target.value)}
                  className="w-16 px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1px solid #e5e7eb' }} />
              </td>
              <td className="px-3 py-2">
                <input value={v.sku} onChange={e => update(i, 'sku', e.target.value)}
                  placeholder="SKU" className="w-24 px-2 py-1 rounded-lg text-xs outline-none" style={{ border: '1px solid #e5e7eb' }} />
              </td>
              <td className="px-3 py-2">
                <input type="checkbox" checked={v.isAvailable} onChange={e => update(i, 'isAvailable', e.target.checked)}
                  className="w-4 h-4 accent-rose-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Specifications Builder ────────────────────────────────────────────────────
function SpecsBuilder({ specs, onChange }: { specs: Spec[]; onChange: (s: Spec[]) => void }) {
  const add = () => onChange([...specs, { group: 'General', key: '', value: '' }]);
  const remove = (i: number) => onChange(specs.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Spec, val: string) =>
    onChange(specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const SPEC_GROUPS = ['General', 'Display', 'Performance', 'Battery', 'Camera', 'Connectivity', 'Design', 'Other'];

  return (
    <div className="space-y-2">
      {specs.map((spec, i) => (
        <div key={i} className="flex items-center gap-2">
          <select value={spec.group} onChange={e => update(i, 'group', e.target.value)}
            className="text-xs outline-none rounded-lg px-2 py-2" style={{ border: '1px solid #e5e7eb', width: 110, color: '#374151' }}>
            {SPEC_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input value={spec.key} onChange={e => update(i, 'key', e.target.value)} placeholder="Key (e.g. Screen Size)"
            className="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none" style={{ border: '1px solid #e5e7eb', color: '#111827' }} />
          <input value={spec.value} onChange={e => update(i, 'value', e.target.value)} placeholder="Value (e.g. 6.5 inches)"
            className="flex-1 px-2.5 py-2 rounded-lg text-xs outline-none" style={{ border: '1px solid #e5e7eb', color: '#111827' }} />
          <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cf3232' }}>
        <Plus className="w-4 h-4" /> Add specification
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<FormType>(emptyForm());
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'specs' | 'highlights'>('basic');
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await vendorApi.get('/vendor/products');
      setProducts(data.products || []);
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    vendorApi.get('/categories?active=true').then(r => setCategories(r.data.categories || []));
  }, []);

  const openAdd = () => {
    setEditing(null); setForm(emptyForm()); setError(''); setActiveTab('basic'); setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name || '', description: p.description || '',
      price: String(p.price || ''), compareAtPrice: String(p.compareAtPrice || ''),
      inventory: String(p.inventory || ''), category: p.category?.name || p.category || '',
      subCategory: p.subCategory || '', sku: p.sku || '', weight: String(p.weight || ''),
      returnPolicyDays: String(p.returnPolicyDays || 7), status: p.status || 'draft',
      tags: (p.tags || []).join(', '),
      highlights: p.highlights?.length ? p.highlights : [''],
      hasVariants: p.hasVariants || false,
      variantOptions: p.variantOptions || [],
      variants: (p.variants || []).map((v: any) => ({
        ...v, price: String(v.price || ''), compareAtPrice: String(v.compareAtPrice || ''), inventory: String(v.inventory || 0),
      })),
      specifications: p.specifications || [],
    });
    setError(''); setActiveTab('basic'); setShowModal(true);
  };

  // When variant options change, regenerate variants
  const handleVariantOptionsChange = (opts: VariantOption[]) => {
    const newVariants = generateVariants(opts);
    setForm(f => ({ ...f, variantOptions: opts, variants: newVariants }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        inventory: form.hasVariants ? undefined : parseInt(form.inventory || '0'),
        weight: form.weight ? parseFloat(form.weight) : 0,
        returnPolicyDays: parseInt(form.returnPolicyDays),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        highlights: form.highlights.filter(Boolean),
        variants: form.variants.map(v => ({
          ...v,
          price: v.price ? parseFloat(v.price) : null,
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
          inventory: parseInt(v.inventory || '0'),
        })),
      };

      if (editing) {
        await vendorApi.patch(`/vendor/products/${editing._id}`, payload);
      } else {
        await vendorApi.post('/vendor/products', payload);
      }
      setShowModal(false); fetchProducts();
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save product'); }
    finally { setSaving(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await vendorApi.delete(`/vendor/products/${id}`);
    fetchProducts();
  };

  const TABS = [
    { key: 'basic', label: 'Basic Info', icon: FileText },
    { key: 'variants', label: 'Variants', icon: Layers },
    { key: 'specs', label: 'Specifications', icon: Tag },
    { key: 'highlights', label: 'Highlights', icon: Zap },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products</p>
        </div>
        <button onClick={openAdd} style={BTN}><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #e5e7eb' }}>
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-700">No products yet</p>
          <button onClick={openAdd} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#cf3232' }}>Add Your First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p._id} style={CARD} className="overflow-hidden">
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                  style={{
                    background: p.status === 'active' ? '#d1fae5' : p.status === 'pending_review' ? '#fef9c3' : p.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                    color: p.status === 'active' ? '#065f46' : p.status === 'pending_review' ? '#854d0e' : p.status === 'rejected' ? '#991b1b' : '#4b5563',
                  }}>
                  {p.status === 'pending_review' ? '⏳ In Review' : p.status === 'rejected' ? '❌ Rejected' : p.status}
                </span>
                {p.hasVariants && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#dbeafe', color: '#1e40af' }}>
                    {p.variants?.length} variants
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.category?.name || p.category}{p.subCategory?.name || p.subCategory ? ` › ${p.subCategory?.name || p.subCategory}` : ''}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-black text-gray-900">{formatCurrency(p.price)}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {p.averageRating?.toFixed(1) || '—'} · {p.inventory} stock
                  </div>
                </div>
                {p.specifications?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{p.specifications.length} specs · {p.highlights?.length || 0} highlights</p>
                )}
                {p.status === 'rejected' && p.adminNote && (
                  <p className="text-xs mt-1 px-2 py-1 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                    Reason: {p.adminNote}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => router.push(`/vendor/products/${p._id}`)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold"
                    style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => deleteProduct(p._id)} className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-semibold" style={{ border: '1px solid #fee2e2', color: '#dc2626', background: '#fff5f5' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ border: '1px solid #e5e7eb', maxHeight: '92vh' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <p className="font-bold text-gray-900 text-base">{editing ? 'Edit Product' : 'Add New Product'}</p>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
              {TABS.map(tab => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key as any)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={activeTab === tab.key ? { background: '#cf3232', color: '#fff' } : { background: '#FAEFEF', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.key === 'variants' && form.variants.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: activeTab === 'variants' ? 'rgba(255,255,255,0.25)' : '#e5e7eb' }}>
                      {form.variants.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {error && <div className="px-4 py-3 rounded-lg text-sm font-medium" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</div>}

              {/* ── Basic Info ── */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name *</label>
                    <input style={INPUT} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Earbuds Pro"
                      onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                    <textarea style={{ ...INPUT, resize: 'none' } as any} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed product description..."
                      onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price ($) *</label>
                      <input style={INPUT} type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00"
                        onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compare Price ($)</label>
                      <input style={INPUT} type="number" step="0.01" value={form.compareAtPrice} onChange={e => setForm({ ...form, compareAtPrice: e.target.value })} placeholder="Original / MRP"
                        onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                    </div>
                  </div>
                  {!form.hasVariants && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Inventory *</label>
                        <input style={INPUT} type="number" required={!form.hasVariants} value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} placeholder="0"
                          onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">SKU</label>
                        <input style={INPUT} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001"
                          onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                      <select style={INPUT} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Return Policy</label>
                      <select style={INPUT} value={form.returnPolicyDays} onChange={e => setForm({ ...form, returnPolicyDays: e.target.value })}>
                        {[0, 7, 14, 30].map(d => <option key={d} value={d}>{d === 0 ? 'No returns' : `${d} days`}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Weight (grams)</label>
                      <input style={INPUT} type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="0"
                        onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                      <select style={INPUT} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="draft">Draft (save privately)</option>
                        <option value="pending_review">Submit for Review</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags (comma separated)</label>
                    <input style={INPUT} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="wireless, earbuds, bluetooth"
                      onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                  </div>
                </div>
              )}

              {/* ── Variants ── */}
              {activeTab === 'variants' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                    <input type="checkbox" id="hasVariants" checked={form.hasVariants}
                      onChange={e => setForm({ ...form, hasVariants: e.target.checked, variantOptions: [], variants: [] })}
                      className="w-4 h-4 accent-rose-700" />
                    <label htmlFor="hasVariants" className="text-sm font-semibold text-gray-800 cursor-pointer">
                      This product has multiple variants (color, size, etc.)
                    </label>
                  </div>

                  {form.hasVariants && (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Variant Options</p>
                        <VariantOptionsBuilder options={form.variantOptions} onChange={handleVariantOptionsChange} />
                      </div>
                      {form.variants.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-2">Variant Inventory & Pricing ({form.variants.length} variants)</p>
                          <VariantsTable variants={form.variants} onChange={v => setForm({ ...form, variants: v })} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── Specifications ── */}
              {activeTab === 'specs' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Add technical specifications shown in a table on the product page.</p>
                  <SpecsBuilder specs={form.specifications} onChange={s => setForm({ ...form, specifications: s })} />
                </div>
              )}

              {/* ── Highlights ── */}
              {activeTab === 'highlights' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Key selling points shown as bullet points on the product page.</p>
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-300 flex-shrink-0">•</span>
                      <input value={h} onChange={e => setForm({ ...form, highlights: form.highlights.map((v, idx) => idx === i ? e.target.value : v) })}
                        placeholder={`Highlight ${i + 1} (e.g. 40hr battery life)`}
                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb', color: '#111827' }}
                        onFocus={e => (e.target.style.borderColor = '#cf3232')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                      {form.highlights.length > 1 && (
                        <button type="button" onClick={() => setForm({ ...form, highlights: form.highlights.filter((_, idx) => idx !== i) })}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setForm({ ...form, highlights: [...form.highlights, ''] })}
                    className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#cf3232' }}>
                    <Plus className="w-4 h-4" /> Add highlight
                  </button>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid #e5e7eb' }}>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#FAEFEF', color: '#374151', border: '1px solid #e5e7eb' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: '#cf3232' }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
