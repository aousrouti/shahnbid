'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { formatMAD } from '@/lib/utils';
import { COMMISSION_PAYER_LABELS } from '@/lib/constants';
import type { CommissionPayer } from '@/lib/types';
import { Percent, Coins, Receipt, ShieldCheck, Save, LoaderCircle, CheckCircle2, Info } from 'lucide-react';

interface FormState {
  commissionPct: string;   // shown as %  (e.g. "10")
  minCommissionMAD: string;
  vatPct: string;          // shown as %  (e.g. "20")
  minJobPriceMAD: string;
  commissionPayer: CommissionPayer;
}

const PREVIEW_PRICE = 5000; // example shipment used in the live preview

function num(v: string): number {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function AdminPricingPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [meta, setMeta] = useState<{ updatedBy: string; updatedAt: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/pricing', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        if (!s) return;
        setForm({
          commissionPct: String(+(s.commissionRate * 100).toFixed(2)),
          minCommissionMAD: String(s.minCommissionMAD),
          vatPct: String(+(s.vatRate * 100).toFixed(2)),
          minJobPriceMAD: String(s.minJobPriceMAD),
          commissionPayer: s.commissionPayer,
        });
        setMeta({ updatedBy: s.updatedBy, updatedAt: s.updatedAt });
      });
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate: num(form.commissionPct) / 100,
          minCommissionMAD: num(form.minCommissionMAD),
          vatRate: num(form.vatPct) / 100,
          minJobPriceMAD: num(form.minJobPriceMAD),
          commissionPayer: form.commissionPayer,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? 'Échec de l’enregistrement');
        return;
      }
      setMeta({ updatedBy: d.settings.updatedBy, updatedAt: d.settings.updatedAt });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  // Live preview math (mirrors lib/pricing/store.ts commissionBreakdown).
  const rate = form ? num(form.commissionPct) / 100 : 0;
  const vatRate = form ? num(form.vatPct) / 100 : 0;
  const floor = form ? num(form.minCommissionMAD) : 0;
  const commission = Math.round(Math.max(PREVIEW_PRICE * rate, floor));
  const vat = Math.round(commission * vatRate);
  const totalFee = commission + vat;
  const payer = form?.commissionPayer ?? 'CARRIER';
  const carrierNet = payer === 'CARRIER' ? PREVIEW_PRICE - totalFee : PREVIEW_PRICE;
  const clientTotal = payer === 'CLIENT' ? PREVIEW_PRICE + totalFee : PREVIEW_PRICE;

  const seeded = meta?.updatedAt === '1970-01-01T00:00:00.000Z';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarification"
        subtitle="Définissez la commission de la plateforme, la TVA et les prix planchers"
      />

      {!form ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm px-1">
          <LoaderCircle size={16} className="animate-spin" /> Chargement…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-brand-border rounded-card p-6 space-y-5">
              <h2 className="text-lg font-bold text-brand-navy">Règles de commission</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Taux de commission"
                  icon={Percent}
                  suffix="%"
                  value={form.commissionPct}
                  onChange={(v) => set('commissionPct', v)}
                  hint="Appliqué sur le prix convenu de chaque expédition terminée."
                />
                <Field
                  label="Commission minimale"
                  icon={Coins}
                  suffix="MAD"
                  value={form.minCommissionMAD}
                  onChange={(v) => set('minCommissionMAD', v)}
                  hint="Plancher : jamais moins que ce montant par expédition."
                />
                <Field
                  label="TVA sur la commission"
                  icon={Receipt}
                  suffix="%"
                  value={form.vatPct}
                  onChange={(v) => set('vatPct', v)}
                  hint="TVA marocaine appliquée sur les frais de service."
                />
                <Field
                  label="Prix minimum (offre / retour)"
                  icon={ShieldCheck}
                  suffix="MAD"
                  value={form.minJobPriceMAD}
                  onChange={(v) => set('minJobPriceMAD', v)}
                  hint="Montant minimum qu’un transporteur peut proposer."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qui paie la commission ?</label>
                <select
                  value={form.commissionPayer}
                  onChange={(e) => set('commissionPayer', e.target.value as CommissionPayer)}
                  className="w-full border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  {(Object.keys(COMMISSION_PAYER_LABELS) as CommissionPayer[]).map((p) => (
                    <option key={p} value={p}>{COMMISSION_PAYER_LABELS[p]}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-input px-3 py-2">{error}</div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold rounded-input hover:bg-brand-mid transition-colors disabled:opacity-50"
                >
                  {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  Enregistrer
                </button>
                {saved && (
                  <span className="inline-flex items-center gap-1 text-sm text-green-700">
                    <CheckCircle2 size={16} /> Enregistré
                  </span>
                )}
              </div>

              {meta && (
                <p className="text-xs text-gray-400 pt-1">
                  {seeded
                    ? 'Valeurs par défaut (jamais modifiées).'
                    : `Dernière modification par ${meta.updatedBy} le ${new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(meta.updatedAt))}.`}
                </p>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-4">
            <div className="bg-white border border-brand-border rounded-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Info size={15} className="text-brand-primary" />
                <h3 className="font-semibold text-brand-navy text-sm">Simulation</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Exemple pour une expédition à <span className="font-semibold">{formatMAD(PREVIEW_PRICE)}</span>.
              </p>

              <dl className="space-y-2.5 text-sm">
                <Row label="Prix convenu" value={formatMAD(PREVIEW_PRICE)} />
                <Row label={`Commission (${form.commissionPct || 0}%)`} value={formatMAD(commission)} accent />
                <Row label={`TVA (${form.vatPct || 0}%)`} value={formatMAD(vat)} />
                <div className="border-t border-brand-border my-1" />
                <Row label="Frais plateforme" value={formatMAD(totalFee)} bold />
                <div className="border-t border-brand-border my-1" />
                <Row label="Net transporteur" value={formatMAD(carrierNet)} />
                <Row label="Total client" value={formatMAD(clientTotal)} />
              </dl>

              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                {payer === 'CARRIER'
                  ? 'Les frais sont déduits du paiement au transporteur.'
                  : 'Les frais sont ajoutés au montant payé par le client.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, icon: Icon, suffix, value, onChange, hint,
}: {
  label: string;
  icon: typeof Percent;
  suffix: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-input pl-9 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{suffix}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1 leading-snug">{hint}</p>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`${bold ? 'font-bold text-brand-navy' : accent ? 'font-semibold text-brand-primary' : 'text-gray-700'}`}>{value}</dd>
    </div>
  );
}
