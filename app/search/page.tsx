'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
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
import { sampleMovies, sampleTVShows, trendingSearches, Movie, TVShow } from '@/lib/data';
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
  type: 'all' | 'movie' | 'tv';
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

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | React.ReactNode>('');
  const [voiceErrorType, setVoiceErrorType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState(sampleMovies);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    type: 'all',
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

  // Combine movies and TV shows
  const allContent: (Movie | TVShow)[] = [...sampleMovies, ...sampleTVShows];
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const latestTranscriptRef = useRef('');
  const isListeningRef = useRef(false);

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
          const filtered = allContent.filter(item => {
            const isMovie = 'releaseYear' in item;
            const isTVShow = 'startYear' in item;
            const searchLower = searchQuery.toLowerCase();
            
            // Check if matches type filter first (just for instant search, applyFilters will handle it fully later)
            if (activeFilters.type === 'movie' && !isMovie) return false;
            if (activeFilters.type === 'tv' && !isTVShow) return false;

            // Title
            if (item.title.toLowerCase().includes(searchLower)) return true;
            // Overview
            if (item.overview && item.overview.toLowerCase().includes(searchLower)) return true;
            // Genres
            if (item.genres.some(genre => genre.toLowerCase().includes(searchLower))) return true;
            // Director (only for movies)
            if (isMovie && item.director && item.director.toLowerCase().includes(searchLower)) return true;
            // Actors (check cast if available)
            if (item.cast && item.cast.some(actor => actor.name.toLowerCase().includes(searchLower))) return true;
            
            return false;
          });
          setSearchResults(filtered as any);
          saveRecentSearch(searchQuery);
          setIsSearching(false);
        }, 500);
      } else {
        setSearchResults(allContent as any);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters.type]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...allContent];

    // Type filter
    if (activeFilters.type !== 'all') {
      filtered = filtered.filter(item => {
        if (activeFilters.type === 'movie') return 'releaseYear' in item;
        if (activeFilters.type === 'tv') return 'startYear' in item;
        return true;
      });
    }

    // Genre filter
    if (activeFilters.genre.length > 0) {
      filtered = filtered.filter(item =>
        item.genres.some(genre => activeFilters.genre.includes(genre))
      );
    }

    // Year filter
    if (activeFilters.year !== 'all') {
      filtered = filtered.filter(item => {
        const year = 'releaseYear' in item ? item.releaseYear : item.startYear;
        return year.toString() === activeFilters.year;
      });
    }

    // Language filter
    if (activeFilters.language !== 'all') {
      filtered = filtered.filter(item => item.language === activeFilters.language);
    }

    // Country filter
    if (activeFilters.country !== 'all') {
      filtered = filtered.filter(item => item.country === activeFilters.country);
    }

    // Rating filter
    if (activeFilters.rating !== 'all') {
      const minRating = parseFloat(activeFilters.rating);
      filtered = filtered.filter(item => item.rating >= minRating);
    }

    // Duration filter (only applies to movies)
    if (activeFilters.duration !== 'all') {
      filtered = filtered.filter(item => {
        if (!('runtime' in item)) return true;
        const runtimeMinutes = parseRuntimeToMinutes(item.runtime);
        if (activeFilters.duration === 'Under 90 min') return runtimeMinutes < 90;
        if (activeFilters.duration === '90-120 min') return runtimeMinutes >= 90 && runtimeMinutes <= 120;
        if (activeFilters.duration === 'Over 120 min') return runtimeMinutes > 120;
        return true;
      });
    }

    // Actor filter
    if (activeFilters.actor.trim()) {
      filtered = filtered.filter(item =>
        item.cast?.some(actor =>
          actor.name.toLowerCase().includes(activeFilters.actor.toLowerCase())
        )
      );
    }

    // Director filter (only applies to movies)
    if (activeFilters.director.trim()) {
      filtered = filtered.filter(item => {
        if (!('director' in item)) return false;
        return item.director.toLowerCase().includes(activeFilters.director.toLowerCase());
      });
    }

    setSearchResults(filtered as any);
  };

  const getVoiceSearchError = (error: string) => {
    switch (error) {
      case 'not-allowed':
      case 'service-not-allowed':
        return (
          <div className="flex flex-col items-center gap-2">
            <span>Microphone permission was denied.</span>
            <p className="text-sm text-zinc-500">
              Please allow microphone access in your browser settings, then try again.
            </p>
          </div>
        );
      case 'no-speech':
        return (
          <div className="flex flex-col items-center gap-2">
            <span>No speech was detected.</span>
            <p className="text-sm text-zinc-500">
              Please speak clearly and try again.
            </p>
          </div>
        );
      case 'audio-capture':
        return (
          <div className="flex flex-col items-center gap-2">
            <span>No microphone was found on this device.</span>
            <p className="text-sm text-zinc-500">
              Please connect a microphone and try again.
            </p>
          </div>
        );
      case 'network':
        return (
          <div className="flex flex-col items-center gap-2">
            <span>Voice search needs a network connection.</span>
            <p className="text-sm text-zinc-500">
              Please check your internet connection and try again.
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-2">
            <span>Voice search could not start.</span>
            <p className="text-sm text-zinc-500">
              Please try again later.
            </p>
          </div>
        );
    }
  };

  // Handle voice search
  const handleVoiceSearch = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if we're in a secure context
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setVoiceMessage(
        <div className="flex flex-col items-center gap-2">
          <span>Voice search requires a secure connection.</span>
          <p className="text-sm text-zinc-500">
            Please use HTTPS or localhost for voice search to work.
          </p>
        </div>
      );
      setVoiceErrorType('insecure-context');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    setVoiceErrorType(null);
    setVoiceMessage('Checking microphone access...');

    // First, try to request explicit permission using MediaDevices.getUserMedia
    // This helps ensure the browser actually prompts for microphone access
    try {
      // We just need to get the stream to prompt for permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately since we only needed it to get permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error getting microphone access:', err);
      setVoiceMessage(
        <div className="flex flex-col items-center gap-2">
          <span>Microphone permission was denied.</span>
          <p className="text-sm text-zinc-500">
            Please allow microphone access in your browser settings, then try again.
          </p>
        </div>
      );
      setVoiceErrorType('not-allowed');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceMessage(
        <div className="flex flex-col items-center gap-2">
          <span>Voice search is not supported in this browser.</span>
          <p className="text-sm text-zinc-500">
            Please try Chrome, Edge, or Safari for voice search support.
          </p>
        </div>
      );
      setVoiceErrorType('not-supported');
      return;
    }

    // Create a new recognition instance every time to avoid potential issues
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    latestTranscriptRef.current = '';
    setVoiceMessage('Listening...');

    // Try a few different combinations of settings for better compatibility
    recognition.continuous = true;
    recognition.interimResults = false; // Try without interim results for more reliability
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
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
        recognition.stop(); // Stop after getting a result
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setIsListening(false);
      isListeningRef.current = false;
      setVoiceErrorType(event.error);
      setVoiceMessage(getVoiceSearchError(event.error));
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      if (!latestTranscriptRef.current && voiceErrorType === null) {
        setVoiceMessage((current) => {
          const isListeningMsg = typeof current === 'string' && current === 'Listening...';
          if (isListeningMsg || (typeof current !== 'string' && (current as any)?.props?.children?.[0]?.props?.children?.includes('Checking'))) {
            return (
              <div className="flex flex-col items-center gap-2">
                <span>No speech was detected.</span>
                <p className="text-sm text-zinc-500">
                  Please speak clearly and try again.
                </p>
              </div>
            );
          }
          return current;
        });
      }
    };

    // Also add a timeout to automatically stop if nothing is heard
    setTimeout(() => {
      if (isListeningRef.current) {
        recognition.stop();
      }
    }, 10000); // 10 second timeout

    try {
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
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
            <div className={`flex flex-col gap-3 ${typeof voiceMessage === 'string' && voiceMessage === 'Listening...' ? 'text-red-400' : 'text-zinc-400'}`}>
              {typeof voiceMessage === 'string' ? (
                <p className="text-sm">{voiceMessage}</p>
              ) : (
                voiceMessage
              )}
              {voiceErrorType && (
                <button
                  onClick={handleVoiceSearch}
                  className="w-fit px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
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
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveFilters(prev => ({ ...prev, type: 'all' }))}
                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                          activeFilters.type === 'all'
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActiveFilters(prev => ({ ...prev, type: 'movie' }))}
                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                          activeFilters.type === 'movie'
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'
                        }`}
                      >
                        Movies
                      </button>
                      <button
                        onClick={() => setActiveFilters(prev => ({ ...prev, type: 'tv' }))}
                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                          activeFilters.type === 'tv'
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'
                        }`}
                      >
                        TV Shows
                      </button>
                    </div>
                  </div>

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
                  type: 'all',
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
                {searchResults.map((item) => {
                    const isMovie = 'releaseYear' in item;
                    const key = `${isMovie ? 'movie' : 'tv'}-${item.id}`;
                    return (
                        <div key={key}>
                            <MovieCard movie={item} />
                        </div>
                    );
                })}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading search...</p>
          </div>
        </main>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
