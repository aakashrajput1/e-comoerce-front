'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Star, ChevronRight, SlidersHorizontal } from 'lucide-react';

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
          <span className="text-xs text-gray-500">{p.averageRating?.toFixed(1) || '4.0'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-black text-gray-900 text-sm">{formatCurrency(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(p.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Find category by slug
    api.get('/categories').then(r => {
      const cat = r.data.categories?.find((c: any) => c.slug === slug);
      if (cat) {
        setCategory(cat);
        api.get(`/categories/${cat._id}/subcategories`).then(sr => setSubCategories(sr.data.subCategories || []));
      }
    });
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    api.get('/buyer/products', {
      params: { category: slug, sort, order: sort === 'price' ? 'asc' : 'desc', page, limit: 20 }
    }).then(r => {
      setProducts(r.data.products || []);
      setTotal(r.data.pagination?.total || 0);
    }).finally(() => setLoading(false));
  }, [slug, sort, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">{category?.name || slug}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {category?.icon && <span className="text-4xl">{category.icon}</span>}
          <div>
            <h1 className="text-2xl font-black text-gray-900">{category?.name || slug}</h1>
            <p className="text-sm text-gray-400">{total} products</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>
            <option value="createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="totalSold">Best Selling</option>
            <option value="averageRating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Subcategories */}
      {subCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {subCategories.map(sub => (
            <Link key={sub._id} href={`/search?q=${encodeURIComponent(sub.name)}`}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
              style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151' }}>
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="h-64 rounded-xl animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{category?.icon || '📦'}</p>
          <p className="text-lg font-bold text-gray-700">No products yet</p>
          <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>← Prev</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={products.length < 20}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
            style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#374151' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
