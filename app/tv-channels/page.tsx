'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Radio,
  Search,
  ChevronRight,
  Play,
  Star,
  Users,
  Zap,
  Globe,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Tv2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TVChannelsRow } from '@/components/TVChannelsRow';
import { TVChannelCard } from '@/components/TVChannelCard';
import { fetchTvChannels } from '@/lib/api';
import {
  TvChannel,
  getTvChannelCategories,
  getTvChannels,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import type { MediaSourceType } from '@/lib/data';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
});

function detectStreamSourceType(url: string): MediaSourceType {
  if (!url) return 'MP4';
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    if (pathname.endsWith('.m3u8')) return 'M3U8';
    if (pathname.endsWith('.ts')) return 'TS';
    if (pathname.endsWith('.mp4')) return 'MP4';
    if (pathname.endsWith('.webm')) return 'WebM';
    if (pathname.endsWith('.mkv')) return 'MKV';
    if (u.protocol === 'rtmp:' || u.protocol === 'rtmps:') return 'RTMP';
    if (
      pathname.includes('.m3u8') ||
      u.searchParams.get('format') === 'hls' ||
      u.searchParams.get('type') === 'hls'
    ) {
      return 'HLS';
    }
    // Fallback: treat unknown HTTP(S) live endpoints as HLS for best compatibility
    if (u.protocol === 'http:' || u.protocol === 'https:') return 'HLS';
    return 'MP4';
  } catch {
    return 'MP4';
  }
}

function isValidStreamUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    return (
      u.protocol === 'http:' ||
      u.protocol === 'https:' ||
      u.protocol === 'rtmp:' ||
      u.protocol === 'rtmps:'
    );
  } catch {
    return false;
  }
}

const categoryIcons: Record<string, any> = {
  News: TrendingUp,
  Sports: Zap,
  Entertainment: Sparkles,
  Documentary: Globe,
  Kids: Star,
  Music: Radio,
  Lifestyle: Sparkles,
  Culture: Globe,
};

const CATEGORY_COLORS: Record<string, string> = {
  News: 'from-red-500/20 to-orange-500/10 border-red-500/30 text-red-300 hover:border-red-400/60',
  Sports: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/60',
  Entertainment: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300 hover:border-purple-400/60',
  Documentary: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300 hover:border-blue-400/60',
  Kids: 'from-yellow-400/20 to-orange-400/10 border-yellow-400/30 text-yellow-300 hover:border-yellow-400/60',
  Music: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-300 hover:border-pink-400/60',
  Lifestyle: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400/60',
  Culture: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30 text-violet-300 hover:border-violet-400/60',
};

function getCategoryStyle(cat: string): string {
  return (
    CATEGORY_COLORS[cat] ||
    'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60'
  );
}

