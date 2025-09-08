'use client';

import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteFooter } from '@/components/site-footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { MobileHeader } from '@/components/mobile-header';
import { ContentProvider } from '@/providers/content-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
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