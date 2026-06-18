'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Truck, User, Check } from 'lucide-react';

interface Notif {
  id: string;
  type: 'NEW_CARRIER' | 'NEW_CLIENT';
  title: string;
  body: string;
  link: string;
  createdAt: string;
  read: boolean;
}

export default function AdminNotifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setUnread(data.unread);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000); // light polling for the demo
    return () => clearInterval(t);
  }, []);

  async function markRead() {
    await fetch('/api/admin/notifications', { method: 'POST' });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="rounded-card border border-brand-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-brand-navy">
          <Bell size={16} className="text-brand-primary" />
          Notifications
          {unread > 0 && (
            <span className="rounded-full bg-status-danger px-2 py-0.5 text-[11px] font-bold text-white">{unread}</span>
          )}
        </h2>
        {unread > 0 && (
          <button onClick={markRead} className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-primary">
            <Check size={13} /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-gray-400">Chargement…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-gray-500">Aucune notification pour le moment.</p>
        )}
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.link}
            className={`flex items-start gap-3 rounded-input border p-3 transition-colors hover:border-brand-primary ${
              n.read ? 'border-brand-border bg-white' : 'border-brand-primary/30 bg-brand-light/50'
            }`}
          >
            <div className={`mt-0.5 rounded-input p-1.5 ${n.type === 'NEW_CARRIER' ? 'bg-amber-50 text-amber-700' : 'bg-brand-light text-brand-primary'}`}>
              {n.type === 'NEW_CARRIER' ? <Truck size={15} /> : <User size={15} />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-brand-navy">{n.title}</div>
              <div className="truncate text-xs text-gray-500">{n.body}</div>
            </div>
            {!n.read && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-status-danger" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
