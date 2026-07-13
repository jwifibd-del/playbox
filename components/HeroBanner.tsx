'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/lib/data';
import { cn } from '@/lib/utils';

interface HeroBannerItem {
  id: string | number;
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear?: number;
  startYear?: number;
  endYear?: number;
  rating: number;
  runtime?: string;
  genres: string[];
  contentType?: 'movie' | 'tv';
}

interface HeroBannerProps {
  movies: HeroBannerItem[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const currentMovie = movies[currentIndex];

  const handleOpenMovie = () => {
    const detailsHref = currentMovie.contentType === 'tv'
      ? `/tv/${currentMovie.id}`
      : `/movie/${currentMovie.id}`;
    router.push(isUserAuthenticated() ? detailsHref : '/login');
  };

  const yearLabel = currentMovie.contentType === 'tv'
    ? `${currentMovie.startYear ?? currentMovie.releaseYear ?? 'N/A'}${currentMovie.endYear ? ` - ${currentMovie.endYear}` : ''}`
    : `${currentMovie.releaseYear ?? currentMovie.startYear ?? 'N/A'}`;
  const runtimeLabel = currentMovie.contentType === 'tv'
    ? 'TV Series'
    : currentMovie.runtime || 'Featured';

  return (
    <div className="relative w-full h-[90vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={currentMovie.backdropPath}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex items-center px-6 md:px-12">
        <div className="max-w-2xl">
          <motion.div
            key={currentMovie.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 bg-red-600 text-white text-sm font-semibold rounded mb-4">
              Featured
            </span>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {currentMovie.title}
            </h2>
            {currentMovie.tagline && (
              <p className="text-xl md:text-2xl text-gray-300 mb-6 italic">
                "{currentMovie.tagline}"
              </p>
            )}
            <div className="flex items-center gap-4 mb-6 text-white">
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                ★ {currentMovie.rating.toFixed(1)}
              </span>
              <span>{yearLabel}</span>
              <span>{runtimeLabel}</span>
              <div className="flex gap-2">
                {currentMovie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-lg text-gray-200 mb-8 line-clamp-3">
              {currentMovie.overview}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOpenMovie}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded hover:bg-gray-200 transition-colors"
              >
                <Play fill="black" size={24} />
                Watch Now
              </button>
              <button
                onClick={handleOpenMovie}
                className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded hover:bg-white/30 transition-colors"
              >
                <Info size={24} />
                More Info
              </button>
              <button
                className="ml-auto p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-3">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              currentIndex === index ? 'w-12 bg-red-600' : 'bg-white/30 hover:bg-white/50'
            )}
          />
        ))}
      </div>
    </div>
  );
}
