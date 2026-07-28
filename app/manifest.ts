import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const iconPrompt = encodeURIComponent(
    'PlayFlix streaming app icon, cinematic dark gradient background of deep indigo to electric purple, glossy chrome letter P wrapped in glowing neon film strip, 3D glossy glassmorphism, rounded corners, no text below icon, premium tech aesthetic, 4K render',
  );
  const iconUrl = (size: number) =>
    `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${iconPrompt}&image_size=square_hd`;

  return {
    name: 'PlayFlix',
    short_name: 'PlayFlix',
    description:
      'Premium streaming platform — Movies, TV Shows, Anime, Kids, with seamless offline sync to all your devices.',
    categories: ['entertainment', 'video', 'movies', 'television', 'music'],
    start_url: '/',
    scope: '/',
    id: '/',
    display: 'standalone',
    display_override: ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay', 'browser'],
    orientation: 'any',
    background_color: '#05060f',
    theme_color: '#6d28d9',
    dir: 'ltr',
    lang: 'en-US',
    prefer_related_applications: false,
    protocol_handlers: [
      { protocol: 'web+playflix', url: '/open?url=%s' },
    ],
    icons: [
      {
        src: iconUrl(192),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconUrl(512),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconUrl(512),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: iconUrl(1024),
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'Cinematic streaming dashboard, ultra glassmorphism dark UI, hero banner film scene, horizontal rails of movie posters, floating side navbar, Apple TVOS style, large rounded corners, soft glowing borders, 16x9 landscape',
        )}&image_size=landscape_16_9`,
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'Mobile streaming app portrait UI, glassmorphism dark mode hero movie banner, bottom nav, continue watching rail, minimal PlayFlix logo, subtle purple accents, iPhone 16 Pro style framing',
        )}&image_size=portrait_16_9`,
        sizes: '750x1334',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Continue Watching',
        short_name: 'Resume',
        description: 'Jump straight back into what you were watching',
        url: '/?resume=1',
        icons: [{ src: iconUrl(96), sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Movies',
        short_name: 'Movies',
        description: 'Browse the full movies library',
        url: '/movies',
        icons: [{ src: iconUrl(96), sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'TV Shows',
        short_name: 'TV',
        description: 'Browse TV shows and episodes',
        url: '/tv',
        icons: [{ src: iconUrl(96), sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Offline Downloads',
        short_name: 'Downloads',
        description: 'See your synced offline content',
        url: '/downloads',
        icons: [{ src: iconUrl(96), sizes: '96x96', type: 'image/png' }],
      },
    ],
  };
}
