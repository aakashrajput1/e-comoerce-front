'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Store, Users, Package, ShoppingCart,
  Star, Wallet, MessageSquare, Shield, LogOut, ShoppingBag,
  ChevronRight, Tag, Menu, X, Mail, Bell, Zap, Settings, BarChart3,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const navItems = [
  { href: '/dashboard',            label: 'Dashboard',  icon: LayoutDashboard, permission: 'reports:read' },
  { href: '/dashboard/vendors',    label: 'Vendors',    icon: Store,           permission: 'vendors:read' },
  { href: '/dashboard/buyers',     label: 'Buyers',     icon: Users,           permission: 'buyers:read' },
  { href: '/dashboard/products',   label: 'Products',   icon: Package,         permission: 'products:read' },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag,             permission: 'products:read' },
  { href: '/dashboard/orders',     label: 'Orders',     icon: ShoppingCart,    permission: 'orders:read' },
  { href: '/dashboard/reviews',    label: 'Reviews',    icon: Star,            permission: 'reviews:read' },
  { href: '/dashboard/featured',   label: 'Featured',   icon: Zap,             permission: 'products:read' },
  { href: '/dashboard/wallet',     label: 'Revenue',    icon: Wallet,          permission: 'wallet:read' },
  { href: '/dashboard/analytics',  label: 'Analytics',  icon: BarChart3,        permission: 'reports:read' },
  { href: '/dashboard/chat',       label: 'Chat',       icon: MessageSquare,   permission: 'chat:read' },
  { href: '/dashboard/contact',    label: 'Contact',    icon: Mail,            permission: 'reports:read' },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: Bell,            permission: 'reports:read' },
  { href: '/dashboard/admins',     label: 'Admins',     icon: Shield,          permission: 'admins:read' },
  { href: '/dashboard/settings',   label: 'Settings',   icon: Settings,        permission: 'admins:read' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { admin, logout, hasPermission } = useAuth();
  const [unreadContact, setUnreadContact] = useState(0);

  useEffect(() => {
    if (!hasPermission('reports:read')) return;
    import('@/lib/api').then(({ adminApi }) => {
      adminApi.get('/admin/contact?status=unread&limit=1')
        .then(r => setUnreadContact(r.data.unreadCount || 0))
        .catch(() => {});
    });
  }, [pathname]);

  return (
    <aside className="w-60 flex-shrink-0 h-full flex flex-col overflow-hidden bg-white"
      style={{ borderRight: '1px solid #e5e7eb' }}>

      {/* Logo */}
      <div className="flex-shrink-0 px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#cf3232' }}>
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">Marketplace</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell
            apiGet={url => import('@/lib/api').then(m => m.adminApi.get(url))}
            apiPatch={url => import('@/lib/api').then(m => m.adminApi.patch(url, {}))}
            apiDelete={url => import('@/lib/api').then(m => m.adminApi.delete(url))}
            basePath="/admin"
            iconColor="#cf3232"
          />
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!hasPermission(item.permission)) return null;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} prefetch={true}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-rose-50 text-rose-800'
                  : 'text-gray-600 hover:bg-[#FAEFEF] hover:text-gray-900'
              )}>
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-rose-700' : 'text-gray-400')} />
              <span className="flex-1">{item.label}</span>
              {item.href === '/dashboard/contact' && unreadContact > 0 && (
                <span className="w-5 h-5 rounded-full text-xs font-black text-white flex items-center justify-center flex-shrink-0"
                  style={{ background: '#cf3232' }}>
                  {unreadContact > 9 ? '9+' : unreadContact}
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 text-rose-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#FAEFEF]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: '#cf3232' }}>
            {admin?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{admin?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{admin?.role}</p>
          </div>
          <button onClick={logout} title="Logout" className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopHeader({ admin }: { admin: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white sticky top-0 z-30"
        style={{ borderBottom: '1px solid #e5e7eb' }}>
        {/* Mobile: logo */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#cf3232' }}>
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <p className="font-bold text-sm text-gray-900">Marketplace Admin</p>
        </div>
        {/* Desktop: greeting */}
        <div className="hidden md:block">
          <p className="text-sm font-black text-gray-800">Welcome back, {admin?.name?.split(' ')[0]} 👋</p>
          <p className="text-xs text-gray-400 capitalize">{admin?.role} · Admin Panel</p>
        </div>
        {/* Right: bell + mobile menu */}
        <div className="flex items-center gap-2">
          <NotificationBell
            apiGet={url => import('@/lib/api').then(m => m.adminApi.get(url))}
            apiPatch={url => import('@/lib/api').then(m => m.adminApi.patch(url, {}))}
            apiDelete={url => import('@/lib/api').then(m => m.adminApi.delete(url))}
            basePath="/admin"
            iconColor="#cf3232"
          />
          <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative h-full">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-30"
        style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#cf3232' }}>
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <p className="font-bold text-sm text-gray-900">Marketplace Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell
            apiGet={url => import('@/lib/api').then(m => m.adminApi.get(url))}
            apiPatch={url => import('@/lib/api').then(m => m.adminApi.patch(url, {}))}
            apiDelete={url => import('@/lib/api').then(m => m.adminApi.delete(url))}
            basePath="/admin"
            iconColor="#cf3232"
          />
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative h-full">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  return (
    <div className="hidden md:flex h-screen sticky top-0">
      <SidebarContent />
    </div>
  );
}
