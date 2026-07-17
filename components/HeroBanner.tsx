'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  autoScrollInterval?: number;
}

export function HeroBanner({ movies, autoScrollInterval = 10000 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedAutoScrollInterval = Math.max(1000, Number(autoScrollInterval) || 10000);

  // Parallax motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  // Transform values for different layers
  const bgX = useTransform(springX, (value) => value * 0.05);
  const bgY = useTransform(springY, (value) => value * 0.05);
  const contentX = useTransform(springX, (value) => -value * 0.02);
  const contentY = useTransform(springY, (value) => -value * 0.02);

  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, normalizedAutoScrollInterval);

    return () => clearInterval(interval);
  }, [movies.length, normalizedAutoScrollInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movies.length]);

  // Mouse move handler for parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    x.set(mouseX);
    y.set(mouseY);
  };

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
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[100svh] min-h-[640px] md:min-h-[720px] overflow-hidden cursor-default"
    >
      {/* Animated Background Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20"
          animate={{
            background: [
              'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
              'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(239, 68, 68, 0.2), rgba(139, 92, 246, 0.2))',
              'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2), rgba(239, 68, 68, 0.2))',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
          style={{ x: bgX, y: bgY }}
        >
          <Image
            src={currentMovie.backdropPath}
            alt={currentMovie.title}
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="relative z-10 flex h-full items-end md:items-center px-4 sm:px-6 md:px-12 pt-24 pb-16 sm:pb-20 md:pb-0"
        style={{ x: contentX, y: contentY }}
      >
        <div className="max-w-xl md:max-w-2xl">
          <motion.div
            key={currentMovie.id}
            initial={{ y: 60, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
          >
            <span className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-full mb-4 sm:mb-6 shadow-lg shadow-red-600/30">
              Featured
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight drop-shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
              {currentMovie.title}
            </h2>
            {currentMovie.tagline && (
              <p className="text-base sm:text-xl md:text-3xl text-gray-300 mb-5 sm:mb-8 italic drop-shadow-[0_4px_12px_rgb(0,0,0,0.5)]">
                "{currentMovie.tagline}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-5 sm:mb-8 text-sm sm:text-base text-white">
              <span className="text-yellow-400 font-bold text-sm sm:text-lg flex items-center gap-2 drop-shadow-[0_4px_12px_rgb(0,0,0,0.5)]">
                ★ {currentMovie.rating.toFixed(1)}
              </span>
              <span className="drop-shadow-[0_4px_12px_rgb(0,0,0,0.5)]">{yearLabel}</span>
              <span className="drop-shadow-[0_4px_12px_rgb(0,0,0,0.5)]">{runtimeLabel}</span>
              <div className="flex gap-2 flex-wrap">
                {currentMovie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/15 backdrop-blur-lg rounded-full text-xs sm:text-sm font-medium border border-white/20 shadow-xl shadow-black/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm sm:text-base md:text-xl text-gray-200 mb-6 sm:mb-8 md:mb-10 line-clamp-4 sm:line-clamp-3 leading-relaxed drop-shadow-[0_4px_12px_rgb(0,0,0,0.5)]">
              {currentMovie.overview}
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 md:gap-5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenMovie}
                className="flex items-center justify-center gap-3 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 bg-white text-black font-black text-base sm:text-lg rounded-full shadow-2xl shadow-white/30 hover:bg-gray-100 transition-all duration-300"
              >
                <Play fill="black" size={24} className="sm:w-7 sm:h-7" />
                Watch Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenMovie}
                className="flex items-center justify-center gap-3 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 bg-white/15 backdrop-blur-xl text-white font-bold text-base sm:text-lg rounded-full border border-white/20 shadow-2xl shadow-black/30 hover:bg-white/25 transition-all duration-300"
              >
                <Info size={24} className="sm:w-7 sm:h-7" />
                More Info
              </motion.button>

            </div>
          </motion.div>
        </div>
      </motion.div>



      {/* Indicators */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3 sm:gap-4">
        {movies.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2.5 sm:h-3 rounded-full transition-all duration-500 shadow-lg shadow-black/40',
              currentIndex === index ? 'w-10 sm:w-14 bg-red-600 shadow-red-600/50' : 'w-2.5 sm:w-3 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  );
}