export default function TvChannelsPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [channels, setChannels] = useState<TvChannel[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<TvChannel | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setHydrated(true);
    async function load() {
      const data = await fetchTvChannels(false);
      setChannels(data);
      setCategories(getTvChannelCategories());
    }
    load();
  }, []);

  // Sync categories from channels
  useEffect(() => {
    if (channels.length > 0) {
      const cats = new Set<string>();
      channels.forEach((c) => c.category && cats.add(c.category));
      setCategories(Array.from(cats).sort());
    }
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let list = channels;
    if (selectedCategory !== 'All') {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q) ||
          (c.country || '').toLowerCase().includes(q) ||
          (c.nowPlaying || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [channels, selectedCategory, searchQuery]);

  const featuredChannels = useMemo(
    () => channels.filter((c) => c.isFeatured && c.isActive),
    [channels]
  );

  const byCategory = useMemo(() => {
    const m: Record<string, TvChannel[]> = {};
    for (const ch of channels.filter((c) => c.isActive)) {
      const cat = ch.category || 'Other';
      if (!m[cat]) m[cat] = [];
      m[cat].push(ch);
    }
    return m;
  }, [channels]);

  const handlePlay = (channel: TvChannel) => {
    setActiveChannel(channel);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading TV Channels...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero section */}
        <section className="relative pt-24 sm:pt-28 md:pt-32 pb-10 md:pb-14 px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
              <Link href="/" className="hover:text-zinc-300 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">TV Channels</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start lg:items-end">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex-1 min-w-0"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/30 backdrop-blur-xl mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">
                    Live Now · {channels.filter((c) => c.isActive).length} Channels
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-5">
                  <span className="text-white">TV Channels</span>
                  <br />
                  <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Live & 24/7
                  </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mb-8 leading-relaxed">
                  Browse our curated collection of premium live TV channels from around the world. News, sports, movies, music, documentaries — all streaming in stunning HD and 4K quality.
                </p>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search channels, shows, countries..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all text-sm sm:text-base"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Tv2 className="w-5 h-5 text-red-400" />
                    <span>
                      <span className="text-white font-bold">{filteredChannels.length}</span> of {channels.length} channels
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Featured mini preview on right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                className="w-full lg:w-[420px] shrink-0"
              >
                {featuredChannels.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handlePlay(featuredChannels[0])}
                    className="cursor-pointer group relative rounded-[32px] overflow-hidden bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800 p-5 shadow-2xl"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 backdrop-blur-xl">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Featured</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        24/7
                      </div>
                    </div>

                    <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mb-4 overflow-hidden relative group">
                      {featuredChannels[0].logoPath ? (
                        <img
                          src={featuredChannels[0].logoPath}
                          alt={featuredChannels[0].name}
                          className="max-w-[70%] max-h-[70%] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Radio className="w-16 h-16 text-zinc-500" />
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl border border-white/30"
                        >
                          <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{featuredChannels[0].name}</h3>
                        <p className="text-sm text-zinc-400">{featuredChannels[0].category} · {featuredChannels[0].country}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-400/20">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">{featuredChannels[0].rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {featuredChannels[0].nowPlaying && (
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Now Playing</p>
                        <p className="text-sm font-medium text-zinc-100 line-clamp-1">{featuredChannels[0].nowPlaying}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Category chips */}
        <section className="px-4 sm:px-6 md:px-10 lg:px-16 pb-6 md:pb-8 sticky top-[72px] sm:top-[80px] z-30 bg-gradient-to-b from-[#080808] via-[#080808]/95 to-transparent backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
              <style jsx>{`
                section::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <CategoryChip
                active={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')}
                label="All Channels"
                count={channels.filter((c) => c.isActive).length}
                styleClass="from-zinc-100/10 to-white/5 border-zinc-700 text-zinc-200 hover:border-zinc-500 data-[active=true]:border-white data-[active=true]:from-white/20 data-[active=true]:to-white/10 data-[active=true]:text-white"
              />
              {categories.map((cat) => {
                const count = (byCategory[cat] || []).length;
                if (count === 0) return null;
                return (
                  <CategoryChip
                    key={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                    label={cat}
                    count={count}
                    icon={categoryIcons[cat]}
                    styleClass={getCategoryStyle(cat)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 sm:px-6 md:px-10 lg:px-16 pb-20">
          <div className="max-w-7xl mx-auto">
            {selectedCategory === 'All' && !searchQuery.trim() ? (
              <>
                {/* Featured row first */}
                {featuredChannels.length > 0 && (
                  <TVChannelsRow
                    title="Featured Channels"
                    description="Hand-picked premium channels you'll love"
                    channels={featuredChannels}
                    onPlay={handlePlay}
                  />
                )}

                {/* Rows per category */}
                {categories.map((cat) => {
                  const list = byCategory[cat] || [];
                  if (list.length === 0) return null;
                  return (
                    <TVChannelsRow
                      key={cat}
                      title={cat}
                      description={`${list.length} ${cat.toLowerCase()} channels streaming live`}
                      channels={list}
                      onPlay={handlePlay}
                    />
                  );
                })}
              </>
            ) : (
              <section className="py-8">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {searchQuery.trim()
                        ? `Search: "${searchQuery}"`
                        : selectedCategory}
                      <span className="ml-3 text-base font-medium text-zinc-500">
                        {filteredChannels.length} results
                      </span>
                    </h2>
                    {selectedCategory !== 'All' && !searchQuery.trim() && (
                      <p className="text-zinc-400 mt-1">
                        Browse all {selectedCategory} channels
                      </p>
                    )}
                  </div>
                </div>

                {filteredChannels.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center">
                      <Search className="w-9 h-9 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No channels found</h3>
                    <p className="text-zinc-500">Try a different search term or category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {filteredChannels.map((ch, idx) => (
                      <TVChannelCard key={`tv-grid-${String(ch.id)}`} channel={ch} onPlay={handlePlay} index={idx} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </section>

        <Footer />
      </div>

      {/* Channel preview modal */}
      <AnimatePresence>
        {showPreview && activeChannel && (
          <ChannelPreviewModal channel={activeChannel} onClose={closePreview} />
        )}
      </AnimatePresence>
    </main>
  );
}

interface CategoryChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: any;
  styleClass?: string;
}
function CategoryChip({ active, onClick, label, count, icon: Icon, styleClass }: CategoryChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-active={active}
      className={cn(
        'shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-300',
        'bg-gradient-to-br backdrop-blur-xl',
        styleClass,
        active && 'shadow-lg scale-[1.02]'
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      <span
        className={cn(
          'px-2 py-0.5 rounded-lg text-[10px] font-bold border',
          active
            ? 'bg-white/15 border-white/20 text-white'
            : 'bg-black/20 border-black/20 text-inherit/80'
        )}
      >
        {count}
      </span>
    </motion.button>
  );
}

function ChannelPreviewModal({ channel, onClose }: { channel: TvChannel; onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const streamValid = isValidStreamUrl(channel.streamUrl);
  const sourceType = detectStreamSourceType(channel.streamUrl);

  const startPlayback = () => {
    if (!streamValid) {
      setStreamError(`Invalid stream URL: ${channel.streamUrl || '(empty)'}. Only http://, https://, and rtmp:// URLs are supported.`);
      return;
    }
    setStreamError(null);
    setIsPlaying(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, type: 'spring', bounce: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-[32px] overflow-hidden bg-zinc-950/95 border border-zinc-800 shadow-2xl"
      >
        {/* Preview / player surface */}
        <div className="relative aspect-video bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center overflow-hidden">
          {isPlaying && streamValid ? (
            <VideoPlayer
              key={`tv-stream-${String(channel.id)}`}
              src={channel.streamUrl}
              sourceType={sourceType}
              poster={channel.logoPath}
              title={channel.name}
              autoplay
              videoId={`tv-${String(channel.id)}`}
              is4K={Boolean(channel.is4K)}
            />
          ) : (
            <>
              {/* Animated grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              {/* Gradient blobs */}
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-red-500/15 blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />

              {channel.logoPath && (
                <img
                  src={channel.logoPath}
                  alt={channel.name}
                  className="relative z-10 max-w-[40%] max-h-[40%] object-contain drop-shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              {/* Center play */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={startPlayback}
                className="relative z-10 mt-10 w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/40 border border-white/30 hover:shadow-red-500/60 transition-shadow"
              >
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </motion.button>

              {streamError && (
                <div className="absolute inset-x-4 bottom-4 z-20 px-4 py-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-sm text-red-200 backdrop-blur-xl">
                  {streamError}
                </div>
              )}
            </>
          )}

          {/* Live badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/90 backdrop-blur-xl border border-red-400/50 z-20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/90 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              LIVE
            </span>
          </div>

          {/* Viewers */}
          <div className="absolute top-4 right-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 z-20">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {channel.viewerCount >= 1000
                ? `${(channel.viewerCount / 1000).toFixed(channel.viewerCount >= 10000 ? 0 : 1)}K`
                : channel.viewerCount}{' '}
              watching
            </span>
          </div>

          {/* Stream-type chip */}
          <div className="absolute top-4 right-48 px-2.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 z-20 text-[11px] font-bold text-zinc-200">
            {sourceType} · {(channel.streamUrl || '').split('://')[0] || 'http'}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info panel */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {channel.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                {channel.category && (
                  <span className="px-2.5 py-1 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-200 font-medium">
                    {channel.category}
                  </span>
                )}
                {channel.country && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    {channel.country}
                  </span>
                )}
                {channel.isHD && (
                  <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[11px] font-bold text-white">
                    HD
                  </span>
                )}
                {channel.is4K && (
                  <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-[11px] font-bold text-white border border-amber-400/30">
                    4K
                  </span>
                )}
                {channel.isPaid && (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-400/30 text-[11px] font-bold text-purple-300">
                    Premium
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {Number(channel.rating || 0).toFixed(1)}
                </span>
                {channel.streamUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 break-all max-w-[200px] sm:max-w-[280px] truncate">
                    {channel.streamUrl}
                  </span>
                )}
              </div>
            </div>

            {isPlaying ? (
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-zinc-800 text-white font-bold text-base border border-zinc-700 hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
                Stop Stream
              </button>
            ) : (
              <button
                type="button"
                onClick={startPlayback}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-base shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-shadow border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!streamValid}
              >
                <Play className="w-5 h-5 fill-white" />
                {streamValid ? 'Start Streaming' : 'Invalid Stream URL'}
              </button>
            )}
          </div>

          {channel.description && (
            <p className="text-zinc-300 text-base leading-relaxed mb-6">{channel.description}</p>
          )}

          {/* Now + Next */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channel.nowPlaying && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  Now Playing
                </p>
                <p className="text-lg font-bold text-white leading-snug line-clamp-2">
                  {channel.nowPlaying}
                </p>
              </div>
            )}
            {channel.nextProgram && (
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Next Up
                </p>
                <p className="text-lg font-semibold text-zinc-100 leading-snug line-clamp-2">
                  {channel.nextProgram}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
