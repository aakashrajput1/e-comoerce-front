'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { addToCart } from '@/lib/cart';
import { useBuyerAuth } from '@/lib/buyerAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Star, ShoppingCart, ChevronRight, Shield, Truck, RotateCcw,
  CheckCircle, Minus, Plus, Heart, Share2, ChevronLeft,
  ChevronDown, ChevronUp, Package, Tag, Store, Zap,
  ThumbsUp, AlertCircle, ArrowLeft, MessageCircle, Send, Loader2,
} from 'lucide-react';

// ── Rating bar ────────────────────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-3">{star}</span>
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: star >= 4 ? '#22c55e' : star === 3 ? '#f59e0b' : '#ef4444' }} />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  return (
    <div className="py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: '#cf3232' }}>
          {review.buyer?.firstName?.[0]}{review.buyer?.lastName?.[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{review.buyer?.firstName} {review.buyer?.lastName}</span>
            {review.isVerifiedPurchase && (
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#059669' }}>
                <CheckCircle className="w-3 h-3" /> Verified Purchase
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
            ))}
            <span className="text-xs font-semibold ml-1" style={{ color: review.rating >= 4 ? '#059669' : review.rating >= 3 ? '#d97706' : '#dc2626' }}>
              {review.rating >= 4 ? 'Excellent' : review.rating >= 3 ? 'Good' : 'Poor'}
            </span>
          </div>
          {review.title && <p className="text-sm font-bold text-gray-800 mt-2">{review.title}</p>}
          {review.body && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>}
          {review.images?.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover" style={{ border: '1px solid #e5e7eb' }} />
              ))}
            </div>
          )}
          {review.vendorReply && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
              <p className="text-xs font-bold text-gray-600 mb-1">Seller Response:</p>
              <p className="text-xs text-gray-600 italic">{review.vendorReply}</p>
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <ThumbsUp className="w-3.5 h-3.5" /> Helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [myQuestion, setMyQuestion] = useState('');
  const [guestName, setGuestName] = useState('');
  const [askingQ, setAskingQ] = useState(false);
  const [showAskForm, setShowAskForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/buyer/products/${id}`)
      .then(r => {
        setProduct(r.data.product);
        setReviews(r.data.reviews || []);
        if (r.data.product?.category) {
          // category is now a populated object {_id, name, slug} or a string
          const cat = r.data.product.category;
          const catSlug = cat?.slug || cat?.name?.toLowerCase() || cat;
          api.get(`/buyer/products?category=${catSlug}&limit=8`)
            .then(rr => setRelatedProducts((rr.data.products || []).filter((p: any) => p._id !== id)));
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id]);

  // Check wishlist status when buyer is logged in
  useEffect(() => {
    if (buyer && id) {
      import('@/lib/buyerAuth').then(({ buyerApi }) => {
        buyerApi.get(`/buyer/wishlist/check/${id}`)
          .then(r => setWishlisted(r.data.inWishlist))
          .catch(() => {});
      });
    }
  }, [buyer, id]);

  const fetchQuestions = () => {
    setQaLoading(true);
    api.get(`/buyer/products/${id}/questions?limit=20`)
      .then(r => setQuestions(r.data.questions || []))
      .catch(() => {})
      .finally(() => setQaLoading(false));
  };

  useEffect(() => { if (id) fetchQuestions(); }, [id]);

  const submitQuestion = async () => {
    if (!myQuestion.trim()) return;
    setAskingQ(true);
    try {
      const headers: any = {};
      const token = localStorage.getItem('buyer_token');
      if (token) headers.Authorization = `Bearer ${token}`;
      await api.post(`/buyer/products/${id}/questions`, { question: myQuestion.trim(), guestName: guestName.trim() || undefined }, { headers });
      setMyQuestion(''); setGuestName(''); setShowAskForm(false);
      fetchQuestions();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to submit question'); }
    finally { setAskingQ(false); }
  };

  const toggleWishlist = async () => {
    if (!buyer) { router.push('/buyer/login'); return; }
    setWishlistLoading(true);
    try {
      const { buyerApi } = await import('@/lib/buyerAuth');
      if (wishlisted) {
        await buyerApi.delete(`/buyer/wishlist/${id}`);
        setWishlisted(false);
      } else {
        await buyerApi.post(`/buyer/wishlist/${id}`, {});
        setWishlisted(true);
      }
    } catch { }
    finally { setWishlistLoading(false); }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    // Always save to localStorage
    addToCart({ productId: id as string, name: product.name, price: product.price, image: product.images?.[0], quantity: qty, vendorId: product.vendor?._id || '' });
    // If buyer is logged in, also sync to backend cart
    if (buyer) {
      try {
        const { buyerApi } = await import('@/lib/buyerAuth');
        await buyerApi.post('/buyer/cart/add', { productId: id, quantity: qty });
      } catch {
        // silent fail — localStorage cart is the source of truth for checkout sync
      }
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const checkDelivery = () => {
    if (pincode.length === 5 || pincode.length === 6) {
      setDeliveryMsg(`✓ Delivery available to ${pincode} — Expected in 3-5 business days`);
    } else {
      setDeliveryMsg('Please enter a valid pincode');
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <div className="aspect-square rounded-2xl animate-pulse bg-gray-100" />
          <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="w-16 h-16 rounded-xl animate-pulse bg-gray-100" />)}</div>
        </div>
        <div className="lg:col-span-5 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded-lg animate-pulse bg-gray-100" />)}</div>
        <div className="lg:col-span-3"><div className="h-64 rounded-2xl animate-pulse bg-gray-100" /></div>
      </div>
    </div>
  );

  if (!product) return null;

  const disc = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;
  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : 0;
  const avgRating = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0;
  const ratingBreakdown = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter((r: any) => r.rating === s).length }));
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // Helper to get category display name and slug
  const catName = product.category?.name || (typeof product.category === 'string' ? product.category : null);
  const catSlug = product.category?.slug || catName?.toLowerCase();

  return (
    <div className="bg-[#FAEFEF] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3 h-3" />
            {catName && <>
              <Link href={`/category/${catSlug}`} className="hover:text-blue-600">{catName}</Link>
              <ChevronRight className="w-3 h-3" />
            </>}
            <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* ── Main product section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── Left: Images ── */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-4 sticky top-20" style={{ border: '1px solid #e5e7eb' }}>
              {/* Main image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAEFEF] mb-3">
                {product.images?.[activeImg]
                  ? <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-contain p-4" />
                  : <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>}
                {disc && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-sm font-black text-white" style={{ background: '#cf3232' }}>
                    {disc}% OFF
                  </div>
                )}
                {/* Nav arrows */}
                {product.images?.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#FAEFEF] transition-colors"
                      style={{ border: '1px solid #e5e7eb' }}>
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => setActiveImg(i => Math.min((product.images?.length || 1) - 1, i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[#FAEFEF] transition-colors"
                      style={{ border: '1px solid #e5e7eb' }}>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                      style={{ border: i === activeImg ? '2px solid #cf3232' : '1px solid #e5e7eb' }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all"
                  style={{ background: addedToCart ? '#059669' : '#ff9f00' }}>
                  {addedToCart ? <><CheckCircle className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                </button>
                <button onClick={() => setWishlisted(!wishlisted)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                  style={{ border: '1px solid #e5e7eb', background: wishlisted ? '#fee2e2' : '#fff', color: wishlisted ? '#dc2626' : '#9ca3af' }}>
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
                </button>
                <button className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#FAEFEF] transition-all"
                  style={{ border: '1px solid #e5e7eb' }}>
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Buy Now */}
              {product.inventory > 0 && (
                <button
                  onClick={() => { handleAddToCart(); router.push(buyer ? '/cart' : '/buyer/login'); }}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: '#cf3232', display: 'flex' }}>
                  <Zap className="w-4 h-4" /> Buy Now
                </button>
              )}
            </div>
          </div>

          {/* ── Middle: Product Info ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              {/* Brand / vendor */}
              <p className="text-sm font-semibold" style={{ color: '#2563eb' }}>{product.vendor?.businessName}</p>

              {/* Title */}
              <h1 className="text-xl font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: avgRating >= 4 ? '#16a34a' : avgRating >= 3 ? '#d97706' : '#dc2626' }}>
                    <span className="text-sm font-bold text-white">{avgRating.toFixed(1)}</span>
                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <span className="text-sm text-gray-500">{reviews.length} Ratings & Reviews</span>
                  {product.totalSold > 0 && <span className="text-sm text-gray-400">• {product.totalSold}+ sold</span>}
                </div>
              )}

              <div className="my-3" style={{ borderTop: '1px solid #f3f4f6' }} />

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-black text-gray-900">{formatCurrency(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
                  )}
                  {disc && <span className="text-lg font-bold" style={{ color: '#16a34a' }}>{disc}% off</span>}
                </div>
                {savings > 0 && (
                  <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                    You save {formatCurrency(savings)}
                  </p>
                )}
                <p className="text-xs text-gray-400">Inclusive of all taxes</p>
              </div>

              {/* Available offers */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-gray-800">Available Offers</p>
                {[
                  { icon: '🏦', text: '10% off on first order with code FIRST10' },
                  { icon: '💳', text: '5% cashback on Stripe payments' },
                  { icon: '🎁', text: 'Free gift wrapping on orders above $100' },
                ].map((offer, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0">{offer.icon}</span>
                    <span>{offer.text}</span>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              {product.highlights?.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-sm font-bold text-gray-800">Key Features</p>
                  {product.highlights.map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: '#059669' }}>✓</span>
                      {h}
                    </div>
                  ))}
                </div>
              )}

              {/* Variants */}
              {product.hasVariants && product.variantOptions?.length > 0 && (
                <div className="mt-4 space-y-3">
                  {product.variantOptions.map((opt: any) => (
                    <div key={opt.name}>
                      <p className="text-sm font-bold text-gray-800 mb-2">{opt.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val: string) => (
                          <button key={val}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={{ border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151' }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#cf3232'; (e.target as HTMLElement).style.color = '#cf3232'; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#e5e7eb'; (e.target as HTMLElement).style.color = '#374151'; }}>
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery check */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="text-sm font-bold text-gray-800 mb-3">Delivery Options</p>
              <div className="flex gap-2">
                <input value={pincode} onChange={e => setPincode(e.target.value)}
                  placeholder="Enter pincode / zip code"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #d1d5db', color: '#111827' }}
                  onFocus={e => (e.target.style.borderColor = '#cf3232')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
                <button onClick={checkDelivery} className="px-4 py-2.5 rounded-xl text-sm font-bold" style={{ color: '#cf3232', border: '1px solid #cf3232' }}>
                  Check
                </button>
              </div>
              {deliveryMsg && (
                <p className="text-xs mt-2 font-medium" style={{ color: deliveryMsg.startsWith('✓') ? '#059669' : '#dc2626' }}>
                  {deliveryMsg}
                </p>
              )}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Truck, title: 'Free Delivery', sub: 'Orders over $50' },
                  { icon: RotateCcw, title: `${product.returnPolicyDays || 7}-Day Return`, sub: 'Easy returns' },
                  { icon: Shield, title: 'Secure Pay', sub: 'Stripe protected' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="text-center p-3 rounded-xl" style={{ background: '#FAEFEF' }}>
                    <Icon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-700">{title}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="text-sm font-bold text-gray-800 mb-3">Product Description</p>
              {product.description ? (
                <>
                  <p className={`text-sm text-gray-600 leading-relaxed ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                    {product.description}
                  </p>
                  {product.description.length > 200 && (
                    <button onClick={() => setShowFullDesc(!showFullDesc)}
                      className="flex items-center gap-1 text-sm font-semibold mt-2" style={{ color: '#cf3232' }}>
                      {showFullDesc ? <><ChevronUp className="w-4 h-4" /> Read Less</> : <><ChevronDown className="w-4 h-4" /> Read More</>}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">No description available.</p>
              )}
            </div>

            {/* Product details table */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <p className="text-sm font-bold text-gray-800 mb-3">Product Details</p>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Category', catName || '—'],
                    ['SKU', product.sku || '—'],
                    ['In Stock', product.inventory > 0 ? `${product.inventory} units` : 'Out of Stock'],
                    ['Return Policy', `${product.returnPolicyDays || 7} days`],
                    ['Seller', product.vendor?.businessName || '—'],
                    ['Listed On', formatDate(product.createdAt)],
                  ].map(([key, val]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td className="py-2.5 pr-4 text-gray-400 font-medium w-36">{key}</td>
                      <td className="py-2.5 text-gray-700 font-medium">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
                <p className="text-sm font-bold text-gray-800 mb-3">Specifications</p>
                {(() => {
                  const groups: Record<string, any[]> = {};
                  product.specifications.forEach((s: any) => {
                    const g = s.group || 'General';
                    if (!groups[g]) groups[g] = [];
                    groups[g].push(s);
                  });
                  return Object.entries(groups).map(([group, specs]) => (
                    <div key={group} className="mb-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{group}</p>
                      <table className="w-full text-sm">
                        <tbody>
                          {specs.map((s: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                              <td className="py-2 pr-4 text-gray-400 font-medium w-40">{s.key}</td>
                              <td className="py-2 text-gray-700 font-medium">{s.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* ── Right: Buy box ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 sticky top-20 space-y-4" style={{ border: '1px solid #e5e7eb' }}>
              {/* Price */}
              <div>
                <span className="text-2xl font-black text-gray-900">{formatCurrency(product.price)}</span>
                {disc && <span className="ml-2 text-sm font-bold" style={{ color: '#16a34a' }}>{disc}% off</span>}
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${product.inventory > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-semibold" style={{ color: product.inventory > 0 ? '#059669' : '#dc2626' }}>
                  {product.inventory > 10 ? 'In Stock' : product.inventory > 0 ? `Only ${product.inventory} left!` : 'Out of Stock'}
                </span>
              </div>

              {/* Qty selector */}
              {product.inventory > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-[#FAEFEF] transition-colors">
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.inventory, q + 1))} className="px-3 py-2 hover:bg-[#FAEFEF] transition-colors">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">Max {product.inventory}</span>
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              {product.inventory > 0 ? (
                <div className="space-y-2">
                  <button onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: addedToCart ? '#059669' : '#ff9f00' }}>
                    {addedToCart ? <><CheckCircle className="w-4 h-4" /> Added to Cart!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                  </button>
                  <button
                    onClick={() => { handleAddToCart(); router.push(buyer ? '/cart' : '/buyer/login'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                    style={{ background: '#cf3232', display: 'flex' }}>
                    <Zap className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              ) : (
                <div className="py-3 rounded-xl text-center text-sm font-bold text-gray-400 bg-gray-100">
                  Out of Stock
                </div>
              )}

              {/* Wishlist */}
              <button onClick={() => setWishlisted(!wishlisted)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: '1px solid #e5e7eb', color: wishlisted ? '#dc2626' : '#374151', background: wishlisted ? '#fee2e2' : '#f9fafb' }}>
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>

              {/* Seller info */}
              {product.vendor && (
                <div className="pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                  <p className="text-xs text-gray-400 mb-2">Sold by</p>
                  <Link href={`/store/${product.vendor.slug}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: '#cf3232' }}>
                      {product.vendor.businessName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{product.vendor.businessName}</p>
                      <p className="text-xs" style={{ color: '#2563eb' }}>Visit Store →</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Safety */}
              <div className="pt-3 space-y-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                {[
                  { icon: Shield, text: '100% Secure Payments' },
                  { icon: Package, text: 'Easy Returns & Refunds' },
                  { icon: CheckCircle, text: 'Verified Seller' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                    <Icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Ratings & Reviews ── */}
        {reviews.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
            <h2 className="text-lg font-black text-gray-900 mb-5">Ratings & Reviews</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
              {/* Overall rating */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl" style={{ background: '#FAEFEF' }}>
                <span className="text-6xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
                <div className="flex items-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-1">{reviews.length} reviews</p>
              </div>
              {/* Breakdown */}
              <div className="lg:col-span-2 space-y-2">
                {ratingBreakdown.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviews.length} />
                ))}
              </div>
            </div>

            {/* Review list */}
            <div>
              {displayedReviews.map(r => <ReviewCard key={r._id} review={r} />)}
              {reviews.length > 3 && (
                <button onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 flex items-center gap-1 text-sm font-bold" style={{ color: '#cf3232' }}>
                  {showAllReviews ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> View All {reviews.length} Reviews</>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Q&A Section ── */}
        <div className="mt-4 bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" style={{ color: '#cf3232' }} />
              Customer Questions & Answers
              {questions.length > 0 && <span className="text-sm font-semibold text-gray-400">({questions.length})</span>}
            </h2>
            <button onClick={() => setShowAskForm(!showAskForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: '#cf3232' }}>
              <MessageCircle className="w-4 h-4" /> Ask a Question
            </button>
          </div>

          {/* Ask form */}
          {showAskForm && (
            <div className="mb-5 p-4 rounded-2xl" style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}>
              <p className="text-sm font-bold text-gray-700 mb-3">Your Question</p>
              {!buyer && (
                <input value={guestName} onChange={e => setGuestName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none mb-2"
                  style={{ borderColor: '#e5e7eb' }}
                  onFocus={e => (e.target.style.borderColor = '#cf3232')}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
              )}
              <textarea value={myQuestion} onChange={e => setMyQuestion(e.target.value)}
                placeholder="What would you like to know about this product?"
                rows={3}
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                style={{ borderColor: '#e5e7eb' }}
                onFocus={e => (e.target.style.borderColor = '#cf3232')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
              <div className="flex gap-2 mt-3">
                <button onClick={submitQuestion} disabled={askingQ || !myQuestion.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: '#cf3232' }}>
                  {askingQ ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Question
                </button>
                <button onClick={() => setShowAskForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: '#f3f4f6', color: '#374151' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Questions list */}
          {qaLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q._id} className="py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: '#6b7280' }}>
                      {(q.askedBy?.firstName?.[0] || q.guestName?.[0] || 'G').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {q.askedBy ? `${q.askedBy.firstName} ${q.askedBy.lastName}` : (q.guestName || 'Anonymous')}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(q.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 font-medium">Q: {q.question}</p>

                      {q.answer ? (
                        <div className="mt-2 pl-3 border-l-2" style={{ borderColor: '#cf3232' }}>
                          <p className="text-xs font-bold mb-0.5" style={{ color: '#cf3232' }}>
                            Seller · {formatDate(q.answeredAt)}
                          </p>
                          <p className="text-sm text-gray-700">A: {q.answer}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1 italic">Awaiting seller response...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Similar Products</h2>
              <Link href={`/category/${catSlug}`} className="text-sm font-semibold hover:underline" style={{ color: '#cf3232' }}>
                View All <ChevronRight className="w-4 h-4 inline" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {relatedProducts.map(p => {
                const d = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : null;
                return (
                  <Link key={p._id} href={`/product/${p._id}`}
                    className="flex-shrink-0 w-44 bg-white rounded-xl overflow-hidden hover:shadow-md transition-all group"
                    style={{ border: '1px solid #e5e7eb' }}>
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                      {d && <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: '#cf3232' }}>{d}% OFF</span>}
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
