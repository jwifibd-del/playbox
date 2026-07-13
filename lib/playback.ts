import type {
  Episode,
  LiveTVChannel,
  MediaAudioTrack,
  MediaSubtitleTrack,
  Movie,
  MovieSource,
  TVShow,
} from '@/lib/data';

export interface PlaybackSelection {
  url: string;
  type: MovieSource['type'] | LiveTVChannel['streamType'];
  title: string;
  quality?: string;
  sourceLabel?: string;
  audioTracks?: MediaAudioTrack[];
  subtitles?: MediaSubtitleTrack[];
  poster?: string;
  videoId?: string;
}

const PLAYBACK_TYPE_PRIORITY: Array<MovieSource['type'] | LiveTVChannel['streamType']> = [
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

export function getPreferredMoviePlayback(movie: Movie | null | undefined): PlaybackSelection | null {
  if (!movie) return null;

  const bestSource = selectBestSource(movie.sources);
  if (bestSource) {
    return {
      url: bestSource.url,
      type: bestSource.type,
      title: movie.title,
      quality: bestSource.quality || movie.quality,
      sourceLabel: bestSource.title,
      audioTracks: bestSource.audioTracks,
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

  const bestSource = selectBestSource(episode.sources);
  if (!bestSource) return null;

  return {
    url: bestSource.url,
    type: bestSource.type,
    title: `${show.title} - ${episode.title}`,
    quality: bestSource.quality || show.quality,
    sourceLabel: bestSource.title,
    audioTracks: bestSource.audioTracks,
    subtitles: bestSource.subtitles,
    poster: episode.thumbnailPath || show.backdropPath,
    videoId: `tv-${show.id}-episode-${episode.id}`,
  };
}

export function getLiveChannelPlayback(channel: LiveTVChannel | null | undefined): PlaybackSelection | null {
  if (!channel?.streamUrl) return null;

  return {
    url: channel.streamUrl,
    type: channel.streamType,
    title: channel.name,
    sourceLabel: channel.genre,
    poster: channel.posterPath || undefined,
    videoId: `live-tv-${channel.id}`,
  };
}
