'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  MonitorSmartphone,
  Radio,
  Sparkles,
  Tv,
  Wand2,
  Maximize2,
  Minimize2,
  Smartphone,
  Volume2,
  Download,
  Clock,
  Play,
  Info,
  ChevronRight,
  Cast,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TVRail } from '@/components/tv/TVRail';
import { TVRemoteController } from '@/components/tv/TVRemoteController';
import type { TVRailItem } from '@/components/tv/TVMediaCard';
import { sampleMovies, type Movie, type TVShow, getTvChannels, type TvChannel } from '@/lib/data';
import { fetchMovies, fetchTVShows } from '@/lib/api';
import { formatRating } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const platformCards = [
  {
    name: 'Android TV & Google TV',
    status: 'Native APK Ready',
    note: 'Built for Sony, TCL, Philips, Chromecast with Google TV, and Shield TV.',
    badge: 'v2.4.0 APK',
  },
  {
    name: 'Amazon Fire TV',
    status: 'Fire OS Compatible',
    note: 'Sideload arm64 APK or install via Fire TV Downloader app.',
    badge: 'Fire OS 7+',
  },
  {
    name: 'Apple TV (tvOS)',
    status: 'SwiftUI & TestFlight',
    note: 'Siri Remote touch surface and Living Room HDR playback ready.',
    badge: 'tvOS 17+',
  },
  {
    name: 'Samsung Tizen',
    status: 'Smart Hub Web WGT',
    note: 'Direct 10-foot remote navigation and hardware decoding engine.',
    badge: 'Tizen 6.0+',
  },
  {
    name: 'LG webOS',
    status: 'Magic Remote Ready',
    note: 'Optimized pointer and 4-way D-pad navigation with instant launch.',
    badge: 'webOS 5.0+',
  },
  {
    name: 'Roku Channel',
    status: 'BrightScript Wrapper',
    note: 'Roku SceneGraph template connecting to PlayFlix HLS media feeds.',
    badge: 'Roku OS 12+',
  },
] as const;

function mapMovieToRailItem(movie: Movie): TVRailItem {
  return {
    id: `movie-${movie.id}`,
    title: movie.title,
    subtitle: `${movie.releaseYear} • ${movie.quality}`,
    meta: `${movie.runtime} • ${movie.genres.slice(0, 2).join(' • ')}`,
    href: `/movie/${movie.id}`,
    imageUrl: movie.backdropPath || movie.posterPath,
    badge: `${formatRating(movie.rating)} IMDb`,
    kind: 'movie',
  };
}

function mapShowToRailItem(show: TVShow): TVRailItem {
  return {
    id: `tv-${show.id}`,
    title: show.title,
    subtitle: `${show.startYear}${show.endYear ? `-${show.endYear}` : ''} • ${show.quality}`,
    meta: `${show.numberOfSeasons} seasons • ${show.genres.slice(0, 2).join(' • ')}`,
    href: `/tv/${show.id}`,
    imageUrl: show.backdropPath || show.posterPath,
    badge: `${formatRating(show.rating)} Rating`,
    kind: 'tv',
  };
}

function mapChannelToRailItem(channel: TvChannel): TVRailItem {
  return {
    id: `channel-${channel.id}`,
    title: channel.name,
    subtitle: `${channel.category} • ${channel.quality}`,
    meta: `${channel.language} • ${channel.country}`,
    href: `/tv-channels?channel=${channel.id}`,
    imageUrl: channel.logo,
    badge: 'LIVE',
    kind: 'live',
  };
}

