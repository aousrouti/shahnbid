'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, LoaderCircle } from 'lucide-react';

interface Carrier {
  id: string;
  fullName: string;
  email: string;
  companyName?: string;
  country?: string;
  city?: string;
  licenseNumber?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-500',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  SUSPENDED: 'Suspendu',
};

export default function AdminUsersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/carriers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCarriers(d.carriers ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: string, status: Carrier['status']) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/carriers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const { carrier } = await res.json();
        setCarriers((prev) => prev.map((c) => (c.id === id ? { ...c, status: carrier.status } : c)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const pending = carriers.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transporteurs"
        subtitle={`${carriers.length} dossiers · ${pending} en attente d’approbation`}
      />

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Entreprise</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Localisation</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Licence</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Inscrit</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {loading && (
              <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-400">Chargement…</td></tr>
            )}
            {!loading && carriers.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-6 text-center text-gray-500">Aucun transporteur.</td></tr>
            )}
            {carriers.map((carrier) => (
              <tr key={carrier.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 font-medium text-brand-navy">{carrier.companyName}</td>
                <td className="px-5 py-3 text-gray-600">
                  <div>{carrier.fullName}</div>
                  <div className="text-xs text-gray-400">{carrier.email}</div>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {carrier.city}{carrier.country ? `, ${carrier.country}` : ''}
                </td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{carrier.licenseNumber}</td>
                <td className="px-5 py-3 text-gray-400">{carrier.createdAt ? formatDate(carrier.createdAt) : '—'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium ${STATUS_STYLES[carrier.status ?? 'PENDING']}`}>
                    {STATUS_LABELS[carrier.status ?? 'PENDING']}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {busyId === carrier.id ? (
                    <LoaderCircle size={14} className="animate-spin text-gray-400" />
                  ) : carrier.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStatus(carrier.id, 'APPROVED')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-input hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle size={12} /> Approuver
                      </button>
                      <button
                        onClick={() => setStatus(carrier.id, 'REJECTED')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-input hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={12} /> Refuser
                      </button>
                    </div>
                  ) : carrier.status === 'APPROVED' ? (
                    <button
                      onClick={() => setStatus(carrier.id, 'SUSPENDED')}
                      className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
                    >
                      Suspendre
                    </button>
                  ) : (
                    <button
                      onClick={() => setStatus(carrier.id, 'APPROVED')}
                      className="text-xs text-brand-primary hover:underline"
                    >
                      Réactiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
