import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getAllowedHostnames = (): Set<string> => {
  const raw = process.env.PLAYFLIX_HLS_PROXY_ALLOWED_HOSTS ?? process.env.HLS_PROXY_ALLOWED_HOSTS ?? '';
  return new Set(
    raw
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  );
};

const isPrivateAllowed = (): boolean => {
  const raw = process.env.PLAYFLIX_HLS_PROXY_ALLOW_PRIVATE ?? process.env.HLS_PROXY_ALLOW_PRIVATE ?? 'true';
  return raw.trim().toLowerCase() !== 'false';
};

const isPrivateHostname = (hostname: string): boolean => {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower.endsWith('.local') || lower.endsWith('.internal')) return true;

  if (lower === '::1' || lower.startsWith('fe80:') || lower.startsWith('fc') || lower.startsWith('fd')) {
    return true;
  }

  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4Match) return false;

  const octets = ipv4Match.slice(1).map((x) => Number.parseInt(x, 10));
  if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return true;

  const [a, b] = octets;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;

  return false;
};

const buildProxyPath = (absoluteUrl: string): string => {
  return `/api/hls-proxy?u=${encodeURIComponent(absoluteUrl)}`;
};

const resolveStreamUrl = (relativeOrAbsolute: string, baseUrl: URL): string => {
  const trimmed = relativeOrAbsolute.trim();
  // Don't proxy data or skd URLs
  if (trimmed.startsWith('data:') || trimmed.startsWith('skd:') || trimmed.startsWith('urn:')) {
    return trimmed;
  }

  try {
    const resolved = new URL(trimmed, baseUrl);
    // If relative path had no query params of its own, preserve baseUrl token/search params
    if (!trimmed.includes('?') && baseUrl.search && !resolved.search) {
      resolved.search = baseUrl.search;
    }
    return buildProxyPath(resolved.toString());
  } catch {
    return trimmed;
  }
};

const rewriteM3u8 = (playlistText: string, playlistUrl: URL): string => {
  const rewriteUriAttributes = (line: string): string => {
    // Matches URI="...", URI='...', or URI=... in tags like #EXT-X-KEY, #EXT-X-MAP, #EXT-X-MEDIA
    return line.replace(/URI=(["']?)([^"'\s,]+)(["']?)/g, (fullMatch, quoteOpen, uri, quoteClose) => {
      const q = quoteOpen || quoteClose || '"';
      const proxied = resolveStreamUrl(uri, playlistUrl);
      return `URI=${q}${proxied}${q}`;
    });
  };

  return playlistText
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;

      // Handle tags
      if (trimmed.startsWith('#')) {
        if (
          trimmed.startsWith('#EXT-X-KEY') ||
          trimmed.startsWith('#EXT-X-MAP') ||
          trimmed.startsWith('#EXT-X-MEDIA') ||
          trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF')
        ) {
          return rewriteUriAttributes(line);
        }
        return line;
      }

      // Handle media segment or child manifest lines
      return resolveStreamUrl(trimmed, playlistUrl);
    })
    .join('\n');
};

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-expose-headers': '*',
  'access-control-max-age': '86400',
};

export const OPTIONS = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'cache-control': 'public, max-age=86400',
    },
  });
};

export const HEAD = async (request: NextRequest): Promise<Response> => {
  const raw = request.nextUrl.searchParams.get('u');
  if (!raw) {
    return new Response('Missing "u" query param', { status: 400, headers: CORS_HEADERS });
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(raw);
  } catch {
    return new Response('Invalid URL', { status: 400, headers: CORS_HEADERS });
  }

  // If URL is an example.com placeholder, map to reliable live HLS stream
  if (upstreamUrl.hostname === 'example.com' || upstreamUrl.hostname.endsWith('.example.com')) {
    upstreamUrl = new URL('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  }

  try {
    const upstreamHeaders = new Headers();
    const range = request.headers.get('range');
    if (range) upstreamHeaders.set('range', range);
    upstreamHeaders.set(
      'user-agent',
      request.headers.get('user-agent') ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    );
    upstreamHeaders.set('referer', `${upstreamUrl.origin}/`);

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'HEAD',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
    });

    const headers = new Headers(CORS_HEADERS);
    headers.set('accept-ranges', 'bytes');

    const passthrough = [
      'content-type',
      'content-length',
      'content-range',
      'etag',
      'last-modified',
      'cache-control',
    ];
    for (const key of passthrough) {
      const value = upstreamResponse.headers.get(key);
      if (value) headers.set(key, value);
    }

    return new Response(null, {
      status: upstreamResponse.status,
      headers,
    });
  } catch {
    return new Response(null, { status: 502, headers: CORS_HEADERS });
  }
};

