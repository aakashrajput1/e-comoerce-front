'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi as api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/Badge';
import {
  ArrowLeft, Package, MapPin, User, Store, CreditCard,
  RotateCcw, Loader2, CheckCircle, Clock, Truck,
  AlertCircle, ExternalLink, DollarSign, Shield,
} from 'lucide-react';

const CARD: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb',
  borderRadius: '0.75rem', padding: '1.25rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const STATUS_STEPS = ['paid', 'processing', 'shipped', 'delivered', 'completed'];
const STEP_LABELS: Record<string, string> = {
  paid: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', completed: 'Completed',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    api.get(`/admin/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .catch(() => router.push('/dashboard/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const refundOrder = async () => {
    if (!confirm('Process full refund for this order?')) return;
    setRefunding(true);
    try {
      await api.post(`/admin/orders/${id}/refund`);
      const r = await api.get(`/admin/orders/${id}`);
      setOrder(r.data.order);
    } catch (err: any) { alert(err.response?.data?.message || 'Refund failed'); }
    finally { setRefunding(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-32 rounded-lg animate-pulse bg-gray-100" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl animate-pulse bg-gray-100" />)}
    </div>
  );
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = ['cancelled', 'refunded'].includes(order.status);
  const isReturn = ['return_requested', 'return_approved'].includes(order.status);
  const canRefund = ['paid', 'processing', 'shipped', 'delivered', 'return_requested'].includes(order.status);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <button onClick={() => router.push('/dashboard/orders')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Order <span className="font-mono" style={{ color: '#cf3232' }}>#{order._id?.slice(-10).toUpperCase()}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge status={order.status} />
          {canRefund && (
            <button onClick={refundOrder} disabled={refunding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-60"
              style={{ background: '#fee2e2', color: '#991b1b' }}>
              {refunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              {refunding ? 'Processing...' : 'Refund Order'}
            </button>
          )}
        </div>
      </div>

      {/* Status alerts */}
      {isCancelled && (
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Order {order.status === 'refunded' ? 'Refunded' : 'Cancelled'}</p>
            {order.cancellationReason && <p className="text-sm text-red-700 mt-0.5">Reason: {order.cancellationReason}</p>}
          </div>
        </div>
      )}
      {isReturn && (
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
          <RotateCcw className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-800">Return {order.status === 'return_requested' ? 'Requested' : 'Approved'}</p>
            <p className="text-sm text-orange-700 mt-0.5">Buyer has requested a return for this order.</p>
          </div>
        </div>
      )}

      {/* Progress stepper */}
      {!isCancelled && !isReturn && currentStep >= 0 && (
        <div style={CARD}>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: i <= currentStep ? '#cf3232' : '#f3f4f6',
                      color: i <= currentStep ? '#fff' : '#9ca3af',
                    }}>
                    {i < currentStep ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-black">{i + 1}</span>}
                  </div>
                  <span className="text-xs font-semibold text-center" style={{ color: i <= currentStep ? '#cf3232' : '#9ca3af' }}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 mb-5 transition-all"
                    style={{ background: i < currentStep ? '#cf3232' : '#e5e7eb' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Order Items ({order.items?.length})</p>
            </div>
            <div className="divide-y" style={{ borderColor: '#f9fafb' }}>
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 py-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                      {item.returnPolicyDays > 0 && ` · ${item.returnPolicyDays}-day return`}
                    </p>
                  </div>
                  <p className="font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Shipping Address</p>
            </div>
            {order.shippingAddress?.street ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No shipping address</p>
            )}
            {order.trackingNumber && (
              <div className="mt-3 p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Tracking
                </p>
                <p className="text-sm text-green-800 mt-0.5">
                  {order.shippingCarrier && <span className="font-semibold">{order.shippingCarrier}: </span>}
                  {order.trackingNumber}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {(order.buyerNote || order.vendorNote) && (
            <div style={CARD}>
              <p className="font-black text-gray-900 mb-3">Notes</p>
              {order.buyerNote && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Buyer Note</p>
                  <p className="text-sm text-gray-700 p-3 rounded-xl" style={{ background: '#FAEFEF' }}>{order.buyerNote}</p>
                </div>
              )}
              {order.vendorNote && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Vendor Note</p>
                  <p className="text-sm text-gray-700 p-3 rounded-xl" style={{ background: '#FAEFEF' }}>{order.vendorNote}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Payment summary */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Payment</p>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Subtotal', value: formatCurrency(order.subtotal) },
                { label: 'Shipping', value: order.shippingCost ? formatCurrency(order.shippingCost) : 'Free' },
                { label: 'Platform Fee', value: formatCurrency(order.platformFee), color: '#059669' },
                { label: 'Vendor Amount', value: formatCurrency(order.vendorAmount), color: '#2563eb' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-gray-600">
                  <span>{label}</span>
                  <span className="font-semibold" style={{ color: color || '#374151' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-gray-900 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                <span>Total</span>
                <span style={{ color: '#cf3232' }}>{formatCurrency(order.total)}</span>
              </div>
            </div>
            {order.stripePaymentIntentId && (
              <div className="mt-3 p-2.5 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Stripe Payment
                </p>
                <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">{order.stripePaymentIntentId}</p>
              </div>
            )}
          </div>

          {/* Buyer */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Buyer</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: '#cf3232' }}>
                {order.buyer?.firstName?.[0]}{order.buyer?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{order.buyer?.firstName} {order.buyer?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{order.buyer?.email}</p>
              </div>
            </div>
            <button onClick={() => router.push(`/dashboard/buyers/${order.buyer?._id}`)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: '#FAEFEF', color: '#374151', border: '1px solid #e5e7eb' }}>
              <ExternalLink className="w-3.5 h-3.5" /> View Buyer Profile
            </button>
          </div>

          {/* Vendor */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Vendor</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: '#2563eb' }}>
                {order.vendor?.businessName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{order.vendor?.businessName}</p>
                <p className="text-xs text-gray-400 truncate">{order.vendor?.email}</p>
              </div>
            </div>
            <button onClick={() => router.push(`/dashboard/vendors/${order.vendor?._id}`)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition"
              style={{ background: '#FAEFEF', color: '#374151', border: '1px solid #e5e7eb' }}>
              <ExternalLink className="w-3.5 h-3.5" /> View Vendor Profile
            </button>
          </div>

          {/* Timeline */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Timeline</p>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Order Placed</span>
                <span className="font-semibold text-gray-700">{formatDate(order.createdAt)}</span>
              </div>
              {order.returnWindowExpiresAt && (
                <div className="flex justify-between">
                  <span>Return Window Expires</span>
                  <span className={`font-semibold ${new Date(order.returnWindowExpiresAt) > new Date() ? 'text-orange-600' : 'text-gray-400'}`}>
                    {formatDate(order.returnWindowExpiresAt)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Wallet Released</span>
                <span className={`font-semibold ${order.walletReleased ? 'text-green-600' : 'text-gray-400'}`}>
                  {order.walletReleased ? 'Yes' : 'Pending'}
                </span>
              </div>
              {order.stripeTransferId && (
                <div className="flex justify-between">
                  <span>Stripe Transfer</span>
                  <span className="font-mono text-gray-400 truncate max-w-[120px]">{order.stripeTransferId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
