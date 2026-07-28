'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TVChannelCard } from './TVChannelCard';
import type { TvChannel } from '@/lib/data';

interface TVChannelsRowProps {
  title: string;
  description?: string;
  channels: TvChannel[];
  onPlay?: (channel: TvChannel) => void;
  accentColor?: string;
  animationDuration?: number;
}

export function TVChannelsRow({
  title,
  description,
  channels,
  onPlay,
  animationDuration = 15,
}: TVChannelsRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const scrollAmount = scrollerRef.current.clientWidth * 0.85;
    scrollerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!channels || channels.length === 0) return null;

  return (
    <section className="relative w-full px-4 sm:px-6 md:px-10 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 sm:mb-6">
        <div className="min-w-0 flex-1">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight"
          >
            {title}
            <span className="inline-block w-1.5 h-1.5 ml-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 align-middle" />
          </motion.h2>
          {description && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base text-zinc-400 mt-2"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Scroll controls */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Channel scroll container */}
      <div className="relative group">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#080808] to-transparent z-10" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#080808] to-transparent z-10" />

        <div
          ref={scrollerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {channels.map((channel, idx) => (
            <motion.div
              key={`tv-rail-${title}-${String(channel.id)}`}
              className="snap-start shrink-0 w-[260px] sm:w-[290px] md:w-[320px] lg:w-[340px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >
              <TVChannelCard channel={channel} onPlay={onPlay} index={idx} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
