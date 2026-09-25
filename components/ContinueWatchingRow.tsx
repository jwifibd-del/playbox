'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ContinueWatchingItem } from '@/lib/data';
import { ContinueWatchingCard } from './ContinueWatchingCard';
import { HorizontalSlider } from './HorizontalSlider';

interface ContinueWatchingRowProps {
  title: string;
  items: ContinueWatchingItem[];
  animationDuration?: number;
}

export function ContinueWatchingRow({ title, items, animationDuration = 15 }: ContinueWatchingRowProps) {
  const hasMobileSynced = items.some((i) => i.lastDevice && i.lastDevice.startsWith('mobile'));

  return (
    <div className="px-6 md:px-12 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900/90 text-zinc-300 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {hasMobileSynced ? 'Synced with Mobile' : 'Cloud Synced'}
          </span>
        </div>

        <Link
          href="/mobile-app"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400/90 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 px-3 py-1.5 rounded-full transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Device Sync Simulator</span>
        </Link>
      </div>

      <HorizontalSlider duration={animationDuration}>
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[300px] mr-4">
            <ContinueWatchingCard item={item} />
          </div>
        ))}
      </HorizontalSlider>
    </div>
  );
}
