'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated, LiveChannel } from '@/lib/data';

interface LiveTVCardProps {
  channel: LiveChannel;
}

export function LiveTVCard({ channel }: LiveTVCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleOpenChannel = () => {
    router.push(isUserAuthenticated() ? `/live-tv/${channel.id}` : '/login');
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenChannel}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800">
        {/* Channel Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-24 h-24 object-contain opacity-50"
          />
        </div>
        
        {/* Live Badge */}
        {channel.isPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-4"
          >
            {/* Channel Name */}
            <h3 className="text-white font-bold text-lg">{channel.name}</h3>
            
            {/* Program Info */}
            <div>
              <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                <Clock size={14} />
                NOW PLAYING
              </div>
              <p className="text-white font-semibold mb-2">{channel.currentShow}</p>
              <p className="text-gray-400 text-sm">Next: {channel.nextShow}</p>
              
              <button
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenChannel();
                }}
              >
                <Play fill="white" size={16} /> Watch Live
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
