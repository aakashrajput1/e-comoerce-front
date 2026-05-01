'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Store, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import PhoneInput from '@/components/PhoneInput';
import CountrySelect from '@/components/CountrySelect';

const STEPS = ['Account', 'Business', 'Verify'];
const FEATURES = [
  'Manage unlimited products',
  'Real-time order tracking',
  'Secure Stripe payouts',
  'Analytics & reports',
  'Chat with buyers',
  'Featured store listings',
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', ownerName: '', businessName: '',
    phone: '', description: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    businessType: 'individual',
    businessRegistrationNumber: '',
    taxId: '',
    website: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const setAddr = (key: string, val: string) => setForm(f => ({ ...f, address: { ...f.address, [key]: val } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) { setStep(1); return; }
    if (step === 1) { setStep(2); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/vendor/auth/register', form);
      localStorage.setItem('vendor_token', data.token);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#cf3232');
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#e5e7eb');
  const labelCls = "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide";

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
              <Store className="w-5 h-5" style={{ color: '#cf3232' }} />
            </div>
            <span className="text-white font-black text-2xl">Bazaar</span>
          </Link>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">
            Start selling<br />on Bazaar.
          </h2>
          <p className="text-white/60 text-base mb-12">Join thousands of vendors growing their business.</p>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
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
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {step > 0 ? 'Back' : 'Back'}
          </button>

          {step === 3 ? (
            /* ── Success ── */
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#d1fae5' }}>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Account Created!</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
                Your vendor account is pending admin approval. You'll receive an email once approved.
              </p>
              <button onClick={() => router.push('/vendor/dashboard')}
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
                Go to Dashboard →
              </button>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900">Create vendor account</h1>
                <p className="text-gray-400 text-sm mt-1.5">Step {step + 1} of 3 — {step === 0 ? 'Account details' : step === 1 ? 'Business details' : 'Verification info'}</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-7">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{ background: i <= step ? '#cf3232' : '#e5e7eb', color: i <= step ? '#fff' : '#9ca3af' }}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: i <= step ? '#cf3232' : '#9ca3af' }}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-10 h-0.5 transition-all" style={{ background: i < step ? '#cf3232' : '#e5e7eb' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                  style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 0 ? (
                  <>
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input type="text" required placeholder="Your full name"
                        value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input type="email" required placeholder="vendor@example.com"
                        value={form.email} onChange={e => set('email', e.target.value)}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label className={labelCls}>Password</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} required placeholder="Min 8 chars, 1 uppercase, 1 number"
                          value={form.password} onChange={e => set('password', e.target.value)}
                          className={`${inputCls} pr-11`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : step === 1 ? (
                  <>
                    <div>
                      <label className={labelCls}>Business Name</label>
                      <input type="text" required placeholder="Your store name"
                        value={form.businessName} onChange={e => set('businessName', e.target.value)}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <PhoneInput value={form.phone} onChange={val => set('phone', val)} />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        placeholder="Tell buyers about your store..." rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                        style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
                        onFocus={e => (e.target.style.borderColor = '#cf3232')}
                        onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>City</label>
                        <input type="text" placeholder="City"
                          value={form.address.city} onChange={e => setAddr('city', e.target.value)}
                          className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                      <div>
                        <label className={labelCls}>Country</label>
                        <CountrySelect value={form.address.country} onChange={val => setAddr('country', val)}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }} />
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── Step 2: Verification ── */
                  <>
                    <div className="p-3 rounded-xl text-xs font-medium flex items-start gap-2"
                      style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                      <span className="text-base">🔒</span>
                      <span>To protect buyers and maintain trust, we verify all vendors. This info is kept private and only used for verification.</span>
                    </div>
                    <div>
                      <label className={labelCls}>Business Type</label>
                      <select value={form.businessType} onChange={e => set('businessType', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}>
                        <option value="individual">Individual / Freelancer</option>
                        <option value="sole_proprietor">Sole Proprietor</option>
                        <option value="partnership">Partnership</option>
                        <option value="llc">LLC / Private Limited</option>
                        <option value="corporation">Corporation / Public Limited</option>
                        <option value="ngo">NGO / Non-Profit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Business Registration Number <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                      <input type="text" placeholder="e.g. Company reg. no., EIN, CRN..."
                        value={form.businessRegistrationNumber} onChange={e => set('businessRegistrationNumber', e.target.value)}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label className={labelCls}>Tax ID / VAT / GST Number <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                      <input type="text" placeholder="e.g. VAT number, GST ID, TIN..."
                        value={form.taxId} onChange={e => set('taxId', e.target.value)}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                      <label className={labelCls}>Website <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                      <input type="url" placeholder="https://yourbusiness.com"
                        value={form.website} onChange={e => set('website', e.target.value)}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div className="p-3 rounded-xl text-xs" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
                      <p className="font-bold mb-1">📄 Document Verification</p>
                      <p>After registration, upload a government-issued ID from your vendor dashboard. Verified vendors get a ✅ badge on their store.</p>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60 mt-2"
                  style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : step === 0 ? 'Continue →' : step === 1 ? 'Continue →' : 'Create Account →'}
                </button>
              </form>

              <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f0f0f0' }}>
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/vendor/login" className="font-black hover:underline" style={{ color: '#cf3232' }}>Sign in</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
