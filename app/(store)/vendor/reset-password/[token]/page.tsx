'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Eye, EyeOff, Store, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function VendorResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api.patch(`/vendor/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => router.push('/vendor/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Link is invalid or expired');
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
              <Store className="w-5 h-5" style={{ color: '#cf3232' }} />
            </div>
            <span className="text-white font-black text-2xl">Bazaar</span>
          </Link>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">Set a new<br />password</h2>
          <p className="text-white/60 text-base">Secure your vendor account with a strong password.</p>
        </div>
        <p className="relative z-10 text-white/30 text-xs">© 2026 Bazaar. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="w-full max-w-md mx-auto">
          <button onClick={() => router.push('/vendor/login')}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>

          {done ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Password updated!</h2>
              <p className="text-gray-400 text-sm mt-2">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">New password</h1>
                <p className="text-gray-400 text-sm mt-1.5">Must be at least 8 characters with 1 uppercase & 1 number</p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} required placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11 transition-all"
                      style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} required placeholder="Re-enter your password"
                      value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-11 transition-all"
                      style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
