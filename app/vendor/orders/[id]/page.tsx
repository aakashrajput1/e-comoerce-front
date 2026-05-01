'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendorApi } from '@/lib/vendorAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin,
  User, CreditCard, RotateCcw, Loader2, AlertCircle, Edit2, Save, X,
} from 'lucide-react';

const STATUS_FLOW: Record<string, { next: string; label: string; icon: any; style: { bg: string; color: string } }> = {
  paid:       { next: 'processing', label: 'Mark Processing', icon: Clock,  style: { bg: '#ede9fe', color: '#5b21b6' } },
  processing: { next: 'shipped',    label: 'Mark Shipped',    icon: Truck,  style: { bg: '#fef9c3', color: '#854d0e' } },
  // 'delivered' is now set by buyer confirming receipt
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending_payment:  { bg: '#f3f4f6', color: '#4b5563' },
  paid:             { bg: '#dbeafe', color: '#1e40af' },
  processing:       { bg: '#ede9fe', color: '#5b21b6' },
  shipped:          { bg: '#fef9c3', color: '#854d0e' },
  delivered:        { bg: '#d1fae5', color: '#065f46' },
  completed:        { bg: '#d1fae5', color: '#065f46' },
  cancelled:        { bg: '#fee2e2', color: '#991b1b' },
  refunded:         { bg: '#fee2e2', color: '#991b1b' },
  return_requested: { bg: '#ffedd5', color: '#9a3412' },
  return_approved:  { bg: '#ffedd5', color: '#9a3412' },
};

const STEPS = ['paid', 'processing', 'shipped', 'delivered', 'completed'];
const STEP_LABELS: Record<string, string> = {
  paid: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', completed: 'Completed',
};

