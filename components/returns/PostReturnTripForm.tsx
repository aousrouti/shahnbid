'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postReturnTripSchema, type PostReturnTripInput } from '@/lib/validations';
import { MOROCCAN_CITIES, VEHICLE_TYPES } from '@/lib/constants';

export default function PostReturnTripForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostReturnTripInput>({
    resolver: zodResolver(postReturnTripSchema),
  });

  async function onSubmit(data: PostReturnTripInput) {
    setServerError(null);
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setServerError(d.error ?? 'Échec de la publication. Réessayez.');
      return;
    }
    router.push('/carrier/returns');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-brand-border rounded-card p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville de départ</label>
          <select {...register('originCity')} className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
            <option value="">Sélectionner</option>
            {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.originCity && <p className="text-xs text-red-600 mt-1">{errors.originCity.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville de destination</label>
          <select {...register('destCity')} className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
            <option value="">Sélectionner</option>
            {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.destCity && <p className="text-xs text-red-600 mt-1">{errors.destCity.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de disponibilité</label>
          <input type="date" {...register('availableDate')} className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          {errors.availableDate && <p className="text-xs text-red-600 mt-1">{errors.availableDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (kg)</label>
          <input type="number" {...register('capacityKg', { valueAsNumber: true })} placeholder="Ex : 5000" className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          {errors.capacityKg && <p className="text-xs text-red-600 mt-1">{errors.capacityKg.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de véhicule</label>
          <select {...register('vehicleType')} className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
            <option value="">Sélectionner</option>
            {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          {errors.vehicleType && <p className="text-xs text-red-600 mt-1">{errors.vehicleType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix affiché (MAD)</label>
          <input type="number" {...register('listedPriceMAD', { valueAsNumber: true })} placeholder="Ex : 4500" className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          {errors.listedPriceMAD && <p className="text-xs text-red-600 mt-1">{errors.listedPriceMAD.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
        <textarea {...register('notes')} rows={3} placeholder="Informations supplémentaires…" className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>

      {serverError && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-input px-4 py-3 text-sm">{serverError}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50">
        {isSubmitting ? 'Publication…' : 'Publier le retour disponible'}
      </button>
    </form>
  );
}
