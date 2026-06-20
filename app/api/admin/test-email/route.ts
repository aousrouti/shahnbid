import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getEmailProvider } from '@/lib/email';

export const runtime = 'nodejs';

// Which email provider is active (console vs resend). Admin only.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  return NextResponse.json({ provider: getEmailProvider().name });
}

// Send a one-off test email and surface the real result (errors not swallowed).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const to = typeof body?.to === 'string' ? body.to : '';
  if (!to.includes('@')) return NextResponse.json({ error: 'Adresse email requise' }, { status: 400 });

  const provider = getEmailProvider();
  try {
    await provider.send({
      to,
      subject: 'ShahnBid — email de test',
      text: 'Ceci est un email de test envoyé depuis ShahnBid. Si vous le recevez, la configuration email fonctionne.',
    });
    return NextResponse.json({ ok: true, provider: provider.name });
  } catch (e) {
    return NextResponse.json({ ok: false, provider: provider.name, error: String(e) }, { status: 502 });
  }
}
