'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

export const KNOWN_ACTOR_IMAGES: Record<string, string> = {
  "Christian Bale": "https://static.tvmaze.com/uploads/images/medium_portrait/70/176856.jpg",
  "Heath Ledger": "https://static.tvmaze.com/uploads/images/medium_portrait/44/112055.jpg",
  "Aaron Eckhart": "https://static.tvmaze.com/uploads/images/medium_portrait/33/82837.jpg",
  "Maggie Gyllenhaal": "https://static.tvmaze.com/uploads/images/medium_portrait/29/74019.jpg",
  "Michael Caine": "https://static.tvmaze.com/uploads/images/medium_portrait/45/114043.jpg",
  "Gary Oldman": "https://static.tvmaze.com/uploads/images/medium_portrait/45/114347.jpg",
  "Leonardo DiCaprio": "https://static.tvmaze.com/uploads/images/medium_portrait/269/672763.jpg",
  "Joseph Gordon-Levitt": "https://static.tvmaze.com/uploads/images/medium_portrait/85/214698.jpg",
  "Ellen Page": "https://static.tvmaze.com/uploads/images/medium_portrait/413/1034108.jpg",
  "Elliot Page": "https://static.tvmaze.com/uploads/images/medium_portrait/413/1034108.jpg",
  "Tom Hardy": "https://static.tvmaze.com/uploads/images/medium_portrait/92/231677.jpg",
  "Marion Cotillard": "https://static.tvmaze.com/uploads/images/medium_portrait/91/229385.jpg",
  "Tim Robbins": "https://static.tvmaze.com/uploads/images/medium_portrait/9/24280.jpg",
  "Morgan Freeman": "https://static.tvmaze.com/uploads/images/medium_portrait/47/119670.jpg",
  "Bob Gunton": "https://static.tvmaze.com/uploads/images/medium_portrait/183/457608.jpg",
  "John Travolta": "https://static.tvmaze.com/uploads/images/medium_portrait/74/186963.jpg",
  "Samuel L. Jackson": "https://static.tvmaze.com/uploads/images/medium_portrait/624/1562412.jpg",
  "Uma Thurman": "https://static.tvmaze.com/uploads/images/medium_portrait/9/23853.jpg",
  "Bruce Willis": "https://static.tvmaze.com/uploads/images/medium_portrait/9/23686.jpg",
  "Keanu Reeves": "https://static.tvmaze.com/uploads/images/medium_portrait/45/113789.jpg",
  "Laurence Fishburne": "https://static.tvmaze.com/uploads/images/medium_portrait/636/1590529.jpg",
  "Carrie-Anne Moss": "https://static.tvmaze.com/uploads/images/medium_portrait/120/301939.jpg",
  "Hugo Weaving": "https://static.tvmaze.com/uploads/images/medium_portrait/53/133124.jpg",
  "Tom Hanks": "https://static.tvmaze.com/uploads/images/medium_portrait/28/72307.jpg",
  "Robin Wright": "https://static.tvmaze.com/uploads/images/medium_portrait/3/8644.jpg",
  "Gary Sinise": "https://static.tvmaze.com/uploads/images/medium_portrait/8/20153.jpg",
  "Brad Pitt": "https://static.tvmaze.com/uploads/images/medium_portrait/11/29350.jpg",
  "Edward Norton": "https://static.tvmaze.com/uploads/images/medium_portrait/525/1313957.jpg",
  "Helena Bonham Carter": "https://static.tvmaze.com/uploads/images/medium_portrait/530/1325009.jpg",
  "Rumi Hiiragi": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "Miyu Irino": "https://static.tvmaze.com/uploads/images/medium_portrait/70/176906.jpg",
  "Ryunosuke Kamiki": "https://static.tvmaze.com/uploads/images/medium_portrait/65/163658.jpg",
  "Mone Kamishiraishi": "https://static.tvmaze.com/uploads/images/medium_portrait/95/237669.jpg",
  "Mitsuo Iwata": "https://static.tvmaze.com/uploads/images/medium_portrait/25/64614.jpg",
  "Nozomu Sasaki": "https://static.tvmaze.com/uploads/images/medium_portrait/73/184364.jpg",
  "Timothée Chalamet": "https://static.tvmaze.com/uploads/images/medium_portrait/550/1377032.jpg",
  "Zendaya": "https://static.tvmaze.com/uploads/images/medium_portrait/550/1377086.jpg",
  "Rebecca Ferguson": "https://static.tvmaze.com/uploads/images/medium_portrait/35/88554.jpg",
  "Javier Bardem": "https://static.tvmaze.com/uploads/images/medium_portrait/550/1377027.jpg",
  "Cillian Murphy": "https://static.tvmaze.com/uploads/images/medium_portrait/590/1476019.jpg",
  "Emily Blunt": "https://static.tvmaze.com/uploads/images/medium_portrait/430/1075926.jpg",
  "Matt Damon": "https://static.tvmaze.com/uploads/images/medium_portrait/609/1524840.jpg",
  "Robert Downey Jr.": "https://static.tvmaze.com/uploads/images/medium_portrait/5/13304.jpg",
  "Ryan Gosling": "https://static.tvmaze.com/uploads/images/medium_portrait/616/1541474.jpg",
  "Harrison Ford": "https://static.tvmaze.com/uploads/images/medium_portrait/612/1530120.jpg",
  "Ana de Armas": "https://static.tvmaze.com/uploads/images/medium_portrait/254/635450.jpg",
  "Matthew McConaughey": "https://static.tvmaze.com/uploads/images/medium_portrait/3/8927.jpg",
  "Anne Hathaway": "https://static.tvmaze.com/uploads/images/medium_portrait/254/635982.jpg",
  "Jessica Chastain": "https://static.tvmaze.com/uploads/images/medium_portrait/51/128106.jpg",
  "Robert Pattinson": "https://static.tvmaze.com/uploads/images/medium_portrait/607/1519524.jpg",
  "Zoë Kravitz": "https://static.tvmaze.com/uploads/images/medium_portrait/274/687451.jpg",
  "Paul Dano": "https://static.tvmaze.com/uploads/images/medium_portrait/27/69737.jpg",
  "Tom Cruise": "https://static.tvmaze.com/uploads/images/medium_portrait/31/79932.jpg",
  "Miles Teller": "https://static.tvmaze.com/uploads/images/medium_portrait/87/218809.jpg",
  "Jennifer Connelly": "https://static.tvmaze.com/uploads/images/medium_portrait/259/649694.jpg",
};

