import { NextResponse } from 'next/server';
import { saveSubscription, removeSubscription, subscriptionCount } from '@/lib/push/store';
import { getCurrentUser } from '@/lib/auth/current-user';

export const runtime = 'nodejs';

// Register a browser push subscription (tied to the logged-in user).
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const sub = body?.subscription ?? body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 });
  }
  await saveSubscription(user.id, sub);
  return NextResponse.json({ ok: true, count: await subscriptionCount() });
}

// Remove a subscription (on opt-out).
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint ?? body?.subscription?.endpoint;
  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint requis' }, { status: 400 });
  }
  await removeSubscription(endpoint);
  return NextResponse.json({ ok: true, count: await subscriptionCount() });
}
