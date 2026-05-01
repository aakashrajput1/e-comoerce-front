'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Star, MapPin, Package, ChevronRight, Store } from 'lucide-react';

function ProductCard({ p }: { p: any }) {
  const disc = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : null;
  return (
    <Link href={`/product/${p._id}`} className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all group" style={{ border: '1px solid #e5e7eb' }}>
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
        {disc && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: '#cf3232' }}>{disc}% OFF</span>}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2">{p.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">{p.averageRating?.toFixed(1) || '4.0'}</span>
        </div>
        <span className="font-black text-gray-900 text-sm mt-1 block">{formatCurrency(p.price)}</span>
      </div>
    </Link>
  );
}

export default function StorefrontPage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get(`/vendor/storefront/${slug}`),
      api.get(`/buyer/vendors/${slug}/products`, { params: { page, limit: 20 } }),
    ]).then(([vRes, pRes]) => {
      setVendor(vRes.data.vendor);
      setProducts(pRes.data.products || []);
      setTotal(pRes.data.pagination?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug, page]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <div className="h-40 rounded-2xl animate-pulse bg-gray-100" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="h-56 rounded-xl animate-pulse bg-gray-100" />)}
      </div>
    </div>
  );

  if (!vendor) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <Store className="w-16 h-16 mx-auto mb-4 text-gray-200" />
      <p className="text-lg font-bold text-gray-700">Store not found</p>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold hover:underline" style={{ color: '#cf3232' }}>← Back to Home</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">{vendor.businessName}</span>
      </div>

      {/* Store header */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        <div className="h-32 relative" style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
          <div className="absolute inset-0 opacity-10 text-9xl flex items-center justify-center">🏪</div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-lg"
              style={{ background: '#cf3232', border: '3px solid #fff' }}>
              {vendor.logo ? <img src={vendor.logo} alt="" className="w-full h-full object-cover rounded-2xl" /> : vendor.businessName?.[0]}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-gray-900">{vendor.businessName}</h1>
                {vendor.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#d1fae5', color: '#065f46' }}>
                    ✅ Verified
                  </span>
                )}
              </div>
              {vendor.address?.city && (
                <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin className="w-3 h-3" />{vendor.address.city}, {vendor.address.country}
                </p>
              )}
            </div>
          </div>
          {vendor.description && <p className="text-sm text-gray-600">{vendor.description}</p>}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3.5 h-3.5" />{vendor.totalProducts || products.length} products
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900">All Products <span className="text-gray-400 font-normal text-sm">({total})</span></h2>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #e5e7eb' }}>
            <p className="text-4xl mb-3">📦</p>
            <p className="font-bold text-gray-700">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p._id} p={p} />)}
          </div>
        )}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
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
    </div>
  );
}
