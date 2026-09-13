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
  // Don't proxy data or skd or urn URLs
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
    // Matches URI="...", URI='...', or URI=... in tags like #EXT-X-KEY, #EXT-X-MAP, #EXT-X-MEDIA, #EXT-X-I-FRAME-STREAM-INF
    return line.replace(/URI=(["']?)([^"'\s,]+)(["']?)/g, (_fullMatch, quoteOpen, uri, quoteClose) => {
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
          trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF') ||
          trimmed.startsWith('#EXT-X-SESSION-DATA')
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

const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, HEAD, OPTIONS',
  'access-control-allow-headers': '*',
  'access-control-expose-headers': '*',
  'access-control-max-age': '86400',
};

// Known extensions that are pure binary chunks (must NEVER be parsed as UTF-8)
const BINARY_SEGMENT_REGEX = /\.(ts|m4s|mp4|webm|mkv|aac|mp3|key|bin)($|\?)/i;

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

  const upstreamHeaders = new Headers();
  if (upstreamUrl.username || upstreamUrl.password) {
    const auth = Buffer.from(`${decodeURIComponent(upstreamUrl.username)}:${decodeURIComponent(upstreamUrl.password)}`).toString('base64');
    upstreamHeaders.set('authorization', `Basic ${auth}`);
    upstreamUrl.username = '';
    upstreamUrl.password = '';
  }

  try {
    const range = request.headers.get('range');
    if (range) upstreamHeaders.set('range', range);
    upstreamHeaders.set(
      'user-agent',
      request.headers.get('user-agent') ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    );
    upstreamHeaders.set('accept', '*/*');

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'HEAD',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
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
  const searchParams = request.nextUrl.searchParams;
  const raw = searchParams.get('u');
  const isTest = searchParams.get('test') === 'true' || searchParams.get('action') === 'test';

  if (!raw) {
    return new Response(
      isTest ? JSON.stringify({ ok: false, error: 'Missing "u" query param' }) : 'Missing "u" query param',
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          'content-type': isTest ? 'application/json' : 'text/plain',
        },
      },
    );
  }

  if (raw.length > 8192) {
    return new Response('URL too long', { status: 400, headers: CORS_HEADERS });
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(raw);
  } catch {
    return new Response(
      isTest ? JSON.stringify({ ok: false, error: 'Invalid URL format' }) : 'Invalid URL',
      {
        status: 400,
        headers: { ...CORS_HEADERS, 'content-type': isTest ? 'application/json' : 'text/plain' },
      },
    );
  }

  if (upstreamUrl.protocol !== 'http:' && upstreamUrl.protocol !== 'https:') {
    return new Response(
      isTest ? JSON.stringify({ ok: false, error: 'Only http: and https: protocols are supported' }) : 'Only http/https are allowed',
      {
        status: 400,
        headers: { ...CORS_HEADERS, 'content-type': isTest ? 'application/json' : 'text/plain' },
      },
    );
  }

  const upstreamHeaders = new Headers();

  // Extract and convert embedded URL credentials (e.g. http://user:pass@host/...) into standard Authorization header
  if (upstreamUrl.username || upstreamUrl.password) {
    const auth = Buffer.from(
      `${decodeURIComponent(upstreamUrl.username)}:${decodeURIComponent(upstreamUrl.password)}`,
    ).toString('base64');
    upstreamHeaders.set('authorization', `Basic ${auth}`);
    upstreamUrl.username = '';
    upstreamUrl.password = '';
  }

  const allowedHosts = getAllowedHostnames();
  const isExplicitlyAllowed = allowedHosts.has(upstreamUrl.hostname.toLowerCase());
  if (isPrivateHostname(upstreamUrl.hostname) && !isPrivateAllowed() && !isExplicitlyAllowed) {
    return new Response(
      isTest ? JSON.stringify({ ok: false, error: 'Private target host is restricted' }) : 'Target host is not allowed',
      { status: 403, headers: { ...CORS_HEADERS, 'content-type': isTest ? 'application/json' : 'text/plain' } },
    );
  }

  // Forward common client request headers
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

  const startTime = Date.now();
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch (err: any) {
    const msg = err?.message || 'Network error';
    if (isTest) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Failed to connect to stream server: ${msg}`,
          latencyMs: Date.now() - startTime,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'content-type': 'application/json' } },
      );
    }
    return new Response(`Upstream fetch failed: ${msg}`, {
      status: 502,
      headers: CORS_HEADERS,
    });
  }

  const latencyMs = Date.now() - startTime;
  let finalUrl: URL = upstreamUrl;
  try {
    if (upstreamResponse.url && upstreamResponse.url.trim()) {
      finalUrl = new URL(upstreamResponse.url);
    }
  } catch {
    finalUrl = upstreamUrl;
  }

  const rawContentType = (upstreamResponse.headers.get('content-type') || '').toLowerCase();
  const isKnownBinarySegment = BINARY_SEGMENT_REGEX.test(finalUrl.pathname);

  // If this is a diagnostic test request, analyze the response and return rich JSON
  if (isTest) {
    let isM3u8 = false;
    let variants = 0;
    let sampleText = '';

    if (upstreamResponse.ok) {
      try {
        const buffer = await upstreamResponse.arrayBuffer();
        const headerSample = new TextDecoder('utf-8', { fatal: false }).decode(buffer.slice(0, 128));
        if (headerSample.trimStart().startsWith('#EXTM3U')) {
          isM3u8 = true;
          sampleText = new TextDecoder('utf-8').decode(buffer);
          variants = (sampleText.match(/#EXT-X-STREAM-INF/g) || []).length;
          if (variants === 0) {
            variants = (sampleText.match(/#EXTINF/g) || []).length > 0 ? 1 : 0;
          }
        }
      } catch {
        // ignore
      }
    }

    return new Response(
      JSON.stringify({
        ok: upstreamResponse.ok,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        url: finalUrl.toString(),
        contentType: rawContentType,
        isM3u8,
        variants,
        latencyMs,
        headers: {
          contentType: rawContentType,
          contentLength: upstreamResponse.headers.get('content-length'),
          server: upstreamResponse.headers.get('server'),
        },
      }),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'content-type': 'application/json',
        },
      },
    );
  }

  // 1. FAST PATH FOR PURE BINARY MEDIA SEGMENTS (.ts, .m4s, .mp4, .aac, .key)
  // MUST NEVER call .text() on binary chunks to prevent byte corruption!
  if (isKnownBinarySegment) {
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
      } else if (pathnameLower.endsWith('.aac')) {
        headers.set('content-type', 'audio/aac');
      } else if (pathnameLower.endsWith('.mp3')) {
        headers.set('content-type', 'audio/mpeg');
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  }

  // 2. CHECK IF THIS IS AN M3U8 PLAYLIST OR TEXT STREAM
  // Read safely as ArrayBuffer to inspect header without risking binary corruption
  try {
    const arrayBuffer = await upstreamResponse.arrayBuffer();

    // Check first 32 bytes for #EXTM3U magic header
    const headerSample = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer.slice(0, 32));
    const isM3u8Content = headerSample.trimStart().startsWith('#EXTM3U');

    if (isM3u8Content) {
      const text = new TextDecoder('utf-8').decode(arrayBuffer);
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

    // If not M3U8, check if it's JSON or textual error
    if (rawContentType.includes('text/') || rawContentType.includes('application/json')) {
      const text = new TextDecoder('utf-8').decode(arrayBuffer);
      return new Response(text, {
        status: upstreamResponse.status,
        headers: {
          ...CORS_HEADERS,
          'content-type': rawContentType || 'text/plain; charset=utf-8',
        },
      });
    }

    // Otherwise, return untouched raw binary buffer with proper headers
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
    if (!headers.get('content-type')) {
      headers.set('content-type', 'application/octet-stream');
    }

    return new Response(arrayBuffer, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (err: any) {
    console.error('Error processing upstream body in hls-proxy:', err?.message || err);
    return new Response('Proxy processing error: ' + (err?.message || 'Unknown error'), {
      status: 502,
      headers: CORS_HEADERS,
    });
  }
};
