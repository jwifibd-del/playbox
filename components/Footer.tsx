'use client';

import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Smartphone, AppWindow, Tv, Monitor } from 'lucide-react';
import { getAppLinks, AppLink } from '@/lib/data';

export function Footer() {
  const [links, setLinks] = useState<AppLink[]>([]);

  useEffect(() => {
    setLinks(getAppLinks());
    
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

  return (
    <footer className="bg-gradient-to-b from-[#080808] to-[#0a0a0a] border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white mb-4">
              <span className="text-red-500">Play</span>Flix
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Stream thousands of movies and TV shows anytime, anywhere. The ultimate entertainment experience.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Browse Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Browse</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Movies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">TV Shows</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Originals</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Live TV</a></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Help</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Help Center</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-200">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Download Apps Section */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-2xl mb-2">Download Our Apps</h3>
              <p className="text-gray-400">Watch on your favorite devices</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {links.map((app) => (
                <a 
                  key={app.platform} 
                  href={app.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-black/40 hover:bg-red-600/80 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 hover:border-red-500 hover:shadow-lg hover:shadow-red-600/20"
                >
                  {app.icon === 'phone' && <Smartphone size={28} className="text-white" />}
                  {app.icon === 'play' && <Smartphone size={28} className="text-white" />}
                  {app.icon === 'apple' && <AppWindow size={28} className="text-white" />}
                  {app.icon === 'tv' && <Tv size={28} className="text-white" />}
                  {app.icon === 'monitor' && <Monitor size={28} className="text-white" />}
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Get it on</div>
                    <div className="text-white font-semibold">{app.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
