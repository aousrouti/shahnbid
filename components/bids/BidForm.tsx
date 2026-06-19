'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitBidSchema, type SubmitBidInput } from '@/lib/validations';
import { VEHICLE_TYPES } from '@/lib/constants';
import type { CarrierStatus } from '@/lib/types';
import { Clock, XCircle, PauseCircle, Lock, CheckCircle2 } from 'lucide-react';

const BLOCK_CONFIG: Record<Exclude<CarrierStatus, 'APPROVED'>, { icon: typeof Clock; cls: string; message: string }> = {
  PENDING: {
    icon: Clock,
    cls: 'bg-amber-50 border-amber-200 text-amber-800',
    message: "Votre compte est en attente d'approbation. Vous pourrez soumettre des offres dès qu'un administrateur l'aura validé (sous 24h).",
  },
  REJECTED: {
    icon: XCircle,
    cls: 'bg-red-50 border-red-200 text-red-800',
    message: "Votre dossier a été refusé. Contactez le support à support@shahnbid.ma pour plus d'informations.",
  },
  SUSPENDED: {
    icon: PauseCircle,
    cls: 'bg-gray-100 border-gray-300 text-gray-700',
    message: 'Votre compte est suspendu. Contactez le support pour rétablir votre accès.',
  },
};

interface BidFormProps {
  jobId: string;
  carrierStatus?: CarrierStatus;
  alreadyBid?: boolean;
}

export default function BidForm({ jobId, carrierStatus, alreadyBid }: BidFormProps) {
  const router = useRouter();
  const isBlocked = !!carrierStatus && carrierStatus !== 'APPROVED';
  const blockConfig = isBlocked ? BLOCK_CONFIG[carrierStatus as Exclude<CarrierStatus, 'APPROVED'>] : null;

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubmitBidInput>({
    resolver: zodResolver(submitBidSchema),
  });

  async function onSubmit(data: SubmitBidInput) {
    if (isBlocked) return;
    setServerError(null);
    const res = await fetch(`/api/jobs/${jobId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setServerError(d.error ?? 'Échec de la soumission. Réessayez.');
      return;
    }
    setSubmitted(true);
    router.refresh();
  }

  // Already submitted (this session) or a pending bid exists → confirmation panel.
  if (submitted || alreadyBid) {
    return (
      <div className="bg-white border border-brand-border rounded-card p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Offre soumise</h2>
            <p className="text-sm text-gray-500 mt-1">
              Votre offre a bien été transmise au client. Vous serez notifié si elle est acceptée.
              Suivez son statut dans <span className="font-medium text-brand-navy">Mes offres</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-brand-border rounded-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-navy">Soumettre une offre</h2>
        {isBlocked && <Lock size={16} className="text-gray-400" />}
      </div>

      <fieldset disabled={isBlocked} className="space-y-4 disabled:opacity-60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
            <input
              type="number"
              {...register('priceMAD', { valueAsNumber: true })}
              placeholder="Ex : 3500"
              className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed"
            />
            {errors.priceMAD && <p className="text-xs text-red-600 mt-1">{errors.priceMAD.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Délai (jours)</label>
            <input
              type="number"
              {...register('etaDays', { valueAsNumber: true })}
              placeholder="Ex : 2"
              className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed"
            />
            {errors.etaDays && <p className="text-xs text-red-600 mt-1">{errors.etaDays.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de véhicule</label>
            <select
              {...register('vehicleType')}
              className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner</option>
              {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            {errors.vehicleType && <p className="text-xs text-red-600 mt-1">{errors.vehicleType.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Informations supplémentaires pour le client…"
            className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed"
          />
        </div>
      </fieldset>

      {blockConfig ? (
        <div className={`flex items-start gap-2 border rounded-input px-4 py-3 text-sm ${blockConfig.cls}`}>
          <blockConfig.icon size={16} className="mt-0.5 shrink-0" />
          <span>{blockConfig.message}</span>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="flex items-start gap-2 border border-red-200 bg-red-50 text-red-700 rounded-input px-4 py-3 text-sm">
              <XCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Envoi…' : "Soumettre l'offre"}
          </button>
        </>
      )}
    </form>
  );
}
