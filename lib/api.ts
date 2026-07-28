import {
  Movie,
  sampleMovies,
  getAIRecommendations,
  sampleTVShows,
  getMovies,
  getTVShows,
  TVShow,
  normalizeRating,
  MovieSource,
  MediaAudioTrack,
  MediaSubtitleTrack,
  Episode,
  TvChannel,
  sampleTvChannels,
  getTvChannels,
} from './data';

export const API_BASE = 'http://localhost:3002';

let backendAvailable: boolean | null = null;

export function getAdminAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...(extra || {}) };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...(extra || {}) };
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('playflix_token');
    const token = adminToken || userToken;
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

function mergeById<T extends { id: string | number; rating?: unknown }>(
  sources: Array<T[] | undefined | null>,
  priority: 'backend-first' | 'local-first' = 'backend-first',
): T[] {
  const map = new Map<string, T>();
  const ordered = priority === 'backend-first' ? [...sources].reverse() : sources;
  for (const list of ordered) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || item.id === undefined || item.id === null) continue;
      const key = String(item.id);
      const existing = map.get(key);
      map.set(key, existing ? { ...existing, ...item } : { ...item });
    }
  }
  return Array.from(map.values()).map((entity) => {
    if (entity && typeof entity === 'object' && 'rating' in entity) {
      (entity as any).rating = normalizeRating((entity as any).rating, 8.0);
    }
    return entity;
  });
}

export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed');
  }
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function sendOtp(email: string) {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send OTP');
  }
  return res.json();
}

