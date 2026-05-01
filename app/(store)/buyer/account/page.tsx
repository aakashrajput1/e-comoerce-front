'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBuyerAuth, buyerApi } from '@/lib/buyerAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import PhoneInput from '@/components/PhoneInput';
import CountrySelect from '@/components/CountrySelect';
import {
  User, ShoppingBag, LogOut, Package, CheckCircle, Edit2, Save, X,
  Loader2, AlertCircle, MapPin, TrendingUp, Clock, RotateCcw,
  Star, Home, Plus, Trash2, ExternalLink, BarChart2,
  ShoppingCart, XCircle, ChevronRight, Bell, Heart, Truck,
} from 'lucide-react';

const STATUS: Record<string, { bg: string; color: string; label: string; dot: string }> = {
  pending_payment:  { bg: '#f3f4f6', color: '#6b7280', label: 'Pending Payment', dot: '#9ca3af' },
  paid:             { bg: '#eff6ff', color: '#1d4ed8', label: 'Paid', dot: '#3b82f6' },
  processing:       { bg: '#f5f3ff', color: '#6d28d9', label: 'Processing', dot: '#8b5cf6' },
  shipped:          { bg: '#fffbeb', color: '#92400e', label: 'Shipped', dot: '#f59e0b' },
  delivered:        { bg: '#f0fdf4', color: '#166534', label: 'Delivered', dot: '#22c55e' },
  completed:        { bg: '#f0fdf4', color: '#166534', label: 'Delivered', dot: '#22c55e' }, // buyer sees "Delivered" for completed
  cancelled:        { bg: '#fef2f2', color: '#991b1b', label: 'Cancelled', dot: '#ef4444' },
  refunded:         { bg: '#fef2f2', color: '#991b1b', label: 'Refunded', dot: '#ef4444' },
  return_requested: { bg: '#fff7ed', color: '#9a3412', label: 'Return Requested', dot: '#f97316' },
  return_approved:  { bg: '#fff7ed', color: '#9a3412', label: 'Return Approved', dot: '#f97316' },
};

const TABS = [
  { key: 'overview',  label: 'Overview',  icon: BarChart2 },
  { key: 'orders',    label: 'My Orders', icon: ShoppingBag },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'reviews',   label: 'Reviews',   icon: Star },
  { key: 'profile',   label: 'Profile',   icon: User },
];

const emptyAddr = { label: '', street: '', city: '', state: '', country: '', zipCode: '', isDefault: false };

