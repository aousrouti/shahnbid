'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, CheckCircle2, X, LoaderCircle } from 'lucide-react';

export interface ProfileData {
  role: 'CLIENT' | 'CARRIER' | 'ADMIN';
  email: string;
  fullName: string;
  phone?: string;
  clientType?: 'INDIVIDUAL' | 'BUSINESS';
  companyName?: string;
  ice?: string;
  address?: string;
  country?: string;
  city?: string;
  licenseNumber?: string;
  insuranceExpiry?: string;
}

type Field = { key: keyof ProfileData; label: string; type?: string };

export default function ProfileForm({ account }: { account: ProfileData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileData>(account);

  const isBusiness = account.clientType === 'BUSINESS';
  const isCarrier = account.role === 'CARRIER';

  // Editable fields by role; email is shown read-only.
  const fields: Field[] = [
    { key: 'fullName', label: 'Nom complet' },
    { key: 'phone', label: 'Téléphone' },
    ...(isBusiness ? [
      { key: 'companyName', label: 'Raison sociale' } as Field,
      { key: 'ice', label: 'ICE' } as Field,
      { key: 'address', label: 'Adresse' } as Field,
    ] : []),
    ...(isCarrier ? [
      { key: 'companyName', label: 'Raison sociale' } as Field,
      { key: 'licenseNumber', label: 'Numéro de licence' } as Field,
      { key: 'insuranceExpiry', label: 'Assurance exp.', type: 'date' } as Field,
    ] : []),
    { key: 'country', label: 'Pays' },
    { key: 'city', label: 'Ville' },
  ];

  function set(key: keyof ProfileData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, string> = {};
      for (const f of fields) {
        const v = form[f.key];
        if (typeof v === 'string') payload[f.key] = v;
      }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? 'Échec de la mise à jour.'); return; }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary';

  return (
    <div className="bg-white border border-brand-border rounded-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-brand-navy">Informations du compte</h2>
        {!editing && (
          <button onClick={() => { setForm(account); setEditing(true); }}
            className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline">
            <Pencil size={14} /> Modifier
          </button>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400">Email</p><p className="font-medium text-brand-navy">{account.email}</p></div>
          {fields.map((f) => (
            <div key={f.key}>
              <p className="text-gray-400">{f.label}</p>
              <p className="font-medium text-brand-navy">{(account[f.key] as string) || '—'}</p>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (non modifiable)</label>
              <input value={account.email} disabled className={`${inputCls} bg-gray-50 text-gray-400`} />
            </div>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type ?? 'text'}
                  value={(form[f.key] as string) ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-input px-3 py-2">{error}</div>}

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50">
              {saving ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Enregistrer
            </button>
            <button onClick={() => { setEditing(false); setError(null); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-input hover:bg-gray-50 transition-colors">
              <X size={15} /> Annuler
            </button>
          </div>
        </>
      )}
    </div>
  );
}
