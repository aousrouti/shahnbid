import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getWhatsAppProvider } from '@/lib/whatsapp';

export const runtime = 'nodejs';

// Active WhatsApp provider (console vs twilio). Admin only.
export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  return NextResponse.json({ provider: getWhatsAppProvider().name });
}

// Send a one-off test WhatsApp message; surfaces the real result.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== 'ADMIN') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const to = typeof body?.to === 'string' ? body.to : '';
  if (to.replace(/[^\d]/g, '').length < 8) {
    return NextResponse.json({ error: 'Numéro de téléphone requis (format international)' }, { status: 400 });
  }

  const provider = getWhatsAppProvider();
  try {
    await provider.send({ to, text: 'ShahnBid — message de test. Si vous le recevez, la configuration WhatsApp fonctionne.' });
    return NextResponse.json({ ok: true, provider: provider.name });
  } catch (e) {
    return NextResponse.json({ ok: false, provider: provider.name, error: String(e) }, { status: 502 });
  }
}
