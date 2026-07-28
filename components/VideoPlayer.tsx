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

function isHlsStreamUrl(src: string, sourceType?: MediaSourceType): boolean {
  if (sourceType === 'HLS' || sourceType === 'M3U8') return true;
  try {
    const url = new URL(src);
    if (url.pathname.toLowerCase().endsWith('.m3u8')) return true;
    return url.searchParams.toString().toLowerCase().includes('.m3u8');
  } catch {
    return src.toLowerCase().includes('.m3u8');
  }
}

function buildHlsProxyUrl(src: string): string {
  return `/api/hls-proxy?u=${encodeURIComponent(src)}`;
}

function getYouTubeEmbedUrl(url: string, options?: { lang?: string | null }): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      playsinline: '1',
      mute: '0',
      enablejsapi: '1',
      modestbranding: '1',
      fs: '1',
      controls: '1',
    });
    if (options?.lang && options.lang !== 'und') {
      const iso = String(options.lang).toLowerCase();
      params.set('hl', iso);            // YouTube interface language
      params.set('cc_lang_pref', iso);  // Preferred subtitle/audio language
      params.set('cc_load_policy', '1');
    }
    try {
      if (typeof window !== 'undefined' && window.location?.origin) {
        params.set('origin', window.location.origin);
      }
    } catch {
      // ignore window errors in non-browser environments
    }

    let videoId: string | null = null;
    if (hostname.includes('youtu.be')) {
      videoId = parsedUrl.pathname.replace('/', '');
    } else if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/embed/')) {
        const parts = parsedUrl.pathname.replace('/embed/', '').split('/');
        videoId = parts[0];
      } else {
        videoId = parsedUrl.searchParams.get('v');
      }
    }

    if (!videoId) {
      // If it's already an embed URL, just reapply params
      if (hostname.includes('youtube.com') && parsedUrl.pathname.startsWith('/embed/')) {
        return `${parsedUrl.origin}${parsedUrl.pathname}?${params.toString()}`;
      }
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch {
    return null;
  }
}

