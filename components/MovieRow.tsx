'use client';

import React from 'react';
import { Movie } from '@/lib/data';
import { MovieCard } from './MovieCard';
import { HorizontalSlider } from './HorizontalSlider';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  animationDuration?: number;
}

export function MovieRow({ title, movies, animationDuration = 15 }: MovieRowProps) {
  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{title}</h2>
      <HorizontalSlider duration={animationDuration}>
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-[145px] sm:w-[170px] lg:w-[200px] mr-3 sm:mr-4">
            <MovieCard movie={movie} />
          </div>
        ))}
      </HorizontalSlider>
    </div>
  );
}
