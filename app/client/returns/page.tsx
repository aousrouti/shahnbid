'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ReturnTripCard from '@/components/returns/ReturnTripCard';
import EmptyState from '@/components/shared/EmptyState';
import { MOROCCAN_CITIES } from '@/lib/constants';
import type { ReturnTrip } from '@/lib/types';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

export default function ClientReturnsPage() {
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter]     = useState('');
  const [trips, setTrips]               = useState<ReturnTrip[]>([]);
  const [loading, setLoading]           = useState(true);
  const [busyId, setBusyId]             = useState<string | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [booked, setBooked]             = useState<ReturnTrip | null>(null);

  function load() {
    return fetch('/api/returns', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setTrips(d.trips ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function book(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BOOK' }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error ?? 'Réservation impossible. Réessayez.');
        return;
      }
      setBooked(d.trip);
      await load(); // booked trip drops out of the OPEN list
    } finally {
      setBusyId(null);
    }
  }

  const filtered = trips.filter((t) => {
    if (originFilter && t.originCity !== originFilter) return false;
    if (destFilter   && t.destCity   !== destFilter)   return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Retours disponibles" subtitle="Réservez un camion de retour à un prix fixe." />

      {booked && (
        <div className="flex items-start gap-2 border border-green-200 bg-green-50 text-green-800 rounded-input px-4 py-3 text-sm">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            Retour réservé : <span className="font-semibold">{booked.originCity} → {booked.destCity}</span>.
            Le transporteur {booked.carrierName} vous contactera.
          </span>
        </div>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-input px-4 py-3 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)}
          className="border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="">Toutes les origines</option>
          {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={destFilter} onChange={(e) => setDestFilter(e.target.value)}
          className="border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="">Toutes les destinations</option>
          {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(originFilter || destFilter) && (
          <button onClick={() => { setOriginFilter(''); setDestFilter(''); }}
            className="text-sm text-gray-500 hover:text-brand-primary underline">
            Réinitialiser
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 px-1">Chargement…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<RotateCcw size={48} />} title="Aucun retour disponible" body="Aucun trajet de retour ne correspond à vos critères." />
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <ReturnTripCard
              key={trip.id}
              trip={trip}
              canBook
              busy={busyId === trip.id}
              onBook={book}
            />
          ))}
        </div>
      )}
    </div>
  );
}
