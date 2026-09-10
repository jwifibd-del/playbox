'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Download,
  Cast,
  PictureInPicture2,
  Wifi,
  WifiOff,
  BatteryCharging,
  QrCode,
  Share2,
  CheckCircle2,
  Play,
  Pause,
  Trash2,
  Search,
  Sparkles,
  ArrowRight,
  Tv,
  Film,
  Radio,
  User,
  ShieldCheck,
  HardDrive,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { sampleMovies, type Movie } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function MobileAppPage() {
  const [deviceModel, setDeviceModel] = useState<'ios' | 'android'>('ios');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'downloads' | 'live'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);
  const [isSimPlaying, setIsSimPlaying] = useState(false);
  const [activeSimMovie, setActiveSimMovie] = useState<Movie>(sampleMovies[0]);
  const [currentTime, setCurrentTime] = useState('09:41');
  const [installedPWA, setInstalledPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  // Simulated downloads inside phone
  const [simDownloads, setSimDownloads] = useState([
    {
      id: 'sim-1',
      title: 'Interstellar Odyssey',
      size: '1.8 GB',
      quality: '1080p HDR',
      progress: 100,
      status: 'completed',
      poster: sampleMovies[0]?.posterPath,
    },
    {
      id: 'sim-2',
      title: 'Neon Cyberpunk 2099',
      size: '1.2 GB',
      quality: '1080p',
      progress: 68,
      status: 'downloading',
      poster: sampleMovies[1]?.posterPath || sampleMovies[0]?.posterPath,
    },
  ]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledPWA(true);
        setInstallStatus('PlayFlix Mobile App installed successfully!');
      }
      setDeferredPrompt(null);
    } else {
      setInstallStatus(
        'For iOS Safari: tap the Share button below and select "Add to Home Screen". For Android Chrome: tap the menu (⋮) and choose "Install App".'
      );
    }
  };

  const handleDownloadAPK = (variant: 'mobile' | 'tv') => {
    // Generate a downloadable package info blob or link
    const blob = new Blob(
      [
        `PlayFlix ${variant === 'mobile' ? 'Mobile Android' : 'Android TV'} Build Artifact\n` +
          `Version: 2.4.0-release\nPackage: com.playflix.app\n` +
          `Date: ${new Date().toISOString()}\nBuild: Release APK Universal ABI`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = variant === 'mobile' ? 'PlayFlix-v2.4.0-mobile.apk' : 'PlayFlix-v2.4.0-tv.apk';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMovies = searchQuery
    ? sampleMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sampleMovies;

  return (
    <main className="min-h-screen bg-[#06070a] text-white selection:bg-amber-400 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 md:px-12 lg:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_40%),radial-gradient(circle_at_right,_rgba(59,130,246,0.12),_transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Information & Download Actions */}
            <div className="lg:col-span-6 xl:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
                <Smartphone className="h-4 w-4" />
                PlayFlix Mobile Edition
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Cinema in your pocket. <br />
                <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 bg-clip-text text-transparent">
                  Anywhere. Offline.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Stream 4K HDR entertainment on Android and iOS devices. Download entire series with one tap, cast to smart TVs, and enjoy picture-in-picture background viewing.
              </p>

              {/* Install & Download CTA Cards */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  id="install-pwa-button"
                  onClick={handleInstallPWA}
                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-4 text-base font-extrabold text-black shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
                >
                  <Download className="h-5 w-5" />
                  Install Mobile App (PWA)
                </button>

                <button
                  onClick={() => handleDownloadAPK('mobile')}
                  className="flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-6 py-4 text-sm font-bold text-white backdrop-blur-xl transition-all hover:border-zinc-500 hover:bg-zinc-800"
                >
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  Download APK (v2.4.0)
                </button>

                <Link
                  href="/tv-app"
                  className="flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-6 py-4 text-sm font-bold text-zinc-300 backdrop-blur-xl transition-all hover:border-amber-400/50 hover:text-white"
                >
                  <Tv className="h-4 w-4 text-amber-400" />
                  Switch to TV App
                </Link>
              </div>

              {installStatus && (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                  {installStatus}
                </div>
              )}

              {/* Feature Pills */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <Download className="h-5 w-5 text-amber-400" />
                  <p className="mt-2 text-sm font-bold text-white">Offline Sync</p>
                  <p className="text-xs text-zinc-400">Download for flights</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <PictureInPicture2 className="h-5 w-5 text-sky-400" />
                  <p className="mt-2 text-sm font-bold text-white">PiP Floating</p>
                  <p className="text-xs text-zinc-400">Multitask smoothly</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <Cast className="h-5 w-5 text-purple-400" />
                  <p className="mt-2 text-sm font-bold text-white">Chromecast & AirPlay</p>
                  <p className="text-xs text-zinc-400">Cast to living room</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <p className="mt-2 text-sm font-bold text-white">Biometric PIN</p>
                  <p className="text-xs text-zinc-400">Profile security</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Smartphone Simulator */}
            <div className="flex flex-col items-center lg:col-span-6 xl:col-span-5">
              {/* Simulator Device Switcher */}
              <div className="mb-4 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 p-1">
                <button
                  onClick={() => setDeviceModel('ios')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                    deviceModel === 'ios' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  iPhone 16 Pro
                </button>
                <button
                  onClick={() => setDeviceModel('android')}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                    deviceModel === 'android' ? 'bg-amber-400 text-black shadow-md' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  Pixel 9 Pro
                </button>
              </div>

              {/* The Smartphone Frame */}
              <div className="relative h-[680px] w-[340px] select-none rounded-[50px] border-[10px] border-zinc-800 bg-black shadow-[0_25px_70px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-2 left-1/2 z-30 -translate-x-1/2">
                  {deviceModel === 'ios' ? (
                    <div className="flex h-6 w-28 items-center justify-between rounded-full bg-black px-2 shadow-sm ring-1 ring-zinc-800/80">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-900 border border-zinc-700" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-black ring-1 ring-zinc-700" />
                  )}
                </div>

                {/* Status Bar */}
                <div className="relative z-20 flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-zinc-300">
                  <span>{currentTime}</span>
                  <div className="flex items-center gap-1.5">
                    {offlineMode ? <WifiOff className="h-3 w-3 text-rose-400" /> : <Wifi className="h-3 w-3 text-emerald-400" />}
                    <span className="text-[10px] font-mono">5G</span>
                    <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                </div>

                {/* Simulated App Viewport */}
                <div className="relative flex h-[620px] flex-col overflow-hidden rounded-b-[40px] bg-[#090a0f] text-white">
                  {/* App Top Bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black tracking-wider text-white">
                        <span className="text-amber-400">Play</span>Flix
                      </span>
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                        APP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOfflineMode((prev) => !prev)}
                        className={cn(
                          'rounded-full p-1.5 transition-all text-xs',
                          offlineMode ? 'bg-rose-500/20 text-rose-300' : 'bg-zinc-800 text-zinc-400'
                        )}
                        title="Toggle Offline Mode"
                      >
                        {offlineMode ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
                      </button>
                      <button className="rounded-full bg-zinc-800 p-1.5 text-zinc-300">
                        <Cast className="h-3.5 w-3.5" />
                      </button>
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-[10px] font-bold">
                        P
                      </div>
                    </div>
                  </div>

                  {/* Body Content based on activeTab */}
                  <div className="flex-1 overflow-y-auto px-3.5 py-3 scrollbar-none">
                    {activeTab === 'home' && (
                      <div className="space-y-4">
                        {/* Highlights Avatar Row */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                          {sampleMovies.slice(0, 5).map((m, idx) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setActiveSimMovie(m);
                                setIsSimPlaying(true);
                              }}
                              className="flex flex-col items-center gap-1 shrink-0"
                            >
                              <div
                                className={cn(
                                  'h-12 w-12 rounded-full p-0.5 transition-all',
                                  activeSimMovie.id === m.id
                                    ? 'bg-gradient-to-tr from-amber-400 to-rose-500 ring-2 ring-amber-400'
                                    : 'bg-zinc-800'
                                )}
                              >
                                <img
                                  src={m.posterPath}
                                  alt={m.title}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              </div>
                              <span className="w-12 truncate text-[9px] text-zinc-400">{m.title}</span>
                            </button>
                          ))}
                        </div>

                        {/* Featured Hero Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-md">
                          <img
                            src={activeSimMovie.backdropPath || activeSimMovie.posterPath}
                            alt={activeSimMovie.title}
                            className="aspect-video w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-extrabold text-black">
                              {activeSimMovie.quality}
                            </span>
                            <h3 className="mt-1 text-sm font-bold leading-tight text-white">{activeSimMovie.title}</h3>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => setIsSimPlaying(!isSimPlaying)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-1.5 text-xs font-bold text-black active:scale-95"
                              >
                                {isSimPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                {isSimPlaying ? 'Pause' : 'Play Now'}
                              </button>
                              <Link
                                href={`/movie/${activeSimMovie.id}`}
                                className="rounded-xl border border-zinc-700 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Info
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Trending Mobile Row */}
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Trending on Mobile</span>
                            <span className="text-[10px] text-amber-400">See all</span>
                          </div>
                          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                            {sampleMovies.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setActiveSimMovie(m);
                                  setIsSimPlaying(true);
                                }}
                                className="w-20 shrink-0 text-left group"
                              >
                                <img
                                  src={m.posterPath}
                                  alt={m.title}
                                  className="aspect-[2/3] w-full rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                                />
                                <p className="mt-1 truncate text-[10px] font-semibold text-zinc-200">{m.title}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'search' && (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search mobile catalog..."
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {filteredMovies.slice(0, 6).map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setActiveSimMovie(m);
                                setActiveTab('home');
                                setIsSimPlaying(true);
                              }}
                              className="flex flex-col text-left group"
                            >
                              <img
                                src={m.posterPath}
                                alt={m.title}
                                className="aspect-[2/3] w-full rounded-xl object-cover"
                              />
                              <span className="mt-1 truncate text-[10px] font-semibold text-zinc-300">
                                {m.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'downloads' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div>
                            <p className="text-xs font-bold text-white">Device Storage</p>
                            <p className="text-[10px] text-zinc-400">3.0 GB used of 128 GB</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            DRM Offline
                          </span>
                        </div>

                        <div className="space-y-2">
                          {simDownloads.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2"
                            >
                              <img
                                src={item.poster}
                                alt={item.title}
                                className="h-12 w-9 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-bold text-white">{item.title}</p>
                                <p className="text-[10px] text-zinc-400">
                                  {item.quality} • {item.size}
                                </p>
                                {item.status === 'downloading' && (
                                  <div className="mt-1 h-1 w-full rounded-full bg-zinc-800">
                                    <div
                                      className="h-full rounded-full bg-amber-400"
                                      style={{ width: `${item.progress}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSimDownloads((prev) => prev.filter((d) => d.id !== item.id));
                                }}
                                className="rounded p-1 text-zinc-500 hover:text-rose-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'live' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-xs font-bold text-white">Live Streaming Channels</span>
                        </div>
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2.5">
                          <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center">
                            <span className="text-xs font-mono text-zinc-500">Live HLS/DASH Feed</span>
                            <span className="absolute top-2 left-2 rounded bg-rose-600 px-1.5 py-0.5 text-[8px] font-bold text-white">
                              LIVE
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-white">PlayFlix Premier Cinema</p>
                          <p className="text-[10px] text-zinc-400">1080p 60fps • English Dolby</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Simulator Bottom Navigation Bar */}
                  <div className="flex items-center justify-around border-t border-zinc-900 bg-black/95 py-2 px-1">
                    <button
                      onClick={() => setActiveTab('home')}
                      className={cn(
                        'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all',
                        activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      <Film className="h-4 w-4" />
                      <span>Home</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('search')}
                      className={cn(
                        'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all',
                        activeTab === 'search' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('downloads')}
                      className={cn(
                        'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all',
                        activeTab === 'downloads' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      <Download className="h-4 w-4" />
                      <span>Downloads</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('live')}
                      className={cn(
                        'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-all',
                        activeTab === 'live' ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                      )}
                    >
                      <Radio className="h-4 w-4" />
                      <span>Live</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Mobile App vs TV App vs Web */}
      <section className="border-t border-zinc-900 bg-zinc-950/70 py-16 px-4 sm:px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Unified Multi-Screen Architecture</h2>
            <p className="mt-3 text-zinc-400">PlayFlix runs everywhere your users are</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Mobile Card */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">Mobile Edition</h3>
              <p className="mt-2 text-sm text-zinc-400">Android APK & iOS PWA</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" /> Offline downloads with local storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" /> Picture-in-Picture background player
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" /> Chromecast & AirPlay streaming
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400" /> Touch gestures and swipeable rails
                </li>
              </ul>
              <button
                onClick={() => handleDownloadAPK('mobile')}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-black transition-all hover:bg-amber-400"
              >
                Download Mobile APK
              </button>
            </div>

            {/* TV App Card */}
            <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
                <Tv className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">TV Living Room App</h3>
              <p className="mt-2 text-sm text-zinc-400">Android TV, Google TV, Fire TV, Apple TV</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> 10-foot remote D-pad navigation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> Dynamic ambient living room backdrops
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> Built-in virtual remote controller
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" /> Voice search & speech recognition
                </li>
              </ul>
              <Link
                href="/tv-app"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3 text-sm font-bold text-black transition-all hover:bg-sky-400"
              >
                Launch TV Experience
              </Link>
            </div>

            {/* Web PWA Card */}
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-zinc-900 to-black p-8 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-white">Next.js Web PWA</h3>
              <p className="mt-2 text-sm text-zinc-400">Desktop, Tablet & Smart Displays</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Adaptive HLS/MPEG-DASH streaming
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Parental control PIN lock
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Multi-audio and subtitle track switching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" /> Kids Mode & Anime Hub switching
                </li>
              </ul>
              <Link
                href="/"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-500 py-3 text-sm font-bold text-white transition-all hover:bg-purple-400"
              >
                Explore Web Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
