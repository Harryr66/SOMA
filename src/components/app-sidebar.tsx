
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Eye,
  User,
  Settings,
  Send,
  Bell,
  Upload,
  Bookmark,
  Search,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const navItems = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/discover', icon: Eye, label: 'Discover' },
  { href: '/upload', icon: Upload, label: 'Upload' },
  { href: '/saved', icon: Bookmark, label: 'Saved' },
  { href: '/messages', icon: Send, label: 'Share' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, avatarUrl, isProfessional } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background shrink-0">
      <div className="p-4 border-b h-16 flex items-center justify-center">
        <Link href="/feed" className="flex items-center gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-wider">SOMA</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.href === '/upload' && !isProfessional) {
            return null;
          }

          const isActive = item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

          return (
            <Button
              key={`${item.href}-${item.label}`}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 text-base font-semibold rounded-md border-2 border-transparent transition-all hover:gradient-border hover:text-foreground",
                isActive && "gradient-border text-foreground"
              )}
              asChild
            >
              <Link
                href={item.href}
              >
                {item.href === '/profile' ? (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={avatarUrl || undefined} alt={user?.displayName || 'User'} data-ai-hint="artist portrait" />
                    <AvatarFallback>
                      <svg
                          role="img"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-full w-full text-muted-foreground"
                      >
                          <path
                          d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 10c-3.309 0-6 2.691-6 6v2h12v-2c0-3.309-2.691-6-6-6z"
                          fill="currentColor"
                          />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
