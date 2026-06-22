'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace(from || data.redirect || '/');
        router.refresh();
      } else {
        setError(data.error || 'Connexion impossible.');
        setLoading(false);
      }
    } catch {
      setError('Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.ma"
          className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit" disabled={loading || !email || !password}
        className="flex w-full items-center justify-center gap-2 py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-60"
      >
        {loading && <LoaderCircle size={16} className="animate-spin" />}
        Se connecter
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-brand-border rounded-card p-8 space-y-6">
        <div className="text-center">
          <span className="text-2xl font-bold text-brand-primary">ShahnBid</span>
          <h1 className="text-xl font-bold text-brand-navy mt-2">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">Accédez à votre espace personnel</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <div className="text-center space-y-2 text-sm text-gray-500">
          <p>Pas encore de compte ?</p>
          <div className="flex justify-center gap-4">
            <Link href="/register/client" className="text-brand-primary font-medium hover:underline">Chargeur</Link>
            <span>·</span>
            <Link href="/register/carrier" className="text-brand-primary font-medium hover:underline">Transporteur</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pt-2 border-t border-brand-border">
          <Link href="/cgu" className="hover:text-brand-primary hover:underline">Conditions Générales d'Utilisation</Link>
        </p>
      </div>
    </div>
  );
}
