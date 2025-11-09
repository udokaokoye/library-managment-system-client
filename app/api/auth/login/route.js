import { NextResponse } from 'next/server';

const AUTH_SERVER = process.env.AUTH_SERVER || 'http://localhost:4000';

export async function POST(request) {
  // Proxy POST /api/auth/login -> AUTH_SERVER/users/login
  const url = `${AUTH_SERVER}/users/login`;
  const body = await request.text();

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': request.headers.get('content-type') || 'application/json' },
    body,
  });

  // Build response and forward Set-Cookie if present
  const headers = new Headers();
  const setCookie = resp.headers.get('set-cookie') || resp.headers.get('Set-Cookie');
  if (setCookie) {
    // Forward Set-Cookie header so the browser receives it from the Next server
    headers.set('Set-Cookie', setCookie);
  }
  // Forward CORS allow credentials if needed by browser (client is same origin)
  // Return JSON/body
  const text = await resp.text();
  return new NextResponse(text, { status: resp.status, headers });
}
