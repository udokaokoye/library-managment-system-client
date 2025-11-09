import { NextResponse } from 'next/server';

const AUTH_SERVER = process.env.AUTH_SERVER || 'http://localhost:4000';

export async function GET() {
  try {
    // Attempt a simple GET to the auth server root to determine reachability.
    // Any HTTP response (200..599) indicates the host is reachable; network errors will throw.
    const resp = await fetch(AUTH_SERVER, { method: 'GET' });
    return NextResponse.json({ reachable: true, status: resp.status });
  } catch (err) {
    return NextResponse.json({ reachable: false, error: String(err) }, { status: 502 });
  }
}
