'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import {
  clearMiniPlayerState,
  getMiniPlayerEventName,
  getMiniPlayerState,
  updateMiniPlayerState,
  type MiniPlayerState,
} from '@/lib/data';

export function MiniPlayerHost() {
  const [miniPlayerState, setMiniPlayerState] = useState<MiniPlayerState | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncMiniPlayer = () => {
      const nextState = getMiniPlayerState();
      setMiniPlayerState(nextState);
    };

    syncMiniPlayer();
    const miniPlayerEvent = getMiniPlayerEventName();
    window.addEventListener(miniPlayerEvent, syncMiniPlayer as EventListener);
    window.addEventListener('storage', syncMiniPlayer);

    return () => {
      window.removeEventListener(miniPlayerEvent, syncMiniPlayer as EventListener);
      window.removeEventListener('storage', syncMiniPlayer);
    };
  }, []);

  if (!miniPlayerState?.isVisible) {
    return null;
  }

  const handleToggleSize = () => {
    const currentState = getMiniPlayerState();
    if (!currentState) {
      return;
    }

    const nextIsMinimized = !currentState.isMinimized;
    updateMiniPlayerState({ isMinimized: nextIsMinimized });
    setMiniPlayerState({ ...currentState, isMinimized: nextIsMinimized });
  };

  const handleClose = () => {
    clearMiniPlayerState();
    setMiniPlayerState(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className={
          miniPlayerState.isMinimized
            ? 'fixed bottom-4 right-4 z-[70] w-[360px] max-w-[calc(100vw-2rem)]'
            : 'fixed inset-4 z-[70] md:inset-10'
        }
      >
        <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-400">
                Mini Player
              </p>
              {miniPlayerState.title && (
                <p className="mt-1 truncate text-sm font-medium text-white">
                  {miniPlayerState.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSize}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                {miniPlayerState.isMinimized ? 'Open' : 'Minimize'}
              </button>
              <button
                onClick={handleClose}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-red-500 hover:bg-zinc-900"
              >
                Close
              </button>
            </div>
          </div>

          <div className={miniPlayerState.isMinimized ? 'aspect-video w-full' : 'h-[calc(100vh-10rem)] w-full'}>
            <VideoPlayer
              src={miniPlayerState.src}
              sourceType={miniPlayerState.sourceType}
              poster={miniPlayerState.poster}
              title={miniPlayerState.title}
              autoplay={miniPlayerState.isPlaying}
              videoId={miniPlayerState.videoId}
              subtitles={miniPlayerState.subtitles}
              audioTracks={miniPlayerState.audioTracks}
              initialTime={miniPlayerState.currentTime}
              mode={miniPlayerState.isMinimized ? 'mini' : 'default'}
              enableMiniPlayer={false}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
