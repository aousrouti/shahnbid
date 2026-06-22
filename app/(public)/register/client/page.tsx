'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerClientSchema, type RegisterClientInput } from '@/lib/validations';
import { COUNTRIES, DEFAULT_COUNTRY, CLIENT_TYPE_LABELS } from '@/lib/constants';
import { Building2, User } from 'lucide-react';

export default function RegisterClientPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterClientInput>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: { clientType: 'BUSINESS', country: DEFAULT_COUNTRY, acceptTerms: false },
  });

  const clientType = watch('clientType');
  const isBusiness = clientType === 'BUSINESS';

  async function onSubmit(data: RegisterClientInput) {
    setServerError('');
    const res = await fetch('/api/auth/register/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      router.replace(json.redirect || '/client/dashboard');
      router.refresh();
    } else {
      setServerError(json.error || 'Inscription impossible.');
    }
  }

  const field = 'w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';

  const typeOptions: { value: RegisterClientInput['clientType']; icon: typeof User }[] = [
    { value: 'INDIVIDUAL', icon: User },
    { value: 'BUSINESS', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-brand-border rounded-card p-8 space-y-6">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-brand-primary">ShahnBid</Link>
          <h1 className="text-xl font-bold text-brand-navy mt-2">Créer un compte chargeur</h1>
        </div>

        {/* Account type toggle — Particulier (B2C) / Entreprise (B2B) */}
        <div className="grid grid-cols-2 gap-3">
          {typeOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('clientType', value, { shouldValidate: true })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-input border text-sm font-semibold transition-colors ${
                clientType === value
                  ? 'border-brand-primary bg-brand-light text-brand-primary'
                  : 'border-gray-300 text-gray-500 hover:border-brand-primary'
              }`}
            >
              <Icon size={16} /> {CLIENT_TYPE_LABELS[value]}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('clientType')} />

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
              <input type="email" {...register('email')} placeholder={isBusiness ? 'vous@societe.ma' : 'vous@email.com'} className={field} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" {...register('password')} placeholder="Minimum 8 caractères" className={field} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            {/* Business-only fields (B2B) */}
            {isBusiness && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale</label>
                  <input {...register('companyName')} placeholder="Imex Maroc SARL" className={field} />
                  {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ICE</label>
                  <input {...register('ice')} placeholder="15 chiffres" inputMode="numeric" className={field} />
                  {errors.ice && <p className="text-xs text-red-600 mt-1">{errors.ice.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input {...register('address')} placeholder="Rue, quartier, zone industrielle…" className={field} />
                  {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <select {...register('country')} className={field}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input {...register('city')} placeholder="Votre ville" className={field} />
              {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" {...register('acceptTerms')} className="mt-0.5" />
              <span>J'accepte les <Link href="/cgu#chargeur" target="_blank" className="text-brand-primary font-medium hover:underline">Conditions Générales d'Utilisation</Link>.</span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-red-600 mt-1">{errors.acceptTerms.message}</p>}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50">
            {isSubmitting ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Déjà inscrit ? <Link href="/login" className="text-brand-primary font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
