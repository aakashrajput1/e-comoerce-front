'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ChevronRight, Layers } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories?active=true').then(r => setCategories(r.data.categories || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">All Categories</span>
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-6">Shop by Category</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(15)].map((_, i) => <div key={i} className="h-36 rounded-2xl animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link key={cat._id} href={`/category/${cat.slug}`}
              className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 group"
              style={{ border: '1px solid #e5e7eb' }}>
              <span className="text-5xl">{cat.icon || '📦'}</span>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-sm">{cat.name}</p>
                {cat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{cat.description}</p>}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Layers className="w-3 h-3 text-gray-300" />
                  <span className="text-xs text-gray-400">{cat.subCategoryCount} subcategories</span>
                </div>
              </div>
              <span className="text-xs font-semibold group-hover:underline" style={{ color: '#cf3232' }}>
                Browse →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
