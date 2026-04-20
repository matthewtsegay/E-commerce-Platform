'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  ShoppingBag,
  Users,
  BarChart3,
  Tag,
  Megaphone,
  CreditCard,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Box },
  { href: '/admin/collections', label: 'Collections', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/memberships', label: 'Memberships', icon: CreditCard },
  { href: '/admin/banners', label: 'Promo Banners', icon: Megaphone },
  { href: '/admin/payment-methods', label: 'Payment Methods', icon: Settings },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminShell({ children, title, subtitle, actions }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex-grow container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-[32px] shadow-sm border p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 w-full px-4 h-14 rounded-2xl font-bold text-sm transition-all',
                      active
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="p-6 bg-primary text-primary-foreground rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-lg font-black uppercase tracking-tighter mb-1 relative z-10">Nebi Store</h3>
            <p className="text-xs opacity-70 font-medium relative z-10">Admin Console</p>
            <Link
              href="/"
              className="mt-4 flex items-center gap-2 text-xs font-bold opacity-80 hover:opacity-100 relative z-10 transition-opacity"
            >
              <ChevronRight className="h-3 w-3" /> View Live Store
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow min-w-0 space-y-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">
                {title.split(' ').map((word, i, arr) =>
                  i === arr.length - 1 ? (
                    <span key={i} className="text-primary italic">{word}</span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                )}
              </h1>
              {subtitle && <p className="text-muted-foreground font-medium">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
