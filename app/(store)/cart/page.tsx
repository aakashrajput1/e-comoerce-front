'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ChevronRight, LogIn, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getCart, saveCart, CartItem } from '@/lib/cart';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const loadCart = () => {
    setCart(getCart());
    setIsLoggedIn(!!localStorage.getItem('buyer_token'));
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const updateQty = (productId: string, delta: number) => {
    const updated = cart.map(item =>
      item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(updated);
    saveCart(updated);
  };

  const remove = (productId: string) => {
    const updated = cart.filter(i => i.productId !== productId);
    setCart(updated);
    saveCart(updated);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
      <h2 className="text-xl font-black text-gray-700">Your cart is empty</h2>
      <p className="text-sm text-gray-400 mt-2 mb-6">Browse products and add them to your cart</p>
      <Link href="/products" className="px-6 py-3 rounded-xl font-bold text-sm text-white inline-block" style={{ background: '#cf3232' }}>
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Cart ({totalItems} items)</span>
      </div>

      {/* Guest notice */}
      {!isLoggedIn && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
          <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">You're shopping as a guest</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              <Link href="/buyer/login" className="font-bold underline">Sign in</Link> or <Link href="/buyer/register" className="font-bold underline">create an account</Link> to save your cart and checkout. Your cart items will be saved automatically after login.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.productId} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ border: '1px solid #e5e7eb' }}>
              <Link href={`/product/${item.productId}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#FAEFEF]" style={{ border: '1px solid #e5e7eb' }}>
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productId}`} className="text-sm font-semibold text-gray-800 hover:underline line-clamp-2">{item.name}</Link>
                <p className="text-sm font-black text-gray-900 mt-1">{formatCurrency(item.price)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Subtotal: {formatCurrency(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                  <button onClick={() => updateQty(item.productId, -1)} className="px-2.5 py-2 hover:bg-[#FAEFEF] transition-colors">
                    <Minus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="px-3 py-2 text-sm font-bold text-gray-800 min-w-[2.5rem] text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="px-2.5 py-2 hover:bg-[#FAEFEF] transition-colors">
                    <Plus className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
                <button onClick={() => remove(item.productId)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link href="/products" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 mt-2">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e5e7eb' }}>
            <h2 className="font-black text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#fef9c3', color: '#854d0e' }}>
                  Add {formatCurrency(50 - subtotal)} more for free shipping!
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 text-base pt-3" style={{ borderTop: '1px solid #f3f4f6' }}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
                Proceed to Checkout
              </button>
            ) : (
              <div className="mt-5 space-y-2">
                <Link href="/buyer/login"
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: '#cf3232', display: 'flex' }}>
                  <LogIn className="w-4 h-4" /> Login to Checkout
                </Link>
                <Link href="/buyer/register"
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: '#FAEFEF', color: '#374151', border: '1px solid #e5e7eb', display: 'flex' }}>
                  Create Account
                </Link>
                <p className="text-xs text-gray-400 text-center">Your cart will be saved after login</p>
              </div>
            )}
          </div>

          {/* Promo code */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #e5e7eb' }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">Promo Code</p>
            <div className="flex gap-2">
              <input placeholder="Enter code" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #e5e7eb' }} />
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#cf3232' }}>Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
