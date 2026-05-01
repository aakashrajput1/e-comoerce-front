import Link from 'next/link';
import { Newspaper, Mail, Download } from 'lucide-react';

export const dynamic = 'force-static';

const NEWS = [
  { date: 'Apr 8, 2026',  title: 'Bazaar Crosses 10 Million Customers Milestone', outlet: 'TechCrunch', tag: 'Growth' },
  { date: 'Mar 25, 2026', title: 'Bazaar Launches Same-Day Delivery in 50 Cities', outlet: 'Forbes', tag: 'Product' },
  { date: 'Mar 10, 2026', title: 'Bazaar Raises $200M Series C to Expand Marketplace', outlet: 'Bloomberg', tag: 'Funding' },
  { date: 'Feb 20, 2026', title: 'Bazaar Named Top 10 E-Commerce Platform of 2026', outlet: 'Business Insider', tag: 'Award' },
  { date: 'Feb 5, 2026',  title: 'Bazaar Partners with 5,000 New Small Businesses', outlet: 'Reuters', tag: 'Partnership' },
  { date: 'Jan 15, 2026', title: 'Bazaar Introduces AI-Powered Product Recommendations', outlet: 'Wired', tag: 'Technology' },
];

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Growth:      { bg: '#d1fae5', color: '#065f46' },
  Product:     { bg: '#dbeafe', color: '#1e40af' },
  Funding:     { bg: '#fce7f3', color: '#cf3232' },
  Award:       { bg: '#fef9c3', color: '#854d0e' },
  Partnership: { bg: '#ede9fe', color: '#5b21b6' },
  Technology:  { bg: '#f3f4f6', color: '#374151' },
};

export default function PressPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Newspaper className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">Press & Media</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">Latest news, press releases, and media resources from Bazaar.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Press contact */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#FAEFEF' }}>
            <Mail className="w-6 h-6" style={{ color: '#cf3232' }} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-lg">Press Inquiries</p>
            <p className="text-sm text-gray-500 mt-1">For media inquiries, interview requests, or press kit downloads, contact our communications team.</p>
            <a href="mailto:press@bazaar.com" className="text-sm font-bold mt-2 inline-block hover:underline" style={{ color: '#cf3232' }}>press@bazaar.com</a>
          </div>
          <a href="#" className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0" style={{ background: '#f3f4f6', color: '#374151' }}>
            <Download className="w-4 h-4" /> Press Kit
          </a>
        </div>

        {/* News */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-5">In the News</h2>
          <div className="space-y-3">
            {NEWS.map(item => {
              const tc = TAG_COLORS[item.tag] || TAG_COLORS.Technology;
              return (
                <div key={item.title} className="bg-white rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>{item.tag}</span>
                      <span className="text-xs text-gray-400">{item.outlet}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <p className="font-bold text-gray-900">{item.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
