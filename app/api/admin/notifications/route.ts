import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { listAdminNotifications, unreadCount, markAllRead } from '@/lib/notifications/store';

export const runtime = 'nodejs';

async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN' ? user : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  return NextResponse.json({ items: await listAdminNotifications(), unread: await unreadCount() });
}

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  await markAllRead();
  return NextResponse.json({ ok: true, unread: 0 });
}
