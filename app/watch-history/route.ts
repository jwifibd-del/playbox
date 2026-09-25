import { NextRequest, NextResponse } from 'next/server';

// Server-side in-memory cache for session watch history
const inMemoryWatchHistory: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get('take') || '24', 10);
    return NextResponse.json(inMemoryWatchHistory.slice(0, take));
  } catch (err) {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existingIndex = inMemoryWatchHistory.findIndex(
      (item) =>
        (body.movieId && item.movieId === body.movieId) ||
        (body.episodeId && item.episodeId === body.episodeId) ||
        (body.tvShowId && !body.episodeId && item.tvShowId === body.tvShowId)
    );

    const record = {
      ...body,
      id: body.movieId || body.episodeId || body.tvShowId || `wh_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      inMemoryWatchHistory[existingIndex] = {
        ...inMemoryWatchHistory[existingIndex],
        ...record,
      };
    } else {
      inMemoryWatchHistory.unshift(record);
    }

    return NextResponse.json({ success: true, item: record });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const idx = inMemoryWatchHistory.findIndex((it) => it.id === id || it.movieId === id || it.episodeId === id);
      if (idx >= 0) inMemoryWatchHistory.splice(idx, 1);
    } else {
      inMemoryWatchHistory.length = 0;
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
