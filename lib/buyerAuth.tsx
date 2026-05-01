'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { buyerAxios } from './api';

interface Buyer {
  id: string; email: string; firstName: string; lastName: string;
  phone?: string; avatar?: string; status: string; isEmailVerified: boolean;
}

interface BuyerAuthCtx {
  buyer: Buyer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
}

const Ctx = createContext<BuyerAuthCtx>({} as BuyerAuthCtx);

export function BuyerAuthProvider({ children }: { children: ReactNode }) {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = () => {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      buyerAxios.get('/buyer/auth/me')
        .then(r => setBuyer(r.data.buyer))
        .catch(() => localStorage.removeItem('buyer_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  const login = async (email: string, password: string) => {
    const { data } = await buyerAxios.post('/buyer/auth/login', { email, password });
    localStorage.setItem('buyer_token', data.token);
    setBuyer(data.buyer);
  };

  const logout = () => {
    localStorage.removeItem('buyer_token');
    setBuyer(null);
    window.location.href = '/buyer/login';
  };

  return <Ctx.Provider value={{ buyer, loading, login, logout, refresh: fetchMe }}>{children}</Ctx.Provider>;
}

export const useBuyerAuth = () => useContext(Ctx);
export { buyerAxios as buyerApi };
