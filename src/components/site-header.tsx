
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Users, Gavel, Search, User as UserIcon, LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';


export function SiteHeader() {
  // Mock user data for demo
  const user = { id: "demo-user", displayName: "Demo User", email: "demo@example.com" };
  const avatarUrl = null;
  const isProfessional = false;
  const signOut = () => {};

  const userAvatar = (className: string) => (
    <Avatar className={className}>
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
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/feed" className="mr-6 flex items-center space-x-2">
            <span className="text-2xl font-headline font-bold dark:text-white">SOMA</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/discover"
              className="transition-colors hover:text-foreground/80 text-muted-foreground flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Discover
            </Link>
            <Link
              href="/artists"
              className="transition-colors hover:text-foreground/80 text-muted-foreground flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Artists
            </Link>
            <Link
              href="/auctions"
              className="transition-colors hover:text-foreground/80 text-muted-foreground flex items-center gap-2"
            >
              <Gavel className="h-4 w-4" />
              Auctions
            </Link>
          </nav>
        </div>
        
        {/* Mobile Header */}
        <div className="flex items-center md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs">
                    <Link href="/feed" className="flex items-center space-x-2 mb-8">
                        <span className="text-2xl font-headline font-bold dark:text-white">SOMA</span>
                    </Link>
                    <nav className="flex flex-col space-y-6 text-lg font-medium">
                         <Link href="/discover" className="transition-colors hover:text-foreground/80 text-muted-foreground">Discover</Link>
                         <Link href="/artists" className="transition-colors hover:text-foreground/80 text-muted-foreground">Artists</Link>
                         <Link href="/auctions" className="transition-colors hover:text-foreground/80 text-muted-foreground">Auctions</Link>
                    </nav>
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-2">
                      {user ? (
                           <>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="flex items-center justify-start gap-3 h-12">
                                      {userAvatar("h-8 w-8")}
                                      <div className="text-left">
                                          <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                      </div>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56" align="end" forceMount>
                                  <DropdownMenuItem asChild><Link href="/profile"><UserIcon className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                          </>
                      ) : (
                          <>
                              <Button variant="outline" asChild><Link href="/login">Log In</Link></Button>
                              <Button asChild><Link href="/login?tab=signup">Sign Up</Link></Button>
                          </>
                      )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>


        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search artists, artwork..." className="pl-10 w-full md:w-64 rounded-full placeholder:text-muted-foreground" />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    {userAvatar("h-10 w-10")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><UserIcon className="mr-2" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login?tab=signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
