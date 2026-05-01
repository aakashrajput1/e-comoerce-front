'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/Badge';
import {
  ArrowLeft, Store, Mail, Phone, MapPin, Package, ShoppingCart,
  Star, Wallet, CheckCircle, XCircle, PauseCircle, RotateCcw,
  TrendingUp, Calendar, ExternalLink, Layers, MessageSquare, Loader2,
  ShieldCheck, ShieldAlert, Clock, FileText,
} from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

const StatBox = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div className="text-center p-4 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
    <p className="text-2xl font-bold" style={{ color: color || '#111827' }}>{value}</p>
    <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews'>('products');
  const [updating, setUpdating] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const startChat = async () => {
    setMessaging(true);
    try {
      const { data } = await api.post('/admin/chat/start', { participantType: 'vendor', participantId: id });
      router.push(`/dashboard/chat?conv=${data.conversation._id}`);
    } catch { setMessaging(false); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vendorRes, productsRes, ordersRes, reviewsRes, walletRes] = await Promise.all([
        api.get(`/admin/vendors/${id}`),
        api.get('/admin/products', { params: { vendor: id, limit: 50 } }),
        api.get('/admin/orders', { params: { vendor: id, limit: 50 } }),
        api.get('/admin/reviews', { params: { vendor: id, limit: 50 } }),
        api.get(`/admin/vendors/${id}/wallet`).catch(() => ({ data: { wallet: null } })),
      ]);
      setData(vendorRes.data);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setReviews(reviewsRes.data.reviews || []);
      setWallet(walletRes.data.wallet);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await api.patch(`/admin/vendors/${id}/status`, { status });
    fetchAll();
    setUpdating(false);
  };

  const updateVerification = async (verificationStatus: string, note?: string) => {
    setUpdating(true);
    await api.patch(`/admin/vendors/${id}/verification`, { verificationStatus, verificationNote: note });
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

  const vendor = data?.vendor;
  if (!vendor) return <div className="text-gray-400 text-sm">Vendor not found.</div>;

  const returnedOrders = orders.filter(o => ['return_requested', 'return_approved', 'refunded'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const totalRevenue = orders.filter(o => !['cancelled', 'pending_payment'].includes(o.status)).reduce((s: number, o: any) => s + o.total, 0);

  const tabs = [
    { key: 'products', label: 'Products', count: products.length },
    { key: 'orders', label: 'Orders', count: orders.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Vendors
      </button>

      {/* Header card */}
      <div style={CARD}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
              style={{ background: '#cf3232' }}>
              {vendor.logo
                ? <img src={vendor.logo} alt={vendor.businessName} className="w-full h-full object-cover rounded-2xl" />
                : vendor.businessName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{vendor.businessName}</h1>
                <Badge status={vendor.status} />
                {vendor.stripeOnboardingComplete && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>
                    <CheckCircle className="w-3 h-3" /> Stripe Connected
                  </span>
                )}
                {vendor.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46' }}>
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                {vendor.verificationStatus === 'pending_review' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#fef9c3', color: '#92400e' }}>
                    <Clock className="w-3 h-3" /> Docs Pending Review
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{vendor.ownerName}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-400"><Mail className="w-3 h-3" />{vendor.email}</span>
                {vendor.phone && <span className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3" />{vendor.phone}</span>}
                {vendor.address?.city && <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{vendor.address.city}, {vendor.address.country}</span>}
                <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" />Joined {formatDate(vendor.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {vendor.status !== 'approved' && (
              <button onClick={() => updateStatus('approved')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: '#d1fae5', color: '#065f46' }}>
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
            )}
            {vendor.status !== 'suspended' && (
              <button onClick={() => updateStatus('suspended')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: '#FAEFEF', color: '#cf3232' }}>
                <PauseCircle className="w-3.5 h-3.5" /> Suspend
              </button>
            )}
            {vendor.status !== 'rejected' && (
              <button onClick={() => updateStatus('rejected')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: '#fee2e2', color: '#dc2626' }}>
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            )}
            {vendor.slug && (
              <a href={`/store/${vendor.slug}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Storefront
              </a>
            )}
            <button onClick={startChat} disabled={messaging}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: '#cf3232' }}>
              {messaging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
              Message
            </button>
          </div>
        </div>

        {vendor.description && (
          <p className="text-sm text-gray-500 mt-4 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>{vendor.description}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatBox label="Total Orders" value={orders.length} color="#111827" />
        <StatBox label="Completed" value={completedOrders.length} color="#059669" />
        <StatBox label="Returns" value={returnedOrders.length} color="#dc2626" />
        <StatBox label="Products" value={products.length} color="#2563eb" />
        <StatBox label="Reviews" value={reviews.length} color="#7c3aed" />
        <StatBox label="Avg Rating" value={avgRating} color="#d97706" />
        <StatBox label="Revenue" value={formatCurrency(totalRevenue)} color="#cf3232" />
      </div>

      {/* Wallet */}
      {wallet && (
        <div style={CARD}>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-gray-400" />
            <p className="font-semibold text-gray-800 text-sm">Wallet Balance</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Available" value={formatCurrency(wallet.availableBalance / 100)} color="#059669" />
            <StatBox label="Pending" value={formatCurrency(wallet.pendingBalance / 100)} color="#d97706" sub="Return window active" />
            <StatBox label="Withdrawn" value={formatCurrency(wallet.withdrawnBalance / 100)} color="#6b7280" />
            <StatBox label="Total Earned" value={formatCurrency(wallet.totalEarned / 100)} color="#cf3232" />
          </div>
        </div>
      )}

      {/* Stripe Onboarding */}
      <div style={CARD}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <p className="font-semibold text-gray-800 text-sm">Stripe Connect</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${vendor.stripeOnboardingComplete ? 'bg-green-500' : 'bg-yellow-400'}`} />
            <span className="text-sm font-medium text-gray-700">
              {vendor.stripeOnboardingComplete ? 'Onboarding Complete' : 'Onboarding Pending'}
            </span>
          </div>
          {vendor.stripeAccountId && (
            <span className="text-xs font-mono text-gray-400 bg-[#FAEFEF] px-2 py-1 rounded" style={{ border: '1px solid #e5e7eb' }}>
              {vendor.stripeAccountId}
            </span>
          )}
        </div>
      </div>

      {/* Verification / KYB */}
      <div style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="font-semibold text-gray-800 text-sm">Business Verification (KYB)</p>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              background: vendor.verificationStatus === 'verified' ? '#d1fae5' : vendor.verificationStatus === 'pending_review' ? '#fef9c3' : vendor.verificationStatus === 'rejected' ? '#fee2e2' : '#f3f4f6',
              color: vendor.verificationStatus === 'verified' ? '#065f46' : vendor.verificationStatus === 'pending_review' ? '#92400e' : vendor.verificationStatus === 'rejected' ? '#dc2626' : '#6b7280',
            }}>
            {vendor.verificationStatus?.replace(/_/g, ' ') || 'not submitted'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
          {vendor.businessType && <div><span className="text-gray-400">Business Type: </span><span className="font-semibold text-gray-700 capitalize">{vendor.businessType.replace(/_/g, ' ')}</span></div>}
          {vendor.taxId && <div><span className="text-gray-400">Tax ID: </span><span className="font-semibold text-gray-700">{vendor.taxId}</span></div>}
          {vendor.businessRegistrationNumber && <div><span className="text-gray-400">Reg No: </span><span className="font-semibold text-gray-700">{vendor.businessRegistrationNumber}</span></div>}
          {vendor.website && <div><span className="text-gray-400">Website: </span><a href={vendor.website} target="_blank" className="font-semibold text-blue-600 hover:underline">{vendor.website}</a></div>}
          {vendor.verifiedAt && <div><span className="text-gray-400">Verified: </span><span className="font-semibold text-gray-700">{formatDate(vendor.verifiedAt)}</span></div>}
        </div>

        {/* Documents */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {vendor.governmentIdUrl && (
            <a href={vendor.governmentIdUrl} target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              <FileText className="w-3.5 h-3.5" /> View Government ID
            </a>
          )}
          {vendor.businessDocumentUrl && (
            <a href={vendor.businessDocumentUrl} target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
              <FileText className="w-3.5 h-3.5" /> View Business Doc
            </a>
          )}
          {!vendor.governmentIdUrl && !vendor.businessDocumentUrl && (
            <p className="text-xs text-gray-400">No documents uploaded yet</p>
          )}
        </div>

        {/* Verification actions */}
        {vendor.verificationStatus === 'pending_review' && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => updateVerification('verified')} disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-60"
              style={{ background: '#059669' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Approve & Verify
            </button>
            <button onClick={() => {
              const note = prompt('Rejection reason (shown to vendor):');
              if (note !== null) updateVerification('rejected', note);
            }} disabled={updating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-60"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              <ShieldAlert className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        )}
        {vendor.verificationStatus === 'verified' && (
          <button onClick={() => updateVerification('not_submitted')} disabled={updating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: '#f3f4f6', color: '#6b7280' }}>
            Revoke Verification
          </button>
        )}
        {vendor.verificationNote && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: '#fef2f2', color: '#991b1b' }}>
            <span className="font-bold">Note: </span>{vendor.verificationNote}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={CARD}>
        {/* Tab headers */}
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

        {/* Products tab */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Rating', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">No products</td></tr>
                ) : products.map((p: any) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f9fafb' }}
                    className="hover:bg-[#FAEFEF] transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #e5e7eb' }} />
                          : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />}
                        <span className="font-medium text-gray-800 max-w-[160px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{p.category || '—'}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800">{formatCurrency(p.price)}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-semibold text-sm ${p.inventory === 0 ? 'text-red-500' : p.inventory < 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                        {p.inventory}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{p.totalSold}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-700">{p.averageRating?.toFixed(1) || '—'}</span>
                        <span className="text-xs text-gray-400">({p.reviewCount})</span>
                      </div>
                    </td>
                    <td className="py-3"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Order ID', 'Buyer', 'Total', 'Vendor Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No orders</td></tr>
                ) : orders.map((o: any) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f9fafb' }} className="hover:bg-[#FAEFEF] transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs font-bold" style={{ color: '#cf3232' }}>#{o._id?.slice(-8)}</td>
                    <td className="py-3 pr-4 text-gray-700">{o.buyer?.firstName} {o.buyer?.lastName}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800">{formatCurrency(o.total)}</td>
                    <td className="py-3 pr-4 font-semibold text-green-700">{formatCurrency(o.vendorAmount)}</td>
                    <td className="py-3 pr-4"><Badge status={o.status} /></td>
                    <td className="py-3 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No reviews</p>
            ) : reviews.map((r: any) => (
              <div key={r._id} className="p-4 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                      {r.isVerifiedPurchase && (
                        <span className="text-xs font-medium text-green-600">✓ Verified</span>
                      )}
                    </div>
                    {r.title && <p className="font-semibold text-gray-800 text-sm">{r.title}</p>}
                    {r.body && <p className="text-sm text-gray-600 mt-0.5">{r.body}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{r.buyer?.firstName} {r.buyer?.lastName}</span>
                      <span className="text-xs text-gray-400">{r.product?.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-black" style={{ color: r.rating >= 4 ? '#059669' : r.rating >= 3 ? '#d97706' : '#dc2626' }}>
                    {r.rating}/5
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
