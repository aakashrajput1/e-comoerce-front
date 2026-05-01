import Link from 'next/link';
import { HelpCircle, ShoppingBag, Truck, RotateCcw, CreditCard, Store, MessageCircle, ChevronRight } from 'lucide-react';

export const dynamic = 'force-static';

const TOPICS = [
  {
    icon: ShoppingBag, title: 'Orders & Buying', color: '#2563eb',
    links: [
      { label: 'How to place an order', href: '/products' },
      { label: 'Track your order', href: '/track' },
      { label: 'Cancel an order', href: '/buyer/account' },
      { label: 'Order not received', href: '/contact' },
    ],
  },
  {
    icon: RotateCcw, title: 'Returns & Refunds', color: '#059669',
    links: [
      { label: 'Return policy', href: '/returns' },
      { label: 'How to return an item', href: '/returns' },
      { label: 'Refund timeline', href: '/returns' },
      { label: 'Damaged item received', href: '/contact' },
    ],
  },
  {
    icon: CreditCard, title: 'Payments', color: '#cf3232',
    links: [
      { label: 'Accepted payment methods', href: '/fees' },
      { label: 'Payment failed', href: '/contact' },
      { label: 'Promo codes & discounts', href: '/deals' },
      { label: 'Invoice & receipts', href: '/buyer/account' },
    ],
  },
  {
    icon: Store, title: 'Selling on Bazaar', color: '#7c3aed',
    links: [
      { label: 'How to become a seller', href: '/vendor/register' },
      { label: 'Seller policies', href: '/seller-policies' },
      { label: 'Fees & payouts', href: '/fees' },
      { label: 'Seller dashboard help', href: '/vendor/dashboard' },
    ],
  },
];

const FAQS = [
  { q: 'How do I create an account?', a: 'Click "Sign In" at the top of any page, then select "Create Account". Fill in your details and you\'re ready to shop.' },
  { q: 'Is my payment information secure?', a: 'Yes. All payments are processed by Stripe, a PCI-DSS Level 1 certified payment processor. We never store your card details.' },
  { q: 'How do I contact a seller?', a: 'Visit the product page and click "Ask a Question" or go to the seller\'s store page and use the message button.' },
  { q: 'Can I shop without creating an account?', a: 'You can browse products without an account, but you\'ll need to create one to place orders and track purchases.' },
  { q: 'How long does delivery take?', a: 'Delivery times vary by seller and location — typically 3-7 business days. Check the product page for estimated delivery.' },
  { q: 'What if I receive the wrong item?', a: 'Contact us immediately with your order ID and photos. We\'ll resolve it quickly with a replacement or full refund.' },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <HelpCircle className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Help Center</h1>
          <p className="text-white/70 text-sm">Find answers to common questions or get in touch with our team.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOPICS.map(({ icon: Icon, title, color, links }) => (
            <div key={title} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="font-black text-gray-900">{title}</p>
              </div>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 group">
                      {label}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <p className="font-bold text-gray-900 text-sm">{q}</p>
                <p className="text-sm text-gray-500 mt-2">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <MessageCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#cf3232' }} />
          <p className="font-black text-gray-900 text-lg mb-2">Still need help?</p>
          <p className="text-sm text-gray-500 mb-5">Our support team is available Monday–Friday, 9am–6pm EST.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
            <MessageCircle className="w-4 h-4" /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
