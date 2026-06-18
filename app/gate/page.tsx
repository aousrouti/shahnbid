'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, LoaderCircle } from 'lucide-react';

function GateForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(from);
        router.refresh();
      } else {
        setError('Mot de passe incorrect.');
        setLoading(false);
      }
    } catch {
      setError('Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="w-full rounded-input border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="flex w-full items-center justify-center gap-2 rounded-input bg-brand-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-mid disabled:opacity-60"
      >
        {loading && <LoaderCircle size={16} className="animate-spin" />}
        Accéder à la démo
      </button>
    </form>
  );
}

export default function GatePage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card border border-brand-border bg-white p-8">
        <div className="text-center">
          <span className="text-2xl font-bold text-brand-primary">ShahnBid</span>
          <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-primary">
            <Lock size={22} />
          </div>
          <h1 className="mt-3 text-lg font-bold text-brand-navy">Démo privée</h1>
          <p className="mt-1 text-sm text-gray-500">Entrez le mot de passe pour accéder à l’aperçu.</p>
        </div>
        <Suspense fallback={null}>
          <GateForm />
        </Suspense>
      </div>
    </div>
  );
}
