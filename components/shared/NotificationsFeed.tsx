'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, PauseCircle, RotateCcw, Truck, FileText, PackageCheck, Search } from 'lucide-react';

type NotifType =
  | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REACTIVATED'
  | 'NEW_BID' | 'BID_ACCEPTED' | 'STATUS_UPDATE' | 'JOB_UPDATE' | 'NEW_JOB';

interface UserNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const TYPE_CONFIG: Record<NotifType, { icon: typeof Bell; iconCls: string; dot: string }> = {
  APPROVED:     { icon: CheckCircle, iconCls: 'text-green-700 bg-green-100',     dot: 'bg-green-500' },
  REJECTED:     { icon: XCircle,     iconCls: 'text-red-700 bg-red-100',         dot: 'bg-red-500' },
  SUSPENDED:    { icon: PauseCircle, iconCls: 'text-gray-600 bg-gray-200',       dot: 'bg-gray-400' },
  REACTIVATED:  { icon: RotateCcw,   iconCls: 'text-brand-primary bg-blue-100',  dot: 'bg-brand-primary' },
  NEW_BID:      { icon: FileText,    iconCls: 'text-brand-primary bg-blue-100',  dot: 'bg-brand-primary' },
  BID_ACCEPTED: { icon: CheckCircle, iconCls: 'text-green-700 bg-green-100',     dot: 'bg-green-500' },
  STATUS_UPDATE:{ icon: PackageCheck,iconCls: 'text-amber-700 bg-amber-100',     dot: 'bg-amber-500' },
  JOB_UPDATE:   { icon: Truck,       iconCls: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500' },
  NEW_JOB:      { icon: Search,      iconCls: 'text-brand-primary bg-blue-100',  dot: 'bg-brand-primary' },
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export default function NotificationsFeed() {
  const [notifs, setNotifs] = useState<UserNotification[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const res = await fetch('/api/notifications', { cache: 'no-store' });
    if (!res.ok) return;
    const d = await res.json();
    setNotifs(d.notifications ?? []);
    setUnread(d.unread ?? 0);
  }

  async function markRead() {
    await fetch('/api/notifications', { method: 'POST' });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (notifs.length === 0) return null;

  return (
    <div className="bg-white border border-brand-border rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-primary" />
          <h3 className="font-semibold text-brand-navy text-sm">Notifications</h3>
          {unread > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markRead} className="text-xs text-brand-primary hover:underline">Tout marquer comme lu</button>
        )}
      </div>

      <div className="space-y-1">
        {notifs.map((n) => {
          const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.JOB_UPDATE;
          const Icon = cfg.icon;
          return (
            <div key={n.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-input transition-colors ${n.read ? 'opacity-60' : 'bg-brand-bg'}`}>
              <span className={`mt-0.5 flex-shrink-0 p-1.5 rounded-full ${cfg.iconCls}`}><Icon size={13} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-brand-navy">{n.title}</span>
                  {!n.read && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
