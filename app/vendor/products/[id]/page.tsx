'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendorApi } from '@/lib/vendorAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft, Package, Tag, Star, BarChart2, Layers,
  CheckCircle, AlertCircle, Clock, Loader2, Edit2,
  TrendingUp, ShoppingCart, RotateCcw, Eye,
} from 'lucide-react';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:         { bg: '#d1fae5', color: '#065f46', label: '✓ Live on Marketplace' },
  draft:          { bg: '#f3f4f6', color: '#4b5563', label: 'Draft' },
  pending_review: { bg: '#fef9c3', color: '#854d0e', label: '⏳ Pending Admin Review' },
  rejected:       { bg: '#fee2e2', color: '#991b1b', label: '✗ Rejected' },
  archived:       { bg: '#f3f4f6', color: '#6b7280', label: 'Archived' },
};

export default function VendorProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    vendorApi.get(`/vendor/products/${id}`)
      .then(r => setProduct(r.data.product))
      .catch(() => router.push('/vendor/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitForReview = async () => {
    setSubmitting(true);
    try {
      await vendorApi.patch(`/vendor/products/${id}`, { status: 'pending_review' });
      setProduct((p: any) => ({ ...p, status: 'pending_review' }));
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#cf3232' }} />
    </div>
  );
  if (!product) return null;

  const s = STATUS_STYLE[product.status] || STATUS_STYLE.draft;
  const disc = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.push('/vendor/products')}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Products
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-gray-800 truncate max-w-xs">{product.name}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
            {s.label}
          </span>
          <button onClick={() => router.push(`/vendor/products?edit=${id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition"
            style={{ background: '#FAEFEF', color: '#cf3232', border: '1px solid #fecdd3' }}>
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          {product.status === 'active' && (
            <a href={`/product/${id}`} target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition"
              style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
              <Eye className="w-3.5 h-3.5" /> View Live
            </a>
          )}
        </div>
      </div>

      {/* Status alerts */}
      {product.status === 'pending_review' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-800">Awaiting Admin Review</p>
            <p className="text-sm text-yellow-700 mt-0.5">Your product is being reviewed. You'll be notified once approved.</p>
          </div>
        </div>
      )}
      {product.status === 'rejected' && (
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Product Rejected</p>
            {product.adminNote && <p className="text-sm text-red-700 mt-0.5">Reason: {product.adminNote}</p>}
            <button onClick={submitForReview} disabled={submitting}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
              style={{ background: '#dc2626' }}>
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Fix & Resubmit
            </button>
          </div>
        </div>
      )}
      {product.status === 'draft' && (
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
          <p className="text-sm text-gray-600">This product is a draft and not visible to buyers.</p>
          <button onClick={submitForReview} disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: '#cf3232' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Submit for Review
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          {/* Images + basic info */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-start gap-5 flex-wrap">
              {/* Image */}
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-gray-900 text-xl leading-snug">{product.name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-2xl font-black text-gray-900">{formatCurrency(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-base text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  )}
                  {disc && <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>{disc}% off</span>}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-gray-500">
                  {product.category && (
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {product.category?.name || product.category}{product.subCategory?.name || product.subCategory ? ` › ${product.subCategory?.name || product.subCategory}` : ''}</span>
                  )}
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {product.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#f3f4f6', color: '#6b7280' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* All images */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" style={{ border: '1px solid #e5e7eb' }} />
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="font-black text-gray-900 mb-3">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Highlights */}
          {product.highlights?.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="font-black text-gray-900 mb-3">Key Features</p>
              <ul className="space-y-2">
                {product.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="font-black text-gray-900 mb-3">Specifications</p>
              {(() => {
                const groups: Record<string, any[]> = {};
                product.specifications.forEach((s: any) => {
                  const g = s.group || 'General';
                  if (!groups[g]) groups[g] = [];
                  groups[g].push(s);
                });
                return Object.entries(groups).map(([group, specs]) => (
                  <div key={group} className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{group}</p>
                    <table className="w-full text-sm">
                      <tbody>
                        {specs.map((s: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                            <td className="py-2 pr-4 text-gray-400 font-medium w-40">{s.key}</td>
                            <td className="py-2 text-gray-700 font-medium">{s.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Variants */}
          {product.hasVariants && product.variants?.length > 0 && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="font-black text-gray-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" style={{ color: '#cf3232' }} />
                Variants ({product.variants.length})
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#FAEFEF' }}>
                      {['Variant', 'Price', 'Stock', 'SKU', 'Available'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td className="px-3 py-2.5 font-semibold text-gray-800">{v.title}</td>
                        <td className="px-3 py-2.5 text-gray-600">{v.price ? formatCurrency(v.price) : '—'}</td>
                        <td className="px-3 py-2.5">
                          <span className={`font-bold ${v.inventory === 0 ? 'text-red-500' : v.inventory <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {v.inventory}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 text-xs">{v.sku || '—'}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs font-bold ${v.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                            {v.isAvailable ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" style={{ color: '#cf3232' }} /> Performance
            </p>
            <div className="space-y-3">
              {[
                { icon: ShoppingCart, label: 'Total Sold', value: product.totalSold || 0, color: '#2563eb' },
                { icon: Star, label: 'Avg Rating', value: product.averageRating ? `${product.averageRating.toFixed(1)} ★` : '—', color: '#f59e0b' },
                { icon: TrendingUp, label: 'Reviews', value: product.reviewCount || 0, color: '#059669' },
                { icon: Package, label: 'In Stock', value: product.inventory, color: product.inventory === 0 ? '#dc2626' : product.inventory <= 5 ? '#d97706' : '#059669' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FAEFEF' }}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <span className="font-black text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-black text-gray-900 mb-3">Details</p>
            <div className="space-y-2 text-xs text-gray-500">
              {[
                { label: 'Created', value: formatDate(product.createdAt) },
                { label: 'Updated', value: formatDate(product.updatedAt) },
                { label: 'Return Policy', value: product.returnPolicyDays ? `${product.returnPolicyDays} days` : 'No returns' },
                { label: 'Weight', value: product.weight ? `${product.weight}g` : '—' },
                { label: 'Has Variants', value: product.hasVariants ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span className="font-semibold text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
