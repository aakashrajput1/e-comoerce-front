import Link from 'next/link';
import { Shield, CheckCircle, AlertCircle, FileText, DollarSign, Package } from 'lucide-react';

export const dynamic = 'force-static';

const SECTIONS = [
  {
    icon: Shield,
    title: 'Seller Eligibility',
    color: '#2563eb',
    items: [
      'Must be a registered business or individual with valid ID',
      'Must agree to Bazaar\'s Terms of Service and Seller Agreement',
      'Account subject to admin approval before going live',
      'Must maintain a minimum seller rating of 3.5 stars',
      'Prohibited from selling counterfeit, illegal, or restricted items',
    ],
  },
  {
    icon: Package,
    title: 'Product Listings',
    color: '#059669',
    items: [
      'All products must be submitted for admin review before going live',
      'Product descriptions must be accurate and not misleading',
      'Images must be original or properly licensed — no watermarks',
      'Pricing must be in USD and inclusive of applicable taxes',
      'Inventory must be kept up to date to avoid overselling',
      'Prohibited categories: weapons, drugs, adult content, live animals',
    ],
  },
  {
    icon: DollarSign,
    title: 'Fees & Payouts',
    color: '#cf3232',
    items: [
      'Platform fee: 10% of each completed order',
      'No monthly subscription or listing fees',
      'Payouts processed via Stripe to your connected bank account',
      'Funds held for the return window period before release',
      'Minimum withdrawal amount: $1.00',
      'Stripe processing fees apply (typically 2.9% + $0.30)',
    ],
  },
  {
    icon: AlertCircle,
    title: 'Returns & Disputes',
    color: '#d97706',
    items: [
      'Sellers must honor their stated return policy',
      'Return window: 0–30 days (set per product)',
      'Sellers must respond to return requests within 2 business days',
      'Disputes unresolved within 5 days may be escalated to Bazaar admin',
      'Fraudulent dispute claims may result in account suspension',
      'Refunds for approved returns are deducted from seller balance',
    ],
  },
  {
    icon: FileText,
    title: 'Account Conduct',
    color: '#7c3aed',
    items: [
      'Sellers must not manipulate reviews or ratings',
      'Off-platform transactions are strictly prohibited',
      'Spam, misleading promotions, and fake inventory are banned',
      'Repeated policy violations result in permanent suspension',
      'Bazaar reserves the right to remove listings at any time',
      'All communications with buyers must remain professional',
    ],
  },
];

export default function SellerPoliciesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <Shield className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Seller Policies</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">Everything you need to know about selling on Bazaar. Last updated January 2026.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {SECTIONS.map(({ icon: Icon, title, color, items }) => (
          <div key={title} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h2 className="font-black text-gray-900 text-lg">{title}</h2>
            </div>
            <ul className="space-y-2.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <p className="font-black text-gray-900 text-lg mb-2">Ready to start selling?</p>
          <p className="text-sm text-gray-500 mb-5">Create your vendor account and reach thousands of buyers.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/vendor/register" className="px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
              Start Selling
            </Link>
            <Link href="/fees" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#f3f4f6', color: '#374151' }}>
              View Fees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
