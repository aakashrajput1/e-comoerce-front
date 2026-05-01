'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function DealsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/products?sort=price'); }, []);
  return null;
}
