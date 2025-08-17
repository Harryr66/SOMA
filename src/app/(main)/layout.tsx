'use client';

import React, { useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { MobileHeader } from '@/components/mobile-header';
import { ContentProvider } from '@/providers/content-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <ContentProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <MobileHeader />
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
          <SiteFooter />
        </div>
        <MobileBottomNav />
      </div>
    </ContentProvider>
  );
}
