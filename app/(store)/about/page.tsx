import Link from 'next/link';
import { Store, Users, Globe, TrendingUp, Heart, Shield } from 'lucide-react';

export const dynamic = 'force-static';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Store className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">About Bazaar</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">India's most trusted multi-vendor marketplace, connecting millions of buyers with thousands of verified sellers.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Mission */}
        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-base">
            Bazaar was founded with a simple mission — to make quality products accessible to everyone, everywhere. We believe commerce should be easy, transparent, and fair for both buyers and sellers. Since our founding, we've grown to serve millions of customers across the country, offering everything from electronics and fashion to groceries and home essentials.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users,     value: '10M+',  label: 'Happy Customers',  color: '#2563eb' },
            { icon: Store,     value: '50K+',  label: 'Verified Sellers', color: '#cf3232' },
            { icon: Globe,     value: '500+',  label: 'Cities Served',    color: '#059669' },
            { icon: TrendingUp,value: '2M+',   label: 'Products Listed',  color: '#d97706' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}15` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Heart,   title: 'Customer First',  desc: 'Every decision we make starts with what\'s best for our customers.', color: '#cf3232' },
              { icon: Shield,  title: 'Trust & Safety',  desc: 'We verify every seller and protect every transaction on our platform.', color: '#2563eb' },
              { icon: Globe,   title: 'Inclusive Commerce', desc: 'We empower small businesses and entrepreneurs to reach customers nationwide.', color: '#059669' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-4 rounded-xl" style={{ background: '#FAEFEF' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}15` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <p className="font-black text-gray-900 mb-2">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/careers" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white text-base" style={{ background: '#cf3232' }}>
            Join Our Team →
          </Link>
        </div>
      </div>
    </div>
  );
}
