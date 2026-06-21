'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Send, CheckCircle2, XCircle, LoaderCircle } from 'lucide-react';

export default function WhatsAppTester({ defaultTo = '' }: { defaultTo?: string }) {
  const [to, setTo] = useState(defaultTo);
  const [provider, setProvider] = useState<string>('…');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/test-whatsapp', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setProvider(d.provider ?? '?'))
      .catch(() => setProvider('?'));
  }, []);

  async function send() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      });
      const d = await res.json();
      setResult(
        res.ok
          ? { ok: true, msg: `Envoyé via « ${d.provider} »${d.provider === 'console' ? ' (voir le terminal)' : '. Vérifiez WhatsApp.'}` }
          : { ok: false, msg: d.error ?? 'Échec de l’envoi.' },
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-brand-border rounded-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle size={16} className="text-green-600" />
        <h3 className="font-semibold text-brand-navy text-sm">Tester WhatsApp</h3>
        <span className="ml-auto text-xs text-gray-400">fournisseur : <span className="font-medium text-gray-600">{provider}</span></span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Numéro au format international (+212…). En mode console, le message s’affiche dans le terminal.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="tel" value={to} onChange={(e) => setTo(e.target.value)} placeholder="+212600000000"
          className="flex-1 border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button
          onClick={send} disabled={busy || to.replace(/[^\d]/g, '').length < 8}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-input hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />} Envoyer un test
        </button>
      </div>
      {result && (
        <div className={`mt-3 flex items-start gap-2 text-sm rounded-input px-3 py-2 ${result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <XCircle size={15} className="mt-0.5 shrink-0" />}
          <span className="break-all">{result.msg}</span>
        </div>
      )}
    </div>
  );
}
