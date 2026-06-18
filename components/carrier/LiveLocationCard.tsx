'use client';

import { MapPin, Navigation, BellRing, LoaderCircle, ShieldAlert } from 'lucide-react';
import type { GeoStatus } from '@/lib/hooks/useGeolocation';
import { formatKm } from '@/lib/geo';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import type { JobSummary } from '@/lib/types';

export interface NearestJob {
  job: JobSummary;
  distanceKm: number;
}

interface Props {
  status: GeoStatus;
  accuracy?: number | null;
  nearest?: NearestJob | null;
  onEnable: () => void;
  onDisable: () => void;
  compact?: boolean;
}

export default function LiveLocationCard({ status, accuracy, nearest, onEnable, onDisable, compact }: Props) {
  // Active: location shared — show the nearest-job alert.
  if (status === 'granted') {
    return (
      <div className="rounded-card border border-status-success/40 bg-status-success/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-status-success">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-status-success" />
            </span>
            Position en direct activée
          </div>
          <button onClick={onDisable} className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
            Désactiver
          </button>
        </div>

        {nearest ? (
          <div className="mt-3 flex items-start gap-2">
            <BellRing size={16} className="mt-0.5 shrink-0 text-status-success" />
            <div className="text-sm">
              <span className="text-gray-500">Offre la plus proche : </span>
              <span className="font-semibold text-brand-navy">{nearest.job.originCity} → {nearest.job.destCity}</span>
              <span className="text-gray-500"> · {CARGO_TYPE_LABELS[nearest.job.cargoType]} · à {formatKm(nearest.distanceKm)} de vous</span>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Aucune offre à proximité pour le moment — nous vous alerterons.</p>
        )}

        {accuracy != null && (
          <p className="mt-2 text-[11px] text-gray-400">Précision ≈ {formatKm(accuracy / 1000)}</p>
        )}
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="rounded-card border border-brand-border bg-white p-4 text-sm text-gray-500 flex items-center gap-2">
        <ShieldAlert size={16} className="text-gray-400" />
        La géolocalisation n’est pas disponible sur cet appareil.
      </div>
    );
  }

  // idle / prompting / denied / error — invitation to opt in.
  const denied = status === 'denied';
  const error = status === 'error';
  const prompting = status === 'prompting';

  return (
    <div className="rounded-card border border-brand-border bg-brand-light/60 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-input bg-brand-primary/10 p-2 text-brand-primary">
          <Navigation size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-brand-navy">
            {denied ? 'Position désactivée' : 'Soyez alerté des offres les plus proches'}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {denied
              ? 'Vous avez refusé l’accès. Réactivez la localisation dans votre navigateur pour recevoir les alertes.'
              : error
                ? 'Impossible d’obtenir votre position. Réessayez.'
                : 'Partagez votre position en direct pour voir et être notifié des expéditions près de votre trajet.'}
          </p>

          <button
            onClick={onEnable}
            disabled={prompting}
            className="mt-3 inline-flex items-center gap-2 rounded-input bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-mid disabled:opacity-60"
          >
            {prompting ? <LoaderCircle size={16} className="animate-spin" /> : <MapPin size={16} />}
            {prompting ? 'Autorisation en attente…' : denied || error ? 'Réessayer' : 'Partager ma position'}
          </button>

          {!compact && !denied && (
            <p className="mt-2 text-[11px] text-gray-400">
              Votre position n’est utilisée que pour vous proposer des offres pertinentes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
