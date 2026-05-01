'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { addToCart } from '@/lib/cart';
import { Star, ShoppingCart, CheckCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function ProductCard({ product }: { product: any }) {
  const [added, setAdded] = useState(false);
  const disc = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0], quantity: 1, vendorId: product.vendor?._id || '' });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };
  return (
    <Link href={`/product/${product._id}`}
      className="bg-white rounded-2xl overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ border: '1px solid #f0f0f0' }}>
      <div className="relative h-52 overflow-hidden bg-[#FAEFEF]">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
        {disc && <span className="absolute top-2.5 left-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#cf3232' }}>-{disc}%</span>}
        <span className="absolute top-2.5 right-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#f59e0b' }}>⭐ Featured</span>
        <button onClick={handleAdd}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: added ? '#059669' : '#111' }}>
          {added ? <CheckCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 truncate">{product.vendor?.businessName}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">{product.averageRating?.toFixed(1) || '4.5'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-black text-gray-900">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/featured')
      .then(r => setProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3" style={{ background: '#FAEFEF', border: '1.5px solid #fecdd3' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#cf3232' }} />
          <span className="text-sm font-black" style={{ color: '#cf3232' }}>Sponsored</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Featured Products</h1>
        <p className="text-gray-500 text-sm mt-2">Handpicked products from our top sellers</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No featured products right now</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
