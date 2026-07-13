'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TVShowCard } from '@/components/TVShowCard';
import { isAnimeModeActive, isKidsModeActive } from '@/lib/data';
import { fetchTVShows } from '@/lib/api';

export default function TVPage() {
  const router = useRouter();
  const [isPageReady, setIsPageReady] = useState(false);
  const [tvShows, setTvShows] = useState<any[]>([]);

  useEffect(() => {
    if (isKidsModeActive()) {
      router.replace('/kids/tv');
      return;
    }

    if (isAnimeModeActive()) {
      router.replace('/anime/shows');
      return;
    }

    async function loadTVShows() {
      setIsPageReady(true);
      const shows = await fetchTVShows();
      setTvShows(shows);
    }
    loadTVShows();
  }, [router]);

  if (!isPageReady) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading TV shows...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">TV Shows</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tvShows.map((show) => (
            <TVShowCard key={show.id} tvShow={show} />
          ))}
        </div>
      </div>
    </div>
  );
}
