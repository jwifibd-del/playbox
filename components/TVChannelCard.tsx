'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Pause, Star, Users, Zap, Shield, Globe, Languages, Radio, ChevronRight } from 'lucide-react';
import { TvChannel } from '@/lib/data';
import { cn } from '@/lib/utils';

interface TVChannelCardProps {
  channel: TvChannel;
  onPlay?: (channel: TvChannel) => void;
  index?: number;
}

export function TVChannelCard({ channel, onPlay, index = 0 }: TVChannelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 30, mass: 0.5 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 30, mass: 0.5 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const accentColor = (() => {
    const cat = (channel.category || '').toLowerCase();
    if (cat.includes('news')) return 'from-red-500 to-orange-500';
    if (cat.includes('sport')) return 'from-emerald-500 to-teal-500';
    if (cat.includes('movie') || cat.includes('entertainment')) return 'from-purple-500 to-pink-500';
    if (cat.includes('kid') || cat.includes('cartoon')) return 'from-yellow-400 to-orange-400';
    if (cat.includes('music')) return 'from-pink-500 to-rose-500';
    if (cat.includes('doc')) return 'from-blue-500 to-cyan-500';
    if (cat.includes('lifestyle') || cat.includes('food')) return 'from-amber-500 to-yellow-500';
    if (cat.includes('culture')) return 'from-violet-500 to-indigo-500';
    return 'from-cyan-500 to-blue-500';
  })();

  const formatViewers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPlay?.(channel)}
      initial={{ opacity: 0, y: 30, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay: index * 0.03 }}
      className={cn(
        'group relative cursor-pointer select-none',
        'rounded-3xl overflow-hidden',
        'bg-gradient-to-br from-zinc-900/80 to-zinc-950/80',
        'border border-zinc-800/80',
        'backdrop-blur-xl',
        'transition-all duration-500',
        isHovered
          ? 'shadow-2xl scale-[1.02] border-zinc-700'
          : 'shadow-lg'
      )}
    >
      {/* Animated gradient border glow */}
      <motion.div
        className={cn(
          'pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500',
          `bg-gradient-to-br ${accentColor}`
        )}
        style={{
          opacity: isHovered ? 0.35 : 0,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1.5px',
        }}
      />

      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Category badge + quality badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'px-3 py-1.5 rounded-xl backdrop-blur-xl border text-xs font-bold uppercase tracking-wider',
            `bg-gradient-to-r ${accentColor} text-white border-white/20 shadow-lg`
          )}
        >
          {channel.category || 'General'}
        </motion.div>

        <div className="flex gap-1.5">
          {channel.isHD && (
            <span className="px-2 py-1 rounded-lg bg-white/10 backdrop-blur-xl border border-white/10 text-[10px] font-bold text-white">
              HD
            </span>
          )}
          {channel.is4K && (
            <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-xl border border-amber-400/30 text-[10px] font-bold text-white shadow">
              4K
            </span>
          )}
          {channel.isPaid && (
            <span className="px-2 py-1 rounded-lg bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 text-[10px] font-bold text-purple-300">
              <Shield className="w-3 h-3 inline mr-0.5" />
              PAID
            </span>
          )}
          {channel.isFeatured && (
            <span className="px-2 py-1 rounded-lg bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 text-[10px] font-bold text-amber-300">
              <Zap className="w-3 h-3 inline mr-0.5" />
              FEATURED
            </span>
          )}
        </div>
      </div>

      {/* Logo area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {/* Animated background */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-700',
          `bg-gradient-to-br ${accentColor} opacity-20`
        )} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Channel logo */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {channel.logoPath && !imageError ? (
            <motion.img
              key={channel.id}
              src={channel.logoPath}
              alt={channel.name}
              onError={() => setImageError(true)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={cn(
                'max-w-full max-h-full object-contain drop-shadow-2xl',
                'transition-all duration-700',
                isHovered ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]' : ''
              )}
              style={{ transform: 'translateZ(40px)' }}
            />
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ transform: 'translateZ(40px)' }}
              className={cn(
                'w-full h-full flex items-center justify-center rounded-2xl',
                `bg-gradient-to-br ${accentColor} bg-opacity-30 backdrop-blur-sm`,
                'border border-white/10'
              )}
            >
              <Radio className="w-12 h-12 text-white/80 drop-shadow-xl" />
            </motion.div>
          )}
        </div>

        {/* Live indicator pulsing dot */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
            Live
          </span>
        </div>

        {/* Viewer count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10"
        >
          <Users className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-medium text-white">
            {formatViewers(channel.viewerCount)}
          </span>
        </motion.div>
      </div>

      {/* Bottom info area */}
      <div className="relative p-4">
        {/* Channel name + rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-white truncate tracking-tight" style={{ transform: 'translateZ(20px)' }}>
            {channel.name}
          </h3>
          {channel.rating > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-500/10 border border-yellow-400/20 shrink-0">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">{channel.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Country + Language */}
        <div className="flex items-center gap-3 mb-3">
          {channel.country && (
            <div className="flex items-center gap-1 text-zinc-400 text-xs">
              <Globe className="w-3 h-3" />
              <span className="truncate">{channel.country}</span>
            </div>
          )}
          {channel.language && (
            <div className="flex items-center gap-1 text-zinc-400 text-xs">
              <Languages className="w-3 h-3" />
              <span className="truncate">{channel.language}</span>
            </div>
          )}
        </div>

        {/* Now playing */}
        {channel.nowPlaying && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Now Playing
            </p>
            <p className="text-sm text-zinc-200 line-clamp-1 font-medium">
              {channel.nowPlaying}
            </p>
          </div>
        )}

        {/* Next program */}
        {channel.nextProgram && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Next Up
            </p>
            <p className="text-xs text-zinc-400 line-clamp-1">
              {channel.nextProgram}
            </p>
          </div>
        )}

        {/* Play button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(channel);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm',
            'transition-all duration-300 group/btn',
            `bg-gradient-to-r ${accentColor} text-white shadow-lg hover:shadow-2xl`,
            'border border-white/20'
          )}
        >
          <Play className="w-4 h-4 fill-white group-hover/btn:scale-110 transition-transform" />
          Watch Channel
          <ChevronRight className="w-4 h-4 opacity-70 -ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}
