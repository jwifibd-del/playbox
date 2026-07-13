'use client';

import React from 'react';
import { TVShow } from '@/lib/data';
import { TVShowCard } from './TVShowCard';
import { HorizontalSlider } from './HorizontalSlider';

interface TVShowRowProps {
  title: string;
  tvShows: TVShow[];
  animationDuration?: number;
}

export function TVShowRow({ title, tvShows, animationDuration = 15 }: TVShowRowProps) {
  return (
    <div className="px-6 md:px-12 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <HorizontalSlider duration={animationDuration}>
        {tvShows.map((tvShow) => (
          <div key={tvShow.id} className="flex-shrink-0 w-[200px] mr-4">
            <TVShowCard tvShow={tvShow} />
          </div>
        ))}
      </HorizontalSlider>
    </div>
  );
}
