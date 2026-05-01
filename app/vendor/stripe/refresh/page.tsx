'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vendorApi } from '@/lib/vendorAuth';
import { Loader2, RefreshCw } from 'lucide-react';

export default function StripeRefreshPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-retry getting a fresh onboarding link
  const retry = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await vendorApi.post('/vendor/auth/stripe/onboard', {});
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate link. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => { retry(); }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAEFEF' }}>
      <div className="bg-white rounded-3xl p-10 shadow-sm text-center max-w-sm w-full" style={{ border: '1px solid #e5e7eb' }}>
        {loading && !error ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#cf3232' }} />
            <p className="font-bold text-gray-700">Refreshing your Stripe session...</p>
            <p className="text-sm text-gray-400 mt-1">You'll be redirected to Stripe shortly.</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#fee2e2' }}>
              <RefreshCw className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-500 text-sm mb-2">Your Stripe onboarding link expired.</p>
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            <button onClick={retry} disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white mb-2 flex items-center justify-center gap-2"
              style={{ background: '#cf3232' }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Retry Stripe Setup
            </button>
            <button onClick={() => router.push('/vendor/settings')}
              className="w-full py-3 rounded-2xl font-bold text-sm" style={{ background: '#f3f4f6', color: '#374151' }}>
              Back to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
