'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Star, SlidersHorizontal, ChevronRight, X } from 'lucide-react';

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
          <span className="font-black text-gray-900 text-sm">{formatCurrency(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(p.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sortParam = searchParams.get('sort') || 'createdAt';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(sortParam);
  const [selectedCat, setSelectedCat] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/categories?active=true').then(r => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/buyer/products', {
      params: {
        sort, order: sort === 'price' ? 'asc' : 'desc',
        category: selectedCat || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        page, limit: 20,
      }
    }).then(r => {
      setProducts(r.data.products || []);
      setTotal(r.data.pagination?.total || 0);
    }).finally(() => setLoading(false));
  }, [sort, selectedCat, page]);

  const applyFilters = () => {
    setPage(1);
    setLoading(true);
    api.get('/buyer/products', {
      params: { sort, order: sort === 'price' ? 'asc' : 'desc', category: selectedCat || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, page: 1, limit: 20 }
    }).then(r => { setProducts(r.data.products || []); setTotal(r.data.pagination?.total || 0); }).finally(() => setLoading(false));
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">All Products</span>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-5">
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-bold text-gray-800 text-sm mb-3">Categories</p>
            <div className="space-y-1">
              <button onClick={() => { setSelectedCat(''); setPage(1); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCat ? 'font-bold' : 'text-gray-600 hover:bg-[#FAEFEF]'}`}
                style={!selectedCat ? { background: '#FAEFEF', color: '#cf3232' } : {}}>
                All Categories
              </button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => { setSelectedCat(cat.name); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedCat === cat.name ? 'font-bold' : 'text-gray-600 hover:bg-[#FAEFEF]'}`}
                  style={selectedCat === cat.name ? { background: '#FAEFEF', color: '#cf3232' } : {}}>
                  <span>{cat.icon}</span>{cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e5e7eb' }}>
            <p className="font-bold text-gray-800 text-sm mb-3">Price Range</p>
            <div className="space-y-2">
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min $"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb' }} />
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max $"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb' }} />
              <button onClick={applyFilters} className="w-full py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#cf3232' }}>
                Apply
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm text-gray-500"><span className="font-bold text-gray-800">{total}</span> products</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>
                <option value="createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="totalSold">Best Selling</option>
                <option value="averageRating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(selectedCat || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCat && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#FAEFEF', color: '#cf3232' }}>
                  {selectedCat}
                  <button onClick={() => setSelectedCat('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#FAEFEF', color: '#cf3232' }}>
                  ${minPrice || '0'} – ${maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); applyFilters(); }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="h-64 rounded-xl animate-pulse bg-gray-100" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg font-bold text-gray-700">No products found</p>
              <button onClick={() => { setSelectedCat(''); setMinPrice(''); setMaxPrice(''); }} className="mt-3 text-sm font-semibold hover:underline" style={{ color: '#cf3232' }}>Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p._id} p={p} />)}
            </div>
          )}

          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>← Prev</button>
              <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={products.length < 20}
                className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense><ProductsContent /></Suspense>;
}