export const GET = async (request: NextRequest): Promise<Response> => {
  const raw = request.nextUrl.searchParams.get('u');
  if (!raw) {
    return new Response('Missing "u" query param', { status: 400, headers: CORS_HEADERS });
  }

  if (raw.length > 8192) {
    return new Response('URL too long', { status: 400, headers: CORS_HEADERS });
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(raw);
  } catch {
    return new Response('Invalid URL', { status: 400, headers: CORS_HEADERS });
  }

  if (upstreamUrl.protocol !== 'http:' && upstreamUrl.protocol !== 'https:') {
    return new Response('Only http/https are allowed', { status: 400, headers: CORS_HEADERS });
  }

  if (upstreamUrl.username || upstreamUrl.password) {
    return new Response('Credentials in URL are not allowed', { status: 400, headers: CORS_HEADERS });
  }

  const allowedHosts = getAllowedHostnames();
  const isExplicitlyAllowed = allowedHosts.has(upstreamUrl.hostname.toLowerCase());
  if (isPrivateHostname(upstreamUrl.hostname) && !isPrivateAllowed() && !isExplicitlyAllowed) {
    return new Response('Target host is not allowed', { status: 403, headers: CORS_HEADERS });
  }

  // If URL is an example.com placeholder, map to reliable live HLS stream
  if (upstreamUrl.hostname === 'example.com' || upstreamUrl.hostname.endsWith('.example.com')) {
    upstreamUrl = new URL('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  }

  const upstreamHeaders = new Headers();
  const forwardHeaders = ['range', 'if-range', 'if-none-match', 'if-modified-since', 'accept'];
  for (const h of forwardHeaders) {
    const val = request.headers.get(h);
    if (val) upstreamHeaders.set(h, val);
  }

  upstreamHeaders.set(
    'user-agent',
    request.headers.get('user-agent') ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  );
  upstreamHeaders.set('referer', `${upstreamUrl.origin}/`);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
    });
  } catch (err: any) {
    console.error('HLS Proxy upstream fetch error:', err?.message || err);
    return new Response('Upstream fetch failed: ' + (err?.message || 'Network error'), {
      status: 502,
      headers: CORS_HEADERS,
    });
  }

  const finalUrl = upstreamResponse.url ? new URL(upstreamResponse.url) : upstreamUrl;
  const rawContentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();

  const isM3u8ByPathOrType =
    finalUrl.pathname.toLowerCase().endsWith('.m3u8') ||
    finalUrl.searchParams.toString().toLowerCase().includes('.m3u8') ||
    rawContentType.includes('application/vnd.apple.mpegurl') ||
    rawContentType.includes('application/x-mpegurl') ||
    rawContentType.includes('audio/mpegurl');

  // If it might be an M3U8 playlist or text, read and check for #EXTM3U header
  if (isM3u8ByPathOrType || rawContentType.includes('text/') || rawContentType.includes('application/octet-stream') || !rawContentType) {
    try {
      const text = await upstreamResponse.text();
      const trimmedStart = text.trimStart();
      if (trimmedStart.startsWith('#EXTM3U')) {
        const rewritten = rewriteM3u8(text, finalUrl);
        return new Response(rewritten, {
          status: upstreamResponse.status === 206 ? 200 : upstreamResponse.status,
          headers: {
            ...CORS_HEADERS,
            'content-type': 'application/vnd.apple.mpegurl; charset=utf-8',
            'cache-control': 'no-store, no-cache, must-revalidate',
          },
        });
      }

      // If it wasn't an M3U8 after reading text, but was small text (e.g. error message), return it
      if (rawContentType.includes('text/') || rawContentType.includes('application/json')) {
        return new Response(text, {
          status: upstreamResponse.status,
          headers: {
            ...CORS_HEADERS,
            'content-type': rawContentType || 'text/plain; charset=utf-8',
          },
        });
      }

      // If it was binary marked as octet-stream that started with non-EXTM3U, return as binary
      return new Response(new TextEncoder().encode(text), {
        status: upstreamResponse.status,
        headers: {
          ...CORS_HEADERS,
          'content-type': rawContentType || 'application/octet-stream',
          'accept-ranges': 'bytes',
        },
      });
    } catch (e: any) {
      console.error('Error parsing M3U8 in proxy:', e?.message || e);
    }
  }

  // Binary stream or segment (e.g., .ts, .m4s, .mp4)
  const headers = new Headers(CORS_HEADERS);
  headers.set('accept-ranges', 'bytes');

  const passthrough = [
    'content-type',
    'content-length',
    'content-range',
    'etag',
    'last-modified',
    'cache-control',
  ];
  for (const key of passthrough) {
    const value = upstreamResponse.headers.get(key);
    if (value) headers.set(key, value);
  }

  // Infer correct content-type for common video extensions if missing or generic
  const pathnameLower = finalUrl.pathname.toLowerCase();
  const currentCt = headers.get('content-type') || '';
  if (!currentCt || currentCt === 'application/octet-stream') {
    if (pathnameLower.endsWith('.ts')) {
      headers.set('content-type', 'video/mp2t');
    } else if (pathnameLower.endsWith('.mp4') || pathnameLower.endsWith('.m4s')) {
      headers.set('content-type', 'video/mp4');
    } else if (pathnameLower.endsWith('.webm')) {
      headers.set('content-type', 'video/webm');
    } else if (pathnameLower.endsWith('.mkv')) {
      headers.set('content-type', 'video/x-matroska');
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
};
