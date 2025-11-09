import { NextResponse } from 'next/server';

const AUTH_SERVER = process.env.AUTH_SERVER || 'http://localhost:4000';

export async function GET(request) {
  // Proxy GET /api/auth/userdetails -> AUTH_SERVER/users/userdetails
  const url = `${AUTH_SERVER}/users/userdetails`;

  // Forward incoming cookies to auth server
  const cookie = request.headers.get('cookie') || '';

  const resp = await fetch(url, {
    method: 'GET',
    headers: { Cookie: cookie },
  });

  const text = await resp.text();
  const headers = new Headers();
  // forward status and any headers (but do not forward Set-Cookie here usually)
  return new NextResponse(text, { status: resp.status, headers });
}
