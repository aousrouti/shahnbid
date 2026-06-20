// Per-user in-app notification feed (clients and carriers), backed by SQL Server.
import { prisma } from '@/lib/prisma';
import type { Notification as Row } from '@prisma/client';

export type NotifType =
  // carrier account lifecycle
  | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REACTIVATED'
  // marketplace events
  | 'NEW_BID'        // client: a carrier bid on your job
  | 'BID_ACCEPTED'   // carrier: your bid was accepted
  | 'STATUS_UPDATE'  // client: shipment status advanced
  | 'JOB_UPDATE'     // carrier: shipment completed/settled
  | 'NEW_JOB';       // carrier: a new job on your route

export interface UserNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

function toNotif(n: Row): UserNotification {
  return {
    id: n.id,
    type: n.type as NotifType,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
  };
}

export async function addUserNotification(
  userId: string,
  n: Omit<UserNotification, 'id' | 'createdAt' | 'read'>,
  createdAt: string,
): Promise<UserNotification> {
  const row = await prisma.notification.create({
    data: { id: crypto.randomUUID(), userId, type: n.type, title: n.title, body: n.body, createdAt: new Date(createdAt) },
  });
  return toNotif(row);
}

export async function listUserNotifications(userId: string): Promise<UserNotification[]> {
  const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 });
  return rows.map(toNotif);
}

export async function unreadCountForUser(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAllReadForUser(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}
