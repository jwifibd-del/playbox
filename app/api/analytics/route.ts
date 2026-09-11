import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const baseViews = 18450;
  const variation = Math.floor(Math.random() * 50);
  const totalViews = baseViews + variation;
  const totalDownloads = Math.floor(totalViews * 0.32);
  const totalShares = Math.floor(totalViews * 0.12);
  const totalComments = Math.floor(totalViews * 0.06);

  const activeUsers = {
    now: Math.floor(Math.random() * 15) + 25,
    lastHour: Math.floor(Math.random() * 40) + 160,
    today: Math.floor(Math.random() * 100) + 1150,
  };

  const contentViews = [
    { id: 1, title: 'Inception', type: 'movie', views: 2450 + variation },
    { id: 2, title: 'The Dark Knight', type: 'movie', views: 1980 + variation },
    { id: 3, title: 'Stranger Things', type: 'tv', views: 3200 + variation },
    { id: 4, title: 'Breaking Bad', type: 'tv', views: 2850 + variation },
    { id: 5, title: 'Interstellar', type: 'movie', views: 2120 + variation },
  ];

  return NextResponse.json(
    {
      status: 'healthy',
      totalViews,
      totalDownloads,
      totalShares,
      totalComments,
      activeUsers,
      contentViews,
      userActivity: [
        { time: 'Just now', event: 'Stream started', title: 'Inception', user: 'Guest' },
        { time: '2m ago', event: 'New user joined', title: 'VIP Plan', user: 'sarah_m' },
        { time: '5m ago', event: 'Download completed', title: 'Stranger Things S04E01', user: 'alex99' },
      ],
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
