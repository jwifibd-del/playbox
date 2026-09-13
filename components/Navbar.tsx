'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Home, Tv, Smile, Clapperboard, Sparkles, Menu, X, Radio, Smartphone, Heart, Clock, Download } from 'lucide-react';
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
  getUserNotifications,
} from '@/lib/data';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [animeMode, setAnimeMode] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [postPinRoute, setPostPinRoute] = useState('/'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navbarSettings, setNavbarSettings] = useState(getGeneralSettings());
  const [hydrated, setHydrated] = useState(false);
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
        { href: '/tv-app', label: 'TV App', icon: Tv, match: (path: string) => path.startsWith('/tv-app') },
        { href: '/mobile-app', label: 'Mobile App', icon: Smartphone, match: (path: string) => path.startsWith('/mobile-app') },
      ]
    : isKidsView
    ? [
        { href: homeHref, label: 'Kids Home', icon: Home, match: (path: string) => path === '/kids' || path === '/' },
        { href: movieHref, label: 'Kids Movie', icon: Clapperboard, match: (path: string) => path === '/kids/movies' || path.startsWith('/movie/') },
        { href: tvHref, label: 'Kids Tv Shows', icon: Tv, match: (path: string) => path === '/kids/tv' || path.startsWith('/tv/') },
        { href: '/tv-app', label: 'TV App', icon: Tv, match: (path: string) => path.startsWith('/tv-app') },
        { href: '/mobile-app', label: 'Mobile App', icon: Smartphone, match: (path: string) => path.startsWith('/mobile-app') },
      ]
    : [
        { href: homeHref, label: 'Home', icon: Home, match: (path: string) => path === '/' || path === '/kids' },
        { href: movieHref, label: 'Movies', icon: Clapperboard, match: (path: string) => path.startsWith('/movies') || path.startsWith('/movie/') },
        { href: tvHref, label: 'TV Shows', icon: Tv, match: (path: string) => path.startsWith('/tv') || path === '/kids/tv' },
        { href: '/tv-channels', label: 'TV Channels', icon: Radio, match: (path: string) => path.startsWith('/tv-channels') },
        { href: '/tv-app', label: 'TV App', icon: Tv, match: (path: string) => path.startsWith('/tv-app') },
        { href: '/mobile-app', label: 'Mobile App', icon: Smartphone, match: (path: string) => path.startsWith('/mobile-app') },
      ];

  useEffect(() => {
    const syncNavbarState = () => {
      setAnimeMode(isAnimeModeActive());
      setKidsMode(isKidsModeActive());
      setUserLoggedIn(isUserAuthenticated());
      setUserAvatar(getUserProfile().avatar);
      setNavbarSettings(getGeneralSettings());
      const notifs = getUserNotifications();
      setUnreadCount(notifs.filter(n => n.unread).length);
    };

    syncNavbarState();
    window.addEventListener('storage', syncNavbarState);
    window.addEventListener('playflix-users-updated', syncNavbarState);
    window.addEventListener('playflix-parental-controls-updated', syncNavbarState);
    window.addEventListener('playflix-general-settings-updated', syncNavbarState);
    window.addEventListener('playflix-notifications-updated', syncNavbarState);

    return () => {
      window.removeEventListener('storage', syncNavbarState);
      window.removeEventListener('playflix-users-updated', syncNavbarState);
      window.removeEventListener('playflix-parental-controls-updated', syncNavbarState);
      window.removeEventListener('playflix-general-settings-updated', syncNavbarState);
      window.removeEventListener('playflix-notifications-updated', syncNavbarState);
    };
  }, [pathname]);

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

  if (!hydrated) {
    return null;
  }

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
          {/* Left: Logo + Nav links (Home · Movies · TV Shows · TV Channels · Anime · Kids) */}
          <div className="flex min-w-0 flex-1 items-center justify-start gap-6 lg:gap-8">
            <Link href={homeHref} className="flex min-w-0 items-center gap-2 shrink-0">
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

            <div className="hidden lg:flex items-center justify-start gap-4 xl:gap-6">
              {navLinks.map(({ href, label, icon: Icon, match }) => {
                const isActive = match(pathname);
                const iconSize = parseInt(navbarSettings.navbarFontSize) || 18;

                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      'transition-all duration-200 flex items-center gap-2 font-bold',
                      isActive
                        ? 'text-white scale-105'
                        : 'text-gray-300 hover:text-white hover:scale-105'
                    )}
                    style={{ fontSize: navbarSettings.navbarFontSize }}
                  >
                    <Icon size={iconSize} />
                    {label}
                  </Link>
                );
              })}

              {/* Anime toggle (same sizing as nav links) — hidden when Kids mode is on */}
              {!kidsMode && (
                <button
                  onClick={handleAnimeModeToggle}
                  className={cn(
                    'transition-all duration-200 flex items-center gap-2 font-bold px-1.5',
                    animeMode
                      ? 'text-white scale-105 drop-shadow-[0_0_12px_rgba(217,70,239,0.35)]'
                      : 'text-gray-300 hover:text-white hover:scale-105'
                  )}
                  style={{ fontSize: navbarSettings.navbarFontSize }}
                >
                  <Sparkles
                    size={parseInt(navbarSettings.navbarFontSize) || 18}
                    className={animeMode ? 'text-fuchsia-300' : ''}
                  />
                  {animeMode ? 'Anime On' : 'Anime'}
                </button>
              )}

              {/* Kids toggle (same sizing as nav links) — hidden when Anime mode is on */}
              {!animeMode && (
                <button
                  onClick={handleKidsModeToggle}
                  className={cn(
                    'transition-all duration-200 flex items-center gap-2 font-bold px-1.5',
                    kidsMode
                      ? 'text-white scale-105 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : 'text-gray-300 hover:text-white hover:scale-105'
                  )}
                  style={{ fontSize: navbarSettings.navbarFontSize }}
                >
                  <Smile
                    size={parseInt(navbarSettings.navbarFontSize) || 18}
                    className={kidsMode ? 'text-emerald-300' : ''}
                  />
                  {kidsMode ? 'Kids On' : 'Kids'}
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-none items-center justify-end gap-2 sm:gap-4">
            <button
              className="lg:hidden text-white hover:text-gray-300 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/search" className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300">
              <Search size={20} className="sm:w-6 sm:h-6" />
              <span className="hidden sm:inline text-sm font-medium">Search</span>
            </Link>
            <Link 
              href={userLoggedIn ? "/account?tab=notifications" : "/login"} 
              title="Notifications"
              className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
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
                      'transition-all duration-200 flex items-center gap-3 text-lg font-bold',
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
              {/* Kids mode toggle (mobile) — hidden when Anime mode is on */}
              {!animeMode && (
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
              )}

              {/* Account Quick Links in Mobile Drawer */}
              <div className="pt-4 mt-2 border-t border-zinc-800/80 flex flex-col gap-2">
                <Link
                  href="/account?tab=history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                >
                  <Clock size={16} />
                  Watch History
                </Link>
                <Link
                  href="/account?tab=favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                >
                  <Heart size={16} />
                  My Favorites
                </Link>
                <Link
                  href="/account?tab=downloads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                >
                  <Download size={16} />
                  Downloads
                </Link>
                <Link
                  href="/account?tab=profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                >
                  <User size={16} />
                  Account & Settings
                </Link>
              </div>
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
