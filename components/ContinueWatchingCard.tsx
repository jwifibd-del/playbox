'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, MoreHorizontal, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ContinueWatchingItem, buildResumeUrl } from '@/lib/data';

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const resume = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const url = buildResumeUrl(item);
    if (url && url !== '#') router.push(url);
  }, [item, router]);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Continue watching ${item.title}`}
      className="relative group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
      onClick={resume}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') resume(e);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={item.backdropPath}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(ev) => {
            if (item.posterPath) (ev.currentTarget as HTMLImageElement).src = item.posterPath;
          }}
        />

        {/* Device Sync Badge */}
        {item.lastDevice && item.lastDevice.startsWith('mobile') && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-sm">
            <Smartphone className="h-3 w-3 text-amber-400" />
            <span>{item.sourceDeviceName || 'Mobile'}</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/90">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-4"
          >
            {/* Top */}
            <div className="flex justify-end">
              <button
                aria-label="More options"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors text-white"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Bottom */}
            <div>
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
              {item.showName && (
                <p className="text-zinc-400 text-xs mb-2 line-clamp-1">{item.showName}</p>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                <span>{item.currentTime} / {item.duration}</span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span>{Math.round(item.progress)}%</span>
              </div>
              <button
                type="button"
                onClick={resume}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
              >
                <Play fill="black" size={16} /> Continue
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
