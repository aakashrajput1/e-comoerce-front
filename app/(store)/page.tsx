'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { addToCart } from '@/lib/cart';
import { Star, ShoppingCart, CheckCircle, ArrowRight, Sparkles, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// ── Intersection observer ─────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ── Dummy data ────────────────────────────────────────────────────────────────
const DUMMY_PRODUCTS = [
  { _id: 'd1', name: 'Wireless Earbuds Pro', price: 49.99, compareAtPrice: 79.99, averageRating: 4.5, reviewCount: 234, totalSold: 1200, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], vendor: { businessName: 'TechZone', slug: 'techzone-store', _id: 'v1' } },
  { _id: 'd2', name: 'Smart Watch Series X', price: 129.99, compareAtPrice: 199.99, averageRating: 4.7, reviewCount: 189, totalSold: 890, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], vendor: { businessName: 'TechZone', slug: 'techzone-store', _id: 'v1' } },
  { _id: 'd3', name: 'Summer Floral Dress', price: 39.99, compareAtPrice: 59.99, averageRating: 4.3, reviewCount: 156, totalSold: 670, images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'], vendor: { businessName: 'Fashion Hub', slug: 'fashion-hub', _id: 'v2' } },
  { _id: 'd4', name: 'Running Shoes Pro', price: 99.99, compareAtPrice: 149.99, averageRating: 4.8, reviewCount: 312, totalSold: 1500, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], vendor: { businessName: 'Sports World', slug: 'sports-world', _id: 'v3' } },
  { _id: 'd5', name: 'Vitamin C Face Serum', price: 24.99, compareAtPrice: 39.99, averageRating: 4.7, reviewCount: 278, totalSold: 1100, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'], vendor: { businessName: 'Beauty Corner', slug: 'beauty-corner', _id: 'v4' } },
  { _id: 'd6', name: 'Mechanical Keyboard RGB', price: 89.99, compareAtPrice: 129.99, averageRating: 4.8, reviewCount: 423, totalSold: 2100, images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'], vendor: { businessName: 'Gadget Galaxy', slug: 'gadget-galaxy', _id: 'v5' } },
  { _id: 'd7', name: 'Yoga Mat Premium', price: 29.99, compareAtPrice: 44.99, averageRating: 4.6, reviewCount: 201, totalSold: 980, images: ['https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=400'], vendor: { businessName: 'Sports World', slug: 'sports-world', _id: 'v3' } },
  { _id: 'd8', name: 'Leather Crossbody Bag', price: 79.99, compareAtPrice: 119.99, averageRating: 4.6, reviewCount: 89, totalSold: 340, images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'], vendor: { businessName: 'Fashion Hub', slug: 'fashion-hub', _id: 'v2' } },
  { _id: 'd9', name: 'Pour-Over Coffee Set', price: 32.99, compareAtPrice: 44.99, averageRating: 4.5, reviewCount: 145, totalSold: 430, images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'], vendor: { businessName: 'Home Essentials', slug: 'home-essentials', _id: 'v6' } },
  { _id: 'd10', name: '20000mAh Power Bank', price: 44.99, compareAtPrice: 64.99, averageRating: 4.4, reviewCount: 167, totalSold: 780, images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'], vendor: { businessName: 'TechZone', slug: 'techzone-store', _id: 'v1' } },
  { _id: 'd11', name: 'Soy Wax Candle Set', price: 28.99, compareAtPrice: 39.99, averageRating: 4.5, reviewCount: 134, totalSold: 560, images: ['https://images.unsplash.com/photo-1602607144535-11be3fe59c5e?w=400'], vendor: { businessName: 'Home Essentials', slug: 'home-essentials', _id: 'v6' } },
  { _id: 'd12', name: 'Beard Grooming Kit', price: 29.99, compareAtPrice: 44.99, averageRating: 4.5, reviewCount: 98, totalSold: 540, images: ['https://images.unsplash.com/photo-1621607512214-68297480165e?w=400'], vendor: { businessName: 'Beauty Corner', slug: 'beauty-corner', _id: 'v4' } },
];

const DUMMY_CATEGORIES = [
  { _id: 'c1', name: 'Electronics', slug: 'electronics', icon: '💻', color: '#6366f1' },
  { _id: 'c2', name: 'Fashion', slug: 'fashion', icon: '👗', color: '#ec4899' },
  { _id: 'c3', name: 'Home & Living', slug: 'home-living', icon: '🏠', color: '#f59e0b' },
  { _id: 'c4', name: 'Beauty', slug: 'beauty-personal-care', icon: '💄', color: '#ef4444' },
  { _id: 'c5', name: 'Sports', slug: 'sports-outdoors', icon: '⚽', color: '#10b981' },
  { _id: 'c6', name: 'Books', slug: 'books-stationery', icon: '📚', color: '#8b5cf6' },
  { _id: 'c7', name: 'Toys', slug: 'toys-games', icon: '🎮', color: '#f97316' },
  { _id: 'c8', name: 'Grocery', slug: 'food-grocery', icon: '🛒', color: '#14b8a6' },
  { _id: 'c9', name: 'Health', slug: 'health-wellness', icon: '🏥', color: '#06b6d4' },
  { _id: 'c10', name: 'Pets', slug: 'pets', icon: '🐾', color: '#84cc16' },
];

const DUMMY_VENDORS = [
  { _id: 'v1', businessName: 'TechZone', slug: 'techzone-store', totalProducts: 24, totalOrders: 1200, sampleImages: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200','https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200','https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200'] },
  { _id: 'v2', businessName: 'Fashion Hub', slug: 'fashion-hub', totalProducts: 18, totalOrders: 890, sampleImages: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200','https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=200','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'] },
  { _id: 'v3', businessName: 'Sports World', slug: 'sports-world', totalProducts: 31, totalOrders: 1500, sampleImages: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200','https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=200','https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200'] },
  { _id: 'v4', businessName: 'Beauty Corner', slug: 'beauty-corner', totalProducts: 22, totalOrders: 1100, sampleImages: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200','https://images.unsplash.com/photo-1621607512214-68297480165e?w=200','https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200','https://images.unsplash.com/photo-1602607144535-11be3fe59c5e?w=200'] },
  { _id: 'v5', businessName: 'Gadget Galaxy', slug: 'gadget-galaxy', totalProducts: 28, totalOrders: 2100, sampleImages: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200','https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'] },
  { _id: 'v6', businessName: 'Home Essentials', slug: 'home-essentials', totalProducts: 15, totalOrders: 430, sampleImages: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200','https://images.unsplash.com/photo-1602607144535-11be3fe59c5e?w=200','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200'] },
];

// ── Product Card — minimal dark card ─────────────────────────────────────────
function ProductCard({ product, size = 'md' }: { product: any; size?: 'sm' | 'md' | 'lg' }) {
  const [added, setAdded] = useState(false);
  const disc = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;
  const w = 'w-[400px]';
  const h = size === 'lg' ? 'h-72' : size === 'sm' ? 'h-52' : 'h-60';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0], quantity: 1, vendorId: product.vendor?._id || '' });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/product/${product._id}`}
      className={`flex-shrink-0 ${w} group rounded-2xl overflow-hidden`}
      style={{ background: '#fff', border: '1px solid #f0f0f0', transition: 'all 0.25s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
      <div className={`relative ${h} overflow-hidden bg-[#FAEFEF]`}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
        {disc && (
          <span className="absolute top-2.5 left-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#cf3232' }}>
            -{disc}%
          </span>
        )}
        <button onClick={handleAdd}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
          style={{ background: added ? '#059669' : '#111' }}>
          {added ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 truncate">{product.vendor?.businessName}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">{product.averageRating?.toFixed(1) || '4.5'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-semibold text-gray-900 text-sm">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

// ── Horizontal scroll row ─────────────────────────────────────────────────────
function ScrollRow({ title, icon, products, href, accent = '#cf3232' }: { title: string; icon?: React.ReactNode; products: any[]; href?: string; accent?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!products.length) return null;
  const scroll = (d: number) => ref.current?.scrollBy({ left: d, behavior: 'smooth' });
  return (
    <FadeIn>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-normal text-gray-800">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(-600)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#FAEFEF] transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={() => scroll(600)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#FAEFEF] transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
            {href && (
              <Link href={href} className="flex items-center gap-1 text-sm font-bold ml-1" style={{ color: accent }}>
                See all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </FadeIn>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StorePage() {
  const { admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(DUMMY_CATEGORIES);
  const [products, setProducts] = useState<any[]>(DUMMY_PRODUCTS);
  const [topVendors, setTopVendors] = useState<any[]>(DUMMY_VENDORS);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [heroBanner, setHeroBanner] = useState(0);

  useEffect(() => {
    if (!authLoading && admin) router.push('/dashboard');
  }, [admin, authLoading, router]);

  useEffect(() => {
    Promise.all([
      api.get('/categories?active=true'),
      api.get('/buyer/products?limit=60&sort=totalSold&order=desc'),
      api.get('/buyer/vendors/top?limit=8').catch(() => ({ data: { vendors: [] } })),
      api.get('/featured').catch(() => ({ data: { products: [] } })),
    ]).then(([catRes, prodRes, vendorRes, featRes]) => {
      if (catRes.data.categories?.length) setCategories(catRes.data.categories);
      if (prodRes.data.products?.length) setProducts(prodRes.data.products);
      if (vendorRes.data.vendors?.length) setTopVendors(vendorRes.data.vendors);
      if (featRes.data.products?.length) setFeaturedProducts(featRes.data.products);
    }).catch(() => {});
  }, []);

  // Auto-rotate hero
  const HEROES = [
    { tag: 'New Season', title: 'Discover\nYour Style', sub: 'Curated collections from top sellers worldwide', cta: 'Explore Now', href: '/products', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80', accent: '#a78bfa' },
    { tag: 'Tech Deals', title: 'Gear Up\nFor 2026', sub: 'Latest gadgets at unbeatable prices', cta: 'Shop Tech', href: '/category/electronics', img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&q=80', accent: '#38bdf8' },
    { tag: 'Beauty Edit', title: 'Glow Up\nThis Season', sub: 'Premium skincare & beauty essentials', cta: 'Shop Beauty', href: '/category/beauty-personal-care', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=80', accent: '#fb923c' },
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroBanner(b => (b + 1) % HEROES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const h = HEROES[heroBanner];
  const bestSellers = [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 12);
  const newArrivals = products.slice(0, 12);
  const topRated = [...products].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 12);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ background: '#0a0a0a', minHeight: 520 }}>
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            key={heroBanner}
            src={h.img}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.35, transition: 'opacity 0.8s ease' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center" style={{ minHeight: 520 }}>
          <div className="max-w-xl">
            <span
              key={heroBanner + 'tag'}
              className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
              style={{ background: `${h.accent}25`, color: h.accent, border: `1px solid ${h.accent}50`, animation: 'fadeUp 0.5s ease forwards' }}>
              {h.tag}
            </span>
            <h1
              key={heroBanner + 'h'}
              className="text-5xl sm:text-6xl font-normal text-white leading-[1.1] mb-4 whitespace-pre-line"
              style={{ animation: 'fadeUp 0.5s ease 0.05s both' }}>
              {h.title}
            </h1>
            <p
              key={heroBanner + 'p'}
              className="text-white/60 text-base mb-8"
              style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
              {h.sub}
            </p>
            <div className="flex items-center gap-3 flex-wrap" style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}>
              <Link href={h.href}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: h.accent }}>
                {h.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white/70 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                Browse All
              </Link>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-6 left-6 flex gap-2 z-10">
          {HEROES.map((_, i) => (
            <button key={i} onClick={() => setHeroBanner(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === heroBanner ? 28 : 8, height: 8, background: i === heroBanner ? h.accent : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-6 right-6 z-10 text-white/40 text-xs font-bold">
          {heroBanner + 1} / {HEROES.length}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">

        {/* ── Categories — pill style ── */}
        <FadeIn>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-normal text-gray-800">Shop by Category</h2>
              <Link href="/categories" className="text-sm font-bold flex items-center gap-1" style={{ color: '#cf3232' }}>All <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
              onWheel={e => { e.preventDefault(); (e.currentTarget as HTMLElement).scrollLeft += e.deltaY; }}
            >
              {categories.map((cat, i) => (
                <Link key={cat._id} href={`/category/${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-3 px-7 py-5 rounded-2xl font-semibold text-base transition-all hover:scale-105 hover:shadow-md"
                  style={{ background: `${cat.color || '#cf3232'}12`, color: cat.color || '#cf3232', border: `1.5px solid ${cat.color || '#cf3232'}22`, animationDelay: `${i * 40}ms`, minWidth: 'max-content' }}>
                  <span className="text-2xl">{cat.icon || '📦'}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── Featured Products ── */}
        {featuredProducts.length > 0 && (
          <FadeIn>
            <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7f0, #fff1f2)', border: '1.5px solid #fecdd3' }}>
              <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: '#cf3232' }} />
                  <h2 className="text-xl font-normal text-gray-800">Featured</h2>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#cf3232' }}>Sponsored</span>
                </div>
                <Link href="/featured" className="text-sm font-bold flex items-center gap-1" style={{ color: '#cf3232' }}>See all <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="px-6 pb-6 pt-4 flex gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── 3-col promo cards ── */}
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/category/electronics', bg: 'linear-gradient(135deg,#0f0c29,#302b63)', title: 'Tech Deals', sub: 'Up to 60% off', emoji: '💻', accent: '#a78bfa' },
              { href: '/category/fashion', bg: 'linear-gradient(135deg,#1a0533,#6b21a8)', title: 'Fashion Week', sub: 'New arrivals daily', emoji: '👗', accent: '#e879f9' },
              { href: '/category/beauty-personal-care', bg: 'linear-gradient(135deg,#1a0a00,#7c2d12)', title: 'Beauty Edit', sub: 'Glow up essentials', emoji: '💄', accent: '#fb923c' },
            ].map(({ href, bg, title, sub, emoji, accent }) => (
              <Link key={href} href={href}
                className="relative rounded-3xl overflow-hidden flex items-end p-6 group transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{ background: bg, minHeight: 160 }}>
                <div className="absolute top-4 right-4 text-5xl opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-300">{emoji}</div>
                <div>
                  <p className="text-white font-black text-lg leading-tight">{title}</p>
                  <p className="text-sm mt-0.5 mb-3" style={{ color: `${accent}cc` }}>{sub}</p>
                  <span className="text-xs font-black px-3 py-1.5 rounded-xl" style={{ background: accent, color: '#fff' }}>Shop Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>

        {/* ── Top Vendors ── */}
        <FadeIn>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-normal text-gray-800">Top Sellers</h2>
              <Link href="/top-sellers" className="text-sm font-bold flex items-center gap-1" style={{ color: '#cf3232' }}>All stores <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
              onWheel={e => { e.preventDefault(); (e.currentTarget as HTMLElement).scrollLeft += e.deltaY; }}
            >
              {topVendors.map((vendor, i) => (
                <Link key={vendor._id} href={`/store/${vendor.slug}`}
                  className="flex-shrink-0 group rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{ width: 400, border: '1px solid #f0f0f0', background: '#fff' }}>
                  {/* Store banner image */}
                  <div className="overflow-hidden bg-gray-100" style={{ height: 240 }}>
                    {vendor.sampleImages?.[0]
                      ? <img src={vendor.sampleImages[0]} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">🏪</div>}
                  </div>
                  <div className="p-4">
                    <p className="text-base font-semibold text-gray-900 truncate">{vendor.businessName}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{vendor.totalProducts} products · {vendor.totalOrders?.toLocaleString()} orders</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── New Arrivals ── */}
        <ScrollRow
          title="New Arrivals"
          icon={<Sparkles className="w-5 h-5 text-violet-500" />}
          products={newArrivals}
          href="/new"
          accent="#7c3aed"
        />

        {/* ── Full-width dark banner ── */}
        <FadeIn>
          <div className="rounded-3xl overflow-hidden relative flex items-center px-10 py-12"
            style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a78bfa 0%, transparent 50%), radial-gradient(circle at 80% 50%, #38bdf8 0%, transparent 50%)' }} />
            <div className="relative z-10 max-w-lg">
              <p className="text-violet-300 text-sm font-bold uppercase tracking-widest mb-2">For Entrepreneurs</p>
              <h2 className="text-4xl font-normal text-white mb-3 leading-tight">Start Selling<br />on Bazaar</h2>
              <p className="text-white/50 text-sm mb-6">Join thousands of sellers. Set up your store in minutes and reach millions of buyers.</p>
              <div className="flex gap-3">
                <Link href="/vendor/register"
                  className="px-6 py-3 rounded-2xl font-black text-sm text-white hover:scale-105 transition-all"
                  style={{ background: '#a78bfa' }}>
                  Create Store
                </Link>
                <Link href="/vendor/login"
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white/70 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                  Vendor Login
                </Link>
              </div>
            </div>
            <div className="absolute right-10 text-[120px] select-none hidden lg:block">🏪</div>
          </div>
        </FadeIn>

        {/* ── Top Rated ── */}
        <ScrollRow
          title="Top Rated"
          icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
          products={topRated}
          href="/products?sort=averageRating"
          accent="#d97706"
        />

        {/* ── All Products masonry-style grid ── */}
        <FadeIn>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-normal text-gray-800">All Products</h2>
              <Link href="/products" className="text-sm font-bold flex items-center gap-1" style={{ color: '#cf3232' }}>View all <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
              onWheel={e => { e.preventDefault(); (e.currentTarget as HTMLElement).scrollLeft += e.deltaY; }}
            >
              {products.slice(0, 12).map((p, i) => (
                <div key={p._id} className="flex-shrink-0" style={{ width: 400, opacity: 0, animation: `fadeUp 0.4s ease ${i * 40}ms forwards` }}>
                  <ProductCard product={p} size="md" />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white hover:scale-105 transition-all hover:shadow-xl"
                style={{ background: '#111' }}>
                Load More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ── Trending searches ── */}
        <FadeIn>
          <div className="rounded-3xl p-6" style={{ background: '#fafafa', border: '1px solid #f0f0f0' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: '#cf3232' }} />
              <h2 className="text-lg font-normal text-gray-800">Trending</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Wireless Earbuds','Smart Watch','Running Shoes','Face Serum','Laptop Stand','Yoga Mat','Mechanical Keyboard','LED Lamp','Protein Shaker','Leather Bag'].map((term, i) => (
                <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white hover:shadow-md transition-all hover:scale-105"
                  style={{ border: '1px solid #e5e7eb', color: '#374151', animationDelay: `${i * 30}ms` }}>
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
      `}</style>
    </>
  );
}

