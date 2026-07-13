'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MonitorSmartphone,
  Radio,
  Sparkles,
  Tv,
  Wand2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { TVRail } from '@/components/tv/TVRail';
import type { TVRailItem } from '@/components/tv/TVMediaCard';
import { getLiveTVChannels, sampleMovies, type LiveTVChannel, type Movie, type TVShow } from '@/lib/data';
import { fetchMovies, fetchTVShows } from '@/lib/api';

const platformCards = [
  { name: 'Android TV', status: 'UI starter ready', note: 'Large cards and focus rails are available.' },
  { name: 'Google TV', status: 'Layout starter ready', note: 'Shared TV shell is prepared for brand-specific polish.' },
  { name: 'Apple TV', status: 'Platform prep', note: 'tvOS-specific shortcuts and native playback remain pending.' },
  { name: 'Roku', status: 'Platform prep', note: 'Directional-navigation model is now in place for expansion.' },
  { name: 'Tizen', status: 'Platform prep', note: 'Samsung TV adaptation can build from the same living-room layout.' },
  { name: 'LG webOS', status: 'Platform prep', note: 'Focus-first cards and rails are ready for webOS tuning.' },
  { name: 'Fire TV', status: 'Platform prep', note: 'The starter shell supports remote-first browsing patterns.' },
  { name: 'VIDAA', status: 'Platform prep', note: 'Shared web UI groundwork is ready for future device testing.' },
] as const;

const roadmapSetup = [
  'TV-optimized UI',
  'Remote control navigation',
  'Focus animations',
  'Large cards for TV viewing',
  'Voice search starter',
  'Recommendation rows',
] as const;

function mapMovieToRailItem(movie: Movie): TVRailItem {
  return {
    id: `movie-${movie.id}`,
    title: movie.title,
    subtitle: `${movie.releaseYear} • ${movie.quality}`,
    meta: `${movie.runtime} • ${movie.genres.slice(0, 2).join(' • ')}`,
    href: `/movie/${movie.id}`,
    imageUrl: movie.backdropPath || movie.posterPath,
    badge: `${movie.rating.toFixed(1)} IMDb`,
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
    badge: `${show.rating.toFixed(1)} Rating`,
    kind: 'tv',
  };
}

function mapMovieFallbackToShow(movie: Movie): TVRailItem {
  return {
    id: `tv-fallback-${movie.id}`,
    title: movie.title,
    subtitle: `Series starter • ${movie.quality}`,
    meta: `Admin can replace this fallback with full season data`,
    href: `/movie/${movie.id}`,
    imageUrl: movie.backdropPath || movie.posterPath,
    badge: 'Setup',
    kind: 'tv',
  };
}

function mapChannelToRailItem(channel: LiveTVChannel): TVRailItem {
  return {
    id: `live-${channel.id}`,
    title: channel.name,
    subtitle: `${channel.genre} • ${channel.streamType}`,
    meta: 'Live channel guide starter',
    href: `/live-tv/${channel.id}`,
    imageUrl: channel.posterPath,
    accentColor: channel.accentColor,
    badge: 'Live',
    kind: 'live',
  };
}

