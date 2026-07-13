'use client';

import React from 'react';
import { KidsContent } from '@/lib/data';
import { KidsCard } from './KidsCard';
import { HorizontalSlider } from './HorizontalSlider';

interface KidsRowProps {
  title: string;
  items: KidsContent[];
  animationDuration?: number;
}

export function KidsRow({ title, items, animationDuration = 15 }: KidsRowProps) {
  return (
    <div className="px-6 md:px-12 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <HorizontalSlider duration={animationDuration}>
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[200px] mr-4">
            <KidsCard item={item} />
          </div>
        ))}
      </HorizontalSlider>
    </div>
  );
}
