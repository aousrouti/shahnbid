import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import {
  listCarrierNotifications,
  unreadCountForCarrier,
  markAllReadForCarrier,
} from '@/lib/notifications/carrier-store';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CARRIER') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  return NextResponse.json({
    notifications: await listCarrierNotifications(user.id),
    unread: await unreadCountForCarrier(user.id),
  });
}

/** Mark all notifications as read. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CARRIER') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  await markAllReadForCarrier(user.id);
  return NextResponse.json({ ok: true });
}
