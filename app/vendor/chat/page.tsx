'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { vendorApi as vendorAxios } from '@/lib/vendorAuth';
import { Send, MessageSquare, Search, Users, Shield, Loader2, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message { _id: string; senderRole: string; message: string; createdAt: string; tempId?: string; }
interface BuyerConv { _id: string; type: 'buyer'; buyer: any; lastMessage: string; lastMessageAt: string; vendorUnread: number; }
interface AdminConv { _id: string; type: 'admin'; participant: any; lastMessage: string; lastMessageAt: string; participantUnread: number; }
type Conv = BuyerConv | AdminConv;

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

export default function VendorChatPage() {
  const [tab, setTab] = useState<'buyers' | 'admin'>('buyers');
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [activeConv, setActiveConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  // Track unread per tab independently so switching tabs doesn't lose counts
  const [buyerUnreadTotal, setBuyerUnreadTotal] = useState(0);
  const [adminUnreadTotal, setAdminUnreadTotal] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const adminSocketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<Conv | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setActiveConvBoth = (conv: Conv | null) => { activeConvRef.current = conv; setActiveConv(conv); };

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', { auth: { token } });
    socketRef.current = socket;

    socket.on('new_message', (msg: any) => {
      if (activeConvRef.current?._id === msg.conversationId) {
        setMessages(p => [...p, msg]);
        socket.emit('mark_read', { conversationId: msg.conversationId });
      }
      setConversations(p => p.map(c =>
        c._id === msg.conversationId && c.type === 'buyer'
          ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt, vendorUnread: activeConvRef.current?._id === msg.conversationId ? 0 : (c as BuyerConv).vendorUnread + 1 }
          : c
      ));
    });
    socket.on('message_delivered', (msg: Message) => setMessages(p => [...p.filter(m => m.tempId !== msg.tempId), msg]));
    socket.on('user_typing', () => setTyping(true));
    socket.on('user_stopped_typing', () => setTyping(false));
    socket.on('messages_read', () => { /* could show read receipts */ });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}/admin-participant-chat`, { auth: { token } });
    adminSocketRef.current = socket;

    socket.on('admin_message', (msg: any) => {
      if (activeConvRef.current?._id === msg.conversationId) setMessages(p => [...p, msg]);
      setConversations(p => p.map(c =>
        c._id === msg.conversationId && c.type === 'admin' ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt } : c
      ));
    });
    socket.on('admin_message_delivered', (msg: Message) => setMessages(p => [...p.filter(m => m.tempId !== msg.tempId), msg]));
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    setLoading(true); setActiveConvBoth(null); setMessages([]);
    if (tab === 'buyers') {
      vendorAxios.get('/vendor/chat/conversations')
        .then(r => {
          const convs = (r.data.conversations || []).map((c: any) => ({ ...c, type: 'buyer' }));
          setConversations(convs);
          setBuyerUnreadTotal(convs.reduce((s: number, c: any) => s + (c.vendorUnread || 0), 0));
        })
        .catch(() => {}).finally(() => setLoading(false));
    } else {
      vendorAxios.get('/vendor/chat/admin-conversations')
        .then(r => {
          const convs = (r.data.conversations || []).map((c: any) => ({ ...c, type: 'admin' }));
          setConversations(convs);
          setAdminUnreadTotal(convs.reduce((s: number, c: any) => s + (c.participantUnread || 0), 0));
        })
        .catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openConv = async (conv: Conv) => {
    setActiveConvBoth(conv); setMobileView('chat');
    if (conv.type === 'buyer') {
      const { data } = await vendorAxios.get(`/vendor/chat/${conv._id}/messages`);
      setMessages(data.messages || []);
      socketRef.current?.emit('join_conversation', { conversationId: conv._id });
      setConversations(p => p.map(c => c._id === conv._id ? { ...c, vendorUnread: 0 } : c));
    } else {
      const { data } = await vendorAxios.get(`/vendor/chat/admin/${conv._id}/messages`);
      setMessages(data.messages || []);
      setConversations(p => p.map(c => c._id === conv._id ? { ...c, participantUnread: 0 } : c));
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = { _id: tempId, senderRole: 'vendor', message: input.trim(), createdAt: new Date().toISOString(), tempId };
    setMessages(p => [...p, optimistic]);
    if (activeConv.type === 'buyer') {
      socketRef.current?.emit('send_message', { conversationId: activeConv._id, text: input.trim(), tempId });
    } else {
      adminSocketRef.current?.emit('participant_send_message', { conversationId: activeConv._id, text: input.trim(), tempId });
    }
    setInput('');
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (activeConv?.type === 'buyer') {
      socketRef.current?.emit('typing_start', { conversationId: activeConv._id });
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socketRef.current?.emit('typing_stop', { conversationId: activeConv._id }), 1500);
    }
  };

  const getConvName = (conv: Conv) => {
    if (conv.type === 'buyer') { const b = (conv as BuyerConv).buyer; return `${b?.firstName || ''} ${b?.lastName || ''}`.trim() || 'Buyer'; }
    return 'Admin Support';
  };
  const getUnread = (conv: Conv) => conv.type === 'buyer' ? (conv as BuyerConv).vendorUnread : (conv as AdminConv).participantUnread;
  const filtered = conversations.filter(c => getConvName(c).toLowerCase().includes(search.toLowerCase()));
  const totalUnread = conversations.reduce((s, c) => s + getUnread(c), 0);

  // Per-tab unread counts (across ALL conversations, not just current tab)
  const buyerTabUnread = conversations.filter(c => c.type === 'buyer').reduce((s, c) => s + getUnread(c), 0);
  const adminTabUnread = conversations.filter(c => c.type === 'admin').reduce((s, c) => s + getUnread(c), 0);

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-0 md:gap-4">

      {/* ── Sidebar ── */}
      <div className={cn(
        'w-full md:w-72 flex-shrink-0 bg-white rounded-2xl flex flex-col overflow-hidden',
        'md:flex', mobileView === 'chat' ? 'hidden' : 'flex'
      )} style={{ border: '1.5px solid #e5e7eb' }}>

        <div className="p-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-black text-sm text-gray-900">Messages</p>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#cf3232' }}>{totalUnread}</span>
            )}
          </div>
          <div className="flex gap-1 mb-3">
            {(['buyers', 'admin'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                style={{ background: tab === t ? '#cf3232' : '#f3f4f6', color: tab === t ? '#fff' : '#6b7280' }}>
                {t === 'buyers' ? <Users className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {t === 'buyers' ? 'Buyers' : 'Admin'}
                {t === 'buyers' && buyerUnreadTotal > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none"
                    style={{ background: tab === t ? 'rgba(255,255,255,0.3)' : '#cf3232', color: '#fff' }}>
                    {buyerUnreadTotal}
                  </span>
                )}
                {t === 'admin' && adminUnreadTotal > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none"
                    style={{ background: tab === t ? 'rgba(255,255,255,0.3)' : '#cf3232', color: '#fff' }}>
                    {adminUnreadTotal}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#FAEFEF', border: '1.5px solid #e5e7eb', color: '#111827' }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#cf3232' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No conversations</p>
            </div>
          ) : filtered.map(conv => {
            const name = getConvName(conv);
            const unread = getUnread(conv);
            const isActive = activeConv?._id === conv._id;
            return (
              <button key={conv._id} onClick={() => openConv(conv)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors"
                style={{ background: isActive ? '#fff1f2' : 'transparent', borderBottom: '1px solid #f9fafb' }}>
                <div className="relative flex-shrink-0">
                  {conv.type === 'admin'
                    ? <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600"><Shield className="w-5 h-5 text-white" /></div>
                    : <Avatar name={name} />}
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                      style={{ background: '#cf3232' }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn('text-sm truncate', unread > 0 ? 'font-black text-gray-900' : 'font-semibold text-gray-700')}>{name}</p>
                    <p className="text-[10px] text-gray-400 flex-shrink-0">{timeLabel(conv.lastMessageAt)}</p>
                  </div>
                  <p className={cn('text-xs truncate mt-0.5', unread > 0 ? 'text-gray-700 font-semibold' : 'text-gray-400')}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
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
            <p className="text-xs text-gray-400">Your messages will appear here</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <button onClick={() => { setMobileView('list'); setActiveConvBoth(null); }}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0">
                ←
              </button>
              {activeConv.type === 'admin'
                ? <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 flex-shrink-0"><Shield className="w-5 h-5 text-white" /></div>
                : <Avatar name={getConvName(activeConv)} />}
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 text-sm truncate">{getConvName(activeConv)}</p>
                <p className="text-xs text-gray-400">{activeConv.type === 'admin' ? 'Admin Support' : 'Buyer'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              style={{ background: 'linear-gradient(180deg, #FAEFEF 0%, #fff 100%)' }}>
              {messages.map((msg, i) => {
                const isMe = msg.senderRole === 'vendor';
                const showTime = i === 0 || new Date(msg.createdAt).getTime() - new Date(messages[i - 1].createdAt).getTime() > 300000;
                return (
                  <div key={msg._id}>
                    {showTime && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] text-gray-400 px-3 py-1 rounded-full bg-gray-100">{timeLabel(msg.createdAt)}</span>
                      </div>
                    )}
                    <div className={cn('flex items-end gap-2 mb-1', isMe ? 'justify-end' : 'justify-start')}>
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-1 text-white text-[10px] font-black"
                          style={{ background: activeConv.type === 'admin' ? '#1d4ed8' : '#cf3232' }}>
                          {getConvName(activeConv)[0]}
                        </div>
                      )}
                      <div className={cn('max-w-[72%] px-4 py-2.5 text-sm shadow-sm', isMe ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm')}
                        style={{ background: isMe ? '#cf3232' : '#f3f4f6', color: isMe ? '#fff' : '#111827' }}>
                        <p className="leading-relaxed">{msg.message}</p>
                        <p className={cn('text-[10px] mt-1 text-right', isMe ? 'text-rose-200' : 'text-gray-400')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: '#cf3232' }} />
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 flex gap-1">
                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid #f3f4f6' }}>
              <div className="flex items-center gap-2">
                <input value={input} onChange={e => handleTyping(e.target.value)}
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
    </div>
  );
}
