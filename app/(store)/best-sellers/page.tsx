'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { addToCart } from '@/lib/cart';
import { Star, ShoppingCart, CheckCircle, TrendingUp, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function ProductCard({ p }: { p: any }) {
  const [added, setAdded] = useState(false);
  const disc = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : null;
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ productId: p._id, name: p.name, price: p.price, image: p.images?.[0], quantity: 1, vendorId: p.vendor?._id || '' });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };
  return (
    <Link href={`/product/${p._id}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1" style={{ border: '1px solid #f0f0f0' }}>
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
        {disc && <span className="absolute top-2.5 left-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#cf3232' }}>-{disc}%</span>}
        {p.totalSold > 100 && <span className="absolute top-2.5 right-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#059669' }}>🔥 {p.totalSold}+ sold</span>}
        <button onClick={handleAdd} className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all" style={{ background: added ? '#059669' : '#111' }}>
          {added ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 truncate">{p.vendor?.businessName}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2">{p.name}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">{p.averageRating?.toFixed(1) || '4.5'} ({p.reviewCount || 0})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-black text-gray-900">{formatCurrency(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(p.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories?active=true').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/buyer/products', { params: { sort: 'totalSold', order: 'desc', limit: 48, category: category || undefined } })
      .then(r => setProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-7 h-7" style={{ color: '#cf3232' }} />
        <h1 className="text-3xl font-black text-gray-900">Best Sellers</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">Our most popular products loved by thousands of buyers</p>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setCategory('')}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition"
          style={{ background: !category ? '#cf3232' : '#f3f4f6', color: !category ? '#fff' : '#374151' }}>
          All
        </button>
        {categories.map(c => (
          <button key={c._id} onClick={() => setCategory(c.slug)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition"
            style={{ background: category === c.slug ? '#cf3232' : '#f3f4f6', color: category === c.slug ? '#fff' : '#374151' }}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="h-72 rounded-2xl animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => (
            <div key={p._id} className="relative">
              {i < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg"
                  style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : '#b45309' }}>
                  #{i + 1}
                </div>
              )}
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
