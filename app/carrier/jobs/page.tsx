'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import JobCard from '@/components/jobs/JobCard';
import EmptyState from '@/components/shared/EmptyState';
import { MOROCCAN_CITIES } from '@/lib/constants';
import type { JobSummary } from '@/lib/types';
import { Search } from 'lucide-react';

export default function CarrierJobBoardPage() {
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter]     = useState('');
  const [jobs, setJobs]                 = useState<JobSummary[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch('/api/jobs?status=PUBLISHED', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    if (originFilter && j.originCity !== originFilter) return false;
    if (destFilter   && j.destCity   !== destFilter)   return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appels d'offres"
        subtitle={`${filtered.length} expédition${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
      />

      <div className="flex flex-wrap gap-3">
        <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)}
          className="border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="">Toutes les origines</option>
          {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={destFilter} onChange={(e) => setDestFilter(e.target.value)}
          className="border border-gray-300 rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option value="">Toutes les destinations</option>
          {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(originFilter || destFilter) && (
          <button onClick={() => { setOriginFilter(''); setDestFilter(''); }} className="text-sm text-gray-500 hover:text-brand-primary underline">
            Réinitialiser
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 px-1">Chargement…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={48} />} title="Aucune expédition trouvée" body="Modifiez les filtres pour voir d'autres résultats." />
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} variant="carrier" href={`/carrier/jobs/${job.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
