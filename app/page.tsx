'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import { Footer } from '@/components/Footer';
import { ContinueWatchingRow } from '@/components/ContinueWatchingRow';
import { LiveTVRow } from '@/components/LiveTVRow';
import { NewsRow } from '@/components/NewsRow';
import { KidsRow } from '@/components/KidsRow';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { HorizontalSlider } from '@/components/HorizontalSlider';
import { MovieCard } from '@/components/MovieCard';
import { sampleMovies, continueWatching, liveChannels, newsItems, kidsContent, trendingSearches, recentSearches, getGenres, getTVShows, isAnimeModeActive, isKidsModeActive } from '@/lib/data';
import { getHeroBanners, getSliderSections, getHomepageSections, HeroBanner as HeroBannerType, SliderSection, HomepageSection } from '@/lib/data';
import { TVShowCard } from '@/components/TVShowCard';
import { TVShowRow } from '@/components/TVShowRow';
import { fetchMovies } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isPageReady, setIsPageReady] = useState(false);
  const [movies, setMovies] = useState(sampleMovies);
  const [tvShows, setTVShows] = useState([] as any[]);
  const [genres, setGenres] = useState(getGenres());
  
  useEffect(() => {
    if (isKidsModeActive()) {
      router.replace('/kids');
      return;
    }

    if (isAnimeModeActive()) {
      router.replace('/anime');
      return;
    }

    async function loadData() {
      setIsPageReady(true);
      const apiMovies = await fetchMovies();
      setMovies(apiMovies);
      const adminTVShows = getTVShows();
      if (adminTVShows.length > 0) {
        setTVShows(adminTVShows);
      }
    }
    loadData();
  }, [router]);
  const trendingMovies = movies.slice(0, 6);
  const popularMovies = movies;
  const topRatedMovies = [...movies].sort((a, b) => b.rating - a.rating);
  const recommendations = movies.slice(0, 5);

  const [heroBanners, setHeroBanners] = useState<HeroBannerType[]>([]);
  const [sliderSections, setSliderSections] = useState<SliderSection[]>([]);
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);

  useEffect(() => {
    setHeroBanners(getHeroBanners().filter(b => b.isActive));
    setSliderSections(getSliderSections().filter(s => s.isActive));
    setHomepageSections(getHomepageSections().filter(s => s.isActive).sort((a, b) => a.order - b.order));
  }, []);

  // Convert HeroBanners to Movie-like objects for HeroBanner component
  const heroMoviesForCarousel = heroBanners.map((banner) => ({
    id: banner.movieId ?? banner.id,
    title: banner.title,
    tagline: '',
    overview: banner.description,
    posterPath: banner.posterUrl,
    backdropPath: banner.backdropUrl,
    releaseYear: 2024,
    rating: 8.5,
    runtime: '2h 00m',
    genres: ['Drama'],
    country: 'United States',
    language: 'English',
    quality: '4K',
    studio: 'PlayFlix',
    director: 'Unknown',
  }));

  // Fallback to sample movies if no hero banners
  const finalHeroMovies = heroMoviesForCarousel.length > 0 
    ? heroMoviesForCarousel 
    : movies.slice(0, 3);

  const renderHomepageSection = (section: HomepageSection) => {
    const duration = section.animationDuration || 15;
    switch (section.type) {
      case 'continue-watching':
        return <ContinueWatchingRow key={section.id} title={section.title} items={continueWatching} animationDuration={duration} />;
      case 'recommended':
        return <MovieRow key={section.id} title={section.title} movies={recommendations} animationDuration={duration} />;
      case 'live-tv':
        return <LiveTVRow key={section.id} title={section.title} channels={liveChannels} animationDuration={duration} />;
      case 'trending':
        return <MovieRow key={section.id} title={section.title} movies={trendingMovies} animationDuration={duration} />;
      case 'news':
        return <NewsRow key={section.id} title={section.title} items={newsItems} animationDuration={duration} />;
      case 'popular':
        return <MovieRow key={section.id} title={section.title} movies={popularMovies} animationDuration={duration} />;
      case 'kids':
        return <KidsRow key={section.id} title={section.title} items={kidsContent} animationDuration={duration} />;
      case 'anime':
        // Skip anime sections on main home page, they have their own /anime page
        return null;
      case 'top-rated':
        return <MovieRow key={section.id} title={section.title} movies={topRatedMovies} animationDuration={duration} />;
      case 'movie-genre': {
        const genre = section.genre;
        const genreMovies = genre
          ? movies.filter(m => m.genres.includes(genre))
          : movies;
        return <MovieRow key={section.id} title={section.title} movies={genreMovies} animationDuration={duration} />;
      }
      case 'tv-genre': {
        const genre = section.genre;
        const genreTVShows = genre
          ? tvShows.filter(tv => tv.genres.includes(genre))
          : tvShows;
        return <TVShowRow key={section.id} title={section.title} tvShows={genreTVShows} animationDuration={duration} />;
      }
      case 'custom':
      default:
        const sectionMovies = section.movieIds 
          ? section.movieIds
              .map((id: any) => movies.find((m: any) => m.id === id))
              .filter((movie): movie is NonNullable<(typeof movies)[number]> => Boolean(movie))
          : movies;
        return <MovieRow key={section.id} title={section.title} movies={sectionMovies} animationDuration={duration} />;
    }
  };

  if (!isPageReady) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading home...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />
      <HeroBanner movies={finalHeroMovies} />

      {/* Horizontal Slider Sections from Admin */}
      {sliderSections.map((section) => {
        let sectionMovies: any[];
        if (section.type === 'genre' && section.genreId) {
          const selectedGenre = genres.find(g => g.id === section.genreId);
          sectionMovies = selectedGenre 
            ? movies.filter(m => m.genres.includes(selectedGenre.name))
            : [];
        } else {
          sectionMovies = section.movieIds.length > 0
            ? section.movieIds.map((id: any) => movies.find((m: any) => m.id === id)).filter(Boolean)
            : movies;
        }
        
        if (sectionMovies.length === 0) return null;

        return (
          <div key={section.id} className="px-6 md:px-12 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">{section.title}</h2>
            {section.description && (
              <p className="text-zinc-400 mb-6">{section.description}</p>
            )}
            <HorizontalSlider duration={section.animationDuration}>
              {sectionMovies.map((movie) => movie && (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </div>
        );
      })}

      {/* Homepage Sections from Admin */}
      {homepageSections.map(renderHomepageSection)}

      <SearchSuggestions trendingSearches={trendingSearches} recentSearches={recentSearches} />
      <Footer />
    </main>
  );
}
