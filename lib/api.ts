import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://e-commorce-back.onrender.com/api';

// ── Base API (no auto-auth — use explicit headers) ────────────────────────────
const api = axios.create({ baseURL: API_BASE });

// ── Admin API (auto-injects admin_token) ──────────────────────────────────────
export const adminApi = axios.create({ baseURL: API_BASE });
adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/bz-admin-x7k';
    }
    return Promise.reject(err);
  }
);

// ── Vendor API (auto-injects vendor_token) ────────────────────────────────────
export const vendorAxios = axios.create({ baseURL: API_BASE });
vendorAxios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vendor_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
vendorAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('vendor_token');
      window.location.href = '/vendor/login';
    }
    return Promise.reject(err);
  }
);

// ── Buyer API (auto-injects buyer_token) ──────────────────────────────────────
export const buyerAxios = axios.create({ baseURL: API_BASE });
buyerAxios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('buyer_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
buyerAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('buyer_token');
      window.location.href = '/buyer/login';
    }
    return Promise.reject(err);
  }
);

export default api;
