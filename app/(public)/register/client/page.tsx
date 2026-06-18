'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerClientSchema, type RegisterClientInput } from '@/lib/validations';
import { MOROCCAN_CITIES } from '@/lib/constants';

export default function RegisterClientPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterClientInput>({
    resolver: zodResolver(registerClientSchema),
  });

  function onSubmit(data: RegisterClientInput) {
    console.log('Inscription client (mock):', data);
  }

  const field = 'w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-brand-border rounded-card p-8 space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-brand-primary">ShahnBid</Link>
          <h1 className="text-xl font-bold text-brand-navy mt-2">Créer un compte chargeur</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input {...register('fullName')} placeholder="Karim Benali" className={field} />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input {...register('phone')} placeholder="+212 6 12 34 56 78" className={field} />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('email')} placeholder="vous@societe.ma" className={field} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" {...register('password')} placeholder="Minimum 8 caractères" className={field} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale</label>
              <input {...register('companyName')} placeholder="Imex Maroc SARL" className={field} />
              {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input {...register('address')} placeholder="Rue, quartier, zone industrielle…" className={field} />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select {...register('city')} className={field}>
                <option value="">Sélectionner</option>
                {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50">
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Déjà inscrit ? <Link href="/login" className="text-brand-primary font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
