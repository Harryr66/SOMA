'use client';

import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteFooter } from '@/components/site-footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { MobileHeader } from '@/components/mobile-header';
import { ContentProvider } from '@/providers/content-provider';
import { WatchlistProvider } from '@/providers/watchlist-provider';
import { FollowProvider } from '@/providers/follow-provider';
import { DesktopHeader } from '@/components/desktop-header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
        <ContentProvider>
          <WatchlistProvider>
            <FollowProvider>
              <div className="flex min-h-screen w-full bg-background flex-col">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <DesktopHeader />
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden">
          <MobileHeader />
        </div>
        
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNav />
              </div>
            </FollowProvider>
          </WatchlistProvider>
        </ContentProvider>
  );
}