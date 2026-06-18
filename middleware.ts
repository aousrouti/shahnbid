import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GATE_COOKIE, gateToken } from '@/lib/gate';

// Demo password gate. Active only when DEMO_GATE_PASSWORD is set (so local dev
// is open by default; set the env var on the host to lock the public demo).
export async function middleware(req: NextRequest) {
  const password = process.env.DEMO_GATE_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === '/gate' || pathname.startsWith('/api/gate')) return NextResponse.next();

  const cookie = req.cookies.get(GATE_COOKIE)?.value;
  if (cookie && cookie === (await gateToken(password))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/gate';
  url.search = '';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except static assets, the service worker, and PWA icons.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icon-192.png|icon-512.png|badge-72.png).*)',
  ],
};
