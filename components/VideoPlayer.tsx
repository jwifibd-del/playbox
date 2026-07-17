'use client';

import { type ChangeEvent, type TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Hls, { Level as HlsLevel } from 'hls.js';
import {
  clearMiniPlayerState,
  getMiniPlayerState,
  saveMiniPlayerState,
  type MediaAudioTrack,
  type MediaSourceType,
  type MediaSubtitleTrack,
} from '@/lib/data';

interface QualityLevel {
  height: number;
  level?: number;
  bitrate?: number;
  width?: number;
  name?: string;
}

interface Bookmark {
  id: number;
  time: number;
  label: string;
}

interface VideoPlayerProps {
  src: string;
  sourceType?: MediaSourceType;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  videoId?: string;
  subtitles?: MediaSubtitleTrack[];
  introStartTime?: number; // in seconds, defaults to 0
  introEndTime?: number; // in seconds
  creditsStartTime?: number; // in seconds
  audioTracks?: MediaAudioTrack[];
  is4K?: boolean;
  isHDR?: boolean;
  isDolbyVision?: boolean;
  isDolbyAtmos?: boolean;
  initialTime?: number;
  mode?: 'default' | 'mini';
  enableMiniPlayer?: boolean;
  onCloseMiniPlayer?: () => void;
  onExpandMiniPlayer?: () => void;
  drmConfig?: {
    type: 'widevine' | 'playready' | 'fairplay';
    licenseUrl: string;
    headers?: Record<string, string>;
  }[];
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number; // in seconds
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_TIMER_OPTIONS = [15, 30, 45, 60, 90]; // minutes

type ExternalPlayerType = 'youtube' | 'embed';
type NativeAudioTrack = {
  id?: string;
  label?: string;
  language?: string;
  enabled?: boolean;
};
type VideoWithOptionalAudioTracks = HTMLVideoElement & {
  audioTracks?: ArrayLike<NativeAudioTrack>;
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }

    if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/embed/')) {
        return `${parsedUrl.origin}${parsedUrl.pathname}${parsedUrl.search || '?autoplay=1&rel=0'}`;
      }

      const videoId = parsedUrl.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function getExternalSource(
  url: string,
  sourceType?: VideoPlayerProps['sourceType'],
): { type: ExternalPlayerType; url: string } | null {
  if (!url) return null;

  const youtubeUrl = getYouTubeEmbedUrl(url);
  if (sourceType === 'YouTube URL' || youtubeUrl) {
    return { type: 'youtube', url: youtubeUrl || url };
  }

  if (sourceType === 'Embed URL') {
    return { type: 'embed', url };
  }

  return null;
}

function mapHlsAudioTracks(tracks: Hls['audioTracks']): MediaAudioTrack[] {
  return tracks.map((track, index) => ({
    id: track.id ? String(track.id) : `hls-audio-${index}`,
    label: track.name || track.lang || `Track ${index + 1}`,
    lang: track.lang || 'und',
    hlsIndex: index,
    isDefault: track.default,
  }));
}

function mapNativeAudioTracks(video: HTMLVideoElement): MediaAudioTrack[] {
  const nativeTracks = (video as VideoWithOptionalAudioTracks).audioTracks;
  if (!nativeTracks || nativeTracks.length === 0) {
    return [];
  }

  return Array.from({ length: nativeTracks.length }, (_, index) => {
    const track = nativeTracks[index];
    return {
      id: track?.id || `native-audio-${index}`,
      label: track?.label || track?.language || `Track ${index + 1}`,
      lang: track?.language || 'und',
      hlsIndex: index,
      isDefault: track?.enabled,
    };
  });
}

export default function VideoPlayer({
  src,
  sourceType,
  poster,
  title,
  autoplay = false,
  videoId = 'default-video',
  subtitles = [],
  introStartTime = 0,
  introEndTime,
  creditsStartTime,
  audioTracks = [],
  is4K = false,
  isHDR = false,
  isDolbyVision = false,
  isDolbyAtmos = false,
  initialTime,
  mode = 'default',
  enableMiniPlayer = true,
  onCloseMiniPlayer,
  onExpandMiniPlayer,
  drmConfig,
  enableAutoRefresh = false,
  autoRefreshInterval = 300, // 5 minutes default
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<any | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const miniTransferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeRef = useRef(0);
  const isMiniPlayer = mode === 'mini';

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 means auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | 'off'>('off');
  const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showSleepTimerMenu, setShowSleepTimerMenu] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipCredits, setShowSkipCredits] = useState(false);
  const [showAudioTrackMenu, setShowAudioTrackMenu] = useState(false);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<string>('default');
  const [availableAudioTracks, setAvailableAudioTracks] = useState<MediaAudioTrack[]>([]);
  const [showCastMenu, setShowCastMenu] = useState(false);
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castTo, setCastTo] = useState<'airplay' | 'chromecast' | null>(null);
  const [showMiniTransferNotice, setShowMiniTransferNotice] = useState(false);
  const externalSource = useMemo(() => getExternalSource(src, sourceType), [src, sourceType]);

  // Load bookmarks from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedBookmarks = localStorage.getItem(`playflix-bookmarks-${videoId}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, [videoId]);

  // Check AirPlay availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for AirPlay support (Safari/iOS)
      const video = videoRef.current;
      if (video && 'webkitShowPlaybackTargetPicker' in video) {
        setIsAirPlayAvailable(true);
      }
    }
  }, []);

  // Auto-resume from local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedTime = localStorage.getItem(`playflix-watch-${videoId}`);
    const parsedSavedTime = savedTime ? parseFloat(savedTime) : 0;
    resumeTimeRef.current = typeof initialTime === 'number' ? initialTime : parsedSavedTime;
  }, [initialTime, videoId]);

  // Save watch progress
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saveProgress = () => {
      if (videoRef.current && videoRef.current.currentTime > 5) {
        localStorage.setItem(
          `playflix-watch-${videoId}`,
          videoRef.current.currentTime.toString(),
        );
      }
    };
    const interval = setInterval(saveProgress, 5000);
    return () => clearInterval(interval);
  }, [videoId]);

  // Load audio tracks
  useEffect(() => {
    if (audioTracks.length === 0) {
      return;
    }

    setAvailableAudioTracks(audioTracks);
    const defaultTrack = audioTracks.find((track) => track.isDefault) || audioTracks[0];
    if (defaultTrack) {
      setCurrentAudioTrack(defaultTrack.id);
    }
  }, [audioTracks]);

  useEffect(() => {
    if (isMiniPlayer || typeof window === 'undefined') {
      return;
    }

    const activeMiniPlayer = getMiniPlayerState();
    if (activeMiniPlayer?.videoId === videoId) {
      clearMiniPlayerState();
    }
  }, [isMiniPlayer, videoId]);

  useEffect(() => {
    if (!showMiniTransferNotice) {
      return;
    }

    miniTransferTimeoutRef.current = setTimeout(() => {
      setShowMiniTransferNotice(false);
    }, 2200);

    return () => {
      if (miniTransferTimeoutRef.current) {
        clearTimeout(miniTransferTimeoutRef.current);
      }
    };
  }, [showMiniTransferNotice]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || externalSource) return;

    const applyResumeTime = () => {
      if (!videoRef.current || resumeTimeRef.current <= 0) {
        return;
      }

      const nextTime = Math.min(
        resumeTimeRef.current,
        Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0
          ? Math.max(videoRef.current.duration - 1, 0)
          : resumeTimeRef.current,
      );

      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
      resumeTimeRef.current = 0;
    };

    video.addEventListener('loadedmetadata', applyResumeTime);
    video.addEventListener('canplay', applyResumeTime);

    return () => {
      video.removeEventListener('loadedmetadata', applyResumeTime);
      video.removeEventListener('canplay', applyResumeTime);
    };
  }, [externalSource, src]);

  // Skip Intro/Credits logic
  useEffect(() => {
    if (introEndTime && currentTime >= introStartTime && currentTime < introEndTime) {
      setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
    }

    if (creditsStartTime && currentTime >= creditsStartTime) {
      setShowSkipCredits(true);
    } else {
      setShowSkipCredits(false);
    }
  }, [currentTime, introStartTime, introEndTime, creditsStartTime]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) {
      if (sleepTimerRef.current) {
        clearInterval(sleepTimerRef.current);
      }
      return;
    }

    if (sleepTimerRemaining <= 0) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setSleepTimerRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemaining]);

  // Initialize HLS or DASH
  useEffect(() => {
    const video = videoRef.current;
    if (!video || externalSource) return;

    if (Hls.isSupported() && src.endsWith('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setQualities(hls.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          width: level.width,
          name: level.name,
          level: index
        })));
        if (autoplay) {
          video.play().catch(() => { /* Autoplay may be blocked */ });
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        const nextTracks = mapHlsAudioTracks(data.audioTracks);
        if (nextTracks.length > 0) {
          setAvailableAudioTracks(nextTracks);
          const selectedTrack = nextTracks[hls.audioTrack] || nextTracks.find((track) => track.isDefault) || nextTracks[0];
          if (selectedTrack) {
            setCurrentAudioTrack(selectedTrack.id);
          }
        }
      });

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => {
        const selectedTrack = hls.audioTracks[data.id];
        if (selectedTrack) {
          setCurrentAudioTrack(String(selectedTrack.id ?? `hls-audio-${data.id}`));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS network error, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS media error, trying to recover');
              hls.recoverMediaError();
              break;
          }
        }
      });
    } else if (src.endsWith('.mpd')) {
      (async () => {
        const dashjs = await import('dashjs');
        const dash = dashjs.MediaPlayer().create();
        dashRef.current = dash;
        dash.initialize(video, src, autoplay);
      })();
    } else {
      const nativeTracks = mapNativeAudioTracks(video);
      if (nativeTracks.length > 0) {
        setAvailableAudioTracks(nativeTracks);
        const selectedTrack = nativeTracks.find((track) => track.isDefault) || nativeTracks[0];
        if (selectedTrack) {
          setCurrentAudioTrack(selectedTrack.id);
        }
      }
    }

    // Event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleRateChange = () => setPlaybackRate(video.playbackRate);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
      hlsRef.current?.destroy();
      dashRef.current?.reset();
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [audioTracks, externalSource, src, autoplay, drmConfig, enableAutoRefresh, autoRefreshInterval]);

  // Auto-refresh for streams
  useEffect(() => {
    if (!enableAutoRefresh) return;

    const refreshStream = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;

      if (hlsRef.current) {
        hlsRef.current.loadSource(src);
        hlsRef.current.attachMedia(video);
      } else if (dashRef.current) {
        dashRef.current.attachSource(src);
      } else {
        video.src = src;
      }

      if (!isNaN(currentTime)) {
        video.currentTime = currentTime;
      }

      if (wasPlaying) {
        video.play().catch(() => { /* Autoplay may be blocked */ });
      }
    };

    autoRefreshTimerRef.current = setInterval(refreshStream, autoRefreshInterval * 1000);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [enableAutoRefresh, autoRefreshInterval, src]);

  // Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // Seek
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = parseFloat(e.target.value);
  };

  // Volume
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    videoRef.current.muted = newVolume === 0;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  // Speed control
  const setPlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setShowSpeedMenu(false);
  };

  // Quality control
  const setQuality = async (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    } else if (dashRef.current) {
      if (levelIndex === -1) {
        dashRef.current.setQualityFor('video', -1);
      } else {
        dashRef.current.setQualityFor('video', levelIndex);
      }
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  // Subtitles
  const handleSubtitleSelect = (lang: string | 'off') => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;
    
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = 'disabled';
    }

    if (lang !== 'off') {
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i].language === lang) {
          tracks[i].mode = 'showing';
          break;
        }
      }
    }
    setCurrentSubtitle(lang);
    setShowSubtitleMenu(false);
  };

  const downloadSubtitle = (sub: MediaSubtitleTrack) => {
    const link = document.createElement('a');
    link.href = sub.src;
    link.download = `${sub.label}.vtt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gesture state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastTapTime = useRef(0);
  const isDragging = useRef(false);
  const initialVolume = useRef(0);
  const initialTouchTime = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    const now = Date.now();
    const tapDelay = now - lastTapTime.current;
    lastTapTime.current = now;
    if (tapDelay < 300) {
      // Double tap: toggle play/pause
      togglePlay();
    }
    if (videoRef.current) {
      initialVolume.current = volume;
      initialTouchTime.current = videoRef.current.currentTime;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!videoRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      isDragging.current = true;
    }
    
    if (isDragging.current) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe: seek
        const videoWidth = 600;
        const seekAmount = (deltaX / videoWidth) * 60;
        const newTime = Math.max(0, Math.min(duration, initialTouchTime.current + seekAmount));
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } else {
        // Vertical swipe: adjust volume
        const videoHeight = 400;
        const volumeChange = -(deltaY / videoHeight);
        const newVolume = Math.max(0, Math.min(1, initialVolume.current + volumeChange));
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        if (newVolume === 0) {
          setIsMuted(true);
        } else {
          setIsMuted(false);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Bookmarks
  const addBookmark = () => {
    if (!videoRef.current) return;
    const newBookmark: Bookmark = {
      id: Date.now(),
      time: videoRef.current.currentTime,
      label: `Bookmark ${bookmarks.length + 1}`,
    };
    const updatedBookmarks = [...bookmarks, newBookmark].sort((a, b) => a.time - b.time);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`playflix-bookmarks-${videoId}`, JSON.stringify(updatedBookmarks));
  };

  const goToBookmark = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setShowBookmarkMenu(false);
  };

  const deleteBookmark = (id: number) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`playflix-bookmarks-${videoId}`, JSON.stringify(updatedBookmarks));
  };

  // Skip Intro/Credits
  const skipIntro = () => {
    if (!videoRef.current || !introEndTime) return;
    videoRef.current.currentTime = introEndTime;
  };

  const skipCredits = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setShowSkipCredits(false);
  };

  // Sleep Timer
  const startSleepTimer = (minutes: number) => {
    setSleepTimerRemaining(minutes * 60);
    setShowSleepTimerMenu(false);
  };

  const cancelSleepTimer = () => {
    setSleepTimerRemaining(null);
  };

  // Audio track selection
  const selectAudioTrack = (trackId: string) => {
    const selectedTrack = availableAudioTracks.find((track) => track.id === trackId);
    if (!selectedTrack) {
      setCurrentAudioTrack(trackId);
      setShowAudioTrackMenu(false);
      return;
    }

    if (hlsRef.current && typeof selectedTrack.hlsIndex === 'number') {
      hlsRef.current.audioTrack = selectedTrack.hlsIndex;
    } else if (videoRef.current) {
      const nativeTracks = (videoRef.current as VideoWithOptionalAudioTracks).audioTracks;
      if (nativeTracks && typeof selectedTrack.hlsIndex === 'number') {
        for (let index = 0; index < nativeTracks.length; index += 1) {
          const nativeTrack = nativeTracks[index];
          if (nativeTrack) {
            nativeTrack.enabled = index === selectedTrack.hlsIndex;
          }
        }
      }
    }

    setCurrentAudioTrack(trackId);
    setShowAudioTrackMenu(false);
  };

  const sendToMiniPlayer = () => {
    if (!enableMiniPlayer) {
      return;
    }

    const nextState = {
      isVisible: true,
      isMinimized: true,
      src,
      sourceType,
      poster,
      title,
      videoId,
      audioTracks: availableAudioTracks.length > 0 ? availableAudioTracks : audioTracks,
      subtitles,
      currentTime,
      duration,
      isPlaying,
    };

    saveMiniPlayerState(nextState);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowMiniTransferNotice(true);
  };

  const handleCloseMiniPlayer = () => {
    clearMiniPlayerState();
    onCloseMiniPlayer?.();
  };

  // Casting
  const handleAirPlay = () => {
    if (videoRef.current && 'webkitShowPlaybackTargetPicker' in videoRef.current) {
      // @ts-ignore - AirPlay API is Safari-specific
      videoRef.current.webkitShowPlaybackTargetPicker();
      setIsCasting(true);
      setCastTo('airplay');
    }
    setShowCastMenu(false);
  };

  const handleChromecast = () => {
    // For Chromecast, we'd need the official Google Cast SDK
    // For now, show a placeholder toast message
    setIsCasting(true);
    setCastTo('chromecast');
    setShowCastMenu(false);
    // In a real implementation, we'd initialize the Cast SDK here
    console.log('Chromecast selected');
  };

  const stopCasting = () => {
    setIsCasting(false);
    setCastTo(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);

    if (!hlsRef.current) {
      const nativeTracks = mapNativeAudioTracks(videoRef.current);
      if (nativeTracks.length > 0) {
        setAvailableAudioTracks(nativeTracks);
        const selectedTrack = nativeTracks.find((track) => track.isDefault) || nativeTracks[0];
        if (selectedTrack) {
          setCurrentAudioTrack(selectedTrack.id);
        }
      }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  if (externalSource) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/90 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-400">
              {externalSource.type === 'youtube' ? 'YouTube Playback' : 'Embedded Player'}
            </p>
            {title && <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>}
          </div>
          <div className="flex items-center gap-2">
            {!isMiniPlayer && enableMiniPlayer && (
              <button
                onClick={sendToMiniPlayer}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                Mini Player
              </button>
            )}
            {isMiniPlayer && onExpandMiniPlayer && (
              <button
                onClick={onExpandMiniPlayer}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                Open
              </button>
            )}
            {isMiniPlayer && (
              <button
                onClick={handleCloseMiniPlayer}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-red-500 hover:bg-zinc-900"
              >
                Close
              </button>
            )}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Open Source
            </a>
          </div>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={externalSource.url}
            title={title || 'PlayFlix Video Player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-black group ${isMiniPlayer ? 'rounded-2xl shadow-2xl' : 'rounded-lg'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        autoPlay={autoplay}
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleVideoTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => console.error('Video error:', e)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {subtitles.map((sub, i) => (
          <track
            key={i}
            label={sub.label}
            kind="subtitles"
            srcLang={sub.lang}
            src={sub.src}
            default={i === 0}
          />
        ))}
      </video>

      {/* Quality & HDR/Dolby Indicators */}
      {showControls && !isMiniPlayer && (
        <div className="absolute top-4 left-4 flex gap-2">
          {is4K && (
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-1">
              <span className="text-white text-xs font-bold">4K</span>
            </div>
          )}
          {isHDR && (
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-1">
              <span className="text-white text-xs font-bold">HDR</span>
            </div>
          )}
          {isDolbyVision && (
            <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 border border-purple-700 rounded-lg px-3 py-1">
              <span className="text-white text-xs font-bold">Dolby Vision</span>
            </div>
          )}
          {isDolbyAtmos && (
            <div className="bg-gradient-to-r from-indigo-900/80 to-blue-900/80 border border-indigo-700 rounded-lg px-3 py-1">
              <span className="text-white text-xs font-bold">Dolby Atmos</span>
            </div>
          )}
        </div>
      )}

      {/* Casting Status Indicator */}
      {isCasting && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-sm">
            Casting to {castTo === 'airplay' ? 'AirPlay' : 'Chromecast'}
          </span>
          <button
            onClick={stopCasting}
            className="text-white hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}

      {/* Skip Intro Button */}
      {showSkipIntro && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onClick={skipIntro}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all z-50"
        >
          Skip Intro
        </motion.button>
      )}

      {/* Skip Credits Button */}
      {showSkipCredits && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onClick={skipCredits}
          className="absolute bottom-32 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all z-50"
        >
          Skip Credits
        </motion.button>
      )}

      {showMiniTransferNotice && !isMiniPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-28 left-4 z-40 rounded-xl border border-zinc-700 bg-zinc-950/90 px-4 py-3 text-sm text-white shadow-2xl"
        >
          Playback moved to mini player
        </motion.div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="px-4 pt-8 pb-4">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {/* Title */}
            {title && !isMiniPlayer && (
              <span className="text-white text-sm font-medium">{title}</span>
            )}

            {/* Sleep Timer */}
            {!isMiniPlayer && (
            <div className="relative">
              <button
                onClick={() => setShowSleepTimerMenu(!showSleepTimerMenu)}
                className="text-white hover:text-red-500 transition-colors"
              >
                {sleepTimerRemaining ? (
                  <span className="px-2 py-1 bg-zinc-800/70 rounded-lg text-sm font-medium">
                    {formatTime(sleepTimerRemaining)}
                  </span>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                )}
              </button>
              {showSleepTimerMenu && (
                <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[140px]">
                  {sleepTimerRemaining ? (
                    <button
                      onClick={cancelSleepTimer}
                      className="block w-full text-left px-3 py-1.5 rounded-md text-sm text-white hover:bg-zinc-800"
                    >
                      Cancel Timer
                    </button>
                  ) : (
                    SLEEP_TIMER_OPTIONS.map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => startSleepTimer(minutes)}
                        className="block w-full text-left px-3 py-1.5 rounded-md text-sm text-white hover:bg-zinc-800"
                      >
                        {minutes} minutes
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            )}

            {/* Bookmarks */}
            {!isMiniPlayer && (
            <div className="relative">
              <button
                onClick={() => setShowBookmarkMenu(!showBookmarkMenu)}
                className="text-white hover:text-red-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                </svg>
              </button>
              {showBookmarkMenu && (
                <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={addBookmark}
                    className="block w-full text-left px-3 py-1.5 rounded-md text-sm text-white hover:bg-zinc-800 mb-2 border border-zinc-700"
                  >
                    + Add Bookmark
                  </button>
                  {bookmarks.length === 0 ? (
                    <p className="text-zinc-400 text-sm px-3 py-2">No bookmarks</p>
                  ) : (
                    bookmarks.map(bookmark => (
                      <div key={bookmark.id} className="flex items-center justify-between px-3 py-1.5">
                        <button
                          onClick={() => goToBookmark(bookmark.time)}
                          className="text-white hover:text-red-500 text-sm flex-1 text-left"
                        >
                          {formatTime(bookmark.time)} - {bookmark.label}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBookmark(bookmark.id);
                          }}
                          className="text-zinc-400 hover:text-red-500 ml-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            )}

            {/* Casting (AirPlay & Chromecast) */}
            {!isMiniPlayer && (
            <div className="relative">
              <button
                onClick={() => setShowCastMenu(!showCastMenu)}
                className={`${
                  isCasting ? 'text-red-500' : 'text-white hover:text-red-500'
                } transition-colors`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.27 7.11 3.98 8.97 7.37H19V7zM3 11v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11z" />
                </svg>
              </button>
              {showCastMenu && (
                <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[160px]">
                  {isAirPlayAvailable && (
                    <button
                      onClick={handleAirPlay}
                      className="block w-full text-left px-3 py-1.5 rounded-md text-sm text-white hover:bg-zinc-800"
                    >
                      AirPlay
                    </button>
                  )}
                  <button
                    onClick={handleChromecast}
                    className="block w-full text-left px-3 py-1.5 rounded-md text-sm text-white hover:bg-zinc-800"
                  >
                    Chromecast
                  </button>
                </div>
              )}
            </div>
            )}

            {/* Audio Tracks */}
            {availableAudioTracks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAudioTrackMenu(!showAudioTrackMenu)}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                </button>
                {showAudioTrackMenu && (
                  <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[160px]">
                    {availableAudioTracks.map(track => (
                      <button
                        key={track.id}
                        onClick={() => selectAudioTrack(track.id)}
                        className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                          currentAudioTrack === track.id ? 'text-red-500 font-medium' : 'text-white hover:bg-zinc-800'
                        }`}
                      >
                        {track.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed */}
            {!isMiniPlayer && (
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-white hover:text-red-500 transition-colors px-2 py-1 bg-zinc-800/70 rounded-lg text-sm font-medium"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[100px]">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                        speed === playbackRate ? 'text-red-500 font-medium' : 'text-white hover:bg-zinc-800'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Qualities */}
            {!isMiniPlayer && qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-red-500 transition-colors px-2 py-1 bg-zinc-800/70 rounded-lg text-sm font-medium"
                >
                  {currentQuality === -1 ? 'Auto' : `${qualities[currentQuality]?.height}p`}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[120px]">
                    <button
                      onClick={() => setQuality(-1)}
                      className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                        currentQuality === -1 ? 'text-red-500 font-medium' : 'text-white hover:bg-zinc-800'
                      }`}
                    >
                      Auto
                    </button>
                    {qualities.map((level, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuality(idx)}
                        className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                          currentQuality === idx ? 'text-red-500 font-medium' : 'text-white hover:bg-zinc-800'
                        }`}
                      >
                        {level.height}p
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6zm0 4h8v2H6zm10 0h2v2h-2zm-6-4h8v2h-8z" />
                  </svg>
                </button>
                {showSubtitleMenu && (
                  <div className="absolute bottom-12 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-2xl z-50 min-w-[180px]">
                    <button
                      onClick={() => handleSubtitleSelect('off')}
                      className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                        currentSubtitle === 'off' ? 'text-red-500 font-medium' : 'text-white hover:bg-zinc-800'
                      }`}
                    >
                      Off
                    </button>
                    {subtitles.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-1.5">
                        <button
                          onClick={() => handleSubtitleSelect(sub.lang)}
                          className={`flex-1 text-left rounded-md text-sm ${
                            currentSubtitle === sub.lang ? 'text-red-500 font-medium' : 'text-white hover:bg-zinc-800'
                          }`}
                        >
                          {sub.label}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSubtitle(sub);
                          }}
                          className="ml-2 p-1 hover:bg-zinc-800 rounded text-white"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isMiniPlayer && enableMiniPlayer && (
              <button
                onClick={sendToMiniPlayer}
                className="text-white hover:text-red-500 transition-colors px-2 py-1 bg-zinc-800/70 rounded-lg text-sm font-medium"
              >
                Mini
              </button>
            )}

            {isMiniPlayer && onExpandMiniPlayer && (
              <button
                onClick={onExpandMiniPlayer}
                className="text-white hover:text-red-500 transition-colors px-2 py-1 bg-zinc-800/70 rounded-lg text-sm font-medium"
              >
                Open
              </button>
            )}

            {isMiniPlayer && (
              <button
                onClick={handleCloseMiniPlayer}
                className="text-white hover:text-red-500 transition-colors px-2 py-1 bg-zinc-800/70 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            )}

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="text-white hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
              </svg>
            </button>

            {/* Fullscreen */}
            {!isMiniPlayer && (
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
