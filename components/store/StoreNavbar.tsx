'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, User, Store, LogIn, UserPlus, X, LogOut, Package, MessageSquare } from 'lucide-react';
import { useBuyerAuth, buyerApi } from '@/lib/buyerAuth';
import NotificationBell from '@/components/NotificationBell';

const NO_CATEGORIES = [
  '/vendor/login', '/vendor/register',
  '/buyer/login', '/buyer/register',
  '/buyer/forgot-password', '/buyer/reset-password',
  '/vendor/forgot-password', '/vendor/reset-password',
  '/forgot-password', '/reset-password',
];

export default function StoreNavbar() {
  const { buyer, logout } = useBuyerAuth();
  const pathname = usePathname();
  const showCategories = !NO_CATEGORIES.some(r => pathname.startsWith(r));
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ background: '#cf3232' }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5" style={{ color: '#cf3232' }} />
              </div>
              <span className="text-white font-black text-xl hidden sm:block">Bazaar</span>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden shadow-sm">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-800"
                style={{ background: '#fff' }} />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="px-3 bg-white text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button type="submit" className="px-5 py-2.5 flex items-center justify-center" style={{ background: '#fbbf24' }}>
                <Search className="w-5 h-5 text-gray-800" />
              </button>
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification bell — only for logged-in buyers */}
            {buyer && (
              <NotificationBell
                apiGet={url => buyerApi.get(url)}
                apiPatch={url => buyerApi.patch(url, {})}
                apiDelete={url => buyerApi.delete(url)}
                basePath="/buyer"
                iconColor="#fff"
              />
            )}
            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              {buyer ? (
                // Logged in — show avatar + name
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {buyer.firstName?.[0]}{buyer.lastName?.[0]}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">{buyer.firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                // Not logged in
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">Login</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
              )}

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                  style={{ border: '1px solid #e5e7eb' }}>
                  {buyer ? (
                    // Logged in dropdown
                    <>
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <p className="text-sm font-black text-gray-900">{buyer.firstName} {buyer.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{buyer.email}</p>
                      </div>
                      <Link href="/buyer/account" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAEFEF] transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe' }}>
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">My Account</p>
                      </Link>
                      <Link href="/buyer/account" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAEFEF] transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#d1fae5' }}>
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">My Orders</p>
                      </Link>
                      <Link href="/buyer/chat" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAEFEF] transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FAEFEF' }}>
                          <MessageSquare className="w-4 h-4" style={{ color: '#cf3232' }} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Messages</p>
                      </Link>
                      <div style={{ borderTop: '1px solid #f3f4f6' }}>
                        <button onClick={() => { logout(); setShowDropdown(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50">
                            <LogOut className="w-4 h-4 text-red-500" />
                          </div>
                          <p className="text-sm font-semibold text-red-500">Sign Out</p>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Not logged in dropdown
                    <>
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Buyer</p>
                      </div>
                      <Link href="/buyer/login" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAEFEF] transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe' }}>
                          <LogIn className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Sign In</p>
                          <p className="text-xs text-gray-400">Access your account</p>
                        </div>
                      </Link>
                      <Link href="/buyer/register" onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAEFEF] transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#d1fae5' }}>
                          <UserPlus className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Register</p>
                          <p className="text-xs text-gray-400">Create new account</p>
                        </div>
                      </Link>
                      <div style={{ borderTop: '1px solid #f3f4f6' }}>
                        <Link href="/vendor/login" onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAEFEF] transition-colors">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FAEFEF' }}>
                            <Store className="w-4 h-4" style={{ color: '#cf3232' }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Vendor Login</p>
                            <p className="text-xs text-gray-400">Manage your store</p>
                          </div>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Become a Vendor */}
            <Link href="/vendor/register"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
              style={{ background: '#fbbf24', color: '#111827' }}>
              <Store className="w-4 h-4" />
              Become a Vendor
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#fbbf24', color: '#111827' }}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Category nav */}
      {showCategories && (
      <div style={{ background: '#7f0e2e', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { label: 'All', href: '/products' },
              { label: 'Electronics', href: '/category/electronics' },
              { label: 'Fashion', href: '/category/fashion' },
              { label: 'Home & Living', href: '/category/home-living' },
              { label: 'Beauty', href: '/category/beauty-personal-care' },
              { label: 'Sports', href: '/category/sports-outdoors' },
              { label: 'Books', href: '/category/books-stationery' },
              { label: 'Toys', href: '/category/toys-games' },
              { label: 'Food', href: '/category/food-grocery' },
              { label: 'Automotive', href: '/category/automotive' },
              { label: 'Health', href: '/category/health-wellness' },
              { label: 'Pets', href: '/category/pets' },
              { label: 'Baby & Kids', href: '/category/baby-kids' },
            ].map((cat) => (
              <Link key={cat.href} href={cat.href} prefetch={true}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      )}
    </header>
  );
}
