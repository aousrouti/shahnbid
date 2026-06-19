'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOB_STATUS_LABELS } from '@/lib/constants';
import type { JobStatus } from '@/lib/types';
import { Truck, CheckCircle2, PackageCheck } from 'lucide-react';

// Carrier advances pickup → transit → delivered; the client confirms completion.
const CARRIER_STEP: Partial<Record<JobStatus, { target: JobStatus; label: string }>> = {
  ACCEPTED:   { target: 'PICKED_UP',  label: 'Marquer comme collecté' },
  PICKED_UP:  { target: 'IN_TRANSIT', label: 'Marquer en transit' },
  IN_TRANSIT: { target: 'DELIVERED',  label: 'Marquer comme livré' },
};

const TRACK: JobStatus[] = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];

interface Props {
  jobId: string;
  status: JobStatus;
  actor: 'carrier' | 'client';
}

export default function JobStatusActions({ jobId, status, actor }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show this card for jobs that are in the active lifecycle.
  if (!TRACK.includes(status)) return null;

  const carrierStep = actor === 'carrier' ? CARRIER_STEP[status] : undefined;
  const clientStep = actor === 'client' && status === 'DELIVERED'
    ? { target: 'COMPLETED' as JobStatus, label: 'Confirmer la réception (terminer)' }
    : undefined;
  const step = carrierStep ?? clientStep;

  async function advance(target: JobStatus) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: target }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Action impossible. Réessayez.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const currentIdx = TRACK.indexOf(status);

  return (
    <div className="bg-white border border-brand-border rounded-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Truck size={16} className="text-brand-primary" />
        <h2 className="text-lg font-bold text-brand-navy">Suivi de l&apos;expédition</h2>
      </div>

      {/* Progress track */}
      <div className="flex items-center gap-1">
        {TRACK.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full ${i <= currentIdx ? 'bg-brand-primary' : 'bg-gray-200'}`} />
            <span className={`text-[10px] leading-tight text-center ${i <= currentIdx ? 'text-brand-navy font-medium' : 'text-gray-400'}`}>
              {JOB_STATUS_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-input px-4 py-2.5 text-sm">{error}</div>
      )}

      {status === 'COMPLETED' ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} /> Expédition terminée et réglée.
        </div>
      ) : step ? (
        <button
          onClick={() => advance(step.target)}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50"
        >
          <PackageCheck size={16} /> {busy ? '…' : step.label}
        </button>
      ) : (
        <p className="text-sm text-gray-500">
          {actor === 'client' && status !== 'DELIVERED'
            ? 'Le transporteur met à jour le statut au fil de la livraison.'
            : 'En attente de la confirmation de réception par le client.'}
        </p>
      )}
    </div>
  );
}
