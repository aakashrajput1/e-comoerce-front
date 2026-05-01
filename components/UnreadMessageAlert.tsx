'use client';
/**
 * UnreadMessageAlert
 * - Polls for unread messages every 30s
 * - If unread > 0 AND user hasn't interacted for 20 min → shows a toast banner
 * - Clicking the banner navigates to the chat page
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';

interface FetchSource {
  /** fetch function returning { data: { conversations: any[] } } */
  fetch: () => Promise<any>;
  /** field name for unread count on each conversation */
  unreadField: string;
  /** label shown in the banner e.g. "buyers", "admin" */
  label: string;
  /** chat path to navigate to */
  chatPath: string;
}

interface Props {
  sources: FetchSource[];
  color?: string;
}

const IDLE_MS = 20 * 60 * 1000; // 20 minutes

export default function UnreadMessageAlert({ sources, color = '#cf3232' }: Props) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [show, setShow] = useState(false);
  const [primaryPath, setPrimaryPath] = useState('');
  const lastActivityRef = useRef<number>(Date.now());
  const shownAtTotalRef = useRef<number>(0);

  // Track user activity
  useEffect(() => {
    const bump = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('click', bump);
    window.addEventListener('touchstart', bump);
    return () => {
      window.removeEventListener('mousemove', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('click', bump);
      window.removeEventListener('touchstart', bump);
    };
  }, []);

  const checkUnread = useCallback(async () => {
    try {
      const results = await Promise.allSettled(sources.map(s => s.fetch()));
      const newCounts: Record<string, number> = {};
      let total = 0;
      let topPath = sources[0]?.chatPath || '';
      let topCount = 0;

      results.forEach((result, i) => {
        if (result.status !== 'fulfilled') return;
        const convs: any[] = result.value?.data?.conversations || [];
        const count = convs.reduce((s: number, c: any) => s + (c[sources[i].unreadField] ?? 0), 0);
        newCounts[sources[i].label] = count;
        total += count;
        if (count > topCount) { topCount = count; topPath = sources[i].chatPath; }
      });

      setCounts(newCounts);
      setPrimaryPath(topPath);

      const idleMs = Date.now() - lastActivityRef.current;
      if (total > 0 && idleMs >= IDLE_MS && shownAtTotalRef.current !== total) {
        shownAtTotalRef.current = total;
        setShow(true);
      }
    } catch { /* silent */ }
  }, [sources]);

  useEffect(() => {
    checkUnread();
    const interval = setInterval(checkUnread, 30_000);
    return () => clearInterval(interval);
  }, [checkUnread]);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (!show || total === 0) return null;

  // Build breakdown text e.g. "3 from buyers, 1 from admin"
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([label, n]) => `${n} from ${label}`);
  const breakdown = parts.join(', ');

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl cursor-pointer"
      style={{ background: color, maxWidth: 340, animation: 'slideUp 0.3s ease' }}
      onClick={() => { setShow(false); router.push(primaryPath); }}>

      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-sm">You have unread messages</p>
        <p className="text-white/80 text-xs mt-0.5 truncate">{breakdown}</p>
      </div>

      <button
        onClick={e => { e.stopPropagation(); setShow(false); }}
        className="p-1 rounded-lg hover:bg-white/20 transition flex-shrink-0">
        <X className="w-4 h-4 text-white" />
      </button>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
