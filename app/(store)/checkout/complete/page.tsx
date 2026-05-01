'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buyerApi } from '@/lib/buyerAuth';
import { clearCart } from '@/lib/cart';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

function CompleteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!orderId) { setStatus('error'); return; }
    buyerApi.post(`/buyer/orders/${orderId}/confirm`, {})
      .then(() => { clearCart(); setStatus('success'); })
      .catch(() => setStatus('error'));
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAEFEF' }}>
      <div className="bg-white rounded-3xl p-10 shadow-sm text-center max-w-sm w-full" style={{ border: '1px solid #e5e7eb' }}>
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#cf3232' }} />
            <p className="font-bold text-gray-700">Confirming your order...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-sm mb-6">Your payment was successful and your order is confirmed.</p>
            <button onClick={() => router.push('/buyer/account')}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white mb-2" style={{ background: '#cf3232' }}>
              View My Orders
            </button>
            <button onClick={() => router.push('/products')}
              className="w-full py-3 rounded-2xl font-bold text-sm" style={{ background: '#f3f4f6', color: '#374151' }}>
              Continue Shopping
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#fee2e2' }}>
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">If your payment was charged, contact support with order ID: {orderId}</p>
            <button onClick={() => router.push('/buyer/account')}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
              Go to My Account
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#cf3232' }} />
      </div>
    }>
      <CompleteInner />
    </Suspense>
  );
}
