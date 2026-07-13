import { Movie, sampleMovies, getAIRecommendations, sampleTVShows } from './data';

const API_BASE = 'http://localhost:3002';

// Check if backend is available once, cache the result
let backendAvailable: boolean | null = null;

// Map backend movie to frontend movie format
function mapBackendMovie(backendMovie: any): Movie {
  return {
    ...backendMovie,
    genres: backendMovie.genres?.map((g: any) => g.name) || [],
    country: backendMovie.country || "United States",
    language: backendMovie.language || "English",
    quality: backendMovie.quality || "1080p",
    studio: backendMovie.studio || "Independent",
    director: backendMovie.director || "Unknown Director",
  };
}

export async function fetchMovies(): Promise<Movie[]> {
  // If we know backend isn't available, skip fetch entirely
  if (backendAvailable === false) {
    return sampleMovies;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${API_BASE}/movies`, { 
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      backendAvailable = true;
      const data = await res.json();
      return data.length > 0 ? data.map(mapBackendMovie) : sampleMovies;
    } else {
      backendAvailable = false;
      return sampleMovies;
    }
  } catch (e) {
    backendAvailable = false;
    return sampleMovies;
  }
}

export async function fetchTVShows(): Promise<any[]> {
  // If we know backend isn't available, return sample TV shows
  if (backendAvailable === false) {
    return sampleTVShows;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${API_BASE}/tv-shows`, { 
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      backendAvailable = true;
      const data = await res.json();
      return data.length > 0 ? data : sampleTVShows;
    } else {
      backendAvailable = false;
      return sampleTVShows;
    }
  } catch (e) {
    backendAvailable = false;
    return sampleTVShows;
  }
}

export async function fetchAIRecommendations(): Promise<Movie[]> {
  // If we know backend isn't available, return local AI recommendations
  if (backendAvailable === false) {
    return getAIRecommendations();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${API_BASE}/recommendations`, { 
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      backendAvailable = true;
      const data = await res.json();
      return data.length > 0 ? data.map(mapBackendMovie) : getAIRecommendations();
    } else {
      backendAvailable = false;
      return getAIRecommendations();
    }
  } catch (e) {
    backendAvailable = false;
    return getAIRecommendations();
  }
}
