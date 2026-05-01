'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowLeft, ShoppingBag, Sparkles, Shield, Truck, CheckCircle } from 'lucide-react';
import { useBuyerAuth } from '@/lib/buyerAuth';
import { getCart, clearCart } from '@/lib/cart';
import api from '@/lib/api';

const PERKS = [
  { icon: <ShoppingBag className="w-5 h-5" />, title: 'Thousands of Products', desc: 'Shop from top sellers worldwide' },
  { icon: <Truck className="w-5 h-5" />, title: 'Fast Delivery', desc: 'Track your orders in real-time' },
  { icon: <Shield className="w-5 h-5" />, title: 'Secure Payments', desc: 'Your data is always protected' },
  { icon: <Sparkles className="w-5 h-5" />, title: 'Exclusive Deals', desc: 'Members-only offers & discounts' },
];

export default function BuyerLoginPage() {
  const { login } = useBuyerAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const guestCartCount = typeof window !== 'undefined' ? getCart().length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      const guestCart = getCart();
      if (guestCart.length > 0) {
        const token = localStorage.getItem('buyer_token');
        for (const item of guestCart) {
          try {
            await api.post('/buyer/cart/add', { productId: item.productId, quantity: item.quantity },
              { headers: { Authorization: `Bearer ${token}` } });
          } catch { /* ignore */ }
        }
        clearCart();
      }
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/buyer/account';
      router.push(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FAEFEF' }}>

      {/* ── Left panel ── */}
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

          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            Good to see<br />you again.
          </h2>
          <p className="text-white/60 text-base mb-12">Sign in and pick up where you left off.</p>

          <div className="space-y-5">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                  {p.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{p.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 text-xs">© 2026 Bazaar. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">

          {/* Back button */}
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to your Bazaar account</p>
          </div>

          {/* Cart notice */}
          {guestCartCount > 0 && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: '#d1fae5', color: '#065f46' }}>
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {guestCartCount} cart item(s) will be saved after login
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#fee2e2', color: '#991b1b' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" required placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = '#cf3232')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Password</label>
                <Link href="/buyer/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#cf3232' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f0f0f0' }}>
            <p className="text-sm text-gray-500">
              New here?{' '}
              <Link href="/buyer/register" className="font-black hover:underline" style={{ color: '#cf3232' }}>Create account</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
