'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, Package, Info, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, useAuth } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { useSyncExternalStore } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useCart((state) => state.cart);
  const { user, logout } = useAuth();
  const rawCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartItemCount = rawCount > 99 ? '99+' : String(rawCount);
  
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
            NEBI STORE
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/products" className="transition-colors hover:text-primary">Products</Link>
            <Link href="/collections" className="transition-colors hover:text-primary">Collections</Link>
            <Link href="/about" className="transition-colors hover:text-primary">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>

          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={true}
                render={
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {user ? `Hi, ${user.first_name || user.username}` : 'My Account'}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {user ? (
                  <>
                    <DropdownMenuItem nativeButton={false} render={<Link href="/profile" />}>
                      Profile
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem nativeButton={false} render={<Link href="/admin/dashboard" />}>
                        <span className="font-bold text-primary">Admin Console</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem nativeButton={false} render={<Link href="/orders" />}>
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem nativeButton={false} render={<Link href="/login" />}>
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem nativeButton={false} render={<Link href="/register" />}>
                      Register
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          )}

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {rawCount > 0 && (
                <span className="absolute -top-1 -right-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          {mounted ? (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                nativeButton={true}
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                }
              />
              <SheetContent
                side="right"
                className="flex h-full max-h-[100dvh] w-[min(100%,22rem)] flex-col border-l border-primary/10 bg-gradient-to-b from-background to-muted/30 p-0 sm:max-w-sm"
              >
                <SheetHeader className="border-b border-border/60 bg-muted/20 px-6 py-5 text-left">
                  <SheetTitle className="text-lg font-black tracking-tight text-primary">Menu</SheetTitle>
                  <SheetDescription className="text-xs font-medium text-muted-foreground">
                    Browse the store or open your account.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
                  {[
                    { href: '/products', label: 'Products', Icon: Package },
                    { href: '/collections', label: 'Collections', Icon: LayoutGrid },
                    { href: '/about', label: 'About', Icon: Info },
                  ].map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors',
                        pathname === href || (href !== '/' && pathname.startsWith(href))
                          ? 'bg-primary/15 text-primary'
                          : 'text-foreground hover:bg-muted/80'
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t border-border/60 px-4 py-4">
                  <Link
                    href="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3 text-sm font-black text-primary ring-1 ring-primary/20"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                      View cart
                    </span>
                    {rawCount > 0 ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
                        {cartItemCount}
                      </span>
                    ) : null}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
