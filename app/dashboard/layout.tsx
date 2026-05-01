'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar, { MobileHeader, TopHeader } from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';
import UnreadMessageAlert from '@/components/UnreadMessageAlert';
import { adminApi } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) router.push('/bz-admin-x7k');
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAEFEF' }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#cf3232' }} />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FAEFEF' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader admin={admin} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
      <UnreadMessageAlert
        sources={[
          { fetch: () => adminApi.get('/admin/chat/conversations'), unreadField: 'adminUnread', label: 'users', chatPath: '/dashboard/chat' },
        ]}
      />
    </div>
  );
}