export default function TVAppPage() {
  const router = useRouter();
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const [movies, setMovies] = useState<Movie[]>(sampleMovies);
  const [shows, setShows] = useState<TVShow[]>([]);
  const [channels, setChannels] = useState<LiveTVChannel[]>([]);

  useEffect(() => {
    async function loadData() {
      const apiMovies = await fetchMovies();
      const apiShows = await fetchTVShows();
      const storedChannels = getLiveTVChannels();

      setMovies(apiMovies);
      setShows(apiShows);
      setChannels(storedChannels);
    }
    loadData();
  }, []);

  useEffect(() => {
    primaryActionRef.current?.focus();
  }, []);

  const featuredMovie = movies[0] || sampleMovies[0];

  const movieRailItems = useMemo(
    () => movies.slice(0, 8).map(mapMovieToRailItem),
    [movies]
  );

  const showRailItems = useMemo(
    () =>
      (shows.length > 0 ? shows.slice(0, 8).map(mapShowToRailItem) : movies.slice(0, 8).map(mapMovieFallbackToShow)),
    [movies, shows]
  );

  const liveRailItems = useMemo(
    () => channels.slice(0, 8).map(mapChannelToRailItem),
    [channels]
  );

  const recommendationRailItems = useMemo(
    () => [...movies].sort((a, b) => b.rating - a.rating).slice(0, 8).map(mapMovieToRailItem),
    [movies]
  );

  const handleVoiceSearch = () => {
    router.push(`/search?q=${encodeURIComponent(featuredMovie?.title || 'Family movies')}`);
  };

  return (
    <main className="min-h-screen bg-[#080808] pb-14 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-10 pt-28 md:px-10 xl:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_28%),radial-gradient(circle_at_right,_rgba(59,130,246,0.14),_transparent_26%)]" />
        <div className="relative mx-auto max-w-[1600px]">
          <div className="tv-section-shell overflow-hidden rounded-[36px] border border-zinc-800">
            <div className="grid gap-10 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/35 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-200">
                  <MonitorSmartphone className="h-4 w-4" />
                  TV Platform Starter Setup
                </div>
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl xl:text-6xl">
                  Build the living-room experience for Android TV, Apple TV, Roku, webOS, and more.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
                  This starter surface begins the remaining TV-platform roadmap with large cards, remote-ready rails,
                  focus animations, recommendation rows, and a voice-search entry that works with the existing catalog.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    ref={primaryActionRef}
                    onClick={() => document.getElementById('tv-discover')?.scrollIntoView({ behavior: 'smooth' })}
                    className="tv-focus-ring rounded-2xl bg-white px-6 py-4 text-base font-bold text-black"
                  >
                    Explore TV Setup
                  </button>
                  <button
                    onClick={() => router.push('/search')}
                    className="tv-focus-ring rounded-2xl border border-zinc-700 bg-zinc-900/90 px-6 py-4 text-base font-semibold text-white"
                  >
                    Open Search
                  </button>
                  <button
                    onClick={handleVoiceSearch}
                    className="tv-focus-ring inline-flex items-center gap-3 rounded-2xl border border-sky-400/35 bg-sky-500/10 px-6 py-4 text-base font-semibold text-sky-100"
                  >
                    <Mic className="h-5 w-5" />
                    Voice Search Starter
                  </button>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {roadmapSetup.map((item) => (
                    <div key={item} className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Started</p>
                      <p className="mt-2 text-lg font-semibold text-white">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="overflow-hidden rounded-[32px] border border-zinc-800 bg-cover bg-center p-6"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.82)), url(${featuredMovie?.backdropPath})` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-300">Featured for TV</p>
                  <h2 className="mt-3 text-3xl font-bold text-white">{featuredMovie?.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">{featuredMovie?.overview}</p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-200">
                    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5">
                      {featuredMovie?.runtime}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5">
                      {featuredMovie?.quality}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5">
                      {featuredMovie?.genres?.slice(0, 2).join(' • ')}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-5">
                    <div className="flex items-center gap-3 text-rose-300">
                      <Tv className="h-5 w-5" />
                      <span className="text-sm font-semibold uppercase tracking-[0.2em]">Remote Control</span>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-white">Arrow-Key Rails</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Left and right move across a row. Up and down jump between rows like a TV remote.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-5">
                    <div className="flex items-center gap-3 text-sky-300">
                      <Wand2 className="h-5 w-5" />
                      <span className="text-sm font-semibold uppercase tracking-[0.2em]">Voice Search</span>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-white">Starter Intent</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      The TV shell sends a featured title into the search experience so voice flows can expand from real routes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tv-discover" className="mx-auto flex max-w-[1600px] flex-col gap-7 px-6 md:px-10 xl:px-14">
        <TVRail
          railIndex={0}
          title="Movie Spotlight"
          description="Large cinematic cards for sofa-distance browsing. Use the arrow keys to move across the rail."
          items={movieRailItems}
        />
        <TVRail
          railIndex={1}
          title="Series Setup"
          description="TV-show focused browsing starts here. Admin-managed shows appear automatically when seasons are available."
          items={showRailItems}
        />
        <TVRail
          railIndex={2}
          title="Live Channel Guide Starter"
          description="Live TV enters the TV roadmap with bigger cards and remote-ready channel navigation."
          items={liveRailItems}
        />
        <TVRail
          railIndex={3}
          title="Recommendation Rows"
          description="A first recommendation rail based on top-rated catalog titles. This is the foundation for richer TV suggestions."
          items={recommendationRailItems}
        />
      </section>

      <section className="mx-auto mt-8 max-w-[1600px] px-6 md:px-10 xl:px-14">
        <div className="tv-section-shell rounded-[32px] px-6 py-7 sm:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Platform Support Setup</h2>
          </div>
          <p className="mb-6 max-w-4xl text-sm leading-7 text-zinc-400 sm:text-base">
            These platform cards mark where the shared TV shell is ready and where native device controls still need dedicated work.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platformCards.map((platform) => (
              <div key={platform.name} className="rounded-[28px] border border-zinc-800 bg-zinc-950/85 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
                  <Radio className="h-4 w-4 text-zinc-500" />
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {platform.status}
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{platform.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
