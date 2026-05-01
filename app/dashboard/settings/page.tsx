'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { Loader2, CheckCircle, Settings, DollarSign, CreditCard, AlertCircle, ExternalLink } from 'lucide-react';

const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    platformStripeAccountId: '',
    platformFeePercent: '10',
  });

  useEffect(() => {
    api.get('/admin/settings').then(r => {
      setSettings(r.data.settings);
      setForm({
        platformStripeAccountId: r.data.settings?.platformStripeAccountId || '',
        platformFeePercent: r.data.settings?.platformFeePercent?.toString() || '10',
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.patch('/admin/settings', form);
      setMsg('✓ Settings saved successfully');
    } catch (err: any) {
      setMsg(`✗ ${err.response?.data?.message || 'Failed to save'}`);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure platform fees and Stripe payout account</p>
      </div>

      {/* Platform Fee & Stripe */}
      <div style={CARD}>
        <div className="flex items-center gap-2 mb-5">
          <DollarSign className="w-5 h-5" style={{ color: '#cf3232' }} />
          <h2 className="font-black text-gray-900">Revenue & Payouts</h2>
        </div>

        <div className="p-4 rounded-xl mb-5 flex items-start gap-3"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-bold mb-1">How platform fees work</p>
            <p>When a buyer pays, the full amount is held by Stripe. After the return window expires, the vendor's share is transferred to their Stripe account, and the platform fee is transferred to your Stripe account below.</p>
          </div>
        </div>

        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: msg.startsWith('✓') ? '#d1fae5' : '#fee2e2', color: msg.startsWith('✓') ? '#065f46' : '#991b1b' }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Platform fee % */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              Platform Fee (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number" min="0" max="50" step="0.5"
                value={form.platformFeePercent}
                onChange={e => setForm(f => ({ ...f, platformFeePercent: e.target.value }))}
                className="w-32 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = '#cf3232')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
              <span className="text-sm text-gray-500">% of each order total</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Current env: <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_PLATFORM_FEE || '10'}%</code> — changing here updates the DB setting used at runtime.
            </p>
          </div>

          {/* Platform Stripe Account */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              Platform Stripe Account ID
            </label>
            <input
              type="text"
              placeholder="acct_xxxxxxxxxxxxxxxxx"
              value={form.platformStripeAccountId}
              onChange={e => setForm(f => ({ ...f, platformStripeAccountId: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
              style={{ border: '1.5px solid #e5e7eb', color: '#111827', background: '#fff' }}
              onFocus={e => (e.target.style.borderColor = '#cf3232')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
            <p className="text-xs text-gray-400 mt-1">
              Your Stripe Connected Account ID. Platform fees will be transferred here after each order's return window expires.{' '}
              <a href="https://dashboard.stripe.com/settings/account" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-0.5 underline" style={{ color: '#cf3232' }}>
                Find in Stripe Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Status indicator */}
          {form.platformStripeAccountId ? (
            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
              <CheckCircle className="w-4 h-4" />
              Platform fee account configured — fees will be auto-transferred
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-yellow-700 font-semibold">
              <AlertCircle className="w-4 h-4" />
              No platform account set — fees stay in your main Stripe balance
            </div>
          )}

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Info card */}
      <div style={CARD}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <p className="font-semibold text-gray-800 text-sm">Fee Flow Summary</p>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          {[
            { step: '1', label: 'Buyer pays', desc: 'Full amount held by Stripe (e.g. $100)' },
            { step: '2', label: 'Order delivered', desc: 'Return window starts (e.g. 7 days)' },
            { step: '3', label: 'Return window expires', desc: `Vendor gets their share (e.g. $90), platform gets fee (e.g. $10 at ${form.platformFeePercent}%)` },
            { step: '4', label: 'Vendor withdraws', desc: 'Vendor requests payout from their wallet to bank' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                style={{ background: '#cf3232' }}>
                {step}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
