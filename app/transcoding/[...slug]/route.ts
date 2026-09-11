import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

let defaultProfiles = [
  {
    id: 'p-1080p',
    name: '1080p Full HD (H.264)',
    resolution: '1920x1080',
    bitrate: '4500k',
    audioBitrate: '192k',
    fps: 30,
    codec: 'libx264',
    isDefault: true,
  },
  {
    id: 'p-720p',
    name: '720p HD (H.264)',
    resolution: '1280x720',
    bitrate: '2500k',
    audioBitrate: '128k',
    fps: 30,
    codec: 'libx264',
    isDefault: false,
  },
  {
    id: 'p-4k',
    name: '4K Ultra HD (HEVC)',
    resolution: '3840x2160',
    bitrate: '12000k',
    audioBitrate: '384k',
    fps: 60,
    codec: 'libx265',
    isDefault: false,
  },
];

let defaultJobs = [
  {
    id: 'job-101',
    title: 'Interstellar Odyssey (1080p)',
    status: 'completed',
    progress: 100,
    quality: '1080p',
    codec: 'H.264',
    inputSize: '4.2 GB',
    outputSize: '1.8 GB',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'job-102',
    title: 'The Dark Knight (4K HDR)',
    status: 'completed',
    progress: 100,
    quality: '4K',
    codec: 'HEVC',
    inputSize: '12.8 GB',
    outputSize: '5.4 GB',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 6100000).toISOString(),
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const endpoint = slug.join('/');

  if (endpoint.startsWith('jobs') && !endpoint.includes('trigger') && !endpoint.includes('queue')) {
    return NextResponse.json(defaultJobs);
  }

  if (endpoint === 'live') {
    return NextResponse.json({
      byStatus: {
        completed: defaultJobs.filter((j) => j.status === 'completed').length,
        processing: 0,
        queued: 0,
        failed: 0,
      },
      runningJobs: [],
      busyWorkers: 0,
    });
  }

  if (endpoint.startsWith('profiles')) {
    return NextResponse.json(defaultProfiles);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const endpoint = slug.join('/');
  const body = await req.json().catch(() => ({}));

  if (endpoint.startsWith('profiles')) {
    const newProfile = {
      id: body.id || `profile-${Date.now()}`,
      name: body.name || 'Custom Profile',
      resolution: body.resolution || '1920x1080',
      bitrate: body.bitrate || '4000k',
      audioBitrate: body.audioBitrate || '192k',
      fps: body.fps || 30,
      codec: body.codec || 'libx264',
      isDefault: false,
    };
    defaultProfiles.push(newProfile);
    return NextResponse.json(newProfile);
  }

  if (endpoint.includes('trigger-scheduled')) {
    return NextResponse.json({ ok: true, message: 'Scheduled transcoding triggered', count: 0 });
  }

  if (endpoint.includes('queue')) {
    const newJob = {
      id: `job-${Date.now()}`,
      title: body.title || 'Transcoding Task',
      status: 'completed',
      progress: 100,
      quality: body.quality || '1080p',
      codec: 'H.264',
      inputSize: '2.5 GB',
      outputSize: '1.1 GB',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    defaultJobs.unshift(newJob);
    return NextResponse.json(newJob);
  }

  return NextResponse.json({ ok: true, message: 'Action succeeded' });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug || [];
  const endpoint = slug.join('/');

  if (endpoint.startsWith('jobs/')) {
    const id = slug[1];
    defaultJobs = defaultJobs.filter((j) => j.id !== id);
    return NextResponse.json({ ok: true, message: 'Job deleted' });
  }

  if (endpoint.startsWith('profiles/')) {
    const id = slug[1];
    defaultProfiles = defaultProfiles.filter((p) => p.id !== id);
    return NextResponse.json({ ok: true, message: 'Profile deleted' });
  }

  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
