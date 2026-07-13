import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { MiniPlayerHost } from '@/components/MiniPlayerHost';

export const metadata: Metadata = {
  title: 'PlayFlix - Premium Streaming Platform',
  description: 'Premium streaming platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <MiniPlayerHost />
      </body>
    </html>
  );
}
