'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/Badge';
import {
  ArrowLeft, Mail, Phone, MapPin, ShoppingCart, Star,
  RotateCcw, Calendar, CheckCircle, PauseCircle, Package,
  CreditCard, Clock, TrendingUp, MessageSquare, Loader2,
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

export default function BuyerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [buyer, setBuyer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews'>('orders');
  const [updating, setUpdating] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const startChat = async () => {
    setMessaging(true);
    try {
      const { data } = await api.post('/admin/chat/start', { participantType: 'buyer', participantId: id });
      router.push(`/dashboard/chat?conv=${data.conversation._id}`);
    } catch { setMessaging(false); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [buyerRes, ordersRes, reviewsRes] = await Promise.all([
        api.get(`/admin/buyers/${id}`),
        api.get('/admin/orders', { params: { buyer: id, limit: 100 } }),
        api.get('/admin/reviews', { params: { limit: 100 } }),
      ]);
      setBuyer(buyerRes.data.buyer);
      setOrders(ordersRes.data.orders || []);
      // filter reviews by buyer
      const allReviews = reviewsRes.data.reviews || [];
      setReviews(allReviews.filter((r: any) =>
        r.buyer?._id === id || r.buyer === id
      ));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await api.patch(`/admin/buyers/${id}/status`, { status });
    fetchAll();
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded-lg animate-pulse bg-gray-100" />
        <div className="h-40 rounded-xl animate-pulse bg-gray-100" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse bg-gray-100" />)}
        </div>
      </div>
    );
  }

  if (!buyer) return <div className="text-gray-400 text-sm p-4">Buyer not found.</div>;

  // ── Computed stats ─────────────────────────────────────────────────────────
  const totalSpent = orders
    .filter(o => !['cancelled', 'pending_payment'].includes(o.status))
    .reduce((s: number, o: any) => s + o.total, 0);

  const returnedOrders = orders.filter(o =>
    ['return_requested', 'return_approved', 'refunded'].includes(o.status)
  );

  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const avgDaysToReturn = returnedOrders.length
    ? Math.round(
        returnedOrders.reduce((s: number, o: any) => {
          const created = new Date(o.createdAt).getTime();
          const updated = new Date(o.updatedAt).getTime();
          return s + (updated - created) / (1000 * 60 * 60 * 24);
        }, 0) / returnedOrders.length
      )
    : null;

  const avgRating = reviews.length
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  // Unique vendors purchased from
  const uniqueVendors = new Set(orders.map((o: any) => o.vendor?._id || o.vendor)).size;

  const tabs = [
    { key: 'orders', label: 'Orders', count: orders.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Buyers
      </button>

      {/* Profile card */}
      <div style={CARD}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
              style={{ background: '#cf3232' }}>
              {buyer.avatar
                ? <img src={buyer.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                : `${buyer.firstName?.[0] || ''}${buyer.lastName?.[0] || ''}`}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{buyer.firstName} {buyer.lastName}</h1>
                <Badge status={buyer.status} />
                {buyer.isEmailVerified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: '#d1fae5', color: '#065f46' }}>
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Mail className="w-3 h-3" />{buyer.email}
                </span>
                {buyer.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone className="w-3 h-3" />{buyer.phone}
                  </span>
                )}
                {buyer.addresses?.[0]?.city && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {buyer.addresses[0].city}, {buyer.addresses[0].country}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />Joined {formatDate(buyer.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {buyer.status !== 'active' && (
              <button onClick={() => updateStatus('active')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: '#d1fae5', color: '#065f46' }}>
                <CheckCircle className="w-3.5 h-3.5" /> Activate
              </button>
            )}
            {buyer.status !== 'suspended' && (
              <button onClick={() => updateStatus('suspended')} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                style={{ background: '#FAEFEF', color: '#cf3232' }}>
                <PauseCircle className="w-3.5 h-3.5" /> Suspend
              </button>
            )}
            <button onClick={startChat} disabled={messaging}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: '#cf3232' }}>
              {messaging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
              Message
            </button>
          </div>
        </div>

        {/* Addresses */}
        {buyer.addresses?.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Saved Addresses</p>
            <div className="flex flex-wrap gap-2">
              {buyer.addresses.map((addr: any, i: number) => (
                <div key={i} className="text-xs text-gray-600 px-3 py-1.5 rounded-lg"
                  style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                  <span className="font-semibold text-gray-700">{addr.label || 'Address'}: </span>
                  {addr.street}, {addr.city}, {addr.country}
                  {addr.isDefault && <span className="ml-1 text-green-600 font-semibold">(Default)</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatBox label="Total Orders" value={orders.length} color="#111827" />
        <StatBox label="Completed" value={completedOrders.length} color="#059669" />
        <StatBox label="Returns" value={returnedOrders.length} color="#dc2626"
          sub={avgDaysToReturn ? `Avg ${avgDaysToReturn}d after order` : undefined} />
        <StatBox label="Cancelled" value={cancelledOrders.length} color="#6b7280" />
        <StatBox label="Vendors" value={uniqueVendors} color="#2563eb" sub="Purchased from" />
        <StatBox label="Reviews" value={reviews.length} color="#7c3aed" sub={`Avg ${avgRating} ★`} />
        <StatBox label="Total Spent" value={formatCurrency(totalSpent)} color="#cf3232" />
      </div>

      {/* Stripe customer */}
      {buyer.stripeCustomerId && (
        <div style={CARD}>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <p className="font-semibold text-gray-800 text-sm">Payment Info</p>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">Stripe Customer Active</span>
            </div>
            <span className="text-xs font-mono text-gray-400 bg-[#FAEFEF] px-2 py-1 rounded"
              style={{ border: '1px solid #e5e7eb' }}>
              {buyer.stripeCustomerId}
            </span>
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
                style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                  color: activeTab === tab.key ? '#fff' : '#374151',
                }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Order ID', 'Vendor', 'Items', 'Total', 'Payment', 'Status', 'Return Window', 'Date'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No orders yet</td></tr>
                ) : orders.map((o: any) => {
                  const isReturn = ['return_requested', 'return_approved', 'refunded'].includes(o.status);
                  const daysSinceOrder = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f9fafb' }}
                      className="hover:bg-[#FAEFEF] transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs font-bold" style={{ color: '#cf3232' }}>
                        #{o._id?.slice(-8)}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 text-xs font-medium">
                        {o.vendor?.businessName || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">
                        {o.items?.length || 1} item{(o.items?.length || 1) > 1 ? 's' : ''}
                      </td>
                      <td className="py-3 pr-4 font-bold text-gray-800">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs font-medium text-gray-500">
                          {o.stripePaymentIntentId ? 'Stripe' : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <Badge status={o.status} />
                          {isReturn && <RotateCcw className="w-3 h-3 text-red-400" />}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {o.returnWindowExpiresAt ? (
                          <div className="text-xs">
                            {new Date(o.returnWindowExpiresAt) > new Date()
                              ? <span className="text-orange-500 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {Math.ceil((new Date(o.returnWindowExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
                                </span>
                              : <span className="text-gray-400">Expired</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                        <span className="block text-gray-300">{daysSinceOrder}d ago</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Order summary footer */}
            {orders.length > 0 && (
              <div className="mt-4 pt-4 flex flex-wrap gap-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                {[
                  { label: 'Total Spent', value: formatCurrency(totalSpent), color: '#cf3232' },
                  { label: 'Avg Order Value', value: formatCurrency(totalSpent / (orders.length || 1)), color: '#374151' },
                  { label: 'Return Rate', value: `${orders.length ? Math.round((returnedOrders.length / orders.length) * 100) : 0}%`, color: returnedOrders.length > 0 ? '#dc2626' : '#059669' },
                  { label: 'Completion Rate', value: `${orders.length ? Math.round((completedOrders.length / orders.length) * 100) : 0}%`, color: '#059669' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                    <span className="text-xs text-gray-500">{label}:</span>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No reviews written yet</p>
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
                      <span className="text-xs font-bold" style={{ color: r.rating >= 4 ? '#059669' : r.rating >= 3 ? '#d97706' : '#dc2626' }}>
                        {r.rating}/5
                      </span>
                      {r.isVerifiedPurchase && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    {r.title && <p className="font-semibold text-gray-800 text-sm">{r.title}</p>}
                    {r.body && <p className="text-sm text-gray-600 mt-0.5">{r.body}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Package className="w-3 h-3" />
                        {r.product?.name || 'Product'}
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
      </div>
    </div>
  );
}
