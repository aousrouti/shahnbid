'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import PageHeader from '@/components/shared/PageHeader';
import { mockJobs } from '@/lib/mock-data/jobs';
import { mockCarrierTrip } from '@/lib/mock-data/carrier-trip';
import { cityCoords, interpolate, suggestJobsOnRoute, formatKm } from '@/lib/geo';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import { formatWeight } from '@/lib/utils';
import { Navigation, Package, Route, TrendingUp } from 'lucide-react';

const RouteMap = dynamic(() => import('@/components/carrier/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[420px] grid place-items-center bg-brand-light rounded-card text-sm text-brand-primary">
      Chargement de la carte…
    </div>
  ),
});

export default function CarrierMapPage() {
  const trip = mockCarrierTrip;
  const carrierFrom = cityCoords(trip.fromCity)!;
  const carrierTo = cityCoords(trip.toCity)!;

  const [progress, setProgress] = useState(trip.defaultProgress);
  const carrierPos = useMemo(() => interpolate(carrierFrom, carrierTo, progress), [carrierFrom, carrierTo, progress]);

  const suggestions = useMemo(() => {
    const published = mockJobs.filter((j) => j.status === 'PUBLISHED');
    return suggestJobsOnRoute({ carrierPos, carrierFrom, carrierTo, jobs: published });
  }, [carrierPos, carrierFrom, carrierTo]);

  const onWay = suggestions.filter((s) => s.onTheWay);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carte & opportunités"
        subtitle={`Trajet en cours : ${trip.fromCity} → ${trip.toCity} · ${trip.vehicleType}`}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-border rounded-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-input bg-status-success/10 text-status-success"><TrendingUp size={18} /></div>
          <div>
            <div className="text-xl font-bold text-brand-navy">{onWay.length}</div>
            <div className="text-xs text-gray-500">sur votre route</div>
          </div>
        </div>
        <div className="bg-white border border-brand-border rounded-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-input bg-brand-light text-brand-primary"><Package size={18} /></div>
          <div>
            <div className="text-xl font-bold text-brand-navy">{formatWeight(trip.freeCapacityKg)}</div>
            <div className="text-xs text-gray-500">capacité libre</div>
          </div>
        </div>
        <div className="bg-white border border-brand-border rounded-card p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2 rounded-input bg-amber-50 text-amber-700"><Route size={18} /></div>
          <div>
            <div className="text-xl font-bold text-brand-navy">{suggestions.length}</div>
            <div className="text-xs text-gray-500">demandes à proximité</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="h-[460px] border border-brand-border rounded-card overflow-hidden">
            <RouteMap
              carrierPos={carrierPos}
              carrierFrom={carrierFrom}
              carrierTo={carrierTo}
              fromCity={trip.fromCity}
              toCity={trip.toCity}
              suggestions={suggestions}
            />
          </div>
          {/* Simulate movement along the leg */}
          <div className="bg-white border border-brand-border rounded-card p-4">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2">
              <Navigation size={14} className="text-brand-primary" />
              Simuler la progression : {trip.fromCity} {Math.round(progress * 100)}% {trip.toCity}
            </label>
            <input
              type="range" min={0} max={100} value={Math.round(progress * 100)}
              onChange={(e) => setProgress(Number(e.target.value) / 100)}
              className="w-full accent-brand-primary"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <h2 className="font-semibold text-brand-navy">Opportunités sur le trajet</h2>
          {suggestions.length === 0 && (
            <p className="text-sm text-gray-500">Aucune demande à proximité pour l’instant.</p>
          )}
          {suggestions.map((s) => (
            <Link
              key={s.job.id}
              href={`/carrier/jobs/${s.job.id}`}
              className={`block rounded-card border p-4 transition-colors hover:border-brand-primary ${
                s.onTheWay ? 'border-status-success/40 bg-status-success/5' : 'border-brand-border bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-brand-navy text-sm">
                  {s.job.originCity} → {s.job.destCity}
                </div>
                {s.onTheWay && (
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-badge bg-status-success text-white">
                    Sur votre route
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {CARGO_TYPE_LABELS[s.job.cargoType]} · {formatWeight(s.job.weightKg)} · {s.job.bidCount} offre{s.job.bidCount > 1 ? 's' : ''}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className={s.onTheWay ? 'text-status-success font-medium' : 'text-gray-500'}>
                  {s.detourKm < 1 ? 'Aucun détour' : `Détour ${formatKm(s.detourKm)}`}
                </span>
                <span className="text-gray-400">À {formatKm(s.distanceKm)} de vous</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
