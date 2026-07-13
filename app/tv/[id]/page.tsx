'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play,
  Plus,
  Star,
  Download,
  ChevronDown,
  MessageSquare,
  User,
  Heart,
  Pause,
  Share2,
  Volume2,
  VolumeX,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { isUserAuthenticated, sampleMovies, getTVShows, getMovies } from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';
import { TVShowCard } from '@/components/TVShowCard';
import { Navbar } from '@/components/Navbar';
import { getTrailerBackgroundSource } from '@/lib/media';
import { shareContent } from '@/lib/share';
import { cn } from '@/lib/utils';

const HERO_BACKGROUND_ANIMATION = {
  scale: [1.02, 1.08, 1.03],
  x: [0, -12, 8],
  y: [0, -6, 4],
};

const HERO_BACKGROUND_TRANSITION = {
  duration: 22,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
};

export default function TVShowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [show, setShow] = useState<any>(null);
  const [isAccessReady, setIsAccessReady] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes'>('overview');
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(true);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);



  // Sample reviews
  const reviews = [
    { id: 1, user: 'TVFan', rating: 5, date: '2 days ago', comment: 'Absolutely stunning! The visuals were breathtaking and the story kept me on the edge of my seat from start to finish.' },
    { id: 2, user: 'ShowBuff', rating: 4, date: '5 days ago', comment: 'Great performances all around, though the third act could have been tighter. Still highly recommend!' },
    { id: 3, user: 'SeriesCritic', rating: 5, date: '1 week ago', comment: 'A masterpiece in every sense. The direction, cinematography, and acting are all top-notch.' }
  ];

  // Sample episodes
  const episodes = [
    { id: 1, season: 1, number: 1, title: 'Pilot', duration: '45 min', date: 'Jan 1, 2024', description: 'The beginning of an epic journey.' },
    { id: 2, season: 1, number: 2, title: 'The Next Step', duration: '48 min', date: 'Jan 8, 2024', description: 'Things start to get interesting.' },
    { id: 3, season: 1, number: 3, title: 'Crossroads', duration: '50 min', date: 'Jan 15, 2024', description: 'A major decision must be made.' },
    { id: 4, season: 1, number: 4, title: 'Revelations', duration: '47 min', date: 'Jan 22, 2024', description: 'Secrets are revealed.' },
    { id: 5, season: 1, number: 5, title: 'Climax', duration: '55 min', date: 'Jan 29, 2024', description: 'The season finale.' }
  ];

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsAccessReady(true);
  }, [router]);

  useEffect(() => {
    const showId = params.id;
    const storedShows = getTVShows();
    const foundShow = storedShows.find(s => s.id.toString() === showId);
    if (foundShow) {
      setShow(foundShow);
    } else {
      const sampleMovieMatch = sampleMovies.find(m => `tv-${m.id}` === showId);
      if (sampleMovieMatch) {
        setShow({
          ...sampleMovieMatch,
          id: showId,
          numberOfSeasons: 3,
          numberOfEpisodes: 24,
          seasons: []
        });
      } else {
        setShow({
          ...sampleMovies[0],
          id: showId,
          title: 'Sample TV Show',
          numberOfSeasons: 3,
          numberOfEpisodes: 24,
          seasons: []
        });
      }
    }
  }, [params.id]);

  const trailerBackground = useMemo(
    () => getTrailerBackgroundSource(show?.trailerUrl, isTrailerMuted),
    [isTrailerMuted, show?.trailerUrl],
  );

  useEffect(() => {
    setIsTrailerPlaying(Boolean(show?.trailerUrl));
  }, [show?.trailerUrl]);

  useEffect(() => {
    if (!shareMessage) return;

    const timeout = window.setTimeout(() => setShareMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  if (!isAccessReady || !show) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading content...</p>
        </div>
      </main>
    );
  }

  const firstSeasonWithEpisodes = show.seasons?.find((season: any) => season.episodes?.length > 0);
  const firstEpisode = firstSeasonWithEpisodes?.episodes?.[0];
  const watchHref =
    firstEpisode
      ? `/tv/${show.id}/episode/${firstEpisode.id}`
      : show.trailerUrl
        ? `/tv/${show.id}/episode/trailer`
        : null;

  const handleTrailerToggle = () => {
    if (trailerBackground?.kind === 'video' && videoRef.current) {
      if (isTrailerPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          setIsTrailerPlaying(false);
        });
      }
    }

    setIsTrailerPlaying((current) => !current);
  };

  const handleShare = async () => {
    try {
      const result = await shareContent({
        title: show.title,
        text: show.tagline || show.overview,
        url: window.location.href,
      });

      setShareMessage(
        result === 'shared'
          ? 'Shared successfully'
          : result === 'copied'
            ? 'Link copied'
            : 'Share unavailable on this device'
      );
    } catch {
      setShareMessage('Share canceled');
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      {/* Hero Section with Backdrop */}
      <div className="relative w-full aspect-video max-h-[65vh] overflow-hidden">
        {/* Background Video or Image */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.02 }}
            animate={HERO_BACKGROUND_ANIMATION}
            transition={HERO_BACKGROUND_TRANSITION}
          >
            <img
              src={show.backdropPath}
              alt={show.title}
              className="w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: isTrailerPlaying && trailerBackground ? 0 : 1 }}
            />
          </motion.div>

          {trailerBackground?.kind === 'youtube' && isTrailerPlaying && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.06 }}
              animate={HERO_BACKGROUND_ANIMATION}
              transition={HERO_BACKGROUND_TRANSITION}
            >
              <iframe
                key={trailerBackground.src}
                src={trailerBackground.src}
                title={`${show.title} trailer`}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="absolute inset-0 h-full w-full scale-110 pointer-events-none"
              />
            </motion.div>
          )}

          {trailerBackground?.kind === 'video' && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.04 }}
              animate={HERO_BACKGROUND_ANIMATION}
              transition={HERO_BACKGROUND_TRANSITION}
            >
              <video
                ref={videoRef}
                autoPlay
                muted={isTrailerMuted}
                loop
                playsInline
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: isTrailerPlaying ? 1 : 0 }}
              >
                <source src={trailerBackground.src} type={trailerBackground.mimeType} />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] to-transparent w-2/3" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_76%_28%,rgba(168,85,247,0.16),transparent_38%)]"
          animate={{ opacity: [0.28, 0.45, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* Trailer Controls */}
        {trailerBackground && (
          <div className="absolute bottom-8 right-8 flex items-center gap-4">
            <button
              onClick={handleTrailerToggle}
              className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
            >
              {isTrailerPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
            </button>
            <button
              onClick={() => setIsTrailerMuted(!isTrailerMuted)}
              className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
            >
              {isTrailerMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-16">
          <div className="flex flex-col gap-6 md:flex-row items-end gap-10">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-40 sm:w-48 md:w-64 lg:w-80 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                <img
                  src={show.posterPath}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4"
              >
                {show.title}
              </motion.h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-zinc-400 mb-6">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star fill="currentColor" size={18} />
                  <span className="font-semibold">{show.rating}</span>
                </span>
                <span>
                  {show.startYear || show.releaseYear}
                  {show.endYear ? ` - ${show.endYear}` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {show.numberOfSeasons || (show.seasons?.length || 0)} Seasons
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {show.numberOfEpisodes || (show.seasons?.reduce((total: number, season: any) => total + (season.episodes?.length || 0), 0) || 0)} Episodes
                </span>
                <div className="flex flex-wrap gap-2">
                  {show.genres.map((genre: string) => (
                    <span key={genre} className="px-3 py-1 bg-zinc-800 rounded-full text-xs sm:text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <button
                  onClick={() => watchHref && router.push(watchHref)}
                  disabled={!watchHref}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-xl transition-colors text-sm sm:text-base',
                    watchHref ? 'hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Play fill="currentColor" size={20} />
                  Watch Now
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors text-sm">
                  <Plus size={20} />
                  Add to List
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    'p-3 sm:p-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-all',
                    isLiked && 'text-red-500 border-red-500 bg-red-500/10'
                  )}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors text-sm">
                  <Download size={20} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors text-sm"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>

              {shareMessage && (
                <p className="mb-6 text-sm font-medium text-red-400">{shareMessage}</p>
              )}

              <p className="text-base sm:text-lg text-zinc-300 max-w-3xl mb-6">
                {show.tagline && <em className="text-zinc-500 block mb-2">{show.tagline}</em>}
                {show.overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-6 md:gap-8 mb-12 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'pb-4 px-2 text-base md:text-lg font-semibold transition-colors',
              activeTab === 'overview'
                ? 'text-white border-b-2 border-red-600'
                : 'text-zinc-500 hover:text-white'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('episodes')}
            className={cn(
              'pb-4 px-2 text-base md:text-lg font-semibold transition-colors',
              activeTab === 'episodes'
                ? 'text-white border-b-2 border-red-600'
                : 'text-zinc-500 hover:text-white'
            )}
          >
            Episodes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Show Details */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="text-zinc-400 w-20 md:w-24">Country</span>
                    <span className="text-white font-medium">{show.country}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-zinc-400 w-20 md:w-24">Language</span>
                    <span className="text-white font-medium">{show.language}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-zinc-400 w-20 md:w-24">Quality</span>
                    <span className="text-white font-medium">{show.quality}</span>
                  </div>
                  {show.imdbId && (
                    <div className="flex items-start gap-4">
                      <span className="text-zinc-400 w-20 md:w-24">IMDb</span>
                      <a 
                        href={`https://www.imdb.com/title/${show.imdbId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                      >
                        {show.imdbId}
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="text-zinc-400 w-20 md:w-24">Studio</span>
                    <span className="text-white font-medium">{show.studio}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-zinc-400 w-20 md:w-24">Creator</span>
                    <span className="text-white font-medium">{show.director}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Cast */}
            {show.cast && show.cast.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">Cast</h2>
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {show.cast.map((person: any) => (
                    <div key={person.id} className="flex-shrink-0 w-28 sm:w-32 md:w-40">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border border-zinc-800">
                        <img
                          src={person.profilePath || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square'}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-center text-sm md:text-base">{person.name}</h3>
                      <p className="text-zinc-500 text-xs md:text-sm text-center">{person.role}</p>
                      {person.character && (
                        <p className="text-zinc-400 text-xs text-center mt-1">as {person.character}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Crew */}
            {show.crew && show.crew.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">Crew</h2>
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {show.crew.map((person: any) => (
                    <div key={person.id} className="flex-shrink-0 w-28 sm:w-32 md:w-40">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border border-zinc-800">
                        <img
                          src={person.profilePath || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=user%20avatar&image_size=square'}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-center text-sm md:text-base">{person.name}</h3>
                      <p className="text-zinc-500 text-xs md:text-sm text-center">{person.job}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold">User Reviews</h2>
              </div>
              
              <div className="grid gap-6">
                {reviews.slice(0, showAllReviews ? reviews.length : 2).map(review => (
                  <div key={review.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold text-base sm:text-lg">
                        {review.user[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{review.user}</h4>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <span className="flex items-center gap-1 text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} fill={i < review.rating ? 'currentColor' : 'none'} size={14} />
                            ))}
                          </span>
                          <span>•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-300 text-sm md:text-base">{review.comment}</p>
                  </div>
                ))}
              </div>

              {reviews.length > 2 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-6 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-sm md:text-base"
                >
                  {showAllReviews ? 'Show less' : 'Show more reviews'}
                </button>
              )}
            </section>
          </>
        )}

        {activeTab === 'episodes' && (
          <section className="mb-16">
            {/* Season Selector */}
            <div className="mb-8">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 md:px-6 py-3 text-white focus:outline-none focus:border-red-500 w-full md:w-auto"
              >
                {(show.seasons && show.seasons.length > 0 
                  ? show.seasons 
                  : Array.from({ length: show.numberOfSeasons || 3 }).map((_, i) => ({ seasonNumber: i + 1 }))
                ).map((season: any) => (
                  <option key={season.seasonNumber} value={season.seasonNumber}>
                    Season {season.seasonNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Episodes List */}
            <div className="grid gap-6">
              {(() => {
                const currentSeason = show.seasons?.find((s: any) => s.seasonNumber === selectedSeason);
                const episodesToRender = currentSeason?.episodes || episodes;
                
                return episodesToRender.map((episode: any) => (
                  <Link
                    key={episode.id}
                    href={`/tv/${params.id}/episode/${episode.id}`}
                    className="block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 w-full md:w-64">
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-800">
                          <img
                            src={episode.thumbnailPath || show.backdropPath}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <span className="text-zinc-400 text-sm">
                            S{episode.season || selectedSeason}:E{episode.episodeNumber || episode.number}
                          </span>
                          {episode.airDate && <span className="text-zinc-400 text-sm">{episode.airDate}</span>}
                          {episode.duration && <span className="text-zinc-400 text-sm">{episode.duration}</span>}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-3">{episode.title}</h3>
                        <p className="text-zinc-400 text-sm md:text-base">{episode.overview || episode.description}</p>
                      </div>
                      <div className="flex items-center md:justify-end">
                        <button className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <Play size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ));
              })()}
            </div>
          </section>
        )}

        {/* Related Content */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {getTVShows().filter(s => s.id.toString() !== show.id.toString()).map(s => (
              <Link key={s.id} href={`/tv/${s.id}`}>
                <TVShowCard tvShow={s} />
              </Link>
            ))}
            {getTVShows().length <= 1 && sampleMovies.filter(m => m.id !== show.id).map(m => (
              <Link key={m.id} href={`/tv/tv-${m.id}`}>
                <MovieCard movie={m} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
