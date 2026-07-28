import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const getAllowedHostnames = (): Set<string> => {
  const raw = process.env.PLAYFLIX_HLS_PROXY_ALLOWED_HOSTS ?? process.env.HLS_PROXY_ALLOWED_HOSTS ?? ''
  return new Set(
    raw
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean),
  )
}

const isPrivateAllowed = (): boolean => {
  const raw = process.env.PLAYFLIX_HLS_PROXY_ALLOW_PRIVATE ?? process.env.HLS_PROXY_ALLOW_PRIVATE ?? ''
  return raw.trim().toLowerCase() === 'true'
}

const isPrivateHostname = (hostname: string): boolean => {
  const lower = hostname.toLowerCase()
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true
  if (lower.endsWith('.local') || lower.endsWith('.internal')) return true

  if (lower === '::1') return true
  if (lower.startsWith('fe80:')) return true
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true

  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!ipv4Match) return false

  const octets = ipv4Match.slice(1).map((x) => Number.parseInt(x, 10))
  if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return true

  const [a, b] = octets
  if (a === 10) return true
  if (a === 127) return true
  if (a === 0) return true
  if (a === 169 && b === 254) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true

  return false
}

const buildProxyPath = (absoluteUrl: string): string => {
  return `/api/hls-proxy?u=${encodeURIComponent(absoluteUrl)}`
}

const rewriteM3u8 = (playlistText: string, playlistUrl: URL): string => {
  const rewriteUriAttr = (line: string): string => {
    return line.replace(/URI="([^"]+)"/g, (match, uri: string) => {
      try {
        const resolved = new URL(uri, playlistUrl).toString()
        return `URI="${buildProxyPath(resolved)}"`
      } catch {
        return match
      }
    })
  }

  return playlistText
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      if (trimmed.startsWith('#')) {
        return rewriteUriAttr(line)
      }
      try {
        const resolved = new URL(trimmed, playlistUrl).toString()
        return buildProxyPath(resolved)
      } catch {
        return line
      }
    })
    .join('\n')
}

const getContentType = (contentType: string | null, url: URL): { isM3u8: boolean; value: string } => {
  const normalized = (contentType ?? '').toLowerCase()
  const isM3u8 =
    url.pathname.toLowerCase().endsWith('.m3u8') ||
    normalized.includes('application/vnd.apple.mpegurl') ||
    normalized.includes('application/x-mpegurl') ||
    normalized.includes('audio/mpegurl')

  return {
    isM3u8,
    value: normalized || (isM3u8 ? 'application/vnd.apple.mpegurl' : 'application/octet-stream'),
  }
}

export const OPTIONS = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,OPTIONS',
      'access-control-allow-headers': 'range,content-type',
      'cache-control': 'no-store',
    },
  })
}

export const GET = async (request: NextRequest): Promise<Response> => {
  const raw = request.nextUrl.searchParams.get('u')
  if (!raw) {
    return new Response('Missing "u" query param', { status: 400 })
  }

  const debug = request.nextUrl.searchParams.get('debug') === '1'

  if (raw.length > 4096) {
    return new Response('URL too long', { status: 400 })
  }

  let upstreamUrl: URL
  try {
    upstreamUrl = new URL(raw)
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  if (upstreamUrl.protocol !== 'http:' && upstreamUrl.protocol !== 'https:') {
    return new Response('Only http/https are allowed', { status: 400 })
  }

  if (upstreamUrl.username || upstreamUrl.password) {
    return new Response('Credentials in URL are not allowed', { status: 400 })
  }

  const allowedHosts = getAllowedHostnames()
  const isExplicitlyAllowed = allowedHosts.has(upstreamUrl.hostname.toLowerCase())
  if (isPrivateHostname(upstreamUrl.hostname) && !isPrivateAllowed() && !isExplicitlyAllowed) {
    return new Response('Target host is not allowed', { status: 403 })
  }

  const upstreamHeaders = new Headers()
  const range = request.headers.get('range')
  if (range) upstreamHeaders.set('range', range)
  upstreamHeaders.set('accept', '*/*')
  upstreamHeaders.set('user-agent', request.headers.get('user-agent') || 'PlayFlix-HLS-Proxy')
  upstreamHeaders.set('referer', `${upstreamUrl.origin}/`)
  upstreamHeaders.set('origin', upstreamUrl.origin)

  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
    })
  } catch {
    return new Response('Upstream fetch failed', { status: 502 })
  }

  if (debug) {
    const ct = upstreamResponse.headers.get('content-type')
    let bodyPreview: string | null = null
    try {
      bodyPreview = (await upstreamResponse.clone().text()).slice(0, 800)
    } catch {
      bodyPreview = null
    }

    return Response.json(
      {
        requestedUrl: upstreamUrl.toString(),
        finalUrl: upstreamResponse.url,
        status: upstreamResponse.status,
        ok: upstreamResponse.ok,
        contentType: ct,
        bodyPreview,
      },
      {
        status: 200,
        headers: {
          'access-control-allow-origin': '*',
          'cache-control': 'no-store',
        },
      },
    )
  }

  const { isM3u8, value: resolvedContentType } = getContentType(upstreamResponse.headers.get('content-type'), upstreamUrl)

  const baseHeaders = {
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
  }

  if (isM3u8) {
    const text = await upstreamResponse.text()
    const rewritten = rewriteM3u8(text, upstreamUrl)
    return new Response(rewritten, {
      status: upstreamResponse.status,
      headers: {
        ...baseHeaders,
        'content-type': `${resolvedContentType}; charset=utf-8`,
      },
    })
  }

  const headers = new Headers(baseHeaders)
  const passthrough = ['content-type', 'content-length', 'accept-ranges', 'content-range', 'etag', 'last-modified']
  for (const key of passthrough) {
    const value = upstreamResponse.headers.get(key)
    if (value) headers.set(key, value)
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  })
}
