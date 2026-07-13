'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { getLiveTVChannels, LiveTVChannel } from '@/lib/data';
import { Radio } from 'lucide-react';

export default function LiveTVPage() {
  const channels: LiveTVChannel[] = getLiveTVChannels();

  return (
    <div className="min-h-screen bg-[#080808]">
      <Navbar />
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Live TV</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Link key={channel.id} href={`/live-tv/${channel.id}`} className="group">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all">
                {channel.posterPath ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={channel.posterPath} 
                      alt={channel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-video w-full flex items-center justify-center"
                    style={{ backgroundColor: channel.accentColor }}
                  >
                    <Radio size={64} className="text-white" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-white font-bold text-xl mb-2">{channel.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-zinc-500 text-sm">{channel.genre}</span>
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">{channel.streamType}</span>
                  </div>
                  <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
                    Watch Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
