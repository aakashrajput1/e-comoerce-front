'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface Props {
  apiGet:    (url: string) => Promise<any>;
  apiPatch:  (url: string) => Promise<any>;
  apiDelete: (url: string) => Promise<any>;
  basePath: string;
  iconColor?: string;
  /** localStorage key for the auth token e.g. 'vendor_token' */
  tokenKey?: string;
}

// ── Time-ago helper ───────────────────────────────────────────────────────────
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

const TYPE_ICON: Record<string, string> = {
  order_confirmed: '✅', order_shipped: '🚚', order_delivered: '📦',
  order_cancelled: '❌', order_refunded: '💸',
  new_order: '🛒', order_returned: '↩️', product_approved: '✅',
  product_rejected: '❌', new_review: '⭐', withdrawal_done: '💰',
  new_vendor: '🏪', pending_product: '⏳', new_contact: '✉️', new_withdrawal: '💳',
  new_message: '💬', announcement: '📢',
};

// ── Derive "show all" route from basePath ─────────────────────────────────────
function allNotificationsPath(basePath: string): string {
  if (basePath === '/admin')  return '/dashboard/notifications';
  if (basePath === '/buyer')  return '/buyer/notifications';
  if (basePath === '/vendor') return '/vendor/notifications';
  return '/notifications';
}

export default function NotificationBell({ apiGet, apiPatch, apiDelete, basePath, iconColor = '#fff', tokenKey }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const socketAdminRef = useRef<Socket | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiGet(`${basePath}/notifications?limit=20`);
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch { /* silent */ }
  }, [apiGet, basePath]);

  // Only show latest 4 in popup
  const previewNotifications = notifications.slice(0, 4);

  // ── Poll every 10s ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNotifications]);

  // ── Real-time: connect to chat socket and refresh bell on new message ─────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const resolvedKey = tokenKey || (
      basePath === '/vendor' ? 'vendor_token' :
      basePath === '/buyer'  ? 'buyer_token'  : 'admin_token'
    );
    const token = localStorage.getItem(resolvedKey);
    if (!token) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    // Main chat socket (buyer↔vendor)
    if (basePath === '/vendor' || basePath === '/buyer') {
      const s = io(SOCKET_URL, { auth: { token }, reconnection: true });
      socketRef.current = s;
      s.on('new_message', () => fetchNotifications());
      // Real-time notification push
      s.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev.filter(n => n._id !== notif._id)]);
        setUnread(u => u + 1);
      });
      s.on('connect_error', () => {});
    }

    // Admin participant socket (vendor/buyer receiving admin msgs)
    if (basePath === '/vendor' || basePath === '/buyer') {
      const sa = io(`${SOCKET_URL}/admin-participant-chat`, { auth: { token }, reconnection: true });
      socketAdminRef.current = sa;
      sa.on('admin_message', () => fetchNotifications());
      sa.on('connect_error', () => {});
    }

    // Admin chat socket
    if (basePath === '/admin') {
      const sa = io(`${SOCKET_URL}/admin-chat`, { auth: { token }, reconnection: true });
      socketAdminRef.current = sa;
      sa.on('admin_new_message', () => fetchNotifications());
      // Real-time notification push for admin
      sa.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev.filter(n => n._id !== notif._id)]);
        setUnread(u => u + 1);
      });
      sa.on('connect_error', () => {});
    }

    return () => {
      socketRef.current?.disconnect();
      socketAdminRef.current?.disconnect();
    };
  }, [basePath, tokenKey, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openPanel = async () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = 320;
      // Position below button, aligned to right edge, but keep within viewport
      const left = Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 8);
      setPanelPos({ top: rect.bottom + 8, left: Math.max(8, left) });
    }
    setOpen(o => !o);
    if (!open) { setLoading(true); await fetchNotifications(); setLoading(false); }
  };

  const markRead = async (id: string) => {
    await apiPatch(`${basePath}/notifications/${id}/read`);
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await apiPatch(`${basePath}/notifications/read-all`);
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const remove = async (id: string, wasUnread: boolean) => {
    await apiDelete(`${basePath}/notifications/${id}`);
    setNotifications(n => n.filter(x => x._id !== id));
    if (wasUnread) setUnread(u => Math.max(0, u - 1));
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read) await markRead(notif._id);
    if (notif.link) {
      setOpen(false);
      // If already on the same page, force a refresh via router.replace to remount
      const currentPath = window.location.pathname;
      if (currentPath === notif.link) {
        router.replace(notif.link);
      } else {
        router.push(notif.link);
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button ref={buttonRef} onClick={openPanel}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-white/10"
        aria-label="Notifications">
        <Bell className="w-5 h-5" style={{ color: iconColor }} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-xs font-black text-white flex items-center justify-center"
            style={{ background: '#ef4444', fontSize: 10 }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Panel — fixed so it escapes sidebar overflow:hidden */}
      {open && (
        <div
          ref={panelRef}
          className="fixed w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ border: '1px solid #e5e7eb', top: panelPos.top, left: panelPos.left, zIndex: 9999 }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: '#cf3232' }} />
              <span className="font-black text-gray-900 text-sm">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#cf3232' }}>
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} title="Mark all read"
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                  style={{ color: '#cf3232' }}>
                  <CheckCheck className="w-3.5 h-3.5" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-300 text-sm">Loading...</div>
            ) : previewNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Bell className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              previewNotifications.map(notif => (
                <div key={notif._id}
                  className="flex items-start gap-3 px-4 py-3 group transition-colors cursor-pointer"
                  style={{
                    background: notif.read ? '#fff' : '#fdf2f4',
                    borderBottom: '1px solid #f9fafb',
                  }}
                  onClick={() => handleClick(notif)}>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: notif.read ? '#f3f4f6' : '#fce7f0' }}>
                    {TYPE_ICON[notif.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-xs mt-1 font-semibold" style={{ color: '#cf3232' }}>
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot + delete */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full mt-1" style={{ background: '#cf3232' }} />
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); remove(notif._id, !notif.read); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-300 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 text-center" style={{ borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={() => { setOpen(false); router.push(allNotificationsPath(basePath)); }}
              className="w-full text-xs font-bold py-1.5 rounded-lg hover:bg-[#FAEFEF] transition"
              style={{ color: '#cf3232' }}>
              Show all notifications {notifications.length > 0 && `(${notifications.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}