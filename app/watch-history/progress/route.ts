import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get('movieId');
    const tvShowId = searchParams.get('tvShowId');
    const episodeId = searchParams.get('episodeId');

    return NextResponse.json({
      movieId,
      tvShowId,
      episodeId,
      progress: 0,
      duration: 0,
      completed: false,
    });
  } catch (err) {
    return NextResponse.json({ progress: 0, duration: 0, completed: false });
  }
}
