'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clapperboard, Home, Sparkles, Tv, Sword, Zap, Star, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { HorizontalSlider } from '@/components/HorizontalSlider';
import { MovieCard } from '@/components/MovieCard';
import { TVShowCard } from '@/components/TVShowCard';
import { TVShowRow } from '@/components/TVShowRow';
import {
  getAnimeHeroBanners,
  getAnimeSliderSections,
  getAnimeHomepageSections,
  getFilteredAnimeMovies,
  getFilteredAnimeTVShows,
  getHeroBannerContentId,
  getParentalControlSettings,
  getSliderSectionContentIds,
  HeroBanner as HeroBannerType,
  saveParentalControlSettings,
  SliderSection,
  TVShow,
  defaultParentalControlSettings,
  Movie,
  HomepageSection,
} from '@/lib/data';

function buildFallbackAnimeShows(animeMovies: ReturnType<typeof getFilteredAnimeMovies>): TVShow[] {
  return animeMovies.slice(0, 6).map((movie, index) => ({
    id: `tv-${movie.id}`,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
    startYear: movie.releaseYear,
    endYear: undefined,
    rating: movie.rating,
    country: movie.country,
    language: movie.language,
    quality: movie.quality,
    studio: movie.studio,
    director: movie.director,
    genres: movie.genres,
    tags: movie.tags,
    trailerUrl: movie.trailerUrl,
    seasons: [],
    numberOfSeasons: 1,
    numberOfEpisodes: 12 + index,
  }));
}

