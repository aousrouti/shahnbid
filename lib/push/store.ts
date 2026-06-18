// In-memory push-subscription store (UX/scaffolding phase).
// Backend phase: replace with a `push_subscriptions` table keyed by carrierProfileId.
import type { PushSubscription } from 'web-push';

type Store = Map<string, PushSubscription>;

// Survive Next dev HMR by stashing on globalThis.
const g = globalThis as unknown as { __shahnbidPushSubs?: Store };
const subs: Store = g.__shahnbidPushSubs ?? (g.__shahnbidPushSubs = new Map());

export function saveSubscription(sub: PushSubscription): void {
  subs.set(sub.endpoint, sub);
}

export function removeSubscription(endpoint: string): void {
  subs.delete(endpoint);
}

export function allSubscriptions(): PushSubscription[] {
  return Array.from(subs.values());
}

export function subscriptionCount(): number {
  return subs.size;
}
