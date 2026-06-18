import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { GATE_COOKIE, gateToken } from '@/lib/gate';
import { SESSION_COOKIE, verifyToken, dashboardFor } from '@/lib/auth/session';
import type { UserRole } from '@/lib/types';

const PORTALS: { prefix: string; role: UserRole }[] = [
  { prefix: '/client', role: 'CLIENT' },
  { prefix: '/carrier', role: 'CARRIER' },
  { prefix: '/admin', role: 'ADMIN' },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Optional site-wide demo password gate.
  const gatePassword = process.env.DEMO_GATE_PASSWORD;
  if (gatePassword && pathname !== '/gate' && !pathname.startsWith('/api/gate')) {
    const cookie = req.cookies.get(GATE_COOKIE)?.value;
    if (!cookie || cookie !== (await gateToken(gatePassword))) {
      const url = req.nextUrl.clone();
      url.pathname = '/gate';
      url.search = '';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2) Per-portal authentication + role enforcement.
  const portal = PORTALS.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));
  if (portal) {
    const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== portal.role) {
      // Logged in but wrong portal — send to the user's own area.
      const url = req.nextUrl.clone();
      url.pathname = dashboardFor(session.role);
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icon-192.png|icon-512.png|badge-72.png).*)',
  ],
};
