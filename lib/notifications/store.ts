// Admin notification feed, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import type { AdminNotification as AdminRow } from '@prisma/client';

export type AdminNotificationType = 'NEW_CARRIER' | 'NEW_CLIENT' | 'NEW_JOB' | 'NEW_BID';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
}

function toNotif(n: AdminRow): AdminNotification {
  return {
    id: n.id,
    type: n.type as AdminNotificationType,
    title: n.title,
    body: n.body,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
  };
}

export async function addAdminNotification(
  n: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>,
  createdAt: string,
): Promise<AdminNotification> {
  const row = await prisma.adminNotification.create({
    data: { id: crypto.randomUUID(), type: n.type, title: n.title, body: n.body, link: n.link, createdAt: new Date(createdAt) },
  });
  return toNotif(row);
}

export async function listAdminNotifications(): Promise<AdminNotification[]> {
  const rows = await prisma.adminNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return rows.map(toNotif);
}

export async function unreadCount(): Promise<number> {
  return prisma.adminNotification.count({ where: { read: false } });
}

export async function markAllRead(): Promise<void> {
  await prisma.adminNotification.updateMany({ where: { read: false }, data: { read: true } });
}
