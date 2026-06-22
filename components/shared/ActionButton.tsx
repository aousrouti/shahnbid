'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ActionButtonProps {
  url: string;
  body: Record<string, unknown>;
  label: string;
  confirm?: string;            // optional confirmation prompt
  variant?: 'primary' | 'danger' | 'subtle';
  method?: 'PATCH' | 'POST' | 'DELETE';
}

const STYLES: Record<string, string> = {
  primary: 'bg-brand-primary text-white hover:bg-brand-mid',
  danger: 'border border-red-200 text-red-700 bg-red-50 hover:bg-red-100',
  subtle: 'border border-gray-300 text-gray-600 hover:bg-gray-50',
};

export default function ActionButton({ url, body, label, confirm, variant = 'subtle', method = 'PATCH' }: ActionButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Action impossible.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        onClick={go}
        disabled={busy}
        className={`px-3 py-1.5 text-xs font-semibold rounded-input transition-colors disabled:opacity-50 ${STYLES[variant]}`}
      >
        {busy ? '…' : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
