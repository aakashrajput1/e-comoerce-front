'use client';
import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendorAuth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Star, Loader2, CheckCircle, Clock, XCircle, AlertCircle, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#fef9c3', color: '#854d0e', label: 'Pending Review' },
  approved: { bg: '#dbeafe', color: '#1e40af', label: 'Approved — Pay to Go Live' },
  rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  active:   { bg: '#d1fae5', color: '#065f46', label: 'Active' },
  expired:  { bg: '#f3f4f6', color: '#6b7280', label: 'Expired' },
};

function PayForm({ applicationId, amount, onSuccess }: { applicationId: string; amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true); setError('');
    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/vendor/featured' },
      redirect: 'if_required',
    });
    if (confirmErr) { setError(confirmErr.message || 'Payment failed'); setPaying(false); return; }
    if (paymentIntent?.status === 'succeeded') {
      await vendorApi.post(`/vendor/featured/${applicationId}/confirm-payment`, { durationDays: 30 });
      onSuccess();
    }
    setPaying(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4 mt-4">
      <div className="p-4 rounded-xl" style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={paying || !stripe}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
        style={{ background: '#cf3232' }}>
        {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        {paying ? 'Processing...' : `Pay ${formatCurrency(amount / 100)}`}
      </button>
    </form>
  );
}

const POSITIONS = [
  { value: 'homepage_hero',      label: 'Homepage Hero',        desc: 'Top banner on homepage — maximum visibility', approxPerDay: 5 },
  { value: 'homepage_featured',  label: 'Homepage Featured',    desc: 'Featured section on homepage', approxPerDay: 2 },
  { value: 'category_top',       label: 'Category Page Top',    desc: 'Top of relevant category listing pages', approxPerDay: 1.5 },
  { value: 'search_top',         label: 'Search Results Top',   desc: 'Top of search results pages', approxPerDay: 1.5 },
  { value: 'product_sidebar',    label: 'Product Page Sidebar', desc: 'Sidebar on product detail pages', approxPerDay: 0.75 },
];

