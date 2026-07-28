'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Info, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated, TVShow } from '@/lib/data';
import { formatRating } from '@/lib/utils';

interface TVShowCardProps {
  tvShow: TVShow;
}

export function TVShowCard({ tvShow }: TVShowCardProps) {
  const [isHovered, setIsHoveredState] = useState(false);
  const isMountedRef = useRef(true);
  const router = useRouter();

  useEffect(() => () => { isMountedRef.current = false; }, []);

  const setIsHovered = useCallback((next: boolean) => {
    queueMicrotask(() => {
      if (isMountedRef.current) setIsHoveredState(next);
    });
  }, []);

  const handleOpenTVShow = useCallback(() => {
    router.push(isUserAuthenticated() ? `/tv/${tvShow.id}` : '/login');
  }, [router, tvShow.id]);

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenTVShow}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
        <img
          src={tvShow.posterPath}
          alt={tvShow.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{tvShow.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 flex items-center gap-1 text-sm">
                <Star fill="currentColor" size={14} /> {formatRating(tvShow.rating)}
              </span>
              <span className="text-gray-300 text-sm">{tvShow.startYear}{tvShow.endYear ? ` - ${tvShow.endYear}` : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-full flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTVShow();
                }}
              >
                <Play fill="black" size={16} /> Play
              </button>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors" onClick={(e) => e.stopPropagation()}>
                <Plus size={16} />
              </button>
              <button
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTVShow();
                }}
              >
                <Info size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
