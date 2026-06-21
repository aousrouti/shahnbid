'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, MessageCircle, CheckCircle2, LoaderCircle } from 'lucide-react';

interface Prefs { notifyInApp: boolean; notifyEmail: boolean; notifyWhatsapp: boolean; phone: string }

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 ${checked ? 'bg-brand-primary' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile/preferences', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setPrefs(d))
      .catch(() => {});
  }, []);

  function set<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setPrefs((p) => (p ? { ...p, [k]: v } : p));
    setSaved(false);
  }

  async function save() {
    if (!prefs) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!prefs) {
    return (
      <div className="bg-white border border-brand-border rounded-card p-6 text-sm text-gray-400 flex items-center gap-2">
        <LoaderCircle size={16} className="animate-spin" /> Chargement…
      </div>
    );
  }

  const rows = [
    { key: 'notifyInApp' as const, icon: Bell, label: 'Dans l’application', desc: 'Cloche + tableau de bord' },
    { key: 'notifyEmail' as const, icon: Mail, label: 'Email', desc: 'Envoyé à votre adresse email' },
    {
      key: 'notifyWhatsapp' as const, icon: MessageCircle, label: 'WhatsApp',
      desc: prefs.phone ? `Envoyé au ${prefs.phone}` : 'Ajoutez un numéro de téléphone pour activer',
    },
  ];

  return (
    <div className="bg-white border border-brand-border rounded-card p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-brand-navy">Préférences de notification</h2>
        <p className="text-sm text-gray-500 mt-0.5">Choisissez comment vous souhaitez être averti des événements.</p>
      </div>

      <div className="divide-y divide-brand-border">
        {rows.map(({ key, icon: Icon, label, desc }) => {
          const waNoPhone = key === 'notifyWhatsapp' && !prefs.phone;
          return (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 p-1.5 rounded-full bg-brand-light text-brand-primary"><Icon size={15} /></span>
                <div>
                  <p className="text-sm font-medium text-brand-navy">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <Toggle checked={prefs[key]} disabled={waNoPhone} onChange={(v) => set(key, v)} />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        WhatsApp est désactivé par défaut. En l’activant, vous consentez à recevoir des messages WhatsApp de ShahnBid.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50"
        >
          {saving ? <LoaderCircle size={15} className="animate-spin" /> : null} Enregistrer
        </button>
        {saved && <span className="inline-flex items-center gap-1 text-sm text-green-700"><CheckCircle2 size={15} /> Enregistré</span>}
      </div>
    </div>
  );
}
