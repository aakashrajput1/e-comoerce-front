'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Eye, EyeOff, Loader2, ShoppingBag, BarChart3, Users, Package, ShieldCheck } from 'lucide-react';

const STATS = [
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Revenue Analytics' },
  { icon: <Users className="w-5 h-5" />, label: 'Vendor & Buyer Management' },
  { icon: <Package className="w-5 h-5" />, label: 'Order & Product Control' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Role-based Permissions' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] flex-shrink-0 p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #cf3232 0%, #1a0008 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5" style={{ color: '#cf3232' }} />
            </div>
            <div>
              <span className="text-white font-black text-xl">Bazaar</span>
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                Admin
              </span>
            </div>
          </div>

          <h2 className="text-5xl font-black text-white leading-[1.1] mb-4">
            Control<br />everything.
          </h2>
          <p className="text-white/50 text-base mb-14 leading-relaxed">
            The central hub for managing your entire marketplace — vendors, buyers, orders, and more.
          </p>

          <div className="space-y-4">
            {STATS.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}>
                  {s.icon}
                </div>
                <span className="text-white/70 text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">© 2026 Bazaar. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12" style={{ background: '#fafafa' }}>
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#cf3232' }}>
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900">Bazaar Admin</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900">Welcome back</h1>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to your admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={{ background: '#fee2e2', color: '#991b1b' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="admin@example.com"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#111827' }}
                onFocus={e => (e.target.style.borderColor = '#cf3232')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
                <Link href="/bz-admin-x7k/forgot" className="text-xs font-semibold hover:underline" style={{ color: '#cf3232' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all pr-12"
                  style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#111827' }}
                  onFocus={e => (e.target.style.borderColor = '#cf3232')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