export default function AnimeModePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(defaultParentalControlSettings);
  const [heroBanners, setHeroBanners] = useState<HeroBannerType[]>([]);
  const [sliderSections, setSliderSections] = useState<SliderSection[]>([]);
  const [animeHomepageSections, setAnimeHomepageSections] = useState<HomepageSection[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Movie[]>([]);
  const [animeShows, setAnimeShows] = useState<TVShow[]>([]);

  useEffect(() => {
    setMounted(true);
    const nextMovies = getFilteredAnimeMovies();
    const nextShows = getFilteredAnimeTVShows();
    setSettings(getParentalControlSettings());
    setHeroBanners(getAnimeHeroBanners().filter((banner) => banner.isActive).sort((a, b) => a.order - b.order));
    setSliderSections(getAnimeSliderSections().filter((section) => section.isActive).sort((a, b) => a.order - b.order));
    setAnimeHomepageSections(getAnimeHomepageSections().filter((section) => section.isActive).sort((a, b) => a.order - b.order));
    setAnimeMovies(nextMovies);
    setAnimeShows(nextShows.length > 0 ? nextShows : buildFallbackAnimeShows(nextMovies));
  }, []);

  const animeHeroMovies = useMemo(() => {
    const bannerMovies = heroBanners.map((banner, index) => {
      const bannerContentId = getHeroBannerContentId(banner);

      if (banner.contentType === 'tv') {
        const matchedShow = animeShows.find((show) => String(show.id) === String(bannerContentId));
        if (matchedShow) {
          return {
            id: matchedShow.id,
            title: matchedShow.title,
            tagline: matchedShow.tagline || 'Anime Spotlight',
            overview: matchedShow.overview,
            posterPath: matchedShow.posterPath,
            backdropPath: matchedShow.backdropPath,
            startYear: matchedShow.startYear,
            endYear: matchedShow.endYear,
            rating: matchedShow.rating,
            genres: matchedShow.genres,
            contentType: 'tv' as const,
          };
        }
      }

      return {
        id: bannerContentId ?? banner.id,
        title: banner.title,
        tagline: banner.contentType === 'tv' ? 'Anime Series Spotlight' : 'Anime Spotlight',
        overview: banner.description,
        posterPath: banner.posterUrl,
        backdropPath: banner.backdropUrl,
        releaseYear: 2024,
        rating: 8.9,
        runtime: '2h 10m',
        genres: animeMovies[index % Math.max(animeMovies.length, 1)]?.genres || ['Anime'],
        contentType: banner.contentType ?? 'movie',
      };
    });

    if (bannerMovies.length > 0) {
      return bannerMovies;
    }

    return animeMovies.slice(0, 3);
  }, [animeMovies, heroBanners]);
  const animeHeroAutoScrollInterval = heroBanners[0]?.autoScrollInterval ?? 10000;

  const renderAnimeHomepageSection = (section: HomepageSection) => {
    const duration = section.animationDuration || 15;
    switch (section.type) {
      case 'continue-watching':
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            <p className="text-zinc-300 mb-6">Your anime watching progress</p>
          </motion.div>
        );
      case 'recommended':
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            <HorizontalSlider duration={duration}>
              {animeMovies.slice(0, 8).map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
      case 'trending':
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            <HorizontalSlider duration={duration}>
              {animeMovies.slice(0, 8).map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
      case 'popular':
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            <HorizontalSlider duration={duration}>
              {animeMovies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
      case 'anime':
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            <HorizontalSlider duration={duration}>
              {animeShows.length > 0
                ? animeShows.map((show) => (
                    <div key={show.id} className="flex-shrink-0 w-[200px] mr-4">
                      <TVShowCard tvShow={show} />
                    </div>
                  ))
                : animeMovies.map((movie) => (
                    <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
            </HorizontalSlider>
          </motion.div>
        );
      case 'top-rated':
        const topRatedAnime = [...animeMovies].sort((a, b) => b.rating - a.rating);
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            <HorizontalSlider duration={duration}>
              {topRatedAnime.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
      case 'movie-genre': {
        const genre = section.genre;
        const genreMovies = genre
          ? animeMovies.filter(m => m.genres.includes(genre))
          : animeMovies;
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-zinc-300 mb-6">{section.description}</p>
            )}
            <HorizontalSlider duration={duration}>
              {genreMovies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
      }
      case 'tv-genre': {
        const genre = section.genre;
        const genreTVShows = genre
          ? animeShows.filter(tv => tv.genres.includes(genre))
          : animeShows;
        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-zinc-300 mb-6">{section.description}</p>
            )}
            <HorizontalSlider duration={duration}>
              {genreTVShows.map((show) => (
                <div key={show.id} className="flex-shrink-0 w-[200px] mr-4">
                  <TVShowCard tvShow={show} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
      }
      case 'custom':
      default:
        const sectionContentIds = section.movieIds || [];
        const sectionMovies = sectionContentIds.length > 0
          ? sectionContentIds
              .map((id) => animeMovies.find((movie) => String(movie.id) === String(id)))
              .filter((movie): movie is NonNullable<(typeof animeMovies)[number]> => Boolean(movie))
          : animeMovies;
        
        const sectionShows = sectionContentIds.length > 0
          ? sectionContentIds
              .map((id) => animeShows.find((show) => String(show.id) === String(id)))
              .filter((show): show is TVShow => Boolean(show))
          : animeShows;

        if (section.contentType === 'tv' && sectionShows.length > 0) {
          return (
            <motion.div
              key={section.id}
              className="px-0 md:px-0 py-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-6">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-zinc-300 mb-6">{section.description}</p>
              )}
              <HorizontalSlider duration={duration}>
                {sectionShows.map((show) => (
                  <div key={show.id} className="flex-shrink-0 w-[200px] mr-4">
                    <TVShowCard tvShow={show} />
                  </div>
                ))}
              </HorizontalSlider>
            </motion.div>
          );
        }

        if (sectionMovies.length === 0) return null;

        return (
          <motion.div
            key={section.id}
            className="px-0 md:px-0 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-zinc-300 mb-6">{section.description}</p>
            )}
            <HorizontalSlider duration={duration}>
              {sectionMovies.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-[200px] mr-4">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </HorizontalSlider>
          </motion.div>
        );
    }
  };

  const navItems = [
    { label: 'Anime Home', icon: Home, href: '/anime' },
    { label: 'Anime Movies', icon: Clapperboard, href: '/anime/movies' },
    { label: 'Anime Shows', icon: Tv, href: '/anime/shows' },
  ];

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-fuchsia-600/30 to-purple-600/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-pink-600/10 to-yellow-600/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <Navbar />
      {animeHeroMovies.length > 0 && (
        <HeroBanner movies={animeHeroMovies} autoScrollInterval={animeHeroAutoScrollInterval} />
      )}

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/30"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                PlayFlix Anime
              </h1>
              <p className="text-zinc-300 mt-2 text-lg">Discover the best anime with cinematic experiences</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {navItems.map((item, index) => (
              <motion.button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-pink-500/10 transition-all font-semibold"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Marathon Highlight Banner */}
        <motion.div
          className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-pink-900/30 via-purple-900/30 to-cyan-900/30 border border-white/10 backdrop-blur-xl shadow-2xl shadow-pink-500/10"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Sword className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Series Arcs Built for Marathons
                </h3>
                <p className="text-zinc-300 text-lg max-w-2xl">
                  Jump into character-driven anime shows, power arcs, fantasy worlds, and serialized storytelling. Perfect for binge-watching sessions!
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold text-yellow-400">10+</div>
                <div className="text-zinc-400 text-sm">Long-Running Shows</div>
              </div>
              <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-3xl font-bold text-orange-400">60+</div>
                <div className="text-zinc-400 text-sm">Epic Arcs</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats/Highlights */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: Star, label: 'Top Rated', value: '9.2' },
            { icon: Flame, label: 'Trending Now', value: '24' },
            { icon: Zap, label: 'New Episodes', value: '15' },
            { icon: Sword, label: 'Action Anime', value: '50+' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-pink-400" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-zinc-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Anime Homepage Sections from Admin */}
        {animeHomepageSections.map(renderAnimeHomepageSection)}

        {/* Anime Shows Section */}
        {animeShows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <TVShowRow title="Anime Shows" tvShows={animeShows} animationDuration={18} />
          </motion.div>
        )}
      </div>
    </main>
  );
}
