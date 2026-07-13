'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { KidsContent } from '@/lib/data';

interface KidsCardProps {
  content?: KidsContent;
  item?: KidsContent;
  index?: number;
}

export function KidsCard({ content, item, index = 0 }: KidsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Use either content or item prop for backward compatibility
  const data = content || item;
  
  if (!data) return null;

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.08, zIndex: 50 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl">
        <img
          src={data.posterPath}
          alt={data.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-5"
          >
            <h3 className="text-white font-bold text-xl mb-2 line-clamp-2">{data.title}</h3>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="text-yellow-400 font-semibold">{data.rating}</span>
              <span className="text-gray-300">•</span>
              <span className="text-white/80">{data.genre}</span>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg">
              <Play fill="black" size={18} />
              Play
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
