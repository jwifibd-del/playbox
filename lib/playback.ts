import type {
  Episode,
  MediaAudioTrack,
  MediaSubtitleTrack,
  Movie,
  MovieSource,
  TVShow,
} from '@/lib/data';

export interface PlaybackSelection {
  url: string;
  type: MovieSource['type'];
  title: string;
  quality?: string;
  sourceLabel?: string;
  audioTracks?: MediaAudioTrack[];
  subtitles?: MediaSubtitleTrack[];
  poster?: string;
  videoId?: string;
}

const PLAYBACK_TYPE_PRIORITY: Array<MovieSource['type']> = [
  'HLS',
  'M3U8',
  'MP4',
  'WebM',
  'TS',
  'Local Storage',
  'YouTube URL',
  'Embed URL',
  'MKV',
  'RTMP',
];

function normalizeSourceType(type?: string): PlaybackSelection['type'] | null {
  if (!type) return null;

  const knownTypes = new Set<string>(PLAYBACK_TYPE_PRIORITY);
  return knownTypes.has(type) ? (type as PlaybackSelection['type']) : null;
}

function scoreSource(type: string): number {
  const normalized = normalizeSourceType(type);
  if (!normalized) return PLAYBACK_TYPE_PRIORITY.length + 1;

  const index = PLAYBACK_TYPE_PRIORITY.indexOf(normalized);
  return index === -1 ? PLAYBACK_TYPE_PRIORITY.length + 1 : index;
}

function selectBestSource(sources: MovieSource[] | undefined): MovieSource | null {
  if (!sources || sources.length === 0) return null;

  return [...sources]
    .filter((source) => source.url)
    .sort((left, right) => scoreSource(left.type) - scoreSource(right.type))[0] ?? null;
}

function guessLangCode(language?: string | null): string {
  if (!language) return 'en';
  const map: Record<string, string> = {
    english: 'en',
    spanish: 'es',
    espanol: 'es',
    french: 'fr',
    francais: 'fr',
    german: 'de',
    deutsch: 'de',
    italian: 'it',
    italiano: 'it',
    portuguese: 'pt',
    portugues: 'pt',
    japanese: 'ja',
    nihongo: 'ja',
    korean: 'ko',
    hangug: 'ko',
    chinese: 'zh',
    mandarin: 'zh',
    hindi: 'hi',
    tamil: 'ta',
    telugu: 'te',
    arabic: 'ar',
    russian: 'ru',
    dutch: 'nl',
    nederlands: 'nl',
  };
  const key = String(language).toLowerCase().trim();
  if (map[key]) return map[key];
  return key.slice(0, 2);
}

function buildDefaultAudioTracks(
  primaryLanguage?: string | null,
  additional?: Array<string | { label?: string; lang?: string; isDefault?: boolean }> | null,
): MediaAudioTrack[] {
  const primaryLang = guessLangCode(primaryLanguage);
  const primaryLabel = primaryLanguage
    ? `${String(primaryLanguage).trim()} Default`
    : 'Default';
  const tracks: MediaAudioTrack[] = [
    {
      id: `audio-${primaryLang}-default`,
      label: `${primaryLabel} (Original)`,
      lang: primaryLang,
      isDefault: true,
    },
  ];

  if (Array.isArray(additional)) {
    additional.forEach((extra, i) => {
      if (typeof extra === 'string') {
        const label = extra.trim();
        if (!label) return;
        const lang = guessLangCode(label);
        tracks.push({
          id: `audio-${lang}-${i}`,
          label,
          lang,
          isDefault: false,
        });
      } else if (extra && typeof extra === 'object') {
        const label = extra.label?.trim() || `Alternate ${i + 1}`;
        const lang = extra.lang || guessLangCode(label);
        tracks.push({
          id: `audio-${lang}-${i}`,
          label,
          lang,
          isDefault: Boolean(extra.isDefault),
        });
      }
    });
  }

  return tracks;
}

function mergeAudioTracks(
  explicitTracks: MediaAudioTrack[] | undefined,
  fallbackTracks: MediaAudioTrack[],
): MediaAudioTrack[] {
  if (explicitTracks && explicitTracks.length > 0) {
    return explicitTracks.some((t) => t.isDefault)
      ? explicitTracks
      : explicitTracks.map((t, i) => (i === 0 ? { ...t, isDefault: true } : t));
  }
  return fallbackTracks;
}

export function getPreferredMoviePlayback(movie: Movie | null | undefined): PlaybackSelection | null {
  if (!movie) return null;

  const defaultTracks = buildDefaultAudioTracks(movie.language);
  const bestSource = selectBestSource(movie.sources);
  if (bestSource) {
    return {
      url: bestSource.url,
      type: bestSource.type,
      title: movie.title,
      quality: bestSource.quality || movie.quality,
      sourceLabel: bestSource.title,
      audioTracks: mergeAudioTracks(bestSource.audioTracks, defaultTracks),
      subtitles: bestSource.subtitles,
      poster: movie.backdropPath,
      videoId: `movie-${movie.id}`,
    };
  }

  if (movie.trailerUrl) {
    return {
      url: movie.trailerUrl,
      type: 'YouTube URL',
      title: `${movie.title} Trailer`,
      quality: movie.quality,
      sourceLabel: 'Trailer',
      audioTracks: defaultTracks,
      poster: movie.backdropPath,
      videoId: `movie-${movie.id}-trailer`,
    };
  }

  return null;
}

export function getPreferredEpisodePlayback(
  show: TVShow | null | undefined,
  episode: Episode | null | undefined,
): PlaybackSelection | null {
  if (!show || !episode) return null;

  const defaultTracks = buildDefaultAudioTracks(show.language ?? null);
  const bestSource = selectBestSource(episode.sources);
  if (bestSource) {
    return {
      url: bestSource.url,
      type: bestSource.type,
      title: `${show.title} - ${episode.title}`,
      quality: bestSource.quality || show.quality,
      sourceLabel: bestSource.title,
      audioTracks: mergeAudioTracks(bestSource.audioTracks, defaultTracks),
      subtitles: bestSource.subtitles,
      poster: episode.thumbnailPath || show.backdropPath,
      videoId: `tv-${show.id}-episode-${episode.id}`,
    };
  }

  if (show.trailerUrl) {
    return {
      url: show.trailerUrl,
      type: 'YouTube URL',
      title: `${show.title} Trailer`,
      quality: show.quality,
      sourceLabel: 'Trailer',
      audioTracks: defaultTracks,
      poster: show.backdropPath,
      videoId: `tv-${show.id}-trailer`,
    };
  }

  return null;
}
