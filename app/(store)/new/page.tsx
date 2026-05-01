'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { addToCart } from '@/lib/cart';
import { Star, ShoppingCart, CheckCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function ProductCard({ p }: { p: any }) {
  const [added, setAdded] = useState(false);
  const disc = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : null;
  const isNew = (Date.now() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
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
        {isNew && <span className="absolute top-2.5 right-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#7c3aed' }}>✨ New</span>}
        <button onClick={handleAdd} className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all" style={{ background: added ? '#059669' : '#111' }}>
          {added ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 truncate">{p.vendor?.businessName}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2">{p.name}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">{p.averageRating?.toFixed(1) || '4.5'}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-black text-gray-900">{formatCurrency(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(p.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories?active=true').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/buyer/products', { params: { sort: 'createdAt', order: 'desc', limit: 48, category: category || undefined } })
      .then(r => setProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-7 h-7 text-violet-500" />
        <h1 className="text-3xl font-black text-gray-900">New Arrivals</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">The latest products just added to Bazaar</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setCategory('')}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition"
          style={{ background: !category ? '#7c3aed' : '#f3f4f6', color: !category ? '#fff' : '#374151' }}>
          All
        </button>
        {categories.map(c => (
          <button key={c._id} onClick={() => setCategory(c.slug)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition"
            style={{ background: category === c.slug ? '#7c3aed' : '#f3f4f6', color: category === c.slug ? '#fff' : '#374151' }}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="h-72 rounded-2xl animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </div>
  );
}
