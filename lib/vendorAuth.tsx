'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { vendorAxios } from './api';

interface Vendor {
  id: string; email: string; businessName: string; ownerName: string;
  slug: string; status: string; stripeOnboardingComplete: boolean; logo?: string;
}

interface VendorAuthCtx {
  vendor: Vendor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<VendorAuthCtx>({} as VendorAuthCtx);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    if (token) {
      vendorAxios.get('/vendor/auth/me')
        .then(r => setVendor(r.data.vendor))
        .catch(() => localStorage.removeItem('vendor_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await vendorAxios.post('/vendor/auth/login', { email, password });
    localStorage.setItem('vendor_token', data.token);
    setVendor(data.vendor);
  };

  const logout = () => {
    localStorage.removeItem('vendor_token');
    setVendor(null);
    window.location.href = '/vendor/login';
  };

  const refresh = () => {
    const token = localStorage.getItem('vendor_token');
    if (token) {
      vendorAxios.get('/vendor/auth/me')
        .then(r => setVendor(r.data.vendor))
        .catch(() => {});
    }
  };

  return <Ctx.Provider value={{ vendor, loading, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useVendorAuth = () => useContext(Ctx);

// Use vendorAxios directly — no need for manual headers anymore
export { vendorAxios as vendorApi };
