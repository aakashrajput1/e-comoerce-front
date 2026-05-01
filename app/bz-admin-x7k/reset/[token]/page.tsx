'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminResetPasswordPage() {
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
      await api.patch(`/admin/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      setTimeout(() => router.push('/bz-admin-x7k'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Link is invalid or expired');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAEFEF' }}>
      <div className="w-full max-w-sm">
        {done ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Password updated!</h2>
            <p className="text-gray-400 text-sm mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#cf3232' }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">Set New Password</h1>
              <p className="text-sm text-gray-500 mt-1">Min 8 characters, 1 uppercase & 1 number</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} required placeholder="Min 8 chars, 1 uppercase, 1 number"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none pr-10 transition-all"
                      style={{ border: '1px solid #d1d5db', color: '#111827', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} required placeholder="Re-enter your password"
                      value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none pr-10 transition-all"
                      style={{ border: '1px solid #d1d5db', color: '#111827', background: '#fff' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:opacity-90"
                  style={{ background: '#cf3232' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password →'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
