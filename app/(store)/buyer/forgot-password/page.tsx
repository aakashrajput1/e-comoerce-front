'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, ShoppingBag, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function BuyerForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/buyer/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FAEFEF' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #cf3232 0%, #4c0519 100%)' }}>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" style={{ color: '#cf3232' }} />
            </div>
            <span className="text-white font-black text-2xl">Bazaar</span>
          </Link>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">Forgot your<br />password?</h2>
          <p className="text-white/60 text-base">No worries — we'll send you a reset link right away.</p>
        </div>
        <p className="relative z-10 text-white/30 text-xs">© 2026 Bazaar. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="w-full max-w-md mx-auto">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Check your email</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
                We sent a password reset link to <span className="font-bold text-gray-700">{email}</span>. It expires in 10 minutes.
              </p>
              <Link href="/buyer/login"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Reset password</h1>
                <p className="text-gray-400 text-sm mt-1.5">Enter your email and we'll send you a reset link</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link →'}
                </button>
              </form>

              <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f0f0f0' }}>
                <p className="text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link href="/buyer/login" className="font-black hover:underline" style={{ color: '#cf3232' }}>Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
