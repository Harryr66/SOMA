
'use client';

import { SiteHeader } from '@/components/site-header';
import React, { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
