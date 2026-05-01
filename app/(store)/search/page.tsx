'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Search, Star, SlidersHorizontal, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function ProductCard({ p }: { p: any }) {
  const disc = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : null;
  return (
    <Link href={`/product/${p._id}`} className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all group" style={{ border: '1px solid #e5e7eb' }}>
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
        {disc && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: '#cf3232' }}>{disc}% OFF</span>}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 truncate">{p.vendor?.businessName}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2">{p.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">{p.averageRating?.toFixed(1) || '4.0'} ({p.reviewCount || 0})</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-black text-gray-900">{formatCurrency(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(p.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('createdAt');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const search = async (searchQ: string) => {
    if (!searchQ.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.get('/buyer/products', {
        params: { search: searchQ, sort, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, limit: 40 }
      });
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (q) search(q); }, [q, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 flex rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."
            className="flex-1 px-4 py-3 text-sm outline-none text-gray-800" />
          {query && <button type="button" onClick={() => setQuery('')} className="px-3 text-gray-400"><X className="w-4 h-4" /></button>}
        </div>
        <button type="submit" className="px-6 py-3 rounded-xl text-white font-semibold text-sm" style={{ background: '#cf3232' }}>
          <Search className="w-5 h-5" />
        </button>
      </form>

      {q && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="text-sm text-gray-500">{total} results for "<strong className="text-gray-800">{q}</strong>"</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>
                <option value="createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="totalSold">Best Selling</option>
                <option value="averageRating">Top Rated</option>
              </select>
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min $"
                className="w-20 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb' }} />
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max $"
                className="w-20 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb' }} />
              <button onClick={() => search(q)} className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#cf3232' }}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <div key={i} className="h-64 rounded-xl animate-pulse bg-gray-100" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-bold text-gray-700">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map(p => <ProductCard key={p._id} p={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