export default function VendorOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [returnAction, setReturnAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [handlingReturn, setHandlingReturn] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);
  const [shipForm, setShipForm] = useState({ trackingNumber: '', shippingCarrier: '', vendorNote: '' });

  useEffect(() => {
    vendorApi.get(`/vendor/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .catch(() => router.push('/vendor/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string, extra?: any) => {
    setUpdating(true);
    try {
      const { data } = await vendorApi.patch(`/vendor/orders/${id}/status`, { status, ...extra });
      setOrder(data.order);
      setShowShipForm(false);
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  const handleReturn = async (action: 'approve' | 'reject') => {
    setHandlingReturn(true);
    try {
      await vendorApi.patch(`/vendor/orders/${id}/return`, { action, reason: rejectReason });
      const { data } = await vendorApi.get(`/vendor/orders/${id}`);
      setOrder(data.order);
      setReturnAction(null);
      setRejectReason('');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setHandlingReturn(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#cf3232' }} />
    </div>
  );
  if (!order) return null;

  const sc = STATUS_BADGE[order.status] || STATUS_BADGE.pending_payment;
  const nextAction = STATUS_FLOW[order.status];
  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.push('/vendor/orders')}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="w-4 h-4" /> Orders
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-gray-800">#{order._id?.slice(-10).toUpperCase()}</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize ml-auto" style={sc}>
          {order.status?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Progress stepper */}
      {!['cancelled', 'refunded', 'return_requested', 'return_approved', 'pending_payment'].includes(order.status) && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
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
                {i < STEPS.length - 1 && (
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
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <Package className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Order Items ({order.items?.length})</p>
            </div>
            <div className="divide-y" style={{ borderColor: '#f9fafb' }}>
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" style={{ color: '#cf3232' }} />
              <p className="font-black text-gray-900">Shipping Address</p>
            </div>
            {order.shippingAddress?.street ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-800">{order.buyer?.firstName} {order.buyer?.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No shipping address provided</p>
            )}

            {/* Tracking info */}
            {order.trackingNumber && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <p className="text-xs font-bold text-green-700">Tracking Info</p>
                <p className="text-sm text-green-800 mt-0.5">
                  {order.shippingCarrier && <span className="font-semibold">{order.shippingCarrier}: </span>}
                  {order.trackingNumber}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {(order.buyerNote || order.vendorNote) && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="font-black text-gray-900 mb-3">Notes</p>
              {order.buyerNote && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-500 mb-1">Buyer Note</p>
                  <p className="text-sm text-gray-700 p-3 rounded-xl" style={{ background: '#FAEFEF' }}>{order.buyerNote}</p>
                </div>
              )}
              {order.vendorNote && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Your Note</p>
                  <p className="text-sm text-gray-700 p-3 rounded-xl" style={{ background: '#FAEFEF' }}>{order.vendorNote}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: '#cf3232' }} /> Payment Summary
            </p>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Subtotal', value: formatCurrency(order.subtotal) },
                { label: 'Shipping', value: order.shippingCost ? formatCurrency(order.shippingCost) : 'Free' },
                { label: 'Platform Fee', value: `-${formatCurrency(order.platformFee)}`, color: '#dc2626' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-gray-600">
                  <span>{label}</span>
                  <span className="font-semibold" style={{ color: color || '#374151' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-gray-900 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                <span>You Receive</span>
                <span style={{ color: '#059669' }}>{formatCurrency(order.vendorAmount)}</span>
              </div>
            </div>
          </div>

          {/* Buyer info */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#cf3232' }} /> Buyer
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: '#cf3232' }}>
                {order.buyer?.firstName?.[0]}{order.buyer?.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{order.buyer?.firstName} {order.buyer?.lastName}</p>
                <p className="text-xs text-gray-400">{order.buyer?.email}</p>
                {order.buyer?.phone && <p className="text-xs text-gray-400">{order.buyer?.phone}</p>}
              </div>
            </div>
          </div>

          {/* Order meta */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-black text-gray-900 mb-3">Order Info</p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-mono font-bold text-gray-700">#{order._id?.slice(-10).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Placed</span>
                <span className="font-semibold text-gray-700">{formatDate(order.createdAt)}</span>
              </div>
              {order.returnWindowExpiresAt && (
                <div className="flex justify-between">
                  <span>Return Window</span>
                  <span className="font-semibold text-gray-700">{formatDate(order.returnWindowExpiresAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          {nextAction && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="font-black text-gray-900 mb-3">Next Action</p>

              {nextAction.next === 'shipped' && !showShipForm ? (
                <button onClick={() => setShowShipForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ background: nextAction.style.bg, color: nextAction.style.color }}>
                  <nextAction.icon className="w-4 h-4" /> {nextAction.label}
                </button>
              ) : nextAction.next === 'shipped' && showShipForm ? (
                <div className="space-y-3">
                  <input value={shipForm.shippingCarrier} onChange={e => setShipForm(f => ({ ...f, shippingCarrier: e.target.value }))}
                    placeholder="Carrier (e.g. FedEx, UPS)"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ borderColor: '#e5e7eb' }}
                    onFocus={e => (e.target.style.borderColor = '#cf3232')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  <input value={shipForm.trackingNumber} onChange={e => setShipForm(f => ({ ...f, trackingNumber: e.target.value }))}
                    placeholder="Tracking number"
                    className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ borderColor: '#e5e7eb' }}
                    onFocus={e => (e.target.style.borderColor = '#cf3232')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus('shipped', shipForm)} disabled={updating}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm"
                      style={{ background: nextAction.style.bg, color: nextAction.style.color }}>
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      Confirm Ship
                    </button>
                    <button onClick={() => setShowShipForm(false)}
                      className="px-3 py-2.5 rounded-xl" style={{ background: '#f3f4f6', color: '#374151' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => updateStatus(nextAction.next)} disabled={updating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm disabled:opacity-60"
                  style={{ background: nextAction.style.bg, color: nextAction.style.color }}>
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <nextAction.icon className="w-4 h-4" />}
                  {nextAction.label}
                </button>
              )}
            </div>
          )}

          {order.status === 'shipped' && (
            <div className="flex items-start gap-2 p-4 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <Truck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">Awaiting Buyer Confirmation</p>
                <p className="text-xs text-green-700 mt-0.5">Order is shipped. Waiting for buyer to confirm receipt. Once confirmed, return window will start.</p>
              </div>
            </div>
          )}

          {order.status === 'return_requested' && (
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #fed7aa' }}>
              <div className="flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-orange-800">Return Requested</p>
                  {order.returnReason && <p className="text-xs text-orange-700 mt-0.5">Reason: {order.returnReason}</p>}
                  {order.refundMethod?.type && order.refundMethod.type !== 'original' && (
                    <p className="text-xs text-orange-700 mt-0.5">
                      Refund to: {order.refundMethod.type === 'upi'
                        ? `UPI — ${order.refundMethod.upiId}`
                        : `Bank — ${order.refundMethod.bankName} ${order.refundMethod.bankAccount}`}
                    </p>
                  )}
                </div>
              </div>

              {returnAction === 'reject' ? (
                <div className="space-y-3">
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    rows={2} className="w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
                    style={{ borderColor: '#e5e7eb' }} />
                  <div className="flex gap-2">
                    <button onClick={() => handleReturn('reject')} disabled={handlingReturn}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: '#dc2626' }}>
                      {handlingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Confirm Reject
                    </button>
                    <button onClick={() => setReturnAction(null)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold"
                      style={{ background: '#f3f4f6', color: '#374151' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleReturn('approve')} disabled={handlingReturn}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#059669' }}>
                    {handlingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve & Refund
                  </button>
                  <button onClick={() => setReturnAction('reject')} disabled={handlingReturn}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: '#fee2e2', color: '#991b1b' }}>
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
