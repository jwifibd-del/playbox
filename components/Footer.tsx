'use client';

import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Smartphone, AppWindow, Tv, Monitor } from 'lucide-react';
import { getAppLinks, AppLink } from '@/lib/data';

export function Footer() {
  const [links, setLinks] = useState<AppLink[]>(getAppLinks());

  useEffect(() => {
    // Force reset to default app links
    if (typeof window !== 'undefined') {
      localStorage.removeItem('playflix_app_links');
    }
    const currentLinks = getAppLinks();
    console.log("Footer app links:", currentLinks); // Debug all links!
    currentLinks.forEach((app, idx) => console.log(`App ${idx}:`, app));
    setLinks(currentLinks);
    
    const handleStorageChange = () => {
      setLinks(getAppLinks());
    };
    
    window.addEventListener('playflix-app-links-updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('playflix-app-links-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'TV Shows', href: '/tv' },
    { name: 'Live TV', href: '/live-tv' },
    { name: 'Kids', href: '/kids' },
    { name: 'Anime', href: '/anime' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ];

  return (
    <footer className="bg-gradient-to-b from-[#050505] to-[#0a0a0a] border-t border-white/5 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="text-red-500">Play</span>Flix
            </h2>
            <p className="text-gray-400 mb-8 text-base sm:text-lg leading-relaxed max-w-md">
              Stream thousands of movies and TV shows anytime, anywhere. The ultimate entertainment experience.
            </p>
            <div className="flex gap-4 mb-8">
              <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-600/30">
                <Facebook size={24} />
              </a>
              <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-600/30">
                <Twitter size={24} />
              </a>
              <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-600/30">
                <Instagram size={24} />
              </a>
              <a href="#" className="w-12 h-12 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-red-600/30">
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-200 flex items-center gap-2 text-base"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-600 hover:bg-red-500 rounded-full" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-4">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-red-400 hover:pl-2 transition-all duration-200 flex items-center gap-2 text-base"
                  >
                    <div className="w-1.5 h-1.5 bg-gray-600 hover:bg-red-500 rounded-full" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Download Apps Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="mb-4 lg:mb-0">
              <h3 className="font-bold text-2xl sm:text-3xl mb-3">
                <span className="text-red-500">Download</span> Our Apps
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">Watch on your favorite devices</p>
            </div>
            <div className="flex w-full lg:w-auto flex-wrap gap-4">
              {links.map((app) => (
                <a 
                  key={app.platform} 
                  href={app.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 bg-black/30 hover:bg-red-600/80 backdrop-blur-xl rounded-2xl border border-white/10 transition-all duration-300 hover:border-red-500 hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-1"
                >
                  {(() => {
                    switch (app.platform) {
                      case 'android':
                      case 'play':
                        return <Smartphone size={32} className="text-white" />;
                      case 'ios':
                        return <AppWindow size={32} className="text-white" />;
                      case 'androidtv':
                      case 'appletv':
                        return <Tv size={32} className="text-white" />;
                      default:
                        return <Smartphone size={32} className="text-white" />;
                    }
                  })()}
                  <div className="text-left">
                    <div className="text-xs text-gray-400 font-medium">Get it on</div>
                    <div className="text-white font-bold text-lg">{app.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm sm:text-base">
              © {new Date().getFullYear()} PlayFlix. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <span>Made with ❤️ for movie lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
