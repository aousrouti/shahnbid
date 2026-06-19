// In-memory per-carrier notification store (UX/scaffolding phase).
// Backend phase: persist to a `carrier_notifications` table.

export type CarrierNotifType = 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REACTIVATED';

export interface CarrierNotification {
  id: string;
  type: CarrierNotifType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

type Store = Map<string, CarrierNotification[]>; // carrierId → notifications[]

const g = globalThis as unknown as { __shahnbidCarrierNotifs?: Store };
const store: Store = g.__shahnbidCarrierNotifs ?? (g.__shahnbidCarrierNotifs = new Map());

function getList(carrierId: string): CarrierNotification[] {
  if (!store.has(carrierId)) store.set(carrierId, []);
  return store.get(carrierId)!;
}

export function addCarrierNotification(
  carrierId: string,
  n: Omit<CarrierNotification, 'id' | 'createdAt' | 'read'>,
  createdAt: string,
): CarrierNotification {
  const item: CarrierNotification = { ...n, id: crypto.randomUUID(), createdAt, read: false };
  getList(carrierId).unshift(item);
  return item;
}

export function listCarrierNotifications(carrierId: string): CarrierNotification[] {
  return getList(carrierId).slice(0, 20);
}

export function unreadCountForCarrier(carrierId: string): number {
  return getList(carrierId).filter((n) => !n.read).length;
}

export function markAllReadForCarrier(carrierId: string): void {
  getList(carrierId).forEach((n) => { n.read = true; });
}
