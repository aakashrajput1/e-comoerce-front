'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBuyerAuth, buyerApi } from '@/lib/buyerAuth';
import { addToCart } from '@/lib/cart';
import { Heart, ShoppingCart, Trash2, CheckCircle, Star, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function WishlistCard({ product, onRemove }: { product: any; onRemove: () => void }) {
  const [added, setAdded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const disc = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0], quantity: 1, vendorId: product.vendor?._id || '' });
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setRemoving(true);
    try {
      await buyerApi.delete(`/buyer/wishlist/${product._id}`);
      onRemove();
    } catch { setRemoving(false); }
  };

  return (
    <Link href={`/product/${product._id}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1" style={{ border: '1px solid #f0f0f0' }}>
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
        {disc && <span className="absolute top-2.5 left-2.5 text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: '#cf3232' }}>-{disc}%</span>}
        {product.inventory === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white font-black text-sm">Out of Stock</span></div>}
        <button onClick={handleRemove} disabled={removing}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50">
          {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 truncate">{product.vendor?.businessName}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5 line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-500">{product.averageRating?.toFixed(1) || '4.5'} ({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-900">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>}
          </div>
          {product.inventory > 0 && (
            <button onClick={handleAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: added ? '#059669' : '#cf3232' }}>
              {added ? <CheckCircle className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              {added ? 'Added' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function WishlistPage() {
  const { buyer, loading: authLoading } = useBuyerAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !buyer) router.push('/buyer/login?redirect=/wishlist');
  }, [buyer, authLoading, router]);

  const fetchWishlist = async () => {
    if (!buyer) return;
    setLoading(true);
    try {
      const { data } = await buyerApi.get('/buyer/wishlist');
      setProducts(data.products || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { if (buyer) fetchWishlist(); }, [buyer]);

  if (authLoading || (!buyer && !authLoading)) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#cf3232' }} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
        <h1 className="text-3xl font-black text-gray-900">My Wishlist</h1>
        {products.length > 0 && <span className="text-sm font-bold text-gray-400">({products.length} items)</span>}
      </div>
      <p className="text-gray-500 text-sm mb-8">Products you've saved for later</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#fee2e2' }}>
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-sm mb-6">Save products you love by clicking the heart icon</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <WishlistCard key={p._id} product={p} onRemove={() => setProducts(prev => prev.filter(x => x._id !== p._id))} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => {
              products.filter(p => p.inventory > 0).forEach(p => addToCart({ productId: p._id, name: p.name, price: p.price, image: p.images?.[0], quantity: 1, vendorId: p.vendor?._id || '' }));
              router.push('/cart');
            }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white hover:opacity-90 transition-all"
              style={{ background: '#cf3232' }}>
              <ShoppingCart className="w-4 h-4" /> Add All to Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}
