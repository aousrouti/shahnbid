// Push-subscription store, backed by SQL Server via Prisma.
import { prisma } from '@/lib/prisma';
import type { PushSubscription } from 'web-push';

function toWebPush(r: { endpoint: string; p256dh: string; auth: string }): PushSubscription {
  return { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } };
}

export async function saveSubscription(userId: string, sub: PushSubscription): Promise<void> {
  // De-dupe by endpoint (can't be a unique key on NVARCHAR(Max)), then insert.
  await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
  await prisma.pushSubscription.create({
    data: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

export async function allSubscriptions(): Promise<PushSubscription[]> {
  const rows = await prisma.pushSubscription.findMany();
  return rows.map(toWebPush);
}

export async function subscriptionsForUser(userId: string): Promise<PushSubscription[]> {
  const rows = await prisma.pushSubscription.findMany({ where: { userId } });
  return rows.map(toWebPush);
}

export async function subscriptionCount(): Promise<number> {
  return prisma.pushSubscription.count();
}
