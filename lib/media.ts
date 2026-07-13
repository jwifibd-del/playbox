export type TrailerBackgroundSource =
  | {
      kind: 'youtube';
      src: string;
    }
  | {
      kind: 'video';
      src: string;
      mimeType: string;
    };

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('youtu.be')) {
      return parsedUrl.pathname.replace('/', '') || null;
    }

    if (hostname.includes('youtube.com')) {
      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/embed/')[1] || null;
      }

      return parsedUrl.searchParams.get('v');
    }
  } catch {
    return null;
  }

  return null;
}

function getMimeType(url: string): string {
  const normalized = url.toLowerCase();

  if (normalized.endsWith('.webm')) return 'video/webm';
  if (normalized.endsWith('.m3u8')) return 'application/x-mpegURL';

  return 'video/mp4';
}

export function getTrailerBackgroundSource(
  trailerUrl?: string | null,
  muted = true,
): TrailerBackgroundSource | null {
  if (!trailerUrl) return null;

  const youtubeVideoId = getYouTubeVideoId(trailerUrl);
  if (youtubeVideoId) {
    const embedUrl = new URL(`https://www.youtube.com/embed/${youtubeVideoId}`);
    embedUrl.searchParams.set('autoplay', '1');
    embedUrl.searchParams.set('mute', muted ? '1' : '0');
    embedUrl.searchParams.set('controls', '0');
    embedUrl.searchParams.set('loop', '1');
    embedUrl.searchParams.set('playlist', youtubeVideoId);
    embedUrl.searchParams.set('rel', '0');
    embedUrl.searchParams.set('modestbranding', '1');
    embedUrl.searchParams.set('playsinline', '1');
    embedUrl.searchParams.set('iv_load_policy', '3');

    return {
      kind: 'youtube',
      src: embedUrl.toString(),
    };
  }

  const normalized = trailerUrl.toLowerCase();
  if (
    normalized.endsWith('.mp4') ||
    normalized.endsWith('.webm') ||
    normalized.endsWith('.m3u8')
  ) {
    return {
      kind: 'video',
      src: trailerUrl,
      mimeType: getMimeType(trailerUrl),
    };
  }

  return null;
}
