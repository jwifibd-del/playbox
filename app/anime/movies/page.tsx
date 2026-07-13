'use client';

import { motion } from 'framer-motion';
import { Clapperboard, Home, Sparkles, Tv } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { getFilteredAnimeMovies } from '@/lib/data';

export default function AnimeMoviesPage() {
  const router = useRouter();
  const animeMovies = getFilteredAnimeMovies();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#16071f] via-[#0d1633] to-[#080808] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded-3xl flex items-center justify-center">
              <Clapperboard className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">Anime Movies</h1>
              <p className="text-white/70 mt-2">Discover cinematic anime films, fantasy worlds, and high-energy adventures.</p>
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white rounded-2xl font-semibold"
            >
              <Sparkles className="w-5 h-5" />
              Anime Movies
            </button>
            <button
              onClick={() => router.push('/anime/shows')}
              className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/25 transition-all font-semibold"
            >
              <Tv className="w-5 h-5" />
              Anime Shows
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">Movie worlds with anime energy</h2>
          <p className="text-lg text-white/80">
            Explore anime-inspired adventures, dreamlike visuals, and bold storytelling curated into one cinematic movie grid.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {animeMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
