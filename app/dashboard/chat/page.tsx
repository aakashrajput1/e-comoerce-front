'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { adminApi as api } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, MessageSquare, Search, Store, Users, Plus, X, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message { _id: string; senderRole: string; message: string; createdAt: string; tempId?: string; }
interface Conversation { _id: string; participantType: string; participantId: string; participant: any; lastMessage: string; lastMessageAt: string; adminUnread: number; }

function timeLabel(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr), now = new Date(), diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Avatar({ name, src, bg = '#cf3232' }: { name: string; src?: string; bg?: string }) {
  if (src) return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-sm" style={{ background: bg }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function AdminChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'vendor' | 'buyer'>('all');
  const [typing, setTyping] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<Conversation | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Per-type unread counts
  const vendorUnread = conversations.filter(c => c.participantType === 'vendor').reduce((s, c) => s + c.adminUnread, 0);
  const buyerUnread  = conversations.filter(c => c.participantType === 'buyer').reduce((s, c) => s + c.adminUnread, 0);

  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<'vendor' | 'buyer'>('vendor');
  const [newSearch, setNewSearch] = useState('');
  const [newList, setNewList] = useState<any[]>([]);
  const [newLoading, setNewLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  const setActive = (conv: Conversation | null) => { activeConvRef.current = conv; setActiveConv(conv); };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/admin-chat`, { auth: { token } });
    socketRef.current = socket;

    socket.on('admin_message_delivered', (msg: Message) => {
      setMessages(p => { if (p.find(m => m._id === msg._id)) return p; return [...p.filter(m => m.tempId !== msg.tempId), msg]; });
    });
    socket.on('admin_new_message', (msg: any) => {
      if (activeConvRef.current?._id === msg.conversationId) setMessages(p => [...p, msg]);
      setConversations(p => p.map(c => c._id === msg.conversationId ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt, adminUnread: activeConvRef.current?._id === msg.conversationId ? 0 : c.adminUnread + 1 } : c));
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    api.get('/admin/chat/conversations').then(r => setConversations(r.data.conversations || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const convId = searchParams.get('conv');
    if (!convId) return;
    api.get('/admin/chat/conversations').then(r => {
      const convs = r.data.conversations || [];
      setConversations(convs);
      const target = convs.find((c: Conversation) => c._id === convId);
      if (target) openConversation(target);
    }).catch(() => {});
  }, [searchParams]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!showNew) return;
    setNewList([]); setNewLoading(true);
    api.get(newType === 'vendor' ? '/admin/vendors' : '/admin/buyers', { params: { search: newSearch, limit: 20 } })
      .then(r => setNewList(newType === 'vendor' ? (r.data.vendors || []) : (r.data.buyers || [])))
      .catch(() => {}).finally(() => setNewLoading(false));
  }, [showNew, newType, newSearch]);

  const openConversation = async (conv: Conversation) => {
    setActive(conv); setMobileView('chat');
    const { data } = await api.get(`/admin/chat/${conv._id}/messages`);
    setMessages(data.messages || []);
    socketRef.current?.emit('join_admin_conv', { conversationId: conv._id });
    setConversations(p => p.map(c => c._id === conv._id ? { ...c, adminUnread: 0 } : c));
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConv || !socketRef.current) return;
    const tempId = `temp-${Date.now()}`;
    setMessages(p => [...p, { _id: tempId, senderRole: 'admin', message: input.trim(), createdAt: new Date().toISOString(), tempId }]);
    socketRef.current.emit('admin_send_message', { conversationId: activeConv._id, text: input.trim(), tempId });
    setInput('');
  };

  const startNewChat = async (id: string) => {
    setStarting(id);
    try {
      const { data } = await api.post('/admin/chat/start', { participantType: newType, participantId: id });
      const { data: convData } = await api.get('/admin/chat/conversations');
      const convs = convData.conversations || [];
      setConversations(convs);
      setShowNew(false); setNewSearch('');
      const full = convs.find((c: Conversation) => c._id === data.conversation._id);
      if (full) openConversation(full);
    } catch { } finally { setStarting(null); }
  };

  const filtered = conversations.filter(c => {
    const matchTab = tab === 'all' || c.participantType === tab;
    const name = c.participant ? (c.participant.businessName || `${c.participant.firstName} ${c.participant.lastName}`) : '';
    return matchTab && name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((s, c) => s + c.adminUnread, 0);

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-0 md:gap-4">

      {/* ── Sidebar ── */}
      <div className={cn(
        'w-full md:w-72 flex-shrink-0 bg-white rounded-2xl flex flex-col overflow-hidden',
        'md:flex', mobileView === 'chat' ? 'hidden' : 'flex'
      )} style={{ border: '1.5px solid #e5e7eb' }}>

        <div className="p-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="font-black text-sm text-gray-900">Conversations</p>
              {totalUnread > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#cf3232' }}>{totalUnread}</span>}
            </div>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: '#cf3232' }}>
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#FAEFEF', border: '1.5px solid #e5e7eb', color: '#111827' }} />
          </div>
          <div className="flex gap-1">
            {(['all', 'vendor', 'buyer'] as const).map(t => {
              const count = t === 'vendor' ? vendorUnread : t === 'buyer' ? buyerUnread : vendorUnread + buyerUnread;
              return (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition flex items-center justify-center gap-1"
                  style={{ background: tab === t ? '#cf3232' : '#f3f4f6', color: tab === t ? '#fff' : '#6b7280' }}>
                  {t}
                  {count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none"
                      style={{ background: tab === t ? 'rgba(255,255,255,0.3)' : '#cf3232', color: '#fff' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No conversations</p>
            </div>
          ) : filtered.map(conv => {
            const name = conv.participant?.businessName || `${conv.participant?.firstName || ''} ${conv.participant?.lastName || ''}`.trim() || 'Unknown';
            const isActive = activeConv?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => openConversation(conv)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors"
                style={{ background: isActive ? '#fff1f2' : 'transparent', borderBottom: '1px solid #f9fafb' }}>
                <div className="relative flex-shrink-0">
                  <Avatar name={name} bg={conv.participantType === 'vendor' ? '#2563eb' : '#059669'} />
                  {conv.adminUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                      style={{ background: '#cf3232' }}>{conv.adminUnread > 9 ? '9+' : conv.adminUnread}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn('text-sm truncate', conv.adminUnread > 0 ? 'font-black text-gray-900' : 'font-semibold text-gray-700')}>{name}</p>
                    <p className="text-[10px] text-gray-400 flex-shrink-0">{timeLabel(conv.lastMessageAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize', conv.participantType === 'vendor' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600')}>
                      {conv.participantType}
                    </span>
                    <p className={cn('text-xs truncate', conv.adminUnread > 0 ? 'text-gray-700 font-semibold' : 'text-gray-400')}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={cn(
        'flex-1 bg-white rounded-2xl flex flex-col overflow-hidden',
        'md:flex', mobileView === 'list' ? 'hidden' : 'flex'
      )} style={{ border: '1.5px solid #e5e7eb' }}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#FAEFEF' }}>
              <MessageSquare className="w-8 h-8" style={{ color: '#cf3232' }} />
            </div>
            <p className="font-bold text-gray-500 text-sm">Select a conversation</p>
            <p className="text-xs text-gray-400">or start a new one</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <button onClick={() => { setMobileView('list'); setActive(null); }}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0 text-sm">←</button>
              <Avatar name={activeConv.participant?.businessName || `${activeConv.participant?.firstName || ''} ${activeConv.participant?.lastName || ''}`.trim()}
                bg={activeConv.participantType === 'vendor' ? '#2563eb' : '#059669'} />
              <div className="flex-1 min-w-0">
                <button onClick={() => router.push(activeConv.participantType === 'vendor' ? `/dashboard/vendors/${activeConv.participantId}` : `/dashboard/buyers/${activeConv.participantId}`)}
                  className="flex items-center gap-1 hover:underline text-left">
                  <p className="font-black text-sm truncate" style={{ color: '#cf3232' }}>
                    {activeConv.participant?.businessName || `${activeConv.participant?.firstName || ''} ${activeConv.participant?.lastName || ''}`.trim()}
                  </p>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: '#cf3232' }} />
                </button>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize', activeConv.participantType === 'vendor' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600')}>
                  {activeConv.participantType}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              style={{ background: 'linear-gradient(180deg, #FAEFEF 0%, #fff 100%)' }}>
              {messages.map((msg, i) => {
                const isAdmin = msg.senderRole === 'admin';
                const showTime = i === 0 || new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 300000;
                return (
                  <div key={msg._id}>
                    {showTime && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] text-gray-400 px-3 py-1 rounded-full bg-gray-100">{timeLabel(msg.createdAt)}</span>
                      </div>
                    )}
                    <div className={cn('flex items-end gap-2 mb-1', isAdmin ? 'justify-end' : 'justify-start')}>
                      {!isAdmin && (
                        <Avatar name={activeConv.participant?.businessName || activeConv.participant?.firstName || '?'}
                          bg={activeConv.participantType === 'vendor' ? '#2563eb' : '#059669'} />
                      )}
                      <div className={cn('max-w-[72%] px-4 py-2.5 text-sm shadow-sm', isAdmin ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm')}
                        style={{ background: isAdmin ? '#cf3232' : '#f3f4f6', color: isAdmin ? '#fff' : '#111827' }}>
                        <p className="leading-relaxed">{msg.message}</p>
                        <p className={cn('text-[10px] mt-1 text-right', isAdmin ? 'text-rose-200' : 'text-gray-400')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid #f3f4f6' }}>
              <div className="flex items-center gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none"
                  style={{ background: '#FAEFEF', border: '1.5px solid #e5e7eb', color: '#111827' }} />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition disabled:opacity-40 flex-shrink-0"
                  style={{ background: '#cf3232' }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── New Chat Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl bg-white" style={{ border: '1.5px solid #e5e7eb' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1.5px solid #e5e7eb' }}>
              <p className="font-black text-base text-gray-900">New Conversation</p>
              <button onClick={() => { setShowNew(false); setNewSearch(''); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex gap-2">
                {(['vendor', 'buyer'] as const).map(t => (
                  <button key={t} onClick={() => { setNewType(t); setNewSearch(''); }}
                    className="flex-1 py-2 rounded-xl text-sm font-bold capitalize transition flex items-center justify-center gap-1.5"
                    style={{ background: newType === t ? '#cf3232' : '#f3f4f6', color: newType === t ? '#fff' : '#6b7280' }}>
                    {t === 'vendor' ? <Store className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                    {t === 'vendor' ? 'Vendors' : 'Buyers'}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={newSearch} onChange={e => setNewSearch(e.target.value)} placeholder={`Search ${newType}s...`}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#FAEFEF', border: '1.5px solid #e5e7eb', color: '#111827' }} />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl" style={{ border: '1.5px solid #e5e7eb' }}>
                {newLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#cf3232' }} /></div>
                ) : newList.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">No {newType}s found</div>
                ) : newList.map(item => {
                  const name = item.businessName || `${item.firstName || ''} ${item.lastName || ''}`.trim();
                  return (
                    <button key={item._id} onClick={() => startNewChat(item._id)} disabled={starting === item._id}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-rose-50 transition disabled:opacity-50"
                      style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Avatar name={name} bg={newType === 'vendor' ? '#2563eb' : '#059669'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-900">{name}</p>
                        <p className="text-xs truncate text-gray-400">{item.email}</p>
                      </div>
                      {starting === item._id && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#cf3232' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>}>
      <AdminChatContent />
    </Suspense>
  );
}
