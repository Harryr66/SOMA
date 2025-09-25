'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Eye, 
  Upload, 
  User,
  Store
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/feed', icon: Home },
  { name: 'Discover', href: '/discover', icon: Eye },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Profile', href: '/profile', icon: User },
];

export function DesktopHeader() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between bg-card border-b h-16 px-6">
      <h1 className="text-2xl font-bold text-foreground">
        SOMA
      </h1>
      
      <nav className="flex items-center space-x-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'gradient-border text-foreground'
                  : 'text-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">U</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">User Name</p>
          <p className="text-xs text-muted-foreground truncate">@username</p>
        </div>
      </div>
    </div>
  );
}
