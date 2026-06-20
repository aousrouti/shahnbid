// Per-carrier notification feed, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import type { CarrierNotification as CarrierRow } from '@prisma/client';

export type CarrierNotifType = 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REACTIVATED' | 'JOB_UPDATE';

export interface CarrierNotification {
  id: string;
  type: CarrierNotifType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

function toNotif(n: CarrierRow): CarrierNotification {
  return {
    id: n.id,
    type: n.type as CarrierNotifType,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
  };
}

export async function addCarrierNotification(
  carrierId: string,
  n: Omit<CarrierNotification, 'id' | 'createdAt' | 'read'>,
  createdAt: string,
): Promise<CarrierNotification> {
  const row = await prisma.carrierNotification.create({
    data: { id: crypto.randomUUID(), carrierId, type: n.type, title: n.title, body: n.body, createdAt: new Date(createdAt) },
  });
  return toNotif(row);
}

export async function listCarrierNotifications(carrierId: string): Promise<CarrierNotification[]> {
  const rows = await prisma.carrierNotification.findMany({
    where: { carrierId }, orderBy: { createdAt: 'desc' }, take: 20,
  });
  return rows.map(toNotif);
}

export async function unreadCountForCarrier(carrierId: string): Promise<number> {
  return prisma.carrierNotification.count({ where: { carrierId, read: false } });
}

export async function markAllReadForCarrier(carrierId: string): Promise<void> {
  await prisma.carrierNotification.updateMany({ where: { carrierId, read: false }, data: { read: true } });
}
