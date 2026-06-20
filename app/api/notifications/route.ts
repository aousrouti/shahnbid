import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listUserNotifications, unreadCountForUser, markAllReadForUser } from '@/lib/notifications/user-store';

export const runtime = 'nodejs';

// The current user's in-app notifications (works for clients and carriers).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  return NextResponse.json({
    notifications: await listUserNotifications(user.id),
    unread: await unreadCountForUser(user.id),
  });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  await markAllReadForUser(user.id);
  return NextResponse.json({ ok: true });
}
