'use client';

import React from 'react';
import { NewsItem } from '@/lib/data';
import { NewsCard } from './NewsCard';
import { HorizontalSlider } from './HorizontalSlider';

interface NewsRowProps {
  title: string;
  items: NewsItem[];
  animationDuration?: number;
}

export function NewsRow({ title, items, animationDuration = 15 }: NewsRowProps) {
  return (
    <div className="px-6 md:px-12 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <HorizontalSlider duration={animationDuration}>
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-[300px] mr-4">
            <NewsCard item={item} />
          </div>
        ))}
      </HorizontalSlider>
    </div>
  );
}
