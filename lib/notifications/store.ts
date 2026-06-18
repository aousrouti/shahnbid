// In-memory admin notification feed (UX/scaffolding phase).
// Backend phase: persist to a table + send email via Azure Communication Services
// (notifyAdminNewCarrier) and/or Web Push to the admin.

export type AdminNotificationType = 'NEW_CARRIER' | 'NEW_CLIENT';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
}

const g = globalThis as unknown as { __shahnbidAdminNotifs?: AdminNotification[] };
const notifs: AdminNotification[] = g.__shahnbidAdminNotifs ?? (g.__shahnbidAdminNotifs = []);

export function addAdminNotification(
  n: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>,
  createdAt: string,
): AdminNotification {
  const item: AdminNotification = {
    ...n,
    id: crypto.randomUUID(),
    createdAt,
    read: false,
  };
  notifs.unshift(item); // newest first
  return item;
}

export function listAdminNotifications(): AdminNotification[] {
  return notifs.slice(0, 50);
}

export function unreadCount(): number {
  return notifs.filter((n) => !n.read).length;
}

export function markAllRead(): void {
  notifs.forEach((n) => { n.read = true; });
}
