'use client';

import { motion } from 'framer-motion';
import { Clapperboard, Home, Sparkles, Tv } from 'lucide-react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TVShowCard } from '@/components/TVShowCard';
import { getFilteredAnimeMovies, getFilteredAnimeTVShows, TVShow } from '@/lib/data';

function buildFallbackAnimeShows(): TVShow[] {
  return getFilteredAnimeMovies().slice(0, 6).map((movie, index) => ({
    id: `tv-${movie.id}`,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
    startYear: movie.releaseYear,
    endYear: undefined,
    rating: movie.rating,
    country: movie.country,
    language: movie.language,
    quality: movie.quality,
    studio: movie.studio,
    director: movie.director,
    genres: movie.genres,
    tags: movie.tags,
    trailerUrl: movie.trailerUrl,
    seasons: [],
    numberOfSeasons: 1,
    numberOfEpisodes: 12 + index,
  }));
}

export default function AnimeShowsPage() {
  const router = useRouter();
  const animeShows = useMemo(() => {
    const filteredShows = getFilteredAnimeTVShows();
    return filteredShows.length > 0 ? filteredShows : buildFallbackAnimeShows();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#090b22] via-[#1c0f3f] to-[#080808] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-3xl flex items-center justify-center">
              <Tv className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">Anime Shows</h1>
              <p className="text-white/70 mt-2">Binge anime series, stylized sagas, and high-intensity episodic adventures.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push('/anime')}
              className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/25 transition-all font-semibold"
            >
              <Home className="w-5 h-5" />
              Anime Home
            </button>
            <button
              onClick={() => router.push('/anime/movies')}
              className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/25 transition-all font-semibold"
            >
              <Clapperboard className="w-5 h-5" />
              Anime Movies
            </button>
            <button
              onClick={() => router.push('/anime/shows')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white rounded-2xl font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Anime Shows
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">Series arcs built for long marathons</h2>
          <p className="text-lg text-white/80">
            Jump into character-driven anime shows, power arcs, fantasy worlds, and serialized storytelling.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {animeShows.map((show) => (
              <TVShowCard key={show.id} tvShow={show} />
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
