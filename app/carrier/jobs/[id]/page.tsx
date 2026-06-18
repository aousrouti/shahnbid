import Link from 'next/link';
import StatusBadge from '@/components/jobs/StatusBadge';
import BidForm from '@/components/bids/BidForm';
import { mockJobDetails, mockJobs } from '@/lib/mock-data/jobs';
import { formatDate, formatWeight, formatMAD } from '@/lib/utils';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import { MapPin, Package, Calendar } from 'lucide-react';

export default function CarrierJobDetailPage({ params }: { params: { id: string } }) {
  const summary = mockJobs.find((j) => j.id === params.id) ?? mockJobs[0];
  const detail  = mockJobDetails[params.id] ?? mockJobDetails['job-001'];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/carrier/jobs" className="text-sm text-brand-primary hover:underline">← Retour aux appels d&apos;offres</Link>

      {/* Job detail card */}
      <div className="bg-white border border-brand-border rounded-card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="mb-2"><StatusBadge status={summary.status} /></div>
            <div className="flex items-center gap-2 text-xl font-bold text-brand-navy">
              <MapPin size={18} className="text-brand-primary" />
              {summary.originCity} → {summary.destCity}
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">{formatDate(summary.createdAt)}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1"><Package size={14} className="text-gray-400" />{CARGO_TYPE_LABELS[summary.cargoType]}</span>
          <span className="flex items-center gap-1"><Package size={14} className="text-gray-400" />{formatWeight(summary.weightKg)}</span>
          <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" />{formatDate(summary.pickupDateFrom)}</span>
          <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" />Livraison {formatDate(summary.deliveryDate)}</span>
        </div>

        {(detail.fragile || detail.hazmat) && (
          <div className="flex gap-2 mb-4">
            {detail.fragile && <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-badge font-medium">Fragile</span>}
            {detail.hazmat  && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-badge font-medium">Matières dangereuses</span>}
          </div>
        )}

        <div className="border-t border-brand-border pt-4 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Départ :</span> {detail.originAddress}</p>
          <p><span className="font-medium text-gray-700">Arrivée :</span> {detail.destAddress}</p>
          <p className="mt-1">{detail.description}</p>
          {detail.notes && <p className="text-gray-400 italic">Note : {detail.notes}</p>}
        </div>
      </div>

      {/* Bid form */}
      {summary.status === 'PUBLISHED' && <BidForm jobId={params.id} />}
    </div>
  );
}
