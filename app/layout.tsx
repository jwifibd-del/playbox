import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MiniPlayerHost } from '@/components/MiniPlayerHost';
import { AuthProvider } from '@/components/SessionProvider';
import { PWARegistrar } from '@/components/PWARegistrar';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') + '/'
      : 'http://localhost:3000/',
  ),
  title: {
    default: 'PlayFlix - Premium Streaming Platform',
    template: '%s · PlayFlix',
  },
  description:
    'Premium streaming platform — Movies, TV Shows, Anime, Kids, with seamless offline sync to Android, Android TV, iOS, Apple TV (tvOS), Google TV, Tizen, webOS, Roku, Fire TV, Titan OS, and tablets.',
  applicationName: 'PlayFlix',
  keywords: [
    'PlayFlix',
    'streaming',
    'movies',
    'tv shows',
    'offline sync',
    'android tv',
    'apple tv',
    'roku',
    'fire tv',
    'tizen',
    'webos',
    'google tv',
    'titan os',
  ],
  authors: [{ name: 'PlayFlix' }],
  creator: 'PlayFlix',
  publisher: 'PlayFlix',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
  category: 'entertainment',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PlayFlix',
  },
  openGraph: {
    type: 'website',
    siteName: 'PlayFlix',
    title: 'PlayFlix - Premium Streaming Platform',
    description:
      'Stream movies, TV shows and more — with offline sync to every screen in your home and pocket.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlayFlix - Premium Streaming Platform',
    description:
      'Stream movies, TV shows and more — with offline sync to every screen in your home and pocket.',
  },
  icons: {
    icon: [
      {
        url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'PlayFlix minimal icon, glossy letter P in neon purple filmstrip, dark indigo background, rounded square, 64px size, no text',
        )}&image_size=square`,
        sizes: '64x64',
        type: 'image/png',
      },
      {
        url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'PlayFlix minimal icon, glossy letter P in neon purple filmstrip, dark indigo background, rounded square, 32px size, no text',
        )}&image_size=square`,
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'PlayFlix minimal icon, glossy letter P in neon purple filmstrip, dark indigo background, rounded square, 16px size, no text',
        )}&image_size=square`,
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'PlayFlix iOS home screen app icon, rounded corners, glossy chrome letter P wrapped in a neon filmstrip frame, deep indigo gradient background, no shadows, 180x180 size',
        )}&image_size=square`,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: [
      {
        url: `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          'PlayFlix favicon, tiny rounded-square icon, letter P, purple neon on black, clean',
        )}&image_size=square`,
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05060f' },
    { media: '(prefers-color-scheme: light)', color: '#6d28d9' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-visual',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6d28d9" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <MiniPlayerHost />
        <PWARegistrar />
      </body>
    </html>
  );
}
