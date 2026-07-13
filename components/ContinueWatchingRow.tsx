'use client';

import React from 'react';
import { ContinueWatchingItem } from '@/lib/data';
import { ContinueWatchingCard } from './ContinueWatchingCard';
import { HorizontalSlider } from './HorizontalSlider';

interface ContinueWatchingRowProps {
  title: string;
  items: ContinueWatchingItem[];
  animationDuration?: number;
}

export function ContinueWatchingRow({ title, items, animationDuration = 15 }: ContinueWatchingRowProps) {
  return (
    <div className="px-6 md:px-12 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
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
