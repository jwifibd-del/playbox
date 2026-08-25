'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion';
import { Play, Info, Plus, ListPlus, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isUserAuthenticated } from '@/lib/data';
import { cn, formatRating } from '@/lib/utils';

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

const UNIFIED_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const UNIFIED_DURATION = 0.95;
const STAGGER = 0.042;

const springSoft = { stiffness: 120, damping: 22, mass: 0.6 };
const springMagnetic = { stiffness: 220, damping: 16, mass: 0.25 };

export function HeroBanner({ movies, autoScrollInterval = 9000 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const posterWrapRef = useRef<HTMLDivElement>(null);
  const normalizedAutoScrollInterval = Math.max(2000, Number(autoScrollInterval) || 9000);
  const progressStartRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const moviesLengthRef = useRef(movies.length);
  moviesLengthRef.current = movies.length;

  const currentMovie = movies[currentIndex] || movies[0] || null;

  // Shared single transition identity — every visual piece of the slide uses this ONE key.
  // This is the heart of the "all change together" behavior.
  const slideKey = useMemo(
    () => `hero-sync-${currentIndex}-${currentMovie?.id ?? '-'}`,
    [currentIndex, currentMovie?.id],
  );

  // ====== Global mouse parallax (120 FPS springs) ======
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springMouseX = useSpring(mouseX, springSoft);
  const springMouseY = useSpring(mouseY, springSoft);
  const deepMouseX = useSpring(mouseX, { stiffness: 70, damping: 20, mass: 0.9 });
  const deepMouseY = useSpring(mouseY, { stiffness: 70, damping: 20, mass: 0.9 });
  const farMouseX = useSpring(mouseX, { stiffness: 40, damping: 18, mass: 1.2 });
  const farMouseY = useSpring(mouseY, { stiffness: 40, damping: 18, mass: 1.2 });

  const bgX = useTransform(deepMouseX, (v) => v * 0.015);
  const bgY = useTransform(deepMouseY, (v) => v * 0.015);
  const contentX = useTransform(springMouseX, (v) => -v * 0.015);
  const contentY = useTransform(springMouseY, (v) => -v * 0.015);
  const posterX = useTransform(springMouseX, (v) => v * 0.035);
  const posterY = useTransform(springMouseY, (v) => v * 0.035);
  const counterX = useTransform(farMouseX, (v) => v * 0.015);
  const counterY = useTransform(farMouseY, (v) => v * 0.015);

  // ====== Poster tilt / magnetic hover ======
  const tiltXMV = useMotionValue(0);
  const tiltYMV = useMotionValue(0);
  const tiltX = useSpring(tiltXMV, springMagnetic);
  const tiltY = useSpring(tiltYMV, springMagnetic);
  const posterRotateX = useTransform(tiltY, [-1, 1], ['8deg', '-8deg']);
  const posterRotateY = useTransform(tiltX, [-1, 1], ['-10deg', '10deg']);
  const glowX = useTransform(tiltX, [-1, 1], ['20%', '80%']);
  const glowY = useTransform(tiltY, [-1, 1], ['20%', '80%']);
  const posterSheen = useMotionTemplate`radial-gradient(60% 45% at ${glowX} ${glowY}, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 55%, transparent 70%)`;

  // ====== Auto-progress + index loop ======
  useEffect(() => {
    if (movies.length <= 1) return;
    const tick = () => {
      if (!isPaused) {
        const elapsed = performance.now() - progressStartRef.current;
        const p = Math.min(1, elapsed / normalizedAutoScrollInterval);
        setProgress(p);
        if (p >= 1) {
          progressStartRef.current = performance.now();
          const len = Math.max(1, moviesLengthRef.current);
          const next = (currentIndexRef.current + 1) % len;
          currentIndexRef.current = next;
          setProgress(0);
          setCurrentIndex(next);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [movies.length, normalizedAutoScrollInterval, isPaused]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    progressStartRef.current = performance.now();
    setProgress(0);
  }, [currentIndex]);

  // ====== Keyboard nav ======
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const len = Math.max(1, moviesLengthRef.current);
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((p) => (p - 1 + len) % len);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((p) => (p + 1) % len);
      } else if ((e.key === ' ' || e.code === 'Space') && containerRef.current) {
        const active = document.activeElement as HTMLElement | null;
        const isTyping =
          active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!isTyping) {
          e.preventDefault();
          setIsPaused((p) => !p);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ====== Global mouse move (single unified source) ======
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx * rect.width);
    mouseY.set(ny * rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    tiltXMV.set(0);
    tiltYMV.set(0);
  };

  // ====== Cinematic poster magnetic tilt ======
  const handlePosterMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!posterWrapRef.current) return;
    const r = posterWrapRef.current.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (2 * (e.clientX - r.left)) / r.width - 1));
    const ny = Math.max(-1, Math.min(1, (2 * (e.clientY - r.top)) / r.height - 1));
    tiltXMV.set(nx);
    tiltYMV.set(ny);
  };

  const handlePrev = () =>
    setCurrentIndex((p) => (p - 1 + Math.max(1, movies.length)) % Math.max(1, movies.length));
  const handleNext = () => setCurrentIndex((p) => (p + 1) % Math.max(1, movies.length));

  if (!currentMovie) return null;

  const handleOpenMovie = () => {
    const detailsHref =
      currentMovie.contentType === 'tv'
        ? `/tv/${currentMovie.id}`
        : `/movie/${currentMovie.id}`;
    router.push(isUserAuthenticated() ? detailsHref : '/login');
  };

  const yearLabel =
    currentMovie.contentType === 'tv'
      ? `${currentMovie.startYear ?? currentMovie.releaseYear ?? 'N/A'}${
          currentMovie.endYear ? ` - ${currentMovie.endYear}` : ''
        }`
      : `${currentMovie.releaseYear ?? currentMovie.startYear ?? 'N/A'}`;
  const runtimeLabel =
    currentMovie.contentType === 'tv' ? 'TV Series' : currentMovie.runtime || 'Featured';
  const typeLabel =
    currentMovie.contentType === 'tv' ? 'Original Series' : 'Now Playing';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsPaused(true)}
      className="relative w-full h-[100svh] min-h-[560px] sm:min-h-[640px] md:min-h-[760px] lg:min-h-[820px] overflow-hidden bg-black isolate"
    >
      {/* ===================== UNIFIED SLIDE — ONE key, ONE AnimatePresence  ===================== */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slideKey}
          className="absolute inset-0"
          initial="hidden"
          animate="show"
          exit="exit"
          transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: STAGGER, delayChildren: 0 } },
            exit: { transition: { staggerChildren: STAGGER * 0.55, staggerDirection: -1 } },
          }}
        >
          {/* 1) BACKDROP LAYER — Ken Burns cinematic zoom + parallax + 120 FPS deep mouse */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 1.18 },
              show: {
                opacity: 1,
                scale: [1.18, 1.05, 1.0],
                transition: {
                  duration: UNIFIED_DURATION * 1.35,
                  ease: UNIFIED_EASE,
                  times: [0, 0.55, 1],
                },
              },
              exit: { opacity: 0, scale: 1.08 },
            }}
            style={{ x: bgX, y: bgY, willChange: 'transform, opacity' }}
            className="absolute inset-0 -z-10"
          >
            <Image
              src={currentMovie.backdropPath}
              alt={currentMovie.title}
              fill
              priority
              quality={95}
              className="object-cover"
              sizes="100vw"
            />
            {/* Gradient vignettes for depth */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-black/10" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.18),transparent_55%)]" />
          </motion.div>

          {/* 2) CONTENT LAYER — Left text + Right poster together on same shared stagger */}
          <motion.div
            variants={{ hidden: {}, show: {}, exit: {} }}
            style={{ x: contentX, y: contentY, willChange: 'transform' }}
            className="absolute inset-0 z-10"
          >
            <div className="relative h-full w-full px-4 sm:px-6 lg:px-14 xl:px-20 pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-28 flex items-end md:items-center gap-8 lg:gap-14">
              {/* ===== LEFT — Text column (staggered with the same unified delay) ===== */}
              <motion.div
                variants={{ hidden: {}, show: {}, exit: {} }}
                className="w-full md:w-1/2 lg:w-[52%] shrink-0"
              >
                {/* Badge row */}
                <motion.div
                  variants={{
                    hidden: { y: 22, opacity: 0, filter: 'blur(8px)' },
                    show: { y: 0, opacity: 1, filter: 'blur(0px)' },
                    exit: { y: -16, opacity: 0, filter: 'blur(6px)' },
                  }}
                  transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
                  className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4 md:mb-5"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-red-600/95 to-rose-500/90 text-white text-[11px] sm:text-xs font-semibold rounded-full shadow-[0_16px_50px_rgba(244,63,94,0.35)] ring-1 ring-white/15 tracking-wide">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    {typeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/8 text-white/90 text-[11px] sm:text-xs font-medium border border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                    4K Ultra HD
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/8 text-white/90 text-[11px] sm:text-xs font-medium border border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                    HDR · Dolby Atmos
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  variants={{
                    hidden: { y: 54, opacity: 0, filter: 'blur(10px)' },
                    show: { y: 0, opacity: 1, filter: 'blur(0px)' },
                    exit: { y: -34, opacity: 0, filter: 'blur(8px)' },
                  }}
                  transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
                  className="font-black tracking-[-0.04em] leading-[0.88] text-white text-3xl sm:text-5xl md:text-6xl lg:text-[4.8rem] xl:text-[6.2rem] mb-3 sm:mb-4 md:mb-5"
                  style={{
                    textShadow:
                      '0 22px 80px rgba(0,0,0,0.72), 0 6px 26px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  {currentMovie.title}
                </motion.h2>

                {/* Tagline */}
                {currentMovie.tagline && (
                  <motion.div
                    variants={{
                      hidden: { y: 28, opacity: 0, filter: 'blur(8px)' },
                      show: { y: 0, opacity: 1, filter: 'blur(0px)' },
                      exit: { y: -18, opacity: 0, filter: 'blur(6px)' },
                    }}
                    transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
                    className="mb-3 sm:mb-4 md:mb-5"
                  >
                    <p className="font-serif italic text-sm sm:text-base md:text-xl leading-snug text-white/70">
                      “{currentMovie.tagline}”
                    </p>
                  </motion.div>
                )}

                {/* Meta + Rating + Genres */}
                <motion.div
                  variants={{
                    hidden: { y: 24, opacity: 0, filter: 'blur(8px)' },
                    show: { y: 0, opacity: 1, filter: 'blur(0px)' },
                    exit: { y: -14, opacity: 0, filter: 'blur(6px)' },
                  }}
                  transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
                  className="mb-3 sm:mb-4 md:mb-5"
                >
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 md:gap-4">
                    <span className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/8 text-white/90 text-xs sm:text-sm font-bold border border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-amber-400 shrink-0"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="font-bold tabular-nums">{formatRating(currentMovie.rating)}</span>
                    </span>
                    <span className="inline-flex items-center px-3 sm:px-3.5 py-1.5 rounded-full bg-white/8 text-white/90 text-xs sm:text-sm font-medium border border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                      {yearLabel}
                    </span>
                    <span className="inline-flex items-center px-3 sm:px-3.5 py-1.5 rounded-full bg-white/8 text-white/90 text-xs sm:text-sm font-medium border border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                      {runtimeLabel}
                    </span>
                    <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-white/8 text-white/85 text-[11px] sm:text-xs font-bold tracking-wider border border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                      {currentMovie.contentType === 'tv' ? 'TV-MA' : 'PG-13'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2.5 sm:mt-3">
                    {currentMovie.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-white/5 text-white/80 text-[11px] sm:text-xs font-medium border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Overview */}
                <motion.div
                  variants={{
                    hidden: { y: 22, opacity: 0, filter: 'blur(8px)' },
                    show: { y: 0, opacity: 1, filter: 'blur(0px)' },
                    exit: { y: -12, opacity: 0, filter: 'blur(6px)' },
                  }}
                  transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
                  className="mb-5 sm:mb-6 md:mb-7 max-w-[92%] md:max-w-[92%]"
                >
                  <p className="text-sm sm:text-[15px] md:text-base leading-relaxed text-white/70 line-clamp-2 sm:line-clamp-3 md:line-clamp-3">
                    {currentMovie.overview}
                  </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  variants={{
                    hidden: { y: 28, opacity: 0, filter: 'blur(10px)' },
                    show: { y: 0, opacity: 1, filter: 'blur(0px)' },
                    exit: { y: -16, opacity: 0, filter: 'blur(8px)' },
                  }}
                  transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
                  className="flex flex-wrap items-center gap-2.5 sm:gap-3 md:gap-4 relative z-20"
                >
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpenMovie}
                    onMouseDown={(e) => e.stopPropagation()}
                    type="button"
                    className="group inline-flex items-center gap-2 px-5 sm:px-7 md:px-8 py-3 sm:py-3.5 rounded-full bg-white text-black text-sm sm:text-base font-bold shadow-[0_18px_50px_rgba(255,255,255,0.25)] hover:bg-white/95 transition-colors relative"
                  >
                    <Play fill="currentColor" size={18} className="sm:w-5 sm:h-5 shrink-0" />
                    <span className="tracking-wide">
                      {currentMovie.contentType === 'tv' ? 'Watch Series' : 'Play Now'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpenMovie}
                    onMouseDown={(e) => e.stopPropagation()}
                    type="button"
                    className="group inline-flex items-center gap-2 px-5 sm:px-7 md:px-8 py-3 sm:py-3.5 rounded-full bg-white/10 text-white text-sm sm:text-base font-semibold border border-white/20 backdrop-blur-sm shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:bg-white/15 transition-colors relative"
                  >
                    <Info size={18} className="sm:w-5 sm:h-5 shrink-0" />
                    <span className="tracking-wide">More Info</span>
                  </motion.button>

                  <div className="flex items-center gap-2 sm:gap-2.5 ml-1">
                    <motion.button
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      onMouseDown={(e) => e.stopPropagation()}
                      type="button"
                      aria-label="Add to my list"
                      className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/8 text-white border border-white/15 backdrop-blur-sm shadow-[0_14px_40px_rgba(0,0,0,0.35)] hover:bg-white/12 transition-colors"
                    >
                      <Plus size={18} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      onMouseDown={(e) => e.stopPropagation()}
                      type="button"
                      aria-label="Save to watchlist"
                      className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/8 text-white border border-white/15 backdrop-blur-sm shadow-[0_14px_40px_rgba(0,0,0,0.35)] hover:bg-white/12 transition-colors"
                    >
                      <ListPlus size={17} strokeWidth={2.4} className="sm:w-[19px] sm:h-[19px]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setMuted((m) => !m)}
                      onMouseDown={(e) => e.stopPropagation()}
                      type="button"
                      aria-label={muted ? 'Unmute' : 'Mute'}
                      className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/8 text-white border border-white/15 backdrop-blur-sm shadow-[0_14px_40px_rgba(0,0,0,0.35)] hover:bg-white/12 transition-colors"
                    >
                      {muted ? (
                        <VolumeX size={17} strokeWidth={2.4} className="sm:w-[19px] sm:h-[19px]" />
                      ) : (
                        <Volume2 size={17} strokeWidth={2.4} className="sm:w-[19px] sm:h-[19px]" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* ===== RIGHT — Cinematic floating poster (NEW) ===== */}
              <motion.div
                variants={{
                  hidden: {
                    opacity: 0,
                    x: 80,
                    y: 20,
                    rotate: 6,
                    filter: 'blur(14px)',
                  },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    filter: 'blur(0px)',
                    transition: {
                      duration: UNIFIED_DURATION,
                      ease: UNIFIED_EASE,
                    },
                  },
                  exit: {
                    opacity: 0,
                    x: 90,
                    y: -10,
                    rotate: -6,
                    filter: 'blur(14px)',
                  },
                }}
                style={{ x: posterX, y: posterY, willChange: 'transform' }}
                className="hidden md:flex w-[44%] lg:w-[40%] xl:w-[36%] shrink-0 justify-center items-center pointer-events-auto"
              >
                <div
                  ref={posterWrapRef}
                  onMouseMove={handlePosterMove}
                  className="relative w-full max-w-[320px] lg:max-w-[360px] perspective-[1200px]"
                  style={{ perspective: '1200px' }}
                >
                  {/* Cinematic colored glow backdrop */}
                  <motion.div
                    aria-hidden
                    className="absolute -inset-6 sm:-inset-10 pointer-events-none"
                    variants={{
                      hidden: { opacity: 0, scale: 0.92 },
                      show: { opacity: 1, scale: 1, transition: { duration: UNIFIED_DURATION * 1.3, ease: UNIFIED_EASE } },
                      exit: { opacity: 0, scale: 0.92 },
                    }}
                  >
                    <div className="absolute inset-0 rounded-[42px] bg-gradient-to-br from-rose-500/35 via-fuchsia-500/25 to-indigo-500/30 blur-3xl" />
                    <div className="absolute inset-0 rounded-[42px] bg-gradient-to-tr from-amber-400/25 via-orange-500/20 to-red-500/20 blur-2xl" />
                  </motion.div>

                  {/* Tilted poster stage */}
                  <motion.div
                    style={{
                      rotateX: posterRotateX,
                      rotateY: posterRotateY,
                      transformStyle: 'preserve-3d',
                      transformPerspective: 1200,
                    }}
                    className="relative aspect-[2/3] w-full rounded-[28px] sm:rounded-[34px] shadow-[0_60px_140px_-20px_rgba(0,0,0,0.8),0_30px_70px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
                  >
                    {/* Poster image */}
                    <div className="absolute inset-0 rounded-[28px] sm:rounded-[34px] overflow-hidden">
                      <Image
                        src={currentMovie.posterPath}
                        alt={`${currentMovie.title} poster`}
                        fill
                        priority
                        quality={95}
                        className="object-cover"
                        sizes="(max-width: 1024px) 360px, 360px"
                      />
                    </div>

                    {/* Specular sheen (follows cursor) */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[34px] mix-blend-overlay opacity-90"
                      style={{ backgroundImage: posterSheen }}
                    />

                    {/* Soft top/bottom depth gradients */}
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[34px] bg-gradient-to-b from-white/10 via-transparent to-black/55" />
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[34px] ring-1 ring-inset ring-white/10" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 3) COUNTER BADGE — same stagger, same shared spring timing */}
          {movies.length > 1 && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -14, scale: 0.9 },
                show: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: -10, scale: 0.92 },
              }}
              transition={{ duration: UNIFIED_DURATION, ease: UNIFIED_EASE }}
              className="hidden sm:inline-flex absolute top-28 lg:top-32 right-6 lg:right-10 z-30 items-baseline gap-1.5 px-4 py-2 rounded-full border border-white/14 bg-black/40 text-white/85 text-xs sm:text-sm font-bold tracking-widest backdrop-blur-md shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
              style={{ x: counterX, y: counterY }}
            >
              <span className="text-white font-black text-base sm:text-lg tabular-nums">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-white/50 text-[10px] sm:text-xs">
                / {String(movies.length).padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Layer 3 — Progress pill indicators (static shell, animated fill) */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-auto">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
            {movies.map((m, index) => {
              const isActive = index === currentIndex;
              const isBefore = index < currentIndex;
              return (
                <motion.button
                  key={`pill-${index}-${m.id}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCurrentIndex(index)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    'group relative h-2.5 sm:h-3 rounded-full overflow-hidden transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.55)]',
                    isActive
                      ? 'w-14 sm:w-20 bg-white/15 ring-1 ring-white/15'
                      : isBefore
                        ? 'w-2.5 sm:w-3 bg-white/70 hover:bg-white/90'
                        : 'w-2.5 sm:w-3 bg-white/30 hover:bg-white/60',
                  )}
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-fuchsia-500 shadow-[0_0_18px_rgba(244,63,94,0.65)]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.05, ease: 'linear' }}
                    />
                  )}
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-0 group-hover:opacity-70 transition-opacity" />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Prev / Next floating arrows */}
      {movies.length > 1 && (
        <div className="hidden md:flex items-center justify-between absolute left-3 lg:left-6 right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-[calc(100%-1.5rem)] lg:w-[calc(100%-3rem)] pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={handlePrev}
            type="button"
            aria-label="Previous slide"
            className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-black/45 text-white border border-white/15 backdrop-blur-md hover:bg-black/60 transition-colors shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleNext}
            type="button"
            aria-label="Next slide"
            className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-black/45 text-white border border-white/15 backdrop-blur-md hover:bg-black/60 transition-colors shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  );
}
