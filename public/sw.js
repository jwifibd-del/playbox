/* PlayFlix PWA Service Worker
 * - Precache shell (static assets from _next/)
 * - Cache-first for images / uploads / poster assets
 * - Network-first for HTML documents and API JSON, with offline fallback
 * - Integrates with the PlayFlix backend offline download API:
 *     GET /devices/offline/download/*   (Range requests for offline media)
 * The SW intentionally passes Range requests through untouched to let the
 * NestJS backend serve 206 Partial Content correctly.
 */
const VERSION = 'playflix-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const MEDIA_CACHE = `${VERSION}-media`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/movies',
  '/tv',
  '/downloads',
  '/login',
  '/manifest.webmanifest',
];

const CDN_HOSTS = new Set([
  'image.tmdb.org',
  'coresg-normal.trae.ai',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch {
        for (const url of PRECACHE_URLS) {
          try { await cache.add(url); } catch { /* ignore */ }
        }
      }
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION + '-'))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        const client = await self.clients.get(event.source.id);
        if (client) client.postMessage({ type: 'CACHES_CLEARED' });
      })(),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.headers.has('range')) {
    // Pass byte-range downloads directly to the server so 206 works.
    return;
  }

  const dest = request.destination;
  const accept = request.headers.get('accept') || '';

  if (dest === 'document' || accept.includes('text/html')) {
    event.respondWith(networkFirstCacheFallback(request, RUNTIME_CACHE, '/'));
    return;
  }

  if (
    dest === 'image' ||
    url.pathname.startsWith('/uploads/') ||
    CDN_HOSTS.has(url.hostname)
  ) {
    event.respondWith(cacheFirstNetworkFallback(request, MEDIA_CACHE));
    return;
  }

  if (dest === 'script' || dest === 'style' || dest === 'font' || url.pathname.startsWith('/_next/')) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  if (accept.includes('application/json') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstCacheFallback(request, RUNTIME_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

async function networkFirstCacheFallback(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.status < 500) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fb = await cache.match(fallbackUrl);
      if (fb) return fb;
    }
    return new Response('You appear to be offline.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function cacheFirstNetworkFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.status < 500) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = (async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && response.status < 500) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return cached;
    }
  })();
  if (cached) return cached;
  return networkPromise;
}
