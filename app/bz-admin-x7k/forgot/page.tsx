'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, ShoppingBag, CheckCircle, Shield } from 'lucide-react';
import api from '@/lib/api';

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/admin/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAEFEF' }}>
      <div className="w-full max-w-sm">
        <button onClick={() => router.push('/bz-admin-x7k')}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Check your email</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
              Reset link sent to <span className="font-bold text-gray-700">{email}</span>. Expires in 10 minutes.
            </p>
            <Link href="/login"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: '#cf3232' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#cf3232' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">Reset Admin Password</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your admin email to receive a reset link</p>
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <span>⚠️</span> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required placeholder="admin@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                      style={{ border: '1px solid #d1d5db', color: '#111827', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:opacity-90"
                  style={{ background: '#cf3232' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link →'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
