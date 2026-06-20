import { NextResponse } from 'next/server';
import { findByCredentials } from '@/lib/demo-data/accounts';
import { SESSION_COOKIE, createToken, dashboardFor } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  const account = await findByCredentials(email, password);
  if (!account) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
  }

  const token = await createToken({ id: account.id, role: account.role });
  const res = NextResponse.json({
    ok: true,
    user: { id: account.id, role: account.role, fullName: account.fullName },
    redirect: dashboardFor(account.role),
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
