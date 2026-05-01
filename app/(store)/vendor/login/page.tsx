'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Store } from 'lucide-react';
import { useVendorAuth } from '@/lib/vendorAuth';

export default function VendorLoginPage() {
  const { login } = useVendorAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      router.push('/vendor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FAEFEF' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-96 flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #cf3232 0%, #cf3232 100%)' }}>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
          <Store className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Vendor Portal</h2>
        <p className="text-white/70 text-sm leading-relaxed">
          Manage your store, products, orders and earnings — all in one place.
        </p>
        <div className="mt-8 space-y-3">
          {['Manage unlimited products', 'Real-time order tracking', 'Secure Stripe payouts', 'Analytics & reports'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your vendor account</p>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: '#fee2e2', color: '#991b1b' }}>{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="vendor@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                  style={{ border: '1px solid #d1d5db', color: '#111827' }}
                  onFocus={e => (e.target.style.borderColor = '#cf3232')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none pr-10"
                    style={{ border: '1px solid #d1d5db', color: '#111827' }}
                    onFocus={e => (e.target.style.borderColor = '#cf3232')}
                    onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/vendor/forgot-password" className="text-xs text-gray-400 hover:underline">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: '#cf3232' }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              New vendor? <Link href="/vendor/register" className="font-semibold hover:underline" style={{ color: '#cf3232' }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
