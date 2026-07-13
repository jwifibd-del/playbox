'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Mic,
  Sparkles,
  Filter,
  X,
  ChevronDown,
  Check,
  Star
} from 'lucide-react';
import { sampleMovies, trendingSearches } from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';

interface SearchFilters {
  genre: string[];
  year: string;
  quality: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState(sampleMovies);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    genre: [],
    year: 'all',
    quality: 'all'
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const queryFromRoute = searchParams.get('q')?.trim() || '';
    if (queryFromRoute) {
      setSearchQuery((current) => (current === queryFromRoute ? current : queryFromRoute));
    }
  }, [searchParams]);

  // Filter options
  const genres = ['Action', 'Adventure', 'Sci-Fi', 'Drama', 'Crime', 'Thriller', 'Romance', 'Fantasy', 'Comedy', 'Animation'];
  const years = ['all', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];
  const qualities = ['all', '4K', '1080p', '720p'];

  // Instant search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        setTimeout(() => {
          const filtered = sampleMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(filtered);
          setIsSearching(false);
        }, 500);
      } else {
        setSearchResults(sampleMovies);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...sampleMovies];

    if (activeFilters.genre.length > 0) {
      filtered = filtered.filter(movie =>
        movie.genres.some(genre => activeFilters.genre.includes(genre))
      );
    }

    if (activeFilters.year !== 'all') {
      filtered = filtered.filter(movie =>
        movie.releaseYear.toString() === activeFilters.year
      );
    }

    setSearchResults(filtered);
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Inception');
      setIsListening(false);
    }, 2000);
  };

  // Handle AI search
  const handleAISearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(sampleMovies.slice(0, 3));
      setIsSearching(false);
    }, 1500);
  };

  // Toggle genre filter
  const toggleGenre = (genre: string) => {
    setActiveFilters(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-zinc-800 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, TV shows, genres..."
                className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-600 animate-pulse' : 'hover:bg-zinc-800'}`}
                >
                  <Mic className={isListening ? 'text-white w-5 h-5' : 'text-zinc-400 w-5 h-5'} />
                </button>
                <button
                  onClick={handleAISearch}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-all"
                >
                  <Sparkles className="text-yellow-400 w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-4 rounded-2xl border transition-all ${showFilters ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-zinc-700 hover:border-zinc-600'}`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Filters</span>
              {(activeFilters.genre.length > 0 || activeFilters.year !== 'all' || activeFilters.quality !== 'all') && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-xs font-semibold rounded-full">
                  {activeFilters.genre.length + (activeFilters.year !== 'all' ? 1 : 0) + (activeFilters.quality !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-6">
                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Genre</label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map(genre => (
                        <button
                          key={genre}
                          onClick={() => toggleGenre(genre)}
                          className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                            activeFilters.genre.includes(genre)
                              ? 'border-red-500 bg-red-500/10 text-red-400'
                              : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Year</label>
                    <select
                      value={activeFilters.year}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>
                          {year === 'all' ? 'All Years' : year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quality Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Quality</label>
                    <select
                      value={activeFilters.quality}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, quality: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      {qualities.map(quality => (
                        <option key={quality} value={quality}>
                          {quality === 'all' ? 'All Quality' : quality}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setActiveFilters({ genre: [], year: 'all', quality: 'all' })}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Trending Searches */}
        {!searchQuery && searchResults.length === sampleMovies.length && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Trending Searches</h2>
            <div className="flex flex-wrap gap-3">
              {trendingSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(term)}
                  className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800 transition-all"
                >
                  <span className="text-zinc-500 w-6">{index + 1}</span>
                  <span className="text-white">{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Content'}
          </h2>
          
          {isSearching ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.map(movie => (
                <div key={movie.id}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No results found</h3>
              <p className="text-zinc-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
