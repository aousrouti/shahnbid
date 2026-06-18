'use client';

import { Navigation, X } from 'lucide-react';
import { useCarrierLocation } from './LocationProvider';

/** Persistent banner shown across the carrier portal while live location is on. */
export default function LocationStatusBar() {
  const { status, disable } = useCarrierLocation();
  if (status !== 'granted') return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-status-success/30 bg-status-success/10 px-6 py-2">
      <span className="flex items-center gap-2 text-sm font-medium text-status-success">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-success" />
        </span>
        <Navigation size={14} />
        Partage de position activé
      </span>
      <button
        onClick={disable}
        className="inline-flex items-center gap-1 rounded-input border border-status-success/40 px-2.5 py-1 text-xs font-semibold text-status-success transition-colors hover:bg-status-success/15"
      >
        <X size={13} /> Arrêter le partage
      </button>
    </div>
  );
}
