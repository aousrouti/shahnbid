import { NextResponse } from 'next/server';
import { registerCarrierSchema } from '@/lib/validations';
import { addAccount, emailExists } from '@/lib/demo-data/accounts';
import { SESSION_COOKIE, createToken } from '@/lib/auth/session';
import { addAdminNotification } from '@/lib/notifications/store';
import { rateLimit, clientIp } from '@/lib/server/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans un instant.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerCarrierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Données invalides' }, { status: 400 });
  }
  const d = parsed.data;
  if (await emailExists(d.email)) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  // New carriers start PENDING (await admin approval) but can sign in to the portal.
  const account = await addAccount({
    role: 'CARRIER',
    email: d.email,
    password: d.password,
    fullName: d.fullName,
    phone: d.phone,
    companyName: d.companyName,
    country: d.country,
    city: d.city,
    licenseNumber: d.licenseNumber,
    insuranceExpiry: d.insuranceExpiry,
    status: 'PENDING',
  });

  await addAdminNotification({
    type: 'NEW_CARRIER',
    title: "Nouveau transporteur en attente d'approbation",
    body: `${account.companyName} — ${d.city}, ${d.country} · licence ${d.licenseNumber}`,
    link: '/admin/users',
  }, new Date().toISOString());

  const token = await createToken({ id: account.id, role: 'CARRIER' });
  const res = NextResponse.json({ ok: true, redirect: '/carrier/dashboard' });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
