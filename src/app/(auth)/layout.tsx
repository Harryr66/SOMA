'use client';

import { SiteHeader } from '@/components/site-header';
import React from 'react';
import { SiteFooter } from '@/components/site-footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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