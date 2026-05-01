import Link from 'next/link';
import { Megaphone, TrendingUp, Target, BarChart2, CheckCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-static';

const FORMATS = [
  { icon: '🖼️', title: 'Sponsored Products', desc: 'Boost your product listings to the top of search results and category pages.', cta: 'From $0.10 CPC' },
  { icon: '📢', title: 'Banner Ads', desc: 'High-visibility banner placements on homepage, category pages, and product pages.', cta: 'From $500 CPM' },
  { icon: '🎯', title: 'Targeted Campaigns', desc: 'Reach buyers based on browsing history, purchase intent, and demographics.', cta: 'Custom pricing' },
  { icon: '📧', title: 'Email Marketing', desc: 'Feature your products in our weekly newsletter sent to 5M+ subscribers.', cta: 'From $1,000/send' },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Megaphone className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">Advertise on Bazaar</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">Reach millions of high-intent shoppers. Grow your brand and drive sales with Bazaar Ads.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, value: '10M+',  label: 'Monthly Visitors',  color: '#cf3232' },
            { icon: Target,     value: '50K+',  label: 'Active Sellers',    color: '#2563eb' },
            { icon: BarChart2,  value: '2M+',   label: 'Daily Searches',    color: '#059669' },
            { icon: CheckCircle,value: '98%',   label: 'Ad Viewability',    color: '#d97706' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Ad formats */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Ad Formats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FORMATS.map(({ icon, title, desc, cta }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <span className="text-3xl">{icon}</span>
                <p className="font-black text-gray-900 mt-3 mb-1">{title}</p>
                <p className="text-sm text-gray-500 mb-3">{desc}</p>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#FAEFEF', color: '#cf3232' }}>{cta}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <p className="font-black text-gray-900 text-xl mb-2">Ready to grow your business?</p>
          <p className="text-sm text-gray-500 mb-6">Our advertising team will help you create a campaign that drives real results.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-base" style={{ background: '#cf3232' }}>
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
