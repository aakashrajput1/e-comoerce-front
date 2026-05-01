'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { formatDate } from '@/lib/utils';
import { RefreshCw, Trash2, Star } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reviews', { params: { page, limit: 15 } });
      setReviews(data.reviews);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [page]);

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/admin/reviews/${id}`);
    fetchReviews();
  };

  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  );

  const columns = [
    { key: 'product', label: 'Product', render: (r: any) => <span className="font-medium text-slate-800">{r.product?.name}</span> },
    { key: 'buyer', label: 'Buyer', render: (r: any) => <span className="text-slate-600">{r.buyer?.firstName} {r.buyer?.lastName}</span> },
    { key: 'rating', label: 'Rating', render: (r: any) => <RatingStars rating={r.rating} /> },
    { key: 'title', label: 'Title', render: (r: any) => <span className="text-slate-700 text-sm">{r.title || '—'}</span> },
    { key: 'body', label: 'Review', render: (r: any) => (
      <span className="text-slate-500 text-xs max-w-[200px] truncate block">{r.body || '—'}</span>
    )},
    { key: 'isVerifiedPurchase', label: 'Verified', render: (r: any) => (
      <span className={`text-xs font-medium ${r.isVerifiedPurchase ? 'text-green-600' : 'text-slate-400'}`}>
        {r.isVerifiedPurchase ? '✓ Yes' : 'No'}
      </span>
    )},
    { key: 'createdAt', label: 'Date', render: (r: any) => <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span> },
    { key: 'actions', label: '', render: (r: any) => (
      <button onClick={(e) => { e.stopPropagation(); deleteReview(r._id); }}
        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reviews</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total reviews</p>
        </div>
        <button onClick={fetchReviews} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <DataTable columns={columns} data={reviews} loading={loading} emptyMessage="No reviews found" />
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
    </div>
  );
}
