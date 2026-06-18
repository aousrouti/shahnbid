'use client';

import { useState } from 'react';
import { Bell, BellOff, BellRing, LoaderCircle, ShieldAlert } from 'lucide-react';
import { usePush, type PushPayload } from '@/lib/hooks/usePush';

export default function PushControls({ testPayload }: { testPayload?: PushPayload }) {
  const { status, subscribe, unsubscribe, sendTest } = usePush();
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (status === 'unsupported') {
    return (
      <div className="flex items-center gap-2 rounded-card border border-brand-border bg-white p-3 text-xs text-gray-500">
        <ShieldAlert size={14} className="text-gray-400" />
        Les notifications push ne sont pas prises en charge par ce navigateur.
      </div>
    );
  }

  async function handleTest() {
    setTestState('sending');
    await sendTest(testPayload);
    setTestState('sent');
    setTimeout(() => setTestState('idle'), 2500);
  }

  if (status === 'subscribed') {
    return (
      <div className="rounded-card border border-brand-border bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-brand-navy">
            <BellRing size={16} className="text-status-success" />
            Notifications push activées
          </span>
          <button onClick={unsubscribe} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 hover:underline">
            <BellOff size={13} /> Désactiver
          </button>
        </div>
        <button
          onClick={handleTest}
          disabled={testState === 'sending'}
          className="mt-2 inline-flex items-center gap-2 rounded-input border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-light disabled:opacity-60"
        >
          {testState === 'sending' && <LoaderCircle size={13} className="animate-spin" />}
          {testState === 'sent' ? 'Alerte envoyée ✓' : 'Envoyer une alerte test'}
        </button>
      </div>
    );
  }

  const denied = status === 'denied';
  const error = status === 'error';
  const subscribing = status === 'subscribing';

  return (
    <div className="flex flex-col gap-2 rounded-card border border-brand-border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-gray-600">
        {denied
          ? 'Notifications refusées — réactivez-les dans votre navigateur.'
          : error
            ? 'Échec de l’activation des notifications. Réessayez.'
            : 'Recevez une alerte même lorsque l’application est fermée.'}
      </span>
      <button
        onClick={subscribe}
        disabled={subscribing}
        className="inline-flex shrink-0 items-center gap-2 rounded-input bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-mid disabled:opacity-60"
      >
        {subscribing ? <LoaderCircle size={13} className="animate-spin" /> : <Bell size={13} />}
        {subscribing ? 'Activation…' : denied || error ? 'Réessayer' : 'Activer les notifications push'}
      </button>
    </div>
  );
}
