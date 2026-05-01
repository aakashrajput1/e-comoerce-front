'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, ArrowRight } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'paid',       label: 'Order Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing',       icon: Clock },
  { key: 'shipped',    label: 'Shipped',          icon: Truck },
  { key: 'delivered',  label: 'Delivered',        icon: Package },
  { key: 'completed',  label: 'Completed',        icon: CheckCircle },
];

const STATUS_INDEX: Record<string, number> = {
  paid: 0, processing: 1, shipped: 2, delivered: 3, completed: 4,
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    try {
      const token = localStorage.getItem('buyer_token');
      const { data } = await api.get(`/buyer/orders/${orderId.trim()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setOrder(data.order);
    } catch {
      setError('Order not found. Please check your Order ID and make sure you are logged in.');
    } finally { setLoading(false); }
  };

  const currentStep = order ? (STATUS_INDEX[order.status] ?? -1) : -1;

  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <Truck className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Track Your Order</h1>
          <p className="text-white/70 text-sm">Enter your Order ID to get real-time updates</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <form onSubmit={track} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Enter your Order ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '1px solid #e5e7eb' }}
                onFocus={e => (e.target.style.borderColor = '#cf3232')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
            <button type="submit" disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
              style={{ background: '#cf3232' }}>
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
          {error && <p className="text-sm text-red-600 mt-3 font-medium">{error}</p>}
          <p className="text-xs text-gray-400 mt-3">
            Find your Order ID in your confirmation email or{' '}
            <Link href="/buyer/account" className="font-semibold hover:underline" style={{ color: '#cf3232' }}>My Orders</Link>.
          </p>
        </div>

        {/* Result */}
        {order && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Order ID</p>
                <p className="font-black text-gray-900 text-lg">#{order._id?.slice(-10).toUpperCase()}</p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-sm font-bold capitalize"
                style={{
                  background: order.status === 'delivered' || order.status === 'completed' ? '#d1fae5' : order.status === 'cancelled' ? '#fee2e2' : '#fef9c3',
                  color: order.status === 'delivered' || order.status === 'completed' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : '#854d0e',
                }}>
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Progress stepper */}
            {!['cancelled', 'refunded'].includes(order.status) && (
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map(({ key, label, icon: Icon }, i) => (
                  <div key={key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: i <= currentStep ? '#cf3232' : '#f3f4f6',
                          color: i <= currentStep ? '#fff' : '#9ca3af',
                        }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-center leading-tight max-w-[60px]"
                        style={{ color: i <= currentStep ? '#cf3232' : '#9ca3af' }}>
                        {label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mb-5 transition-all"
                        style={{ background: i < currentStep ? '#cf3232' : '#e5e7eb' }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Items */}
            {order.items?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Items in this order</p>
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FAEFEF' }}>
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-auto text-gray-300 mt-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.productName || item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping address */}
            {order.shippingAddress?.street && (
              <div className="p-4 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delivering to</p>
                <p className="text-sm text-gray-700">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help */}
        <div className="text-center text-sm text-gray-400">
          Need help?{' '}
          <Link href="/contact" className="font-semibold hover:underline" style={{ color: '#cf3232' }}>Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
