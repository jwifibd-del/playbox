const API_BASE = 'http://localhost:3001';

// Check if backend is available once, cache the result
let backendAvailable: boolean | null = null;

export async function fetchMovies(): Promise<any[]> {
  // If we know backend isn't available, skip fetch entirely
  if (backendAvailable === false) {
    return [];
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
      return await res.json();
    } else {
      backendAvailable = false;
      return [];
    }
  } catch (e) {
    backendAvailable = false;
    return [];
  }
}
