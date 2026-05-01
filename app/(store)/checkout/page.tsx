'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBuyerAuth, buyerApi } from '@/lib/buyerAuth';
import { getCart, clearCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/utils';
import CountrySelect from '@/components/CountrySelect';
import {
  MapPin, Plus, CheckCircle, Loader2, ChevronRight, ShoppingBag,
  Home, ArrowLeft, CreditCard, Lock, Package, AlertCircle, Star,
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ step }: { step: number }) {
  const steps = [
    { label: 'Address', icon: MapPin },
    { label: 'Payment', icon: CreditCard },
    { label: 'Done', icon: CheckCircle },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map(({ label, icon: Icon }, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all"
              style={{
                background: i < step ? '#cf3232' : i === step ? '#cf3232' : '#f3f4f6',
                color: i <= step ? '#fff' : '#9ca3af',
                boxShadow: i === step ? '0 0 0 4px #fecdd322' : 'none',
              }}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className="text-xs font-semibold" style={{ color: i <= step ? '#cf3232' : '#9ca3af' }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-16 h-0.5 mb-5 mx-1 transition-all" style={{ background: i < step ? '#cf3232' : '#e5e7eb' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────────
function OrderSummary({ amount }: { amount: number }) {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-6" style={{ border: '1px solid #e5e7eb' }}>
      <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" style={{ color: '#cf3232' }} /> Order Summary
      </h3>
      <div className="space-y-3 mb-4">
        {cart.map(item => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #f3f4f6' }}>
              {item.image
                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
            </div>
            <p className="text-xs font-black text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span><span className="font-semibold text-gray-700">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Shipping</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-700'}`}>
            {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-black text-gray-900 text-base pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
          <span>Total</span>
          <span style={{ color: '#cf3232' }}>{formatCurrency(amount ? amount / 100 : subtotal + shipping)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 justify-center">
        <Lock className="w-3 h-3" /> Secured by Stripe
      </div>
    </div>
  );
}

// ─── Stripe payment form ──────────────────────────────────────────────────────
function PaymentForm({ orderId, amount, onSuccess }: { orderId: string; amount: number; onSuccess: () => void }) {
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
      confirmParams: { return_url: window.location.origin + '/checkout/complete?orderId=' + orderId },
      redirect: 'if_required',
    });

    if (confirmErr) {
      setError(confirmErr.message || 'Payment failed');
      setPaying(false);
      return;
    }

    // Payment succeeded without redirect (no 3DS needed)
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await buyerApi.post(`/buyer/orders/${orderId}/confirm`, {});
        clearCart();
        onSuccess();
      } catch {
        setError('Payment succeeded but order confirmation failed. Contact support.');
      }
    }
    setPaying(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="p-4 rounded-2xl" style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <button type="submit" disabled={paying || !stripe}
        className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)', boxShadow: '0 4px 15px #cf323240' }}>
        {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
        {paying ? 'Processing...' : `Pay ${formatCurrency(amount / 100)}`}
      </button>

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Your payment is encrypted and secure
      </p>
    </form>
  );
}

// ─── Main checkout page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { buyer, loading } = useBuyerAuth();
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=address, 1=payment, 2=done
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedAddrId, setSelectedAddrId] = useState<string>('');
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', street: '', city: '', state: '', country: '', zipCode: '' });
  const [addrSaving, setAddrSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [localCart, setLocalCart] = useState<ReturnType<typeof getCart>>([]);

  // Load localStorage cart on mount (client-side only)
  useEffect(() => {
    setLocalCart(getCart());
  }, []);

  useEffect(() => {
    if (!loading && !buyer) router.push('/buyer/login?redirect=/checkout');
  }, [buyer, loading, router]);

  useEffect(() => {
    if (!buyer) return;
    buyerApi.get('/buyer/profile').then(r => {
      setProfile(r.data.buyer);
      const def = r.data.buyer?.addresses?.find((a: any) => a.isDefault);
      if (def) setSelectedAddrId(def._id);
      else if (r.data.buyer?.addresses?.length > 0) setSelectedAddrId(r.data.buyer.addresses[0]._id);
    }).finally(() => setProfileLoading(false));
  }, [buyer]);

  const saveNewAddress = async () => {
    setAddrSaving(true);
    try {
      await buyerApi.post('/buyer/profile/address', newAddr);
      const { data } = await buyerApi.get('/buyer/profile');
      setProfile(data.buyer);
      const added = data.buyer.addresses[data.buyer.addresses.length - 1];
      setSelectedAddrId(added._id);
      setShowNewAddr(false);
      setNewAddr({ label: '', street: '', city: '', state: '', country: '', zipCode: '' });
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save address'); }
    finally { setAddrSaving(false); }
  };

  const proceedToPayment = async () => {
    setCheckoutLoading(true); setCheckoutError('');
    try {
      const cart = getCart(); // fresh read from localStorage
      if (!cart || cart.length === 0) {
        setCheckoutError('Your cart is empty. Please add items before checkout.');
        setCheckoutLoading(false);
        return;
      }

      // Sync localStorage cart → backend DB cart
      await buyerApi.delete('/buyer/cart');
      for (const item of cart) {
        await buyerApi.post('/buyer/cart/add', { productId: item.productId, quantity: item.quantity });
      }

      const { data } = await buyerApi.post('/buyer/orders/checkout', {
        shippingAddressId: selectedAddrId || undefined,
      });
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setAmount(data.amount);
      setStep(1);
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally { setCheckoutLoading(false); }
  };

  if (loading || profileLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#cf3232' }} />
    </div>
  );
  if (!buyer) return null;

  const addresses = profile?.addresses || [];
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const displayAmount = amount ? amount / 100 : subtotal + shipping;

  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => step === 0 ? router.push('/cart') : setStep(0)}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition">
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Back to Cart' : 'Back to Address'}
          </button>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-white/70" />
            <span className="text-white font-black text-lg">Secure Checkout</span>
          </div>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Steps step={step} />

        {step === 2 ? (
          /* ── Success ── */
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
              <p className="text-gray-500 text-sm mb-1">Your payment was successful.</p>
              <p className="text-gray-400 text-xs mb-6">Order ID: <span className="font-bold text-gray-600">{orderId}</span></p>
              <div className="space-y-3">
                <button onClick={() => router.push('/buyer/account')}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: '#cf3232' }}>
                  View My Orders
                </button>
                <button onClick={() => router.push('/products')}
                  className="w-full py-3 rounded-2xl font-bold text-sm"
                  style={{ background: '#f3f4f6', color: '#374151' }}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: steps */}
            <div className="lg:col-span-2">
              {step === 0 && (
                /* ── Address step ── */
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="px-6 py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: '#cf3232' }} /> Shipping Address
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">Select where you want your order delivered</p>
                  </div>

                  <div className="p-6 space-y-3">
                    {addresses.length === 0 && !showNewAddr && (
                      <div className="text-center py-8 text-gray-400">
                        <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No saved addresses. Add one below.</p>
                      </div>
                    )}

                    {addresses.map((addr: any) => (
                      <button key={addr._id} onClick={() => setSelectedAddrId(addr._id)}
                        className="w-full text-left p-4 rounded-2xl transition-all"
                        style={{
                          border: selectedAddrId === addr._id ? '2px solid #cf3232' : '1px solid #e5e7eb',
                          background: selectedAddrId === addr._id ? '#fff1f2' : '#fff',
                        }}>
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                            style={{ borderColor: selectedAddrId === addr._id ? '#cf3232' : '#d1d5db' }}>
                            {selectedAddrId === addr._id && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#cf3232' }} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800 text-sm">{addr.label || 'Address'}</span>
                              {addr.isDefault && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FAEFEF', color: '#cf3232' }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {addr.street}{addr.city ? `, ${addr.city}` : ''}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode}
                            </p>
                            {addr.country && <p className="text-xs text-gray-400 mt-0.5">{addr.country}</p>}
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Add new address */}
                    {!showNewAddr ? (
                      <button onClick={() => setShowNewAddr(true)}
                        className="w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:border-rose-300"
                        style={{ borderColor: '#e5e7eb', color: '#9ca3af' }}>
                        <Plus className="w-4 h-4" /> Add New Address
                      </button>
                    ) : (
                      <div className="p-4 rounded-2xl" style={{ background: '#fafafa', border: '1px solid #e5e7eb' }}>
                        <p className="font-bold text-gray-700 text-sm mb-3">New Address</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(['label', 'street', 'city', 'state', 'zipCode'] as const).map(f => (
                            <input key={f} placeholder={f === 'zipCode' ? 'Zip Code' : f.charAt(0).toUpperCase() + f.slice(1)}
                              value={newAddr[f]}
                              onChange={e => setNewAddr(p => ({ ...p, [f]: e.target.value }))}
                              className="border rounded-xl px-3 py-2.5 text-sm outline-none"
                              style={{ borderColor: '#e5e7eb', background: '#fff' }} />
                          ))}
                          <CountrySelect value={newAddr.country} onChange={val => setNewAddr(p => ({ ...p, country: val }))}
                            className="border rounded-xl px-3 py-2.5 text-sm outline-none"
                            style={{ borderColor: '#e5e7eb', background: '#fff', color: newAddr.country ? '#111827' : '#9ca3af' }} />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={saveNewAddress} disabled={addrSaving}
                            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white"
                            style={{ background: '#cf3232' }}>
                            {addrSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                          </button>
                          <button onClick={() => setShowNewAddr(false)}
                            className="text-sm font-bold px-4 py-2 rounded-xl"
                            style={{ background: '#f3f4f6', color: '#374151' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {checkoutError && (
                    <div className="mx-6 mb-4 flex items-start gap-2 p-3 rounded-xl text-sm"
                      style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {checkoutError}
                    </div>
                  )}

                  <div className="px-6 pb-6">
                    <button onClick={proceedToPayment} disabled={checkoutLoading}
                      className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 transition disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)', boxShadow: '0 4px 15px #cf323240' }}>
                      {checkoutLoading
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                        : <><CreditCard className="w-5 h-5" /> Continue to Payment <ChevronRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && clientSecret && (
                /* ── Payment step ── */
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                  <div className="px-6 py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5" style={{ color: '#cf3232' }} /> Payment Details
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">Your payment is secured with 256-bit SSL encryption</p>
                  </div>

                  {/* Selected address recap */}
                  {selectedAddrId && addresses.find((a: any) => a._id === selectedAddrId) && (() => {
                    const addr = addresses.find((a: any) => a._id === selectedAddrId);
                    return (
                      <div className="mx-6 mt-5 p-3 rounded-xl flex items-start gap-3"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-green-800">Delivering to: {addr.label || 'Address'}</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            {addr.street}{addr.city ? `, ${addr.city}` : ''}{addr.state ? `, ${addr.state}` : ''} {addr.zipCode}{addr.country ? `, ${addr.country}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="p-6">
                    <Elements stripe={stripePromise} options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#cf3232',
                          colorBackground: '#ffffff',
                          colorText: '#111827',
                          colorDanger: '#dc2626',
                          fontFamily: 'system-ui, sans-serif',
                          borderRadius: '12px',
                          spacingUnit: '4px',
                        },
                        rules: {
                          '.Input': { border: '1px solid #e5e7eb', boxShadow: 'none', padding: '12px' },
                          '.Input:focus': { border: '1px solid #cf3232', boxShadow: '0 0 0 3px #cf323220' },
                          '.Label': { fontWeight: '600', fontSize: '12px', color: '#6b7280' },
                          '.Tab': { border: '1px solid #e5e7eb', borderRadius: '12px' },
                          '.Tab--selected': { border: '1px solid #cf3232', color: '#cf3232' },
                        },
                      },
                    }}>
                      <PaymentForm orderId={orderId} amount={amount} onSuccess={() => setStep(2)} />
                    </Elements>
                  </div>
                </div>
              )}
            </div>

            {/* Right: order summary */}
            <div>
              <OrderSummary amount={amount} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
