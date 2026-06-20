import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/jobs/StatusBadge';
import BidForm from '@/components/bids/BidForm';
import JobStatusActions from '@/components/jobs/JobStatusActions';
import { getJobDetail } from '@/lib/server/jobs-repo';
import { getAcceptedCarrierId } from '@/lib/server/bids-repo';
import { formatDate, formatWeight } from '@/lib/utils';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import { MapPin, Package, Calendar } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function CarrierJobDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const job  = await getJobDetail(params.id);
  if (!job) notFound();

  const alreadyBid = !!user && job.bids.some((b) => b.carrier.id === user.id && b.status === 'PENDING');
  const isAssigned = !!user && (await getAcceptedCarrierId(params.id)) === user.id;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/carrier/jobs" className="text-sm text-brand-primary hover:underline">← Retour aux appels d&apos;offres</Link>

      {/* Job detail card */}
      <div className="bg-white border border-brand-border rounded-card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="mb-2"><StatusBadge status={job.status} /></div>
            <div className="flex items-center gap-2 text-xl font-bold text-brand-navy">
              <MapPin size={18} className="text-brand-primary" />
              {job.originCity} → {job.destCity}
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">{formatDate(job.createdAt)}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1"><Package size={14} className="text-gray-400" />{CARGO_TYPE_LABELS[job.cargoType]}</span>
          <span className="flex items-center gap-1"><Package size={14} className="text-gray-400" />{formatWeight(job.weightKg)}</span>
          <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" />{formatDate(job.pickupDateFrom)}</span>
          <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" />Livraison {formatDate(job.deliveryDate)}</span>
        </div>

        {(job.fragile || job.hazmat) && (
          <div className="flex gap-2 mb-4">
            {job.fragile && <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-badge font-medium">Fragile</span>}
            {job.hazmat  && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-badge font-medium">Matières dangereuses</span>}
          </div>
        )}

        <div className="border-t border-brand-border pt-4 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Départ :</span> {job.originAddress}</p>
          <p><span className="font-medium text-gray-700">Arrivée :</span> {job.destAddress}</p>
          <p className="mt-1">{job.description}</p>
          {job.notes && <p className="text-gray-400 italic">Note : {job.notes}</p>}
        </div>
      </div>

      {/* Cargo photos */}
      {job.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {job.photoUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="Marchandise" className="h-28 w-28 rounded-card object-cover border border-brand-border" />
          ))}
        </div>
      )}

      {/* Bid form — visible to all carriers, but locked until APPROVED */}
      {job.status === 'PUBLISHED' && (
        <BidForm jobId={params.id} carrierStatus={user?.status} alreadyBid={alreadyBid} />
      )}

      {/* Lifecycle controls — only the assigned carrier, once the job is in progress */}
      {isAssigned && job.status !== 'PUBLISHED' && (
        <JobStatusActions jobId={params.id} status={job.status} actor="carrier" />
      )}
    </div>
  );
}
