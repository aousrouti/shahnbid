import { NextResponse } from 'next/server';
import { getWebPush } from '@/lib/push/webpush';
import { allSubscriptions, removeSubscription, subscriptionCount } from '@/lib/push/store';

export const runtime = 'nodejs';

/**
 * Send a push to all stored subscriptions.
 * Demo trigger for the scaffolding phase; in the backend phase the server calls
 * this internally when a new job matches a carrier's location/route.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const payload = JSON.stringify({
    title: body.title || 'ShahnBid',
    body: body.body || 'Nouvelle opportunité à proximité.',
    url: body.url || '/carrier/map',
    tag: body.tag || 'shahnbid-job',
  });

  let webpush;
  try {
    webpush = getWebPush();
  } catch {
    return NextResponse.json({ error: 'VAPID non configuré' }, { status: 500 });
  }

  let sent = 0;
  let removed = 0;
  await Promise.all(
    allSubscriptions().map(async (s) => {
      try {
        await webpush.sendNotification(s, payload);
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          removeSubscription(s.endpoint);
          removed++;
        }
      }
    }),
  );

  return NextResponse.json({ ok: true, sent, removed, remaining: subscriptionCount() });
}
