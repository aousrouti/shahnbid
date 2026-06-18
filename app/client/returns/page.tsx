'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ReturnTripCard from '@/components/returns/ReturnTripCard';
import EmptyState from '@/components/shared/EmptyState';
import { mockReturnTrips } from '@/lib/mock-data/returns';
import { MOROCCAN_CITIES } from '@/lib/constants';
import { RotateCcw } from 'lucide-react';

export default function ClientReturnsPage() {
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter]     = useState('');

  const filtered = mockReturnTrips.filter((t) => {
    if (originFilter && t.originCity !== originFilter) return false;
    if (destFilter   && t.destCity   !== destFilter)   return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Retours disponibles" subtitle="Réservez un camion de retour à un prix fixe." />

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

      {filtered.length === 0 ? (
        <EmptyState icon={<RotateCcw size={48} />} title="Aucun retour disponible" body="Aucun trajet de retour ne correspond à vos critères." />
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <ReturnTripCard
              key={trip.id}
              trip={trip}
              canBook
              onBook={(id) => console.log('Réserver retour (mock):', id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
