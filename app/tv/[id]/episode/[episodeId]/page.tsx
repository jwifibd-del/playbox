'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Play } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { cn } from '@/lib/utils';
import { getTVShows, isUserAuthenticated, type Episode, type MovieSource, type TVShow } from '@/lib/data';
import { getPreferredEpisodePlayback } from '@/lib/playback';

function buildFallbackEpisode(show: TVShow): Episode | null {
  if (!show.trailerUrl) return null;

  const fallbackSource: MovieSource = {
    id: `${show.id}-trailer`,
    title: 'Series Trailer',
    quality: show.quality,
    size: 'Streaming',
    type: 'YouTube URL',
    isLocal: false,
    url: show.trailerUrl,
  };

  return {
    id: `${show.id}-trailer`,
    title: `${show.title} Trailer`,
    overview: show.overview,
    episodeNumber: 1,
    runtime: 'Trailer',
    rating: show.rating,
    airDate: String(show.startYear),
    thumbnailPath: show.backdropPath,
    sources: [fallbackSource],
  };
}

export default function EpisodePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [show, setShow] = useState<TVShow | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | null>(null);
  const [isAccessReady, setIsAccessReady] = useState(false);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsAccessReady(true);
  }, [router]);

  useEffect(() => {
    const showId = String(params.id ?? '');
    const episodeId = String(params.episodeId ?? '');
    const foundShow = getTVShows().find((item) => item.id.toString() === showId) ?? null;

    if (!foundShow) {
      setShow(null);
      setEpisode(null);
      setSelectedSeasonNumber(null);
      return;
    }

    let foundEpisode: Episode | null = null;
    let foundSeasonNumber: number | null = null;

    for (const season of foundShow.seasons) {
      const match = season.episodes.find((item) => item.id.toString() === episodeId);
      if (match) {
        foundEpisode = match;
        foundSeasonNumber = season.seasonNumber;
        break;
      }
    }

    if (!foundEpisode) {
      foundEpisode = buildFallbackEpisode(foundShow);
      foundSeasonNumber = foundEpisode ? 1 : null;
    }

    setShow(foundShow);
    setEpisode(foundEpisode);
    setSelectedSeasonNumber(foundSeasonNumber);
  }, [params.episodeId, params.id]);

  const playback = useMemo(() => getPreferredEpisodePlayback(show, episode), [episode, show]);
  const currentSeasonEpisodes = useMemo(() => {
    if (!show || selectedSeasonNumber === null) return [];
    return show.seasons.find((season) => season.seasonNumber === selectedSeasonNumber)?.episodes ?? [];
  }, [selectedSeasonNumber, show]);

  if (!isAccessReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500" />
          <p className="text-zinc-400">Loading episode...</p>
        </div>
      </main>
    );
  }

  if (!show || !episode) {
    return (
      <main className="min-h-screen bg-[#080808] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 text-center">
          <h1 className="text-3xl font-bold">Episode not found</h1>
          <p className="mt-3 text-zinc-400">
            This episode does not have a playable source yet.
          </p>
          <Link
            href={`/tv/${params.id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
          >
            <ArrowLeft size={16} />
            Back to series
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-28 md:px-10">
        <Link
          href={`/tv/${show.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to {show.title}
        </Link>

        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">
              Episode Playback
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">{episode.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              {selectedSeasonNumber !== null && (
                <span>
                  Season {selectedSeasonNumber} • Episode {episode.episodeNumber}
                </span>
              )}
              {episode.airDate && (
                <span className="flex items-center gap-2">
                  <Calendar size={14} />
                  {episode.airDate}
                </span>
              )}
              {episode.runtime && (
                <span className="flex items-center gap-2">
                  <Clock size={14} />
                  {episode.runtime}
                </span>
              )}
            </div>
          </div>

          {playback && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Playback Source
              </p>
              <p className="mt-2 text-base font-semibold text-white">{playback.sourceLabel}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {playback.quality || show.quality} • {playback.type}
              </p>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950/92 shadow-2xl">
          {playback ? (
            <VideoPlayer
              src={playback.url}
              sourceType={playback.type}
              poster={playback.poster || episode.thumbnailPath || show.backdropPath}
              title={playback.title}
              autoplay
              videoId={playback.videoId || `tv-${show.id}-episode-${episode.id}`}
              subtitles={playback.subtitles}
              audioTracks={playback.audioTracks}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-black px-6 text-center">
              <div>
                <p className="text-xl font-semibold text-white">No playable source yet</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Add an episode source in the admin panel to enable playback here.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="text-2xl font-bold">Overview</h2>
            <p className="mt-4 leading-7 text-zinc-300">{episode.overview || show.overview}</p>
          </section>

          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
            <h2 className="text-2xl font-bold">More Episodes</h2>
            <div className="mt-4 space-y-3">
              {currentSeasonEpisodes.length > 0 ? (
                currentSeasonEpisodes.map((item) => (
                  <Link
                    key={item.id}
                    href={`/tv/${show.id}/episode/${item.id}`}
                    className={cn(
                      'block rounded-2xl border px-4 py-3 transition-colors',
                      item.id.toString() === episode.id.toString()
                        ? 'border-red-500/60 bg-red-500/10'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <Play size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{item.title}</p>
                        <p className="text-sm text-zinc-400">
                          Episode {item.episodeNumber}
                          {item.runtime ? ` • ${item.runtime}` : ''}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-zinc-400">
                  This title does not have additional episode sources yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
