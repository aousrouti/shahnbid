'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

// scope 'user' → the current user's feed; 'admin' → the global admin feed.
const CONFIG = {
  user: { url: '/api/notifications', key: 'notifications' as const },
  admin: { url: '/api/admin/notifications', key: 'items' as const },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (d > 0) return `il y a ${d} j`;
  if (h > 0) return `il y a ${h} h`;
  if (m > 0) return `il y a ${m} min`;
  return "à l'instant";
}

export default function NotificationBell({ scope = 'user' }: { scope?: 'user' | 'admin' }) {
  const cfg = CONFIG[scope];
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>();

  async function load() {
    try {
      const res = await fetch(cfg.url, { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      setItems(d[cfg.key] ?? []);
      setUnread(d.unread ?? 0);
    } catch { /* ignore */ }
  }

  async function markRead() {
    await fetch(cfg.url, { method: 'POST' });
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  useEffect(() => {
    load();
    timer.current = setInterval(load, 30_000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open && unread) markRead(); }}
        className="relative p-1.5 text-gray-500 hover:text-brand-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-40 bg-white border border-brand-border rounded-card shadow-lg">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-border sticky top-0 bg-white">
              <span className="font-semibold text-brand-navy text-sm">Notifications</span>
              {items.some((i) => !i.read) && (
                <button onClick={markRead} className="text-xs text-brand-primary hover:underline">Tout marquer comme lu</button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Aucune notification</p>
            ) : (
              <ul className="divide-y divide-brand-border">
                {items.map((n) => (
                  <li key={n.id} className={`px-4 py-3 ${n.read ? '' : 'bg-brand-bg'}`}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-primary shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-navy">{n.title}</p>
                        <p className="text-xs text-gray-500 leading-snug">{n.body}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
