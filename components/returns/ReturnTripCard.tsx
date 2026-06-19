'use client';

import { formatMAD, formatDate, formatWeight } from '@/lib/utils';
import { MapPin, Truck, Calendar, Weight } from 'lucide-react';
import type { ReturnTrip } from '@/lib/types';

interface ReturnTripCardProps {
  trip: ReturnTrip;
  onBook: (tripId: string) => void;
  canBook: boolean;
  busy?: boolean;
}

export default function ReturnTripCard({ trip, onBook, canBook, busy }: ReturnTripCardProps) {
  return (
    <div className="bg-white border border-brand-border rounded-card p-5 flex flex-col sm:flex-row sm:items-center gap-5">
      {/* Left: route + info */}
      <div className="flex-1 space-y-2">
        {/* Route */}
        <div className="flex items-center gap-2 text-lg font-bold text-brand-navy">
          <MapPin size={16} className="text-brand-primary shrink-0" />
          {trip.originCity}
          <span className="text-brand-mid">→</span>
          {trip.destCity}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar size={13} className="text-gray-400" />
            {formatDate(trip.availableDate)}
          </span>
          <span className="flex items-center gap-1">
            <Weight size={13} className="text-gray-400" />
            Capacité {formatWeight(trip.capacityKg)}
          </span>
          <span className="flex items-center gap-1">
            <Truck size={13} className="text-gray-400" />
            {trip.vehicleType}
          </span>
        </div>

        {/* Carrier */}
        <p className="text-xs text-gray-400">
          {trip.carrierName} · {trip.carrierCity}
        </p>

        {trip.notes && <p className="text-sm text-gray-500 italic">"{trip.notes}"</p>}
      </div>

      {/* Right: price + CTA */}
      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className="text-2xl font-bold text-brand-primary">{formatMAD(trip.listedPriceMAD)}</span>
        {canBook && (
          <button
            onClick={() => onBook(trip.id)}
            disabled={busy}
            className="px-5 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50"
          >
            {busy ? 'Réservation…' : 'Réserver'}
          </button>
        )}
      </div>
    </div>
  );
}
