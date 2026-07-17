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
  Star,
  Clock
} from 'lucide-react';
import { sampleMovies, trendingSearches } from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SearchFilters {
  genre: string[];
  year: string;
  quality: string;
  language: string;
  country: string;
  rating: string;
  duration: string;
  actor: string;
  director: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState(sampleMovies);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    genre: [],
    year: 'all',
    quality: 'all',
    language: 'all',
    country: 'all',
    rating: 'all',
    duration: 'all',
    actor: '',
    director: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const latestTranscriptRef = useRef('');

  useEffect(() => {
    // Load recent searches from localStorage
    const savedRecent = localStorage.getItem('playflix_recent_searches');
    if (savedRecent) {
      try {
        setRecentSearches(JSON.parse(savedRecent));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const trimmedQuery = query.trim();
    const updatedRecent = [trimmedQuery, ...recentSearches.filter(s => s.toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem('playflix_recent_searches', JSON.stringify(updatedRecent));
  };

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
  const languages = ['all', 'English', 'Japanese', 'Spanish', 'French', 'German'];
  const countries = ['all', 'United States', 'Japan', 'United Kingdom', 'Canada', 'France'];
  const ratings = ['all', '9+', '8+', '7+', '6+'];
  const durations = ['all', 'Under 90 min', '90-120 min', 'Over 120 min'];

  // Helper to parse runtime string to minutes
  const parseRuntimeToMinutes = (runtime: string) => {
    const parts = runtime.match(/(\d+)h\s*(\d*)m?/);
    if (parts) {
      const hours = parseInt(parts[1]) || 0;
      const minutes = parseInt(parts[2]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  // Instant search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true);
        setTimeout(() => {
          const filtered = sampleMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
            movie.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
            movie.director.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered);
          saveRecentSearch(searchQuery);
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

    if (activeFilters.language !== 'all') {
      filtered = filtered.filter(movie => movie.language === activeFilters.language);
    }

    if (activeFilters.country !== 'all') {
      filtered = filtered.filter(movie => movie.country === activeFilters.country);
    }

    if (activeFilters.rating !== 'all') {
      const minRating = parseFloat(activeFilters.rating);
      filtered = filtered.filter(movie => movie.rating >= minRating);
    }

    if (activeFilters.duration !== 'all') {
      filtered = filtered.filter(movie => {
        const runtimeMinutes = parseRuntimeToMinutes(movie.runtime);
        if (activeFilters.duration === 'Under 90 min') return runtimeMinutes < 90;
        if (activeFilters.duration === '90-120 min') return runtimeMinutes >= 90 && runtimeMinutes <= 120;
        if (activeFilters.duration === 'Over 120 min') return runtimeMinutes > 120;
        return true;
      });
    }

    if (activeFilters.actor.trim()) {
      filtered = filtered.filter(movie =>
        movie.cast?.some(actor =>
          actor.name.toLowerCase().includes(activeFilters.actor.toLowerCase())
        )
      );
    }

    if (activeFilters.director.trim()) {
      filtered = filtered.filter(movie =>
        movie.director.toLowerCase().includes(activeFilters.director.toLowerCase())
      );
    }

    setSearchResults(filtered);
  };

  const getVoiceSearchError = (error: string) => {
    switch (error) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone permission was denied.';
      case 'no-speech':
        return 'No speech was detected. Try again.';
      case 'audio-capture':
        return 'No microphone was found on this device.';
      case 'network':
        return 'Voice search needs a network connection.';
      default:
        return 'Voice search could not start.';
    }
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceMessage('Voice search is not supported in this browser.');
      return;
    }

    const recognition = recognitionRef.current ?? new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    latestTranscriptRef.current = '';
    setVoiceMessage('Listening...');

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const spokenText = result[0]?.transcript?.trim();
        if (!spokenText) {
          continue;
        }

        transcript = transcript ? `${transcript} ${spokenText}` : spokenText;
      }

      if (transcript) {
        latestTranscriptRef.current = transcript;
        setSearchQuery(transcript);
        setVoiceMessage(`Heard: "${transcript}"`);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(getVoiceSearchError(event.error));
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!latestTranscriptRef.current) {
        setVoiceMessage((current) => (current === 'Listening...' ? 'No speech was detected. Try again.' : current));
      }
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceMessage('Voice search is already active. Try again in a moment.');
    }
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
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, TV shows, genres..."
                className="w-full pl-16 pr-20 py-5 bg-black/40 border-2 border-zinc-700 rounded-3xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-300 text-base sm:text-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleVoiceSearch}
                  className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-600 animate-pulse shadow-lg shadow-red-600/30' : 'hover:bg-zinc-800 hover:shadow-md'}`}
                >
                  <Mic className={isListening ? 'text-white w-6 h-6' : 'text-zinc-400 w-6 h-6'} />
                </button>
                <button
                  onClick={handleAISearch}
                  className="p-3 hover:bg-yellow-500/10 rounded-full transition-all duration-300 hover:shadow-md"
                >
                  <Sparkles className="text-yellow-400 w-6 h-6" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-4 rounded-2xl border transition-all ${showFilters ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-zinc-700 hover:border-zinc-600'}`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Filters</span>
              {Object.values(activeFilters).some(v => Array.isArray(v) ? v.length > 0 : v && v !== 'all') && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-xs font-semibold rounded-full">!</span>
              )}
            </button>
          </div>
          {voiceMessage && (
            <p className={`text-sm ${voiceMessage === 'Listening...' ? 'text-red-400' : 'text-zinc-400'}`}>
              {voiceMessage}
            </p>
          )}

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-6">
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

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Language</label>
                    <select
                      value={activeFilters.language}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang === 'all' ? 'All Languages' : lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Country</label>
                    <select
                      value={activeFilters.country}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country === 'all' ? 'All Countries' : country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Rating</label>
                    <select
                      value={activeFilters.rating}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      {ratings.map(rating => (
                        <option key={rating} value={rating.replace('+', '')}>
                          {rating === 'all' ? 'All Ratings' : `Rating ${rating}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Duration</label>
                    <select
                      value={activeFilters.duration}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      {durations.map(dur => (
                        <option key={dur} value={dur}>
                          {dur === 'all' ? 'All Durations' : dur}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Director Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Director</label>
                    <input
                      type="text"
                      value={activeFilters.director}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, director: e.target.value }))}
                      placeholder="Search director..."
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Actor Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Actor</label>
                    <input
                      type="text"
                      value={activeFilters.actor}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, actor: e.target.value }))}
                      placeholder="Search actor..."
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setActiveFilters({ 
                      genre: [], 
                      year: 'all', 
                      quality: 'all',
                      language: 'all',
                      country: 'all',
                      rating: 'all',
                      duration: 'all',
                      actor: '',
                      director: ''
                    })}
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
        {/* Trending & Recent Searches */}
        {!searchQuery && searchResults.length === sampleMovies.length && (
          <>
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

            {recentSearches.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Recent Searches</h2>
                  <button 
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('playflix_recent_searches');
                    }}
                    className="text-zinc-400 hover:text-red-400 text-sm"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(term)}
                      className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800 transition-all"
                    >
                      <Clock className="text-zinc-500 w-4 h-4" />
                      <span className="text-white">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
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
