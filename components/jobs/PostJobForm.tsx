'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postJobSchema, type PostJobInput } from '@/lib/validations';
import { MOROCCAN_CITIES, CARGO_TYPE_LABELS } from '@/lib/constants';

const cargoTypes = Object.entries(CARGO_TYPE_LABELS) as [string, string][];

export default function PostJobForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostJobInput>({
    resolver: zodResolver(postJobSchema),
    defaultValues: { fragile: false, hazmat: false },
  });

  function onSubmit(data: PostJobInput) {
    console.log('Nouvelle expédition:', data);
  }

  const fieldClass = 'w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-xs text-red-600 mt-1';
  const sectionClass = 'bg-white border border-brand-border rounded-card p-6 space-y-4';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1 — Cargo */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-brand-navy">1. Informations sur la marchandise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type de marchandise</label>
            <select {...register('cargoType')} className={fieldClass}>
              <option value="">Sélectionner</option>
              {cargoTypes.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
            {errors.cargoType && <p className={errorClass}>{errors.cargoType.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Poids (kg)</label>
            <input type="number" {...register('weightKg', { valueAsNumber: true })} placeholder="Ex : 5000" className={fieldClass} />
            {errors.weightKg && <p className={errorClass}>{errors.weightKg.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelClass}>Description de la marchandise</label>
          <textarea {...register('description')} rows={3} placeholder="Décrivez la marchandise en détail…" className={fieldClass} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...register('fragile')} className="rounded" />
            Fragile
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" {...register('hazmat')} className="rounded" />
            Matières dangereuses
          </label>
        </div>
      </div>

      {/* Section 2 — Origin */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-brand-navy">2. Lieu d&apos;enlèvement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ville de départ</label>
            <select {...register('originCity')} className={fieldClass}>
              <option value="">Sélectionner</option>
              {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.originCity && <p className={errorClass}>{errors.originCity.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Adresse complète</label>
            <input {...register('originAddress')} placeholder="Rue, quartier, zone industrielle…" className={fieldClass} />
            {errors.originAddress && <p className={errorClass}>{errors.originAddress.message}</p>}
          </div>
        </div>
      </div>

      {/* Section 3 — Destination */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-brand-navy">3. Lieu de livraison</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ville de destination</label>
            <select {...register('destCity')} className={fieldClass}>
              <option value="">Sélectionner</option>
              {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.destCity && <p className={errorClass}>{errors.destCity.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Adresse complète</label>
            <input {...register('destAddress')} placeholder="Rue, quartier, zone industrielle…" className={fieldClass} />
            {errors.destAddress && <p className={errorClass}>{errors.destAddress.message}</p>}
          </div>
        </div>
      </div>

      {/* Section 4 — Dates */}
      <div className={sectionClass}>
        <h2 className="font-semibold text-brand-navy">4. Dates et notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Enlèvement à partir du</label>
            <input type="date" {...register('pickupDateFrom')} className={fieldClass} />
            {errors.pickupDateFrom && <p className={errorClass}>{errors.pickupDateFrom.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Enlèvement au plus tard le</label>
            <input type="date" {...register('pickupDateTo')} className={fieldClass} />
            {errors.pickupDateTo && <p className={errorClass}>{errors.pickupDateTo.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Livraison souhaitée</label>
            <input type="date" {...register('deliveryDate')} className={fieldClass} />
            {errors.deliveryDate && <p className={errorClass}>{errors.deliveryDate.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes (optionnel)</label>
          <textarea {...register('notes')} rows={3} placeholder="Instructions spéciales, horaires d'accès…" className={fieldClass} />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-brand-primary text-white font-bold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50 text-base">
        Publier l&apos;expédition
      </button>
    </form>
  );
}
