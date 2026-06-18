import { NextResponse } from 'next/server';
import { GATE_COOKIE, gateToken } from '@/lib/gate';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const password = process.env.DEMO_GATE_PASSWORD;
  if (!password) return NextResponse.json({ ok: true }); // gate disabled

  const body = await req.json().catch(() => ({}));
  if (typeof body?.password !== 'string' || body.password !== password) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, await gateToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
