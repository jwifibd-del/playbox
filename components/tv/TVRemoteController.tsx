'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Home,
  Mic,
  Tv,
  Maximize2,
  Minimize2,
  Volume1,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TVRemoteControllerProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onVoiceSearch?: () => void;
  onPlayPause?: () => void;
  className?: string;
}

export function TVRemoteController({
  onNavigate,
  onSelect,
  onBack,
  onHome,
  onVoiceSearch,
  onPlayPause,
  className,
}: TVRemoteControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Play subtle feedback beep using Web Audio API
  const playClickSound = useCallback((frequency = 440, duration = 0.04) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  const triggerAction = (actionName: string, callback?: () => void, freq = 520) => {
    setActiveButton(actionName);
    playClickSound(freq);
    if (callback) {
      callback();
    }
    setTimeout(() => setActiveButton(null), 180);
  };

  const handleDpad = (direction: 'up' | 'down' | 'left' | 'right') => {
    triggerAction(direction, () => {
      if (onNavigate) {
        onNavigate(direction);
      } else {
        // Dispatch synthetic keyboard event
        const keyMap = {
          up: 'ArrowUp',
          down: 'ArrowDown',
          left: 'ArrowLeft',
          right: 'ArrowRight',
        };
        const event = new KeyboardEvent('keydown', {
          key: keyMap[direction],
          bubbles: true,
          cancelable: true,
        });
        document.activeElement?.dispatchEvent(event);
      }
    }, direction === 'up' || direction === 'down' ? 620 : 540);
  };

  const handleCenterOk = () => {
    triggerAction('ok', () => {
      if (onSelect) {
        onSelect();
      } else {
        const focused = document.activeElement as HTMLElement;
        if (focused) {
          focused.click();
        }
      }
    }, 780);
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    triggerAction('playpause', onPlayPause, 480);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    triggerAction('mute', undefined, 380);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="tv-remote-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-zinc-950/90 px-4 py-3 text-sm font-bold text-amber-300 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-amber-400 hover:bg-zinc-900',
          isOpen && 'border-rose-500/40 text-rose-300',
          className
        )}
        title="Toggle TV Remote Control"
      >
        <Tv className="h-5 w-5 animate-pulse text-amber-400" />
        <span>{isOpen ? 'Close Remote' : 'TV Remote'}</span>
      </button>

      {/* Virtual Remote Control Unit */}
      {isOpen && (
        <div
          id="tv-virtual-remote"
          className="fixed bottom-20 right-6 z-50 w-72 select-none rounded-[36px] border border-zinc-700/80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Top Bar of Remote */}
          <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">PlayFlix Remote</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                title={soundEnabled ? 'Disable click sounds' : 'Enable click sounds'}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-400" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Top Controls: Power, Voice, Input */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            <button
              onClick={onHome}
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 active:scale-95',
                activeButton === 'home' && 'bg-amber-400/20 text-amber-300'
              )}
            >
              <Home className="h-4 w-4 mb-0.5 text-zinc-300" />
              <span>Home</span>
            </button>
            <button
              onClick={() => triggerAction('voice', onVoiceSearch, 680)}
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/10 py-2.5 text-xs font-semibold text-sky-200 transition-all hover:bg-sky-500/20 active:scale-95',
                activeButton === 'voice' && 'bg-sky-500/30'
              )}
            >
              <Mic className="h-4 w-4 mb-0.5 text-sky-300" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => triggerAction('back', onBack, 360)}
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 active:scale-95',
                activeButton === 'back' && 'bg-amber-400/20 text-amber-300'
              )}
            >
              <RotateCcw className="h-4 w-4 mb-0.5 text-zinc-300" />
              <span>Back</span>
            </button>
          </div>

          {/* Directional D-Pad */}
          <div className="relative mx-auto my-3 flex h-48 w-48 items-center justify-center rounded-full border-2 border-zinc-700/80 bg-zinc-900/90 shadow-inner">
            {/* UP */}
            <button
              id="tv-remote-up"
              onClick={() => handleDpad('up')}
              className={cn(
                'absolute top-2 flex h-11 w-20 items-center justify-center rounded-t-full text-zinc-300 transition-all hover:bg-zinc-700/50 hover:text-white active:scale-95',
                activeButton === 'up' && 'bg-amber-500/30 text-amber-300'
              )}
              aria-label="Up"
            >
              <ChevronUp className="h-6 w-6" />
            </button>

            {/* DOWN */}
            <button
              id="tv-remote-down"
              onClick={() => handleDpad('down')}
              className={cn(
                'absolute bottom-2 flex h-11 w-20 items-center justify-center rounded-b-full text-zinc-300 transition-all hover:bg-zinc-700/50 hover:text-white active:scale-95',
                activeButton === 'down' && 'bg-amber-500/30 text-amber-300'
              )}
              aria-label="Down"
            >
              <ChevronDown className="h-6 w-6" />
            </button>

            {/* LEFT */}
            <button
              id="tv-remote-left"
              onClick={() => handleDpad('left')}
              className={cn(
                'absolute left-2 flex h-20 w-11 items-center justify-center rounded-l-full text-zinc-300 transition-all hover:bg-zinc-700/50 hover:text-white active:scale-95',
                activeButton === 'left' && 'bg-amber-500/30 text-amber-300'
              )}
              aria-label="Left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* RIGHT */}
            <button
              id="tv-remote-right"
              onClick={() => handleDpad('right')}
              className={cn(
                'absolute right-2 flex h-20 w-11 items-center justify-center rounded-r-full text-zinc-300 transition-all hover:bg-zinc-700/50 hover:text-white active:scale-95',
                activeButton === 'right' && 'bg-amber-500/30 text-amber-300'
              )}
              aria-label="Right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* CENTER OK BUTTON */}
            <button
              id="tv-remote-ok"
              onClick={handleCenterOk}
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full border border-zinc-600 bg-gradient-to-br from-zinc-700 to-zinc-900 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-zinc-600 hover:to-zinc-800 active:scale-95',
                activeButton === 'ok' && 'border-amber-400 bg-amber-500 text-black shadow-[0_0_15px_#f59e0b]'
              )}
              aria-label="Select / OK"
            >
              <span className="text-sm tracking-wider">OK</span>
            </button>
          </div>

          {/* Playback & Volume Row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={handleToggleMute}
              className={cn(
                'flex items-center justify-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 active:scale-95',
                isMuted && 'border-rose-500/50 text-rose-300'
              )}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handlePlayPause}
              className={cn(
                'flex items-center justify-center gap-1 rounded-2xl border border-amber-500/40 bg-amber-500/20 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/30 active:scale-95',
                activeButton === 'playpause' && 'scale-95 bg-amber-500/40'
              )}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen?.();
                } else {
                  document.documentElement.requestFullscreen?.();
                }
              }}
              className="flex items-center justify-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 active:scale-95"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[10px] tracking-wide text-zinc-500">Keyboard ↑ ↓ ← → and Enter also work</span>
          </div>
        </div>
      )}
    </>
  );
}
