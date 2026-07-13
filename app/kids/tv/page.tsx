'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, Home, Smile, Tv } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { getFilteredKidsContent, getFilteredKidsTVShows } from '@/lib/data';
import { KidsCard } from '@/components/KidsCard';
import { TVShowCard } from '@/components/TVShowCard';

export default function KidsTVPage() {
  const router = useRouter();
  const kidsTVShows = useMemo(() => getFilteredKidsTVShows(), []);
  const fallbackKidsContent = useMemo(() => getFilteredKidsContent(), []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1f2a7a] via-[#3b1670] to-[#6b1d65] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center">
              <Tv className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">Kids TV Shows</h1>
              <p className="text-white/70 mt-2">Only friendly, colorful, and age-appropriate shows.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push('/kids')}
              className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/25 transition-all font-semibold"
            >
              <Home className="w-5 h-5" />
              Kids Home
            </button>
            <button
              onClick={() => router.push('/kids/movies')}
              className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/25 transition-all font-semibold"
            >
              <Clapperboard className="w-5 h-5" />
              Kids Movie
            </button>
            <button
              onClick={() => router.push('/kids/tv')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-2xl font-semibold"
            >
              <Smile className="w-5 h-5" />
              Kids Tv Shows
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">TV time made safe</h2>
          <p className="text-lg text-white/80">
            Browse a kids-only TV section with playful stories, songs, and educational adventures.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {kidsTVShows.length > 0
              ? kidsTVShows.map((show) => (
                  <TVShowCard key={show.id} tvShow={show} />
                ))
              : fallbackKidsContent.map((item, index) => (
                  <KidsCard key={item.id} item={item} index={index} />
                ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
