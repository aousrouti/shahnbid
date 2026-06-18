'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';

interface LoginForm { email: string; password: string }

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>();

  function onSubmit(data: LoginForm) {
    console.log('Login (mock):', data);
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-brand-border rounded-card p-8 space-y-6">
        <div className="text-center">
          <span className="text-2xl font-bold text-brand-primary">ShahnBid</span>
          <h1 className="text-xl font-bold text-brand-navy mt-2">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">Accédez à votre espace personnel</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('email')} placeholder="vous@exemple.ma" className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" {...register('password')} placeholder="••••••••" className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors">
            Se connecter
          </button>
        </form>

        <div className="text-center space-y-2 text-sm text-gray-500">
          <p>Pas encore de compte ?</p>
          <div className="flex justify-center gap-4">
            <Link href="/register/client" className="text-brand-primary font-medium hover:underline">Chargeur</Link>
            <span>·</span>
            <Link href="/register/carrier" className="text-brand-primary font-medium hover:underline">Transporteur</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
