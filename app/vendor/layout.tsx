'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useVendorAuth } from '@/lib/vendorAuth';
import {
  LayoutDashboard, Package, ShoppingCart, Wallet, MessageSquare,
  Settings, LogOut, Store, ChevronRight, Star, BarChart2, Loader2, Menu, X, FileDown, HelpCircle, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/NotificationBell';
import UnreadMessageAlert from '@/components/UnreadMessageAlert';
import { vendorApi } from '@/lib/vendorAuth';

const NAV = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/products',  label: 'Products',  icon: Package },
  { href: '/vendor/orders',    label: 'Orders',    icon: ShoppingCart },
  { href: '/vendor/wallet',    label: 'Wallet',    icon: Wallet },
  { href: '/vendor/reviews',   label: 'Reviews',   icon: Star },
  { href: '/vendor/featured',  label: 'Featured',  icon: Zap },
  { href: '/vendor/qa',        label: 'Q&A',       icon: HelpCircle },
  { href: '/vendor/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/vendor/reports',   label: 'Reports',   icon: FileDown },
  { href: '/vendor/chat',      label: 'Messages',  icon: MessageSquare },
  { href: '/vendor/settings',  label: 'Settings',  icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { vendor, logout } = useVendorAuth();
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 h-full flex flex-col overflow-hidden bg-white" style={{ borderRight: '1px solid #e5e7eb' }}>
      <div className="flex-shrink-0 px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#cf3232' }}>
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 truncate max-w-[100px]">{vendor?.businessName}</p>
            <p className="text-xs text-gray-400">Vendor Portal</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {vendor?.status !== 'approved' && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-semibold"
          style={{ background: vendor?.status === 'pending' ? '#fef9c3' : '#fee2e2', color: vendor?.status === 'pending' ? '#854d0e' : '#991b1b' }}>
          Account {vendor?.status} — {vendor?.status === 'pending' ? 'Awaiting approval' : 'Contact support'}
        </div>
      )}

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} prefetch={true} onClick={onClose}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-rose-50 text-rose-800' : 'text-gray-600 hover:bg-[#FAEFEF] hover:text-gray-900')}>
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-rose-700' : 'text-gray-400')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-rose-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FAEFEF]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: '#cf3232' }}>
            {vendor?.businessName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{vendor?.ownerName}</p>
            <p className="text-xs text-gray-400 truncate">{vendor?.email}</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { vendor, loading, logout } = useVendorAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !vendor) router.push('/vendor/login');
  }, [vendor, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAEFEF' }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#cf3232' }} />
    </div>
  );

  if (!vendor) return null;

  // Pending / suspended vendors see a blocking screen
  if (vendor.status !== 'approved') {
    const isPending = vendor.status === 'pending';
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAEFEF' }}>
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: isPending ? '#fef9c3' : '#fee2e2' }}>
            <Store className="w-8 h-8" style={{ color: isPending ? '#854d0e' : '#991b1b' }} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {isPending ? 'Account Pending Approval' : `Account ${vendor.status}`}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isPending
              ? 'Your vendor account is under review. You\'ll receive an email once approved by our team.'
              : 'Your account has been suspended or rejected. Please contact support for assistance.'}
          </p>
          <div className="bg-white rounded-2xl p-5 text-left mb-6" style={{ border: '1.5px solid #e5e7eb' }}>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Account Details</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Business</span>
                <span className="font-semibold text-gray-800">{vendor.businessName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Owner</span>
                <span className="font-semibold text-gray-800">{vendor.ownerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold text-gray-800">{vendor.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-bold capitalize px-2 py-0.5 rounded-full text-xs"
                  style={{ background: isPending ? '#fef9c3' : '#fee2e2', color: isPending ? '#854d0e' : '#991b1b' }}>
                  {vendor.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={logout}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#cf3232' }}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAEFEF' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header — desktop + mobile */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white sticky top-0 z-30"
          style={{ borderBottom: '1px solid #e5e7eb' }}>
          {/* Mobile: logo + business name */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#cf3232' }}>
              <Store className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-sm text-gray-900 truncate max-w-[160px]">{vendor.businessName}</p>
          </div>
          {/* Desktop: greeting */}
          <div className="hidden md:block">
            <p className="text-sm font-black text-gray-800">Welcome back, {vendor.ownerName?.split(' ')[0]} 👋</p>
            <p className="text-xs text-gray-400">{vendor.businessName}</p>
          </div>
          {/* Right: bell + mobile menu */}
          <div className="flex items-center gap-2">
            <NotificationBell
              apiGet={url => vendorApi.get(url)}
              apiPatch={url => vendorApi.patch(url, {})}
              apiDelete={url => vendorApi.delete(url)}
              basePath="/vendor"
              iconColor="#cf3232"
            />
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full">
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1200px] mx-auto">{children}</div>
        </main>
      </div>

      <UnreadMessageAlert
        sources={[
          { fetch: () => vendorApi.get('/vendor/chat/conversations'),       unreadField: 'vendorUnread',      label: 'buyers', chatPath: '/vendor/chat' },
          { fetch: () => vendorApi.get('/vendor/chat/admin-conversations'), unreadField: 'participantUnread', label: 'admin',  chatPath: '/vendor/chat' },
        ]}
      />
    </div>
  );
}