export default function BuyerAccountPage() {
  const { buyer, loading, logout, refresh } = useBuyerAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [addrForm, setAddrForm] = useState({ ...emptyAddr });
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [returnModal, setReturnModal] = useState<any>(null);
  const [returnForm, setReturnForm] = useState({ reason: '', refundType: 'original', upiId: '', bankAccount: '', bankIfsc: '', bankName: '' });

  useEffect(() => {
    if (!loading && !buyer) router.push('/buyer/login');
  }, [buyer, loading, router]);

  useEffect(() => {
    if (!buyer) return;
    setProfileForm({ firstName: buyer.firstName, lastName: buyer.lastName, phone: buyer.phone || '' });
    setDataLoading(true);
    Promise.all([
      buyerApi.get('/buyer/orders?limit=100'),
      buyerApi.get('/buyer/reviews/my').catch(() => ({ data: { reviews: [] } })),
      buyerApi.get('/buyer/profile'),
    ]).then(([oRes, rRes, pRes]) => {
      setOrders(oRes.data.orders || []);
      setReviews(rRes.data.reviews || []);
      setProfile(pRes.data.buyer);
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, [buyer]);

  const saveProfile = async () => {
    setProfileSaving(true); setProfileMsg('');
    try {
      await buyerApi.patch('/buyer/profile', profileForm);
      refresh(); setEditingProfile(false); setProfileMsg('saved');
    } catch (err: any) { setProfileMsg(err.response?.data?.message || 'Failed'); }
    finally { setProfileSaving(false); }
  };

  const saveAddress = async () => {
    setAddrSaving(true);
    try {
      if (editingAddrId) {
        await buyerApi.patch(`/buyer/profile/address/${editingAddrId}`, addrForm);
      } else {
        await buyerApi.post('/buyer/profile/address', addrForm);
      }
      const { data } = await buyerApi.get('/buyer/profile');
      setProfile(data.buyer); refresh();
      setShowAddrForm(false); setEditingAddrId(null); setAddrForm({ ...emptyAddr });
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setAddrSaving(false); }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await buyerApi.delete(`/buyer/profile/address/${id}`);
    const { data } = await buyerApi.get('/buyer/profile');
    setProfile(data.buyer); refresh();
  };

  const confirmDelivery = async (orderId: string) => {
    if (!confirm('Confirm you have received this order?')) return;
    setActionLoading(orderId);
    try {
      await buyerApi.post(`/buyer/orders/${orderId}/confirm-delivery`, {});
      const { data } = await buyerApi.get('/buyer/orders?limit=100');
      setOrders(data.orders || []);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const openReturnModal = (order: any) => {
    setReturnForm({ reason: '', refundType: 'original', upiId: '', bankAccount: '', bankIfsc: '', bankName: '' });
    setReturnModal(order);
  };

  const submitReturn = async () => {
    if (!returnModal) return;
    setActionLoading(returnModal._id);
    try {
      await buyerApi.post(`/buyer/orders/${returnModal._id}/return`, {
        reason: returnForm.reason,
        refundMethod: {
          type: returnForm.refundType,
          upiId: returnForm.upiId,
          bankAccount: returnForm.bankAccount,
          bankIfsc: returnForm.bankIfsc,
          bankName: returnForm.bankName,
        },
      });
      const { data } = await buyerApi.get('/buyer/orders?limit=100');
      setOrders(data.orders || []);
      setReturnModal(null);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const getReturnWindowLeft = (expiresAt: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    setActionLoading(orderId);
    try {
      await buyerApi.post(`/buyer/orders/${orderId}/cancel`, {});
      const { data } = await buyerApi.get('/buyer/orders?limit=100');
      setOrders(data.orders || []);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const returnOrder = async (orderId: string) => {
    // Now handled by modal
    openReturnModal(orders.find((o: any) => o._id === orderId));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAEFEF]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#cf3232' }} />
    </div>
  );
  if (!buyer) return null;

  const totalSpent = orders.filter(o => !['cancelled','pending_payment','refunded'].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter(o => ['paid','processing','shipped'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const filteredOrders = orderFilter ? orders.filter(o => o.status === orderFilter) : orders;
  const addresses = profile?.addresses || [];

  return (
    <div className="min-h-screen bg-[#FAEFEF]">
      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-lg"
                style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                {buyer.firstName?.[0]}{buyer.lastName?.[0]}
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome back,</p>
                <p className="text-white font-black text-2xl">{buyer.firstName} {buyer.lastName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/60 text-xs">{buyer.email}</p>
                  {buyer.isEmailVerified
                    ? <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}><CheckCircle className="w-3 h-3" />Verified</span>
                    : <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,200,0,0.3)', color: '#fef08a' }}><AlertCircle className="w-3 h-3" />Unverified</span>}
                </div>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
              { label: 'Active Orders', value: activeOrders.length, icon: Clock },
              { label: 'Total Spent', value: formatCurrency(totalSpent), icon: TrendingUp },
              { label: 'Reviews', value: reviews.length, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Icon className="w-5 h-5 text-white/70 flex-shrink-0" />
                <div>
                  <p className="text-white font-black text-lg leading-none">{value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              {TABS.map(({ key, label, icon: Icon }, i) => (
                <button key={key} onClick={() => setTab(key)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all text-left relative"
                  style={{
                    background: tab === key ? '#fff1f2' : '#fff',
                    color: tab === key ? '#cf3232' : '#374151',
                    borderBottom: i < TABS.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}>
                  {tab === key && <span className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ background: '#cf3232' }} />}
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {key === 'orders' && activeOrders.length > 0 && (
                    <span className="w-5 h-5 rounded-full text-xs font-black text-white flex items-center justify-center flex-shrink-0" style={{ background: '#cf3232' }}>
                      {activeOrders.length}
                    </span>
                  )}
                  {tab === key && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#cf3232' }} />}
                </button>
              ))}
              <div style={{ borderTop: '1px solid #f3f4f6' }}>
                <Link href="/products"
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-gray-500 hover:bg-[#FAEFEF] transition">
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" /> Browse Products
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Mobile tabs */}
            <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto md:hidden mb-4" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0"
                  style={{ background: tab === key ? '#cf3232' : 'transparent', color: tab === key ? '#fff' : '#6b7280' }}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#cf3232' }} />
              </div>
            ) : (
              <>
                {/* OVERVIEW */}
                {tab === 'overview' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                      <h2 className="font-black text-gray-800 text-lg mb-4">Recent Orders</h2>
                      {orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No orders yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {orders.slice(0, 5).map(order => {
                            const s = STATUS[order.status] || STATUS['pending_payment'];
                            return (
                              <div key={order._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #f3f4f6' }}>
                                <div>
                                  <p className="text-sm font-bold text-gray-800">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(order.total)}</span>
                                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {orders.length > 5 && (
                        <button onClick={() => setTab('orders')} className="mt-3 text-sm font-bold" style={{ color: '#cf3232' }}>
                          View all {orders.length} orders →
                        </button>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                      <h2 className="font-black text-gray-800 text-lg mb-4">Recent Reviews</h2>
                      {reviews.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No reviews yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {reviews.slice(0, 3).map((r: any) => (
                            <div key={r._id} className="p-3 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #f3f4f6' }}>
                              <div className="flex items-center gap-1 mb-1">
                                {[1,2,3,4,5].map(n => (
                                  <Star key={n} className="w-3.5 h-3.5" style={{ color: n <= r.rating ? '#f59e0b' : '#d1d5db', fill: n <= r.rating ? '#f59e0b' : 'none' }} />
                                ))}
                                <span className="text-xs text-gray-400 ml-1">{formatDate(r.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{r.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ORDERS */}
                {tab === 'orders' && (
                  <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="p-5 border-b" style={{ borderColor: '#f3f4f6' }}>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="font-black text-gray-800 text-lg">My Orders</h2>
                        <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
                          className="text-sm border rounded-xl px-3 py-2 outline-none" style={{ borderColor: '#e5e7eb' }}>
                          <option value="">All Statuses</option>
                          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No orders found</p>
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
                        {filteredOrders.map(order => {
                          const s = STATUS[order.status] || STATUS['pending_payment'];
                          const isExpanded = expandedOrder === order._id;

                          // Status timeline steps — buyer sees up to Delivered only
                          const STEPS = [
                            { key: 'paid',       label: 'Order Confirmed', icon: CheckCircle },
                            { key: 'processing', label: 'Processing',      icon: Package },
                            { key: 'shipped',    label: 'Shipped',         icon: Truck },
                            { key: 'delivered',  label: 'Delivered',       icon: CheckCircle },
                          ];
                          const STATUS_ORDER = ['paid','processing','shipped','delivered','completed'];
                          // For buyer: completed = delivered in timeline
                          const currentIdx = Math.min(STATUS_ORDER.indexOf(order.status), 3);                          const isCancelled = ['cancelled','refunded'].includes(order.status);
                          const isReturn = ['return_requested','return_approved'].includes(order.status);

                          return (
                            <div key={order._id}>
                              {/* Order header row */}
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                  <div>
                                    <p className="font-black text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{order.vendor?.businessName || 'Seller'}</p>
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-black text-lg" style={{ color: '#cf3232' }}>{formatCurrency(order.total)}</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                                      {s.label}
                                    </span>
                                  </div>
                                </div>

                                {/* Items preview */}
                                {order.items?.length > 0 && (
                                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                                    {order.items.slice(0, 3).map((item: any, i: number) => (
                                      <div key={i} className="flex items-center gap-2">
                                        {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" style={{ border: '1px solid #e5e7eb' }} />}
                                        <span className="text-xs text-gray-600">{item.name} ×{item.quantity}</span>
                                      </div>
                                    ))}
                                    {order.items.length > 3 && <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>}
                                  </div>
                                )}

                                {/* Quick alerts */}
                                {order.trackingNumber && !isExpanded && (
                                  <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                    <Truck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                    <span className="text-green-700 font-semibold">{order.shippingCarrier ? `${order.shippingCarrier}: ` : 'Tracking: '}{order.trackingNumber}</span>
                                  </div>
                                )}
                                {order.status === 'delivered' && order.returnWindowExpiresAt && !isExpanded && (
                                  <div className="mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                                    <Clock className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                                    <span className="text-orange-700 font-semibold">Return window: {getReturnWindowLeft(order.returnWindowExpiresAt)}</span>
                                  </div>
                                )}
                                {order.returnRejectedReason && (
                                  <div className="mt-2 flex items-start gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-red-700">Return rejected: {order.returnRejectedReason}</span>
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  <button onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                                    style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                                    <Package className="w-3 h-3" />
                                    {isExpanded ? 'Hide Details' : 'Track Order'}
                                  </button>
                                  {['pending_payment','paid','processing'].includes(order.status) && (
                                    <button onClick={() => cancelOrder(order._id)} disabled={actionLoading === order._id}
                                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                                      style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                                      {actionLoading === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                      Cancel
                                    </button>
                                  )}
                                  {/* Confirm Received — only on shipped */}
                                  {order.status === 'shipped' && (
                                    <button onClick={() => confirmDelivery(order._id)} disabled={actionLoading === order._id}
                                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                                      style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                                      {actionLoading === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                      Confirm Received
                                    </button>
                                  )}
                                  {/* Return button — only when delivered and window active */}
                                  {order.status === 'delivered' &&
                                   order.returnWindowExpiresAt &&
                                   new Date(order.returnWindowExpiresAt) > new Date() && (
                                    <button onClick={() => openReturnModal(order)} disabled={actionLoading === order._id}
                                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                                      style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
                                      {actionLoading === order._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                      Request Return
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* ── Expanded tracking detail ── */}
                              {isExpanded && (
                                <div className="px-5 pb-5 space-y-4" style={{ background: '#fafafa', borderTop: '1px solid #f3f4f6' }}>

                                  {/* Status timeline */}
                                  {!isCancelled && !isReturn && (
                                    <div className="pt-4">
                                      <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-4">Order Progress</p>
                                      <div className="flex items-start">
                                        {STEPS.map((step, i) => {
                                          const done = i <= currentIdx;
                                          const active = i === currentIdx;
                                          const Icon = step.icon;
                                          return (
                                            <div key={step.key} className="flex items-center flex-1">
                                              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                                  style={{
                                                    background: done ? '#cf3232' : '#e5e7eb',
                                                    color: done ? '#fff' : '#9ca3af',
                                                    boxShadow: active ? '0 0 0 3px #fecdd3' : 'none',
                                                  }}>
                                                  <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-xs font-semibold text-center leading-tight max-w-[60px]"
                                                  style={{ color: done ? '#cf3232' : '#9ca3af' }}>
                                                  {step.label}
                                                </span>
                                              </div>
                                              {i < STEPS.length - 1 && (
                                                <div className="flex-1 h-0.5 mx-1 mb-5 transition-all"
                                                  style={{ background: i < currentIdx ? '#cf3232' : '#e5e7eb' }} />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Cancelled / Refunded */}
                                  {isCancelled && (
                                    <div className="pt-4 flex items-center gap-3 p-4 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-black text-red-800">Order {order.status === 'refunded' ? 'Refunded' : 'Cancelled'}</p>
                                        {order.cancellationReason && <p className="text-xs text-red-600 mt-0.5">{order.cancellationReason}</p>}
                                      </div>
                                    </div>
                                  )}

                                  {/* Return status */}
                                  {isReturn && (
                                    <div className="pt-4 flex items-center gap-3 p-4 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                                      <RotateCcw className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-black text-orange-800">
                                          {order.status === 'return_requested' ? 'Return Requested — Awaiting seller approval' : 'Return Approved'}
                                        </p>
                                        {order.returnReason && <p className="text-xs text-orange-600 mt-0.5">Reason: {order.returnReason}</p>}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tracking number */}
                                  {order.trackingNumber && (
                                    <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                      <p className="text-xs font-black text-green-700 mb-1">Shipment Tracking</p>
                                      <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <div>
                                          {order.shippingCarrier && <p className="text-xs font-bold text-green-800">{order.shippingCarrier}</p>}
                                          <p className="text-sm font-black text-green-900">{order.trackingNumber}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Return window */}
                                  {order.status === 'delivered' && order.returnWindowExpiresAt && (
                                    <div className="p-4 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                                      <p className="text-xs font-black text-orange-700 mb-1">Return Window</p>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-black text-orange-900">{getReturnWindowLeft(order.returnWindowExpiresAt)}</p>
                                          <p className="text-xs text-orange-600">Expires {formatDate(order.returnWindowExpiresAt)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Order items detail */}
                                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                                    <p className="px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wide bg-white" style={{ borderBottom: '1px solid #f3f4f6' }}>Items Ordered</p>
                                    {order.items?.map((item: any, i: number) => (
                                      <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white" style={{ borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                                          {item.image
                                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                          <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                        </div>
                                        <p className="text-sm font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Price summary */}
                                  <div className="rounded-xl bg-white p-4 space-y-2" style={{ border: '1px solid #e5e7eb' }}>
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Payment Summary</p>
                                    <div className="flex justify-between text-sm text-gray-600">
                                      <span>Subtotal</span><span className="font-semibold">{formatCurrency(order.subtotal || order.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                      <span>Shipping</span><span className="font-semibold text-green-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between font-black text-gray-900 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                                      <span>Total Paid</span><span style={{ color: '#cf3232' }}>{formatCurrency(order.total)}</span>
                                    </div>
                                  </div>

                                  {/* Shipping address */}
                                  {order.shippingAddress?.street && (
                                    <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #e5e7eb' }}>
                                      <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
                                      <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">
                                          {order.shippingAddress.street}, {order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Vendor info */}
                                  {order.vendor && (
                                    <div className="rounded-xl bg-white p-4" style={{ border: '1px solid #e5e7eb' }}>
                                      <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Sold By</p>
                                      <p className="text-sm font-semibold text-gray-800">{order.vendor?.businessName}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ADDRESSES */}
                {tab === 'addresses' && (
                  <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#f3f4f6' }}>
                      <h2 className="font-black text-gray-800 text-lg">Addresses</h2>
                      {!showAddrForm && (
                        <button onClick={() => { setShowAddrForm(true); setEditingAddrId(null); setAddrForm({ ...emptyAddr }); }}
                          className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition"
                          style={{ background: '#FAEFEF', color: '#cf3232', border: '1px solid #fecdd3' }}>
                          <Plus className="w-4 h-4" /> Add Address
                        </button>
                      )}
                    </div>

                    {showAddrForm && (
                      <div className="p-5 border-b" style={{ borderColor: '#f3f4f6', background: '#fafafa' }}>
                        <h3 className="font-bold text-gray-700 mb-3">{editingAddrId ? 'Edit Address' : 'New Address'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(['label','street','city','state','zipCode'] as const).map(field => (
                            <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                              value={addrForm[field]} onChange={e => setAddrForm(p => ({ ...p, [field]: e.target.value }))}
                              className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2" style={{ borderColor: '#e5e7eb' }} />
                          ))}
                          <CountrySelect
                            value={addrForm.country}
                            onChange={val => setAddrForm(p => ({ ...p, country: val }))}
                            className="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2"
                            style={{ borderColor: '#e5e7eb', background: '#fff', color: '#111827' }}
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} />
                          Set as default
                        </label>
                        <div className="flex gap-2 mt-4">
                          <button onClick={saveAddress} disabled={addrSaving}
                            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white transition"
                            style={{ background: '#cf3232' }}>
                            {addrSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                          </button>
                          <button onClick={() => { setShowAddrForm(false); setEditingAddrId(null); }}
                            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition"
                            style={{ background: '#f3f4f6', color: '#374151' }}>
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {addresses.length === 0 && !showAddrForm ? (
                      <div className="text-center py-16 text-gray-400">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No addresses saved</p>
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
                        {addresses.map((addr: any) => (
                          <div key={addr._id} className="p-5 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Home className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#cf3232' }} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-800 text-sm">{addr.label || 'Address'}</p>
                                  {addr.isDefault && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FAEFEF', color: '#cf3232' }}>Default</span>}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => { setAddrForm({ label: addr.label, street: addr.street, city: addr.city, state: addr.state, country: addr.country, zipCode: addr.zipCode, isDefault: addr.isDefault }); setEditingAddrId(addr._id); setShowAddrForm(true); }}
                                className="p-1.5 rounded-lg transition" style={{ background: '#f3f4f6', color: '#374151' }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteAddress(addr._id)}
                                className="p-1.5 rounded-lg transition" style={{ background: '#fef2f2', color: '#991b1b' }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* REVIEWS */}
                {tab === 'reviews' && (
                  <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="p-5 border-b" style={{ borderColor: '#f3f4f6' }}>
                      <h2 className="font-black text-gray-800 text-lg">My Reviews</h2>
                    </div>
                    {reviews.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No reviews yet</p>
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
                        {reviews.map((r: any) => (
                          <div key={r._id} className="p-5">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{r.product?.name || 'Product'}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1,2,3,4,5].map(n => (
                                    <Star key={n} className="w-4 h-4" style={{ color: n <= r.rating ? '#f59e0b' : '#d1d5db', fill: n <= r.rating ? '#f59e0b' : 'none' }} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                            </div>
                            {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                            {r.product?._id && (
                              <Link href={`/product/${r.product._id}`} className="inline-flex items-center gap-1 text-xs font-bold mt-2" style={{ color: '#cf3232' }}>
                                <ExternalLink className="w-3 h-3" /> View Product
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PROFILE */}
                {tab === 'profile' && (
                  <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#f3f4f6' }}>
                      <h2 className="font-black text-gray-800 text-lg">Profile</h2>
                      {!editingProfile ? (
                        <button onClick={() => setEditingProfile(true)}
                          className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition"
                          style={{ background: '#FAEFEF', color: '#cf3232', border: '1px solid #fecdd3' }}>
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={saveProfile} disabled={profileSaving}
                            className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl text-white transition"
                            style={{ background: '#cf3232' }}>
                            {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                          </button>
                          <button onClick={() => { setEditingProfile(false); setProfileMsg(''); }}
                            className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition"
                            style={{ background: '#f3f4f6', color: '#374151' }}>
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                      {profileMsg === 'saved' && (
                        <div className="flex items-center gap-2 text-sm font-bold p-3 rounded-xl" style={{ background: '#f0fdf4', color: '#166534' }}>
                          <CheckCircle className="w-4 h-4" /> Profile updated successfully
                        </div>
                      )}
                      {profileMsg && profileMsg !== 'saved' && (
                        <div className="flex items-center gap-2 text-sm font-bold p-3 rounded-xl" style={{ background: '#fef2f2', color: '#991b1b' }}>
                          <AlertCircle className="w-4 h-4" /> {profileMsg}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">First Name</label>
                          {editingProfile
                            ? <input value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                                className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2" style={{ borderColor: '#e5e7eb' }} />
                            : <p className="mt-1 text-sm font-semibold text-gray-800">{buyer.firstName}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Name</label>
                          {editingProfile
                            ? <input value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                                className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2" style={{ borderColor: '#e5e7eb' }} />
                            : <p className="mt-1 text-sm font-semibold text-gray-800">{buyer.lastName}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                          <p className="mt-1 text-sm font-semibold text-gray-800">{buyer.email}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</label>
                          {editingProfile
                            ? <div className="mt-1"><PhoneInput value={profileForm.phone} onChange={val => setProfileForm(p => ({ ...p, phone: val }))} /></div>
                            : <p className="mt-1 text-sm font-semibold text-gray-800">{buyer.phone || '—'}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Member Since</label>
                          <p className="mt-1 text-sm font-semibold text-gray-800">{profile?.createdAt ? formatDate(profile.createdAt) : '—'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Status</label>
                          <p className="mt-1 text-sm font-semibold" style={{ color: buyer.isEmailVerified ? '#166534' : '#92400e' }}>
                            {buyer.isEmailVerified ? 'Verified' : 'Not Verified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ border: '1px solid #e5e7eb' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#f3f4f6' }}>
              <div>
                <p className="font-black text-gray-900">Request Return</p>
                <p className="text-xs text-gray-400 mt-0.5">Order #{returnModal._id?.slice(-6).toUpperCase()}</p>
              </div>
              <button onClick={() => setReturnModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reason for Return</label>
                <textarea value={returnForm.reason} onChange={e => setReturnForm(p => ({ ...p, reason: e.target.value }))}
                  placeholder="Describe why you want to return this item..."
                  rows={3} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  style={{ borderColor: '#e5e7eb' }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Refund Method</label>
                <select value={returnForm.refundType} onChange={e => setReturnForm(p => ({ ...p, refundType: e.target.value }))}
                  className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ borderColor: '#e5e7eb', background: '#fff' }}>
                  <option value="original">Original Payment Method (Card/Wallet)</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              {returnForm.refundType === 'upi' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">UPI ID</label>
                  <input value={returnForm.upiId} onChange={e => setReturnForm(p => ({ ...p, upiId: e.target.value }))}
                    placeholder="yourname@upi" className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
              )}
              {returnForm.refundType === 'bank' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bank Name</label>
                    <input value={returnForm.bankName} onChange={e => setReturnForm(p => ({ ...p, bankName: e.target.value }))}
                      placeholder="e.g. HDFC Bank" className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb' }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Account Number</label>
                    <input value={returnForm.bankAccount} onChange={e => setReturnForm(p => ({ ...p, bankAccount: e.target.value }))}
                      placeholder="Account number" className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb' }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">IFSC Code</label>
                    <input value={returnForm.bankIfsc} onChange={e => setReturnForm(p => ({ ...p, bankIfsc: e.target.value }))}
                      placeholder="e.g. HDFC0001234" className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb' }} />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400">Note: Refund will be processed after the seller reviews and approves your return request.</p>
            </div>
            <div className="p-5 border-t flex gap-3" style={{ borderColor: '#f3f4f6' }}>
              <button onClick={submitReturn} disabled={actionLoading === returnModal._id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition"
                style={{ background: '#cf3232' }}>
                {actionLoading === returnModal._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Submit Return Request
              </button>
              <button onClick={() => setReturnModal(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition"
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