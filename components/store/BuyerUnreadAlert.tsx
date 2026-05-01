'use client';
import { useBuyerAuth, buyerApi } from '@/lib/buyerAuth';
import UnreadMessageAlert from '@/components/UnreadMessageAlert';

export default function BuyerUnreadAlert() {
  const { buyer } = useBuyerAuth();
  if (!buyer) return null;
  return (
    <UnreadMessageAlert
      sources={[
        { fetch: () => buyerApi.get('/buyer/chat/conversations'),       unreadField: 'buyerUnread',       label: 'vendors', chatPath: '/buyer/chat' },
        { fetch: () => buyerApi.get('/buyer/chat/admin-conversations'), unreadField: 'participantUnread', label: 'admin',   chatPath: '/buyer/chat' },
      ]}
    />
  );
}
