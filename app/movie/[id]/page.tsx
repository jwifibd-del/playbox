'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  VolumeX
} from 'lucide-react';
import { isUserAuthenticated, sampleMovies, getMovies } from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';
import { Navbar } from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { getTrailerBackgroundSource } from '@/lib/media';
import { getPreferredMoviePlayback } from '@/lib/playback';
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

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [isAccessReady, setIsAccessReady] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes'>('overview');
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(true);
  const [isTrailerMuted, setIsTrailerMuted] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);



  // Sample reviews
  const reviews = [
    { id: 1, user: 'CinemaFan', rating: 5, date: '2 days ago', comment: 'Absolutely stunning! The visuals were breathtaking and the story kept me on the edge of my seat from start to finish.' },
    { id: 2, user: 'MovieBuff', rating: 4, date: '5 days ago', comment: 'Great performances all around, though the third act could have been tighter. Still highly recommend!' },
    { id: 3, user: 'FilmCritic', rating: 5, date: '1 week ago', comment: 'A masterpiece in every sense. The direction, cinematography, and acting are all top-notch.' }
  ];

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsAccessReady(true);
  }, [router]);

  useEffect(() => {
    const movieId = params.id;
    const storedMovies = getMovies();
    const foundMovie = storedMovies.find(m => m.id.toString() === movieId) || sampleMovies.find(m => m.id.toString() === movieId);
    setMovie(foundMovie || sampleMovies[0]);
  }, [params.id]);

  const trailerBackground = useMemo(
    () => getTrailerBackgroundSource(movie?.trailerUrl, isTrailerMuted),
    [isTrailerMuted, movie?.trailerUrl],
  );

  useEffect(() => {
    setIsTrailerPlaying(Boolean(movie?.trailerUrl));
  }, [movie?.trailerUrl]);

  useEffect(() => {
    if (!shareMessage) return;

    const timeout = window.setTimeout(() => setShareMessage(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  if (!isAccessReady || !movie) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading content...</p>
        </div>
      </main>
    );
  }

  const playback = getPreferredMoviePlayback(movie);

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
        title: movie.title,
        text: movie.tagline || movie.overview,
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
              src={movie.backdropPath}
              alt={movie.title}
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
                title={`${movie.title} trailer`}
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
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_38%)]"
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
                  src={movie.posterPath}
                  alt={movie.title}
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
                {movie.title}
              </motion.h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-zinc-400 mb-6">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star fill="currentColor" size={18} />
                  <span className="font-semibold">{movie.rating}</span>
                </span>
                <span>{movie.releaseYear}</span>
                <span>{movie.runtime}</span>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string) => (
                    <span key={genre} className="px-3 py-1 bg-zinc-800 rounded-full text-xs sm:text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <button
                  onClick={() => playback && setIsPlayerOpen(true)}
                  disabled={!playback}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-xl transition-colors text-sm sm:text-base',
                    playback ? 'hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Play fill="currentColor" size={20} />
                  {playback?.sourceLabel === 'Trailer' ? 'Play Trailer' : 'Play'}
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
                {movie.tagline && <em className="text-zinc-500 block mb-2">{movie.tagline}</em>}
                {movie.overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isPlayerOpen && playback && (
        <section className="mx-auto -mt-10 mb-12 max-w-7xl px-8 relative z-20">
          <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950/92 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">
                  Now Playing
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">{playback.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {playback.sourceLabel}
                  {playback.quality ? ` • ${playback.quality}` : ''}
                </p>
              </div>
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                Close Player
              </button>
            </div>
            <VideoPlayer
              src={playback.url}
              sourceType={playback.type}
              poster={playback.poster || movie.backdropPath}
              title={playback.title}
              autoplay
              videoId={playback.videoId || `movie-${movie.id}`}
              subtitles={playback.subtitles}
              audioTracks={playback.audioTracks}
            />
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Movie Details */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-zinc-400 w-20 md:w-24">Country</span>
                <span className="text-white font-medium">{movie.country}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-zinc-400 w-20 md:w-24">Language</span>
                <span className="text-white font-medium">{movie.language}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-zinc-400 w-20 md:w-24">Quality</span>
                <span className="text-white font-medium">{movie.quality}</span>
              </div>
              {movie.imdbId && (
                <div className="flex items-start gap-4">
                  <span className="text-zinc-400 w-20 md:w-24">IMDb</span>
                  <a 
                    href={`https://www.imdb.com/title/${movie.imdbId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                  >
                    {movie.imdbId}
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-zinc-400 w-20 md:w-24">Studio</span>
                <span className="text-white font-medium">{movie.studio}</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-zinc-400 w-20 md:w-24">Director</span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">Cast</h2>
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {movie.cast.map((person: any) => (
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
            {movie.crew && movie.crew.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">Crew</h2>
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {movie.crew.map((person: any) => (
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

        {/* Related Content */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {sampleMovies.filter(m => m.id !== movie.id).map(m => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