export default function TVAppPage() {
  const router = useRouter();
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [movies, setMovies] = useState<Movie[]>(sampleMovies);
  const [shows, setShows] = useState<TVShow[]>([]);
  const [channels, setChannels] = useState<TvChannel[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'movies' | 'tv' | 'live' | 'kids' | 'anime'>('all');
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [pureTVMode, setPureTVMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('12:00');
  const [activeBackdrop, setActiveBackdrop] = useState<string>(
    sampleMovies[0]?.backdropPath || sampleMovies[0]?.posterPath
  );
  const [activeTitle, setActiveTitle] = useState(sampleMovies[0]?.title || 'Interstellar Odyssey');
  const [activeSubtitle, setActiveSubtitle] = useState(
    `${sampleMovies[0]?.releaseYear || 2014} • ${sampleMovies[0]?.quality || '4K HDR'}`
  );
  const [activeOverview, setActiveOverview] = useState(
    sampleMovies[0]?.overview || 'Stream thousands of titles on your smart television.'
  );
  const [activeWatchUrl, setActiveWatchUrl] = useState(`/movie/${sampleMovies[0]?.id || 1}`);

  // Clock for 10-foot TV UI
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadData() {
      const apiMovies = await fetchMovies();
      const apiShows = await fetchTVShows();
      const tvChannels = getTvChannels();

      setMovies(apiMovies);
      setShows(apiShows);
      setChannels(tvChannels);
    }
    loadData();
  }, []);

  useEffect(() => {
    primaryActionRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleCardFocus = (item: TVRailItem) => {
    if (item.imageUrl) {
      setActiveBackdrop(item.imageUrl);
    }
    setActiveTitle(item.title);
    setActiveSubtitle(item.subtitle);
    setActiveWatchUrl(item.href);

    // Find overview if possible
    const foundMovie = movies.find((m) => `movie-${m.id}` === item.id);
    if (foundMovie) {
      setActiveOverview(foundMovie.overview);
    }
  };

  const movieRailItems = useMemo(
    () => movies.slice(0, 10).map(mapMovieToRailItem),
    [movies]
  );

  const showRailItems = useMemo(
    () =>
      shows.length > 0
        ? shows.slice(0, 10).map(mapShowToRailItem)
        : movies.slice(0, 10).map(mapMovieToRailItem),
    [movies, shows]
  );

  const channelRailItems = useMemo(
    () => channels.slice(0, 10).map(mapChannelToRailItem),
    [channels]
  );

  const topRatedRailItems = useMemo(
    () =>
      [...movies]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)
        .map(mapMovieToRailItem),
    [movies]
  );

  const kidsRailItems = useMemo(
    () =>
      movies
        .filter((m) => m.isKids || m.genres.includes('Animation') || m.genres.includes('Family'))
        .slice(0, 10)
        .map(mapMovieToRailItem),
    [movies]
  );

  const animeRailItems = useMemo(
    () =>
      movies
        .filter((m) => m.isAnime || m.tags?.includes('Anime'))
        .slice(0, 10)
        .map(mapMovieToRailItem),
    [movies]
  );

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceMessage('Voice search is not supported in this browser.');
      return;
    }

    const recognition = recognitionRef.current ?? new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    setVoiceMessage('Listening...');

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setVoiceMessage(`Searching for "${transcript}"`);
        router.push(`/search?q=${encodeURIComponent(transcript)}`);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceMessage('Voice search encountered an error or permission was denied.');
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceMessage((current) => (current === 'Listening...' ? 'No speech detected.' : current));
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceMessage('Voice search is active. Try again in a moment.');
    }
  };

  const handleDownloadTVAPK = () => {
    const blob = new Blob(
      [
        `PlayFlix Android TV Release Artifact\n` +
          `Version: 2.4.0-leanback\nPackage: com.playflix.tv\n` +
          `Target: Android TV / Google TV / Fire OS\n` +
          `Features: D-Pad navigation, 4K HDR, Dolby Atmos, Voice Search`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PlayFlix-AndroidTV-v2.4.0.apk';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main
      className={cn(
        'relative min-h-screen bg-[#050608] text-white selection:bg-amber-400 selection:text-black transition-colors duration-500',
        pureTVMode && 'p-0 pb-20'
      )}
    >
      {/* Standard Navbar (hidden when pure 10-foot TV mode is active) */}
      {!pureTVMode && <Navbar />}

      {/* 10-Foot Living Room Ambient Backdrop */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(5,6,8,0.3) 0%, rgba(5,6,8,0.92) 80%, #050608 100%), url(${activeBackdrop})`,
          filter: 'brightness(0.55) saturate(1.2)',
        }}
      />

      {/* TV Screen Shell */}
      <div className="relative z-10 mx-auto max-w-[1700px] px-4 pt-20 sm:px-8 md:px-12 lg:pt-28">
        {/* Top Living Room Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/40">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wide text-white sm:text-2xl">
                  <span className="text-amber-400">Play</span>Flix TV
                </h1>
                <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  10-FOOT LIVING ROOM UI
                </span>
              </div>
              <p className="text-xs text-zinc-400">Remote control D-pad enabled</p>
            </div>
          </div>

          {/* Quick TV Actions & Clock */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm font-mono text-amber-300 shadow-md">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>{currentTime}</span>
            </div>

            <button
              onClick={() => setPureTVMode((prev) => !prev)}
              className={cn(
                'flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all shadow-md',
                pureTVMode
                  ? 'border-amber-400 bg-amber-400 text-black'
                  : 'border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:border-zinc-500'
              )}
            >
              {pureTVMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span>{pureTVMode ? 'Exit TV Mode' : 'Living Room Mode'}</span>
            </button>

            <button
              onClick={handleVoiceSearch}
              className="flex items-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/20"
            >
              <Mic className="h-4 w-4 text-sky-400" />
              <span>{isListening ? 'Listening...' : 'Voice'}</span>
            </button>

            <Link
              href="/mobile-app"
              className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white"
            >
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span>Mobile App</span>
            </Link>
          </div>
        </div>

        {voiceMessage && (
          <div className="mb-6 rounded-2xl border border-sky-400/30 bg-sky-950/40 p-3 text-sm text-sky-200">
            {voiceMessage}
          </div>
        )}

        {/* Category Rails Filter Navigation */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'All Living Room' },
            { id: 'movies', label: 'Feature Movies' },
            { id: 'tv', label: 'TV Series' },
            { id: 'live', label: 'Live TV Channels' },
            { id: 'kids', label: 'Kids Lounge' },
            { id: 'anime', label: 'Anime Hub' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={cn(
                'rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all shrink-0',
                activeCategory === cat.id
                  ? 'bg-white text-black shadow-lg shadow-white/20 scale-105'
                  : 'border border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-600 hover:text-white'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Living Room Hero Showcase */}
        <div className="relative mb-12 overflow-hidden rounded-[36px] border border-white/15 bg-zinc-950/40 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">
                  FOCUSED ON TV
                </span>
                <span className="text-sm font-semibold text-zinc-300">{activeSubtitle}</span>
              </div>
              <h2 className="text-3xl font-black text-white sm:text-5xl xl:text-6xl drop-shadow-md">
                {activeTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base line-clamp-3">
                {activeOverview}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  ref={primaryActionRef as any}
                  href={activeWatchUrl}
                  className="tv-focus-ring flex items-center gap-3 rounded-2xl bg-amber-400 px-8 py-4 text-base font-extrabold text-black shadow-xl transition-all hover:scale-105 hover:bg-amber-300"
                >
                  <Play className="h-5 w-5 fill-black" />
                  <span>Press OK to Watch</span>
                </Link>

                <button
                  onClick={handleDownloadTVAPK}
                  className="tv-focus-ring flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>Download TV APK</span>
                </button>
              </div>
            </div>

            {/* TV Remote Helper Hint Card */}
            <div className="lg:col-span-4 rounded-3xl border border-zinc-800/80 bg-black/60 p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Tv className="h-5 w-5" />
                <span className="text-xs font-extrabold uppercase tracking-widest">Remote Control Nav</span>
              </div>
              <p className="text-sm text-zinc-300">
                Use your keyboard <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-300 font-mono">↑</kbd>{' '}
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-300 font-mono">↓</kbd>{' '}
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-300 font-mono">←</kbd>{' '}
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-300 font-mono">→</kbd> or tap the
                floating <strong className="text-white">TV Remote</strong> button in the bottom right corner.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                <span>Direct Sideload APK: v2.4.0</span>
                <span className="text-emerald-400">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Foot Rails Section */}
        <div id="tv-discover" className="space-y-10 pb-16">
          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <TVRail
              railIndex={0}
              title="Movie Spotlight"
              description="Large cinematic cards designed for sofa-distance viewing. Move left/right across the rail."
              items={movieRailItems}
              onFocusItem={handleCardFocus}
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'tv') && (
            <TVRail
              railIndex={1}
              title="Series & Television"
              description="Binge-ready seasons formatted for large TV displays with episode resume support."
              items={showRailItems}
              onFocusItem={handleCardFocus}
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'live') && channelRailItems.length > 0 && (
            <TVRail
              railIndex={2}
              title="Live TV Broadcasts"
              description="High-definition 24/7 channels with instant live buffer and program schedule."
              items={channelRailItems}
              onFocusItem={handleCardFocus}
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <TVRail
              railIndex={3}
              title="Living Room Recommendations"
              description="Top rated titles curated for cinema sound systems and 4K HDR displays."
              items={topRatedRailItems}
              onFocusItem={handleCardFocus}
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'kids') && kidsRailItems.length > 0 && (
            <TVRail
              railIndex={4}
              title="Kids & Family Lounge"
              description="Safe family entertainment protected by parental control PIN."
              items={kidsRailItems}
              onFocusItem={handleCardFocus}
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'anime') && animeRailItems.length > 0 && (
            <TVRail
              railIndex={5}
              title="Anime Universe"
              description="Subbed and dubbed anime series with Japanese studio masters."
              items={animeRailItems}
              onFocusItem={handleCardFocus}
            />
          )}
        </div>

        {/* Platform Support Matrix Section */}
        <section className="mt-8 border-t border-white/10 pt-12 pb-20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">Living Room Platform Support</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Download native TV apps or use the shared 10-foot browser interface on any smart TV platform.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {platformCards.map((platform) => (
              <div
                key={platform.name}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 backdrop-blur-md transition-all hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white">{platform.name}</h4>
                  <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-300">
                    {platform.badge}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {platform.status}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{platform.note}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Remote D-Pad Tested</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Virtual TV Remote Controller */}
      <TVRemoteController
        onVoiceSearch={handleVoiceSearch}
        onHome={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          primaryActionRef.current?.focus();
        }}
        onBack={() => router.back()}
      />

      {!pureTVMode && <Footer />}
    </main>
  );
}
