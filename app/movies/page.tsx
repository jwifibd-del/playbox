'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { isAnimeModeActive, isKidsModeActive } from '@/lib/data';
import { fetchMovies } from '@/lib/api';

export default function MoviesPage() {
  const router = useRouter();
  const [isPageReady, setIsPageReady] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    if (isKidsModeActive()) {
      router.replace('/kids/movies');
      return;
    }

    if (isAnimeModeActive()) {
      router.replace('/anime/movies');
      return;
    }

    async function loadMovies() {
      setIsPageReady(true);
      const apiMovies = await fetchMovies();
      setMovies(apiMovies);
    }
    loadMovies();
  }, [router]);

  if (!isPageReady) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading movies...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Movies</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
}
