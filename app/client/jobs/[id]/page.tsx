'use client';

import { notFound } from 'next/navigation';
import StatusBadge from '@/components/jobs/StatusBadge';
import BidCard from '@/components/bids/BidCard';
import EmptyState from '@/components/shared/EmptyState';
import { mockJobDetails } from '@/lib/mock-data/jobs';
import { mockBids } from '@/lib/mock-data/bids';
import { formatDate, formatWeight, formatMAD } from '@/lib/utils';
import { CARGO_TYPE_LABELS } from '@/lib/constants';
import { MapPin, Package, Calendar, Phone, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function ClientJobDetailPage({ params }: { params: { id: string } }) {
  const job = mockJobDetails[params.id] ?? {
    ...Object.values(mockJobDetails)[0],
    id: params.id,
  };

  if (!job) notFound();

  const bids = params.id === 'job-001' ? mockBids : [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link href="/client/jobs" className="text-sm text-brand-primary hover:underline">← Retour aux expéditions</Link>

      {/* Header card */}
      <div className="bg-white border border-brand-border rounded-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={job.status} />
              {job.source === 'RETURN_TRIP' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium bg-teal-50 text-teal-700">Retour disponible</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-brand-navy">
              <MapPin size={18} className="text-brand-primary" />
              {job.originCity} → {job.destCity}
            </div>
          </div>
          {job.agreedPriceMAD && (
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-primary">{formatMAD(job.agreedPriceMAD)}</div>
              <div className="text-xs text-gray-400">Prix convenu</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5"><Package size={14} className="text-gray-400" />{CARGO_TYPE_LABELS[job.cargoType]}</div>
          <div className="flex items-center gap-1.5"><Package size={14} className="text-gray-400" />{formatWeight(job.weightKg)}</div>
          <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" />{formatDate(job.pickupDateFrom)}</div>
          <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" />Livraison {formatDate(job.deliveryDate)}</div>
        </div>

        {(job.fragile || job.hazmat) && (
          <div className="flex gap-2 mt-3">
            {job.fragile && <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-badge font-medium">Fragile</span>}
            {job.hazmat && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-badge font-medium">Matières dangereuses</span>}
          </div>
        )}

        <div className="mt-4 border-t border-brand-border pt-4 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Départ :</span> {job.originAddress}</p>
          <p><span className="font-medium text-gray-700">Arrivée :</span> {job.destAddress}</p>
          <p className="mt-1">{job.description}</p>
          {job.notes && <p className="text-gray-400 italic">Note : {job.notes}</p>}
        </div>

        <div className="mt-4 border-t border-brand-border pt-4 flex items-center gap-4 text-sm text-gray-600">
          <Building2 size={14} className="text-gray-400" />
          <span className="font-medium">{job.client.companyName}</span>
          <Phone size={14} className="text-gray-400" />
          <span>{job.client.phone}</span>
        </div>
      </div>

      {/* Bids */}
      <div>
        <h2 className="font-semibold text-brand-navy mb-4">
          Offres reçues ({bids.length})
        </h2>
        {bids.length === 0 ? (
          <EmptyState title="Aucune offre pour le moment" body="Les transporteurs approuvés peuvent soumettre des offres sur cette expédition." />
        ) : (
          <div className="space-y-3">
            {bids.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                isAccepted={bid.id === job.acceptedBidId}
                onAccept={(bidId) => console.log('Accepter offre (mock):', bidId)}
                canAccept={job.status === 'PUBLISHED'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
