// In-memory push-subscription store (UX/scaffolding phase).
// Backend phase: replace with a `push_subscriptions` table keyed by userId + endpoint.
import type { PushSubscription } from 'web-push';

interface StoredSub {
  userId: string;
  sub: PushSubscription;
}

type Store = Map<string, StoredSub>; // keyed by endpoint

const g = globalThis as unknown as { __shahnbidPushSubs?: Store };
const subs: Store = g.__shahnbidPushSubs ?? (g.__shahnbidPushSubs = new Map());

export function saveSubscription(userId: string, sub: PushSubscription): void {
  subs.set(sub.endpoint, { userId, sub });
}

export function removeSubscription(endpoint: string): void {
  subs.delete(endpoint);
}

export function allSubscriptions(): PushSubscription[] {
  return Array.from(subs.values()).map((s) => s.sub);
}

/** All subscriptions belonging to a specific user (e.g. to notify on status change). */
export function subscriptionsForUser(userId: string): PushSubscription[] {
  return Array.from(subs.values()).filter((s) => s.userId === userId).map((s) => s.sub);
}

export function subscriptionCount(): number {
  return subs.size;
}
