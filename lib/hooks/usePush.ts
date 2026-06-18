'use client';

import { useCallback, useEffect, useState } from 'react';

export type PushStatus =
  | 'unsupported'
  | 'idle'
  | 'subscribing'
  | 'subscribed'
  | 'denied'
  | 'error';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
}

export function usePush() {
  const [status, setStatus] = useState<PushStatus>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!ok) { setStatus('unsupported'); return; }
    navigator.serviceWorker
      .getRegistration()
      .then(async (reg) => {
        const sub = await reg?.pushManager.getSubscription();
        if (sub) setStatus('subscribed');
      })
      .catch(() => { /* ignore */ });
  }, []);

  const subscribe = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setStatus('unsupported'); return; }
    if (!PUBLIC_KEY) { setStatus('error'); return; }
    try {
      setStatus('subscribing');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setStatus('denied'); return; }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY) as BufferSource,
        });
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
      if (!res.ok) throw new Error('subscribe failed');
      setStatus('subscribed');
    } catch {
      setStatus('error');
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
    } catch { /* ignore */ }
    setStatus('idle');
  }, []);

  const sendTest = useCallback(async (payload?: PushPayload) => {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload ?? { title: 'ShahnBid', body: 'Test : une expédition près de vous.' }),
    });
  }, []);

  return { status, subscribe, unsubscribe, sendTest };
}
