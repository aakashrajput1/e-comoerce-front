import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { VendorAuthProvider } from '@/lib/vendorAuth';
import { BuyerAuthProvider } from '@/lib/buyerAuth';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bazaar Marketplace',
  description: 'Multi-vendor marketplace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <AuthProvider>
          <VendorAuthProvider>
            <BuyerAuthProvider>
              {children}
            </BuyerAuthProvider>
          </VendorAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
