'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/Badge';
import {
  ArrowLeft, Star, Package, ShoppingCart, RotateCcw,
  Calendar, CheckCircle, Ban, Archive, TrendingUp,
  Users, Tag, AlertTriangle, Image as ImageIcon,
} from 'lucide-react';

const CARD: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb',
  borderRadius: '0.75rem', padding: '1.25rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const StatBox = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div className="text-center p-4 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
    <p className="text-2xl font-bold" style={{ color: color || '#111827' }}>{value}</p>
    <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'orders'>('reviews');
  const [updating, setUpdating] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productRes, ordersRes, reviewsRes] = await Promise.all([
        api.get(`/admin/products`).then(r => ({
          data: { product: r.data.products?.find((p: any) => p._id === id) }
        })).catch(() => api.get(`/admin/products?limit=200`).then(r => ({
          data: { product: r.data.products?.find((p: any) => p._id === id) }
        }))),
        api.get('/admin/orders', { params: { limit: 200 } }),
        api.get('/admin/reviews', { params: { product: id, limit: 100 } }),
      ]);

      setProduct(productRes.data.product);

      // filter orders that contain this product
      const allOrders = ordersRes.data.orders || [];
      const productOrders = allOrders.filter((o: any) =>
        o.items?.some((item: any) =>
          (item.product?._id || item.product) === id
        )
      );
      setOrders(productOrders);
      setReviews(reviewsRes.data.reviews || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await api.patch(`/admin/products/${id}/status`, { status });
    fetchAll();
    setUpdating(false);
  };

  const blacklistProduct = async () => {
    if (!banReason.trim()) return;
    setUpdating(true);
    await api.patch(`/admin/products/${id}/blacklist`, { reason: banReason });
    setShowBanModal(false);
    setBanReason('');
    fetchAll();
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded-lg animate-pulse bg-gray-100" />
        <div className="h-48 rounded-xl animate-pulse bg-gray-100" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse bg-gray-100" />)}
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-gray-400 text-sm p-4">Product not found.</div>;

  // ── Computed stats ─────────────────────────────────────────────────────────
  const returnedOrders = orders.filter(o =>
    ['return_requested', 'return_approved', 'refunded'].includes(o.status)
  );
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = orders
    .filter(o => !['cancelled', 'pending_payment'].includes(o.status))
    .reduce((s: number, o: any) => s + o.total, 0);
  const uniqueBuyers = new Set(orders.map((o: any) => o.buyer?._id || o.buyer)).size;
  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const tabs = [
    { key: 'reviews', label: 'Reviews', count: reviews.length },
    { key: 'orders', label: 'Orders', count: orders.length },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      {/* Product header */}
      <div style={CARD}>
        <div className="flex items-start gap-5 flex-wrap">
          {/* Image */}
          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: '1px solid #e5e7eb', background: '#FAEFEF' }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                  <Badge status={product.status} />
                  {product.blacklisted && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: '#fee2e2', color: '#991b1b' }}>
                      <Ban className="w-3 h-3" /> Blacklisted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
                  {product.category && (
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{product.category?.name || product.category}</span>
                  )}
                  {product.sku && <span className="font-mono">SKU: {product.sku}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Added {formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-2xl font-black text-gray-900">{formatCurrency(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  )}
                  {product.compareAtPrice && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: '#d1fae5', color: '#065f46' }}>
                      {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                {product.vendor && (
                  <p className="text-xs text-gray-400 mt-1">
                    Vendor: <span className="font-semibold text-gray-600">{product.vendor?.businessName || product.vendor}</span>
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.status !== 'active' && !product.blacklisted && (
                  <button onClick={() => updateStatus('active')} disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: '#d1fae5', color: '#065f46' }}>
                    <CheckCircle className="w-3.5 h-3.5" /> Activate
                  </button>
                )}
                {product.status === 'active' && (
                  <button onClick={() => updateStatus('draft')} disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: '#fef9c3', color: '#854d0e' }}>
                    <Archive className="w-3.5 h-3.5" /> Set Draft
                  </button>
                )}
                {!product.blacklisted && (
                  <button onClick={() => setShowBanModal(true)} disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: '#fee2e2', color: '#991b1b' }}>
                    <Ban className="w-3.5 h-3.5" /> Blacklist
                  </button>
                )}
                {product.blacklisted && (
                  <button onClick={() => updateStatus('active')} disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: '#d1fae5', color: '#065f46' }}>
                    <CheckCircle className="w-3.5 h-3.5" /> Remove Ban
                  </button>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm text-gray-500 mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                {product.description}
              </p>
            )}

            {product.blacklistReason && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-700">Blacklist Reason</p>
                  <p className="text-xs text-orange-600 mt-0.5">{product.blacklistReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatBox label="Total Orders" value={orders.length} color="#111827" />
        <StatBox label="Completed" value={completedOrders.length} color="#059669" />
        <StatBox label="Returns" value={returnedOrders.length} color="#dc2626"
          sub={orders.length ? `${Math.round((returnedOrders.length / orders.length) * 100)}% rate` : undefined} />
        <StatBox label="Unique Buyers" value={uniqueBuyers} color="#2563eb" />
        <StatBox label="Total Sold" value={product.totalSold || 0} color="#7c3aed" />
        <StatBox label="In Stock" value={product.inventory}
          color={product.inventory === 0 ? '#dc2626' : product.inventory < 5 ? '#d97706' : '#059669'} />
        <StatBox label="Revenue" value={formatCurrency(totalRevenue)} color="#cf3232" />
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <p className="font-semibold text-gray-800 text-sm">Rating Summary</p>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">{avgRating}</p>
              <div className="flex items-center gap-0.5 justify-center mt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1.5">
              {ratingBreakdown.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4">{star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#cf3232' }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={CARD}>
        <div className="flex gap-1 mb-5" style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={activeTab === tab.key
                ? { background: '#cf3232', color: '#fff' }
                : { background: '#FAEFEF', color: '#6b7280', border: '1px solid #e5e7eb' }}>
              {tab.label}
              <span className="px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e5e7eb', color: activeTab === tab.key ? '#fff' : '#374151' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No reviews yet</p>
            ) : reviews.map((r: any) => (
              <div key={r._id} className="p-4 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: r.rating >= 4 ? '#d1fae5' : r.rating >= 3 ? '#fef9c3' : '#fee2e2',
                          color: r.rating >= 4 ? '#065f46' : r.rating >= 3 ? '#854d0e' : '#991b1b',
                        }}>
                        {r.rating}/5
                      </span>
                      {r.isVerifiedPurchase && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    {r.title && <p className="font-semibold text-gray-800 text-sm">{r.title}</p>}
                    {r.body && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.body}</p>}
                    {r.images?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.images.map((img: string, i: number) => (
                          <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover"
                            style={{ border: '1px solid #e5e7eb' }} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        {r.buyer?.firstName} {r.buyer?.lastName}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.vendorReply && (
                      <div className="mt-2 pl-3 py-2 rounded-lg text-xs text-gray-600 italic"
                        style={{ borderLeft: '3px solid #e5e7eb', background: '#fff' }}>
                        <span className="font-semibold not-italic text-gray-700">Vendor reply: </span>
                        {r.vendorReply}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Order ID', 'Buyer', 'Qty', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No orders for this product</td></tr>
                ) : orders.map((o: any) => {
                  const item = o.items?.find((i: any) => (i.product?._id || i.product) === id);
                  return (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f9fafb' }} className="hover:bg-[#FAEFEF] transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs font-bold" style={{ color: '#cf3232' }}>#{o._id?.slice(-8)}</td>
                      <td className="py-3 pr-4 text-gray-700">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-700">{item?.quantity || 1}</td>
                      <td className="py-3 pr-4 font-bold text-gray-800">{formatCurrency(o.total)}</td>
                      <td className="py-3 pr-4"><Badge status={o.status} /></td>
                      <td className="py-3 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Blacklist Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl" style={{ border: '1px solid #e5e7eb' }}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fee2e2' }}>
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Blacklist Product</p>
                  <p className="text-xs text-gray-400 mt-0.5">This will hide the product from all buyers</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason *</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Violated platform policy, counterfeit product..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={{ border: '1px solid #d1d5db', color: '#111827' }}
                  onFocus={(e) => (e.target.style.borderColor = '#cf3232')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowBanModal(false); setBanReason(''); }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: '#FAEFEF', color: '#374151', border: '1px solid #e5e7eb' }}>
                  Cancel
                </button>
                <button onClick={blacklistProduct} disabled={!banReason.trim() || updating}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#dc2626' }}>
                  {updating ? 'Banning...' : 'Blacklist Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
