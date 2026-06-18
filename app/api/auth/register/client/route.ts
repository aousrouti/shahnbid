import { NextResponse } from 'next/server';
import { registerClientSchema } from '@/lib/validations';
import { addAccount, emailExists } from '@/lib/demo-data/accounts';
import { SESSION_COOKIE, createToken } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Données invalides' }, { status: 400 });
  }
  const d = parsed.data;
  if (emailExists(d.email)) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  const account = addAccount({
    role: 'CLIENT',
    email: d.email,
    password: d.password,
    fullName: d.fullName,
    phone: d.phone,
    clientType: d.clientType,
    companyName: d.companyName,
    ice: d.ice,
    address: d.address,
    city: d.city,
  });

  const token = await createToken({ id: account.id, role: 'CLIENT' });
  const res = NextResponse.json({ ok: true, redirect: '/client/dashboard' });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