function getExternalSource(
  url: string,
  sourceType?: VideoPlayerProps['sourceType'],
  options?: { lang?: string | null },
): { type: ExternalPlayerType; url: string } | null {
  if (!url) return null;

  const youtubeUrl = getYouTubeEmbedUrl(url, options);
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<any | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const miniTransferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeRef = useRef(0);
  const hlsRecoveryAttemptsRef = useRef(0);
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
  const [hasNativeAudioSwitching, setHasNativeAudioSwitching] = useState(false);
  const [audioToast, setAudioToast] = useState<{ label: string; lang: string; mode: 'youtube' | 'native' | 'metadata' } | null>(null);
  const [showCastMenu, setShowCastMenu] = useState(false);
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castTo, setCastTo] = useState<'airplay' | 'chromecast' | null>(null);
  const [showMiniTransferNotice, setShowMiniTransferNotice] = useState(false);
  const [hlsError, setHlsError] = useState<string | null>(null);
  const [playbackAttempt, setPlaybackAttempt] = useState(0);
  const [useHlsProxy, setUseHlsProxy] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isInPictureInPicture, setIsInPictureInPicture] = useState(false);
  const currentSelectedAudioTrack = useMemo<MediaAudioTrack | null>(
    () => availableAudioTracks.find((t) => t.id === currentAudioTrack) ?? null,
    [availableAudioTracks, currentAudioTrack],
  );
  const externalSource = useMemo(
    () => getExternalSource(src, sourceType, { lang: currentSelectedAudioTrack?.lang ?? null }),
    [src, sourceType, currentSelectedAudioTrack],
  );
  const isYouTubePlayback = Boolean(externalSource?.type === 'youtube' || sourceType === 'YouTube URL');

  const isVideoMetadataReady = (video: HTMLVideoElement): boolean => {
    return video.readyState >= 1 || Number.isFinite(video.duration) && video.duration > 0;
  };

  const waitForMetadata = (video: HTMLVideoElement): Promise<void> => {
    if (isVideoMetadataReady(video)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout waiting for video metadata'));
      }, 10000);

      const onLoadedMetadata = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('Video error while waiting for metadata'));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('error', onError);
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);
    });
  };

  const getHlsErrorMessage = (data: { type?: string; details?: string }): string => {
    switch (data.details) {
      case 'manifestLoadError':
      case 'manifestLoadTimeOut':
        return 'This live channel is unavailable right now.';
      case 'levelLoadError':
      case 'levelLoadTimeOut':
      case 'audioTrackLoadError':
      case 'audioTrackLoadTimeOut':
      case 'fragLoadError':
      case 'fragLoadTimeOut':
        return 'The stream stopped responding while loading.';
      default:
        break;
    }

    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
      return 'Network error: Could not connect to stream.';
    }

    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
      return 'Media error: Could not decode stream.';
    }

    return 'Failed to load stream.';
  };

  const handleHlsError = (player: Hls, data: { fatal: boolean; type: string; details?: string }) => {
    console.error('HLS error:', data);

    const isBufferStall =
      data.details === 'bufferStalledError' ||
      data.details === 'bufferFullError' ||
      data.details === 'bufferSeekOverHole' ||
      data.details === 'bufferNudgeOnStall';

    const isRecoverableNetworkError =
      (data.fatal || isBufferStall) &&
      (data.type === Hls.ErrorTypes.NETWORK_ERROR ||
        data.details?.includes('LoadError') ||
        data.details?.includes('LoadTimeOut'));

    if (isRecoverableNetworkError && !useHlsProxy && isHlsStreamUrl(src, sourceType)) {
      setHlsError(null);
      setUseHlsProxy(true);
      setPlaybackAttempt((currentAttempt) => currentAttempt + 1);
      return;
    }

    if (isBufferStall && useHlsProxy && isHlsStreamUrl(src, sourceType)) {
      if (hlsRecoveryAttemptsRef.current < 1) {
        hlsRecoveryAttemptsRef.current += 1;
        setPlaybackAttempt((currentAttempt) => currentAttempt + 1);
        return;
      }
    }

    const errorMessage = getHlsErrorMessage(data);

    if (data.type === Hls.ErrorTypes.MEDIA_ERROR && data.fatal) {
      if (hlsRecoveryAttemptsRef.current < 1) {
        hlsRecoveryAttemptsRef.current += 1;
        player.recoverMediaError();
        return;
      }
    }

    if (data.fatal) {
      player.stopLoad();
    }

    setHlsError(errorMessage);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isHlsStreamUrl(src, sourceType)) {
      setUseHlsProxy(false);
      return;
    }
    try {
      const target = new URL(src);
      const isMixedContent = window.location.protocol === 'https:' && target.protocol === 'http:';
      const isCrossOrigin = target.origin !== window.location.origin;
      setUseHlsProxy(isMixedContent || isCrossOrigin);
    } catch {
      setUseHlsProxy(false);
    }
  }, [src, sourceType]);

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

  // Load audio tracks from prop (declared metadata for current source).
  // If native audio tracks are also present, cross-reference and carry hlsIndex through.
  useEffect(() => {
    const nativeTracks =
      (videoRef.current as VideoWithOptionalAudioTracks | null)?.audioTracks ?? null;
    const nativeCount = nativeTracks ? nativeTracks.length : 0;

    if (nativeCount > 1) {
      setHasNativeAudioSwitching(true);
    }

    if (audioTracks.length === 0) {
      if (nativeTracks && nativeTracks.length > 0 && availableAudioTracks.length === 0) {
        const mapped = mapNativeAudioTracks(videoRef.current as HTMLVideoElement);
        setAvailableAudioTracks(mapped);
        if (mapped.length > 0) {
          const firstEnabled =
            mapped.find((t) => {
              const idx = typeof t.hlsIndex === 'number' ? t.hlsIndex : -1;
              return idx >= 0 && nativeTracks[idx]?.enabled;
            }) ?? mapped[0];
          setCurrentAudioTrack(firstEnabled.id);
        }
      }
      return;
    }

    const mergedTracks = audioTracks.map((track, idx) => {
      if (typeof track.hlsIndex === 'number') {
        return track;
      }
      let nativeIndex: number | undefined;
      if (nativeTracks && nativeTracks.length > 0) {
        for (let n = 0; n < nativeTracks.length; n += 1) {
          const nt = nativeTracks[n];
          if (!nt) continue;
          const sameLang = track.lang && nt.language && track.lang.toLowerCase() === nt.language.toLowerCase();
          const sameLabel = nt.label && track.label.toLowerCase() === String(nt.label).toLowerCase();
          const fallbackSameIdx = idx === n;
          if (sameLang || sameLabel || fallbackSameIdx) {
            nativeIndex = n;
            break;
          }
        }
      }
      return { ...track, hlsIndex: nativeIndex };
    });

    setAvailableAudioTracks(mergedTracks);
    const defaultTrack =
      mergedTracks.find((track) => track.isDefault && track.id === currentAudioTrack) ||
      mergedTracks.find((track) => track.isDefault) ||
      mergedTracks[0];
    if (defaultTrack) {
      setCurrentAudioTrack((prev) => {
        const alreadySelected =
          prev && mergedTracks.some((t) => t.id === prev);
        return alreadySelected ? prev : defaultTrack.id;
      });
      // Try to immediately switch the native audio track to the default
      // so the video element selection reflects the declared metadata.
      if (typeof defaultTrack.hlsIndex === 'number' && videoRef.current) {
        const vTracks = (videoRef.current as VideoWithOptionalAudioTracks).audioTracks;
        if (vTracks && vTracks.length > defaultTrack.hlsIndex) {
          for (let i = 0; i < vTracks.length; i += 1) {
            const vt = vTracks[i];
            if (vt) vt.enabled = i === defaultTrack.hlsIndex;
          }
        }
      } else if (hlsRef.current && typeof defaultTrack.hlsIndex === 'number') {
        hlsRef.current.audioTrack = defaultTrack.hlsIndex;
      }
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
    return () => {
      if (audioToastTimeoutRef.current) {
        clearTimeout(audioToastTimeoutRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    setHlsError(null);
    hlsRecoveryAttemptsRef.current = 0;
    setIsMetadataLoaded(false);
  }, [src, sourceType, playbackAttempt]);

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

    const isHlsStream = isHlsStreamUrl(src, sourceType);
    const resolvedSrc = isHlsStream && useHlsProxy ? buildHlsProxyUrl(src) : src;

    if (Hls.isSupported() && isHlsStream) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        startLevel: -1,
        debug: false,
      });
      hlsRef.current = hls;
      hlsRecoveryAttemptsRef.current = 0;
      
      hls.loadSource(resolvedSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setQualities(hls.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          width: level.width,
          name: level.name,
          level: index
        })));
        setHlsError(null);
        hlsRecoveryAttemptsRef.current = 0;
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
          setHasNativeAudioSwitching(nextTracks.length > 1);
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
        handleHlsError(hls, data);
      });
    } else if (isHlsStream) {
      // Native HLS support (Safari, iOS, etc.)
      video.src = resolvedSrc;
      if (autoplay) {
        video.play().catch(() => { /* Autoplay may be blocked */ });
      }
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
        setHasNativeAudioSwitching(nativeTracks.length > 1);
        // Merge with prop-declared tracks (declared metadata wins for labels)
        if (audioTracks && audioTracks.length > 0) {
          const merged = audioTracks.map((declared, i) => {
            const native = nativeTracks.find((t) => {
              const idx = typeof t.hlsIndex === 'number' ? t.hlsIndex : -1;
              return idx === i || (t.lang && declared.lang && t.lang.toLowerCase() === declared.lang.toLowerCase());
            });
            return { ...declared, hlsIndex: native?.hlsIndex ?? (i < nativeTracks.length ? i : declared.hlsIndex) };
          });
          setAvailableAudioTracks(merged);
          const defaultTrack = merged.find((t) => t.isDefault) ?? merged[0];
          if (defaultTrack) setCurrentAudioTrack(defaultTrack.id);
        } else {
          setAvailableAudioTracks(nativeTracks);
          const selectedTrack = nativeTracks.find((track) => track.isDefault) || nativeTracks[0];
          if (selectedTrack) {
            setCurrentAudioTrack(selectedTrack.id);
          }
        }
      }
    }

    // Event listeners
    // Note: play/pause/timeupdate/loadedmetadata/ended are handled via JSX props on the video element
    // to avoid duplicate handler invocations. Only attach addEventListener for events without JSX equivalents.
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleRateChange = () => setPlaybackRate(video.playbackRate);
    const handleEnterPiP = () => setIsInPictureInPicture(true);
    const handleLeavePiP = () => setIsInPictureInPicture(false);

    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      dashRef.current?.reset();
      dashRef.current = null;
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [audioTracks, externalSource, src, autoplay, drmConfig, enableAutoRefresh, autoRefreshInterval, sourceType, playbackAttempt, useHlsProxy]);

  // Auto-refresh for streams
  useEffect(() => {
    if (!enableAutoRefresh) return;

    const refreshStream = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;
      const isHlsStream = isHlsStreamUrl(src, sourceType);
      const resolvedSrc = isHlsStream && useHlsProxy ? buildHlsProxyUrl(src) : src;

      if (hlsRef.current) {
        hlsRef.current.loadSource(resolvedSrc);
        hlsRef.current.attachMedia(video);
      } else if (dashRef.current) {
        dashRef.current.attachSource(src);
      } else {
        video.src = resolvedSrc;
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
  }, [enableAutoRefresh, autoRefreshInterval, src, sourceType, useHlsProxy]);

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
      if (isInPictureInPicture || document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      const video = videoRef.current;
      if (!video) {
        return;
      }

      if (!isVideoMetadataReady(video)) {
        try {
          await waitForMetadata(video);
        } catch (waitError) {
          console.error('PiP: Video metadata not ready in time:', waitError);
          return;
        }
      }

      if (video.disablePictureInPicture) {
        console.error('PiP: Picture in Picture is disabled for this video');
        return;
      }

      await video.requestPictureInPicture();
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

    if (selectedTrack) {
      const effectiveIndex: number | undefined =
        typeof selectedTrack.hlsIndex === 'number' ? selectedTrack.hlsIndex : undefined;
      if (hlsRef.current && typeof effectiveIndex === 'number') {
        hlsRef.current.audioTrack = effectiveIndex;
      } else if (videoRef.current) {
        const nativeTracks = (videoRef.current as VideoWithOptionalAudioTracks).audioTracks;
        if (nativeTracks && nativeTracks.length > 0) {
          const declaredIdx =
            typeof effectiveIndex === 'number'
              ? effectiveIndex
              : availableAudioTracks.findIndex((t) => t.id === trackId);
          const idxToUse =
            declaredIdx >= 0 && declaredIdx < nativeTracks.length ? declaredIdx : 0;
          for (let index = 0; index < nativeTracks.length; index += 1) {
            const nativeTrack = nativeTracks[index];
            if (nativeTrack) {
              nativeTrack.enabled = index === idxToUse;
            }
          }
        }
      }

      // YouTube iframe: send postMessage commands to the embed (captions/language)
      if (isYouTubePlayback && iframeRef.current?.contentWindow) {
        const langCode = String(selectedTrack.lang || 'en').toLowerCase();
        try {
          const commands: Array<[string, unknown[]]> = [
            ['setOption', ['captions', 'track', { languageCode: langCode }]],
            ['setOption', ['captions', 'module', { language: langCode }]],
          ];
          commands.forEach(([func, args]) => {
            try {
              iframeRef.current?.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func, args: args ?? [] }),
                'https://www.youtube.com',
              );
            } catch {
              // ignore cross-origin posting failures
            }
          });
        } catch {
          // ignore postMessage errors
        }
      }
    }

    setCurrentAudioTrack(trackId);
    setShowAudioTrackMenu(false);

    // Show a visible on-screen confirmation toast so user KNOWS the switch happened
    const label = selectedTrack?.label || trackId;
    const lang = selectedTrack?.lang || 'und';
    const mode: 'youtube' | 'native' | 'metadata' = isYouTubePlayback
      ? 'youtube'
      : hasNativeAudioSwitching
      ? 'native'
      : 'metadata';
    setAudioToast({ label, lang, mode });

    if (audioToastTimeoutRef.current) {
      clearTimeout(audioToastTimeoutRef.current);
    }
    audioToastTimeoutRef.current = setTimeout(() => setAudioToast(null), 2500);
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
  };

  const stopCasting = () => {
    setIsCasting(false);
    setCastTo(null);
  };

  const retryHlsStream = () => {
    setHlsError(null);
    hlsRecoveryAttemptsRef.current = 0;
    setPlaybackAttempt((currentAttempt) => currentAttempt + 1);
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
    setIsMetadataLoaded(true);

    if (!hlsRef.current) {
      const nativeTracks = mapNativeAudioTracks(videoRef.current);
      const nativeHasSwitching = nativeTracks.length > 1;
      if (nativeTracks.length > 0) {
        setHasNativeAudioSwitching(nativeHasSwitching || hasNativeAudioSwitching);
        // Merge with prop-declared tracks (declared metadata wins for labels)
        if (audioTracks && audioTracks.length > 0) {
          const merged = audioTracks.map((declared, i) => {
            const native = nativeTracks.find((t) => {
              const idx = typeof t.hlsIndex === 'number' ? t.hlsIndex : -1;
              return idx === i || (t.lang && declared.lang && t.lang.toLowerCase() === declared.lang.toLowerCase());
            });
            return { ...declared, hlsIndex: native?.hlsIndex ?? (i < nativeTracks.length ? i : declared.hlsIndex) };
          });
          setAvailableAudioTracks(merged);
          setCurrentAudioTrack((prev) => {
            if (prev && merged.some((t) => t.id === prev)) return prev;
            return (merged.find((t) => t.isDefault) ?? merged[0])?.id ?? prev;
          });
        } else {
          setAvailableAudioTracks(nativeTracks);
          const selectedTrack = nativeTracks.find((track) => track.isDefault) || nativeTracks[0];
          if (selectedTrack) {
            setCurrentAudioTrack((prev) => {
              const alreadyOk = prev && nativeTracks.some((t) => t.id === prev);
              return alreadyOk ? prev : selectedTrack.id;
            });
          }
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
            key={`${externalSource.url}::${currentSelectedAudioTrack?.lang ?? 'und'}`}
            ref={(el) => {
              iframeRef.current = el;
            }}
            src={externalSource.url}
            title={title || 'PlayFlix Video Player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => {
              // Re-fire postMessage commands when iframe finishes reloading
              // with new language params so the YT embed picks them up immediately.
              if (isYouTubePlayback && iframeRef.current?.contentWindow) {
                const lang = currentSelectedAudioTrack?.lang || 'en';
                const langCode = String(lang).toLowerCase();
                try {
                  const commands: Array<[string, unknown[]]> = [
                    ['setOption', ['captions', 'track', { languageCode: langCode }]],
                    ['setOption', ['captions', 'module', { language: langCode }]],
                  ];
                  commands.forEach(([func, args]) => {
                    try {
                      iframeRef.current?.contentWindow?.postMessage(
                        JSON.stringify({ event: 'command', func, args: args ?? [] }),
                        'https://www.youtube.com',
                      );
                    } catch {
                      // ignore
                    }
                  });
                } catch {
                  // ignore
                }
              }
            }}
            className="absolute inset-0 h-full w-full"
          />
          {audioToast && (
            <div
              className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 animate-[slideDownFade_0.3s_ease-out]"
              role="status"
            >
              <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-zinc-900/85 px-4 py-2 shadow-2xl backdrop-blur-xl">
                <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V6H13c-.26 2.07-.93 4.04-1.99 5.72L8.2 8.96l-1.46 1.46L11.45 15l1.42.07zm8.29-3.95l2.86-2.86-1.43-1.43-2.86 2.86-2.86-2.86-1.43 1.43 2.86 2.86-2.86 2.86 1.43 1.43 2.86-2.86 2.86 2.86 1.43-1.43-2.86-2.86zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">Audio</p>
                  <p className="text-sm text-zinc-100">{audioToast.label}</p>
                  <span className="rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                    {audioToast.lang}
                  </span>
                  {audioToast.mode === 'youtube' && (
                    <span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-300/90">
                      YouTube
                    </span>
                  )}
                  {audioToast.mode === 'native' && (
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300/90">
                      Live
                    </span>
                  )}
                  {audioToast.mode === 'metadata' && (
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300/90">
                      Metadata
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
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
      {hlsError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/90">
          <div className="text-center max-w-md">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-white text-xl font-semibold mb-2">Stream Error</h3>
            <p className="text-zinc-400 mb-6">{hlsError}</p>
            <button
              onClick={retryHlsStream}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Retry Stream
            </button>
          </div>
        </div>
      ) : (
        (() => {
          const isHlsStream = isHlsStreamUrl(src, sourceType);
          const resolvedSrc = isHlsStream && useHlsProxy ? buildHlsProxyUrl(src) : src;
          const shouldSetSrc = !isHlsStream || !Hls.isSupported();
          return (
            <video
              key={`video-${videoId}-${playbackAttempt}`}
              ref={videoRef}
              {...(shouldSetSrc ? { src: resolvedSrc } : {})}
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
              onError={(e) => {
                console.error('Video element error:', e);
                setHlsError('Video error: Could not load or play the stream');
              }}
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
          );
        })()
      )}

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

      {audioToast && (
        <div
          className="pointer-events-none absolute top-4 left-1/2 z-40 -translate-x-1/2 animate-[slideDownFade_0.3s_ease-out]"
          role="status"
        >
          <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-zinc-900/85 px-4 py-2 shadow-2xl backdrop-blur-xl">
            <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V6H13c-.26 2.07-.93 4.04-1.99 5.72L8.2 8.96l-1.46 1.46L11.45 15l1.42.07zm8.29-3.95l2.86-2.86-1.43-1.43-2.86 2.86-2.86-2.86-1.43 1.43 2.86 2.86-2.86 2.86 1.43 1.43 2.86-2.86 2.86 2.86 1.43-1.43-2.86-2.86zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">Audio</p>
              <p className="text-sm text-zinc-100">{audioToast.label}</p>
              <span className="rounded border border-zinc-700 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                {audioToast.lang}
              </span>
              {audioToast.mode === 'native' && (
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300/90">
                  Live
                </span>
              )}
              {audioToast.mode === 'metadata' && (
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300/90">
                  Metadata
                </span>
              )}
            </div>
          </div>
        </div>
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
            <div className="relative">
              <button
                onClick={() => setShowAudioTrackMenu(!showAudioTrackMenu)}
                className={`flex items-center gap-1.5 transition-colors ${
                  availableAudioTracks.length > 0
                    ? 'text-white hover:text-red-500'
                    : 'text-zinc-500 hover:text-zinc-300 cursor-not-allowed'
                }`}
                aria-label={`Audio tracks${availableAudioTracks.length > 0 ? `: ${availableAudioTracks.length} available` : ': none available'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V6H13c-.26 2.07-.93 4.04-1.99 5.72L8.2 8.96l-1.46 1.46L11.45 15l1.42.07zm8.29-3.95l2.86-2.86-1.43-1.43-2.86 2.86-2.86-2.86-1.43 1.43 2.86 2.86-2.86 2.86 1.43 1.43 2.86-2.86 2.86 2.86 1.43-1.43-2.86-2.86zM11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                </svg>
                {availableAudioTracks.length > 0 && (
                  <span className="hidden sm:inline text-xs font-medium tabular-nums">
                    {availableAudioTracks.length}
                  </span>
                )}
              </button>
              {showAudioTrackMenu && (
                <div className="absolute bottom-12 right-0 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl p-2 shadow-2xl z-50 min-w-[240px]">
                  <div className="px-3 py-2 mb-1 border-b border-zinc-800 flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Audio Languages</p>
                    {isYouTubePlayback && (
                      <span className="text-[10px] font-medium text-white/70 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/20">
                        YouTube
                      </span>
                    )}
                    {!isYouTubePlayback && !hasNativeAudioSwitching && availableAudioTracks.length > 0 && (
                      <span className="text-[10px] font-medium text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Metadata
                      </span>
                    )}
                    {!isYouTubePlayback && hasNativeAudioSwitching && availableAudioTracks.length > 0 && (
                      <span className="text-[10px] font-medium text-emerald-300/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Live Switching
                      </span>
                    )}
                  </div>
                  {availableAudioTracks.length > 0 ? (
                    <>
                      <div className="max-h-72 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {availableAudioTracks.map(track => (
                          <button
                            key={track.id}
                            onClick={() => selectAudioTrack(track.id)}
                            className={`flex w-full items-center justify-between gap-3 text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                              currentAudioTrack === track.id
                                ? 'text-red-500 font-semibold bg-red-500/10'
                                : 'text-zinc-200 hover:bg-zinc-800/80'
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              {currentAudioTrack === track.id && (
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                              )}
                              <span className="truncate">{track.label}</span>
                            </span>
                            <span className="flex items-center gap-1.5 flex-shrink-0">
                              {track.lang && track.lang !== 'und' && (
                                <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                                  {track.lang}
                                </span>
                              )}
                              {track.isDefault && (
                                <span className="text-[9px] uppercase tracking-wider text-red-400/90 font-semibold border border-red-500/30 rounded px-1.5 py-0.5 bg-red-500/10">
                                  Default
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-zinc-800 px-3 pb-1">
                        {isYouTubePlayback ? (
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Language preference is sent to the YouTube player. Switching happens inside the YouTube iframe.
                          </p>
                        ) : hasNativeAudioSwitching ? (
                          <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                            Stream has real alternate audio tracks. Selections switch audio instantly.
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-300/80 leading-relaxed">
                            Current file contains a single audio stream. These languages are declared in the source metadata.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="px-3 py-4">
                      <p className="text-sm text-zinc-500 text-center">
                        No alternate audio tracks detected. Loaded streams with multiple language tracks will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
              disabled={!isMetadataLoaded && !isInPictureInPicture}
              className={`transition-colors ${
                !isMetadataLoaded && !isInPictureInPicture
                  ? 'text-zinc-600 cursor-not-allowed'
                  : 'text-white hover:text-red-500'
              }`}
              title={!isMetadataLoaded && !isInPictureInPicture ? 'Waiting for video to load...' : 'Picture in Picture'}
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
