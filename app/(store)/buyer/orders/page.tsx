'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerOrdersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/buyer/account'); }, []);
  return null;
}