export function resolveCastImage(name?: string, profilePath?: string): string {
  const trimmed = (profilePath || '').trim();
  // Filter out any broken, 404, or invalid legacy Trae AI endpoints
  const isBrokenLegacyUrl = trimmed.includes('coresg-normal.trae.ai') || trimmed.includes('undefined') || trimmed.includes('null');
  
  if (trimmed && !isBrokenLegacyUrl && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/'))) {
    return trimmed;
  }

  // Check known actors directory
  if (name) {
    const directMatch = KNOWN_ACTOR_IMAGES[name];
    if (directMatch) return directMatch;

    // Case-insensitive lookup
    const lowerName = name.toLowerCase().trim();
    for (const [knownName, url] of Object.entries(KNOWN_ACTOR_IMAGES)) {
      if (knownName.toLowerCase() === lowerName) {
        return url;
      }
    }
  }

  // Reliable, high-resolution avatar fallback
  const safeName = (name || 'Actor').trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=18181b&color=f4f4f5&size=256&bold=true`;
}

interface CastAvatarProps {
  name: string;
  profilePath?: string;
  sizeClassName?: string;
  className?: string;
  containerClassName?: string;
}

export const CastAvatar: React.FC<CastAvatarProps> = ({
  name,
  profilePath,
  sizeClassName = "w-full h-full",
  className = "",
  containerClassName = ""
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const primaryUrl = resolveCastImage(name, profilePath);

  // Derive initials for pure CSS/SVG fallback
  const initials = (name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'A';

  const handleError = () => {
    setErrorCount(prev => prev + 1);
  };

  // If first image fails, try ui-avatars. If that fails too, render clean initials badge
  if (errorCount >= 2) {
    return (
      <div 
        className={`w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex flex-col items-center justify-center text-zinc-300 font-bold select-none ${containerClassName}`}
        title={name}
      >
        <span className="text-sm sm:text-base tracking-wider">{initials}</span>
        <User className="w-3 h-3 text-zinc-500 mt-0.5 opacity-60" />
      </div>
    );
  }

  const currentSrc = errorCount === 0 
    ? primaryUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Actor')}&background=18181b&color=f4f4f5&size=256&bold=true`;

  return (
    <img
      src={currentSrc}
      alt={name || 'Cast member'}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={handleError}
      className={`${sizeClassName} object-cover rounded-full ${className}`}
    />
  );
};
