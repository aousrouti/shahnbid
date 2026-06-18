'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { mockJobs } from '@/lib/mock-data/jobs';
import { mockCarrierTrip } from '@/lib/mock-data/carrier-trip';
import { cityCoords, interpolate, suggestJobsOnRoute, formatKm, haversineKm } from '@/lib/geo';
import type { JobSuggestion, LatLng } from '@/lib/geo';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import { formatWeight } from '@/lib/utils';
import { useCarrierLocation } from './LocationProvider';
import LiveLocationCard from './LiveLocationCard';
import PushControls from './PushControls';
import { Navigation, Package, Route, TrendingUp, ArrowRight } from 'lucide-react';

const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-brand-light text-sm text-brand-primary">
      Chargement de la carte…
    </div>
  ),
});

function SuggestionRow({ s }: { s: JobSuggestion }) {
  return (
    <Link
      href={`/carrier/jobs/${s.job.id}`}
      className={`block rounded-card border p-3 transition-colors hover:border-brand-primary ${
        s.onTheWay ? 'border-status-success/40 bg-status-success/5' : 'border-brand-border bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-brand-navy">{s.job.originCity} → {s.job.destCity}</div>
        {s.onTheWay && (
          <span className="shrink-0 rounded-badge bg-status-success px-2 py-0.5 text-[11px] font-semibold text-white">
            Sur votre route
          </span>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {CARGO_TYPE_LABELS[s.job.cargoType]} · {formatWeight(s.job.weightKg)}
      </div>
      <div className="mt-1.5 flex items-center gap-4 text-xs">
        <span className={s.onTheWay ? 'font-medium text-status-success' : 'text-gray-500'}>
          {s.detourKm < 1 ? 'Aucun détour' : `Détour ${formatKm(s.detourKm)}`}
        </span>
        <span className="text-gray-400">À {formatKm(s.distanceKm)} de vous</span>
      </div>
    </Link>
  );
}

export default function CarrierMapPanel({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const trip = mockCarrierTrip;
  const carrierFrom = cityCoords(trip.fromCity)!;
  const carrierTo = cityCoords(trip.toCity)!;

  const geo = useCarrierLocation();
  const live = geo.status === 'granted' && geo.position != null;

  const [progress, setProgress] = useState(trip.defaultProgress);
  const mockPos = useMemo<LatLng>(() => interpolate(carrierFrom, carrierTo, progress), [carrierFrom, carrierTo, progress]);
  const carrierPos: LatLng = live ? (geo.position as LatLng) : mockPos;

  const suggestions = useMemo(() => {
    const published = mockJobs.filter((j) => j.status === 'PUBLISHED');
    return suggestJobsOnRoute({ carrierPos, carrierFrom, carrierTo, jobs: published });
  }, [carrierPos, carrierFrom, carrierTo]);

  const onWay = suggestions.filter((s) => s.onTheWay);

  // Nearest published job to the carrier's actual position (for the live alert).
  const nearest = useMemo(() => {
    const published = mockJobs.filter((j) => j.status === 'PUBLISHED');
    let best: { job: typeof published[number]; distanceKm: number } | null = null;
    for (const job of published) {
      const o = cityCoords(job.originCity);
      if (!o) continue;
      const d = haversineKm(carrierPos, o);
      if (!best || d < best.distanceKm) best = { job, distanceKm: d };
    }
    return best;
  }, [carrierPos]);

  // Opt-in browser notification when location is live and the nearest job changes.
  const notifiedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!live || !nearest) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (notifiedFor.current === nearest.job.id) return;
    notifiedFor.current = nearest.job.id;
    try {
      new Notification('Nouvelle offre à proximité', {
        body: `${nearest.job.originCity} → ${nearest.job.destCity} · à ${formatKm(nearest.distanceKm)} de vous`,
      });
    } catch { /* ignore */ }
  }, [live, nearest]);

  function handleEnable() {
    geo.enable();
    // Best-effort: also ask for notification permission so we can alert on nearest jobs.
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { /* ignore */ });
    }
  }

  const testPayload = nearest
    ? {
        title: 'Nouvelle offre à proximité',
        body: `${nearest.job.originCity} → ${nearest.job.destCity} · à ${formatKm(nearest.distanceKm)} de vous`,
        url: `/carrier/jobs/${nearest.job.id}`,
      }
    : undefined;

  const locationCard = (
    <div className="space-y-2">
      <LiveLocationCard
        status={geo.status}
        accuracy={geo.accuracy}
        nearest={nearest}
        onEnable={handleEnable}
        onDisable={geo.disable}
        compact={variant === 'compact'}
      />
      <PushControls testPayload={testPayload} />
    </div>
  );

  const map = (
    <RouteMap
      carrierPos={carrierPos}
      carrierFrom={carrierFrom}
      carrierTo={carrierTo}
      fromCity={trip.fromCity}
      toCity={trip.toCity}
      suggestions={suggestions}
    />
  );

  // ── Compact (dashboard) ──────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-navy">Sur votre trajet · {trip.fromCity} → {trip.toCity}</h2>
          <Link href="/carrier/map" className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline">
            Carte complète <ArrowRight size={14} />
          </Link>
        </div>
        {locationCard}
        <div className="h-64 overflow-hidden rounded-card border border-brand-border">{map}</div>
        <div className="space-y-2">
          {(onWay.length ? onWay : suggestions).slice(0, 2).map((s) => <SuggestionRow key={s.job.id} s={s} />)}
        </div>
      </div>
    );
  }

  // ── Full (map page) ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-card border border-brand-border bg-white p-4">
          <div className="rounded-input bg-status-success/10 p-2 text-status-success"><TrendingUp size={18} /></div>
          <div>
            <div className="text-xl font-bold text-brand-navy">{onWay.length}</div>
            <div className="text-xs text-gray-500">sur votre route</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-brand-border bg-white p-4">
          <div className="rounded-input bg-brand-light p-2 text-brand-primary"><Package size={18} /></div>
          <div>
            <div className="text-xl font-bold text-brand-navy">{formatWeight(trip.freeCapacityKg)}</div>
            <div className="text-xs text-gray-500">capacité libre</div>
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-3 rounded-card border border-brand-border bg-white p-4 sm:col-span-1">
          <div className="rounded-input bg-amber-50 p-2 text-amber-700"><Route size={18} /></div>
          <div>
            <div className="text-xl font-bold text-brand-navy">{suggestions.length}</div>
            <div className="text-xs text-gray-500">demandes à proximité</div>
          </div>
        </div>
      </div>

      {locationCard}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-[460px] overflow-hidden rounded-card border border-brand-border">{map}</div>
          {live ? (
            <div className="flex items-center gap-2 rounded-card border border-status-success/40 bg-status-success/5 p-3 text-xs font-medium text-status-success">
              <Navigation size={14} /> Position réelle utilisée (en direct).
            </div>
          ) : (
            <div className="rounded-card border border-brand-border bg-white p-4">
              <label className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-600">
                <Navigation size={14} className="text-brand-primary" />
                Simuler la progression : {trip.fromCity} {Math.round(progress * 100)}% {trip.toCity}
              </label>
              <input
                type="range" min={0} max={100} value={Math.round(progress * 100)}
                onChange={(e) => setProgress(Number(e.target.value) / 100)}
                className="w-full accent-brand-primary"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-brand-navy">Opportunités sur le trajet</h2>
          {suggestions.length === 0 && <p className="text-sm text-gray-500">Aucune demande à proximité pour l’instant.</p>}
          {suggestions.map((s) => <SuggestionRow key={s.job.id} s={s} />)}
        </div>
      </div>
    </div>
  );
}
