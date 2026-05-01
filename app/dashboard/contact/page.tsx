'use client';
import { useEffect, useState } from 'react';
import { adminApi as api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Mail, RefreshCw, Trash2, Send, Loader2, CheckCircle,
  Clock, MessageCircle, Eye, ChevronDown, ChevronUp, Search,
} from 'lucide-react';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  unread:  { bg: '#fef9c3', color: '#854d0e', label: 'Unread' },
  read:    { bg: '#f3f4f6', color: '#4b5563', label: 'Read' },
  replied: { bg: '#d1fae5', color: '#065f46', label: 'Replied' },
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/contact', {
        params: { status: filter || undefined, page, limit: 20 },
      });
      setMessages(data.messages || []);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, [filter, page]);

  const markRead = async (id: string) => {
    await api.patch(`/admin/contact/${id}/read`);
    setMessages(m => m.map(msg => msg._id === id ? { ...msg, status: 'read' } : msg));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const sendReply = async (id: string) => {
    const reply = replyMap[id]?.trim();
    if (!reply) return;
    setSendingId(id);
    try {
      await api.post(`/admin/contact/${id}/reply`, { replyMessage: reply });
      setMessages(m => m.map(msg => msg._id === id ? { ...msg, status: 'replied', replyMessage: reply } : msg));
      setReplyMap(r => ({ ...r, [id]: '' }));
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to send reply'); }
    finally { setSendingId(null); }
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await api.delete(`/admin/contact/${id}`);
    setMessages(m => m.filter(msg => msg._id !== id));
  };

  const filtered = search
    ? messages.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase())
      )
    : messages;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Contact Messages
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#cf3232' }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total messages</p>
        </div>
        <button onClick={fetchMessages} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
          {[
            { label: 'All', value: '' },
            { label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`, value: 'unread' },
            { label: 'Read', value: 'read' },
            { label: 'Replied', value: 'replied' },
          ].map(({ label, value }) => (
            <button key={value} onClick={() => { setFilter(value); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition"
              style={{ background: filter === value ? '#cf3232' : 'transparent', color: filter === value ? '#fff' : '#6b7280' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border: '1px solid #e5e7eb' }}>
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-600">No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => {
            const s = STATUS_STYLE[msg.status] || STATUS_STYLE.read;
            const isOpen = expanded === msg._id;

            return (
              <div key={msg._id} className="bg-white rounded-2xl overflow-hidden shadow-sm"
                style={{ border: msg.status === 'unread' ? '1.5px solid #fde68a' : '1px solid #e5e7eb' }}>

                {/* Row header */}
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-[#FAEFEF] transition"
                  onClick={async () => {
                    if (!isOpen && msg.status === 'unread') await markRead(msg._id);
                    setExpanded(isOpen ? null : msg._id);
                  }}>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: '#cf3232' }}>
                    {msg.name?.[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{msg.name}</span>
                      <span className="text-xs text-gray-400">{msg.email}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{msg.subject}</p>
                    {!isOpen && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); deleteMsg(msg._id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-4 pb-5 space-y-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                    {/* Full message */}
                    <div className="pt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</p>
                      <div className="p-4 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                        style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
                        {msg.message}
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {msg.email}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(msg.createdAt)}</span>
                      {msg.status === 'replied' && msg.repliedAt && (
                        <span className="flex items-center gap-1 font-semibold" style={{ color: '#059669' }}>
                          <CheckCircle className="w-3.5 h-3.5" /> Replied {formatDate(msg.repliedAt)}
                        </span>
                      )}
                    </div>

                    {/* Previous reply */}
                    {msg.replyMessage && (
                      <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <p className="text-xs font-bold text-green-700 mb-1">
                          Your reply {msg.repliedBy?.name ? `— ${msg.repliedBy.name}` : ''}
                        </p>
                        <p className="text-sm text-green-800 whitespace-pre-line">{msg.replyMessage}</p>
                      </div>
                    )}

                    {/* Reply form */}
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        {msg.status === 'replied' ? 'Send Another Reply' : 'Reply to this message'}
                      </p>
                      <div className="flex gap-3">
                        <textarea
                          value={replyMap[msg._id] || ''}
                          onChange={e => setReplyMap(r => ({ ...r, [msg._id]: e.target.value }))}
                          placeholder={`Reply to ${msg.name}...`}
                          rows={3}
                          className="flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                          style={{ borderColor: '#e5e7eb' }}
                          onFocus={e => (e.target.style.borderColor = '#cf3232')}
                          onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                        />
                        <button
                          onClick={() => sendReply(msg._id)}
                          disabled={sendingId === msg._id || !replyMap[msg._id]?.trim()}
                          className="px-5 py-2 rounded-xl font-bold text-sm text-white flex items-center gap-2 self-end disabled:opacity-50"
                          style={{ background: '#cf3232' }}>
                          {sendingId === msg._id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Send className="w-4 h-4" />}
                          Send
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Reply will be sent to <strong>{msg.email}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-bold transition"
              style={{ background: page === p ? '#cf3232' : '#f3f4f6', color: page === p ? '#fff' : '#374151' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
