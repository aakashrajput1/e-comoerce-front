'use client';
import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendorAuth';
import { formatDate } from '@/lib/utils';
import { Star, MessageSquare, Loader2, RefreshCw, Send } from 'lucide-react';

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState('');
  const [avgRating, setAvgRating] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await vendorApi.get('/vendor/reviews', {
        params: { limit: 50, rating: filterRating || undefined },
      });
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [filterRating]);

  const submitReply = async (reviewId: string) => {
    const reply = replyMap[reviewId]?.trim();
    if (!reply) return;
    setReplying(reviewId);
    try {
      await vendorApi.patch(`/vendor/reviews/${reviewId}/reply`, { reply });
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, vendorReply: reply } : r));
      setReplyMap(prev => ({ ...prev, [reviewId]: '' }));
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to submit reply'); }
    finally { setReplying(null); }
  };

  const ratingCounts = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reviews.length} reviews · Avg{' '}
            <span className="font-bold text-yellow-500">{avgRating > 0 ? avgRating.toFixed(1) : '—'} ★</span>
          </p>
        </div>
        <div className="flex gap-2">
          <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} Stars</option>)}
          </select>
          <button onClick={fetchReviews} className="p-2.5 rounded-xl" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Rating summary */}
      {reviews.length > 0 && !filterRating && (
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex items-center gap-0.5 justify-center mt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 min-w-[180px] space-y-1.5">
              {ratingCounts.map(({ star, count }) => {
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#cf3232' }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-gray-300" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #e5e7eb' }}>
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-700">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Reviews from buyers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: '#cf3232' }}>
                  {r.buyer?.firstName?.[0]}{r.buyer?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{r.buyer?.firstName} {r.buyer?.lastName}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />)}
                    </div>
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.product?.name && <p className="text-xs text-gray-400 mt-0.5">Product: <span className="font-semibold text-gray-600">{r.product.name}</span></p>}
                  {r.title && <p className="text-sm font-bold text-gray-800 mt-2">{r.title}</p>}
                  {r.body && <p className="text-sm text-gray-600 mt-1">{r.body}</p>}
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {r.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover" style={{ border: '1px solid #e5e7eb' }} />
                      ))}
                    </div>
                  )}

                  {/* Existing reply */}
                  {r.vendorReply && (
                    <div className="mt-3 p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="text-xs font-bold text-green-700 mb-1">Your Reply · {r.vendorRepliedAt ? formatDate(r.vendorRepliedAt) : ''}</p>
                      <p className="text-sm text-green-800">{r.vendorReply}</p>
                    </div>
                  )}

                  {/* Reply input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      value={replyMap[r._id] || ''}
                      onChange={e => setReplyMap(prev => ({ ...prev, [r._id]: e.target.value }))}
                      placeholder={r.vendorReply ? 'Update your reply...' : 'Write a reply...'}
                      className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ border: '1px solid #e5e7eb' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                    <button onClick={() => submitReply(r._id)} disabled={replying === r._id || !replyMap[r._id]?.trim()}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                      style={{ background: '#cf3232' }}>
                      {replying === r._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      {r.vendorReply ? 'Update' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
