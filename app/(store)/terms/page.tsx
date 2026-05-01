import Link from 'next/link';
import { FileText } from 'lucide-react';

export const dynamic = 'force-static';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Bazaar ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. These terms apply to all users including buyers, sellers, and visitors.`,
  },
  {
    title: '2. Account Registration',
    content: `To access certain features, you must create an account. You agree to:

• Provide accurate, current, and complete information
• Maintain the security of your password
• Notify us immediately of any unauthorized account access
• Be responsible for all activity under your account
• Not create accounts for others without their permission

You must be at least 18 years old to create an account.`,
  },
  {
    title: '3. Buyer Terms',
    content: `As a buyer on Bazaar, you agree to:

• Provide accurate shipping and payment information
• Pay for all orders you place
• Not engage in fraudulent chargebacks or disputes
• Use the returns process in good faith
• Not harass or abuse sellers or other users
• Comply with all applicable laws regarding your purchases`,
  },
  {
    title: '4. Seller Terms',
    content: `As a seller on Bazaar, you agree to:

• Provide accurate product descriptions, images, and pricing
• Submit products for admin review before listing
• Fulfill orders promptly and as described
• Honor your stated return and refund policies
• Not sell prohibited, counterfeit, or illegal items
• Maintain adequate inventory levels
• Respond to buyer inquiries within 2 business days
• Pay all applicable platform fees`,
  },
  {
    title: '5. Prohibited Activities',
    content: `The following activities are strictly prohibited on Bazaar:

• Selling counterfeit, stolen, or illegal goods
• Manipulating reviews, ratings, or search rankings
• Conducting transactions outside the platform to avoid fees
• Spamming, phishing, or distributing malware
• Impersonating other users or Bazaar staff
• Scraping or automated data collection without permission
• Any activity that violates applicable laws or regulations`,
  },
  {
    title: '6. Fees and Payments',
    content: `Bazaar charges a platform fee of 10% on each completed transaction. Payment processing is handled by Stripe. By using the Platform, you agree to Stripe's Terms of Service. Bazaar reserves the right to modify fee structures with 30 days notice.`,
  },
  {
    title: '7. Intellectual Property',
    content: `The Bazaar platform, including its design, code, and content, is owned by Bazaar Inc. and protected by intellectual property laws. You may not copy, modify, or distribute our platform without written permission. You retain ownership of content you upload but grant Bazaar a license to display it on the platform.`,
  },
  {
    title: '8. Dispute Resolution',
    content: `In the event of a dispute between buyers and sellers, Bazaar may mediate but is not obligated to resolve disputes. We encourage parties to resolve disputes directly. Bazaar's decision in escalated disputes is final. For disputes with Bazaar itself, you agree to binding arbitration in New York, NY.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `Bazaar is a marketplace platform connecting buyers and sellers. We are not responsible for the quality, safety, or legality of listed items. To the maximum extent permitted by law, Bazaar's liability is limited to the amount you paid in the transaction giving rise to the claim.`,
  },
  {
    title: '10. Termination',
    content: `Bazaar reserves the right to suspend or terminate accounts that violate these Terms of Service, engage in fraudulent activity, or harm the platform or its users. You may close your account at any time by contacting support.`,
  },
  {
    title: '11. Changes to Terms',
    content: `We may update these Terms of Service at any time. We will notify users of material changes via email or platform notification. Continued use of Bazaar after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms of Service are governed by the laws of the State of New York, United States, without regard to conflict of law principles.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <FileText className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-white/70 text-sm">Last updated: January 1, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms of Service govern your use of the Bazaar marketplace platform. By using Bazaar, you agree to these terms. Please read them carefully before using our services.
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
