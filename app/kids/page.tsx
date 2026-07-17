'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clapperboard, Home, Smile, Tv } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getFilteredKidsContent,
  getFilteredKidsTVShows,
  getHeroBannerContentId,
  getKidsHeroBanners,
  getParentalControlSettings,
  getKidsSliderSections,
  getSliderSectionContentIds,
  HeroBanner as HeroBannerType,
  saveParentalControlSettings,
  SliderSection,
  TVShow,
} from '@/lib/data';
import { HeroBanner } from '@/components/HeroBanner';
import { HorizontalSlider } from '@/components/HorizontalSlider';
import { KidsRow } from '@/components/KidsRow';
import { Navbar } from '@/components/Navbar';
import { TVShowCard } from '@/components/TVShowCard';

export default function KidsModePage() {
  const router = useRouter();
  const [kidsContent, setKidsContent] = useState(() => getFilteredKidsContent());
  const [kidsTVShows, setKidsTVShows] = useState<TVShow[]>([]);
  const [settings, setSettings] = useState(() => getParentalControlSettings());
  const [heroBanners, setHeroBanners] = useState<HeroBannerType[]>([]);
  const [sliderSections, setSliderSections] = useState<SliderSection[]>([]);

  useEffect(() => {
    setKidsContent(getFilteredKidsContent());
    setKidsTVShows(getFilteredKidsTVShows());
    setSettings(getParentalControlSettings());
    setHeroBanners(getKidsHeroBanners().filter((banner) => banner.isActive).sort((a, b) => a.order - b.order));
    setSliderSections(getKidsSliderSections().filter((section) => section.isActive).sort((a, b) => a.order - b.order));
  }, []);

  const heroMoviesForCarousel = useMemo(() => heroBanners.map((banner, index) => {
    const bannerContentId = getHeroBannerContentId(banner);

    if (banner.contentType === 'tv') {
      const matchedShow = kidsTVShows.find((show) => String(show.id) === String(bannerContentId));
      if (matchedShow) {
        return {
          id: matchedShow.id,
          title: matchedShow.title,
          tagline: matchedShow.tagline || 'Kids Spotlight',
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
      tagline: 'Kids Spotlight',
      overview: banner.description,
      posterPath: banner.posterUrl,
      backdropPath: banner.backdropUrl,
      releaseYear: 2024,
      rating: 8.5,
      runtime: '1h 30m',
      genres: [kidsContent[index % Math.max(kidsContent.length, 1)]?.genre || 'Animation'],
      contentType: banner.contentType ?? 'movie',
    };
  }), [heroBanners, kidsContent, kidsTVShows]);

  const fallbackHeroMovies = kidsContent.slice(0, 3).map((item) => ({
    id: `kids-${item.id}`,
    title: item.title,
    tagline: 'Kids Spotlight',
    overview: `${item.title} is a playful ${item.genre.toLowerCase()} adventure made for young viewers.`,
    posterPath: item.posterPath,
    backdropPath: item.posterPath,
    releaseYear: 2024,
    rating: 8.4,
    runtime: '1h 20m',
    genres: [item.genre],
    country: 'United States',
    language: 'English',
    quality: 'HD',
    studio: 'PlayFlix Kids',
    director: 'PlayFlix',
  }));

  const kidsHeroMovies = heroMoviesForCarousel.length > 0 ? heroMoviesForCarousel : fallbackHeroMovies;
  const kidsHeroAutoScrollInterval = heroBanners[0]?.autoScrollInterval ?? 10000;



  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 text-white">
      <Navbar />
      {kidsHeroMovies.length > 0 && (
        <HeroBanner movies={kidsHeroMovies} autoScrollInterval={kidsHeroAutoScrollInterval} />
      )}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center">
              <Smile className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black">PlayFlix Kids</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => router.push('/kids')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all font-semibold"
            >
              <Home className="w-5 h-5" />
              Kids Home
            </button>
            <button
              onClick={() => router.push('/kids/movies')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all font-semibold"
            >
              <Clapperboard className="w-5 h-5" />
              Kids Movie
            </button>
            <button
              onClick={() => router.push('/kids/tv')}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white/30 transition-all font-semibold"
            >
              <Tv className="w-5 h-5" />
              Kids Tv Shows
            </button>

          </div>
        </div>

        {kidsTVShows.length > 0 && (
          <div className="px-0 md:px-0 py-2 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">Kids Home Slider</h2>
            <HorizontalSlider duration={15}>
              {kidsTVShows.map((show) => (
                <div key={show.id} className="flex-shrink-0 w-[200px] mr-4">
                  <TVShowCard tvShow={show} />
                </div>
              ))}
            </HorizontalSlider>
          </div>
        )}

        {sliderSections.length > 0 ? (
          sliderSections.map((section) => {
            if (section.contentType === 'tv') {
              const sectionContentIds = getSliderSectionContentIds(section);
              const sectionShows = sectionContentIds.length > 0
                ? sectionContentIds
                    .map((id) => kidsTVShows.find((show) => String(show.id) === String(id)))
                    .filter((show): show is TVShow => Boolean(show))
                : kidsTVShows;

              if (sectionShows.length === 0) {
                return null;
              }

              return (
                <div key={section.id} className="px-0 md:px-0 py-2 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-6">{section.title}</h2>
                  {section.description && (
                    <p className="text-white/70 mb-6">{section.description}</p>
                  )}
                  <HorizontalSlider duration={section.animationDuration}>
                    {sectionShows.map((show) => (
                      <div key={show.id} className="flex-shrink-0 w-[200px] mr-4">
                        <TVShowCard tvShow={show} />
                      </div>
                    ))}
                  </HorizontalSlider>
                </div>
              );
            }

            return (
              <KidsRow
                key={section.id}
                title={section.title}
                items={kidsContent}
                animationDuration={section.animationDuration}
              />
            );
          })
        ) : kidsTVShows.length > 0 ? null : (
          <KidsRow title="Kids Favorites" items={kidsContent} animationDuration={15} />
        )}
      </div>
    </main>
  );
}
