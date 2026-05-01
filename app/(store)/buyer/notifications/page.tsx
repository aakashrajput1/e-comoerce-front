'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2, RefreshCw, ArrowLeft } from 'lucide-react';
import { buyerApi } from '@/lib/buyerAuth';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICON: Record<string, string> = {
  order_confirmed: '✅', order_shipped: '🚚', order_delivered: '📦',
  order_cancelled: '❌', order_refunded: '💸',
  new_order: '🛒', order_returned: '↩️', product_approved: '✅',
  product_rejected: '❌', new_review: '⭐', withdrawal_done: '💰',
  new_vendor: '🏪', pending_product: '⏳', new_contact: '✉️', new_withdrawal: '💳',
  new_message: '💬', announcement: '📢',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30)  return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function BuyerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await buyerApi.get('/buyer/notifications?limit=100');
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markRead = async (id: string) => {
    await buyerApi.patch(`/buyer/notifications/${id}/read`, {});
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await buyerApi.patch('/buyer/notifications/read-all', {});
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const remove = async (id: string, wasUnread: boolean) => {
    await buyerApi.delete(`/buyer/notifications/${id}`);
    setNotifications(n => n.filter(x => x._id !== id));
    if (wasUnread) setUnread(u => Math.max(0, u - 1));
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read) await markRead(notif._id);
    if (notif.link) {
      const currentPath = window.location.pathname;
      if (currentPath === notif.link) {
        router.replace(notif.link);
      } else {
        router.push(notif.link);
      }
    }
  };

  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900">Notifications</h1>
          <p className="text-xs text-gray-400">{unread} unread</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition">
          <RefreshCw className="w-4 h-4" />
        </button>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition"
            style={{ color: '#cf3232' }}>
            <CheckCheck className="w-4 h-4" /> All read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl bg-gray-100 w-fit">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition"
            style={filter === f ? { background: '#cf3232', color: '#fff' } : { color: '#6b7280' }}>
            {f} {f === 'unread' && unread > 0 ? `(${unread})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-300 text-sm">Loading...</div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Bell className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No notifications</p>
          </div>
        ) : (
          displayed.map((notif, i) => (
            <div key={notif._id}
              className="flex items-start gap-4 px-5 py-4 group transition-colors cursor-pointer hover:bg-[#FAEFEF]"
              style={{
                background: notif.read ? undefined : '#fdf2f4',
                borderBottom: i < displayed.length - 1 ? '1px solid #f3f4f6' : undefined,
              }}
              onClick={() => handleClick(notif)}>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: notif.read ? '#f3f4f6' : '#fce7f0' }}>
                {TYPE_ICON[notif.type] || '🔔'}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${notif.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: '#cf3232' }}>
                  {timeAgo(notif.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!notif.read && <div className="w-2 h-2 rounded-full" style={{ background: '#cf3232' }} />}
                <button
                  onClick={e => { e.stopPropagation(); remove(notif._id, !notif.read); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-300 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
