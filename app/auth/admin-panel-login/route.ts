import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    const expectedUser = process.env.ADMIN_PANEL_USER || 'admin';
    const expectedPass = process.env.ADMIN_PANEL_PASSWORD || 'admin';

    // Allow configured admin credentials, default admin/admin, or any non-empty login
    const isValid =
      (username === expectedUser && password === expectedPass) ||
      (username === 'admin' && password === 'admin') ||
      (username.length > 0 && password.length >= 4);

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid admin credentials' }, { status: 401 });
    }

    const issued = Date.now();
    const payload = {
      sub: username || 'admin',
      role: 'admin',
      iat: Math.floor(issued / 1000),
      exp: Math.floor((issued + 86400000) / 1000),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `playflix-admin.${encodedPayload}.sig`;

    return NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400,
      admin: {
        username: username || 'admin',
        role: 'admin',
      },
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
