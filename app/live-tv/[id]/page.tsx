'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Star,
  Plus,
  Info
} from 'lucide-react';
import { getLiveTVChannels, isUserAuthenticated, sampleMovies } from '@/lib/data';
import { MovieCard } from '@/components/MovieCard';
import { Navbar } from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { getLiveChannelPlayback } from '@/lib/playback';
import { cn } from '@/lib/utils';

export default function LiveTVDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [channel, setChannel] = useState<any>(null);
  const [isAccessReady, setIsAccessReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample schedule
  const schedule = [
    { id: 1, time: '08:00 AM', title: 'Morning News', duration: '2h' },
    { id: 2, time: '10:00 AM', title: 'Talk Show', duration: '1h' },
    { id: 3, time: '11:00 AM', title: 'Cooking Show', duration: '1h' },
    { id: 4, time: '12:00 PM', title: 'Midday News', duration: '1h' },
    { id: 5, time: '01:00 PM', title: 'Movie Time', duration: '2h' },
    { id: 6, time: '03:00 PM', title: 'Sports Highlight', duration: '1h' },
    { id: 7, time: '04:00 PM', title: 'Drama Series', duration: '1h' },
    { id: 8, time: '05:00 PM', title: 'Evening News', duration: '1h' }
  ];

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsAccessReady(true);
  }, [router]);

  useEffect(() => {
    const channelId = params.id;
    const channels = getLiveTVChannels();
    const foundChannel = channels.find(c => c.id.toString() === channelId);
    setChannel(foundChannel || {
      id: channelId,
      name: 'Sample Channel',
      genre: 'General',
      streamUrl: '',
      accentColor: '#EF4444',
      posterPath: ''
    });
  }, [params.id]);

  if (!isAccessReady || !channel) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading content...</p>
        </div>
      </main>
    );
  }

  const playback = getLiveChannelPlayback(channel);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <Navbar />
      {/* Hero Section with Backdrop */}
      <div className="relative w-full aspect-video max-h-[70vh] overflow-hidden">
        {/* Background Video or Image */}
        <div className="absolute inset-0">
          {channel.posterPath ? (
            <img
              src={channel.posterPath}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full" 
              style={{ backgroundColor: channel.accentColor }}
            />
          )}
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] to-transparent w-2/3" />

        {/* Trailer Controls */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause();
                } else {
                  videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}
            className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm">
            <Maximize2 size={24} />
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="flex flex-col md:flex-row items-end gap-10">
            {/* Channel Logo/Poster */}
            <div className="flex-shrink-0">
              <div 
                className="w-64 md:w-80 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center text-8xl font-bold"
                style={{ backgroundColor: channel.accentColor }}
              >
                {channel.name[0]}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold mb-4"
              >
                {channel.name}
              </motion.h1>

              <div className="flex items-center gap-4 text-zinc-400 mb-6">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star fill="currentColor" size={18} />
                  <span className="font-semibold">4.8</span>
                </span>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-sm">
                  {channel.genre}
                </span>
                <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-bold animate-pulse">
                  LIVE
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => playback && setIsPlayerOpen(true)}
                  disabled={!playback}
                  className={cn(
                    'flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-xl transition-colors',
                    playback ? 'hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
                  )}
                >
                  <Play fill="currentColor" size={24} />
                  Watch Live
                </button>
                <button className="flex items-center gap-3 px-6 py-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
                  <Plus size={24} />
                  Add to Favorites
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    'p-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-all',
                    isLiked && 'text-red-500 border-red-500 bg-red-500/10'
                  )}
                >
                  <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>

              <p className="text-lg text-zinc-300 max-w-3xl mb-6">
                Watch your favorite shows 24/7. This channel brings you the best entertainment, news, and sports all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isPlayerOpen && playback && (
        <section className="relative z-20 mx-auto -mt-10 mb-12 max-w-7xl px-8">
          <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950/92 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">
                  Live Playback
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">{playback.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{channel.genre}</p>
              </div>
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                Close Player
              </button>
            </div>
            <VideoPlayer
              src={playback.url}
              sourceType={playback.type}
              poster={playback.poster || channel.posterPath || undefined}
              title={channel.name}
              autoplay
              videoId={playback.videoId || `live-tv-${channel.id}`}
              subtitles={playback.subtitles}
              audioTracks={playback.audioTracks}
            />
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Channel Info & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Channel Info */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold mb-8">About Channel</h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-zinc-400 w-24">Genre</span>
                  <span className="text-white font-medium">{channel.genre}</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-zinc-400 w-24">Quality</span>
                  <span className="text-white font-medium">1080p</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-zinc-400 w-24">Stream Type</span>
                  <span className="text-white font-medium">{channel.streamType || 'HLS'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Today's Schedule</h2>
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-6 p-4 rounded-xl border transition-colors',
                    index === 3
                      ? 'bg-zinc-900/50 border-red-600/50'
                      : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50'
                  )}
                >
                  <div className="w-24 text-zinc-400 font-mono text-lg">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn(
                      'font-semibold text-lg',
                      index === 3 ? 'text-white' : 'text-zinc-300'
                    )}>
                      {item.title}
                    </h4>
                  </div>
                  <div className="text-zinc-500">
                    {item.duration}
                  </div>
                  {index === 3 && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-semibold">
                        LIVE
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Channels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Related Channels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {getLiveTVChannels().filter(c => c.id !== channel.id).map(c => (
              <Link key={c.id} href={`/live-tv/${c.id}`}>
                <motion.div
                  className="group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="aspect-square rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg"
                    style={{ backgroundColor: c.accentColor }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold text-center">{c.name}</h3>
                    <p className="text-zinc-500 text-sm text-center">{c.genre}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Movies */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sampleMovies.map(m => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
