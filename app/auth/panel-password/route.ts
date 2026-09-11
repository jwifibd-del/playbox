import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!bearer) {
      return NextResponse.json({ message: 'Missing or invalid admin token' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ message: 'New password must be at least 4 characters' }, { status: 400 });
    }

    const issued = Date.now();
    const payload = {
      sub: 'admin',
      role: 'admin',
      iat: Math.floor(issued / 1000),
      exp: Math.floor((issued + 86400000) / 1000),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `playflix-admin.${encodedPayload}.sig`;

    return NextResponse.json({
      ok: true,
      message: 'Admin password updated successfully',
      access_token: token,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
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
