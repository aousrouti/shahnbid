'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerCarrierSchema, type RegisterCarrierInput } from '@/lib/validations';
import { MOROCCAN_CITIES } from '@/lib/constants';

export default function RegisterCarrierPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterCarrierInput>({
    resolver: zodResolver(registerCarrierSchema),
  });

  async function onSubmit(data: RegisterCarrierInput) {
    setServerError('');
    const res = await fetch('/api/auth/register/carrier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      router.replace(json.redirect || '/carrier/dashboard');
      router.refresh();
    } else {
      setServerError(json.error || 'Inscription impossible.');
    }
  }

  const field = 'w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-brand-border rounded-card p-8 space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-brand-primary">ShahnBid</Link>
          <h1 className="text-xl font-bold text-brand-navy mt-2">Créer un compte transporteur</h1>
          <p className="text-sm text-gray-500 mt-1">Votre dossier sera examiné par notre équipe sous 24h.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input {...register('fullName')} placeholder="Hassan Ouali" className={field} />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input {...register('phone')} placeholder="+212 6 61 11 22 33" className={field} />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('email')} placeholder="vous@societe.ma" className={field} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" {...register('password')} className={field} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale</label>
              <input {...register('companyName')} placeholder="Atlas Transport Casablanca" className={field} />
              {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville principale</label>
              <select {...register('city')} className={field}>
                <option value="">Sélectionner</option>
                {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de licence</label>
              <input {...register('licenseNumber')} placeholder="TRP-2024-CAS-0042" className={field} />
              {errors.licenseNumber && <p className="text-xs text-red-600 mt-1">{errors.licenseNumber.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration de l&apos;assurance</label>
              <input type="date" {...register('insuranceExpiry')} className={field} />
              {errors.insuranceExpiry && <p className="text-xs text-red-600 mt-1">{errors.insuranceExpiry.message}</p>}
            </div>
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50">
            {isSubmitting ? 'Envoi…' : 'Soumettre mon dossier'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Déjà inscrit ? <Link href="/login" className="text-brand-primary font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
