'use client';

import { Suspense, useState, useEffect, useRef, useMemo } from 'react';
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
  Clock,
  Play,
  Film,
  Tv,
  TrendingUp,
  History,
  Shuffle,
  BadgeCheck,
} from 'lucide-react';
import { sampleMovies, sampleTVShows, trendingSearches, Movie, TVShow } from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';
import Image from 'next/image';

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

type Combined = Movie | TVShow;

const AI_MOODS = [
  { label: '90s Action', icon: '💥' },
  { label: 'Cozy Anime', icon: '🌸' },
  { label: 'Mind-Bending Sci-Fi', icon: '🌀' },
  { label: 'True Crime', icon: '🕵️' },
  { label: 'Oscar Winners', icon: '🏆' },
  { label: 'Feel Good RomComs', icon: '💘' },
  { label: 'Epic Fantasy', icon: '🐉' },
  { label: 'Horror Night', icon: '🎃' },
];

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | React.ReactNode>('');
  const [voiceErrorType, setVoiceErrorType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Combined[]>(sampleMovies);
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
    director: '',
  });

  const allContent: Combined[] = useMemo(
    () => [...sampleMovies, ...sampleTVShows],
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const latestTranscriptRef = useRef('');
  const isListeningRef = useRef(false);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  const heroBackdrop = useMemo(() => {
    const featured =
      sampleMovies.find((m) => (m.rating || 0) >= 8.3) || sampleMovies[0];
    return featured?.backdropPath || '';
  }, []);

  useEffect(() => {
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
    const updatedRecent = [
      trimmedQuery,
      ...recentSearches.filter(
        (s) => s.toLowerCase() !== trimmedQuery.toLowerCase(),
      ),
    ].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem('playflix_recent_searches', JSON.stringify(updatedRecent));
  };

  useEffect(() => {
    const queryFromRoute = searchParams.get('q')?.trim() || '';
    if (queryFromRoute) {
      setSearchQuery((current) =>
        current === queryFromRoute ? current : queryFromRoute,
      );
    }
  }, [searchParams]);

  const genres = [
    'Action',
    'Adventure',
    'Sci-Fi',
    'Drama',
    'Crime',
    'Thriller',
    'Romance',
    'Fantasy',
    'Comedy',
    'Animation',
  ];
  const years = [
    'all',
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
  ];
  const qualities = ['all', '4K', '1080p', '720p'];
  const languages = ['all', 'English', 'Japanese', 'Spanish', 'French', 'German'];
  const countries = [
    'all',
    'United States',
    'Japan',
    'United Kingdom',
    'Canada',
    'France',
  ];
  const ratings = ['all', '9+', '8+', '7+', '6+'];
  const durations = ['all', 'Under 90 min', '90-120 min', 'Over 120 min'];

  const parseRuntimeToMinutes = (runtime: string) => {
    const parts = runtime.match(/(\d+)h\s*(\d*)m?/);
    if (parts) {
      const hours = parseInt(parts[1]) || 0;
      const minutes = parseInt(parts[2]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  const runFilter = (query: string, filters: SearchFilters) => {
    const searchLower = query.trim().toLowerCase();
    const filtered = allContent.filter((item) => {
      const isMovie = 'releaseYear' in item;
      const isTVShow = 'startYear' in item;

      if (filters.type === 'movie' && !isMovie) return false;
      if (filters.type === 'tv' && !isTVShow) return false;

      if (filters.genre.length > 0) {
        if (!item.genres.some((genre) => filters.genre.includes(genre))) return false;
      }

      if (filters.year !== 'all') {
        const year = isMovie ? item.releaseYear : item.startYear;
        if (year.toString() !== filters.year) return false;
      }

      if (filters.language !== 'all' && (item as any).language !== filters.language) {
        return false;
      }
      if (filters.country !== 'all' && (item as any).country !== filters.country) {
        return false;
      }
      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        if ((item.rating || 0) < minRating) return false;
      }
      if (filters.duration !== 'all') {
        if (!('runtime' in item)) return true;
        const runtimeMinutes = parseRuntimeToMinutes(item.runtime);
        if (filters.duration === 'Under 90 min' && runtimeMinutes >= 90) return false;
        if (
          filters.duration === '90-120 min' &&
          (runtimeMinutes < 90 || runtimeMinutes > 120)
        )
          return false;
        if (filters.duration === 'Over 120 min' && runtimeMinutes <= 120) return false;
      }
      if (filters.actor.trim()) {
        if (
          !item.cast?.some((actor) =>
            actor.name.toLowerCase().includes(filters.actor.toLowerCase()),
          )
        )
          return false;
      }
      if (filters.director.trim()) {
        if (!('director' in item)) return false;
        if (!(item as Movie).director) return false;
        if (
          !(item as Movie).director
            .toLowerCase()
            .includes(filters.director.toLowerCase())
        )
          return false;
      }

      if (!searchLower) return true;
      if (item.title.toLowerCase().includes(searchLower)) return true;
      if (item.overview && item.overview.toLowerCase().includes(searchLower)) return true;
      if (item.genres.some((genre) => genre.toLowerCase().includes(searchLower)))
        return true;
      if (
        isMovie &&
        (item as Movie).director &&
        (item as Movie).director.toLowerCase().includes(searchLower)
      )
        return true;
      if (
        item.cast &&
        item.cast.some((actor) => actor.name.toLowerCase().includes(searchLower))
      )
        return true;
      return false;
    });
    return filtered;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(true);
      setTimeout(() => {
        setSearchResults(runFilter(searchQuery, activeFilters));
        if (searchQuery.trim()) saveRecentSearch(searchQuery);
        setIsSearching(false);
      }, 280);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters]);

  const applyFilters = () => {
    setSearchResults(runFilter(searchQuery, activeFilters));
  };

  const suggestions = useMemo<{
    titles: Combined[];
    actors: string[];
    genres: string[];
  }>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { titles: [], actors: [], genres: [] };
    const titleMatches = allContent
      .filter((c) => c.title.toLowerCase().includes(q))
      .slice(0, 5);
    const actorHits = new Set<string>();
    const genreHits = new Set<string>();
    allContent.forEach((c) => {
      c.cast?.forEach((a) => {
        if (a.name.toLowerCase().includes(q)) actorHits.add(a.name);
      });
      c.genres.forEach((g) => {
        if (g.toLowerCase().includes(q)) genreHits.add(g);
      });
    });
    return {
      titles: titleMatches,
      actors: Array.from(actorHits).slice(0, 4),
      genres: Array.from(genreHits).slice(0, 4),
    };
  }, [searchQuery, allContent]);

  const showSuggestions = inputFocused && (searchQuery.trim().length > 0);

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
            <p className="text-sm text-zinc-500">Please try again later.</p>
          </div>
        );
    }
  };

  const handleVoiceSearch = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setVoiceMessage(
        <div className="flex flex-col items-center gap-2">
          <span>Voice search requires a secure connection.</span>
          <p className="text-sm text-zinc-500">
            Please use HTTPS or localhost for voice search to work.
          </p>
        </div>,
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error('Error getting microphone access:', err);
      setVoiceMessage(
        <div className="flex flex-col items-center gap-2">
          <span>Microphone permission was denied.</span>
          <p className="text-sm text-zinc-500">
            Please allow microphone access in your browser settings, then try again.
          </p>
        </div>,
      );
      setVoiceErrorType('not-allowed');
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceMessage(
        <div className="flex flex-col items-center gap-2">
          <span>Voice search is not supported in this browser.</span>
          <p className="text-sm text-zinc-500">
            Please try Chrome, Edge, or Safari for voice search support.
          </p>
        </div>,
      );
      setVoiceErrorType('not-supported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    latestTranscriptRef.current = '';
    setVoiceMessage('Listening...');

    recognition.continuous = true;
    recognition.interimResults = false;
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
        if (!spokenText) continue;
        transcript = transcript ? `${transcript} ${spokenText}` : spokenText;
      }
      if (transcript) {
        latestTranscriptRef.current = transcript;
        setSearchQuery(transcript);
        setVoiceMessage(`Heard: "${transcript}"`);
        recognition.stop();
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
          const isListeningMsg =
            typeof current === 'string' && current === 'Listening...';
          if (
            isListeningMsg ||
            (typeof current !== 'string' &&
              (current as any)?.props?.children?.[0]?.props?.children?.includes(
                'Checking',
              ))
          ) {
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

    setTimeout(() => {
      if (isListeningRef.current) {
        recognition.stop();
      }
    }, 10000);

    try {
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      setVoiceMessage('Voice search is already active. Try again in a moment.');
    }
  };

  const handleAISearch = (mood?: string) => {
    setIsSearching(true);
    if (mood) setSearchQuery(mood);
    setTimeout(() => {
      const picked = [...allContent].sort(() => Math.random() - 0.5).slice(0, 12);
      setSearchResults(picked);
      setIsSearching(false);
    }, 700);
  };

  const toggleGenre = (genre: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  };

  const activeFilterCount =
    (activeFilters.type !== 'all' ? 1 : 0) +
    activeFilters.genre.length +
    (activeFilters.year !== 'all' ? 1 : 0) +
    (activeFilters.quality !== 'all' ? 1 : 0) +
    (activeFilters.language !== 'all' ? 1 : 0) +
    (activeFilters.country !== 'all' ? 1 : 0) +
    (activeFilters.rating !== 'all' ? 1 : 0) +
    (activeFilters.duration !== 'all' ? 1 : 0) +
    (activeFilters.actor.trim() ? 1 : 0) +
    (activeFilters.director.trim() ? 1 : 0);

  const resetFilters = () =>
    setActiveFilters({
      type: 'all',
      genre: [],
      year: 'all',
      quality: 'all',
      language: 'all',
      country: 'all',
      rating: 'all',
      duration: 'all',
      actor: '',
      director: '',
    });

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* ====== NETFLIX-STYLE HERO BACKDROP BEHIND SEARCH ====== */}
      <div className="relative w-full">
        <div className="absolute inset-0 h-[460px] md:h-[520px] lg:h-[560px] overflow-hidden">
          <Image
            src={heroBackdrop}
            alt=""
            fill
            priority
            quality={90}
            className="object-cover scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/65 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* ====== SEARCH HEADER (sticky, glassy Netflix-style bar) ====== */}
        <div className="relative z-20">
          <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-10 md:pt-14 pb-6 md:pb-8">
              {/* Title row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 md:mb-8"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/25 text-red-300 text-[11px] sm:text-xs font-bold tracking-widest uppercase">
                    <Search size={12} /> Browse Library
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-400">
                    {allContent.length} titles · 4K · HDR
                  </span>
                </div>
                <h1 className="font-black tracking-[-0.04em] leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white max-w-3xl">
                  Find your next{' '}
                  <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-300 bg-clip-text text-transparent">
                    obsession.
                  </span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl">
                  Search thousands of movies, series, genres and stars. Hit mic for voice, or
                  pick a vibe below.
                </p>
              </motion.div>

              {/* Search bar row */}
              <div className="flex flex-col lg:flex-row items-stretch gap-4">
                <div
                  ref={inputWrapRef}
                  className={`relative flex-1 transition-all duration-300 ${
                    inputFocused ? 'scale-[1.005]' : ''
                  }`}
                >
                  <div
                    className={`absolute -inset-[1.5px] rounded-[28px] blur-xl transition-opacity duration-500 pointer-events-none ${
                      inputFocused ? 'opacity-80' : 'opacity-0'
                    }`}
                    style={{
                      background:
                        'conic-gradient(from 140deg at 50% 50%, #ef4444, #f43f5e, #d946ef, #ef4444)',
                    }}
                  />
                  <div className="relative flex items-center rounded-[28px] bg-zinc-900/75 border border-white/10 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] overflow-hidden">
                    <Search
                      className={`ml-5 w-6 h-6 shrink-0 transition-colors duration-300 ${
                        inputFocused ? 'text-red-500' : 'text-zinc-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() =>
                        setTimeout(() => {
                          setInputFocused(false);
                          setVoiceMessage('');
                          setVoiceErrorType(null);
                        }, 180)
                      }
                      placeholder="Search titles, actors, genres, moods…"
                      className="flex-1 bg-transparent pl-4 pr-2 py-[18px] sm:py-5 text-white placeholder-zinc-500 focus:outline-none text-base sm:text-lg"
                    />
                    <div className="flex items-center gap-1 sm:gap-1.5 pr-1.5 sm:pr-2">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                          aria-label="Clear search"
                        >
                          <X size={18} />
                        </button>
                      )}
                      <button
                        onClick={handleVoiceSearch}
                        className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 ${
                          isListening
                            ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.55)] animate-pulse'
                            : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        aria-label="Voice search"
                      >
                        <Mic size={20} />
                      </button>
                      <button
                        onClick={() => handleAISearch()}
                        className="p-2.5 sm:p-3 rounded-full text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 transition-all group"
                        aria-label="AI search"
                      >
                        <Sparkles
                          size={20}
                          className="transition-transform duration-500 group-hover:rotate-[25deg]"
                        />
                      </button>
                    </div>
                  </div>

                  {/* ===== LIVE TYPEAHEAD DROPDOWN ===== */}
                  <AnimatePresence>
                    {showSuggestions &&
                      (suggestions.titles.length > 0 ||
                        suggestions.actors.length > 0 ||
                        suggestions.genres.length > 0) && (
                        <motion.div
                          key="typeahead"
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute left-0 right-0 mt-3 z-50 rounded-3xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                          {suggestions.titles.length > 0 && (
                            <div className="px-4 pt-4 pb-2">
                              <div className="flex items-center gap-2 px-1 mb-2.5">
                                <Film size={13} className="text-red-400" />
                                <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-500">
                                  Titles
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                {suggestions.titles.map((s) => {
                                  const isMovie = 'releaseYear' in s;
                                  return (
                                    <button
                                      key={`${isMovie ? 'm' : 't'}-${s.id}`}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => setSearchQuery(s.title)}
                                      className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-2xl hover:bg-white/5 transition-colors"
                                    >
                                      <div className="relative w-11 h-14 shrink-0 rounded-lg overflow-hidden bg-zinc-800">
                                        <Image
                                          src={s.posterPath}
                                          alt={s.title}
                                          fill
                                          className="object-cover"
                                          sizes="44px"
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white truncate">
                                          {s.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                                          {isMovie ? (
                                            <span className="inline-flex items-center gap-1">
                                              <Film size={11} />
                                              {(s as Movie).releaseYear}
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1">
                                              <Tv size={11} />
                                              {(s as TVShow).startYear}
                                            </span>
                                          )}
                                          <span className="inline-flex items-center gap-1 text-amber-300">
                                            <Star size={11} fill="currentColor" />
                                            {s.rating?.toFixed(1) || 'NR'}
                                          </span>
                                        </div>
                                      </div>
                                      <Play
                                        size={14}
                                        className="text-zinc-500 shrink-0 opacity-0 group-hover:opacity-100"
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {(suggestions.actors.length > 0 ||
                            suggestions.genres.length > 0) && (
                            <div className="px-4 pb-4 pt-2 border-t border-white/5">
                              {suggestions.actors.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 px-1 mb-2">
                                    Actors
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {suggestions.actors.map((a) => (
                                      <button
                                        key={a}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setSearchQuery(a)}
                                        className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-zinc-200 border border-white/10 hover:bg-white/10 transition-colors"
                                      >
                                        {a}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {suggestions.genres.length > 0 && (
                                <div>
                                  <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-500 px-1 mb-2">
                                    Genres
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {suggestions.genres.map((g) => (
                                      <button
                                        key={g}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => setSearchQuery(g)}
                                        className="px-3 py-1.5 rounded-full bg-red-500/10 text-xs text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                      >
                                        {g}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className={`group inline-flex items-center justify-center gap-2.5 px-6 py-[18px] sm:py-5 rounded-[28px] border transition-all duration-300 ${
                    showFilters
                      ? 'border-red-500/60 bg-red-500/10 text-white shadow-[0_20px_60px_-15px_rgba(239,68,68,0.45)]'
                      : 'border-white/10 bg-zinc-900/75 text-white hover:bg-zinc-800/75 backdrop-blur-xl'
                  }`}
                >
                  <Filter size={20} />
                  <span className="font-semibold tracking-wide">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold shadow-[0_0_15px_rgba(239,68,68,0.55)]">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      showFilters ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Voice message */}
              <AnimatePresence>
                {voiceMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mt-4 flex flex-col gap-3 ${
                      typeof voiceMessage === 'string' && voiceMessage === 'Listening...'
                        ? 'text-red-400'
                        : 'text-zinc-400'
                    }`}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ===== AI MOOD / CATEGORY CHIPS ===== */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-amber-300" />
                  <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-500">
                    AI Moods · Try one
                  </p>
                  <button
                    onClick={() => handleAISearch()}
                    className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    <Shuffle size={12} />
                    Surprise me
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {AI_MOODS.map((m, i) => (
                    <motion.button
                      key={m.label}
                      onClick={() => handleAISearch(m.label)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.12 + i * 0.03,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/15 backdrop-blur-xl text-sm text-white transition-all"
                    >
                      <span className="text-base leading-none">{m.icon}</span>
                      <span className="font-medium whitespace-nowrap">{m.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* ===== FILTERS PANEL ===== */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    key="filterpanel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-5 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Type Filter */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                            Type
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {(
                              [
                                { k: 'all', l: 'All' },
                                { k: 'movie', l: 'Movies' },
                                { k: 'tv', l: 'TV Shows' },
                              ] as const
                            ).map((t) => (
                              <button
                                key={t.k}
                                onClick={() =>
                                  setActiveFilters((p) => ({ ...p, type: t.k }))
                                }
                                className={`px-4 py-2 rounded-2xl border text-sm font-semibold transition-all ${
                                  activeFilters.type === t.k
                                    ? 'border-red-500/60 bg-red-500/12 text-white shadow-[0_10px_30px_-10px_rgba(239,68,68,0.55)]'
                                    : 'border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/15'
                                }`}
                              >
                                {t.l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Genre Filter */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                            Genre
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => {
                              const on = activeFilters.genre.includes(genre);
                              return (
                                <button
                                  key={genre}
                                  onClick={() => toggleGenre(genre)}
                                  className={`group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-sm font-medium transition-all ${
                                    on
                                      ? 'border-red-500/50 bg-red-500/12 text-white'
                                      : 'border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/15'
                                  }`}
                                >
                                  {on && <Check size={14} className="text-red-400" />}
                                  {genre}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {[
                          {
                            label: 'Year',
                            value: activeFilters.year,
                            set: (v: string) =>
                              setActiveFilters((p) => ({ ...p, year: v })),
                            opts: years,
                            labelize: (v: string) => (v === 'all' ? 'All Years' : v),
                          },
                          {
                            label: 'Quality',
                            value: activeFilters.quality,
                            set: (v: string) =>
                              setActiveFilters((p) => ({ ...p, quality: v })),
                            opts: qualities,
                            labelize: (v: string) => (v === 'all' ? 'All Quality' : v),
                          },
                          {
                            label: 'Language',
                            value: activeFilters.language,
                            set: (v: string) =>
                              setActiveFilters((p) => ({ ...p, language: v })),
                            opts: languages,
                            labelize: (v: string) =>
                              v === 'all' ? 'All Languages' : v,
                          },
                          {
                            label: 'Country',
                            value: activeFilters.country,
                            set: (v: string) =>
                              setActiveFilters((p) => ({ ...p, country: v })),
                            opts: countries,
                            labelize: (v: string) =>
                              v === 'all' ? 'All Countries' : v,
                          },
                          {
                            label: 'Rating',
                            value: activeFilters.rating,
                            set: (v: string) =>
                              setActiveFilters((p) => ({ ...p, rating: v })),
                            opts: ratings,
                            labelize: (v: string) =>
                              v === 'all' ? 'All Ratings' : `Rating ${v}`,
                          },
                          {
                            label: 'Duration',
                            value: activeFilters.duration,
                            set: (v: string) =>
                              setActiveFilters((p) => ({ ...p, duration: v })),
                            opts: durations,
                            labelize: (v: string) =>
                              v === 'all' ? 'All Durations' : v,
                          },
                        ].map((f) => (
                          <div key={f.label}>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                              {f.label}
                            </label>
                            <select
                              value={f.value}
                              onChange={(e) => f.set(e.target.value)}
                              className="w-full px-4 py-3 rounded-2xl bg-zinc-950/70 border border-white/10 text-white focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
                            >
                              {f.opts.map((opt) => (
                                <option
                                  key={opt}
                                  value={opt === 'all' ? opt : opt.replace('+', '')}
                                >
                                  {f.labelize(opt)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                            Director
                          </label>
                          <input
                            type="text"
                            value={activeFilters.director}
                            onChange={(e) =>
                              setActiveFilters((p) => ({
                                ...p,
                                director: e.target.value,
                              }))
                            }
                            placeholder="Search director…"
                            className="w-full px-4 py-3 rounded-2xl bg-zinc-950/70 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
                            Actor
                          </label>
                          <input
                            type="text"
                            value={activeFilters.actor}
                            onChange={(e) =>
                              setActiveFilters((p) => ({ ...p, actor: e.target.value }))
                            }
                            placeholder="Search actor…"
                            className="w-full px-4 py-3 rounded-2xl bg-zinc-950/70 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-white/5">
                        <button
                          onClick={resetFilters}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <X size={15} />
                          Reset Filters
                        </button>
                        <button
                          onClick={applyFilters}
                          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 hover:brightness-110 text-white font-bold shadow-[0_20px_60px_-15px_rgba(239,68,68,0.6)] transition-all"
                        >
                          <BadgeCheck size={18} />
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RESULTS CONTENT ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-24">
        {/* Trending / Recent */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-red-500 to-rose-500" />
                <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                  Trending Searches
                  <TrendingUp size={20} className="text-red-400" />
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trendingSearches.map((term, index) => (
                  <motion.button
                    key={term}
                    whileHover={{ y: -2, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.06 * index,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => setSearchQuery(term)}
                    className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.07] hover:border-red-500/30 hover:bg-zinc-900/90 backdrop-blur-xl text-left transition-all overflow-hidden"
                  >
                    <span className="font-black text-3xl text-zinc-700 group-hover:text-red-500/70 transition-colors tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-semibold text-white tracking-tight">
                      {term}
                    </span>
                    <ChevronDown
                      size={18}
                      className="text-zinc-500 -rotate-90 group-hover:text-red-400 group-hover:translate-x-1 transition-all"
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-fuchsia-500 to-indigo-500" />
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                      Recent Searches
                      <History size={20} className="text-fuchsia-400" />
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('playflix_recent_searches');
                    }}
                    className="text-sm font-semibold text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.map((term, index) => (
                    <motion.button
                      key={`${term}-${index}`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.03 * index,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => setSearchQuery(term)}
                      className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/15 backdrop-blur-sm text-sm text-zinc-200 transition-all"
                    >
                      <Clock size={14} className="text-zinc-500" />
                      <span className="font-medium">{term}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Results header */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-6 md:mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              {searchQuery ? (
                <>
                  Results for{' '}
                  <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
                    “{searchQuery}”
                  </span>
                </>
              ) : (
                'All Content'
              )}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {searchResults.length} {searchResults.length === 1 ? 'title' : 'titles'}
              {activeFilterCount > 0 && ` · ${activeFilterCount} filter(s) applied`}
            </p>
          </div>
        </motion.div>

        {isSearching ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-2xl bg-zinc-900 border border-white/[0.04] overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-[shimmer_1.6s_infinite] bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6"
          >
            {searchResults.map((item, idx) => {
              const isMovie = 'releaseYear' in item;
              const key = `${isMovie ? 'movie' : 'tv'}-${item.id}`;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(0.6, idx * 0.035),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <MovieCard movie={item} />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-zinc-900/80 backdrop-blur-xl p-10 md:p-16 text-center overflow-hidden"
          >
            <div className="pointer-events-none absolute -top-32 -right-24 w-96 h-96 rounded-full bg-red-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-zinc-900 border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] mb-6">
              <Search className="w-9 h-9 md:w-11 md:h-11 text-zinc-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
              No results found
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              Try adjusting your filters, or explore one of our curated moods below.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {AI_MOODS.slice(0, 4).map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleAISearch(m.label)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-sm text-white font-medium transition-all"
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setSearchQuery('');
                  resetFilters();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold shadow-[0_20px_60px_-15px_rgba(239,68,68,0.55)] transition-all"
              >
                Clear search
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading search…</p>
          </div>
        </main>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
