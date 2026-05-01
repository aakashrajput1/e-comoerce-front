import Link from 'next/link';
import { Shield } from 'lucide-react';

export const dynamic = 'force-static';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, place an order, or contact support. This includes:

• Account information: name, email address, password
• Profile information: phone number, shipping addresses
• Transaction data: order history, payment method details (processed securely by Stripe — we never store card numbers)
• Communications: messages you send to sellers or our support team
• Usage data: pages visited, search queries, clicks, and device information collected automatically`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

• Process and fulfill your orders
• Send order confirmations, shipping updates, and receipts
• Provide customer support and resolve disputes
• Personalize your shopping experience and show relevant products
• Send promotional emails (you can opt out at any time)
• Detect and prevent fraud and abuse
• Comply with legal obligations`,
  },
  {
    title: '3. Information Sharing',
    content: `We share your information only in the following circumstances:

• With sellers: We share your name, shipping address, and order details with the seller fulfilling your order
• With Stripe: Payment information is processed by Stripe under their privacy policy
• With service providers: We use trusted third parties for email delivery, cloud storage, and analytics
• For legal reasons: We may disclose information if required by law or to protect rights and safety
• We never sell your personal information to third parties`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your information:

• All data transmitted is encrypted using TLS/SSL
• Passwords are hashed using bcrypt — we cannot see your password
• Payment processing is handled entirely by Stripe (PCI-DSS Level 1 certified)
• Access to personal data is restricted to authorized personnel only
• We regularly review and update our security practices`,
  },
  {
    title: '5. Cookies',
    content: `We use cookies and similar technologies to:

• Keep you logged in across sessions
• Remember your cart and preferences
• Analyze site traffic and usage patterns
• Improve our services

You can control cookies through your browser settings. Disabling cookies may affect some site functionality.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to:

• Access the personal information we hold about you
• Correct inaccurate or incomplete information
• Request deletion of your account and associated data
• Opt out of marketing communications at any time
• Data portability — request a copy of your data in a machine-readable format

To exercise these rights, contact us at privacy@bazaar.com`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain information for longer periods as required by law or for legitimate business purposes such as fraud prevention.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Bazaar is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website. Your continued use of Bazaar after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, contact us at:

Email: privacy@bazaar.com
Address: Bazaar Inc., New York, NY 10001, United States`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <Shield className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-white/70 text-sm">Last updated: January 1, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <p className="text-sm text-gray-600 leading-relaxed">
            At Bazaar, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform. Please read this policy carefully.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map(({ title, content }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <h2 className="font-black text-gray-900 mb-3">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Questions? <Link href="/contact" className="font-semibold hover:underline" style={{ color: '#cf3232' }}>Contact us</Link>
        </div>
      </div>
    </div>
  );
}
