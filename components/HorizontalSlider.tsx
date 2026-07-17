'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalSliderProps {
  children: React.ReactNode;
  duration?: number; // in seconds
  direction?: 'left' | 'right';
}

export function HorizontalSlider({
  children,
  duration = 15,
  direction = 'left',
}: HorizontalSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setIsAtStart(scrollLeft <= 10);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.max(scrollContainerRef.current.clientWidth * 0.85, 260);
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = Math.max(scrollContainerRef.current.clientWidth * 0.85, 260);
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const scrollAmount = Math.max(clientWidth * 0.85, 260);
        
        if (direction === 'left') {
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        } else {
          if (scrollLeft <= 10) {
            scrollContainerRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
          } else {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          }
        }
      }
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [duration, direction, isPaused]);

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-10 h-10 lg:w-12 lg:h-12 items-center justify-center bg-black/70 text-white rounded-full hover:bg-black/90 transition-all duration-300 ${isAtStart ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onScroll={handleScroll}
      >
        <div className="flex">
          {children}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-10 h-10 lg:w-12 lg:h-12 items-center justify-center bg-black/70 text-white rounded-full hover:bg-black/90 transition-all duration-300 ${isAtEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
