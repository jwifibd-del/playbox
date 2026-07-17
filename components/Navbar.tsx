'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Home, Tv, Smile, Radio, Clapperboard, Sparkles, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  getParentalControlSettings,
  getUserProfile,
  isAnimeModeActive,
  isKidsModeActive,
  isUserAuthenticated,
  saveParentalControlSettings,
  verifyParentalPin,
  getGeneralSettings,
} from '@/lib/data';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [animeMode, setAnimeMode] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [postPinRoute, setPostPinRoute] = useState('/'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarSettings, setNavbarSettings] = useState(getGeneralSettings());
  const [hydrated, setHydrated] = useState(false);
  const [modDropdownOpen, setModDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isAnimeView = hydrated ? animeMode : false;
  const isKidsView = hydrated ? (!animeMode && kidsMode) : false;
  const homeHref = isAnimeView ? '/anime' : isKidsView ? '/kids' : '/';
  const movieHref = isAnimeView ? '/anime/movies' : isKidsView ? '/kids/movies' : '/movies';
  const tvHref = isAnimeView ? '/anime/shows' : isKidsView ? '/kids/tv' : '/tv';
  const navLinks = isAnimeView
    ? [
        { href: homeHref, label: 'Anime Home', icon: Home, match: (path: string) => path === '/anime' },
        { href: movieHref, label: 'Anime Movies', icon: Clapperboard, match: (path: string) => path === '/anime/movies' || path.startsWith('/movie/') },
        { href: tvHref, label: 'Anime Shows', icon: Tv, match: (path: string) => path === '/anime/shows' || path.startsWith('/tv/') },
      ]
    : isKidsView
    ? [
        { href: homeHref, label: 'Kids Home', icon: Home, match: (path: string) => path === '/kids' || path === '/' },
        { href: movieHref, label: 'Kids Movie', icon: Clapperboard, match: (path: string) => path === '/kids/movies' || path.startsWith('/movie/') },
        { href: tvHref, label: 'Kids Tv Shows', icon: Tv, match: (path: string) => path === '/kids/tv' || path.startsWith('/tv/') },
      ]
    : [
        { href: homeHref, label: 'Home', icon: Home, match: (path: string) => path === '/' || path === '/kids' },
        { href: movieHref, label: 'Movies', icon: Clapperboard, match: (path: string) => path.startsWith('/movies') || path.startsWith('/movie/') },
        { href: tvHref, label: 'TV Shows', icon: Tv, match: (path: string) => path.startsWith('/tv') || path === '/kids/tv' },
        { href: '/live-tv', label: 'Live TV', icon: Radio, match: (path: string) => path.startsWith('/live-tv') },
      ];

  useEffect(() => {
    const syncNavbarState = () => {
      setAnimeMode(isAnimeModeActive());
      setKidsMode(isKidsModeActive());
      setUserLoggedIn(isUserAuthenticated());
      setUserAvatar(getUserProfile().avatar);
      setNavbarSettings(getGeneralSettings());
    };

    syncNavbarState();
    window.addEventListener('storage', syncNavbarState);
    window.addEventListener('playflix-users-updated', syncNavbarState);
    window.addEventListener('playflix-parental-controls-updated', syncNavbarState);
    window.addEventListener('playflix-general-settings-updated', syncNavbarState);

    return () => {
      window.removeEventListener('storage', syncNavbarState);
      window.removeEventListener('playflix-users-updated', syncNavbarState);
      window.removeEventListener('playflix-parental-controls-updated', syncNavbarState);
      window.removeEventListener('playflix-general-settings-updated', syncNavbarState);
    };
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModDropdownOpen(false);
      }
    }

    if (modDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKidsModeToggle = () => {
    const currentSettings = getParentalControlSettings();

    if (currentSettings.kidsModeEnabled && currentSettings.pinEnabled && currentSettings.pin) {
      setPinInput('');
      setPinError('');
      setPostPinRoute('/');
      setShowPinPrompt(true);
      return;
    }

    const nextSettings = {
      ...currentSettings,
      kidsModeEnabled: !currentSettings.kidsModeEnabled,
      animeModeEnabled: false,
    };

    saveParentalControlSettings(nextSettings);
    setKidsMode(nextSettings.kidsModeEnabled);
    setAnimeMode(false);
    router.push(nextSettings.kidsModeEnabled ? '/kids' : '/');
  };

  const handleAnimeModeToggle = () => {
    const currentSettings = getParentalControlSettings();

    if (currentSettings.kidsModeEnabled && currentSettings.pinEnabled && currentSettings.pin) {
      setPinInput('');
      setPinError('');
      setPostPinRoute('/anime');
      setShowPinPrompt(true);
      return;
    }

    const nextAnimeMode = !currentSettings.animeModeEnabled;
    const nextSettings = {
      ...currentSettings,
      animeModeEnabled: nextAnimeMode,
      kidsModeEnabled: nextAnimeMode ? false : currentSettings.kidsModeEnabled,
    };

    saveParentalControlSettings(nextSettings);
    setAnimeMode(nextAnimeMode);
    setKidsMode(nextSettings.kidsModeEnabled);
    router.push(nextAnimeMode ? '/anime' : '/');
  };

  const handleDisableKidsModeWithPin = () => {
    if (!verifyParentalPin(pinInput)) {
      setPinError('Incorrect PIN. Please try again.');
      return;
    }

    const currentSettings = getParentalControlSettings();
    const nextSettings = {
      ...currentSettings,
      kidsModeEnabled: false,
    };

    saveParentalControlSettings(nextSettings);
    setKidsMode(false);
    setAnimeMode(postPinRoute === '/anime');
    setShowPinPrompt(false);
    setPinInput('');
    setPinError('');
    setPostPinRoute('/');
    if (postPinRoute === '/anime') {
      saveParentalControlSettings({
        ...nextSettings,
        animeModeEnabled: true,
      });
      router.push('/anime');
      return;
    }

    router.push('/');
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-12 py-3 sm:py-4',
          navbarSettings.navbarAnimationType === 'fade'
            ? 'transition-opacity duration-500'
            : navbarSettings.navbarAnimationType === 'slide'
            ? 'transition-transform duration-500'
            : navbarSettings.navbarAnimationType === 'scale'
            ? 'transition-transform duration-500'
            : navbarSettings.navbarAnimationType === 'bounce'
            ? 'animate-bounce'
            : '',
          scrolled ? 'bg-[#080808]/90 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-[#080808]/80 to-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center lg:w-1/4 lg:flex-none">
            <Link href={homeHref} className="flex min-w-0 items-center gap-2">
              {navbarSettings.navbarLogo ? (
                <img
                  src={navbarSettings.navbarLogo}
                  alt={navbarSettings.navbarName}
                  className="h-8 sm:h-10 w-auto"
                />
              ) : (
                <span className="truncate text-lg sm:text-2xl font-bold text-white tracking-wider">
                  {navbarSettings.navbarName.split(' ').map((word, index) => {
                    if (index === 0) return <span key={index}>{word}</span>;
                    return <span key={index} style={{ color: navbarSettings.navbarColor }}>{word}</span>;
                  })}
                </span>
              )}
            </Link>
          </div>
          <div className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6">
            {navLinks.map(({ href, label, icon: Icon, match }) => {
              const isActive = match(pathname);

                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      'transition-all duration-200 flex items-center gap-2',
                      isActive 
                        ? 'text-white scale-105' 
                        : 'text-gray-300 hover:text-white hover:scale-105'
                    )}
                    style={{ fontSize: navbarSettings.navbarFontSize }}
                  >
                    <Icon size={parseInt(navbarSettings.navbarFontSize)} />
                    {label}
                  </Link>
                );
              })}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 lg:w-1/4 lg:flex-none">
            <button
              className="lg:hidden text-white hover:text-gray-300 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* Modes Dropdown or Mode Buttons */}
            {animeMode || kidsMode ? (
              // Show individual buttons when mode is active
              <>
                {animeMode && (
                  <button
                    onClick={handleAnimeModeToggle}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-white hover:text-gray-200"
                  >
                    <Sparkles size={18} />
                    Anime On
                  </button>
                )}
                {kidsMode && (
                  <button
                    onClick={handleKidsModeToggle}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-white hover:text-gray-200"
                  >
                    <Smile size={18} />
                    Kids On
                  </button>
                )}
              </>
            ) : (
              // Show Mod dropdown when no mode is active
              <div ref={dropdownRef} className="relative hidden lg:block">
                <button
                  onClick={() => setModDropdownOpen(!modDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all text-zinc-200 hover:text-white"
                >
                  Modes
                <ChevronDown size={18} />
                </button>
                {/* Dropdown Menu */}
                {modDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900/95 border border-zinc-700 rounded-xl shadow-lg backdrop-blur-xl z-50">
                    {/* Anime Option */}
                    <button
                      onClick={() => {
                        handleAnimeModeToggle();
                        setModDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-t-xl hover:bg-zinc-800 transition-colors"
                    >
                      <Sparkles size={18} />
                      <span className="text-zinc-300">Anime</span>
                    </button>
                    {/* Kids Option */}
                    <button
                      onClick={() => {
                        handleKidsModeToggle();
                        setModDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-b-xl hover:bg-zinc-800 transition-colors"
                    >
                      <Smile size={18} />
                      <span className="text-zinc-300">Kids</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            <Link href="/search" className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300">
              <Search size={20} className="sm:w-6 sm:h-6" />
              <span className="hidden sm:inline text-sm font-medium">Search</span>
            </Link>
            <button className="hidden sm:block text-gray-300 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <Link href={userLoggedIn ? '/account' : '/login'} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border border-white/10 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                {userLoggedIn && userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-sm sm:w-3/4 flex-col overflow-y-auto bg-[#080808]/95 backdrop-blur-xl py-6 px-5 sm:px-6 border-l border-zinc-800">
            <div className="flex items-center justify-between mb-8">
              <Link href={homeHref} className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                {navbarSettings.navbarLogo ? (
                  <img
                    src={navbarSettings.navbarLogo}
                    alt={navbarSettings.navbarName}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold text-white tracking-wider">
                    {navbarSettings.navbarName.split(' ').map((word, index) => {
                      if (index === 0) return <span key={index}>{word}</span>;
                      return <span key={index} style={{ color: navbarSettings.navbarColor }}>{word}</span>;
                    })}
                  </span>
                )}
              </Link>
              <button
                className="text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-6 mb-8">
              {navLinks.map(({ href, label, icon: Icon, match }) => {
                const isActive = match(pathname);

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'transition-all duration-200 flex items-center gap-3 text-lg',
                      isActive 
                        ? 'text-white scale-105' 
                        : 'text-gray-300 hover:text-white hover:scale-105'
                    )}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col gap-4">
              {!kidsMode && (
                <button
                  onClick={() => {
                    handleAnimeModeToggle();
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all',
                    animeMode
                      ? 'text-white hover:text-gray-200'
                      : 'text-zinc-200 hover:text-white'
                  )}
                >
                  <Sparkles size={18} />
                  {animeMode ? 'Anime On' : 'Anime'}
                </button>
              )}
              <button
                onClick={() => {
                  handleKidsModeToggle();
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all',
                  kidsMode
                    ? 'text-white hover:text-gray-200'
                    : 'text-zinc-200 hover:text-white'
                )}
              >
                <Smile size={18} />
                {kidsMode ? 'Kids On' : 'Kids'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">PIN Lock</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Turn Off Kids Mode</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Enter your parental PIN to exit Kids Mode and return to the main app.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Parental PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) {
                    setPinError('');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDisableKidsModeWithPin();
                  }
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-xl tracking-[0.35em] text-white focus:border-red-500 focus:outline-none"
              />
              {pinError && (
                <p className="mt-3 text-sm text-rose-300">{pinError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowPinPrompt(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableKidsModeWithPin}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
