'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Store, Package, ShoppingBag } from 'lucide-react';

function VendorCard({ vendor }: { vendor: any }) {
  return (
    <Link href={`/store/${vendor.slug}`}
      className="group bg-white rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ border: '1px solid #f0f0f0' }}>
      {/* 2x2 product image grid */}
      <div className="grid grid-cols-2 gap-0.5 h-44 overflow-hidden bg-[#FAEFEF]">
        {[0, 1, 2, 3].map(idx => (
          <div key={idx} className="overflow-hidden bg-gray-100">
            {vendor.sampleImages?.[idx]
              ? <img src={vendor.sampleImages[idx]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
          </div>
        ))}
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {vendor.logo
            ? <img src={vendor.logo} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" style={{ border: '2px solid #fecdd3' }} />
            : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black flex-shrink-0" style={{ background: '#cf3232' }}>
                {vendor.businessName?.[0]}
              </div>}
          <div className="min-w-0">
            <p className="font-black text-gray-900 truncate">{vendor.businessName}</p>
            {vendor.description && <p className="text-xs text-gray-400 truncate mt-0.5">{vendor.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Package className="w-3.5 h-3.5" />
            <span>{vendor.totalProducts} products</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{vendor.totalOrders}+ orders</span>
          </div>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#FAEFEF', color: '#cf3232' }}>
            Visit Store →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TopSellersPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/buyer/vendors/top?limit=24')
      .then(r => setVendors(r.data.vendors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Store className="w-6 h-6" style={{ color: '#cf3232' }} />
          <h1 className="text-3xl font-black text-gray-900">Top Sellers</h1>
        </div>
        <p className="text-gray-500 text-sm">Our most trusted and popular stores</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl animate-pulse bg-gray-100" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No sellers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vendors.map(v => <VendorCard key={v._id} vendor={v} />)}
        </div>
      )}
    </div>
  );
}
