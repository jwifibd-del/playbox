'use client';

import React from 'react';
import { LiveChannel } from '@/lib/data';
import { LiveTVCard } from './LiveTVCard';
import { HorizontalSlider } from './HorizontalSlider';

interface LiveTVRowProps {
  title: string;
  channels: LiveChannel[];
  animationDuration?: number;
}

export function LiveTVRow({ title, channels, animationDuration = 15 }: LiveTVRowProps) {
  return (
    <div className="px-6 md:px-12 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <HorizontalSlider duration={animationDuration}>
        {channels.map((channel) => (
          <div key={channel.id} className="flex-shrink-0 w-[200px] mr-4">
            <LiveTVCard key={channel.id} channel={channel} />
          </div>
        ))}
      </HorizontalSlider>
    </div>
  );
}
