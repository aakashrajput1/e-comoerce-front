import StoreNavbar from '@/components/store/StoreNavbar';
import StoreFooter from '@/components/store/StoreFooter';
import BuyerUnreadAlert from '@/components/store/BuyerUnreadAlert';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAEFEF' }}>
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <BuyerUnreadAlert />
    </div>
  );
}
