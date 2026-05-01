'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/lib/vendorAuth';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function StripeReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'incomplete'>('loading');

  useEffect(() => {
    vendorApi.get('/vendor/auth/stripe/status')
      .then(({ data }) => {
        setStatus(data.onboarded ? 'success' : 'incomplete');
      })
      .catch(() => setStatus('incomplete'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAEFEF' }}>
      <div className="bg-white rounded-3xl p-10 shadow-sm text-center max-w-sm w-full" style={{ border: '1px solid #e5e7eb' }}>
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#cf3232' }} />
            <p className="font-bold text-gray-700">Verifying your Stripe account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Stripe Connected!</h2>
            <p className="text-gray-500 text-sm mb-6">Your Stripe account is verified. You can now receive payments and withdraw earnings.</p>
            <button onClick={() => router.push('/vendor/wallet')}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white mb-2" style={{ background: '#cf3232' }}>
              Go to Wallet
            </button>
            <button onClick={() => router.push('/vendor/dashboard')}
              className="w-full py-3 rounded-2xl font-bold text-sm" style={{ background: '#f3f4f6', color: '#374151' }}>
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'incomplete' && (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#fef9c3' }}>
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Setup Incomplete</h2>
            <p className="text-gray-500 text-sm mb-6">Your Stripe onboarding is not fully complete. Please finish the setup to receive payments.</p>
            <button onClick={() => router.push('/vendor/settings')}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white mb-2" style={{ background: '#cf3232' }}>
              Complete Setup
            </button>
          </>
        )}
      </div>
    </div>
  );
}
