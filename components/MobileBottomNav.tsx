'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clapperboard, Radio, Tv, Smartphone, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide mobile bottom nav when on full-screen player or admin routes
  if (
    pathname.startsWith('/admin') ||
    pathname.includes('/watch') ||
    (pathname.startsWith('/movie/') && pathname.includes('/play'))
  ) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/' || pathname === '/kids' || pathname === '/anime',
    },
    {
      label: 'Movies',
      href: '/movies',
      icon: Clapperboard,
      isActive: pathname.startsWith('/movies') || pathname.startsWith('/movie/'),
    },
    {
      label: 'Live TV',
      href: '/tv-channels',
      icon: Radio,
      isActive: pathname.startsWith('/tv-channels'),
    },
    {
      label: 'TV Mode',
      href: '/tv-app',
      icon: Tv,
      isActive: pathname.startsWith('/tv-app'),
      badge: 'Living Room',
    },
    {
      label: 'Mobile App',
      href: '/mobile-app',
      icon: Smartphone,
      isActive: pathname.startsWith('/mobile-app'),
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group relative flex flex-1 flex-col items-center justify-center py-1.5 text-[11px] font-semibold transition-all duration-200',
                item.isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200 group-active:scale-90',
                    item.isActive && 'scale-110 text-amber-400'
                  )}
                />
                {item.badge && (
                  <span className="absolute -right-2 -top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                )}
              </div>
              <span className="mt-1 tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
