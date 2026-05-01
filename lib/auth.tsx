'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminApi } from './api';

interface Admin {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'superadmin' | 'admin';
  permissions: string[];
}

interface AuthCtx {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (p: string) => boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      adminApi.get('/admin/auth/me')
        .then((r) => setAdmin(r.data.admin))
        .catch(() => localStorage.removeItem('admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await adminApi.post('/admin/auth/login', { email, password });
    localStorage.setItem('admin_token', data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
    window.location.href = '/bz-admin-x7k';
  };

  const hasPermission = (p: string) => {
    if (!admin) return false;
    if (admin.role === 'superadmin') return true;
    return admin.permissions.includes(p);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
