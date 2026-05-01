'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, CheckCircle } from 'lucide-react';

const FOOTER_PAGES = [
  '/products', '/new', '/best-sellers', '/deals', '/categories',
  '/buyer/login', '/buyer/register', '/track', '/returns', '/wishlist',
  '/vendor/register', '/vendor/login', '/seller-policies', '/fees',
  '/help', '/contact', '/privacy', '/terms', '/sitemap',
  '/about', '/careers', '/press', '/blog',
];

const COLS = [
  {
    title: 'ABOUT',
    links: [
      { label: 'Contact Us',           href: '/contact' },
      { label: 'About Us',             href: '/about' },
      { label: 'Careers',              href: '/careers' },
      { label: 'Bazaar Stories',       href: '/blog' },
      { label: 'Press',                href: '/press' },
      { label: 'Corporate Information',href: '/corporate' },
    ],
  },
  {
    title: 'GROUP COMPANIES',
    links: [
      { label: 'Bazaar Pay',     href: '/bazaar-pay' },
      { label: 'Bazaar Ads',     href: '/advertise' },
      { label: 'Bazaar Grocery', href: '/category/food-grocery' },
      { label: 'Bazaar Health',  href: '/category/health-wellness' },
    ],
  },
  {
    title: 'HELP',
    links: [
      { label: 'Payments',              href: '/help#payments' },
      { label: 'Shipping',              href: '/help#shipping' },
      { label: 'Cancellation & Returns',href: '/returns' },
      { label: 'FAQ',                   href: '/help' },
      { label: 'Report Infringement',   href: '/contact' },
    ],
  },
  {
    title: 'CONSUMER POLICY',
    links: [
      { label: 'Cancellation & Returns', href: '/returns' },
      { label: 'Terms Of Use',           href: '/terms' },
      { label: 'Security',               href: '/privacy#security' },
      { label: 'Privacy',                href: '/privacy' },
      { label: 'Sitemap',                href: '/sitemap' },
      { label: 'Grievance Redressal',    href: '/contact' },
      { label: 'Seller Policies',        href: '/seller-policies' },
      { label: 'Fees & Payments',        href: '/fees' },
    ],
  },
];

export default function StoreFooter() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    try {
      const { data } = await api.post('/buyer/newsletter/subscribe', { email });
      setSubMsg(data.message);
      setSubStatus('done');
      setEmail('');
    } catch (err: any) {
      setSubMsg(err.response?.data?.message || 'Something went wrong');
      setSubStatus('error');
    }
  };

  return (
    <footer style={{ background: '#172337', color: '#a9b8c3' }}>
      {/* Prefetch hints */}
      {FOOTER_PAGES.map(href => (
        <link key={href} rel="prefetch" href={href} as="document" />
      ))}

      {/* ── Newsletter strip ── */}
      <div style={{ background: '#1e2f42', borderBottom: '1px solid #2d3f50' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-white">Stay in the loop</p>
              <p className="text-xs" style={{ color: '#a9b8c3' }}>Get deals, new arrivals & updates straight to your inbox</p>
            </div>
          </div>
          {subStatus === 'done' ? (
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> {subMsg}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 flex-1 max-w-sm">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#0f1923', border: '1px solid #2d3f50', color: '#fff' }}
              />
              <button type="submit" disabled={subStatus === 'loading'}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 disabled:opacity-60"
                style={{ background: '#cf3232' }}>
                {subStatus === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
          {subStatus === 'error' && <p className="text-xs text-red-400 w-full">{subMsg}</p>}
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">

          {/* 4 link columns */}
          {COLS.map(col => (
            <div key={col.title} className="col-span-1">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link prefetch={true} href={link.href}
                      className="text-sm hover:text-white transition-colors"
                      style={{ color: '#a9b8c3' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Mail Us */}
          <div className="col-span-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Mail Us:</p>
            <address className="not-italic text-sm leading-relaxed" style={{ color: '#a9b8c3' }}>
              Bazaar Internet Private Limited,<br />
              Buildings Alyssa, Begonia &amp;<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road,<br />
              New York, NY 10001,<br />
              United States
            </address>

            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-6 mb-3">Social</p>
            <div className="flex items-center gap-3">
              {[
                { label: 'f', href: '#', title: 'Facebook' },
                { label: '𝕏', href: '#', title: 'Twitter / X' },
                { label: '▶', href: '#', title: 'YouTube' },
                { label: '◉', href: '#', title: 'Instagram' },
              ].map(({ label, href, title }) => (
                <a key={title} href={href} title={title}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
                  style={{ border: '1.5px solid #a9b8c3', color: '#a9b8c3' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Registered Office */}
          <div className="col-span-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Registered Office Address:</p>
            <address className="not-italic text-sm leading-relaxed" style={{ color: '#a9b8c3' }}>
              Bazaar Internet Private Limited,<br />
              Buildings Alyssa, Begonia &amp;<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road,<br />
              New York, NY 10001,<br />
              United States
            </address>
            <p className="text-xs mt-3" style={{ color: '#a9b8c3' }}>
              CIN: U51109NY2012PTC066107
            </p>
            <p className="text-xs mt-1" style={{ color: '#a9b8c3' }}>
              Telephone:{' '}
              <a href="tel:+18008292291" className="hover:text-white transition-colors" style={{ color: '#2196f3' }}>
                +1-800-829-2291
              </a>
              {' / '}
              <a href="tel:+18008292292" className="hover:text-white transition-colors" style={{ color: '#2196f3' }}>
                +1-800-829-2292
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ borderTop: '1px solid #2d3f50' }} />

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">

          {/* Quick actions */}
          <div className="flex items-center gap-0 flex-wrap">
            {[
              { emoji: '🛒', label: 'Become a Seller', href: '/vendor/register' },
              { emoji: '📢', label: 'Advertise',        href: '/advertise' },
              { emoji: '🎁', label: 'Gift Cards',       href: '/deals' },
              { emoji: '❓', label: 'Help Center',      href: '/help' },
            ].map(({ emoji, label, href }, i) => (
              <Link prefetch={true} key={label} href={href}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold hover:text-white transition-colors"
                style={{
                  color: '#a9b8c3',
                  borderRight: i < 3 ? '1px solid #2d3f50' : 'none',
                }}>
                <span>{emoji}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs" style={{ color: '#a9b8c3' }}>
            © 2007–2026 Bazaar.com
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'VISA',       bg: '#1a1f71', color: '#fff' },
              { label: 'MC',         bg: '#eb001b', color: '#fff' },
              { label: 'AMEX',       bg: '#007bc1', color: '#fff' },
              { label: 'PayPal',     bg: '#003087', color: '#fff' },
              { label: 'Stripe',     bg: '#635bff', color: '#fff' },
              { label: 'Discover',   bg: '#ff6600', color: '#fff' },
              { label: 'RuPay',      bg: '#1a6b3c', color: '#fff' },
              { label: 'UPI',        bg: '#097939', color: '#fff' },
            ].map(({ label, bg, color }) => (
              <div key={label}
                className="px-2 py-1 rounded text-xs font-black"
                style={{ background: bg, color, minWidth: 36, textAlign: 'center', fontSize: 9 }}>
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>

    </footer>
  );
}