export default function VendorFeaturedPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [vendorNote, setVendorNote] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [payingFor, setPayingFor] = useState<any>(null); // { id, clientSecret, amount }

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appRes, prodRes] = await Promise.all([
        vendorApi.get('/vendor/featured'),
        vendorApi.get('/vendor/products?status=active&limit=100'),
      ]);
      setApplications(appRes.data.applications || []);
      setProducts(prodRes.data.products || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedPosition) return;
    setApplying(true); setApplyMsg('');
    try {
      await vendorApi.post('/vendor/featured/apply', {
        productId: selectedProduct,
        position: selectedPosition,
        durationDays: parseInt(durationDays) || 30,
        vendorNote,
      });
      setApplyMsg('✓ Application submitted! Admin will review and set the fee.');
      setSelectedProduct(''); setSelectedPosition(''); setDurationDays('30'); setVendorNote('');
      fetchAll();
    } catch (err: any) {
      setApplyMsg(`✗ ${err.response?.data?.message || 'Failed'}`);
    } finally { setApplying(false); }
  };

  const initPay = async (app: any) => {
    try {
      const { data } = await vendorApi.post(`/vendor/featured/${app._id}/pay`);
      setPayingFor({ id: app._id, clientSecret: data.clientSecret, amount: data.amount });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem' };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6" style={{ color: '#cf3232' }} /> Featured Products
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Get your products featured on the homepage for maximum visibility</p>
      </div>

      {/* How it works */}
      <div style={CARD}>
        <p className="font-black text-gray-800 mb-3">How it works</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Apply', desc: 'Select a product and submit your application' },
            { step: '2', label: 'Admin Reviews', desc: 'Admin reviews and sets the featuring fee' },
            { step: '3', label: 'Pay', desc: 'Pay the fee to activate your featured listing' },
            { step: '4', label: 'Go Live', desc: 'Your product appears on the homepage for 30 days' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="text-center p-3 rounded-xl" style={{ background: '#fafafa' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm mx-auto mb-2" style={{ background: '#cf3232' }}>{step}</div>
              <p className="text-sm font-black text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Apply form */}
      <div style={CARD}>
        <p className="font-black text-gray-800 mb-4">Apply for Featured Listing</p>
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Product</label>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required
              className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: '#e5e7eb', background: '#fff' }}>
              <option value="">Choose an active product...</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Select Ad Position</label>
            <div className="space-y-2">
              {POSITIONS.map(pos => (
                <label key={pos.value}
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: selectedPosition === pos.value ? '2px solid #cf3232' : '1.5px solid #e5e7eb',
                    background: selectedPosition === pos.value ? '#fff1f2' : '#fff',
                  }}>
                  <input type="radio" name="position" value={pos.value} checked={selectedPosition === pos.value}
                    onChange={() => setSelectedPosition(pos.value)} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-gray-800">{pos.label}</p>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color: '#cf3232' }}>~${pos.approxPerDay}/day</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{pos.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Why should this be featured? (optional)</label>
            <textarea value={vendorNote} onChange={e => setVendorNote(e.target.value)}
              placeholder="Tell admin why this product deserves to be featured..."
              rows={2} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm outline-none resize-none"
              style={{ borderColor: '#e5e7eb' }} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration (days)</label>
            <div className="mt-1 flex gap-2 flex-wrap">
              {['7','14','30','60','90'].map(d => (
                <button key={d} type="button" onClick={() => setDurationDays(d)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: durationDays === d ? '#cf3232' : '#f3f4f6',
                    color: durationDays === d ? '#fff' : '#374151',
                  }}>
                  {d} days
                </button>
              ))}
              <input type="number" min="1" max="365" value={durationDays}
                onChange={e => setDurationDays(e.target.value)}
                placeholder="Custom"
                className="w-24 px-3 py-2 rounded-xl text-sm border outline-none text-center"
                style={{ borderColor: '#e5e7eb' }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Your product will be featured for {durationDays} days after payment</p>
          </div>

          {/* Estimated cost */}
          {selectedPosition && durationDays && (() => {
            const pos = POSITIONS.find(p => p.value === selectedPosition);
            if (!pos) return null;
            const days = parseInt(durationDays) || 30;
            const low = Math.round(pos.approxPerDay * days * 0.8);
            const high = Math.round(pos.approxPerDay * days * 1.2);
            return (
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
                <span className="text-lg flex-shrink-0">💡</span>
                <div>
                  <p className="text-sm font-black text-yellow-800">Estimated Cost</p>
                  <p className="text-sm text-yellow-700 mt-0.5">
                    Approx <strong>${low} – ${high}</strong> for {days} days at <strong>{pos.label}</strong>
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    ~${pos.approxPerDay}/day · Final price set by admin after review
                  </p>
                </div>
              </div>
            );
          })()}
          <button type="submit" disabled={applying || !selectedProduct || !selectedPosition}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: '#cf3232' }}>
            {applying && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Application
          </button>
          {applyMsg && <p className="text-sm font-medium" style={{ color: applyMsg.startsWith('✓') ? '#059669' : '#dc2626' }}>{applyMsg}</p>}
        </form>
      </div>

      {/* Applications list */}
      <div style={CARD}>
        <p className="font-black text-gray-800 mb-4">My Applications</p>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const st = STATUS_STYLE[app.status] || STATUS_STYLE.pending;
              return (
                <div key={app._id} className="p-4 rounded-xl" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                      {app.product?.images?.[0]
                        ? <img src={app.product.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-800 text-sm">{app.product?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Applied {formatDate(app.createdAt)}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#374151' }}>
                          📍 {app.position?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          🗓 {app.durationDays || 30} days
                        </span>
                        <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {app.feeCents > 0 && <p className="text-sm font-black" style={{ color: '#cf3232' }}>{formatCurrency(app.feeCents / 100)}</p>}
                      {app.expiresAt && app.status === 'active' && <p className="text-xs text-gray-400 mt-0.5">Expires {formatDate(app.expiresAt)}</p>}
                    </div>
                  </div>

                  {app.feeNote && <p className="text-xs text-blue-700 mt-2 p-2 rounded-lg" style={{ background: '#dbeafe' }}>Admin note: {app.feeNote}</p>}
                  {app.rejectionReason && <p className="text-xs text-red-700 mt-2 p-2 rounded-lg" style={{ background: '#fee2e2' }}>Rejection reason: {app.rejectionReason}</p>}

                  {app.status === 'approved' && !app.paid && (
                    payingFor?.id === app._id ? (
                      paySuccess ? (
                        <div className="mt-3 flex items-center gap-3 p-4 rounded-xl" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-black text-green-800">Payment Successful!</p>
                            <p className="text-xs text-green-700 mt-0.5">Your product is now featured for {app.durationDays || 30} days. Admin has been notified.</p>
                          </div>
                        </div>
                      ) : (
                        <Elements stripe={stripePromise} options={{ clientSecret: payingFor.clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#cf3232' } } }}>
                          <PayForm applicationId={app._id} amount={payingFor.amount} onSuccess={() => { setPaySuccess(true); fetchAll(); }} />
                        </Elements>
                      )
                    ) : (
                      <button onClick={() => { setPaySuccess(false); initPay(app); }}
                        className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                        style={{ background: '#cf3232' }}>
                        <Lock className="w-3.5 h-3.5" /> Pay {formatCurrency(app.feeCents / 100)} — Go Live for {app.durationDays || 30} days
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
