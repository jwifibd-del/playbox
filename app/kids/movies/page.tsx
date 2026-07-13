'use client';

import { motion } from 'framer-motion';
import { Clapperboard, Home, Tv } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { KidsCard } from '@/components/KidsCard';
import { getFilteredKidsContent } from '@/lib/data';

export default function KidsMoviesPage() {
  const router = useRouter();
  const kidsMovies = getFilteredKidsContent();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#5a1768] via-[#25196d] to-[#0f225a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-orange-500 rounded-3xl flex items-center justify-center">
              <Clapperboard className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">Kids Movie</h1>
              <p className="text-white/70 mt-2">Bright adventures and playful stories for family movie time.</p>
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-2xl font-semibold"
            >
              <Clapperboard className="w-5 h-5" />
              Kids Movie
            </button>
            <button
              onClick={() => router.push('/kids/tv')}
              className="flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/25 transition-all font-semibold"
            >
              <Tv className="w-5 h-5" />
              Kids Tv Shows
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">Movie time made colorful</h2>
          <p className="text-lg text-white/80">
            Explore a cheerful kids movie shelf with playful worlds, safe adventures, and family-friendly fun.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {kidsMovies.map((item, index) => (
              <KidsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