export async function loginWithOtp(email: string, otp: string) {
  const res = await fetch(`${API_BASE}/auth/login-with-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'OTP login failed');
  }
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send reset link');
  }
  return res.json();
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to reset password');
  }
  return res.json();
}

function mapAudioTrackStringsToObjects(audioTrackStrings: string[] | undefined): MediaAudioTrack[] {
  if (!audioTrackStrings || audioTrackStrings.length === 0) {
    return [];
  }
  return audioTrackStrings.map((raw, index) => {
    if (typeof raw === 'object' && raw !== null) {
      return raw as MediaAudioTrack;
    }
    const trimmed = String(raw).trim();
    if (!trimmed) {
      return {
        id: `audio-${index}`,
        label: `Track ${index + 1}`,
        lang: 'und',
        isDefault: index === 0,
      };
    }
    const parts = trimmed.split(/[|:]/).map((p) => p.trim()).filter(Boolean);
    const label = parts[0] || `Track ${index + 1}`;
    const lang = parts[1] || label.toLowerCase().split(' ')[0] || 'und';
    return {
      id: `audio-${index}-${lang}`,
      label,
      lang,
      isDefault: index === 0,
    };
  });
}

function mapSubtitleStringsToObjects(subtitleTrackStrings: string[] | undefined): MediaSubtitleTrack[] {
  if (!subtitleTrackStrings || subtitleTrackStrings.length === 0) {
    return [];
  }
  return subtitleTrackStrings.map((raw, index) => {
    if (typeof raw === 'object' && raw !== null) {
      return raw as MediaSubtitleTrack;
    }
    const trimmed = String(raw).trim();
    if (!trimmed) {
      return { label: `Subtitle ${index + 1}`, lang: 'und', src: '' };
    }
    const parts = trimmed.split(/[|:]/).map((p) => p.trim()).filter(Boolean);
    const label = parts[0] || `Subtitle ${index + 1}`;
    const lang = parts[1] || label.toLowerCase().split(' ')[0] || 'und';
    const src = parts[2] || '';
    return { label, lang, src };
  });
}

function pickVideoUrl(video: any): string {
  return (
    video?.hlsManifestPath ||
    video?.dashManifestPath ||
    video?.originalPath ||
    video?.url ||
    ''
  );
}

function guessSourceType(video: any): MovieSource['type'] {
  const url = pickVideoUrl(video);
  if (!url) return 'MP4';
  const path = url.toLowerCase().split('?')[0];
  if (path.endsWith('.m3u8')) return 'HLS';
  if (path.endsWith('.mpd')) return 'HLS';
  if (path.endsWith('.webm')) return 'WebM';
  if (path.endsWith('.mkv')) return 'MKV';
  if (path.endsWith('.ts')) return 'TS';
  if (path.includes('youtube') || path.includes('youtu.be')) return 'YouTube URL';
  if (path.endsWith('.mp4')) return 'MP4';
  return 'MP4';
}

function mapBackendVideosToSources(backendVideos: any[] | undefined): MovieSource[] {
  if (!Array.isArray(backendVideos) || backendVideos.length === 0) {
    return [];
  }
  return backendVideos
    .map((video, index) => {
      const url = pickVideoUrl(video);
      if (!url) return null;
      const audioTracks = mapAudioTrackStringsToObjects(video?.audioTracks);
      const subtitles = mapSubtitleStringsToObjects(video?.subtitleTracks);
      const type = guessSourceType(video);
      const quality = (Array.isArray(video?.qualities) && video.qualities[0]) || video?.quality || '';
      return {
        id: video?.id || `source-${index}`,
        title: video?.title || `Source ${index + 1}`,
        quality,
        size: video?.duration || 'Streaming',
        type,
        isLocal: Boolean(video?.originalPath && !video?.originalPath.startsWith('http')),
        url,
        audioTracks: audioTracks.length > 0 ? audioTracks : undefined,
        subtitles: subtitles.length > 0 ? subtitles : undefined,
      } as MovieSource;
    })
    .filter((s): s is MovieSource => s !== null);
}

function mapBackendEpisodes(backendEpisodes: any[] | undefined): Episode[] {
  if (!Array.isArray(backendEpisodes) || backendEpisodes.length === 0) {
    return [];
  }
  return backendEpisodes.map((ep) => {
    const sources = mapBackendVideosToSources(ep?.videos);
    return {
      ...ep,
      id: ep?.id ?? `ep-${Math.random()}`,
      title: ep?.title ?? 'Untitled Episode',
      overview: ep?.overview ?? '',
      seasonNumber: typeof ep?.seasonNumber === 'number' ? ep.seasonNumber : 1,
      episodeNumber: typeof ep?.episodeNumber === 'number' ? ep.episodeNumber : typeof ep?.number === 'number' ? ep.number : 1,
      runtime: ep?.runtime ?? ep?.duration ?? 0,
      thumbnailPath: ep?.thumbnailPath ?? ep?.stillPath ?? '',
      sources,
    } as Episode;
  });
}

function groupEpisodesToSeasons(episodes: Episode[]): { seasonNumber: number; episodes: Episode[] }[] {
  const map = new Map<number, Episode[]>();
  for (const ep of episodes) {
    const key = ep.seasonNumber ?? 1;
    const list = map.get(key) ?? [];
    list.push(ep);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([seasonNumber, eps]) => ({
      seasonNumber,
      episodes: eps.sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0)),
    }));
}

function mapBackendMovie(backendMovie: any): Movie {
  const existingSources = backendMovie?.sources ?? [];
  const derivedSources = mapBackendVideosToSources(backendMovie?.videos);
  const mergedSources =
    Array.isArray(existingSources) && existingSources.length > 0 ? existingSources : derivedSources;

  return {
    ...backendMovie,
    genres: backendMovie.genres?.map((g: any) => (typeof g === 'string' ? g : g?.name)) || [],
    country: backendMovie.country || "United States",
    language: backendMovie.language || "English",
    quality: backendMovie.quality || "1080p",
    studio: backendMovie.studio || "Independent",
    director: backendMovie.director || "Unknown Director",
    rating: normalizeRating(backendMovie?.rating, 8.0),
    sources: mergedSources,
  };
}

function mapBackendTVShow(backendShow: any): TVShow {
  const existingSources = backendShow?.sources ?? [];
  const derivedSources = mapBackendVideosToSources(backendShow?.videos);
  const mergedSources =
    Array.isArray(existingSources) && existingSources.length > 0 ? existingSources : derivedSources;

  const episodes = mapBackendEpisodes(backendShow?.episodes);
  const explicitSeasons = Array.isArray(backendShow?.seasons) ? backendShow.seasons : [];
  const seasons =
    explicitSeasons.length > 0
      ? explicitSeasons
      : groupEpisodesToSeasons(episodes);

  return {
    ...backendShow,
    genres: backendShow.genres?.map((g: any) => (typeof g === 'string' ? g : g?.name)) || [],
    rating: normalizeRating(backendShow?.rating, 8.0),
    episodes,
    seasons,
    sources: mergedSources,
  };
}

async function tryBackendFetch<T>(
  path: string,
  timeoutMs = 1500,
  headers: Record<string, string> = {},
): Promise<{ ok: true; data: T } | { ok: false }> {
  if (backendAvailable === false) return { ok: false };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { ...headers },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      backendAvailable = true;
      return { ok: true, data: await res.json() as T };
    }
    if (res.status >= 400 && res.status < 500) {
      backendAvailable = true;
      return { ok: false };
    }
    backendAvailable = false;
    return { ok: false };
  } catch (e) {
    backendAvailable = false;
    return { ok: false };
  }
}

export async function fetchMovies(): Promise<Movie[]> {
  const headers = getAuthHeaders();
  const backend = await tryBackendFetch<any[]>('/movies', 1500, headers);
  const backendMovies: Movie[] = backend.ok ? backend.data.map(mapBackendMovie) : [];
  const localMovies: Movie[] = (() => {
    try {
      return getMovies();
    } catch {
      return sampleMovies;
    }
  })();
  const merged = mergeById<Movie>([backendMovies, localMovies, sampleMovies], 'backend-first');
  return merged.length > 0 ? merged : sampleMovies;
}

export async function fetchMovieById(id: string | string[] | number | null | undefined): Promise<Movie | null> {
  if (id == null) return null;
  const key = Array.isArray(id) ? id[0] : String(id);
  const headers = getAuthHeaders();
  const backend = await tryBackendFetch<any>(`/movies/${encodeURIComponent(key)}`, 1500, headers);
  const all = await fetchMovies();
  if (backend.ok && backend.data) {
    const mapped = mapBackendMovie(backend.data);
    return mergeById<Movie>([[mapped], all], 'backend-first').find(m => String(m.id) === key) || mapped;
  }
  return all.find(m => String(m.id) === key) || sampleMovies.find(m => String(m.id) === key) || null;
}

export async function fetchTVShows(): Promise<TVShow[]> {
  const headers = getAuthHeaders();
  const backend = await tryBackendFetch<any[]>('/tv-shows', 1500, headers);
  const backendShows: TVShow[] = backend.ok ? backend.data.map(mapBackendTVShow) : [];
  const localShows: TVShow[] = (() => {
    try {
      return getTVShows();
    } catch {
      return sampleTVShows;
    }
  })();
  const merged = mergeById<TVShow>([backendShows, localShows, sampleTVShows], 'backend-first');
  return merged.length > 0 ? merged : sampleTVShows;
}

export async function fetchTVShowById(id: string | string[] | number | null | undefined): Promise<TVShow | null> {
  if (id == null) return null;
  const key = Array.isArray(id) ? id[0] : String(id);
  const headers = getAuthHeaders();
  const backend = await tryBackendFetch<any>(`/tv-shows/${encodeURIComponent(key)}`, 1500, headers);
  const all = await fetchTVShows();
  if (backend.ok && backend.data) {
    const mapped = mapBackendTVShow(backend.data);
    return mergeById<TVShow>([[mapped], all], 'backend-first').find(s => String(s.id) === key) || mapped;
  }
  return all.find(s => String(s.id) === key) || sampleTVShows.find(s => String(s.id) === key) || null;
}

export async function fetchAIRecommendations(): Promise<Movie[]> {
  const backend = await tryBackendFetch<any[]>('/recommendations');
  if (backend.ok && backend.data.length > 0) {
    return backend.data.map(mapBackendMovie);
  }
  return getAIRecommendations();
}

export async function syncMovieToBackend(movie: Partial<Movie> & { id?: string | number }): Promise<any | null> {
  try {
    const isUpdate = !!movie.id;
    const url = isUpdate ? `${API_BASE}/movies/${encodeURIComponent(String(movie.id))}` : `${API_BASE}/movies`;
    const res = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(movie),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('syncMovieToBackend failed:', e);
  }
  return null;
}

export async function deleteMovieFromBackend(id: string | number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/movies/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    return res.ok;
  } catch (e) {
    console.warn('deleteMovieFromBackend failed:', e);
    return false;
  }
}

export async function syncTVShowToBackend(show: Partial<TVShow> & { id?: string | number }): Promise<any | null> {
  try {
    const isUpdate = !!show.id;
    const url = isUpdate ? `${API_BASE}/tv-shows/${encodeURIComponent(String(show.id))}` : `${API_BASE}/tv-shows`;
    const res = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(show),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('syncTVShowToBackend failed:', e);
  }
  return null;
}

export async function deleteTVShowFromBackend(id: string | number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/tv-shows/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    return res.ok;
  } catch (e) {
    console.warn('deleteTVShowFromBackend failed:', e);
    return false;
  }
}

function mapBackendTvChannel(backendChannel: any): TvChannel {
  return {
    ...backendChannel,
    isHD: Boolean(backendChannel?.isHD),
    is4K: Boolean(backendChannel?.is4K),
    order: Number(backendChannel?.order ?? 0),
    isActive: backendChannel?.isActive !== false,
    isFeatured: Boolean(backendChannel?.isFeatured),
    viewerCount: Number(backendChannel?.viewerCount ?? 0),
    rating: normalizeRating(backendChannel?.rating, 8.0),
    isPaid: Boolean(backendChannel?.isPaid),
  } as TvChannel;
}

export async function fetchTvChannels(includeInactive = false): Promise<TvChannel[]> {
  const headers = getAuthHeaders();
  const url = includeInactive
    ? '/tv-channels?includeInactive=true'
    : '/tv-channels';
  const backend = await tryBackendFetch<any[]>(url, 1500, headers);
  const backendChannels: TvChannel[] = backend.ok
    ? backend.data.map(mapBackendTvChannel)
    : [];
  const localChannels: TvChannel[] = (() => {
    try {
      return getTvChannels();
    } catch {
      return sampleTvChannels;
    }
  })();
  const merged = mergeById<TvChannel>(
    [backendChannels, localChannels, sampleTvChannels],
    'backend-first'
  );
  return merged.length > 0 ? merged : sampleTvChannels;
}

export async function fetchTvChannelById(
  id: string | string[] | number | null | undefined
): Promise<TvChannel | null> {
  if (id == null) return null;
  const key = Array.isArray(id) ? id[0] : String(id);
  const headers = getAuthHeaders();
  const backend = await tryBackendFetch<any>(
    `/tv-channels/${encodeURIComponent(key)}`,
    1500,
    headers
  );
  const all = await fetchTvChannels();
  if (backend.ok && backend.data) {
    const mapped = mapBackendTvChannel(backend.data);
    return (
      mergeById<TvChannel>([[mapped], all], 'backend-first').find(
        (c) => String(c.id) === key
      ) || mapped
    );
  }
  return (
    all.find((c) => String(c.id) === key) ||
    sampleTvChannels.find((c) => String(c.id) === key) ||
    null
  );
}

export async function syncTvChannelToBackend(
  channel: Partial<TvChannel> & { id?: string | number }
): Promise<any | null> {
  try {
    const isUpdate = !!channel.id;
    const url = isUpdate
      ? `${API_BASE}/tv-channels/${encodeURIComponent(String(channel.id))}`
      : `${API_BASE}/tv-channels`;
    const payload: any = { ...channel };
    if (typeof payload.order === 'string') payload.order = parseInt(payload.order, 10);
    if (typeof payload.viewerCount === 'string')
      payload.viewerCount = parseInt(payload.viewerCount, 10);
    if (typeof payload.rating === 'string') payload.rating = parseFloat(payload.rating);
    const res = await fetch(url, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('syncTvChannelToBackend failed:', e);
  }
  return null;
}

export async function deleteTvChannelFromBackend(
  id: string | number
): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_BASE}/tv-channels/${encodeURIComponent(String(id))}`,
      {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
      }
    );
    return res.ok;
  } catch (e) {
    console.warn('deleteTvChannelFromBackend failed:', e);
    return false;
  }
}

