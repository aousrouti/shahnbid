import { NextResponse } from 'next/server';
import { saveSubscription, removeSubscription, subscriptionCount } from '@/lib/push/store';

export const runtime = 'nodejs';

// Register a browser push subscription.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sub = body?.subscription ?? body;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 });
  }
  saveSubscription(sub);
  return NextResponse.json({ ok: true, count: subscriptionCount() });
}

// Remove a subscription (on opt-out).
export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint ?? body?.subscription?.endpoint;
  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint requis' }, { status: 400 });
  }
  removeSubscription(endpoint);
  return NextResponse.json({ ok: true, count: subscriptionCount() });
}
