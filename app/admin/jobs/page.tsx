import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/jobs/StatusBadge';
import { listJobs } from '@/lib/server/jobs-repo';
import { formatDate, formatWeight, formatMAD } from '@/lib/utils';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import { MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminJobsPage() {
  const jobs = await listJobs();
  return (
    <div className="space-y-6">
      <PageHeader title="Toutes les expéditions" subtitle={`${jobs.length} expéditions`} />

      <div className="bg-white border border-brand-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-bg border-b border-brand-border">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Trajet</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Type · Poids</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Enlèvement</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Prix</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Créée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-brand-bg transition-colors">
                <td className="px-5 py-3 font-medium text-brand-navy">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-brand-primary" />
                    {job.originCity} → {job.destCity}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{CARGO_TYPE_LABELS[job.cargoType]} · {formatWeight(job.weightKg)}</td>
                <td className="px-5 py-3 text-gray-600">{formatDate(job.pickupDateFrom)}</td>
                <td className="px-5 py-3 font-semibold text-brand-primary">
                  {job.agreedPriceMAD ? formatMAD(job.agreedPriceMAD) : '—'}
                </td>
                <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                <td className="px-5 py-3 text-gray-400">{formatDate(job.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
