import Link from 'next/link';
import { DollarSign, CheckCircle, ArrowRight, Zap, CreditCard, Wallet } from 'lucide-react';

export const dynamic = 'force-static';

const TIERS = [
  { label: 'Listing Fee', value: '$0', desc: 'Free to list any product', highlight: false },
  { label: 'Monthly Fee', value: '$0', desc: 'No subscription required', highlight: false },
  { label: 'Platform Fee', value: '10%', desc: 'Per completed order only', highlight: true },
  { label: 'Stripe Fee', value: '2.9% + $0.30', desc: 'Payment processing per transaction', highlight: false },
];

const EXAMPLES = [
  { price: 20, platform: 2.00, stripe: 0.88, payout: 17.12 },
  { price: 50, platform: 5.00, stripe: 1.75, payout: 43.25 },
  { price: 100, platform: 10.00, stripe: 3.20, payout: 86.80 },
  { price: 250, platform: 25.00, stripe: 7.55, payout: 217.45 },
];

export default function FeesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <DollarSign className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Fees & Payments</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">Simple, transparent pricing. No surprises.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Fee cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIERS.map(({ label, value, desc, highlight }) => (
            <div key={label} className="rounded-2xl p-5 text-center shadow-sm"
              style={{
                border: highlight ? '2px solid #cf3232' : '1px solid #e5e7eb',
                background: highlight ? '#fff1f2' : '#fff',
              }}>
              <p className="text-2xl font-black" style={{ color: highlight ? '#cf3232' : '#111827' }}>{value}</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{label}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="font-black text-gray-900 text-lg mb-5">How Payouts Work</h2>
          <div className="space-y-4">
            {[
              { icon: CreditCard, title: 'Buyer pays', desc: 'Buyer completes checkout via Stripe. Funds are held securely.' },
              { icon: Zap, title: 'Order fulfilled', desc: 'You ship the order and mark it delivered. The return window begins.' },
              { icon: Wallet, title: 'Funds released', desc: 'After the return window expires, funds move to your available balance.' },
              { icon: DollarSign, title: 'Withdraw anytime', desc: 'Withdraw to your connected bank account — minimum $1, no limits.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FAEFEF' }}>
                  <Icon className="w-4 h-4" style={{ color: '#cf3232' }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout examples */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="font-black text-gray-900 text-lg mb-5">Payout Examples</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Sale Price', 'Platform Fee (10%)', 'Stripe Fee', 'You Receive'].map(h => (
                    <th key={h} className="pb-3 text-left font-bold text-gray-500 text-xs uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map(({ price, platform, stripe, payout }) => (
                  <tr key={price} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="py-3 pr-4 font-bold text-gray-800">${price.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-red-500 font-semibold">-${platform.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-orange-500 font-semibold">-${stripe.toFixed(2)}</td>
                    <td className="py-3 font-black" style={{ color: '#059669' }}>${payout.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Stripe fees are approximate. Actual fees may vary by card type and country.</p>
        </div>

        {/* Included */}
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="font-black text-gray-900 text-lg mb-5">What's Included — Free</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Unlimited product listings', 'Product image hosting', 'Order management dashboard',
              'Analytics & sales reports', 'Customer messaging', 'Review management',
              'Stripe payment processing setup', 'Mobile-optimized storefront',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/vendor/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-base"
            style={{ background: '#cf3232' }}>
            Start Selling for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
