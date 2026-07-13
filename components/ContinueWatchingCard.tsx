'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, MoreHorizontal } from 'lucide-react';
import { ContinueWatchingItem } from '@/lib/data';

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img
          src={item.backdropPath}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
          <div 
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-4"
          >
            {/* Top */}
            <div className="flex justify-end">
              <button className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
            
            {/* Bottom */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                <span>{item.currentTime} / {item.duration}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors">
                <Play fill="black" size={16} /> Continue
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
