import Link from 'next/link';
import { RotateCcw, CheckCircle, Clock, Package, AlertCircle, ChevronRight } from 'lucide-react';

export const dynamic = 'force-static';

const STEPS = [
  { step: '01', title: 'Initiate Return', desc: 'Go to My Orders, find the delivered order and click "Request Return" within the return window.' },
  { step: '02', title: 'Seller Reviews', desc: 'The seller reviews your return request within 2 business days and approves or contacts you.' },
  { step: '03', title: 'Ship the Item', desc: 'Pack the item securely and ship it back using the provided return label or instructions.' },
  { step: '04', title: 'Refund Processed', desc: 'Once the seller receives and inspects the item, your refund is processed within 5-7 business days.' },
];

const FAQS = [
  { q: 'How long do I have to return an item?', a: 'Return windows vary by product — typically 7, 14, or 30 days from delivery. Check the product page for the specific return policy.' },
  { q: 'What items cannot be returned?', a: 'Perishable goods, digital downloads, personalized/custom items, and items marked "Final Sale" are not eligible for returns.' },
  { q: 'Who pays for return shipping?', a: 'If the item is defective or not as described, the seller covers return shipping. For change-of-mind returns, the buyer typically covers shipping costs.' },
  { q: 'When will I get my refund?', a: 'Refunds are processed within 5-7 business days after the seller receives and inspects the returned item. It may take an additional 3-5 days to appear on your statement.' },
  { q: 'What if my item arrived damaged?', a: 'Contact us immediately with photos of the damage. We will expedite your return and refund process.' },
  { q: 'Can I exchange instead of return?', a: 'Exchanges depend on the individual seller\'s policy. Contact the seller directly through the order page to discuss exchange options.' },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <RotateCcw className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Returns & Refunds</h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">Easy, hassle-free returns. We've got you covered.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Policy highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, title: 'Up to 30-Day Returns', desc: 'Return window depends on the product and seller policy', color: '#2563eb' },
            { icon: CheckCircle, title: 'Easy Process', desc: 'Initiate returns directly from your order page', color: '#059669' },
            { icon: Package, title: 'Fast Refunds', desc: 'Refunds processed within 5-7 business days', color: '#cf3232' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-5 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}15` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <p className="font-black text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-6">How Returns Work</h2>
          <div className="space-y-4">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                  style={{ background: '#cf3232' }}>
                  {step}
                </div>
                <div>
                  <p className="font-black text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-returnable notice */}
        <div className="flex items-start gap-3 p-5 rounded-2xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-800">Non-Returnable Items</p>
            <p className="text-sm text-yellow-700 mt-1">Perishable goods, digital products, personalized items, intimate apparel, and items marked "Final Sale" cannot be returned. Always check the product page before purchasing.</p>
          </div>
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

        {/* CTA */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <p className="font-black text-gray-900 text-lg mb-2">Ready to return an item?</p>
          <p className="text-sm text-gray-500 mb-5">Go to your orders and initiate the return process.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/buyer/account" className="px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
              My Orders
            </Link>
            <Link href="/contact" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: '#f3f4f6', color: '#374151' }}>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
