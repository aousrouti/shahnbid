'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitBidSchema, type SubmitBidInput } from '@/lib/validations';
import { VEHICLE_TYPES } from '@/lib/constants';

export default function BidForm({ jobId }: { jobId: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubmitBidInput>({
    resolver: zodResolver(submitBidSchema),
  });

  function onSubmit(data: SubmitBidInput) {
    console.log('Soumission offre pour', jobId, data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-brand-border rounded-card p-6 space-y-4">
      <h2 className="text-lg font-bold text-brand-navy">Soumettre une offre</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (MAD)</label>
          <input
            type="number"
            {...register('priceMAD', { valueAsNumber: true })}
            placeholder="Ex : 3500"
            className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.priceMAD && <p className="text-xs text-red-600 mt-1">{errors.priceMAD.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Délai (jours)</label>
          <input
            type="number"
            {...register('etaDays', { valueAsNumber: true })}
            placeholder="Ex : 2"
            className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          {errors.etaDays && <p className="text-xs text-red-600 mt-1">{errors.etaDays.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de véhicule</label>
          <select
            {...register('vehicleType')}
            className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
          className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50"
      >
        Soumettre l&apos;offre
      </button>
    </form>
  );
}
