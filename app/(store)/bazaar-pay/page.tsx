import Link from 'next/link';
import { CreditCard, Shield, Zap, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-static';

export default function BazaarPayPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <CreditCard className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">Bazaar Pay</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">Fast, secure, and seamless payments for every transaction on Bazaar.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Shield,      title: 'Bank-Grade Security',  desc: 'PCI-DSS Level 1 certified. Your data is always protected.', color: '#2563eb' },
            { icon: Zap,         title: 'Instant Checkout',     desc: 'One-click payments with saved cards and wallets.', color: '#d97706' },
            { icon: RefreshCw,   title: 'Easy Refunds',         desc: 'Refunds processed within 5-7 business days automatically.', color: '#059669' },
            { icon: CreditCard,  title: '10+ Payment Methods',  desc: 'Cards, UPI, wallets, net banking, and more.', color: '#cf3232' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-5 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}15` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <p className="font-black text-gray-900 mb-1">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Accepted Payment Methods</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Visa', bg: '#1a1f71', color: '#fff' },
              { label: 'Mastercard', bg: '#eb001b', color: '#fff' },
              { label: 'American Express', bg: '#007bc1', color: '#fff' },
              { label: 'PayPal', bg: '#003087', color: '#fff' },
              { label: 'Stripe', bg: '#635bff', color: '#fff' },
              { label: 'Apple Pay', bg: '#000', color: '#fff' },
              { label: 'Google Pay', bg: '#4285f4', color: '#fff' },
              { label: 'UPI', bg: '#097939', color: '#fff' },
            ].map(({ label, bg, color }) => (
              <div key={label} className="flex items-center justify-center py-3 rounded-xl font-bold text-sm"
                style={{ background: bg, color }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="text-2xl font-black text-gray-900 mb-5">Buyer Protection</h2>
          <div className="space-y-3">
            {[
              'Full refund if item not received within estimated delivery date',
              'Refund if item is significantly different from description',
              'Secure escrow — payment released to seller only after delivery confirmed',
              '24/7 fraud monitoring on all transactions',
              'Zero liability on unauthorized transactions',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#059669' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-base" style={{ background: '#1e40af' }}>
            Shop with Confidence <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
