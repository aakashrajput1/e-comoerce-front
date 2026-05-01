import Link from 'next/link';
import { Map } from 'lucide-react';

export const dynamic = 'force-static';

const SITEMAP = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'New Arrivals', href: '/new' },
      { label: 'Best Sellers', href: '/best-sellers' },
      { label: 'Deals & Offers', href: '/deals' },
      { label: 'All Categories', href: '/categories' },
    ],
  },
  {
    title: 'Buyer',
    links: [
      { label: 'Sign In', href: '/buyer/login' },
      { label: 'Create Account', href: '/buyer/register' },
      { label: 'My Account', href: '/buyer/account' },
      { label: 'Track Order', href: '/track' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Cart', href: '/cart' },
    ],
  },
  {
    title: 'Sellers',
    links: [
      { label: 'Start Selling', href: '/vendor/register' },
      { label: 'Seller Login', href: '/vendor/login' },
      { label: 'Seller Dashboard', href: '/vendor/dashboard' },
      { label: 'Seller Policies', href: '/seller-policies' },
      { label: 'Fees & Payments', href: '/fees' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Returns Policy', href: '/returns' },
      { label: 'Track Your Order', href: '/track' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Seller Policies', href: '/seller-policies' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <Map className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Sitemap</h1>
          <p className="text-white/70 text-sm">All pages on Bazaar in one place.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {SITEMAP.map(({ title, links }) => (
            <div key={title}>
              <p className="font-black text-gray-900 text-sm mb-3">{title}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
